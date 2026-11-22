---
title: 语法/类型/空安全
---

Dart 为强类型语言，支持空安全（null-safety）与类型推断。

## 基础语法

```dart
void main() {
  var x = 1;        // 类型推断为 int
  final s = 'hi';   // 只读（运行期确定）
  const pi = 3.14;  // 编译期常量
  print('$s, ${x + 1}');
}
```

## 空安全与可空类型

- `int?` 表示可空；使用 `!` 断言非空，`?.` 安全访问，`??`/`??=` 提供默认值。

```dart
int? a;
int b = a ?? 0; // 若 a 为 null 则取 0
```

## 类与构造

```dart
class Point {
  final int x, y;
  const Point(this.x, this.y);       // 常量构造
  Point.origin() : x = 0, y = 0;     // 命名构造
}
```

## 控制流与函数

```dart
int sum(List<int> xs) {
  var s = 0;
  for (final x in xs) {
    if (x.isEven) continue;
    s += x;
  }
  return s;
}

T firstOr<T>(List<T> xs, T fallback) => xs.isEmpty ? fallback : xs.first;
```

## 命名参数与默认值

```dart
void greet({required String name, int times = 1}) {
  for (var i = 0; i < times; i++) print('hi $name');
}
```

## mixin / 抽象类 / 接口

```dart
mixin Logger { void log(String m) => print('[LOG] $m'); }

abstract class Shape { double area(); }

class Rect with Logger implements Shape {
  final double w, h;
  Rect(this.w, this.h);
  @override double area() => w * h;
}
```

## late 与延迟初始化

```dart
late final String token; // 首次赋值后只读
void init() { token = computeToken(); }
```
