### 分配器与 pmr

自定义分配器可优化内存模式；C++17 `std::pmr` 提供多态内存资源接口，便于在容器中切换分配策略。

```cpp
#include <memory_resource>
#include <vector>

int main() {
  std::byte buf[1024];
  std::pmr::monotonic_buffer_resource pool{buf, sizeof(buf)};
  std::pmr::vector<int> v{ &pool };
  v.resize(100);
}
```

适用场景：临时对象分配、减少碎片、避免频繁系统分配。

