

```python

#!/usr/bin/env python
# coding=utf-8
import requests
import json
import time
import csv
import sys

URL = "" # default url
if len(sys.argv) > 1:
    URL = sys.argv[1]

request_id = 0
height = 0
end_height = 24292064
start_height = 24291030
# sleep_time = 0.2 # 暂停一段时间
report = []
session = requests.Session()

def create_request_object(_method, _params, _requestId):
    return {"jsonrpc":"2.0", "method":_method, "params":_params, "id":_requestId}, _requestId+1

def post_request_object(_HTTPEnpoint, _jsonRPCRequestObject):
    response = session.post(_HTTPEnpoint,
                            json=_jsonRPCRequestObject,
                            headers={'Content-type': 'application/json'})
    return response.json()

height = start_height

while True:
    if height <= end_height:
        start_time1 = time.time()
        request_object, requestId = create_request_object('eth_getBlockByNumber', [hex(height), False], request_id)
        response_object = post_request_object(URL, request_object)
        result = response_object['result']
        end_time1 = time.time()
        spent_time1 = (end_time1 - start_time1)*1000
        print('运行时间:%.2f毫秒, 高度:%d, 当前运行时间:%s' % (spent_time1, height, end_time1))
        if result==None:
            report.append([height, end_time1, spent_time1])
        height = height + 1
        # time.sleep(sleep_time)
    else:
        break
print("完成, 开始写入 csv 文件")
with open("output.csv","w") as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(["height","current_time","spent_time"])
    writer.writerows(report)

```

```python
#!/usr/bin/env python
# coding=utf-8
import requests
import json
import time
import csv
import sys

URL = "" # default url
if len(sys.argv) > 1:
    URL = sys.argv[1]

request_id = 0
height = 0
sleep_time = 0.2 # 暂停一段时间
total_time = 300 # 总共 5 分钟
is_increasing_print = True # 只记录增长区块
report = []
session = requests.Session()

def create_request_object(_method, _params, _requestId):
    return {"jsonrpc":"2.0", "method":_method, "params":_params, "id":_requestId}, _requestId+1

def post_request_object(_HTTPEnpoint, _jsonRPCRequestObject):
    response = session.post(_HTTPEnpoint,
                            json=_jsonRPCRequestObject,
                            headers={'Content-type': 'application/json'})
    return response.json()

start_time = time.time()
request_object, requestId = create_request_object('eth_blockNumber', [], request_id)
response_object = post_request_object(URL, request_object)
height = int(response_object['result'], 16)
t = time.time()
spent_time = (t - start_time)*1000
print('运行时间:%s毫秒, 高度:%d, 当前运行时间:%s' % (spent_time, height, t))
report.append([height, t, spent_time])

while True:
    if time.time() - t < total_time:
        last_height = height
        start_time1 = time.time()
        request_object, requestId = create_request_object('eth_blockNumber', [], request_id)
        response_object = post_request_object(URL, request_object)
        height = int(response_object['result'], 16)
        end_time1 = time.time()
        spent_time1 = (end_time1 - start_time1)*1000
        if is_increasing_print:
            if height > last_height:
                print('运行时间:%.2f毫秒, 高度:%d, 当前运行时间:%s' % (spent_time1, height, end_time1))
                report.append([height, end_time1, spent_time1])
        else:
            print('运行时间:%.2f毫秒, 高度:%d, 当前运行时间:%s' % (spent_time1, height, end_time1))
            report.append([height, end_time1, spent_time1])
        time.sleep(sleep_time)
    else:
        print("break")
        break
print("完成, 开始写入 csv 文件")
with open("output.csv","w") as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(["height","current_time","spent_time"])
    writer.writerows(report)
```