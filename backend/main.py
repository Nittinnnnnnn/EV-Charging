from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import json
import os
import subprocess
import asyncio
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

# ─── App Setup ────────────────────────────────────────────────────────────────
app = FastAPI(title="EV Charging Optimizer API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── MongoDB ──────────────────────────────────────────────────────────────────
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME   = "ev_charging_optimizer"

client = AsyncIOMotorClient(MONGO_URL)
db     = client[DB_NAME]

# ─── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR    = os.path.dirname(os.path.abspath(__file__))
ENGINE_DIR  = os.path.join(BASE_DIR, "..", "cpp_engine")
BUILD_DIR   = os.path.join(ENGINE_DIR, "build")
DATA_DIR    = os.path.join(ENGINE_DIR, "data")
INPUT_FILE  = os.path.join(DATA_DIR, "input.json")
OUTPUT_FILE = os.path.join(DATA_DIR, "output.json")
EXECUTABLE  = os.path.join(BUILD_DIR, "ev_optimizer.exe")

# ─── Pydantic Models ──────────────────────────────────────────────────────────
class NodeModel(BaseModel):
    id: int
    lat: float
    lng: float
    address: str = ""
    isDemand: bool = False
    weight: float = 0.0

class EdgeModel(BaseModel):
    from_node: int = Field(alias="from")
    to_node:   int = Field(alias="to")
    weight:    Optional[float] = None

    class Config:
        populate_by_name = True

class OptimizeRequest(BaseModel):
    nodes: List[NodeModel]
    edges: List[EdgeModel]
    k: int = Field(ge=1, description="Number of charging stations")

class AssignmentResult(BaseModel):
    demandNodeId: int
    stationNodeId: int
    distance: Optional[float] = 0.0
    demandLat: Optional[float] = None
    demandLng: Optional[float] = None
    stationLat: Optional[float] = None
    stationLng: Optional[float] = None

class StationResult(BaseModel):
    id: int
    lat: float
    lng: float
    address: str = ""

class OptimizeResponse(BaseModel):
    success: bool
    stations: List[StationResult]
    totalCost: Optional[float] = 0.0
    assignments: List[AssignmentResult]
    resultId: Optional[str] = None

# ─── Helper: serialize for MongoDB ────────────────────────────────────────────
def bson_serialize(doc: dict) -> dict:
    """Remove ObjectId for JSON response."""
    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

# ─── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {"message": "EV Charging Optimizer API is running 🔋"}


@app.post("/optimize", response_model=OptimizeResponse)
async def optimize(req: OptimizeRequest):
    """
    Main optimization endpoint:
    1. Validate input
    2. Save to MongoDB
    3. Write input.json
    4. Run C++ executable
    5. Read output.json
    6. Save result to MongoDB
    7. Return response
    """

    # ── Validate ──────────────────────────────────────────────────────────────
    if not req.nodes:
        raise HTTPException(status_code=400, detail="No nodes provided")
    if req.k > len(req.nodes):
        raise HTTPException(status_code=400, detail=f"k={req.k} exceeds node count={len(req.nodes)}")

    demand_nodes = [n for n in req.nodes if n.isDemand]
    if not demand_nodes:
        raise HTTPException(status_code=400, detail="At least one demand node is required")

    # ── Save input to MongoDB ─────────────────────────────────────────────────
    timestamp = datetime.utcnow()

    nodes_data = [n.dict() for n in req.nodes]
    edges_data = [{"from": e.from_node, "to": e.to_node, "weight": e.weight} for e in req.edges]

    await db.nodes.insert_many([{**n, "timestamp": timestamp} for n in nodes_data])
    if edges_data:
        await db.edges.insert_many([{**e, "timestamp": timestamp} for e in edges_data])
    await db.demands.insert_many([
        {**n, "timestamp": timestamp} for n in nodes_data if n["isDemand"]
    ])

    # ── Write input.json ──────────────────────────────────────────────────────
    os.makedirs(DATA_DIR, exist_ok=True)

    input_payload = {
        "k": req.k,
        "nodes": nodes_data,
        "edges": edges_data
    }
    with open(INPUT_FILE, "w") as f:
        json.dump(input_payload, f, indent=2)

    # ── Run C++ Engine ────────────────────────────────────────────────────────
    if not os.path.isfile(EXECUTABLE):
        raise HTTPException(
            status_code=500,
            detail=f"C++ executable not found at {EXECUTABLE}. Please compile first."
        )

    try:
        proc = subprocess.run(
            [EXECUTABLE, INPUT_FILE, OUTPUT_FILE],
            capture_output=True, text=True, timeout=60
        )
        if proc.returncode != 0:
            raise HTTPException(
                status_code=500,
                detail=f"C++ engine error: {proc.stderr}"
            )
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=500, detail="C++ engine timed out")
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail=f"Cannot execute: {EXECUTABLE}")

    # ── Read output.json ──────────────────────────────────────────────────────
    if not os.path.isfile(OUTPUT_FILE):
        raise HTTPException(status_code=500, detail="Output file not generated by C++ engine")

    with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
        output = json.load(f)

    stations    = output.get("stations", [])
    assignments = output.get("assignments", [])
    total_cost  = output.get("totalCost", 0.0)

    # ── Save result to MongoDB ────────────────────────────────────────────────
    result_doc = {
        "timestamp": timestamp,
        "k": req.k,
        "stations": stations,
        "totalCost": total_cost,
        "assignments": assignments,
    }
    inserted = await db.results.insert_one(result_doc)
    result_id = str(inserted.inserted_id)

    return OptimizeResponse(
        success=True,
        stations=[StationResult(**s) for s in stations],
        totalCost=total_cost,
        assignments=[AssignmentResult(**a) for a in assignments],
        resultId=result_id
    )


@app.get("/results")
async def get_results(limit: int = 10):
    """Return the most recent optimization results."""
    cursor = db.results.find().sort("timestamp", -1).limit(limit)
    results = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        results.append(doc)
    return {"results": results}


@app.get("/results/{result_id}")
async def get_result(result_id: str):
    """Return a specific optimization result by ID."""
    doc = await db.results.find_one({"_id": ObjectId(result_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Result not found")
    doc["_id"] = str(doc["_id"])
    return doc


@app.delete("/data")
async def clear_data():
    """Clear all data from MongoDB collections."""
    await db.nodes.delete_many({})
    await db.edges.delete_many({})
    await db.demands.delete_many({})
    await db.results.delete_many({})
    return {"message": "All data cleared"}


@app.get("/health")
async def health():
    try:
        await client.admin.command("ping")
        mongo_status = "connected"
    except Exception as e:
        mongo_status = f"error: {str(e)}"

    engine_exists = os.path.isfile(EXECUTABLE)

    return {
        "api": "ok",
        "mongodb": mongo_status,
        "cpp_engine": "compiled" if engine_exists else "not compiled",
        "engine_path": EXECUTABLE
    }
