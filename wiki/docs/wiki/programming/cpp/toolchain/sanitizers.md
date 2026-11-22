### Sanitizers（ASan/UBSan/TSan）

常用组合：

```bash
# Address + Undefined
g++ -fsanitize=address,undefined -fno-omit-frame-pointer -g -O1 main.cpp -o app

# Thread sanitizer（检测数据竞争）
g++ -fsanitize=thread -g -O1 main.cpp -o app
```

注意：与某些优化或库不兼容；生产构建关闭 Sanitizer，仅在调试/CI 中启用。

