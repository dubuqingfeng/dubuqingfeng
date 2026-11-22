---
title: JSON 序列化（json_serializable/Freezed）
---

常见 JSON 序列化与不可变数据建模方案。

## json_serializable

- 在模型上标注 `JsonSerializable`，使用 build_runner 生成 `fromJson/toJson`。

```dart
import 'package:json_annotation/json_annotation.dart';
part 'user.g.dart';

@JsonSerializable()
class User {
  final int id;
  final String name;
  User({required this.id, required this.name});
  factory User.fromJson(Map<String, dynamic> j) => _$UserFromJson(j);
  Map<String, dynamic> toJson() => _$UserToJson(this);
}
```

命令：`dart run build_runner build --delete-conflicting-outputs`

## Freezed

- 不可变数据类、`copyWith`、联合类型（sealed），支持 JSON 插件。

```dart
import 'package:freezed_annotation/freezed_annotation.dart';
part 'user.freezed.dart';
part 'user.g.dart';

@freezed
class User with _$User {
  const factory User({required int id, required String name}) = _User;
  factory User.fromJson(Map<String, dynamic> j) => _$UserFromJson(j);
}
```
