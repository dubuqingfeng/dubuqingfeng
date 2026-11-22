## 合约创建：CREATE 与 CREATE2

### CREATE（传统）

- 合约地址：`addr = keccak(rlp(sender, nonce))[12:]`
- 流程：执行 init code，返回值作为 runtime code 存储；部署失败回滚

### CREATE2（EIP-1014）

- 合约地址：`addr = keccak(0xff || sender || salt || keccak(init_code))[12:]`
- 优势：
  - 地址可预测（与 nonce 无关），便于“先知晓地址再部署”
  - 工厂合约、重部署/升级等模式中常用

注意：同一 `sender+salt+init_code` 地址唯一；若已存在则创建失败。

