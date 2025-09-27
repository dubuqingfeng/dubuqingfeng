### 线程与并发基础

#### ToC

- 线程创建与状态
- 中断机制与守护线程
- 可见性与内存语义概览
- join/sleep/yield 区别
- 最佳实践

#### 线程创建与状态

创建方式：

- 继承 `Thread` 并重写 `run()`；
- 实现 `Runnable`；
- 提交到线程池（推荐，统一管理线程）。

典型状态（`Thread.State`）：`NEW`、`RUNNABLE`、`BLOCKED`、`WAITING`、`TIMED_WAITING`、`TERMINATED`。

常见导致阻塞/等待的原因：

- `synchronized` 进入监视器失败 → `BLOCKED`
- `Object.wait()` → `WAITING`
- `LockSupport.parkNanos()`/`sleep()`/`join(timeout)` → `TIMED_WAITING`

#### 中断机制与守护线程

- 中断通过“标志位”协作完成：`thread.interrupt()` 设置中断标志；被阻塞方法（`sleep/wait/join`）会抛出 `InterruptedException` 并清除标志。
- 查询与响应：`Thread.interrupted()`（静态，查询并清除）；`isInterrupted()`（实例，查询不清除）。
- 守护线程（Daemon）：随非守护线程全部结束而退出，适用于后台任务；不要依赖 `finally` 做关键清理。

示例：

```java
class Worker implements Runnable {
  @Override public void run() {
    while (!Thread.currentThread().isInterrupted()) {
      // do work
      try { Thread.sleep(10); } catch (InterruptedException e) {
        // 恢复中断状态并退出循环
        Thread.currentThread().interrupt();
      }
    }
  }
}
```

#### 可见性与内存语义概览

- 线程间通信依赖主内存，缓存/重排序可能导致“看不见”的写入。
- `synchronized` 与 `Lock` 的加解锁自带内存语义（建立 happens-before）。
- `volatile` 保证可见性与一定的有序性，但不保证复合操作的原子性。

详细规则与示例参见「Java 内存模型 JMM 与 volatile」。

#### join/sleep/yield 区别

- `sleep(ms)`: 让出 CPU 一段时间，不释放锁；时间到后进入可运行状态。
- `yield()`: 提示调度器让出时间片，效果不保证；不释放锁。
- `join()`: 当前线程等待目标线程结束，内部基于 `wait/notify` 实现。

#### 最佳实践

- 尽量使用线程池统一管理线程的创建与销毁。
- 编写可响应中断的循环与阻塞逻辑；不要吞掉 `InterruptedException`。
- 对共享数据使用不可变对象、`final` 字段、`volatile` 或显式同步。
- 使用高层并发工具（如 `BlockingQueue`、`Semaphore`、`CountDownLatch`、`CompletableFuture`）。

