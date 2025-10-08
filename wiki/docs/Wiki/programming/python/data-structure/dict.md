### Dict 字典

特性：哈希表、插入有序（3.7+）、装载因子与冲突处理。

#### 性能与冲突

- 键需可哈希且不可变；自定义对象实现 `__hash__`/`__eq__`；
- 高冲突降低性能，注意长字符串/自定义哈希质量。

#### 常见模式（collections）

```py
from collections import defaultdict, Counter, OrderedDict

freq = Counter(['a','b','a'])
g = defaultdict(list)
g['k'].append(1)
od = OrderedDict()
```

#### 迭代视图

```py
d = {'a':1, 'b':2}
for k in d.keys(): ...
for v in d.values(): ...
for k, v in d.items(): ...
```

视图动态反映字典变化，必要时显式 `list(d.items())` 固化快照。
