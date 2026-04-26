#include "dijkstra.h"
#include <queue>
#include <limits>

using pdi = std::pair<double, int>;

std::unordered_map<int, double> dijkstra(const Graph& g, int source) {
    std::unordered_map<int, double> dist;
    for (auto& kv : g.nodes) dist[kv.first] = std::numeric_limits<double>::infinity();
    dist[source] = 0.0;

    std::priority_queue<pdi, std::vector<pdi>, std::greater<pdi>> pq;
    pq.push({0.0, source});

    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;

        auto it = g.adj.find(u);
        if (it == g.adj.end()) continue;
        for (auto& [v, w] : it->second) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }
    return dist;
}

std::unordered_map<int, double> multiSourceDijkstra(
    const Graph& g,
    const std::vector<int>& sources
) {
    std::unordered_map<int, double> dist;
    for (auto& kv : g.nodes) dist[kv.first] = std::numeric_limits<double>::infinity();

    std::priority_queue<pdi, std::vector<pdi>, std::greater<pdi>> pq;
    for (int s : sources) {
        dist[s] = 0.0;
        pq.push({0.0, s});
    }

    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;

        auto it = g.adj.find(u);
        if (it == g.adj.end()) continue;
        for (auto& [v, w] : it->second) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }
    return dist;
}
