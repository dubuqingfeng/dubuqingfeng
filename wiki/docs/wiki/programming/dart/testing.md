---
title: 测试与覆盖率
---

使用 `test` 包编写单元/集成测试，生成覆盖率报告。

## 示例

```dart
import 'package:test/test.dart';

int add(int a, int b) => a + b;

void main() {
  test('add', () {
    expect(add(1, 2), 3);
  });
}
```

## 命令

```bash
dart pub add --dev test
dart test --coverage=coverage
```

## 组织测试与生命周期

```dart
import 'package:test/test.dart';

void main() {
  setUp(() { /* init */ });
  tearDown(() { /* dispose */ });

  group('math', () {
    test('add', () => expect(1 + 2, 3));
  });
}
```

## Mocking（示例）

使用 `mocktail`：

```dart
class Api { Future<int> get() async => 1; }
class ApiMock extends Mock implements Api {}
```
