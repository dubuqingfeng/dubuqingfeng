---
title: InnoDB 缓冲池与页结构
---

缓冲池（Buffer Pool）是 InnoDB 性能核心，缓存数据页与索引页。

## 页与段

- 页大小默认 16KB，包含页头、记录、空闲空间与目录。
- 段（extent）= 1MB（64 页），管理空间分配与回收。

## LRU 与自适应哈希索引（AHI）

- LRU 淘汰：新页插入到 mid 点避免预热污染；顺序扫描避免挤出热点。
- AHI：对热点 B-Tree 访问构建哈希加速；可能引入额外开销与锁竞争，可按需关闭。

## 刷新与检查点

- 刷脏（flush）由后台线程完成，受 `innodb_flush_neighbors`、`innodb_io_capacity` 影响。
- 检查点将脏页持久化，与 Redo 共同决定恢复时间。

## 监控与调优

- 命中率、脏页比例、刷新速率、`Read Ahead` 命中。
- 分配多个 buffer pool 实例：`innodb_buffer_pool_instances`（大内存下减少锁争用）。

