### 测试：单元、集成与基准

#### 单元测试（与模块同文件）

```rust
pub fn add(a: i32, b: i32) -> i32 { a + b }

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn it_works() { assert_eq!(add(1,2), 3); }
}
```

#### 集成测试（`tests/` 目录）

```rust
// tests/add_test.rs
use mylib::add;
#[test]
fn add_ok() { assert_eq!(add(2,3), 5); }
```

#### 文档测试（doctest）

```rust
/// 求和
///
/// ```
/// assert_eq!(mycrate::add(1,2), 3);
/// ```
pub fn add(a: i32, b: i32) -> i32 { a + b }
```

#### 基准测试

- 稳定版推荐 `criterion`；或使用 nightly 的 `#![feature(test)]`。

