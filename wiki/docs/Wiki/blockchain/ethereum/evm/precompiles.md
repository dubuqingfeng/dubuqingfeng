## 预编译合约（Precompiles）

为高成本的密码学运算提供固定地址的“合约内建实现”，降低 gas 成本：

- `0x01` ecrecover（椭圆曲线公钥恢复）
- `0x02` sha256
- `0x03` ripemd160
- `0x04` identity（拷贝）
- `0x05` modexp（大数模幂）
- `0x06`、`0x07`、`0x08` alt_bn128（加/标量乘/配对）
- `0x09` blake2f（压缩函数）

成本随硬分叉调整（如 Byzantium、Istanbul）。调用方式与普通合约一致，但地址固定、无代码存储。

