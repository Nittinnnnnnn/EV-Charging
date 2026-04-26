# C++ Engine — EV Charging Optimizer

## Build

```bash
mkdir -p build && cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
cmake --build . --config Release
```

## Run

```bash
./ev_optimizer [input.json] [output.json]
# Defaults: data/input.json → data/output.json
```

## Modules

| Module | Purpose |
|--------|---------|
| `graph/` | Adjacency list graph, Haversine distance |
| `algorithms/dijkstra` | Single & multi-source shortest path |
| `optimizer/` | Greedy k-medoids + local search |
| `utils/json_parser` | nlohmann/json I/O |
| `models/` | Node and Edge structs |

## Cost Function

```
Total Cost = Σ_d (weight(d) × shortest_path(d → nearest_station))
```
