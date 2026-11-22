---
title: MongoDB
slug: /wiki/programming/database/mongodb
---

# MongoDB

MongoDB 的“文档”不是 JSON 文本，而是 BSON。理解这一点，很多行为就顺了：字段有类型、数字有宽度、`ObjectId` 有固定结构，索引保存的是 BSON 字段的编码值，而不是字符串。

这篇文章按“写入 → 读取 → 索引 → 复制/分片 → 安全 → 排障”的顺序，给出最小但够用的心智模型和可执行命令。

## 1. 数据模型：文档、集合、BSON {#model}

| 概念 | 说明 | 常见误区 |
| --- | --- | --- |
| 文档 | 一条 BSON 记录，最大 16 MiB | 把 MongoDB 当“无模式”，实际仍有字段类型和索引约束 |
| 集合 | 文档的容器，不强制统一 schema | 集合名、索引、分片键一旦确定，后续修改成本高 |
| `ObjectId` | 12 字节：4 字节时间戳 + 5 字节随机值 + 3 字节计数器 | 不是全局严格递增，不要当业务序号 |
| BSON | 二进制编码，支持 `int32/int64/double/decimal128/date` 等 | 用浮点数存金额会丢精度，金额用 `Decimal128` 或整数分 |

```js
// 金额用 Decimal128，避免 double 精度问题
db.orders.insertOne({
  tenantId: "t1",
  amount: NumberDecimal("19.99"),
  createdAt: new Date()
});
```

## 2. 写路径：单文档原子性与 write concern {#write}

MongoDB 的单文档更新是原子的；多文档事务需要副本集（4.0+）或分片集群（4.2+）。

```js
db.orders.insertOne(
  { tenantId: "t1", status: "paid", amount: NumberDecimal("19.99") },
  { writeConcern: { w: "majority", j: true, wtimeout: 5000 } }
);
```

- `w: 1`：主节点确认即返回，故障切换时可能回滚。
- `w: "majority"`：多数节点确认，抗单点故障。
- `j: true`：写入 journal 后才确认，掉电恢复更稳。
- `wtimeout`：避免写请求无限等待；超时后客户端要能重试或对账。

> **边界：** `w: "majority"` 不是“绝对不丢”。它保证已被多数确认的写入在选举后仍在；如果客户端在超时后重试，仍需要业务幂等键。

## 3. 读路径：read concern 与 read preference {#read}

| 配置 | 行为 | 适用 |
| --- | --- | --- |
| `readPreference: "primary"` | 只读主节点 | 强一致读、写完立即读 |
| `"primaryPreferred"` | 主节点不可用时读从节点 | 高可用优先 |
| `"secondary"` | 只读从节点 | 报表、离线分析，可能读到旧数据 |
| `readConcern: "local"` | 读节点本地最新数据 | 默认，性能最好 |
| `"majority"` | 只读多数已确认的数据 | 避免读到可能回滚的数据 |
| `"linearizable"` | 线性一致读 | 代价高，仅特殊场景 |

```js
db.orders.find({ tenantId: "t1" })
  .readPref("secondaryPreferred")
  .readConcern("majority");
```

## 4. 索引：先看 ESR，再看覆盖 {#index}

复合索引的字段顺序决定可用性。经验规则 **ESR**：

1. **E**quality：等值过滤字段放最前；
2. **S**ort：排序字段其次；
3. **R**ange：范围过滤字段最后。

```js
db.orders.createIndex({ tenantId: 1, status: 1, createdAt: -1 });

db.orders.find({ tenantId: "t1", status: "paid" })
  .sort({ createdAt: -1 })
  .explain("executionStats");
```

看 `executionStats` 时重点看：

- `totalKeysExamined` 与 `totalDocsExamined` 是否接近返回条数；
- 是否出现 `COLLSCAN`；
- 是否 `SORT` 在内存中做（`stage: "SORT"`），而不是走索引顺序；
- `rejectedPlans` 里是否有更优计划。

覆盖查询（covered query）要求查询字段和返回字段都在索引里，且不返回 `_id`：

```js
db.orders.find(
  { tenantId: "t1", status: "paid" },
  { _id: 0, createdAt: 1 }
).hint({ tenantId: 1, status: 1, createdAt: -1 });
```

> **注意：** 索引不是越多越好。每个索引都会增加写放大、内存占用和选举后的重建成本。先定位慢查询，再建索引。

## 5. 复制集与分片 {#replication}

**复制集（replica set）** 是最小生产形态：

- 一个 primary 接收写，多个 secondary 通过 oplog 复制；
- 多数派选举，建议 3 个投票节点；
- 从节点可配置 `priority: 0`、`hidden: true` 用于备份/报表；
- oplog 是固定大小的 capped collection，窗口不够会导致从节点无法追上。

```js
rs.status();
db.getSiblingDB("local").oplog.rs.stats().maxSize;
```

**分片（sharding）** 解决单机容量/写入瓶颈：

- 分片键决定数据分布；低基数、单调递增的键容易形成热点；
- 使用哈希分片键可以打散写入，但范围查询会变成广播；
- chunk 迁移、balancer 窗口、`mongos` 路由层都需要监控。

> **选型顺序：** 先做复制集 + 索引优化；只有单集合数据量/写入确实超过单机边界时再分片。分片不是“性能开关”。

## 6. 安全：认证、TLS、最小权限 {#security}

最小生产配置：

```yaml
net:
  bindIp: 127.0.0.1
  port: 27017
  tls:
    mode: requireTLS
    certificateKeyFile: /etc/mongo/server.pem
    CAFile: /etc/mongo/ca.pem
security:
  authorization: enabled
  keyFile: /etc/mongo/keyfile
```

- **不要**把 27017 直接暴露到公网；需要远程访问时走 VPN、堡垒机或反向代理。
- 开启 `authorization` 后创建最小权限用户：

```js
db.getSiblingDB("admin").createUser({
  user: "app",
  pwd: passwordPrompt(),
  roles: [{ role: "readWrite", db: "shop" }]
});
```

- 内部节点认证用 keyfile 或 x509；副本集/分片集群不要用无认证的内网信任。
- 审计、慢查询、连接数、oplog 窗口、磁盘水位都要有监控。
- 备份账号与业务账号分离；恢复演练比备份本身更重要。

## 7. 备份与恢复 {#backup}

| 方式 | 优点 | 边界 |
| --- | --- | --- |
| `mongodump` / `mongorestore` | 逻辑备份，跨版本方便 | 大库慢；需要 `--oplog` 才能一致 |
| 文件系统/云盘快照 | 快，适合大库 | 必须停写或保证快照一致性 |
| oplog 重放 | 可做时间点恢复 | 依赖 oplog 窗口和起始全量备份 |

```bash
mongodump --uri="mongodb://backup@127.0.0.1:27017/?authSource=admin" \
  --oplog --gzip --out=/backup/$(date +%F)
```

> **恢复顺序：** 先恢复全量，再重放 oplog 到目标时间点；恢复后校验集合数量、索引、文档数和关键业务对账。

## 8. 常见故障与排查 {#troubleshooting}

| 现象 | 先看什么 | 常见原因 |
| --- | --- | --- |
| 连接数暴涨 | `db.serverStatus().connections` | 客户端未复用连接、连接池过大、慢查询占住连接 |
| 写入变慢 | `db.currentOp()`、慢查询日志 | 缺索引、锁竞争、磁盘 IO、write concern 过高 |
| 从节点延迟 | `rs.printSecondaryReplicationInfo()` | oplog 窗口不足、网络、从节点资源不足 |
| 分片不均 | `sh.status()`、chunk 分布 | 分片键热点、balancer 关闭、迁移失败 |
| 磁盘满 | `db.stats()`、`df -h` | 日志、oplog、索引膨胀、未清理的旧数据 |

## 9. 最小检查清单 {#checklist}

- [ ] 生产使用复制集，至少 3 个投票节点。
- [ ] 业务写入使用 `w: "majority"`，关键写加 `j: true`。
- [ ] 金额用 `Decimal128` 或整数分，不用 `double`。
- [ ] 慢查询有索引；复合索引按 ESR 设计。
- [ ] 27017 不暴露公网；开启认证与 TLS。
- [ ] 业务账号最小权限；备份账号独立。
- [ ] 监控连接数、oplog 窗口、磁盘、复制延迟。
- [ ] 定期做恢复演练，而不是只做备份。

## 相关阅读 {#related}

- [数据库索引](./../README.md)
- [MySQL](./../mysql/README.md)
- [Redis](./../redis/README.md)
- [ClickHouse](./../clickhouse/README.md)
