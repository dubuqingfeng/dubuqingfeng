---
title: 语言基础与类型
---

Solidity 核心语法、类型系统与常见坑位概览。

## 合约与状态变量

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Counter {
    uint256 public value;
    function inc() external { value += 1; }
}
```

## 类型要点

- 值类型：`bool/int/uint/bytes<N>/address`。
- 引用类型：`string/bytes/dynamic array/mapping/struct`。
- storage/memory/calldata 三种数据位置；函数参数默认 `calldata`（external）。

## 函数可见性与修饰符

- `public/external/internal/private`；`view/pure/payable`。
- 自定义 `modifier` 合并前置条件与访问控制。

## 错误处理

- `require/revert/assert`；自定义 Error 节省 Gas：`error NotOwner();`。

