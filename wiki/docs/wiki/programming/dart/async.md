---
title: Future/Stream/async-await
---

Dart 的异步基于 `Future`（一次性）与 `Stream`（多次）。

## Future 与 async/await

```dart
Future<int> fetch() async {
  await Future.delayed(Duration(milliseconds: 100));
  return 42;
}
```

## Stream

```dart
Stream<int> gen() async* {
  for (var i = 0; i < 3; i++) {
    yield i;
  }
}

void main() async {
  await for (final v in gen()) {
    print(v);
  }
}
```

## 错误处理与超时

```dart
final v = await fetch().timeout(const Duration(seconds: 2), onTimeout: () => -1);
try {
  final x = await fetch();
} catch (e, st) {
  // 统一记录或重试
}
```

## 组合并发

```dart
final results = await Future.wait<int>([
  fetch(),
  fetch(),
], eagerError: true);
```

## StreamController 与广播

```dart
final ctrl = StreamController<int>.broadcast();
final sub = ctrl.stream.listen((v) {});
ctrl.add(1);
await sub.cancel();
await ctrl.close();
```
