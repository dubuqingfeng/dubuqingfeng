### 线程、共享内存与消息传递

#### 线程与 Join

```rust
use std::thread;

fn main() {
    let h = thread::spawn(|| {
        println!("in thread");
        42
    });
    let v = h.join().unwrap();
    println!("ret={}", v);
}
```

#### 共享可变状态：Arc + Mutex/RwLock

```rust
use std::{sync::{Arc, Mutex}, thread};

fn main() {
    let counter = Arc::new(Mutex::new(0));
    let mut hs = vec![];
    for _ in 0..4 {
        let c = Arc::clone(&counter);
        hs.push(thread::spawn(move || {
            *c.lock().unwrap() += 1;
        }));
    }
    for h in hs { h.join().unwrap(); }
    println!("{}", *counter.lock().unwrap());
}
```

#### 通信：Channel（mpsc）

```rust
use std::sync::mpsc;
use std::thread;

fn main() {
    let (tx, rx) = mpsc::channel();
    thread::spawn(move || { tx.send("hi").unwrap(); });
    println!("{}", rx.recv().unwrap());
}
```

#### Send/Sync 概念

- `Send`：类型可在线程间转移所有权；`Sync`：`&T` 可在线程间共享。
- 大多数安全类型均自动实现；`Rc<T>` 非 `Send/Sync`，需用 `Arc<T>`。

#### 与 Go 对照

- Go 强调“不要通过共享内存来通信”；Rust 两者皆可，但通过类型系统隔离风险。

