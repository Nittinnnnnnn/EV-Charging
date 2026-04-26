#include "json_parser.h"
#include "nlohmann/json.hpp"
#include <fstream>
#include <iostream>
#include <stdexcept>

using json = nlohmann::json;

Graph parseInput(const std::string& filepath, int& k) {
    std::ifstream f(filepath);
    if (!f.is_open()) throw std::runtime_error("Cannot open input file: " + filepath);

    json data;
    f >> data;

    Graph g;

    // Parse k
    k = data.value("k", 1);

    // Parse nodes
    for (auto& jn : data["nodes"]) {
        Node n;
        n.id = jn["id"].get<int>();
        n.lat = jn["lat"].get<double>();
        n.lng = jn["lng"].get<double>();
        n.address = jn.value("address", "");
        n.isDemand = jn.value("isDemand", false);
        n.weight = jn.value("weight", 0.0);
        g.addNode(n);
    }

    // Parse edges - compute Haversine distance if not provided
    for (auto& je : data["edges"]) {
        int from = je["from"].get<int>();
        int to = je["to"].get<int>();
        double w = 0.0;
        if (je.contains("weight")) {
            w = je["weight"].get<double>();
        } else {
            // Compute Haversine distance
            if (g.nodes.count(from) && g.nodes.count(to)) {
                auto& n1 = g.nodes[from];
                auto& n2 = g.nodes[to];
                w = Graph::haversine(n1.lat, n1.lng, n2.lat, n2.lng);
            }
        }
        g.addEdge(from, to, w);
    }

    return g;
}

void writeOutput(const std::string& filepath, const OptimizationResult& result, const Graph& g) {
    json out;

    // Station nodes
    json stations = json::array();
    for (int sid : result.stationIds) {
        json s;
        s["id"] = sid;
        if (g.nodes.count(sid)) {
            s["lat"] = g.nodes.at(sid).lat;
            s["lng"] = g.nodes.at(sid).lng;
            s["address"] = g.nodes.at(sid).address;
        }
        stations.push_back(s);
    }
    out["stations"] = stations;

    // Total cost
    out["totalCost"] = result.totalCost;

    // Assignment: demand node -> station
    json assignments = json::array();
    for (auto& [demandId, stationId] : result.assignment) {
        json a;
        a["demandNodeId"] = demandId;
        a["stationNodeId"] = stationId;
        a["distance"] = result.demandDistances.count(demandId) ? result.demandDistances.at(demandId) : 0.0;
        if (g.nodes.count(demandId)) {
            a["demandLat"] = g.nodes.at(demandId).lat;
            a["demandLng"] = g.nodes.at(demandId).lng;
        }
        if (g.nodes.count(stationId)) {
            a["stationLat"] = g.nodes.at(stationId).lat;
            a["stationLng"] = g.nodes.at(stationId).lng;
        }
        assignments.push_back(a);
    }
    out["assignments"] = assignments;

    std::ofstream f(filepath);
    if (!f.is_open()) throw std::runtime_error("Cannot open output file: " + filepath);
    f << out.dump(2);
    std::cout << "[C++ Engine] Output written to " << filepath << std::endl;
}
