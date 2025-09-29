---
title: 性能与构建优化
---

构建模式与性能优化要点。

- JIT（开发热重载）与 AOT（发布性能）差异。
- Release 构建启用树摇（tree shaking）与最小化；避免反射影响摇树。
- 分析工具：DevTools、CPU/内存快照、Dart Observatory。

## 编译与测量

```bash
dart compile exe bin/main.dart -o build/app
time ./build/app
```

## Timeline 与标记

```dart
import 'dart:developer';

void work() {
  Timeline.startSync('phase-1');
  // do work
  Timeline.finishSync();
}
```

## 实务建议

- CPU 密集使用 Isolate；IO 密集使用 async。
- 减少小对象分配与临时集合；复用缓冲区。
