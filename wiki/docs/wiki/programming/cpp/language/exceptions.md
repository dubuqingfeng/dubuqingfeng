### 异常处理与 noexcept

异常用于报告错误并进行栈展开，RAII 确保资源在异常路径自动释放。

要点：

- 接口层可用异常，边界处尽量“收敛”异常（转换为状态码/`expected` 风格）。
- 正确标注 `noexcept`（尤其是移动操作），使标准容器可采用更高效路径。
- 禁止在析构函数中逃逸异常。

```cpp
struct X {
  X() = default;
  X(X&&) noexcept = default; // 移动不抛异常
  ~X() noexcept = default;   // 析构不抛
};
```

