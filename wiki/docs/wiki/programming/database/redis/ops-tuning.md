---
title: 运维与调优
---

关键监控、慢日志与常见调优方向。

## 关键监控

- QPS、延迟分布、连接数、`used_memory`、`evicted_keys`、`keyspace_hits/misses`。
- AOF/RDB 失败、重写状态与耗时；复制延迟与故障转移时间。

## 工具与命令

- `SLOWLOG GET`/`SLOWLOG LEN` 分析慢命令。
- `LATENCY DOCTOR`/`LATENCY GRAPH` 观察延迟尖刺。
- `INFO`、`MONITOR`（慎用）、`CLIENT LIST`。

## 调优建议

- 禁用或限制危险/全量扫描命令；设置合理 `client-output-buffer-limit`。
- 热点 Key 层级缓存（本地 + Redis）；避免大 Key 与大集合一次性操作。
- 合理的持久化策略与磁盘隔离，避免 fsync 峰值拖累。

