---
title: 主键/排序键与稀疏索引
---

MergeTree 使用 `ORDER BY` 定义排序键并建立稀疏主索引；可与 `PRIMARY KEY` 分离（默认相同）。

## 稀疏索引

- 每 `index_granularity`（默认 8192 行）记录一个索引条目，提供范围跳转。
- 与跳过索引配合，减少不必要的列读取。

## 设计要点

- 将过滤条件中最常用且选择性高的列放前面；时间 + 维度常见。
- 过宽的 ORDER BY 会增大写入成本与索引体积。

## 示例

```sql
CREATE TABLE t (
  ts DateTime, id UInt64, value Float64
)
ENGINE = MergeTree
ORDER BY (ts, id)
SETTINGS index_granularity = 8192;
```

