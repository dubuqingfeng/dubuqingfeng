### Cargo 基本用法

#### 常用命令

- 新建项目：`cargo new myapp`、`cargo new mylib --lib`
- 构建/运行/测试：`cargo build/run/test`、发布版：`cargo build --release`
- 文档：`cargo doc --open`
- 格式化/静态检查：`cargo fmt`、`cargo clippy`

#### 依赖与特性（features）

`Cargo.toml` 中：

```toml
[dependencies]
serde = { version = "1", features = ["derive"] }

[features]
default = ["tls"]
tls = ["reqwest/rustls-tls"]
```

#### Workspace 与多 crate

```toml
[workspace]
members = ["pkg/*", "cmd/*"]
resolver = "2"
```

#### Profile（编译配置）

```toml
[profile.release]
opt-level = 3
codegen-units = 1
lto = true
```

#### 构建脚本（build.rs）提示

- 在编译期生成代码/绑定、探测系统库、设置 `cargo:rerun-if-changed=...` 等。

