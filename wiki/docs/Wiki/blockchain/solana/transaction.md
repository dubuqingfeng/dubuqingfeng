## Transaction

Solana 交易由“签名集合 + 消息（Message）”组成。签名覆盖消息字节，消息中包括账户列表、最近区块哈希、指令等信息。

### Legacy 与 v0 版本交易

- Legacy：无地址表；账户全在消息里。
- Versioned v0（推荐）：支持 Address Lookup Table（ALT）引用更多账户。

### Message 结构（要点）

- Header：`numRequiredSignatures`、`numReadonlySignedAccounts`、`numReadonlyUnsignedAccounts`
- AccountKeys：交易涉及的公钥（有序）
- RecentBlockhash：防重放、设定有效期
- Instructions：由若干 `programIdIndex + accountIndices + data` 组成

签名顺序与 `AccountKeys` 中前 `numRequiredSignatures` 个账户一一对应，均为 Ed25519 64 字节签名。

### 构建与发送（TypeScript）

```ts
import { Connection, Keypair, SystemProgram, PublicKey, LAMPORTS_PER_SOL, TransactionMessage, VersionedTransaction } from '@solana/web3.js'

const conn = new Connection('https://api.mainnet-beta.solana.com')
const from = Keypair.fromSecretKey(/* 64 bytes */)
const to = new PublicKey('...')

// 指令：转账 SOL
const ix = SystemProgram.transfer({ fromPubkey: from.publicKey, toPubkey: to, lamports: 0.01 * LAMPORTS_PER_SOL })

// v0 交易
const { blockhash } = await conn.getLatestBlockhash()
const msg = new TransactionMessage({
  payerKey: from.publicKey,
  recentBlockhash: blockhash,
  instructions: [ix],
}).compileToV0Message()

const tx = new VersionedTransaction(msg)
tx.sign([from])

const sig = await conn.sendTransaction(tx)
console.log('sig', sig)
```

### 地址表（ALT）

当单笔交易涉及账户很多时，可将“非签名账户”放入地址表，v0 消息引用地址表以扩展账户数量上限。

### 计算单元与优先费

- 计算单元（Compute Units, CU）：每条指令消耗 CU，有上限（默认 200k）。
- 可通过 Compute Budget 程序设置上限与优先费：

```ts
import { ComputeBudgetProgram } from '@solana/web3.js'

const cuIx = ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 })
const feeIx = ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 10_000 })
// 将 cuIx / feeIx 放在交易最前面以提高打包概率
```

### 常见错误与排查

- 账户未按程序要求的可写/只读/签名顺序组织 → 校验失败
- recentBlockhash 过期 → 交易被丢弃
- 未满足 rent-exempt 最低余额 → 创建账户失败
- 未设置足够 CU 或优先费 → 峰值时打包缓慢

