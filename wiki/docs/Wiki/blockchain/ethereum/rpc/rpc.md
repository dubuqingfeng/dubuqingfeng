### JSON-RPC 常用接口

读取类：

- `eth_blockNumber`：最新区块高度
- `eth_getBalance`：账户余额
- `eth_getTransactionByHash`：交易详情
- `eth_call`：本地执行合约方法（只读）

交易类：

- `eth_sendRawTransaction`：广播已签名交易
- `eth_estimateGas`：估算调用所需 gas

区块与日志：

- `eth_getBlockByNumber`：区块信息
- `eth_getLogs`：按条件筛选事件日志

参考链接：

- https://ethereum.org/zh/developers/docs/apis/json-rpc/

