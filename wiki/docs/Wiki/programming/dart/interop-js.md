---
title: JS 互操作（Web）
---

在 Dart Web（dart2js/Flutter Web）中与 JS 互操作。

## dart:js 与 js 包

- 通过 `package:js` 的 `@JS()` 注解声明 JS 接口；或使用 `dart:js` 的低级 API。

```dart
@JS('console.log')
external void jsLog(Object? a);
```

从 Dart 调用 JS 并从 JS 回调 Dart：

```dart
@JS()
library demo;

import 'package:js/js.dart';

@JS('console.log')
external void jsLog(Object? a);

void main() {
  jsLog('hello');
  exposeDart(add);
}

@JS('exposeDart')
external set exposeDart(void Function(int Function(int,int)) f);

int add(int a, int b) => a + b;
```

对应 JS：

```js
window.exposeDart = function (fn) { console.log('2+3=', fn(2,3)); };
```
