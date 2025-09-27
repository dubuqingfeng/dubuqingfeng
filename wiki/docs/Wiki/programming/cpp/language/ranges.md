### Ranges 范围适配

基于范围的算法让管道式写法更自然（C++20）。

```cpp
#include <ranges>
#include <vector>

int main() {
  std::vector<int> v{1,2,3,4,5};
  auto view = v | std::views::filter([](int x){ return x%2; })
               | std::views::transform([](int x){ return x*x; });
  for (int x : view) {/* ... */}
}
```

注意：`views` 惰性、不拥有元素；需实体化可 `std::ranges::to<std::vector>`（C++23）或手动拷贝。

