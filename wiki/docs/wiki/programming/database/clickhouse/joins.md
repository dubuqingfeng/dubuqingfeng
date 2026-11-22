---
title: JOIN 策略与设置
---

ClickHouse 的 JOIN 语义与策略与传统数据库不同，需注意设置。

## 语义

- `ANY/ALL` 影响匹配与去重；默认 `ANY LEFT JOIN` 取第一条匹配记录。
- `join_use_nulls` 控制缺失列是否填充 NULL。

## 策略

- Hash/Grace/Partial Merge Join；受内存与 `join_algorithm` 设置影响。

## 小表广播

- 将小维表放入 `Distributed`/`Join` 引擎或 `SET`，实现本地哈希表广播。

