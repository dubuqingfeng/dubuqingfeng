---
title: 测试与工具链（Foundry/Hardhat）
---

本地开发、测试、部署与调试工具简表。

## Foundry

- forge + cast，原生 Solidity 测试与 Fuzz。
- 示例：
```bash
forge init myproj && cd myproj
forge test -vv
```

配置与示例测试：

```toml
# foundry.toml
[profile.default]
src = 'src'
test = 'test'
ffi = true
```

```solidity
// test/Counter.t.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import 'forge-std/Test.sol';

contract Counter { uint256 public v; function inc() external { v++; } }

contract CounterTest is Test {
  Counter c;
  function setUp() public { c = new Counter(); }
  function test_inc() public { c.inc(); assertEq(c.v(), 1); }
}
```

## Hardhat

- TypeScript 生态、Ethers.js、插件丰富。
- 示例：
```bash
npm init -y && npm i --save-dev hardhat
npx hardhat test
```

## 其他

- Anvil/Hardhat Network 本地链、OpenZeppelin 合约库、solhint/solfmt。
