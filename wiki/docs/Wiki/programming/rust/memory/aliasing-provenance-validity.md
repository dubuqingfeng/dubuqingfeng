### 别名（Aliasing）、起源（Provenance）与有效性（Validity）

#### 关键概念

- 别名（aliasing）：同一内存地址被多个引用/指针访问。
- 起源（provenance）：指针“合法访问范围”的来源信息；越过来源范围读写属于未定义行为（UB）。
- 有效性（validity）：对齐、已初始化、类型不变式、生命周期等均满足才能安全读写。

Rust 的借用规则在类型层面限制别名：同一时刻要么多个不可变引用（`&T`），要么一个可变引用（`&mut T`）。打破此规则的情况必须封装在 `unsafe` 内部并维持额外不变量。

#### 参考模型与文档

- Rustonomicon：不安全代码与抽象边界
- Unsafe Code Guidelines（UCG）：起源/别名/有效性的工作模型
- Stacked Borrows：非正式的别名模型，用于帮助理解编译器优化边界

#### 引用 vs 裸指针

- `&T`/`&mut T`：必须始终指向有效且正确对齐的内存；`&mut T` 独占可变访问。
- `*const T`/`*mut T`：可指向任意地址，但解引用需满足有效性，不得产生 UB。

常见规则：
- 引用不能为悬垂引用；允许“越尾指针 one-past-end”仅存在于原始指针世界，引用不允许指向越界位置。
- 使用 `ptr::add/offset` 要确保未溢出且仍在同一分配（allocation）内；`wrapping_add` 不检查溢出但仍需遵守 provenance。

#### 类型别名与再解释（Reinterpretation）

- 通过 `transmute`/按字节视图将内存再解释为其他类型需满足对齐与布局兼容，并保证无未初始化字节参与。
- 跨类型的“按位拷贝”建议用 `MaybeUninit<T>`、`ptr::read_unaligned` 等合适原语；或使用已审计库（如 `bytemuck`）的零拷贝转换。

示例：从字节切片构造 `u32`（小端序）

```rust
fn load_le_u32(b: &[u8]) -> u32 {
    assert!(b.len() >= 4);
    u32::from_le_bytes([b[0], b[1], b[2], b[3]])
}
```

#### 有效性与初始化

- 读取未初始化内存是 UB；`MaybeUninit<T>` 用于延迟初始化，避免错误优化。
- 对齐不满足时使用 `read_unaligned/write_unaligned`；尽量避免未对齐访问。

#### 抽象边界与不变量

- 在实现自定义容器/同步原语时，使用 `UnsafeCell<T>` 打破共享不可变；在 safe API 外维持：
  - 同一数据未被多可变引用同时访问
  - 迭代时不产生悬垂/失效引用（如 `Vec::push` 可导致 reallocate）
  - 生命周期与起源不越界

#### 常见陷阱

- 将 `&mut T` 分裂为多个可变引用并同时使用（除非证明分片互不重叠）
- 从容器拿到指针后发生 reallocate，之前指针/引用失效
- 通过 `mem::forget` 等打破 Drop 顺序导致双重释放

