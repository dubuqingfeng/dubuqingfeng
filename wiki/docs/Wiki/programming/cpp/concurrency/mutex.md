### 互斥锁 std::mutex

最基本的互斥原语，配合 `std::lock_guard` 或 `std::unique_lock` 使用以确保异常安全。

```cpp
#include <mutex>
#include <thread>
#include <vector>

int counter = 0;
std::mutex mtx;

void inc() {
  std::lock_guard<std::mutex> lk(mtx); // RAII 自动解锁
  ++counter;
}

int main() {
  std::vector<std::thread> v;
  for (int i = 0; i < 8; ++i) v.emplace_back(inc);
  for (auto &t : v) t.join();
}
```

扩展：读写性能可考虑 `std::shared_mutex`（C++17），条件同步用 `std::condition_variable`。

