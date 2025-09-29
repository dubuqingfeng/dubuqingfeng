---
title: 内存与淘汰策略
---

内存管理、碎片与淘汰策略配置。

## 淘汰策略（maxmemory-policy）

- `noeviction`：内存不足时报错；写不再被接受。
- `allkeys-lru`/`volatile-lru`：基于 LRU 淘汰（全键/仅带 TTL）。
- `allkeys-lfu`/`volatile-lfu`：基于 LFU 淘汰。
- `allkeys-random`/`volatile-random`：随机淘汰。

示例：
```conf
maxmemory 8gb
maxmemory-policy allkeys-lru
active-defrag yes
```

## 碎片与观察

- 关注 `mem_fragmentation_ratio`、大 Key、过多小对象；必要时使用 `MEMORY DOCTOR`。
- 大对象拆分与结构选择（Hash/Ziplist 编码）减少开销。

