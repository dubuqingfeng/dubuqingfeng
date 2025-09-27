## HD 钱包（BIP32/39/44/84/86）

分层确定性（HD）钱包通过“主种子 + 路径”派生无限密钥对，便于备份与账户化管理。

### BIP32 核心

- 扩展密钥：`(key, chainCode)`；HMAC-SHA512 派生：`I = HMAC-SHA512(cc_parent, data)`
- data：
  - hardened：`0x00 || ser256(k_par) || ser32(i)`（需要私钥）
  - non-hardened：`serP(K_par) || ser32(i)`（CKDpub 支持）
- 子私钥：`k_child = (IL + k_par) mod n`; 子公钥：`K_child = k_child·G`

### 常见路径

- BIP44（传统）：`m / 44' / coin' / account' / change / index`
- BIP84（原生 P2WPKH）：`m / 84' / coin' / account' / change / index`
- BIP86（P2TR）：`m / 86' / coin' / account' / change / index`

### 助记词（BIP39）

- 以 PBKDF2 生成种子；注意语言/词表与 passphrase
- 安全建议：离线生成，防截屏/键盘记录；优先硬件钱包

### Go 伪代码：CKD

```go
if hardened(i) {
  data = append([]byte{0x00}, ser256(kPar)...)
  data = append(data, ser32(i)...)
} else {
  data = append(serP(KPar), ser32(i)...)
}
I  := HMAC_SHA512(ccPar, data)
IL := I[:32]; IR := I[32:]
kChild := (toInt(IL) + kPar) % n
ccChild := IR
```

