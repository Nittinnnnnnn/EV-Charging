#pragma once
#include <string>

struct Node {
    int id;
    double lat;
    double lng;
    std::string address;
    bool isDemand = false;
    double weight = 0.0;
};
