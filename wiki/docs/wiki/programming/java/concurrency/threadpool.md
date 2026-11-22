### 线程池 ThreadPoolExecutor

#### ToC

- 核心参数与工作流程
- 任务提交流程与状态机
- 队列选择与拒绝策略
- 线程数配置与调优
- 常见坑与最佳实践

#### 核心参数与工作流程

`ThreadPoolExecutor(corePoolSize, maximumPoolSize, keepAliveTime, unit, workQueue, threadFactory, handler)`：

处理顺序（execute）：

1) 运行线程 < core → 直接新建工作线程执行任务；
2) 否则入队 `workQueue`；
3) 队列满且运行线程 < max → 新建线程；
4) 否则触发拒绝策略。

其他：

- `allowCoreThreadTimeOut(true)`：核心线程也会因空闲超时而回收；
- `prestartAllCoreThreads()`：预热核心线程。

#### 任务提交流程与状态机

内部用一个整型 `ctl` 打包线程数与运行状态：`RUNNING` → `SHUTDOWN` → `STOP` → `TIDYING` → `TERMINATED`。

- `execute(Runnable)`：抛异常式提交；
- `submit(Callable)`：返回 `Future`，异常包装在 `ExecutionException` 中；
- 关闭：`shutdown()`（有序，处理队列剩余任务） vs `shutdownNow()`（中断工作线程并返回剩余任务）。

#### 队列选择与拒绝策略

队列：

- 无界队列 `LinkedBlockingQueue`：易导致仅用到 core 线程，队列堆积；
- 有界队列 `ArrayBlockingQueue`：更可控，建议结合拒绝策略；
- 直通队列 `SynchronousQueue`：常与 `max>core` 配合用于突发流量（如 `CachedThreadPool`）。

拒绝策略（`RejectedExecutionHandler`）：

- `AbortPolicy`（默认，抛异常）、`CallerRunsPolicy`（调用方执行）、`DiscardPolicy`、`DiscardOldestPolicy`；推荐业务自定义埋点与降级。

#### 线程数配置与调优

经验公式（粗略）：

- CPU 密集：`core = CPU核数 + 1`；
- I/O 密集：`core ≈ CPU核数 * (1 + 阻塞时间/计算时间)`；
- 以响应时间为目标可测 `队列长度`、`任务处理时延`、`拒绝率` 来回调参数。

示例：

```java
int cores = Runtime.getRuntime().availableProcessors();
BlockingQueue<Runnable> q = new ArrayBlockingQueue<>(1000);
ThreadFactory tf = r -> { Thread t = new Thread(r); t.setName("biz-pool-"+t.getId()); return t; };
RejectedExecutionHandler h = new ThreadPoolExecutor.CallerRunsPolicy();
ThreadPoolExecutor pool = new ThreadPoolExecutor(cores, cores*2, 60, TimeUnit.SECONDS, q, tf, h);
pool.allowCoreThreadTimeOut(true);
```

#### 常见坑与最佳实践

- 不要使用 `Executors.newFixedThreadPool/newCachedThreadPool` 默认配置（无界队列/最大线程等风险），优先显式 `ThreadPoolExecutor`。
- 线程命名与 `UncaughtExceptionHandler` 便于排查；`submit` 的异常需要显式 `future.get()` 才能暴露。
- 结合 `Metrics/JFR` 观测：队列长度、活动线程、任务耗时、拒绝次数。
- 防止任务内阻塞外部资源（DB/缓存/HTTP）拖垮线程池，设置超时与隔离（如 Bulkhead）。

