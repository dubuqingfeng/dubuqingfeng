### 格式与静态检查（clang-format/clang-tidy）

clang-format：在仓库根放置 `.clang-format` 配置，统一代码风格。

```bash
clang-format -i src/**/*.cpp include/**/*.hpp
```

clang-tidy：启用规则并集成到 CMake/CI。

```bash
clang-tidy -checks='modernize-*,performance-*' file.cpp -- --std=c++17
```

