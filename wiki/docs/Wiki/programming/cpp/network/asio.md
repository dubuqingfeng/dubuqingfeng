### Boost.Asio / Asio 基础

Asio 提供跨平台异步 IO，支持回调、`co_await`（C++20）。

TCP 客户端（回调版）示例：

```cpp
#include <boost/asio.hpp>
#include <iostream>

int main(){
  namespace asio = boost::asio;
  asio::io_context io;
  asio::ip::tcp::resolver res(io);
  auto endpoints = res.resolve("example.com", "80");
  asio::ip::tcp::socket sock(io);
  asio::async_connect(sock, endpoints,
    [&](auto ec, auto){ if (!ec) std::cout << "connected\n"; });
  io.run();
}
```

协程版（C++20）：

```cpp
// 需要编译器/库支持协程与 asio::awaitable
asio::awaitable<void> run(){
  using namespace boost::asio;
  ip::tcp::resolver res(co_await this_coro::executor);
  auto eps = co_await res.async_resolve("example.com","80", use_awaitable);
  ip::tcp::socket sock(co_await this_coro::executor);
  co_await async_connect(sock, eps, use_awaitable);
}
```

要点：合理选择执行器/线程池，利用 `strand` 线性化同一对象上的回调，避免竞态。

