# 12.01

https://github.com/halfrost/LeetCode-Go

# 12.02

https://github.com/citp/BlockSci

Cryptography with Weights: MPC, Encryption and Signatures
https://eprint.iacr.org/2022/1632.pdf

Fast Multiparty Threshold ECDSA with Fast Trustless Setup
https://eprint.iacr.org/2019/114.pdf

https://twitter.com/yishi_oh/status/1595797129704144899

https://github.com/bitcoin/bips/blob/master/bip-0350.mediawiki

# 12.03

getchaintips

https://chat.openai.com/

# 12.28

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
