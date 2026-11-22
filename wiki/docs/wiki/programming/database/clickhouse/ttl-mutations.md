---
title: TTL/Mutation 与删除
---

MergeTree 支持 TTL 定期过期与 Mutation 在线修改/删除。

## TTL

```sql
ALTER TABLE t MODIFY TTL ts + INTERVAL 30 DAY;
```

## Mutation 删除

```sql
ALTER TABLE t DELETE WHERE ts < now() - INTERVAL 90 DAY;
```

- 删除会触发后台合并与重写；大量删除建议分批。

