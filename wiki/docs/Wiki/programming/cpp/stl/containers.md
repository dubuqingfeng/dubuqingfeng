### 容器概览与选择

常用容器：

- 顺序：`std::vector`（默认首选）、`std::deque`、`std::list`
- 关联：`std::map`/`std::set`（红黑树）、`std::unordered_map`/`std::unordered_set`（哈希）

选择建议：

- 大多数场景首选 `vector`；随机访问好、局部性好。
- 需键查找且键稳定：`map`；更关注均摊 O(1) 查找：`unordered_map`。

