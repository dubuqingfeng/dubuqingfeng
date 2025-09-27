### 原子操作 std::atomic

`std::atomic<T>` 提供无锁/有锁的原子读写与 RMW 操作，默认使用 `seq_cst` 内存序。

```cpp
#include <atomic>
#include <thread>
#include <vector>

std::atomic<int> counter{0};

void inc() { counter.fetch_add(1, std::memory_order_relaxed); }

int main() {
  std::vector<std::thread> v;
  for (int i = 0; i < 1'000; ++i) v.emplace_back(inc);
  for (auto &t : v) t.join();
}
```

注意：选择合适的内存序（relaxed/acquire-release/seq_cst），尽量封装在更高层抽象中。

