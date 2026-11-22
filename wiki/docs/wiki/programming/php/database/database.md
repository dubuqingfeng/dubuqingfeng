### 数据库访问与 ORM 概览

PDO、mysqli、常见 ORM（Eloquent/Doctrine）与查询构建器、连接池与迁移。

#### PDO 与预处理

```php
$pdo = new PDO('mysql:host=127.0.0.1;dbname=app;charset=utf8mb4', 'user', 'pass', [
  PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
]);
$stmt = $pdo->prepare('SELECT * FROM users WHERE id = :id');
$stmt->execute(['id' => 1]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);
```

防注入：总是使用预处理；禁用魔术转义；对 LIKE 模式转义 `%/_`。

#### 事务

```php
$pdo->beginTransaction();
try {
  // ...
  $pdo->commit();
} catch (Throwable $e) {
  $pdo->rollBack();
  throw $e;
}
```

#### 迁移与 Seeder

- Laravel：`php artisan migrate`、`db:seed`；
- Doctrine Migrations：版本化 SQL/DDL；
- 测试夹具：构造最小数据，使用事务回滚或重置数据库。
