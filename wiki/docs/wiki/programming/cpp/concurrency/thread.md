### 线程 std::thread

使用 `std::thread` 启动、加入与分离线程。

示例：

```cpp
#include <thread>
#include <iostream>

void worker(int id) {
  std::cout << "worker " << id << " running\n";
}

int main() {
  std::thread t(worker, 1);
  // 等待线程执行完毕（join），避免野线程
  t.join();
}
```

要点：

- 线程函数参数按值复制，避免悬垂引用；需要引用时用 `std::ref`。
- 非 joinable 的线程对象在析构时会 `std::terminate`，因此要 `join` 或 `detach`。

