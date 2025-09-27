### FFI：与 C 交互

#### 调用 C（extern 块）

```rust
#[link(name = "m")] // 例如链接 libm
extern "C" { fn cos(x: f64) -> f64; }

fn main() {
    let x = unsafe { cos(0.0) };
    println!("{}", x);
}
```

#### 暴露给 C 使用

```rust
#[no_mangle]
pub extern "C" fn add(a: i32, b: i32) -> i32 { a + b }
```

#### ABI 与内存布局

- 使用 `#[repr(C)]` 保证结构体与枚举的 C 兼容布局。
- 跨语言边界需避免在接口层直接传递 `String`、`Vec` 等拥有所有权的复杂类型，倾向 `*const c_char`、指针 + 长度等 C 约定。

#### 生态

- 绑定生成：`bindgen`（从 C 头文件到 Rust 绑定）、`cbindgen`（从 Rust 导出 C 头文件）。
- 构建脚本：使用 `build.rs` 探测系统库、配置 `cargo:rustc-link-lib` 等。

