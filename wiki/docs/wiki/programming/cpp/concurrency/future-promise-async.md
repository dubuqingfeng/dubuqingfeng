### 异步与期约 std::future/std::promise/std::async

用 `std::promise` 产生值，用 `std::future` 等待结果；`std::async` 封装异步任务。

```cpp
#include <future>
#include <thread>

int compute() { return 42; }

int main() {
  // async 可并行或延迟执行，策略由实现决定
  auto f = std::async(std::launch::async, compute);
  int v = f.get(); // 等待结果
}
```

`promise/future` 示例：

```cpp
#include <future>

int main() {
  std::promise<int> p;
  std::future<int> f = p.get_future();
  std::thread t([&]{ p.set_value(7); });
  int v = f.get();
  t.join();
}
```

注意：避免 `std::async` 默认策略引入的同步/延迟不确定性，必要时显式使用 `std::launch::async`。

