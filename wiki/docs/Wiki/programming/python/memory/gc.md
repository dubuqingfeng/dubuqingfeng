### Python 垃圾回收与内存管理

核心机制：引用计数 + 循环检测分代 GC；对象池/小整数缓存；`__del__` 与弱引用。

#### `gc` 模块与调试

```py
import gc
gc.get_threshold()         # 分代阈值
gc.set_threshold(700,10,10)
gc.disable(); gc.collect(); gc.enable()
gc.set_debug(gc.DEBUG_UNCOLLECTABLE)
```

#### 引用环与弱引用

```py
import weakref

class Node: pass
a = Node(); b = Node()
a.other = b; b.other = a  # 引用环

obj = Node()
w = weakref.ref(obj)
del obj; assert w() is None
```

#### 泄漏与大对象排查

- `tracemalloc` 跟踪分配源头：

```py
import tracemalloc
tracemalloc.start()
# ... 运行一段时间
snap = tracemalloc.take_snapshot(); print(snap.statistics('filename')[:5])
```

- 关注长生命周期全局容器、缓存、事件回调未解绑；
- 科学计算避免无界增长的中间 ndarray/tensor。
