### 内存布局：repr、透明与 niche 优化

#### repr 选项

- `repr(Rust)`：默认布局，不稳定，跨 FFI 不应依赖具体字节布局。
- `repr(C)`：与 C ABI 对齐，适合 FFI。
- `repr(transparent)`：对单字段新类型保证与内部字段相同布局（常用于 FFI 包装）。
- `repr(packed(N))`：紧凑布局，可能导致未对齐访问，需谨慎并用 `read_unaligned`。
- `repr(align(N))`：提高对齐要求。

#### 枚举与 niche（凹位）优化

- Option/Result 等枚举可利用类型的“非法值”编码判别位，零开销包裹：

```rust
use std::mem::size_of;
assert_eq!(size_of::<Option<&u8>>(), size_of::<&u8>());
assert_eq!(size_of::<Option<std::num::NonZeroUsize>>(), size_of::<usize>());
```

#### ManuallyDrop 与 MaybeUninit

- `ManuallyDrop<T>`：抑制自动 Drop，手动控制析构顺序，避免双重释放。
- `MaybeUninit<T>`：延迟初始化，不读取未初始化内存；配合集合类型/FFI 使用。

#### 透明包装与 transmute 危险

- 只有在 `repr(transparent)` 且类型满足同一 ABI 才可安全“视为”内部类型；`transmute` 容易破坏对齐/有效性，应尽量避免。

#### 对齐与边界

- 使用 `align_of::<T>()/size_of::<T>()` 进行静态检查；
- 对 packed 结构体的字段访问可能触发未对齐，优先通过按字节拷贝或显式的 unaligned 读写原语处理。

