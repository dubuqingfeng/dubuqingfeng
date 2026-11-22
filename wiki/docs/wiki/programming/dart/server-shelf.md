---
title: Shelf（服务端）
---

使用 `shelf` 快速构建 Dart 服务端 HTTP 应用。

## 示例

```dart
import 'dart:io';
import 'package:shelf/shelf.dart';
import 'package:shelf/shelf_io.dart' as io;

void main() async {
  final handler = const Pipeline()
      .addMiddleware(logRequests())
      .addHandler((req) => Response.ok('hello'));
  final server = await io.serve(handler, InternetAddress.anyIPv4, 8080);
  print('Serving at http://${server.address.host}:${server.port}');
}
```

## 路由与中间件（shelf_router）

```dart
import 'package:shelf_router/shelf_router.dart';

final app = Router()
  ..get('/health', (Request _) => Response.ok('ok'))
  ..get('/users/<id|[0-9]+>', (Request req, String id) => Response.ok('user $id'));
```

## CORS/错误处理

```dart
Response Function(Handler) cors() => (inner) => (req) async {
  final res = await inner(req);
  return res.change(headers: {
    ...res.headers,
    'access-control-allow-origin': '*',
  });
};
```
