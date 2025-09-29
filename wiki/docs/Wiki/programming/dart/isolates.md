---
title: Isolate 与并发模型
---

Isolate 是 Dart 的并发单元，拥有独立堆内存，通过端口消息通信。

## 基本示例

```dart
import 'dart:isolate';

void worker(SendPort reply) {
  reply.send('hello');
}

void main() async {
  final receive = ReceivePort();
  await Isolate.spawn(worker, receive.sendPort);
  print(await receive.first);
}
```

## 实务建议

- CPU 密集任务放 Isolate；IO 密集使用 async/await。
- 注意序列化成本与共享不可变数据（TransferableTypedData）。

## 双向通信与大数据传输

```dart
import 'dart:isolate';
import 'dart:typed_data';

void worker(SendPort mainPort) async {
  final port = ReceivePort();
  mainPort.send(port.sendPort);
  await for (final msg in port) {
    if (msg is TransferableTypedData) {
      final data = msg.materialize().asUint8List();
      // 处理 data
      mainPort.send(data.length);
    }
  }
}

void main() async {
  final mainPort = ReceivePort();
  await Isolate.spawn(worker, mainPort.sendPort);
  final workerPort = await mainPort.first as SendPort;
  final bytes = Uint8List(1024 * 1024);
  workerPort.send(TransferableTypedData.fromList([bytes]));
}
```
