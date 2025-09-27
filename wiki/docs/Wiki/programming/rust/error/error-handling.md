### 错误处理：Result/anyhow/thiserror

#### 基础：Result 与 ? 运算符

```rust
use std::fs;

fn read_text(p: &str) -> std::io::Result<String> {
    let s = fs::read_to_string(p)?; // 出错自动向上传播
    Ok(s)
}
```

#### thiserror 定义错误类型

```rust
use thiserror::Error;

#[derive(Debug, Error)]
enum MyError {
    #[error("io: {0}")] Io(#[from] std::io::Error),
    #[error("bad input: {0}")] BadInput(String),
}

fn run() -> Result<(), MyError> {
    // ...
    Ok(())
}
```

#### anyhow 简化应用层错误

```rust
use anyhow::{Context, Result};

fn main() -> Result<()> {
    let data = std::fs::read("conf.toml").context("read conf failed")?;
    println!("{} bytes", data.len());
    Ok(())
}
```

#### 与 Go 对照

- Rust 通过类型系统编译期约束错误处理路径；Go 通过显式返回 `error`，常配合 `if err != nil`。

