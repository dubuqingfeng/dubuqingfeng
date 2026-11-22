### ForkJoinPool 与工作窃取

#### ToC

- 设计理念与适用场景
- RecursiveTask/RecursiveAction
- 工作窃取与并行度
- 与 ThreadPoolExecutor 的取舍
- 实战与坑点

#### 设计理念与适用场景

Fork/Join 面向“可拆分、可合并”的并行任务（分治），通过工作窃取提升 CPU 利用率。适合 CPU 密集型、递归/区间类计算；不适合大量阻塞 I/O。

#### 基本用法：RecursiveTask

```java
import java.util.concurrent.*;

class SumTask extends RecursiveTask<Long> {
  private static final int THRESHOLD = 10_000;
  final long[] arr; final int lo, hi;
  SumTask(long[] arr, int lo, int hi) { this.arr=arr; this.lo=lo; this.hi=hi; }
  @Override protected Long compute() {
    int len = hi - lo;
    if (len <= THRESHOLD) {
      long s = 0; for (int i=lo;i<hi;i++) s += arr[i]; return s;
    }
    int mid = lo + len/2;
    SumTask left = new SumTask(arr, lo, mid);
    SumTask right = new SumTask(arr, mid, hi);
    left.fork(); // 异步
    long r = right.compute(); // 当前线程继续右半
    long l = left.join();     // 等左半
    return l + r;
  }
}

ForkJoinPool pool = new ForkJoinPool();
long sum = pool.invoke(new SumTask(arr, 0, arr.length));
```

`RecursiveAction` 类似，但无返回值。

#### 工作窃取与并行度

- 每个工作线程维护双端队列（deque），本地 LIFO；空闲线程从他人队列尾部“窃取”；
- 并行度默认=CPU 核数；`new ForkJoinPool(parallelism)` 可自定义；
- `ForkJoinPool.commonPool()` 作为全局公共池，`CompletableFuture` 默认使用它。

#### 与 ThreadPoolExecutor 的取舍

- ForkJoin 偏向细粒度、递归任务；ThreadPool 更通用、适合 I/O 与显式队列；
- 避免在 ForkJoin 任务内执行长时间阻塞 I/O；如必须，使用 `ManagedBlocker`：

```java
ForkJoinPool.managedBlock(new ForkJoinPool.ManagedBlocker(){
  public boolean block() throws InterruptedException { /* 阻塞 I/O */ return true; }
  public boolean isReleasable() { return false; }
});
```

#### 实战要点

- 合理设置阈值（切分粒度），避免过度拆分或粒度过大；
- 递归树不平衡时可能产生偏斜，必要时随机拆分/分块；
- 与 `parallelStream()`：其底层通常用 commonPool；重度使用建议自建池避免干扰其他任务。

