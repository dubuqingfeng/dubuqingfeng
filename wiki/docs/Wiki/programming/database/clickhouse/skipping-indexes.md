---
title: 跳过索引（minmax/bloom/ngram）
---

跳过索引用于快速跳过不匹配的数据块，减少 IO。常见类型：minmax、bloom_filter、set/ngrambf_v1。

## 示例：bloom_filter

```sql
CREATE TABLE t (
  user_id UInt64,
  tag String,
  INDEX idx_tag tag TYPE bloom_filter GRANULARITY 4
)
ENGINE = MergeTree ORDER BY user_id;
```

查询 `WHERE tag = 'x'` 时利用布隆过滤器快速排除。

## 适用场景

- 低选择性列不适合；文本搜索可用 ngram 索引配合 `LIKE '%abc%'`。

