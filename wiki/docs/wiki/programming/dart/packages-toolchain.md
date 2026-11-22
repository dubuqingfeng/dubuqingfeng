---
title: 包管理与工具链（pub/dart）
---

使用 `pub.dev` 包仓库与 `dart` CLI 进行依赖管理与构建。

## pubspec.yaml 基本

```yaml
name: my_app
environment:
  sdk: '>=3.0.0 <4.0.0'
dependencies:
  http: ^1.2.0
dev_dependencies:
  lints: ^3.0.0
```

## 常用命令

```bash
dart create my_app
dart pub add http
dart run bin/my_app.dart
dart format . && dart analyze
```

## build_runner 生态

- `json_serializable`、`freezed` 等基于生成器的代码生成；配合 `dart run build_runner build/watch`。

## 分析规则与格式化

`analysis_options.yaml`：

```yaml
include: package:lints/recommended.yaml
linter:
  rules:
    - always_declare_return_types
    - avoid_print
```

## 构建产物

```bash
dart compile exe bin/main.dart -o build/app
dart compile js web/main.dart -o build/app.js
```
