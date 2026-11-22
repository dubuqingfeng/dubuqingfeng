### 所有权、借用与生命周期

#### 核心规则

- 每个值有且仅有一个所有者（owner）。
- 作用域结束，所有者离开，值被丢弃（drop）。
- 通过借用（`&T`、`&mut T`）可在不转移所有权下访问值；同一时刻允许多个不可变借用或一个可变借用。
- 生命周期用于描述引用有效范围，保证不悬垂（dangling）。

#### 所有权转移（Move）

```rust
fn main() {
    let s = String::from("hello");
    let t = s;           // 所有权移动，s 不再可用
    // println!("{}", s); // 编译错误：s 已被 move
    println!("{}", t);
}
```

#### 借用与可变借用

```rust
fn len(v: &Vec<i32>) -> usize { v.len() }

fn push_one(v: &mut Vec<i32>) { v.push(1); }

fn main() {
    let mut v = vec![1,2,3];
    let n = len(&v);           // 不可变借用，可并发多次
    println!("len={}", n);

    push_one(&mut v);          // 可变借用，同一时刻仅能存在一个
    println!("{:?}", v);
}
```

#### 生命周期注解（常见于函数/结构体）

```rust
// 返回两个字符串切片较长者的引用
fn longer<'a>(a: &'a str, b: &'a str) -> &'a str {
    if a.len() >= b.len() { a } else { b }
}

struct Holder<'a> { s: &'a str }

fn main() {
    let s1 = String::from("abc");
    let s2 = String::from("abcd");
    let r = longer(&s1, &s2);
    let h = Holder { s: r };
    println!("{}", h.s);
}
```

#### 与 Go 的差异速览

- Rust 通过所有权/借用在编译期保证内存安全；Go 依赖 GC 运行期回收。
- Rust 引用有严格的可变性与别名规则；Go 指针无编译期别名限制但需运行期注意数据竞争。

