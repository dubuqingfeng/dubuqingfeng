## Programs（程序）

在 Solana 上，“程序”是部署的链上可执行代码（BPF），程序本身也有地址（公钥）。交易的指令以“调用某程序 + 传入账户与数据”的方式执行。

### 程序与账户角色

- 程序账户：只读可执行，不可变（升级受限于升级权限）。
- 数据账户：由程序创建/管理的状态账户（可读写）。
- 调用（CPI）：程序可在自身逻辑中调用其他程序。

### 常见系统程序

- System Program：创建账户、转账 SOL、分配空间、分配所有权等。
- Compute Budget Program：设置计算单元上限与优先费。
- Ed25519 Program：在链上验证 Ed25519 签名。
- Token Program / Token-2022 Program：代币标准逻辑。
- Associated Token Account Program：创建关联代币账户（ATA）。

在客户端使用时，尽量通过 SDK 常量引用程序地址，例如：

```ts
import { SystemProgram } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token'

console.log('System Program:', SystemProgram.programId.toBase58())
console.log('SPL Token Program:', TOKEN_PROGRAM_ID.toBase58())
console.log('ATA Program:', ASSOCIATED_TOKEN_PROGRAM_ID.toBase58())
```

### 升级与权限

- 使用“可升级加载器”（Upgradeable Loader）部署的程序可由“升级权限”进行升级。
- 主网生产环境建议在完成审计与验证后移除升级权限（或交给受信托的治理），避免单点风险。

### 常见错误与排查

- 账户未按程序要求的“可写/只读/签名”排列 → 指令执行失败
- 使用了错误的 Program Id（经典 Token 与 2022 混用）
- CPI 时未将被调用程序与相关账户加入本次交易的账户列表

