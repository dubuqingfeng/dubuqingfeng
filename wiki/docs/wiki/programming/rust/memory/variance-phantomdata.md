### 方差（Variance）与 PhantomData、Drop 检查

#### 方差速览

- 协变（Covariant）：`T1 <: T2` 则 `F<T1> <: F<T2>`。
- 逆变（Contravariant）：`T1 <: T2` 则 `F<T2> <: F<T1>`。
- 不变（Invariant）：无上述关系。

Rust 中常见：
- `&'a T` 对 `'a` 协变，对 `T` 协变；
- `&'a mut T` 对 `T` 不变（可变借用导致不变性）；
- `Box<T>` 对 `T` 协变；`Cell<T>/RefCell<T>/UnsafeCell<T>` 对 `T` 不变。

#### PhantomData 的作用

- 向编译器声明“逻辑上拥有”某类型/生命周期，以影响方差/Drop 检查/自动 trait（Send/Sync）。

```rust
use std::marker::PhantomData;

struct MyVec<'a, T> {
    ptr: *mut T,
    len: usize,
    _lt: PhantomData<&'a T>, // 告诉编译器：与 'a 相关，协变
}
```

错误示例：若遗漏 `PhantomData`，可能绕过借用检查或 Drop 检查导致悬垂。

#### Drop 检查（Drop Check）

- Rust 在析构时会检查借用不越界；带生命周期参数的类型若在 Drop 中可能访问借用数据，需保证生命周期正确表达（常需 `PhantomData`）。

#### Send/Sync 与自动 trait

- 自定义类型通过字段的自动 trait 组合决定是否 `Send/Sync`；
- 使用 `PhantomData<*const T>` 可标记为“不共享可变”（影响 `Sync` 推断）。

