---
title: 升级与代理（UUPS/Transparent）
---

可升级合约的两种常见模式与注意事项。

## Transparent Proxy

- 通过 Proxy 委托调用实现合约；管理员与用户角色区分，避免函数选择器冲突。

## UUPS（EIP-1822）

- 升级逻辑由实现合约提供 `upgradeTo`；更轻量，但需要小心授权。

## 存储布局

- 升级不可改变已有变量顺序/类型；使用存储间隙保留空间。

## 工具

- OpenZeppelin Upgrades 插件、Foundry 的 `storage` 检查、手动布局审查。

