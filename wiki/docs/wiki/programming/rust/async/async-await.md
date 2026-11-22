### 异步 async/await 与 Future

#### 基础

- `async fn` 返回 `Future`，需在执行器（runtime）中 `poll` 才会推进。
- `.await` 在可挂起点让出执行权，等待就绪后继续。

```rust
async fn fetch() -> u32 { 42 }

async fn run() {
    let v = fetch().await;
    println!("{}", v);
}
```

#### Tokio 示例（最常用运行时之一）

```rust
#[tokio::main]
async fn main() {
    let (a, b) = tokio::join!(foo(), bar());
    println!("{} {}", a, b);
}

async fn foo() -> u32 { 1 }
async fn bar() -> u32 { 2 }
```

#### 与 Go 对照

- Go 由 runtime 调度 goroutine；Rust 需显式选择运行时（Tokio、async-std 等）。
- Rust 的 `Send/Sync` trait 决定跨线程安全；Go 默认可跨 goroutine，但需注意数据竞争。

