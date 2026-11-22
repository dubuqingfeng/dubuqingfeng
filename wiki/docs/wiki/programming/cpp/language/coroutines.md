### 协程（C++20）

协程是可暂停/恢复的函数，底层通过 `co_await`、`co_return`、`co_yield` 实现。标准库提供最小支撑，需要类型满足 Awaiter/Awaitable 协议，实际常结合库（如 asio、cppcoro）。

最小示意（伪异步）：

```cpp
#include <coroutine>
#include <iostream>

struct Task {
  struct promise_type {
    Task get_return_object() { return {}; }
    std::suspend_never initial_suspend() noexcept { return {}; }
    std::suspend_never final_suspend() noexcept { return {}; }
    void return_void() noexcept {}
    void unhandled_exception() { std::terminate(); }
  };
};

Task foo() {
  std::cout << "hello coroutine\n";
  co_return;
}

int main() { foo(); }
```

要点：实际工程可用协程适配 IO（如 `asio::awaitable`），通过调度器/执行器将 `co_await` 事件与事件循环（epoll/kqueue）对接。

