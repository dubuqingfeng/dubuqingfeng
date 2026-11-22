---
title: "Java：Flink"
slug: /wiki/programming/java/flink
---

# Java：Flink

Flink 的核心是“有状态的流处理”：数据按事件时间推进，状态被 checkpoint 持久化，失败后从 checkpoint 恢复并保证（在正确配置下）精确一次。

这篇文章按“模型 → 时间/水位线 → 状态/checkpoint → 窗口 → 反压 → 部署 → 排障”的顺序，给出最小可用配置和常见坑。

## 1. 流处理模型 {#model}

```java
StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();
env.enableCheckpointing(60_000);

DataStream<Event> events = env.fromSource(
    source,
    WatermarkStrategy.<Event>forBoundedOutOfOrderness(Duration.ofSeconds(5))
        .withTimestampAssigner((e, ts) -> e.eventTimeMillis()),
    "events"
);

events
    .keyBy(Event::userId)
    .window(TumblingEventTimeWindows.of(Time.minutes(1)))
    .sum("amount")
    .addSink(sink);

env.execute("minute-aggregation");
```

- Source → Transformation → Sink；`keyBy` 决定后续状态按 key 分区。
- 算子并行度由 `env.setParallelism`、算子级 `setParallelism` 或集群默认值决定。
- 有状态算子要开启 checkpoint；无状态任务也不能忽略失败恢复策略。

## 2. 事件时间、水位线与迟到数据 {#time}

| 时间语义 | 含义 | 适用 |
| --- | --- | --- |
| Event time | 事件自带时间戳 | 可重放、乱序、结果可复现 |
| Processing time | 算子处理时的系统时间 | 低延迟、结果依赖运行时刻 |
| Ingestion time | 进入 Flink 的时间 | 介于两者之间 |

水位线（watermark）表示“事件时间小于等于 W 的数据大概率已经到齐”。`forBoundedOutOfOrderness(5s)` 表示容忍 5 秒乱序。

迟到数据：

```java
.window(TumblingEventTimeWindows.of(Time.minutes(1)))
.allowedLateness(Time.seconds(30))
.sideOutputLateData(lateTag);
```

> **边界：** `allowedLateness` 会保留窗口状态更久，增加状态和 checkpoint 体积；不要无限放大。

## 3. 状态与 checkpoint {#state}

常见状态：

- `ValueState`、`ListState`、`MapState`、`ReducingState`、`AggregatingState`；
- 只在 `KeyedStream` 上可用（`keyBy` 之后）；
- 通过 `RuntimeContext` 或 `KeyedProcessFunction` 访问。

```java
public class DedupFunction extends KeyedProcessFunction<String, Event, Event> {
    private transient ValueState<Boolean> seen;

    @Override
    public void open(Configuration parameters) {
        seen = getRuntimeContext().getState(
            new ValueStateDescriptor<>("seen", Boolean.class)
        );
    }

    @Override
    public void processElement(Event value, Context ctx, Collector<Event> out)
            throws Exception {
        if (seen.value() == null) {
            seen.update(true);
            out.collect(value);
        }
    }
}
```

Checkpoint 配置：

```java
env.enableCheckpointing(60_000, CheckpointingMode.EXACTLY_ONCE);
env.getCheckpointConfig().setMinPauseBetweenCheckpoints(30_000);
env.getCheckpointConfig().setCheckpointTimeout(10 * 60_000);
env.getCheckpointConfig().setMaxConcurrentCheckpoints(1);
env.getCheckpointConfig().setExternalizedCheckpointCleanup(
    ExternalizedCheckpointCleanup.RETAIN_ON_CANCELLATION
);
```

- Checkpoint 存到可靠存储（HDFS/S3/OSS），不要只放本地磁盘。
- Savepoint 用于有计划的升级/迁移；升级前先触发 savepoint。
- 状态后端（RocksDB/HashMap）决定状态大小、吞吐和恢复时间。

## 4. 窗口 {#windows}

| 窗口 | 语义 | 示例 |
| --- | --- | --- |
| Tumbling | 固定长度、不重叠 | 每分钟 |
| Sliding | 固定长度、可重叠 | 每 1 分钟，滑动 10 秒 |
| Session | 按活动间隔切分 | 30 分钟无事件则关闭 |
| Global | 自定义触发 | 配合 `Trigger` |

```java
stream
  .keyBy(Event::userId)
  .window(SlidingEventTimeWindows.of(Time.minutes(5), Time.seconds(30)))
  .aggregate(new CountAggregate(), new WindowResultFunction());
```

窗口性能取决于 key 基数、窗口长度、状态后端和迟到数据策略。key 基数过大时，窗口状态会膨胀。

## 5. 反压与并行度 {#backpressure}

反压不是故障，而是下游处理不过来。Flink Web UI 的反压面板会标记 `HIGH`：

- 先看下游 sink/外部系统是否变慢（数据库、Kafka、HTTP）；
- 再看数据倾斜：某个 subtask 的 `busy`/`backpressured` 明显高于其他；
- 调整并行度、拆分 key、批量写入、异步 IO；
- 不要盲目加并行度：source/sink 的外部瓶颈不会因为并行度增加而消失。

```java
// 异步维表查询，避免阻塞主流程
AsyncDataStream.unorderedWait(stream, new AsyncDimJoin(), 5, TimeUnit.SECONDS, 100);
```

## 6. 部署与升级 {#deploy}

| 模式 | 适用 | 注意 |
| --- | --- | --- |
| Session cluster | 多任务共享集群 | 资源隔离弱，单任务故障可能影响其他任务 |
| Per-job cluster | 一任务一集群 | 隔离好，启动稍慢 |
| Application mode | 主函数在集群内执行 | 适合 K8s/生产 |
| Kubernetes Operator | 声明式管理 | 关注 savepoint、升级策略、PVC |

升级流程：

1. 停止摄入或切换双写；
2. 触发 savepoint；
3. 用新版本从 savepoint 恢复；
4. 校验状态、输出和 offset；
5. 切回流量。

## 7. 常见故障 {#troubleshooting}

| 现象 | 先看什么 | 常见原因 |
| --- | --- | --- |
| Checkpoint 超时 | Web UI Checkpoints、日志 | 状态太大、反压、外部存储慢 |
| Checkpoint 失败 | `checkpointDir`、权限、网络 | 存储不可写、超时、并发 checkpoint |
| 反压 HIGH | 反压面板、subtask 指标 | sink 慢、数据倾斜、同步 IO |
| 水位线不推进 | source 分区、idle 分区 | 某分区无数据、`withIdleness` 未配置 |
| 数据倾斜 | 各 subtask 记录数/busy | key 分布不均、热点 key |
| 恢复后重复/丢失 | checkpoint/savepoint、sink 幂等 | 非 exactly-once sink、offset 提交不一致 |
| 任务重启循环 | `restart-strategy`、异常栈 | 外部依赖不可用、序列化错误、状态不兼容 |

## 8. 安全与运维 {#security}

- Flink Web UI 默认可能无认证；不要直接暴露公网，放在内网/反向代理 + 认证之后。
- Checkpoint/Savepoint 存储要有访问控制和生命周期策略；它们包含完整状态。
- 序列化器/用户代码来自作业 jar；只运行可信代码，限制上传权限。
- 指标接入 Prometheus，监控 checkpoint 时长/失败率、反压、延迟、重启次数。
- 升级前验证状态兼容性（serializer/schema）。

## 9. 最小检查清单 {#checklist}

- [ ] 有状态任务开启 checkpoint，存储到可靠文件系统。
- [ ] 明确事件时间/处理时间语义，配置水位线和 idle 分区。
- [ ] 迟到数据有 `allowedLateness` 或 side output，不无限保留状态。
- [ ] 关键 sink 幂等或支持两阶段提交。
- [ ] 升级走 savepoint，验证状态兼容。
- [ ] 监控 checkpoint、反压、延迟、重启和倾斜。
- [ ] Web UI 不暴露公网；作业 jar 来源可信。

## 相关阅读 {#related}

- [Java](./../README.md)
- [Java：并发](./../concurrency/thread.md)
- [Flink 官方文档](https://nightlies.apache.org/flink/flink-docs-stable/)
- [运维与交付](../../../devops/README.md)
