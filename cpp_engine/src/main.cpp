#include <iostream>
#include <stdexcept>
#include "graph/graph.h"
#include "optimizer/optimizer.h"
#include "utils/json_parser.h"

int main(int argc, char* argv[]) {
    std::string inputPath  = "data/input.json";
    std::string outputPath = "data/output.json";

    if (argc >= 2) inputPath  = argv[1];
    if (argc >= 3) outputPath = argv[2];

    std::cout << "[C++ Engine] Reading input from: " << inputPath << std::endl;

    try {
        int k = 2;
        Graph g = parseInput(inputPath, k);

        std::cout << "[C++ Engine] Loaded " << g.nodeCount() << " nodes, "
                  << g.edgeCount() << " edges. k=" << k << std::endl;

        // Count demand nodes
        int demandCount = 0;
        for (auto& [id, node] : g.nodes)
            if (node.isDemand) demandCount++;
        std::cout << "[C++ Engine] Demand nodes: " << demandCount << std::endl;

        if (demandCount == 0) {
            std::cerr << "[C++ Engine] WARNING: No demand nodes found. Check input." << std::endl;
        }

        OptimizationResult result = Optimizer::optimize(g, k);

        std::cout << "[C++ Engine] Optimization complete." << std::endl;
        std::cout << "[C++ Engine] Total cost: " << result.totalCost << std::endl;
        std::cout << "[C++ Engine] Stations: ";
        for (int sid : result.stationIds) std::cout << sid << " ";
        std::cout << std::endl;

        writeOutput(outputPath, result, g);
        return 0;

    } catch (const std::exception& e) {
        std::cerr << "[C++ Engine] ERROR: " << e.what() << std::endl;
        return 1;
    }
}
