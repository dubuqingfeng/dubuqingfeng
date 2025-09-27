### 格式化与静态检查（rustfmt/clippy）

#### rustfmt

- 安装：`rustup component add rustfmt`
- 使用：`cargo fmt`（全局）或 `rustfmt src/*.rs`（文件）
- 配置：`rustfmt.toml`（行宽、导入风格等）

#### clippy

- 安装：`rustup component add clippy`
- 使用：`cargo clippy -- -D warnings`（将告警视为错误）
- 常见检查：冗余克隆、可读性、性能建议、错误边界等。

#### 与 CI 集成

- 结合 `cargo fmt --check` 与 `cargo clippy -D warnings` 阶段化检查，保证代码一致性与质量。

