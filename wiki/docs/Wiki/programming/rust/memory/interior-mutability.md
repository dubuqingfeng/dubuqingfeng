### 内部可变性：UnsafeCell、Cell、RefCell

#### UnsafeCell：打破共享不可变的唯一合法方式

- 标准库内部（如 `Cell/RefCell/Mutex/RwLock`）都以 `UnsafeCell<T>` 包装以支持在 `&T` 下修改内部数据。

#### Cell 与 Copy 语义

- `Cell<T>` 提供按值 get/set 的内部可变性，要求 `T: Copy`（或使用 `take/replace`）。

```rust
use std::cell::Cell;
let x = Cell::new(1);
x.set(2);
assert_eq!(x.get(), 2);
```

#### RefCell 与运行时借用检查

- `RefCell<T>` 提供 `borrow()/borrow_mut()`，在运行时强制“多读或独写”的借用规则，违规触发 panic。

```rust
use std::cell::RefCell;
let v = RefCell::new(vec![1]);
{
    let mut r = v.borrow_mut();
    r.push(2);
}
assert_eq!(v.borrow().len(), 2);
```

#### 线程安全与并发版本

- `Cell/RefCell` 非线程安全，不是 `Sync`；
- 并发下使用 `Mutex<T>`、`RwLock<T>`、`Atomic*` 或 `parking_lot` 替代；
- 跨线程共享需配合 `Arc<T>`。

#### 典型用法

- 面向对象样式的自引用/回调缓存；
- 惰性初始化（`OnceCell`/`Lazy`）；
- 全局状态管理（`OnceLock` + `Arc`）。

#### 注意事项

- `RefCell` 借用计数的 panic 会 poison 容器（对 `Mutex` 而言），需考虑恢复策略；
- 在 async 环境使用 `Mutex` 时避免持锁 `.await`，以防死锁或优先级反转。

