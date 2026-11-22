### 模板与泛型编程

函数模板与类模板示例：

```cpp
template <class T>
T add(T a, T b) { return a + b; }

template <class T>
struct Box { T value; };
```

要点：

- 尽量让接口“约束化”（C++20 Concepts），提高错误信息友好度与可读性。
- 模板代码放在头文件或采用显式实例化；注意编译时间与二进制体积。

