### CompletableFuture 与异步编排

#### ToC

- 基本用法
- 线程池与上下文
- 组合与异常处理
- 最佳实践

#### 基本用法

```java
CompletableFuture<String> f = CompletableFuture.supplyAsync(() -> fetch());
CompletableFuture<Integer> g = f.thenApply(String::length);
int len = g.join();
```

常用方法：`thenApply/thenCompose/thenAccept/thenRun`、`allOf/anyOf`、`handle/exceptionally/whenComplete`。

#### 线程池与上下文

- 默认使用 `ForkJoinPool.commonPool()`；生产中建议传入业务线程池：`supplyAsync(task, executor)`；
- 注意线程上下文（如 MDC、ThreadLocal）在异步链路中的传递，需要包装 `Executor` 或使用支持上下文化的工具。

#### 组合与异常处理

- 组合：`thenCombine/thenAcceptBoth` 合并两个异步结果；`allOf` 等待全部完成；
- 异常：

```java
f.thenApply(this::parse)
 .exceptionally(ex -> fallback())
 .join();
```

- `handle` 同时处理成功/失败；`whenComplete` 观察但不改变结果。

#### 最佳实践

- 明确超时与取消：`orTimeout/completeOnTimeout/cancel`；
- 保持链路短小，避免阻塞操作塞进异步回调；
- 与 `ThreadPoolExecutor` 的队列与拒绝策略配合使用，避免压垮资源。

