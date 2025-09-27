### Web: Axum 快速上手

#### 依赖

```toml
[dependencies]
axum = "0.7"
tokio = { version = "1", features = ["full"] }
```

#### 最小示例

```rust
use axum::{routing::get, Router};

#[tokio::main]
async fn main() {
    let app = Router::new().route("/", get(|| async { "hello" }));
    let listener = tokio::net::TcpListener::bind(("0.0.0.0", 3000)).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
```

#### 处理器与提取器（Extractor）

```rust
use axum::{extract::Path, routing::get, Router};

async fn hello(Path(name): Path<String>) -> String { format!("hello, {}", name) }

let app = Router::new().route("/hello/:name", get(hello));
```

#### 与 Go 对照

- 类似 `net/http` + 路由器（chi/gin），Axum 基于 Tower 中间件生态，易于组合与扩展。

