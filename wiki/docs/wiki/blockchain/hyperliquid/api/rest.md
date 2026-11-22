---
slug: "/Wiki/blockchain/hyperliquid/api/rest"
---
### REST API

本页与[下单、签名和对账源码样板](../guides/orders.md)配套，基线为 Python SDK 0.24.0；动态接口规范捕获于北京时间 2026-11-20。

| 入口 | 用途 | 本篇涉及的权限 |
| --- | --- | --- |
| `POST /info` | `meta`、`openOrders`、`orderStatus`、`userFillsByTime`、`clearinghouseState` 等公共读取 | 这些查询传实际账户地址，无需账户签名 |
| `POST /exchange` | 下单、撤单及其他状态修改动作 | 按具体动作构造签名、nonce、目标账户与可用有效期 |

HTTP 使用 POST 不表示它一定写状态，也不表示查询账户必须鉴权。查询应使用实际主账户、子账户或 vault 地址，不能因为 API wallet 代签就查询 agent 地址。

下单响应要依次检查 HTTP、外层 `status`、`response.type`、`data.statuses` 的每项与输入对应关系。`resting`、`filled`、`error` 可表达不同结果；外层 `ok` 不代表批量全部成功。普通 SDK 方法返回解码对象，由业务方解析并持久化。

网络超时应记为未知结果，保留已签名 envelope 与本地意图，用 cloid/oid [查询](../guides/query.md)后再决定下一步。换 nonce 重发可能再创建订单，重复 nonce 也不是“保证返回原响应”的幂等接口。

精度、nonce、账户角色与 L1/user-signed 的 domain 见[实际签名路径](../guides/orders.md#source)，速率限制、历史保留窗口等参数以当前[官方 info](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint)和[exchange 规范](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint)核对。本篇只读采样与离线实验不验证真实签名订单被接受。
