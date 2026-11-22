## SPL Token

SPL Token 是 Solana 上的代币标准（与以太坊的 ERC-20 类似）。常见概念：
- Mint（铸币合约账户）：记录总供给、精度（decimals）、铸造权限（mint authority）等。
- Token Account（代币账户）：持有人某个 mint 的余额账户。
- Associated Token Account（ATA）：钱包与某个 mint 的“推荐地址”，是一个唯一 PDA。

### 关联代币账户（ATA）

- 唯一性：由（owner、Token Program Id、mint）决定
- 由 ATA 程序创建并初始化为该 mint 的代币账户
- 不同 Token Program（经典版、2022）需使用对应的常量

```ts
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, getMint, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { PublicKey, SystemProgram } from '@solana/web3.js'

const owner = new PublicKey('...')
const mint = new PublicKey('...')
const ata = await getAssociatedTokenAddress(mint, owner)

// 创建 ATA（若不存在）
const createAtaIx = createAssociatedTokenAccountInstruction(
  /* payer */ owner,
  /* ata */ ata,
  /* owner */ owner,
  /* mint */ mint,
)
```

### 转账与铸币

```ts
import { createTransferInstruction, createMintToInstruction } from '@solana/spl-token'

// 从 fromATA 转至 toATA（同一 mint）
const transferIx = createTransferInstruction(fromATA, toATA, owner, 1_000n /* amount in base units */)

// 铸币（需要 mint authority）
const mintToIx = createMintToInstruction(mint, recipientATA, mintAuthority, 100_000n)
```

注意：`amount` 单位是“最小单位”，展示时需按 `decimals` 缩放。

### Token-2022

增强版 SPL Token（可选的转账费、冻结、利息等扩展）。使用 Token-2022 的程序常量与 API 与经典版不同，注意区分：
- Token-2022 Program Id 与 ATA Program Id 均不同于经典版
- 查询时可通过 `getMint()` 判定是否为 2022 扩展 mint

### 常见错误与排查

- ATA 与 Token Program 不匹配（经典版 vs 2022）
- 忘记创建 ATA 或初始化 → 余额查询/转账失败
- 忘记按 decimals 换算金额 → 展示/汇总错误
- 权限（mint authority、freeze authority）不正确 → 铸币/冻结失败

