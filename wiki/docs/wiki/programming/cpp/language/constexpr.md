### constexpr 与常量表达式

`constexpr` 允许在编译期计算，提高性能并增加类型安全。

```cpp
constexpr int fib(int n){ return n<=1 ? n : fib(n-1)+fib(n-2); }
static_assert(fib(5) == 5);
```

注意：`consteval` 强制编译期计算；`constinit` 要求静态初始化。

