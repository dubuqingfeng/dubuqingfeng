---
title: List 源码阅读（概览）
---

记录 Redis 列表（List）底层编码与常见操作复杂度，便于进一步深入源码。

## 编码与演进

- 旧版本：`ziplist`（紧凑存储）与 `linkedlist`（双端链表）。
- 新版本：`quicklist`（ziplist + 双向链表混合结构），兼顾内存与随机访问。

## 复杂度

- `LPUSH/RPUSH/LPOP/RPOP`：O(1)
- `LRANGE`：O(n)（范围长度）
- `LREM/LTRIM`：O(n)

## 使用建议

- 作为轻量队列（短任务）合适；大规模队列更建议 Stream。
- 避免超大列表与深度 `LRANGE`；分页读取控制单次返回量。
