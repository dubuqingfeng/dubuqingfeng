---
title: ERC 标准与接口
---

常见 ERC 标准与关键接口方法。

- ERC-20：`totalSupply/balanceOf/transfer/transferFrom/approve/allowance`。
- ERC-721：`ownerOf/transferFrom/safeTransferFrom/approve/setApprovalForAll`，元数据扩展。
- ERC-1155：多代币标准，`safeTransferFrom/safeBatchTransferFrom`。
- EIP-2612（Permit）：无 Gas 授权签名，减少 `approve` 交互。
- EIP-712：结构化数据签名。

