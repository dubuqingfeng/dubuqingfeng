### Concepts 约束

用概念约束模板实参，提升可读性与错误信息质量。

```cpp
#include <concepts>

template <typename T>
concept Addable = requires(T a, T b) {
  { a + b } -> std::same_as<T>;
};

template <Addable T>
T add(T a, T b) { return a + b; }
```

也可使用 `requires` 子句：

```cpp
template <typename T>
requires std::integral<T>
T inc(T v) { return v + 1; }
```

