### 宏进阶：过程宏实战

#### 三类过程宏

- 派生宏（derive）：`#[derive(MyTrait)]`
- 属性宏（attribute）：`#[route(GET, "/")]`
- 函数宏（function-like）：`my_macro!(...)`

过程宏需在独立 crate 中实现：

```toml
# Cargo.toml（宏 crate）
[lib]
proc-macro = true

[dependencies]
syn = { version = "2", features = ["full"] }
quote = "1"
proc-macro2 = "1"
```

#### 最小派生宏示例：自动实现 Hello

```rust
// 宏 crate: hello_derive/src/lib.rs
use proc_macro::TokenStream;
use quote::quote;
use syn::{parse_macro_input, DeriveInput};

#[proc_macro_derive(Hello)]
pub fn derive_hello(input: TokenStream) -> TokenStream {
    let input = parse_macro_input!(input as DeriveInput);
    let name = input.ident; // 目标类型名
    let gen = quote! {
        impl Hello for #name {
            fn hello(&self) -> &'static str { "hello" }
        }
    };
    gen.into()
}
```

```rust
// 使用方 crate
pub trait Hello { fn hello(&self) -> &'static str; }

#[derive(Hello)]
struct User;

fn main() { println!("{}", User.hello()); }
```

#### 属性宏示例（精简版）

```rust
// #[trace] 为函数注入打印逻辑
#[proc_macro_attribute]
pub fn trace(_attr: TokenStream, item: TokenStream) -> TokenStream {
    let mut f = syn::parse_macro_input!(item as syn::ItemFn);
    let name = f.sig.ident.clone();
    let body = &f.block;
    let wrapped = quote!({
        println!("enter: {}", stringify!(#name));
        let __ret = (|| #body)();
        println!("exit: {}", stringify!(#name));
        __ret
    });
    f.block = syn::parse2(wrapped).unwrap();
    quote!(#f).into()
}
```

#### 宏卫生（Hygiene）与路径

- 使用绝对路径或在宏中 `use` 明确依赖，避免与调用方命名冲突
- `syn::parse_macro_input!` 保持错误信息友好；用 `Span` 指定错误位置
- 复杂生成建议 `cargo expand` 观察展开结果

#### 测试与验证

- 单元测试：对生成的 TokenStream 做字符串快照
- 编译期测试：`trybuild` 用例覆盖成功和失败场景（API 约束）
- 文档测试：宏输出示例作为 doctest 运行

#### 宏性能与可维护性

- 仅生成必要代码，避免重复单态化膨胀
- 将语义分析/验证尽量放在宏内，减少调用方误用
- 为宏输出打上特征门控（feature）或可配置行为

#### 与 Go 的对照

- Go 多依赖 `go generate`/工具链；Rust 过程宏是语言级元编程，表达力更强但复杂度更高

