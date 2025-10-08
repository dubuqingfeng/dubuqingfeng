### Asyncio 异步 I/O

概念要点：事件循环、协程、任务、await/async、I/O 密集型高并发。

#### 基本用法

```py
import asyncio

async def fetch(i):
    await asyncio.sleep(0.1)
    return i

async def main():
    r = await fetch(1)
    print(r)

asyncio.run(main())
```

#### 任务与并发

```py
async def main():
    tasks = [asyncio.create_task(fetch(i)) for i in range(5)]
    res = await asyncio.gather(*tasks)
    print(res)
```

#### 超时/取消/异常

```py
async def main():
    try:
        return await asyncio.wait_for(fetch(1), timeout=0.05)
    except asyncio.TimeoutError:
        return 'timeout'

    t = asyncio.create_task(fetch(2))
    t.cancel()
    try:
        await t
    except asyncio.CancelledError:
        print('cancelled')
```

