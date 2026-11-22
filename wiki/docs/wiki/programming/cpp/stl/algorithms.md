### 算法与迭代器

`<algorithm>` 提供丰富的通用算法，基于迭代器和范围：

```cpp
#include <algorithm>
#include <vector>

int main() {
  std::vector<int> v{3,1,4,1,5,9};
  std::sort(v.begin(), v.end());
  auto it = std::find(v.begin(), v.end(), 4);
}
```

优先使用算法而非手写循环；C++20 起可使用 `<ranges>` 语法更简洁。

