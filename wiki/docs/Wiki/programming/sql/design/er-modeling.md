### ER 建模与约束

实体/属性/关系建模，主外键与基数约束，演进与迁移策略。

#### 要点
- 一对一/一对多/多对多（联结表）；
- 可空性与约束表达：`NOT NULL`、`CHECK`、`FOREIGN KEY`；
- 变更与迁移：向前/向后兼容、蓝绿发布策略；
- 历史数据：审计字段与软删除。

#### 多对多（带关联属性）

```sql
CREATE TABLE students (id BIGINT PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE courses  (id BIGINT PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE enrollments (
  student_id BIGINT NOT NULL,
  course_id  BIGINT NOT NULL,
  enrolled_at TIMESTAMP NOT NULL,
  grade NUMERIC,
  PRIMARY KEY (student_id, course_id)
);
```

#### 架构演进策略

- 版本化迁移：先加列/双写/回填，再切换读路径，最后删除旧列；
- 回滚预案：保持向后兼容的读写，必要时灰度关闭新路径。
