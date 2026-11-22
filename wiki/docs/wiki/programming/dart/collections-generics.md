---
title: 集合/泛型/扩展/枚举
---

集合、泛型与 Dart 语言增强特性概览。

## 集合与展开/条件

```dart
var list = [1, 2, 3];
var ext = [...list, if (true) 4, for (var i in list) i * 2];
var map = {'a': 1, 'b': 2};
var set = {1, 2, 3};
```

## 泛型与 typedef

```dart
List<T> repeat<T>(T value, int times) => List.filled(times, value);
typedef StringMap = Map<String, String>;
```

## 扩展方法与枚举增强

```dart
extension IntX on int { int squared() => this * this; }

enum Color { red, green, blue }
```

## 不可变视图与只读

```dart
final ro = List.unmodifiable([1, 2, 3]);
// ro.add(4); // 运行时报错：不可修改
```

## 集合操作技巧

```dart
final map = {'a': 1, 'b': 2};
final mapped = Map.fromEntries(
  map.entries.map((e) => MapEntry(e.key, e.value * 2)),
);
final grouped = [1,2,3,4,5].fold(<String,List<int>>{}, (acc, x) {
  (acc[x.isEven ? 'even' : 'odd'] ??= []).add(x);
  return acc;
});
```
