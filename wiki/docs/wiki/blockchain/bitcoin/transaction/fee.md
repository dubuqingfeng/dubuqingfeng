# 计算交易手续费脚本

```
# 解析 json 文件

import json

# 读取 json 文件
with open('tx.json', 'r') as f:
    data = json.load(f)

print(data)

# 拿到 input 的 txid 和 vout
inputs = data['vin']

value = 0
for i in inputs:
    txid = i['txid']
    vout = i['vout']
    print(txid, vout)
    # 请求 api 拿到 value
    # GET /api/v5/explorer/transaction/transaction-fills?chainShortName=eth&txid=0x3ae59abf714df29a15bb8ecadfbe3068aff20693bb91c7e7c9d34ce245d56def
    import requests
    url = 'https://blockchain.info/rawtx/' + txid
    r = requests.get(url)
    res = r.json()
    # print(res)
    # 拿到 value
    vout_value = res['out'][vout]['value']
    value = value + vout_value

print(value)
```