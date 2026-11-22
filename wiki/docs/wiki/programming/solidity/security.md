---
title: 安全与常见漏洞
---

典型安全问题、检测方法与修复建议。

- 重入攻击（Reentrancy）：使用 `ReentrancyGuard`、CEI 顺序、最小授权。
- 授权缺陷：`approve` 竞态、签名重放；使用 Permit、防重放域分隔与 nonce。
- 溢出/下溢：0.8+ 默认检查；历史代码注意使用 `SafeMath`。
- 初始化与代理：代理实现合约的 constructor 不会被调用；使用 `initializer`/UUPS 模式。
- 随机性与预言机：链上伪随机不可用；使用 VRF/预言机。
- 访问控制：`onlyOwner` 漏洞、Timelock、两步提权流程。

工具：Slither、Mythril、Echidna/Foundry fuzz、Audit 清单与测试覆盖。

## 重入攻击示例与修复

易受攻击合约：

```solidity
pragma solidity ^0.8.20;

contract Vault {
    mapping(address => uint256) public bal;
    function deposit() external payable { bal[msg.sender] += msg.value; }
    function withdraw() external {
        uint256 amt = bal[msg.sender];
        require(amt > 0);
        (bool ok,) = msg.sender.call{value: amt}("");
        require(ok);
        bal[msg.sender] = 0; // 脆弱：外部调用前未更新状态
    }
}
```

修复（CEI + ReentrancyGuard）：

```solidity
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
contract SafeVault is ReentrancyGuard {
    mapping(address => uint256) public bal;
    function deposit() external payable { bal[msg.sender] += msg.value; }
    function withdraw() external nonReentrant {
        uint256 amt = bal[msg.sender];
        require(amt > 0);
        bal[msg.sender] = 0; // 先 Effects 再 Interactions
        (bool ok,) = msg.sender.call{value: amt}("");
        require(ok);
    }
}
```
