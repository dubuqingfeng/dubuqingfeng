### 集合操作

`UNION/UNION ALL/INTERSECT/EXCEPT` 等集合运算及其语义与性能。

#### 要点
- `UNION` 去重、`UNION ALL` 保留重复；
- 各操作数列数与类型需对齐；
- `INTERSECT/EXCEPT` 的支持与替代改写（连接/子查询）；
- 排序与限制：整体外层 `ORDER BY`/`LIMIT`。

#### 示例：UNION 与排序

```sql
SELECT id, name FROM a
UNION ALL
SELECT id, name FROM b
ORDER BY id DESC
LIMIT 100;
```

大集合：尽量 `UNION ALL` 保留重复再上层去重；必要时物化到临时表并加索引。

窗口函数组合：在集合外层套用窗口函数进行排序/分页更高效。
