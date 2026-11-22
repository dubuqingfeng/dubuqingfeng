### ERC-20 标准

核心接口：

- `totalSupply()`、`balanceOf(address)`
- `transfer(address,uint256)`、`transferFrom(address,address,uint256)`
- `approve(address,uint256)`、`allowance(address,address)`
- 事件：`Transfer`、`Approval`

注意事项：

- 返回值兼容性（早期实现可能未显式返回 bool）。
- 避免竞态条件（approve/allowance 更新时的双花风险）。

参考链接：

- https://eips.ethereum.org/EIPS/eip-20

