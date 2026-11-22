### ABI 编码要点

- 函数选择器：方法签名（如 `transfer(address,uint256)`）做 Keccak-256，取前 4 字节。
- 参数编码：静态类型 32 字节对齐；动态类型（如 bytes/string/数组）存储偏移与长度。
- 事件主题：`topic0` 通常为事件签名哈希，其余为 indexed 参数。

参考链接：

- https://docs.soliditylang.org/en/latest/abi-spec.html
- https://ethereum.org/zh/developers/docs/abi-encoding/

