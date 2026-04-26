#pragma once
#include <vector>
#include <unordered_map>
#include "../models/node.h"
#include "../models/edge.h"

class Graph {
public:
    std::unordered_map<int, Node> nodes;
    std::vector<Edge> edges;
    // adjacency list: node_id -> list of (neighbor_id, edge_weight)
    std::unordered_map<int, std::vector<std::pair<int, double>>> adj;

    void addNode(const Node& n);
    void addEdge(int from, int to, double weight);
    std::vector<int> getNodeIds() const;
    int nodeCount() const;
    int edgeCount() const;

    // Haversine distance between two node IDs
    static double haversine(double lat1, double lng1, double lat2, double lng2);
};
