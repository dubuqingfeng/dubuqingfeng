### Drop 顺序与 panic：展开（unwind）与中止（abort）

#### Drop 顺序（确定性）

- 作用域内的局部变量：按“逆声明顺序”销毁（后声明的先 Drop）。
- 结构体字段：按“声明顺序”依次 Drop。
- 元组/数组：元素从后到前 Drop（数组为从最后一个到第一个）。
- 临时值：在语句结束处 Drop（受 NLL/临时生命周期规则影响）。

设计建议：若字段 A 持有对字段 B 的引用，应让 A 在 B 之前 Drop（将 A 放在 B 之前声明）。

#### panic 的两种策略

- unwind（默认）：沿调用栈展开，运行已达栈帧中已构造对象的 Drop，实现 RAII 释放；可被 `catch_unwind` 捕获（`UnwindSafe` 约束）。
- abort：进程直接中止，不运行 Drop；更小更快，适合对体积/性能敏感的发布二进制。

配置方式（Cargo.toml）：

```toml
[profile.release]
panic = "abort"
```

#### 与 FFI 的交互

- 绝不允许 panic 穿越 FFI 边界到 C/C++：在 FFI 入口捕获或使用 `abort` 策略。
- C/C++ 调用 Rust：在导出函数最外层 `catch_unwind`，将 panic 转换为错误码；或将 `panic = abort`。

#### Poison 与恢复

- `std::sync::Mutex` 在持锁线程 panic 后会标记为 poison；后续 `lock()` 返回 `PoisonError`，调用方可选择 `into_inner()` 强制获取并修复状态。

#### 观测与调试

- 使用 `RUST_BACKTRACE=1` 查看回溯（unwind）；结合日志/指标，在 Drop 实现里打印收尾信息。

#### 常见陷阱

- 在 Drop 中 panic 会触发双重 panic：unwind 下会 `abort`；
- 使用 `mem::forget` 绕过 Drop 需小心资源泄漏；
- 在 async 中持锁 `.await` 导致广域持锁，一旦 panic 可能 poison 大范围状态。

