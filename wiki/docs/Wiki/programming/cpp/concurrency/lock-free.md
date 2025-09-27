### 无锁结构与注意事项

无锁并不等于无竞争；常依赖 `std::atomic` 与 CAS（compare_exchange_*）。

要点：

- 明确内存序（acquire-release/seq_cst），理解 ABA 问题并用标签指针或 `hazard pointers` 规避。
- 优先使用经过验证的库实现；自行实现需严格测试与形式化验证。
- 小心伪共享（false sharing），可使用缓存行对齐降低干扰。

