### unsafe 与内存模型

#### unsafe 能做什么

- 解引用裸指针：`*const T` / `*mut T`
- 调用 `unsafe fn` 或包含 `unsafe` 代码块
- 访问/修改可变静态变量：`static mut`
- 与外部（FFI）交互：`extern "C"`、`#[no_mangle]`
- 读写 `union` 字段、手动管理布局/对齐（`#[repr(C)]`/`align`）

> unsafe 只允许做“潜在不安全”的事，但不保证一定安全；正确性取决于你维护的不变量（invariants）。

#### Rust 内存模型要点

- 别名与可变性：同一时刻“要么多个不可变引用，要么一个可变引用”
- 数据竞争即未定义行为（UB）：两个或以上线程同时写/读写同一内存且无同步
- 对齐与有效性（validity/provenance）：解引用必须满足对齐、生命周期、初始化等前提
- 原子语义：通过 `std::sync::atomic` 指定内存序（`Relaxed/Acquire/Release/AcqRel/SeqCst`）
- 线程安全由 `Send/Sync` 决定：跨线程移动（Send）/共享（Sync）

参考：Rustonomicon、Unsafe Code Guidelines（UCG）

#### 常见场景与范式

- FFI：与 C 交换指针/缓冲区、遵守对齐与所有权转移约定
- Zero-copy：`from_raw_parts`/`from_raw_parts_mut` 构造切片（需确保容量与对齐正确）
- 自定义同步/容器：基于 `UnsafeCell` 打破共享不可变，严格封装边界
- 内存映射与 DMA：对齐、缓存一致性、顺序保证需格外谨慎

#### 最小示例（请勿在生产中裸用）

```rust
fn raw_demo() {
    let mut v = vec![10, 20, 30];
    let p = v.as_mut_ptr();
    unsafe {
        // 合法前提：p 指向的内存仍归 v 所有，未越界，且对齐
        *p.add(1) = 99; // 修改第二个元素
    }
    assert_eq!(v[1], 99);
}
```

#### 封装原则（关键）

- 将 `unsafe` 尽可能封装在小函数内，向外暴露“完全安全”的 API
- 明确写下不变量：对齐、越界、别名、生命周期、线程安全等前提条件
- 单元测试 + `Miri`/Sanitizer/`loom` 验证并发与内存访问

#### 调试与验证工具

- Miri：`cargo +nightly miri test` 检查未定义行为
- Sanitizers：`ASan`/`TSan`/`UBSan`（`RUSTFLAGS` 配置或 `-Z sanitizer`）
- `loom`：枚举并发交错以发现数据竞争

#### 延伸阅读（更深入专题）

- [别名、起源（provenance）与有效性](./aliasing-provenance-validity.md)
- [原子与内存序（Acquire/Release/SeqCst）](./atomics-and-ordering.md)
- [Pin 与自引用类型、不动性](./pin-self-referential.md)
- [内存布局与 repr、niche 优化](./layout-repr-niches.md)
- [方差与 PhantomData、Drop 检查](./variance-phantomdata.md)
- [内部可变性：UnsafeCell/Cell/RefCell](./interior-mutability.md)
- [借用检查进阶：NLL、两阶段借用、重借用](./borrow-advanced.md)
- [指针与切片安全边界](./pointers-slices-safety.md)
- [Drop 顺序与 panic 展开/abort](./drop-unwind-abort.md)
