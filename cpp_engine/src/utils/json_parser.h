#pragma once
#include <string>
#include "../graph/graph.h"
#include "../optimizer/optimizer.h"

// Parse input JSON file and populate graph
Graph parseInput(const std::string& filepath, int& k);

// Write optimization result to output JSON file
void writeOutput(const std::string& filepath, const OptimizationResult& result, const Graph& g);
