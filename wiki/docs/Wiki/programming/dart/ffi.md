---
title: FFI 与原生交互（dart:ffi）
---

通过 `dart:ffi` 调用本地动态库，与 C 交互。

## 基本流程

- 定义 C 签名与 Dart 函数类型；通过 `DynamicLibrary.open` 加载并绑定。

```dart
import 'dart:ffi' as ffi;

typedef c_add = ffi.Int32 Function(ffi.Int32, ffi.Int32);
typedef dart_add = int Function(int, int);

final dylib = ffi.DynamicLibrary.open('libmath.so');
final add = dylib.lookupFunction<c_add, dart_add>('add');
```

## 注意事项

- 内存所有权与释放；对齐与结构体布局；ABI/平台差异。

## 结构体与指针示例

```dart
import 'dart:ffi' as ffi;
import 'package:ffi/ffi.dart' as pkg;

class Point extends ffi.Struct {
  @ffi.Int32()
  external int x;
  @ffi.Int32()
  external int y;
}

typedef c_len = ffi.Int32 Function(ffi.Pointer<Point>);
typedef dart_len = int Function(ffi.Pointer<Point>);

final lib = ffi.DynamicLibrary.open('libgeom.so');
final len = lib.lookupFunction<c_len, dart_len>('point_len');

void main() {
  final p = pkg.calloc<Point>();
  p.ref
    ..x = 3
    ..y = 4;
  final v = len(p);
  pkg.calloc.free(p);
}
```
