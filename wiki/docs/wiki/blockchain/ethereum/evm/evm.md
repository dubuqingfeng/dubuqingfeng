### EVM 执行模型

EVM 是 256 位字的栈式虚拟机。执行以“消息调用（message call）”为单位，在调用帧中维护栈、内存、程序计数器与剩余 gas。

#### 执行上下文

- 栈（Stack）：最大 1024 深；操作数与临时值
- 内存（Memory）：按字节寻址的可线性扩展的临时区；按 32 字节计费并有扩展成本
- 存储（Storage）：每合约账户独立的持久化 KV（256-bit→256-bit），SLOAD/SSTORE 成本高
- Calldata：只读、不可变的输入数据；返回数据（Return data）用于跨调用传递输出

#### 调用与合约创建

- CALL、CALLCODE、DELEGATECALL、STATICCALL：外部调用与委托调用（共享或隔离上下文）
- CREATE/CREATE2：执行 init code，返回 runtime code；CREATE2 地址可预测

#### 控制流与异常

- STOP、RETURN、REVERT（不消耗所有剩余 gas）、SELFDESTRUCT（退款受限）
- 异常（如栈下溢/越界）触发回滚并消耗剩余 gas

#### Gas 与成本

- 指令、内存扩展、哈希/拷贝、外部访问、存储读写等分别计费
- 冷/热访问（EIP-2929）：首次访问账户/slot 成本更高

#### 代码与字节码

- 合约代码为字节码；PUSH/POP/算术/逻辑/环境/存储/调用/系统等指令集
- `CODECOPY`/`EXTCODEHASH`/`EXTCODECOPY` 涉及代码访问与哈希

#### 参考链接

- https://eth.wiki/en/concepts/evm/ethereum-virtual-machine-(evm)-awesome-list
- Yellow Paper: https://ethereum.github.io/yellowpaper/paper.pdf
