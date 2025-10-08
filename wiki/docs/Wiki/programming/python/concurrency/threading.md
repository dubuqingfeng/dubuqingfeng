### Threading 线程

概念要点：GIL、I/O 密集型适用、锁/条件/队列、线程池。

#### 基本用法

```py
import threading

def work(n):
    print('hello', n)

t = threading.Thread(target=work, args=(1,))
t.start(); t.join()
```

线程池：

```py
from concurrent.futures import ThreadPoolExecutor

with ThreadPoolExecutor(max_workers=8) as ex:
    futs = [ex.submit(work, i) for i in range(10)]
    for f in futs:
        f.result()
```

#### 同步原语

```py
from threading import Lock, RLock, Event, Condition, Semaphore

lock = Lock(); evt = Event(); sem = Semaphore(3)

with lock:
    # 临界区
    pass

evt.set(); evt.wait()

cond = Condition()
with cond:
    cond.notify_all()
```

#### 生产者-消费者

```py
import threading, queue

q = queue.Queue(maxsize=100)

def producer():
    for i in range(1000):
        q.put(i)
    q.put(None)  # 结束标记

def consumer():
    while True:
        x = q.get()
        if x is None: break
        # process x
        q.task_done()

threading.Thread(target=producer).start()
threading.Thread(target=consumer).start()
```

