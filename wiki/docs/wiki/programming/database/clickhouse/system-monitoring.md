---
title: 系统表与监控
---

通过 `system.*` 表与 settings 监控运行状态与查询资源。

## 常用系统表

- `system.parts`：表部件状态。
- `system.merges`/`system.mutations`：后台合并与变更。
- `system.query_log`/`system.query_thread_log`：查询与线程明细。
- `system.metrics`/`asynchronous_metrics`：运行时指标。

## 查询限制与资源

- 每查询设置：`max_threads`、`max_memory_usage`、`max_bytes_before_external_group_by` 等。
- 用户/角色资源：`SETTINGS PROFILE`、`RBAC` 配额与限制。

