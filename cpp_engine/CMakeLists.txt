cmake_minimum_required(VERSION 3.14)
project(ev_charging_optimizer VERSION 1.0)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Download nlohmann/json header-only library
include(FetchContent)
FetchContent_Declare(
    nlohmann_json
    GIT_REPOSITORY https://github.com/nlohmann/json.git
    GIT_TAG        v3.11.3
)
FetchContent_MakeAvailable(nlohmann_json)

# Create include dir for nlohmann
include_directories(${nlohmann_json_SOURCE_DIR}/include)

# Source files
set(SOURCES
    src/main.cpp
    src/graph/graph.cpp
    src/algorithms/dijkstra.cpp
    src/optimizer/optimizer.cpp
    src/utils/json_parser.cpp
)

add_executable(ev_optimizer ${SOURCES})

# Link nlohmann_json
target_link_libraries(ev_optimizer PRIVATE nlohmann_json::nlohmann_json)

# Copy data directory to build directory
file(COPY ${CMAKE_SOURCE_DIR}/data DESTINATION ${CMAKE_BINARY_DIR})
