### 读写锁 std::shared_mutex

允许多个读者共享锁，写者独占（C++17）。

```cpp
#include <shared_mutex>
#include <thread>
#include <vector>

int data = 0;
std::shared_mutex rw;

void reader() {
  std::shared_lock<std::shared_mutex> lk(rw);
  (void)data; // 读
}

void writer() {
  std::unique_lock<std::shared_mutex> lk(rw);
  ++data; // 写
}

int main() {
  std::vector<std::thread> v;
  for (int i=0;i<4;++i) v.emplace_back(reader);
  v.emplace_back(writer);
  for (auto &t: v) t.join();
}
```

读多写少场景可获益；避免写者饥饿，必要时采用策略控制或选择其他同步原语。

