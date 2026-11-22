### Go 风格的 Rust Workspace（cmd/pkg 结构）

#### 背景

在 Go 社区里，`cmd/` 存放可执行程序入口，`pkg/` 存放可复用库，这是很常见的代码组织方式。Rust 也可以通过 Workspace 模式实现类似的目录布局，既保留清晰的边界，又方便多二进制/多库协作与复用。

#### 目录结构（示例）

```
rust/
├─ Cargo.toml           # Workspace 根配置
├─ cmd/
│  └─ hello/            # 可执行程序（binary crate）
│     ├─ Cargo.toml
│     └─ src/main.rs
└─ pkg/
   └─ utils/            # 可复用库（library crate）
      ├─ Cargo.toml
      └─ src/lib.rs
```

> 仅作为组织方式示例，不强制要求实际仓库目录必须叫 `rust/`；关键是 Workspace + `cmd/` + `pkg/` 的结构思路。

#### 最小可用示例

1) Workspace 根 `Cargo.toml`

```toml
[workspace]
members = [
    "pkg/utils",
    "cmd/hello",
]
resolver = "2"

[workspace.package]
edition = "2021"
license = "MIT OR Apache-2.0"
authors = ["your-name <noreply@example.com>"]
```

2) 库 crate：`pkg/utils/Cargo.toml`

```toml
[package]
name = "dbqf-utils"
version = "0.1.0"
edition.workspace = true
license.workspace = true
authors.workspace = true

[lib]
name = "dbqf_utils"
path = "src/lib.rs"
```

`pkg/utils/src/lib.rs`

```rust
pub mod greeting {
    pub fn greet(name: &str) -> String {
        format!("Hello, {}!", name)
    }
}

pub mod stringx {
    pub fn capitalize(s: &str) -> String {
        let mut chars = s.chars();
        match chars.next() {
            None => String::new(),
            Some(first) => first.to_uppercase().collect::<String>() + chars.as_str(),
        }
    }
}
```

3) 可执行 crate：`cmd/hello/Cargo.toml`

```toml
[package]
name = "hello"
version = "0.1.0"
edition.workspace = true
license.workspace = true
authors.workspace = true

[dependencies]
dbqf-utils = { path = "../../pkg/utils" }
```

`cmd/hello/src/main.rs`

```rust
use dbqf_utils::{greeting, stringx};

fn main() {
    let name = std::env::args().nth(1).unwrap_or_else(|| "dubuqingfeng".to_string());
    let display = stringx::capitalize(&name);
    println!("{}", greeting::greet(&display));
}
```

#### 使用

在 Workspace 根目录执行：

```
cargo build                 # 构建全部 crate
cargo run -p hello -- Bob   # 运行指定的二进制 crate
cargo test -p dbqf-utils    # 运行库的测试（若有）
```

#### 与 Go 目录风格的对齐点

- `cmd/`：放置多个可执行入口（Go 的 `main` 包；Rust 的 binary crate）
- `pkg/`：对外复用的库（Go 的可导出包；Rust 的 library crate）
- Workspace：统一版本、依赖与构建，适合多 crate（类似多 module 的统一管理）

#### 小结

Rust 并不强制使用 `cmd/`、`pkg/` 的命名，但通过 Workspace 可以轻松贴近 Go 社区的组织习惯。对于已有 Go 项目迁移到 Rust 的场景，这种结构能降低心智负担、方便团队协作。

