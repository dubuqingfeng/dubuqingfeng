### 内存模型与 RAII

C++ 无自动 GC，资源管理以 RAII 为核心：构造获取资源、析构释放资源。

要点：

- 栈对象拥有自动期（作用域结束自动析构），堆对象需用智能指针或手动管理。
- 避免裸 `new/delete`，优先使用 `std::unique_ptr`/`std::shared_ptr` 与 `std::make_unique`/`std::make_shared`。
- 遵循 Rule of 0/5，减少资源所有权的显式管理代码量。

