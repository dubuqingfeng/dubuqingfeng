## 状态与 Merkle-Patricia Trie（MPT）

以太坊使用十六进制前缀压缩的 Merkle-Patricia Trie 存储：

- 账户状态（Account Trie）：`stateRoot`
- 存储（Storage Trie）：每个合约一个子 Trie，根挂在账户 `storageRoot`
- 交易列表与收据列表各自一棵 Trie（`transactionsRoot`、`receiptsRoot`）

### 账户对象（RLP）

`Account = { nonce, balance, storageRoot, codeHash }`

### 键与编码

- Trie 键：账户地址（20B）或 storage slot 的 Keccak-256 哈希
- Nibble 编码与 HP（Hex-Prefix）压缩：压缩连续分支以减小 Trie 高度
- 节点类型：分支节点（17 路）、扩展节点、叶子节点

### 证明（Proof）

- `eth_getProof`（EIP-1186）提供账户与存储的 MPT 证明，可在轻客户端验证

参考：Yellow Paper、EIP-1186

