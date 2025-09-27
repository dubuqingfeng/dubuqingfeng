## 最小验证器（从零到一）

目标：实现可校验区块头与 PoW、同步 headers、验证区块体结构与 Merkle，逐步扩展到 TX/UTXO、SegWit、Taproot。

### 第一阶段：区块头与 PoW

- 解析 header、校验 `Hash256(header) <= target(bits)`
- headers-first 同步：`getheaders/headers` 与 checkpoint/assumevalid

### 第二阶段：区块体与 Merkle

- 解析交易与 Merkle 根，验证与 header 一致
- 处理见证承诺与 coinbase（BIP141）

### 第三阶段：交易与脚本

- 实现脚本引擎（先 P2PKH），校验签名（ECDSA）
- UTXO 集合与连接/断开区块（支持重组）

### 第四阶段：SegWit 与权重

- BIP143 摘要、witness 校验、区块权重与 vbytes 计算
- 中继策略与 mempool 结构（基础）

### 第五阶段：Taproot/Tapscript

- BIP340 Schnorr、key-path/script-path、control block 校验
- Tapscript 限制与 CHECKSIGADD

### 工程要点

- 持久化：block index + chainstate（LevelDB/RocksDB）
- 缓存：UTXO cache 与写批处理；裁剪模式
- 测试：fuzz/属性测试覆盖序列化与脚本边界

