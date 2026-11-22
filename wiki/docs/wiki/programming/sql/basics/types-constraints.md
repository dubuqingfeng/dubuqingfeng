### 数据类型与约束

通用标量/时间/二进制类型与约束（主键/唯一/外键/检查）。

#### 要点
- 常见类型：整数/小数、定点/浮点、日期时间/时区、字符集/排序规则；
- 约束：`PRIMARY KEY`、`UNIQUE`、`FOREIGN KEY`、`CHECK`、`NOT NULL`、默认值；
- 标识列/自增：不同引擎的自增与序列；
- 字符集与排序：比较/索引前缀与大小写敏感。

#### 示例：主键与外键

```sql
CREATE TABLE customers (
  id BIGINT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE orders (
  id BIGINT PRIMARY KEY,
  customer_id BIGINT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  CONSTRAINT fk_orders_customer
    FOREIGN KEY (customer_id) REFERENCES customers(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);
```

注意：
- 金额用 `DECIMAL(p,s)` 避免二进制浮点误差；
- 时间存储 UTC + 时区，Postgres `TIMESTAMP WITH TIME ZONE`；
- 外键的 ON DELETE/UPDATE 策略依据业务一致性选择。
