2022.11.27

Curve Trees: Practical and Transparent Zero-Knowledge Accumulators
https://eprint.iacr.org/2022/756.pdf

STARK - SNARK recursive zero knowledge proofs, combinaison of the Winterfell library and the Circom language
https://github.com/VictorColomb/stark-snark-recursive-proofs

使用 SNARKs 批处理 ECDSA 签名
https://hackmd.io/@Kurt-Pan/rJnYJ3pli

https://hackmd.io/@Kurt-Pan

https://crypto.kurtpan.pro/

https://tweet.kurtpan.pro/

2022.11.28

kong-plugin-file-log-extended
https://github.com/wshirey/kong-plugin-file-log-extended

go-ethereum 增加这个 header 头 " Accept-Encoding: br "，以避免压缩的问题

2022.11.29

kong 代码：

declarative_config 配置

https://github.com/Kong/kong/blob/89ac217b4d6dc0fbecb11909ca50e8d7443c9e05/kong/clustering/wrpc_data_plane.lua#L178

一些水龙头

https://faucet.triangleplatform.com/

Peel Chain 洗币手法
链上追踪：洗币手法科普之 Peel Chain

https://www.8btc.com/media/6730850

Solana 扩容机制分析：牺牲可用性换取高效率的极端尝试 | CatcherVC Research
https://mirror.xyz/0x8C4d5E90196325FB22Fff37C97D7984a37e51D11/5d1SlfEAKNeGV4AW7TO6TFjo1giTpgvjYnLJeCVoQm4

2022.11.30

https://github.com/bitcoin-cash-node/bitcoin-cash-node/blob/v25.0.0/doc/release-notes.md

2022.12.01

https://github.com/halfrost/LeetCode-Go

2022.12.02

https://github.com/citp/BlockSci

Cryptography with Weights: MPC, Encryption and Signatures
https://eprint.iacr.org/2022/1632.pdf

Fast Multiparty Threshold ECDSA with Fast Trustless Setup
https://eprint.iacr.org/2019/114.pdf

https://twitter.com/yishi_oh/status/1595797129704144899

https://github.com/bitcoin/bips/blob/master/bip-0350.mediawiki

2022.12.03

getchaintips

https://chat.openai.com/

2022.12.28

shm_size postgresql

群晖 DSM 默认占用 80 端口自动跳转 5000 的问题

1. ssh into your Synology
   sudo -s
2. cd /usr/syno/share/nginx
3. Make a backup of server.mustache, DSM.mustache, WWWService.mustache
   cp server.mustache server.mustache.bak
   cp DSM.mustache DSM.mustache.bak
   cp WWWService.mustache WWWService.mustache.bak
   sed -i "s/80/8880/g" server.mustache
   sed -i "s/80/8880/g" DSM.mustache
   sed -i "s/80/8880/g" WWWService.mustache
4. Optionally, you can also move 443 to 8881:
   sed -i "s/443/8881/g" server.mustache
   sed -i "s/443/8881/g" DSM.mustache
   sed -i "s/443/8881/g" WWWService.mustache

zkevm 标准

https://github.com/privacy-scaling-explorations/zkevm-specs/blob/master/specs/state-proof.md

2023.01.05

https://github.com/syscoin/eth-proof

```
remote=origin ; for brname in `git branch -r | grep $remote | grep -v master | grep -v HEAD | awk '{gsub(/^[^\/]+\//,"",$1); print $1}'`; do git branch --track $brname $remote/$brname || true; done 2>/dev/null
git fetch --all
git pull --all
git push --all local
git branch --track v0.3.3-dev local/v0.3.3-dev
```

2023.01.19

cors 的解决方案：

https://github.com/chanmyaemaung/cors-proxy
