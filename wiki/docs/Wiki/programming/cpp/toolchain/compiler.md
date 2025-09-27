### 编译与链接（gcc/clang/msvc）

常见命令与选项：

```bash
g++ -std=c++17 -O2 -Wall -Wextra -pedantic -o app main.cpp

# 多文件与链接库
g++ -c a.cpp -o a.o
g++ -c b.cpp -o b.o
g++ a.o b.o -lpthread -o app
```

建议：开启警告当错误（`-Werror`）, 合理使用优化等级（`-O2`/`-O3`），配合地址/未定义行为检测（`-fsanitize=address,undefined`）。

