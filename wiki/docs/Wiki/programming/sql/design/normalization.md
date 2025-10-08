### 范式与反范式

从 1NF/2NF/3NF/BCNF 到适度反范式化，在读写性能与一致性间权衡。

#### 要点
- 范式目标：消除冗余与更新异常；
- 反范式：冗余列/汇总表/物化视图；
- 主键选择：业务键 vs 代理键；
- 约束与完整性：外键、检查、触发器。

#### 案例：订单与明细

```sql
CREATE TABLE orders (
  id BIGINT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP NOT NULL
);
CREATE TABLE order_items (
  order_id BIGINT NOT NULL,
  sku TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  qty INT NOT NULL,
  PRIMARY KEY (order_id, sku)
);
```

#### 反范式同步

- 冗余列（如用户昵称）：通过触发器/应用层双写维护；
- 汇总表/物化视图：定时或增量刷新，提供读性能，明确一致性时效。
