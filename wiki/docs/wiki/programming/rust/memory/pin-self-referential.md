### Pin 与自引用类型

#### 背景

某些类型一旦构造，其中的指针/引用指向自身内部数据；若对象移动则引用失效（悬垂）。Rust 默认可移动，需要“固定”以保证地址稳定。

#### Unpin 与 Pin

- `Unpin`：类型可以安全地被移动（大多数类型默认实现）。
- `Pin<P<T>>`：对 `T` 做“不动性”承诺，前提是 `T: !Unpin` 或我们希望强制其不被移动。
- 常见容器：`Pin<Box<T>>`、`Pin<&mut T>`、`Pin<Arc<T>>`。

构造：

```rust
use std::pin::Pin;

let x = Box::pin(/* T 值 */); // 将 T 固定在堆上
let p: Pin<Box<T>> = x;
```

#### 自引用与投影（Projection）

对 `Pin<&mut T>` 获取字段的可变引用并保持“不动性”不变式需要“投影”。推荐使用：

- `pin-project` 或 `pin-project-lite` 宏，安全地为字段生成 `Pin` 投影。

```rust
use pin_project::pin_project;
use std::pin::Pin;

#[pin_project]
struct MyFut {
    #[pin]
    inner: SomeFuture,
    buf: Vec<u8>,
}

impl std::future::Future for MyFut {
    type Output = ();
    fn poll(self: Pin<&mut Self>, cx: &mut std::task::Context<'_>) -> std::task::Poll<()> {
        let this = self.project();
        // this.inner 的类型为 Pin<&mut SomeFuture>
        this.inner.poll(cx)
    }
}
```

#### 与 async 的关系

- `async fn` 生成 `!Unpin` 的 `Future`（包含栈上状态机，自引用风险），执行器通过 `Pin<&mut _>` 进行 `poll`。

#### 不变量与陷阱

- 一旦 `T` 被 pin，除非 `T: Unpin`，不得通过安全代码把它移动到新地址。
- 禁止通过 `mem::replace`/`ptr::write` 等绕过 Pin 的“不动性”。
- 手写 `unsafe` 实现投影易出错，优先使用宏库。

