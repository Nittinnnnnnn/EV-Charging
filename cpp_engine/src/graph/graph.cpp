#include "graph.h"
#include <cmath>

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

void Graph::addNode(const Node& n) {
    nodes[n.id] = n;
    if (adj.find(n.id) == adj.end())
        adj[n.id] = {};
}

void Graph::addEdge(int from, int to, double weight) {
    edges.push_back({from, to, weight});
    adj[from].push_back({to, weight});
    adj[to].push_back({from, weight}); // undirected
}

std::vector<int> Graph::getNodeIds() const {
    std::vector<int> ids;
    for (auto& kv : nodes) ids.push_back(kv.first);
    return ids;
}

int Graph::nodeCount() const { return (int)nodes.size(); }
int Graph::edgeCount() const { return (int)edges.size(); }

double Graph::haversine(double lat1, double lng1, double lat2, double lng2) {
    const double R = 6371.0; // Earth radius in km
    double dLat = (lat2 - lat1) * M_PI / 180.0;
    double dLng = (lng2 - lng1) * M_PI / 180.0;
    double a = std::sin(dLat / 2) * std::sin(dLat / 2) +
               std::cos(lat1 * M_PI / 180.0) * std::cos(lat2 * M_PI / 180.0) *
               std::sin(dLng / 2) * std::sin(dLng / 2);
    double c = 2 * std::atan2(std::sqrt(a), std::sqrt(1 - a));
    return R * c;
}
