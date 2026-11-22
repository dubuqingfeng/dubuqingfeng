### 面向对象 OOP 概览

类与接口、Trait、可见性、继承与多态、魔术方法、命名空间。

#### 抽象类/接口/Trait

- 抽象类：可实现部分逻辑，提供抽象方法：

```php
abstract class Repo { abstract public function find(int $id); }
```

- 接口：仅声明签名，多实现：

```php
interface Logger { public function info(string $m): void; }
```

- Trait：复用片段，避免菱形继承：

```php
trait Singleton { private static $i; public static function get(){ return self::$i ??= new static(); } }
```

#### 依赖注入与容器

- 通过构造函数注入接口；使用容器（如 Laravel IOC）绑定实现：`$app->bind(Logger::class, FileLogger::class);`

#### 设计模式示例（策略）

```php
interface Tax { public function calc(float $n): float; }
class CN implements Tax { public function calc(float $n): float { return $n*0.06; } }
class US implements Tax { public function calc(float $n): float { return $n*0.07; } }

class Checkout {
  public function __construct(private Tax $tax) {}
  public function total(float $n): float { return $n + $this->tax->calc($n); }
}
```

