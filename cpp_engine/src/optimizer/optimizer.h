#pragma once
#include <vector>
#include <unordered_map>
#include "../graph/graph.h"

struct OptimizationResult {
    std::vector<int> stationIds;          // chosen station node IDs
    double totalCost;                     // total weighted distance
    std::unordered_map<int, int> assignment; // demand_node_id -> station_node_id
    std::unordered_map<int, double> demandDistances; // demand_node_id -> dist to station
};

class Optimizer {
public:
    // k-medoids style greedy optimizer
    static OptimizationResult optimize(const Graph& g, int k);

private:
    // Compute total cost given a set of station candidates
    static double computeCost(
        const Graph& g,
        const std::vector<int>& stations,
        std::unordered_map<int, int>& assignment,
        std::unordered_map<int, double>& distances
    );
};
