#pragma once
#include <unordered_map>
#include <vector>
#include "../graph/graph.h"

// Returns map of node_id -> shortest distance from source
std::unordered_map<int, double> dijkstra(const Graph& g, int source);

// Returns shortest distances from source to all nodes using multi-source Dijkstra
std::unordered_map<int, double> multiSourceDijkstra(
    const Graph& g,
    const std::vector<int>& sources
);
