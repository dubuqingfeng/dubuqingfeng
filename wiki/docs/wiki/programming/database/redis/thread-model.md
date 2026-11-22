---
title: 线程模型与性能
---

Redis 的执行线程模型、I/O 线程、Pipeline 与慢命令影响范围。

## 单线程 + I/O 线程

- 主线程：网络请求解析与命令执行（键值读写）。
- I/O 线程（6.0+）：用于读写套接字，降低网络开销；命令执行仍在主线程。
- 后台线程：RDB/AOF 重写、异步删除等。

## Pipeline 与事务

- Pipeline：批量发送多条命令减少 RTT；注意单条慢命令仍会阻塞后续命令。
- MULTI/EXEC 事务：命令入队后原子执行；注意事务内单命令开销仍会阻塞。

## 慢命令与阻塞

- 慢命令如 `KEYS`、大 `SORT`、`SUNIONSTORE`、`ZUNIONSTORE` 等可能阻塞主线程。
- 优先使用基于前缀的集合/有序集合维护索引，避免全量扫描。
- 使用 `SLOWLOG`、`LATENCY DOCTOR` 分析延迟尖刺。

## 监控与诊断

- 关键指标：OPS、`used_memory`、`evicted_keys`、`blocked_clients`、`instantaneous_input_kbps` 等。
- 工具：`SLOWLOG GET`、`MONITOR`（慎用）、`INFO`、`latency` 系列命令。

