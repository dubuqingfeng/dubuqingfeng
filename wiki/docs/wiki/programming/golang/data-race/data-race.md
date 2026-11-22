### Data Race 数据竞争



#### ToC



+ 定义与危害
+ 触发条件
+ 典型示例
+ 正确修复方式
+ happens-before 规则
+ 工具与调试
+ cgo 相关
+ 最佳实践
+ 参考链接



#### 定义与危害



数据竞争（Data Race）是指至少两个 goroutine 并发访问同一内存地址，且至少一个为写操作，并且这些访问没有通过同步原语建立顺序关系。出现数据竞争时，程序行为是未定义的，可能表现为随机错误、崩溃、结果不一致、难以复现的线上事故。



#### 触发条件



满足以下全部条件即构成数据竞争：

- 同一变量（同一内存地址）
- 并发访问（不同 goroutine）
- 至少一个访问是写
- 访问之间没有 happens-before 顺序（缺少同步）



#### 典型示例



1) 非原子自增导致竞争：

```go
var x int
var wg sync.WaitGroup

wg.Add(2)
go func() {
    defer wg.Done()
    for i := 0; i < 100000; i++ {
        x++ // 非原子复合操作：读-加-写
    }
}()
go func() {
    defer wg.Done()
    for i := 0; i < 100000; i++ {
        x++
    }
}()
wg.Wait()
fmt.Println(x) // 结果不稳定
```

2) map 并发读写：

```go
m := map[int]int{}
go func() { m[1] = 1 }()
go func() { _ = m[1] }()
// 可能触发：fatal error: concurrent map writes / read and write
```

3) for 循环变量闭包捕获：

```go
for i := 0; i < 3; i++ {
    go func() {
        fmt.Println(i) // 竞争：i 在多个 goroutine 中共享
    }()
}

// 正确写法：将 i 作为参数传入，或重新绑定局部变量
for i := 0; i < 3; i++ {
    i := i
    go func(v int) {
        fmt.Println(v)
    }(i)
}
```



#### 正确修复方式



- 互斥锁保护共享数据：

```go
var mu sync.Mutex
mu.Lock()
x++
mu.Unlock()
```

- 原子操作（适合简单数值/标志位）：

```go
var x64 int64
atomic.AddInt64(&x64, 1)
v := atomic.LoadInt64(&x64)
atomic.StoreInt64(&x64, v)

// Go 1.19+ 也可使用类型化原子：
var ai atomic.Int64
ai.Add(1)
ai.Load()
ai.Store(0)
```

- 通道传递数据，避免共享可变状态：

```go
ch := make(chan int)
go func() {
    for v := range ch { _ = v /* 消费 */ }
}()
ch <- 1 // 通过消息传递代替共享
close(ch)
```

- map 并发：使用 `sync.RWMutex` 或 `sync.Map`（读多写少）：

```go
var mu sync.RWMutex
m := map[string]string{}

mu.Lock(); m["k"] = "v"; mu.Unlock()
mu.RLock(); _ = m["k"]; mu.RUnlock()

// 或者
var sm sync.Map
sm.Store("k", "v")
sm.Load("k")
```



#### happens-before 规则（核心同步语义）



以下场景会在操作之间建立 happens-before 顺序，消除数据竞争：

- channel：向通道的发送 happens-before 对应接收完成；关闭通道 happens-before 接收方观察到关闭
- Mutex：对同一把锁的 Unlock happens-before 随后的 Lock 返回
- RWMutex：写锁 Unlock happens-before 随后的写锁或读锁获取；读锁 Unlock happens-before 随后的写锁获取
- Once：首次执行的 `f` 完成 happens-before 所有 `Do(f)` 返回
- WaitGroup：每个 `Done` 对应的计数递减 happens-before 与之匹配的 `Wait` 返回
- Cond：`Signal/Broadcast` happens-before 被唤醒的 `Wait` 返回
- 原子操作：带有同步效果的 `Load/Store/Swap/CompareAndSwap` 建立必要的发布/获取关系（发布数据后再 Store，读取前先 Load）



#### 工具与调试



- 竞态检测器（Race Detector）：
  - 运行：`go run -race .`，`go test -race ./...`，`go build -race`
  - 注意：性能开销大（CPU/内存），仅用于本地/CI，勿在生产开启
  - 输出示例包含 goroutine 栈与读写位置，按“最后一次写 + 冲突读/写”定位
- 静态检查：`go vet` 能发现部分并发误用（如复制含锁的值），但无法静态证明数据竞争
- 可观测性：结合日志加时间戳、`pprof`/`trace` 理解并发路径与时序



#### cgo 相关



- 竞态检测器对 C 代码的支持有限，无法检测 C 分配的内存上的数据竞争
- 避免将 Go 指针长期保存到 C 内存；跨 cgo 调用修改同一 Go 对象仍需在 Go 侧同步
- C 侧多线程访问回调到 Go 的数据时，仍应通过互斥/原子在 Go 侧建立顺序



#### 最佳实践



- 首选不可变与消息传递：尽量避免跨 goroutine 共享可变对象
- 明确“所有权”：谁创建谁拥有，转移所有权通过 channel/函数参数
- 将同步封装在抽象内部：导出类型提供并发安全的方法，隐藏锁
- Map 并发：读多写少用 `sync.RWMutex` 或 `sync.Map`，大量写入优先使用锁保护的 map
- 发布-订阅：用 `atomic.Value` 发布只读快照，读路径零拷贝零锁
- CI 必跑 `-race`：在单元测试和集成测试阶段覆盖关键并发路径



#### 参考链接



- The Go Memory Model：https://go.dev/ref/mem
- Data Race Detector（Go Blog）：https://go.dev/blog/race-detector
- sync/atomic 文档：https://pkg.go.dev/sync/atomic
- sync.Map 文档：https://pkg.go.dev/sync#Map
