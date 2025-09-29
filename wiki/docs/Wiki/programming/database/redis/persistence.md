---
title: 持久化（RDB/AOF）
---

Redis 的两种主要持久化方式与加载顺序、关键参数与实践。

## RDB（快照）

- 周期性将内存数据写入压缩的快照文件（`dump.rdb`）。
- 触发方式：`save` 配置、`BGSAVE` 命令、关机时保存。
- 优点：文件紧凑、恢复快；缺点：可能丢失最近一次快照后的写入。

示例配置：
```conf
save 900 1
save 300 10
save 60 10000
rdbcompression yes
stop-writes-on-bgsave-error yes
```

## AOF（只追加文件）

- 将每次写命令追加到 AOF，支持 `appendfsync` 策略：`always`/`everysec`/`no`。
- AOF 重写：压缩历史（生成新 AOF），不影响服务。
- 优点：更高持久性；缺点：文件大、恢复较慢。

示例配置：
```conf
appendonly yes
appendfsync everysec
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
aof-use-rdb-preamble yes
```

## 加载顺序

1) AOF 开启且存在 AOF 文件：优先加载 AOF。
2) 否则加载 RDB。
3) 文件损坏：需修复（如 `redis-check-aof --fix`）或回退。

## 实践建议

- 生产常用 AOF everysec + RDB 组合；重启更安全，文件大小可控。
- 高写入峰值时关注 AOF fsync 带来的延迟波动；必要时隔离磁盘或调优。

