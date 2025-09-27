### 性能与优化手段

#### 度量先行

- 基准：`criterion`
- 火焰图：`perf`/`dtrace` + `inferno`（flamegraph）
- 体积与单态化：`cargo-bloat`、`cargo-llvm-lines`、`cargo-size`

#### 构建级优化

`Cargo.toml`：

```toml
[profile.release]
opt-level = 3
lto = "thin"      # 或 true（fat LTO，更慢但有时更快）
codegen-units = 1 # 提升优化空间，构建更慢
panic = "abort"   # 无回溯展开，减小体积/加速
strip = "symbols" # 需要 1.70+
```

按目标 CPU 优化（本地构建/容器内）：

```
RUSTFLAGS="-C target-cpu=native" cargo build --release
```

PGO（概要导向优化）与 BOLT：

- 用代表性负载生成 profile -> 带入编译 -> 复测验证
- LLVM PGO 流程：`-C profile-generate=/path` -> 跑工作负载 -> `-C profile-use=/path`
- BOLT 对二进制重新布局，常用于服务端热点函数

#### 代码级优化

- 内存/分配
  - 复用缓冲区；避免不必要的 `clone()`；倾向 `&str`/`&[u8]`；必要时用 `Cow<'_, T>`
  - 小型容器：`smallvec`/`arrayvec`；分配器：`mimalloc`/`jemalloc`
- 调度/并发
  - 选择合适的并发结构：`crossbeam` 的无锁队列、`parking_lot` 锁；减少临界区与争用
  - 原子序尽量削弱到 `Acquire/Release` 而非 `SeqCst`
- 算法/数据结构
  - Hash：对性能敏感可用 `ahash`/`rustc-hash`（注意安全权衡）
  - 选择合适容器：`Vec`/`VecDeque`/`BTreeMap`/`FxHashMap`
- 分支与内联
  - 标注冷路径：`#[cold]`；热点可考虑 `#[inline]`/`#[inline(always)]`（谨慎防止膨胀）
- SIMD/并行
  - `rayon` 数据并行；SIMD 可看 `std::simd`（nightly）或第三方库

#### I/O 与系统

- 批量与缓冲：`BufReader/BufWriter`；减少系统调用次数
- 零拷贝：`sendfile`/`mmap`（权衡复杂度与安全性）
- 网络：选择合适异步运行时（Tokio），使用连接池、超时与 backoff

#### 典型取舍

- 泛型单态化 vs Trait 对象：前者快但可能代码膨胀；后者体积小但有虚调用开销
- 释放检查/调试信息：开发态保留可观测性，发布态移除

#### 排查清单

- 基准是否稳定、是否热身
- 热点是否内联/去虚调用/去边界检查（在安全前提下）
- 分配热点：是否能挪到栈上或复用
- Hash 热点：是否换更快的 hasher
- 锁争用：是否可分片/缩小临界区/改无锁

