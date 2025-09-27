### Map/Set/WeakMap/WeakSet

- `Map`：任意键；保持插入顺序；与 `Object` 相比适合频繁增删查；
- `Set`：去重集合；
- `WeakMap/WeakSet`：弱引用键，不阻止垃圾回收；不可迭代，常用于私有数据与缓存；
- 典型用法：缓存与元数据存储、DOM 关联对象等。

