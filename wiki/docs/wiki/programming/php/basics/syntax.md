### PHP 语法速览

记录常用语法与易错点：类型系统、数组、字符串、错误处理、命名空间与自动加载等。

#### 严格类型与函数签名

```php
<?php declare(strict_types=1);
function add(int $a, int $b): int { return $a + $b; }
```

#### 数组与字符串

```php
$arr = ['a' => 1, 'b' => 2];
foreach ($arr as $k => $v) {}
$s = "hello"; $s2 = $s . " world";
```

#### 命名空间与自动加载

```php
namespace App\Http;
class Controller {}
```

`composer.json`：

```json
{ "autoload": { "psr-4": { "App\\": "src/" } } }
```

#### 最佳实践

- 避免 `==`，使用 `===`；
- 处理空合并 `??` 与 nullsafe `?->`；
- 错误用异常/类型声明表达意图。
