### 并发模型与协程生态

PHP 传统 FPM 下每请求一个进程/Worker，协程与常驻内存需借助 Swoole/FPM 扩展或框架（如 RoadRunner）。

#### 多进程与 I/O 并发

- FPM：通过设置 `pm.max_children` 扩容并发；
- 常驻服务：使用 Swoole/ReactPHP 实现事件循环与异步 I/O。

#### Swoole 协程示例

```php
<?php
Swoole\Runtime::enableCoroutine();

go(function () {
    $cli = new Swoole\Coroutine\Client(SWOOLE_SOCK_TCP);
    $cli->connect('example.com', 80);
    $cli->send("GET / HTTP/1.0\r\n\r\n");
    echo $cli->recv();
});
```

#### Swoole HTTP 服务器

```php
<?php
use Swoole\Http\Server;
$s = new Server('0.0.0.0', 9501);
$s->on('request', function ($req, $res) { $res->end('hello'); });
$s->start();
```

#### 与队列/消息系统

- 使用 Redis/RabbitMQ/Kafka 进行异步任务；
- Laravel 队列（`php artisan queue:work`）处理后台作业；
- 注意幂等与失败重试策略。
