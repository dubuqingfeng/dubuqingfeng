### HashMap 实现与细节（JDK 8）

#### ToC

- 结构与装载因子
- 扩容与扰动函数
- 链表树化/退化
- 迭代与失败快速
- 常见陷阱与实践

#### 结构与装载因子

- 「数组 + 链表/红黑树」：桶数组 `Node<K,V>[] table`；
- 装载因子 `loadFactor` 默认 0.75，阈值 `threshold = capacity * loadFactor`；
- 键的 `hashCode()` 参与定位，但真实索引还会做高位扰动 `hash ^ (hash >>> 16)` 以减少碰撞。

#### 扩容与扰动函数

- 容量始终为 2 的幂，扩容翻倍；元素在新数组中的位置要么原索引，要么原索引 + 旧容量（高位参与定位的性质）。

#### 链表树化/退化

- 桶内元素个数 ≥ 8 且表容量 ≥ 64 时树化为红黑树；
- 树内元素个数 ≤ 6 时退化回链表（避免小数据结构维护成本）。

#### 迭代与失败快速（fail-fast）

- 迭代器在检测到结构性修改（`modCount` 变化）时抛 `ConcurrentModificationException`；
- 多线程下非同步读写导致竞态，需使用 `ConcurrentHashMap` 或外部同步。

#### 常见陷阱与实践

- 不要自定义糟糕的 `hashCode`/`equals`，否则严重碰撞/错误行为；
- 对高并发写场景使用 `ConcurrentHashMap`；只读场景可考虑不可变映射；
- 预估容量以减少扩容次数：`new HashMap<>(expected / 0.75f + 1)`。

