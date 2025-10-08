### ORM 与迁移

迁移工具与 ORM 使用准则，控制演进风险与性能。

#### 要点
- 迁移：版本化/可回滚、向前兼容发布；
- ORM：N+1/懒加载/批量查询的控制；
- SQL 与 ORM 的取舍：复杂查询保留 SQL；
- Schema Drift 与一致性监控。

#### 迁移工具

- Flyway/Liquibase：SQL 优先、可审计；
- Prisma/TypeORM/Sequelize：模型驱动或 SQL 混合；
- 模板：版本化命名、`up`/`down` 明确、幂等检查（存在即跳过）。

#### 性能与可观测性

- 避免 N+1：查询构造或使用 `include`/`eager`；
- 批量/分页：`limit/offset` 或 keyset pagination；
- 打点：记录 SQL 与耗时，采样慢查询，落盘到日志/指标。
