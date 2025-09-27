## PDA（Program Derived Address）

PDA 是“程序派生地址”，通过（若干 seeds + bump + programId）确定且不可由私钥签名（off-curve）。常用于：金库、配置账户、用户态状态账户等。

### 特性

- 不可签名：PDA 没有对应私钥，不能在交易中直接签名。
- 稳定可重现：相同 seeds + programId 导出同一地址。
- 安全隔离：off-curve 以避免与真实公钥冲突。

### 约束

- 最多 16 个 seed；每个 seed 最长 32 字节。
- `bump` 为 0~255 的单字节，通过遍历寻找一个 off-curve 结果。
- 生成算法（简化）：
  - `hash = sha256("ProgramDerivedAddress" || programId || seed1 || ... || seedN || bump)`
  - `pda = Pubkey(hash)`，若 on-curve 则改变 bump 重试。

### JS 端派生

```ts
import { PublicKey } from '@solana/web3.js'

const programId = new PublicKey('...program id...')
const [pda, bump] = PublicKey.findProgramAddressSync(
  [Buffer.from('vault'), someUserPubkey.toBuffer()],
  programId,
)
console.log(pda.toBase58(), bump)
```

若已知 bump，可用 `PublicKey.createProgramAddressSync([...seeds, Buffer.from([bump])], programId)` 直接重建。

### Rust 程序端派生

```rust
use solana_program::pubkey::Pubkey;

let (pda, bump) = Pubkey::find_program_address(&[b"vault", user.key.as_ref()], program_id);
// 已知 bump 时：
let addr = Pubkey::create_program_address(&[b"vault", user.key.as_ref(), &[bump]], program_id)?;
```

### 常见用法

- 资金金库（vault）、配置（config）、用户状态（state）等账户
- ATA（关联代币账户）也是 PDA（由 ATA 程序派生）
- 作为“authority”：程序通过 CPI 使用 PDA 的权限写入/转移代币

### 常见错误与排查

- seed 超长或数量超限 → 合约报错 InvalidSeeds
- 忘记在链上保存 bump → 后续无法在程序内重建该 PDA
- 使用 on-curve 结果 → 安全性不达标（请用 findProgramAddress 选择 off-curve）
- 把用户钱包当作 PDA（钱包地址通常 on-curve，可签名）

