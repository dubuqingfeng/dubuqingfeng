---
title: 集群与高可用（Sentinel/Cluster）
---

对比 Sentinel 与 Cluster，说明槽迁移与运维要点。

## Sentinel（主从 + 自动故障转移）

- 监控主从、投票选主与通知客户端；不做数据分片。
- 与客户端/代理（如 Twemproxy、Redis Router）配合实现读写路由。

## Cluster（分片集群）

- 16384 槽（hash slot）分布在多主节点上；客户端按槽路由。
- 迁移：`CLUSTER SETSLOT`/`MIGRATE`，支持无损重分片；注意热键与均衡。

## 实务要点

- Cluster 建议使用支持重定向（MOVED/ASK）的客户端。
- 高可用：合理副本数、故障转移超时配置；跨机架/可用区部署。
- 热点与大 Key 管控：拆分集合、分层聚合，避免单槽瓶颈。

