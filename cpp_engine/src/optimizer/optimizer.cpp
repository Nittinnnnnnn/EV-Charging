#include "optimizer.h"
#include "../algorithms/dijkstra.h"
#include <limits>
#include <algorithm>
#include <random>
#include <iostream>

double Optimizer::computeCost(
    const Graph& g,
    const std::vector<int>& stations,
    std::unordered_map<int, int>& assignment,
    std::unordered_map<int, double>& distances
) {
    // Run multi-source Dijkstra from all station nodes
    auto dist = multiSourceDijkstra(g, stations);

    // For each station, we need to know which station is nearest to each node.
    // We do per-station Dijkstra to get assignments.
    std::unordered_map<int, std::unordered_map<int, double>> perStationDist;
    for (int s : stations) {
        perStationDist[s] = dijkstra(g, s);
    }

    assignment.clear();
    distances.clear();
    double totalCost = 0.0;

    for (auto& [id, node] : g.nodes) {
        if (!node.isDemand) continue;

        // Find nearest station
        double bestDist = std::numeric_limits<double>::infinity();
        int bestStation = -1;
        for (int s : stations) {
            double d = perStationDist[s][id];
            if (d < bestDist) {
                bestDist = d;
                bestStation = s;
            }
        }

        assignment[id] = bestStation;
        distances[id] = bestDist;
        totalCost += node.weight * bestDist;
    }
    return totalCost;
}

OptimizationResult Optimizer::optimize(const Graph& g, int k) {
    std::vector<int> allNodes = g.getNodeIds();
    int n = (int)allNodes.size();

    if (k >= n) {
        // Trivial: place stations everywhere
        OptimizationResult res;
        res.stationIds = allNodes;
        res.totalCost = 0.0;
        for (auto& [id, node] : g.nodes) {
            if (node.isDemand) {
                res.assignment[id] = id;
                res.demandDistances[id] = 0.0;
            }
        }
        return res;
    }

    // === Greedy initialization: pick first station as highest-demand node ===
    // Then iteratively add the node that reduces cost the most.

    std::vector<int> stations;
    std::vector<int> remaining = allNodes;

    // Start: pick the node with highest demand weight (or any if no demand)
    int firstStation = allNodes[0];
    double maxWeight = -1;
    for (auto& [id, node] : g.nodes) {
        if (node.isDemand && node.weight > maxWeight) {
            maxWeight = node.weight;
            firstStation = id;
        }
    }
    stations.push_back(firstStation);
    remaining.erase(std::remove(remaining.begin(), remaining.end(), firstStation), remaining.end());

    // Greedy: keep adding station that reduces total cost most
    for (int step = 1; step < k; step++) {
        double bestCost = std::numeric_limits<double>::infinity();
        int bestCandidate = -1;

        for (int candidate : remaining) {
            std::vector<int> trial = stations;
            trial.push_back(candidate);

            std::unordered_map<int, int> tmpAssign;
            std::unordered_map<int, double> tmpDist;
            double cost = computeCost(g, trial, tmpAssign, tmpDist);

            if (cost < bestCost) {
                bestCost = cost;
                bestCandidate = candidate;
            }
        }

        if (bestCandidate == -1) break;
        stations.push_back(bestCandidate);
        remaining.erase(std::remove(remaining.begin(), remaining.end(), bestCandidate), remaining.end());
    }

    // === Local search: try swapping stations to further reduce cost ===
    bool improved = true;
    int maxIter = 50;
    while (improved && maxIter-- > 0) {
        improved = false;
        std::unordered_map<int, int> tmpAssign;
        std::unordered_map<int, double> tmpDist;
        double currentCost = computeCost(g, stations, tmpAssign, tmpDist);

        for (int i = 0; i < (int)stations.size(); i++) {
            for (int candidate : remaining) {
                std::vector<int> trial = stations;
                trial[i] = candidate;

                std::unordered_map<int, int> trialAssign;
                std::unordered_map<int, double> trialDist;
                double cost = computeCost(g, trial, trialAssign, trialDist);

                if (cost < currentCost - 1e-9) {
                    // Accept swap
                    int old = stations[i];
                    remaining.push_back(old);
                    remaining.erase(std::remove(remaining.begin(), remaining.end(), candidate), remaining.end());
                    stations[i] = candidate;
                    currentCost = cost;
                    improved = true;
                    break;
                }
            }
            if (improved) break;
        }
    }

    // Final result
    OptimizationResult result;
    result.stationIds = stations;
    std::unordered_map<int, int> finalAssign;
    std::unordered_map<int, double> finalDist;
    result.totalCost = computeCost(g, stations, finalAssign, finalDist);
    result.assignment = finalAssign;
    result.demandDistances = finalDist;

    return result;
}
