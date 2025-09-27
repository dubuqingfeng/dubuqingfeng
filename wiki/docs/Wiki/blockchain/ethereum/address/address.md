### 账户与地址

以太坊有两类账户：

- 外部账户（EOA）：由私钥控制，地址通过公钥计算得到（`0x` 开头的 20 字节）。
- 合约账户：由合约代码和状态组成，地址由创建者地址与 nonce 计算得到。

校验规则：EIP-55 提供了混合大小写校验（Checksum Address）。

常见要点：

- 地址长度 20 bytes（40 个十六进制字符），统一以 `0x` 前缀表示。
- EOA 通过私钥签名发起交易；合约账户不能主动发起交易，只能被调用。

参考链接：

- https://eips.ethereum.org/EIPS/eip-55
- https://ethereum.org/zh/developers/docs/accounts/

