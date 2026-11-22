---
slug: "/Wiki/blockchain/hyperliquid/guides/query"
---
### 查询账户与持仓

查询实际交易账户，而非代签 API wallet。下面各项都走公共 `POST /info`，无需签名；coin、DEX 和网络必须与订单一致。

| 想知道什么 | `type` 与关键字段 | 能力边界 |
| --- | --- | --- |
| 当前还有哪些挂单 | `openOrders`，`user`，可选 `dex` | 缺席不等于已撤销或已成交 |
| 特定订单现在是什么状态 | `orderStatus`，`user`，`oid`（整数 oid 或 16-byte hex cloid） | 读取内层订单 status；外层 `unknownOid` 仍表示查询未知 |
| 最近成交与费用 | `userFills`，`user` | 捕获规范最多最近 2000 笔，不是无限历史 |
| 断线时间段的成交 | `userFillsByTime`，`user/startTime`，可选 `endTime/aggregateByTime` | 每响应最多 2000，最近最多 10000；边界 inclusive，重叠去重并检测分页停滞 |
| perp 仓位与保证金视图 | `clearinghouseState`，`user`，可选 `dex` | `assetPositions[].position` 的 coin、szi、entryPx 等与挂单分开；spot 余额用另一端点 |

```json
{"type":"orderStatus","user":"0x0000000000000000000000000000000000000000","oid":"0x00000000000000000000000000000001"}
```

`orderStatus` 成功查询的外层可为 `{"status":"order","order":{...}}`，其内还有 `order/status/statusTimestamp`；不要只读外层 status。返回 `{"status":"unknownOid"}` 不能证明某次发送从未执行。查询需要保留先前 intent、cloid/oid 对应关系，再结合 fills 与当前仓位判断。

仓位字段中的 `szi` 是有符号数量，`entryPx` 可为空；`unrealizedPnl`、`marginUsed`、`liquidationPx` 等应保留原始 decimal 和查询时间，不能套用其他协议的精度或风险公式。将订单总量直接当作已成交仓位会高估敞口，撤销剩余挂单也不会撤销已成交部分。

恢复流程及按账户/DEX/coin、订单和 fill 分别去重的策略见[完整对账与回放](./orders.md#failures)。规范为[官方 info endpoint](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint)，捕获时间为北京时间 2026-11-20；服务端字段及窗口可能改变。
