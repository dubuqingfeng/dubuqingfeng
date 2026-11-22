### CMake 基础

最小示例：

```cmake
cmake_minimum_required(VERSION 3.16)
project(demo LANGUAGES CXX)
set(CMAKE_CXX_STANDARD 17)

add_executable(demo main.cpp)
```

常用命令：

```bash
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build -j
```

