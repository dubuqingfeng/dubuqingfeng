### ConcurrentHashMap 并发设计（JDK 8）

#### ToC

- 基本结构与无锁读
- 插入与扩容（CAS + 链/树）
- 计数与 size 计算
- 与 Hashtable/同步 Map 对比
- 复合操作与 compute 系列

#### 基本结构与无锁读

与 HashMap 类似使用桶数组，但在并发下：

- 读大多为无锁：定位桶后若为不可变结构可直接读取；
- 写使用 `synchronized` 作用于桶头节点或使用 CAS 协作；
- 扩容采用转移线程协作（迁移任务分段）。

#### 插入与扩容（CAS + 链/树）

典型流程：

1) 桶为空：使用 CAS 放置首节点；
2) 桶为 `ForwardingNode`：表示正在扩容，帮助迁移后重试；
3) 否则对桶头加锁后在链/树中查找插入；

树化/退化阈值与 HashMap 相似，但实现细节不同（`TreeBin` 包装）。

#### 计数与 size 计算

- 计数使用 `CounterCell` 分桶累加，减少热点竞争；
- `size()` 在并发下可能返回近似值，可使用 `mappingCount()` 获取 `long` 近似计数；
- 强一致计数需遍历，代价高。

#### 与 Hashtable/同步 Map 对比

- `Hashtable` 对所有操作加全表锁，吞吐差；
- `Collections.synchronizedMap` 包装器也是粗粒度锁；
- `ConcurrentHashMap` 提供更细粒度同步与无锁读，支持更丰富复合操作。

#### 复合操作与 compute 系列

`computeIfAbsent/compute/merge` 等在并发下是“原子”的，但计算函数内部不要做阻塞/长耗时操作以免拖慢桶锁持有时间。

示例：

```java
ConcurrentHashMap<String, Expensive> cache = new ConcurrentHashMap<>();
Expensive v = cache.computeIfAbsent(key, k -> load(k));
```

