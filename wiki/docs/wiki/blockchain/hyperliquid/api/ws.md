---
slug: "/Wiki/blockchain/hyperliquid/api/ws"
---
### WebSocket 订阅

客户端使用 `wss://api.hyperliquid.xyz/ws`，测试网为 `wss://api.hyperliquid-testnet.xyz/ws`。以下是公共读取订阅，不是发送订单；真实写请求另有动作签名协议。

```json
{"method":"subscribe","subscription":{"type":"orderUpdates","user":"0x0000000000000000000000000000000000000000"}}
```

```json
{"method":"subscribe","subscription":{"type":"userFills","user":"0x0000000000000000000000000000000000000000"}}
```

这里零地址仅展示形状，不能产生有效交易账户活动的验证结果。`orderUpdates.data` 是订单更新数组，含 `order/status/statusTimestamp`；`userFills.data` 包含 `user/fills`，初始时间序列快照可带 `isSnapshot=true`。应用应按实体去重并保留冲突，不能假定所有订阅有相同快照语义或全局递增序号。

固定 Python SDK 0.24.0 的 `WebsocketManager.run()` 仅启动 ping 线程并调用 `run_forever()`；锁定 `websocket-client 1.9.2` 默认 `RECONNECT=0`。SDK 不是完整账户恢复器，应用负责连接生命周期、活跃订阅重建及 REST 缺口核对。即便连接重新建立，也不能立即假定本地账已完整；同一 manager 的 `orderUpdates/userEvents` 多订阅受源码限制。

SDK 每 50 秒发送应用层 ping。官方规范说明服务端连续 60 秒未向连接发送消息会断开，可用 `{"method":"ping"}` 获得 `{"channel":"pong"}`。保活不提供消息持久化保证。

参见[签名与订单状态主文](../guides/orders.md#failures)中的固定源码、已执行 mock 核查和**合成**断线回放；本篇没有真实 WS 断线测试。规范：[订阅及类型](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions)、[心跳](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/timeouts-and-heartbeats)。
