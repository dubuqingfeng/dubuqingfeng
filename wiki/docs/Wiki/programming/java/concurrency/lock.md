### 锁与同步（synchronized/Lock）

#### ToC

- synchronized 与 Monitor
- ReentrantLock/Condition/AQS
- 读写锁与 StampedLock
- wait/notify 与条件队列
- 公平性、自旋与性能

#### synchronized 与 Monitor

- 进入/退出 `synchronized` 块对应获取/释放对象监视器（Monitor），具有可重入性与内存语义：
  - 解锁对同一对象后，对应的写入对后续加锁的线程可见（happens-before）。
- 锁优化（JDK8 语境下）：偏向锁（已在新版本移除）、轻量级锁（自旋+CAS）、重量级锁（阻塞）。
- 编译器可能进行锁消除（逃逸分析）与锁粗化（合并相邻小锁）。

#### ReentrantLock/Condition/AQS

- `ReentrantLock` 等基于 AQS（AbstractQueuedSynchronizer）实现：
  - 使用 CLH 同步队列 + CAS 管理获取/释放；支持公平/非公平策略。
  - 可用 `Condition` 获得独立的等待队列，替代 `wait/notify` 的多条件场景。
- 相比 `synchronized`：
  - 功能更丰富（可轮询 `tryLock`、可中断锁获取、条件队列、多锁组合）。
  - API 成本更高，需要显式 `unlock()`，推荐 try-finally：

```java
Lock lock = new ReentrantLock();
try {
  lock.lock();
  // 临界区
} finally {
  lock.unlock();
}
```

#### 读写锁与 StampedLock

- `ReadWriteLock`（如 `ReentrantReadWriteLock`）：读多写少适用；读锁共享、写锁独占。
- `StampedLock`：提供乐观读（无阻塞、校验戳），适合读多写少且容忍重试的场景；注意 API 不可重入，易误用需小心。

```java
StampedLock sl = new StampedLock();
long stamp = sl.tryOptimisticRead();
int x = this.x; int y = this.y;
if (!sl.validate(stamp)) {
  stamp = sl.readLock();
  try { x = this.x; y = this.y; } finally { sl.unlockRead(stamp); }
}
```

#### wait/notify 与条件队列

- `wait/notify/notifyAll` 必须在持有对象监视器时调用；`wait()` 会释放监视器并进入等待队列，直到被 `notify` 唤醒重新竞争锁。
- 可能出现伪唤醒，使用「条件循环」模式：

```java
synchronized (lock) {
  while (!condition) { lock.wait(); }
  // 条件满足
}
```

- 与 `Condition` 对比：后者可为不同条件维护独立队列，避免“惊群”。

#### 公平性、自旋与性能

- 公平锁保证先来先得，避免饥饿，但吞吐降低；非公平锁倾向复用持有者，提高吞吐。
- 在轻度竞争下自旋获取锁可减少阻塞上下文切换；强竞争下自旋浪费 CPU，应快速挂起。
- 指标观测：结合 `jfr`/`jcmd`/`jstack` 分析锁竞争、阻塞热点，必要时调整锁粒度或采用无锁/分段策略。

