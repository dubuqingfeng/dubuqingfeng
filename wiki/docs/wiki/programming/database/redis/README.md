---
title: Redis
slug: /wiki/programming/database/redis
---

这里整理 Redis 的数据结构、持久化、并发模型与工程实践，便于快速导航。

## 数据结构与编码

- 常用结构：String、List、Hash、Set、ZSet、Bitmap、HyperLogLog、Bloom/CF
- 源码阅读：[List 列表](./source/list.md)

## 持久化

- [RDB/AOF 与加载顺序](./persistence.md)
- 面试要点与常见问答：[interview](./interview/interview.md)

## 并发与线程模型

- [线程模型与性能](./thread-model.md)

## 一致性与缓存模式

- [缓存模式与一致性策略](./consistency-cache.md)

## 分布式能力

- [分布式锁（Redlock）](./distributed-lock.md)
- [分布式限流（Redis-Cell）](./rate-limiting.md)

## 集群与高可用

- [Sentinel 与 Cluster](./cluster-ha.md)

## 内存与淘汰策略

- [内存管理与淘汰策略](./memory-eviction.md)

## 运维与调优

- [运维与调优](./ops-tuning.md)

按需补充子页面，保持与 Go/Rust 目录组织一致。
