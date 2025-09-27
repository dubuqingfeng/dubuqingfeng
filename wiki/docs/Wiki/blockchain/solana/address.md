## Address

Solana 地址是 Ed25519 公钥（32 字节）的 Base58 编码。与比特币/以太坊不同：
- 直接对 32 字节进行 Base58 编码（无版本字节、无 Base58Check 校验）。
- 显示长度通常在 32~44 个 Base58 字符之间。
- 任意账户（外部账户、程序账户、代币账户、PDA）本质都是一个“地址”。

### 密钥与地址

- 密钥对算法：Ed25519
- 公钥：32 字节 → 地址字符串 = Base58(pubkey)
- 私钥表示：
  - `solana-keygen new -o keypair.json` 导出 64 字节（secretKey = 32 字节种子 + 32 字节公钥拼接）。
  - Web3.js 的 `Keypair.fromSecretKey(Uint8Array)` 直接接受该 64 字节数组。

代码示例（TypeScript / Node）：

```ts
import { Keypair } from '@solana/web3.js'

// 从 solana-keygen 导出的 keypair.json（64 字节数组）
const secret = Uint8Array.from([ /* 64 bytes here */ ])
const kp = Keypair.fromSecretKey(secret)
console.log('Address:', kp.publicKey.toBase58())
```

### BIP44 派生路径（常见）

- 路径：`m/44'/501'/account'/change'`
- 不同钱包对 account/change 的默认取值不同；导入助记词时需注意选择一致的派生路径。

### On-curve 与 Off-curve

- “On-curve”：可由某个私钥签名的公钥（普通钱包地址属于此类）。
- “Off-curve”：不对应任何私钥，无法签名。程序派生地址（PDA）必须是 off-curve。
- 检查：`PublicKey.isOnCurve(pubkey)`（Web3.js）

注意：PDA 无法签名；若需要“授权”，程序需要在链上逻辑中验证 PDA 作为 authority 并由程序执行 CPI 来“代表” PDA 行使权限。

### 关联代币账户（ATA）

SPL Token 采用“关联代币账户”存放某钱包某代币的余额：
- 唯一地址 = 基于（owner、Token Program Id、mint）三元组确定的 PDA
- 由 “Associated Token Program” 负责创建
- 不同的 Token Program（经典版与 Token-2022）对应不同的 ATA 程序常量

示例（TypeScript）：

```ts
import { getAssociatedTokenAddress } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'

const owner = new PublicKey('...owner...')
const mint = new PublicKey('...mint...')
const ata = await getAssociatedTokenAddress(mint, owner)
console.log('ATA:', ata.toBase58())
```

### 验证与排查

- Base58 解码后应为 32 字节，否则不是有效公钥地址。
- 普通钱包地址一般 on-curve；遇到 off-curve 多为 PDA（程序派生地址）。
- Keypair JSON 应为 64 字节；若仅有 32 字节，多半只是私钥种子，不符合 Web3.js 的 `fromSecretKey` 输入格式。

