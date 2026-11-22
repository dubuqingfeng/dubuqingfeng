### Multiprocessing 进程

概念要点：绕过 GIL、CPU 密集型适用、进程间通信与共享。

#### 基本用法

```py
from multiprocessing import Process

def work(n):
    print('pid work', n)

p = Process(target=work, args=(1,))
p.start(); p.join()
```

进程池：

```py
from multiprocessing import Pool

with Pool(processes=4) as pool:
    print(pool.map(pow, [(2, 10)]))  # or pool.map(func, iterable)
```

#### 进程间通信（IPC）

```py
from multiprocessing import Queue, Pipe, Manager, Value, Array

q = Queue(); q.put(1); q.get()
parent, child = Pipe(); parent.send('hi'); child.recv()

m = Manager(); shared = m.dict(); shared['x'] = 1
cnt = Value('i', 0); buf = Array('i', range(10))
```

对比：`joblib` 适合科学计算的简化并行；`ray` 适合分布式任务与集群扩展。
