### 指针与切片安全边界（offset/add/wrapping 与 from_raw_parts 不变量）

#### 指针算术与边界

- `ptr.add(n)`/`ptr.sub(n)`：以元素为单位偏移，不允许越过分配边界（allocation），溢出 UB。
- `ptr.offset(n)`：允许负偏移，需更谨慎；新代码优先 `add/sub`。
- `wrapping_add/sub`：在机器整数上环绕，但仍必须保持 provenance 和在同一 allocation 内的约束。
- “one-past-end” 仅对原始指针在比较/再偏移时合法；引用不允许指向越界位置。

#### from_raw_parts 的不变量

```rust
// SAFETY: 调用者必须保证：
// 1) ptr 源自同一分配（provenance）且对齐满足 T 的对齐要求
// 2) len 元素均已初始化（读取未初始化内存是 UB）
// 3) 内存不在切片存活期间被释放/收回
// 4) 对于 &mut [T]，还需独占访问（无别名可变）
```

```rust
use std::slice;
use std::mem::MaybeUninit;

unsafe fn view_initialized(ptr: *const u32, len: usize) -> &'static [u32] {
    slice::from_raw_parts(ptr, len)
}

// 对于部分初始化的缓冲区，先用 MaybeUninit 再安全转换：
unsafe fn assume_init_slice(buf: &[MaybeUninit<u32>]) -> &[u32] {
    // 保证前 n 项已初始化
    MaybeUninit::slice_assume_init_ref(buf)
}
```

#### 拷贝语义与重叠

- `ptr::copy_nonoverlapping`（memcpy）：源与目标不应重叠；
- `ptr::copy`（memmove）：允许重叠，但稍慢；
- 用于 `T`，需确保按位复制符合 `T` 的有效性（对非 `Copy` 类型谨慎）。

#### 对齐与未对齐访问

- 指针必须满足 `align_of::<T>()`；不满足时使用 `read_unaligned/write_unaligned`。
- packed 结构体字段访问需按字节处理或使用 unaligned 原语。

#### 切片与长度

- 切片长度按元素计；总字节 = `len * size_of::<T>()` 不能越过 allocation 大小。
- 空切片的指针可为任意非空对齐指针（不会被解引用）。

#### 容器与失效引用

- `Vec` 的增长会 reallocate，`String` 同理；持有元素引用时避免触发增长操作。
- 使用索引或下标位置重新获取引用；或使用 `Vec::reserve` 预留容量避免重分配。

