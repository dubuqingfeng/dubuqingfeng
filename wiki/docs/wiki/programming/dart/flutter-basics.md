---
title: Flutter 基础
---

Flutter 的 Widget 树、状态管理与构建模式概览。

## 入口与基本组件

```dart
import 'package:flutter/material.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(home: Scaffold(appBar: AppBar(title: Text('Hi')), body: Center(child: Text('Hello'))));
  }
}
```

## 状态管理

 - setState、InheritedWidget、Provider、Riverpod、BLoC 等方案。

### setState 示例

```dart
class CounterPage extends StatefulWidget {
  const CounterPage({super.key});
  @override State<CounterPage> createState() => _CounterPageState();
}

class _CounterPageState extends State<CounterPage> {
  int _n = 0;
  @override Widget build(BuildContext context) => Scaffold(
    body: Center(child: Text('$_n')),
    floatingActionButton: FloatingActionButton(
      onPressed: () => setState(() => _n++), child: const Icon(Icons.add)),
  );
}
```

### Provider（简要）

```dart
class Counter extends ChangeNotifier { int n = 0; void inc(){ n++; notifyListeners(); } }
// MultiProvider(providers:[ChangeNotifierProvider(create: (_) => Counter())], child: ...)
// context.read<Counter>().inc(); context.watch<Counter>().n
```
