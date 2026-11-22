### 宏：声明式与过程宏

#### 声明式宏（macro_rules!）

```rust
// 一个简化版的 vec! 宏
macro_rules! my_vec {
    ( $( $x:expr ),* $(,)? ) => {{
        let mut v = Vec::new();
        $( v.push($x); )*
        v
    }};
}

fn main() { let v = my_vec![1,2,3]; println!("{:?}", v); }
```

#### 过程宏（派生/属性/函数式）

- 派生宏：`#[derive(Serialize, Deserialize)]`
- 属性宏：`#[route(GET, "/")]`
- 函数式宏：`foo!(...)`

过程宏需在单独的 `proc-macro` crate 中实现，解析/生成 Rust 语法树（`syn`/`quote`）。

#### 与 Go 对照

- Go 倚赖生成工具（`go generate`、`stringer`）与编译器内置泛型/接口；Rust 宏是语言级元编程能力，表达力更强但也更复杂。

