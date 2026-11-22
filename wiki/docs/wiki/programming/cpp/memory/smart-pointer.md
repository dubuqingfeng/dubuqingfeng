### 智能指针

常用类型：

- `std::unique_ptr<T>` 独占所有权，可移动不可拷贝；默认选择。
- `std::shared_ptr<T>` 共享所有权，引用计数有开销；避免循环引用，必要时配合 `std::weak_ptr`。

示例：

```cpp
#include <memory>
#include <vector>

struct Foo { int x{0}; };

int main() {
  auto p = std::make_unique<Foo>();
  p->x = 42;

  std::shared_ptr<Foo> sp = std::move(p); // unique_ptr 移交所有权
  // if (p) ... // p 现为空

  std::vector<std::shared_ptr<Foo>> v;
  v.push_back(sp);
}
```

