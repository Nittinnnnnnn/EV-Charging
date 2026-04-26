# ⚡ EV Charging Station Optimizer

A full-stack application that uses graph algorithms and geospatial data to determine optimal EV charging station placement.

## 🏗️ Architecture

```
React (Leaflet Map UI)
    ↓ POST /optimize
FastAPI Backend
    ↓ writes input.json, calls subprocess
C++ Engine (Dijkstra + Greedy k-medoids)
    ↓ writes output.json
FastAPI reads result → saves to MongoDB
    ↓
React updates map with stations + assignments
```

## 📁 Project Structure

```
ev-charging-optimizer/
├── frontend/          # React + Vite + Leaflet
├── backend/           # FastAPI + MongoDB
├── cpp_engine/        # C++ graph optimizer
│   ├── src/
│   │   ├── main.cpp
│   │   ├── graph/         graph.h / graph.cpp
│   │   ├── algorithms/    dijkstra.h / dijkstra.cpp
│   │   ├── optimizer/     optimizer.h / optimizer.cpp
│   │   ├── utils/         json_parser.h / json_parser.cpp
│   │   └── models/        node.h / edge.h
│   ├── data/
│   │   ├── input.json
│   │   └── output.json
│   └── CMakeLists.txt
└── README.md
```

---

## ⚙️ Prerequisites

| Tool       | Version  | Install |
|------------|----------|---------|
| Node.js    | ≥ 18     | https://nodejs.org |
| Python     | ≥ 3.10   | https://python.org |
| CMake      | ≥ 3.14   | https://cmake.org |
| GCC/Clang  | ≥ C++17  | via system package manager |
| MongoDB    | ≥ 6.0    | https://mongodb.com |
| Git        | any      | https://git-scm.com |

---

## 🚀 Setup Instructions

### 1. Clone / Enter Project

```bash
cd ev-charging-optimizer
```

---

### 2. Compile C++ Engine

```bash
cd cpp_engine
mkdir -p build && cd build

# Configure (downloads nlohmann/json automatically via FetchContent)
cmake .. -DCMAKE_BUILD_TYPE=Release

# Build
cmake --build . --config Release

# Verify
./ev_optimizer ../data/input.json ../data/output.json
cd ../..
```

**macOS with Homebrew:**
```bash
brew install cmake gcc
```

**Ubuntu/Debian:**
```bash
sudo apt-get install cmake g++ git
```

**Windows (MSVC):**
```bash
cmake .. -G "Visual Studio 17 2022"
cmake --build . --config Release
# Executable will be at build/Release/ev_optimizer.exe
# Update backend/main.py EXECUTABLE path if needed
```

---

### 3. Start MongoDB

```bash
# macOS (Homebrew)
brew services start mongodb-community

# Ubuntu
sudo systemctl start mongod

# Docker (easiest)
docker run -d -p 27017:27017 --name ev-mongo mongo:7
```

---

### 4. Start FastAPI Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API docs available at: http://localhost:8000/docs  
Health check: http://localhost:8000/health

---

### 5. Start React Frontend

```bash
cd frontend
npm install
npm run dev
```

Open: http://localhost:5173

---

## 🎮 How to Use

1. **Add Nodes** — Switch to "Node" mode, click anywhere on the map. The app reverse-geocodes coordinates using OpenStreetMap Nominatim API automatically.

2. **Create Edges** — Switch to "Edge" mode, click the first node, then the second. A road connection is created.

3. **Set Demand Nodes** — Switch to "Demand" mode, click a node, set its weight (EV traffic intensity), click "Set ⚡".

4. **Set k** — Choose how many charging stations to place.

5. **Optimize** — Click "⚡ Run Optimization". The backend:
   - Saves data to MongoDB
   - Runs C++ engine (Dijkstra + greedy k-medoids)
   - Returns optimal station locations

6. **View Results** — Green markers show station locations. Lines connect demand nodes to their nearest station. The result panel shows total cost and all assignments.

---

## 🔌 API Reference

### `POST /optimize`

```json
{
  "nodes": [
    { "id": 1, "lat": 30.3165, "lng": 78.0322, "address": "...", "isDemand": true, "weight": 8 }
  ],
  "edges": [
    { "from": 1, "to": 2 }
  ],
  "k": 2
}
```

**Response:**
```json
{
  "success": true,
  "stations": [{ "id": 3, "lat": 30.34, "lng": 78.05, "address": "..." }],
  "totalCost": 3.127,
  "assignments": [
    { "demandNodeId": 1, "stationNodeId": 3, "distance": 1.2, ... }
  ],
  "resultId": "664abc..."
}
```

### `GET /results?limit=10`
Returns recent optimization results from MongoDB.

### `GET /health`
Returns status of MongoDB connection and C++ engine.

---

## ⚡ C++ Algorithm Details

### Haversine Distance
```cpp
double R = 6371.0; // km
// Used for all edge weights — computed from lat/lng pairs
```

### Dijkstra
Standard single-source shortest path with a min-heap (priority queue). Multi-source Dijkstra is used for assigning demand nodes to nearest stations.

### Optimizer (Greedy k-Medoids + Local Search)
1. Select initial station = node with highest demand weight
2. Greedily add stations that most reduce total cost
3. Local search: swap stations to further minimize cost
4. **Cost = Σ (demand_weight × shortest_path_distance_to_nearest_station)**

---

## 🗄️ MongoDB Collections

| Collection | Contents |
|-----------|---------|
| `nodes`   | All submitted node data |
| `edges`   | All submitted edges |
| `demands` | Demand nodes only |
| `results` | Full optimization results |

---

## 🐛 Troubleshooting

| Issue | Fix |
|-------|-----|
| `C++ executable not found` | Compile engine, check path in `backend/main.py` EXECUTABLE |
| `MongoDB connection failed` | Start MongoDB, check MONGO_URL env var |
| `No demand nodes` | Switch to Demand mode and set weights on at least 1 node |
| Map not loading | Check internet connection (CartoDB tiles + Nominatim) |
| CORS errors | Backend CORS is set to `*`, check API URL in frontend |

---

## 🌍 Environment Variables

**Backend** (optional, defaults shown):
```
MONGO_URL=mongodb://localhost:27017
```

**Frontend** (optional):
```
VITE_API_URL=http://localhost:8000
```
