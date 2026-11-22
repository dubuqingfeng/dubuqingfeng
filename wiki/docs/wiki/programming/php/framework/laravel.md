### Laravel 概览

目录结构、路由/中间件、容器与服务提供者、Eloquent、队列/事件、配置与部署。

#### 基本骨架与 Artisan

```bash
composer create-project laravel/laravel app
php artisan make:controller UserController
php artisan make:model Post -m      # 生成模型+迁移
php artisan route:list
```

路由：`routes/web.php`、`routes/api.php`；中间件在 `app/Http/Middleware`。

#### 配置/环境/日志

- `.env` 管理环境，`config/*.php` 读取；`php artisan config:cache`；
- 日志：`config/logging.php`，推荐结构化 JSON；异常处理在 `app/Exceptions/Handler.php`。

#### 部署与性能

- 配置缓存：`config:cache`、`route:cache`；
- 队列：`php artisan queue:work --daemon`；
- Horizon 监控队列；Octane/Swoole 提升吞吐（需无状态/谨慎全局单例）。
