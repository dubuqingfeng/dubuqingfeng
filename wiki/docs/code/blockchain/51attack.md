
```python
import requests


headers = {
    "authority": "api.crypto51.app",
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "accept-language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
    "cache-control": "max-age=0",
    "if-modified-since": "Thu, 19 Jan 2023 10:07:40 GMT",
    "if-none-match": "W/\"7d8c92192d981d5b43ed189f05340ca7\"",
    "sec-ch-ua": "\"Not_A Brand\";v=\"99\", \"Google Chrome\";v=\"109\", \"Chromium\";v=\"109\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"macOS\"",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "none",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1",
    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36"
}
cookies = {
    "_ga": "GA1.2.1155034834.1672415701",
    "_gid": "GA1.2.1310999402.1674122520"
}
# https://www.crypto51.app/
url = "https://api.crypto51.app/coins.json"
response = requests.get(url, headers=headers, cookies=cookies)

# parse response json
result = response.json()

coins = [
    "Bitcoin", 
    "Litecoin",
    "EthereumClassic",  
    "BitcoinCash", 
    "BitcoinSV", 
    "Zcash", 
    "Dash", 
    "EthereumPoW",
    "Dogecoin", 
    "Ravencoin",
    "BitcoinGold",
    "Conflux",
    "EthereumFair",
    "Aeternity",       
]
for item in result['coins']:
    # if name in coins
    if item['name'] in coins:
        if item['network_vs_rentable_ratio'] > 0.4:
            print(item)
```