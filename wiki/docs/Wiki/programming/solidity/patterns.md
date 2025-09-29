---
title: 合约设计模式
---

常见可复用的合约设计模式。

- Ownable/AccessControl：访问控制与角色管理。
- Pull over Push：避免在回调中转账，改为用户主动提取。
- Checks-Effects-Interactions：先检查，再状态变更，最后外部交互。
- Pausable/RateLimit：可暂停与速率限制保护。
- Minimal Proxy/Clone（EIP-1167）：批量部署节省 Gas。

