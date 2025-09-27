### 原子与内存序（Acquire/Release/SeqCst）

#### 为什么需要原子

在并发下，普通读写可能被编译器/CPU 重排，导致数据竞争与可见性问题。原子操作提供“不可分割”的读改写与可见性保证。

#### 常用原子类型

- `AtomicBool/AtomicIsize/AtomicUsize/AtomicI64/...`
- `AtomicPtr<T>`（指针原子）

#### 内存序（Ordering）

- Relaxed：仅保证原子自身的原子性，不提供跨线程的顺序关系。
- Acquire：读端获取，禁止其后操作重排到前面；与 Release 搭配形成“同步边”（happens-before）。
- Release：写端释放，禁止其前操作重排到后面。
- AcqRel：读改写操作的获取+释放。
- SeqCst：最强保证，所有 SeqCst 操作在全局单序（total order）中一致。

示例：经典消息传递（message passing）

```rust
use std::sync::atomic::{AtomicUsize, Ordering};
use std::thread;

static DATA: AtomicUsize = AtomicUsize::new(0);
static FLAG: AtomicUsize = AtomicUsize::new(0);

fn main() {
    let t = thread::spawn(|| {
        DATA.store(42, Ordering::Relaxed);
        FLAG.store(1, Ordering::Release); // 发布
    });
    while FLAG.load(Ordering::Acquire) == 0 {} // 获取
    assert_eq!(DATA.load(Ordering::Relaxed), 42); // 可见
    t.join().unwrap();
}
```

#### compare_exchange 与弱 CAS

- `compare_exchange(expected, new, success, failure)`：在匹配 `expected` 时用 `success` 序；失败用 `failure` 序。
- `compare_exchange_weak` 可能虚假失败，需在循环中重试；某些架构上更高效。

#### Fences（栅栏）

- `atomic::fence(Ordering::SeqCst/Acquire/Release)` 用于在无需具体原子读写时建立顺序边。

#### 反模式与注意

- 混用原子与非原子访问同一位置（数据竞争）
- 过度使用 SeqCst，降低性能；但也不要使用过弱的序导致竞态
- 忽略“拆箱”问题：将多个相关字段拆成独立原子可能打破不变量，需要额外同步

#### 工具

- `loom`：枚举并发交错测试算法正确性
- `ThreadSanitizer`：检测数据竞争（注意对 Rust/async 的支持范围）

