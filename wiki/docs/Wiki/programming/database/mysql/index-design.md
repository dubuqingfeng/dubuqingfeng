---
title: 索引设计与最佳实践
---

如何设计高选择性、可覆盖的索引，并避免常见误区。

## 联合索引与最左前缀

- `idx(a,b,c)` 覆盖 `(a)`、`(a,b)`、`(a,b,c)` 三种前缀；`WHERE b=?` 不能独立命中。
- 谓词顺序不影响命中，但“等值优先，范围靠后”。

## 覆盖索引

- 查询只访问二级索引即可返回列，避免回表；`EXPLAIN Extra=Using index`。
- 典型：分页列表只返回 `id, created_at`，使用 `(created_at, id)` 联合索引。

## 前缀索引

- 对长字符串使用前缀索引节省空间：`INDEX idx_email (email(12))`。
- 注意选择性评估，过短影响过滤能力。

## 排序与分页（Seek 法）

```sql
-- 深分页避免 OFFSET N 的回收成本
SELECT id, created_at FROM t
WHERE created_at < ? OR (created_at = ? AND id < ?)
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

## 常见反模式

- 函数/隐式转换破坏索引：`WHERE DATE(ts)=...`；改为范围 `ts >= ? AND ts < ?`。
- 前导通配：`LIKE '%xxx'` 无法利用 B+ 树；考虑倒排、ES 或 ngram 辅助。
- 低选择性列单独建索引（如性别），意义不大。

