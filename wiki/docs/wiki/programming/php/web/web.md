### Web 基础与运行模式

典型运行方式：FPM（Nginx/Apache）、CLI、Swoole/协程；路由、中间件、配置与部署。

#### FPM 配置要点

- `pm = dynamic`、`pm.max_children` 根据内存与请求耗时估算；
- `request_terminate_timeout` 防止挂起；
- `slowlog` 追踪慢脚本。

#### Nginx 反代与静态

```nginx
location /static/ { alias /var/www/app/public/; }
location ~ \.php$ {
  include fastcgi_params;
  fastcgi_pass unix:/run/php/php-fpm.sock;
  fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
}
```

#### Swoole 服务器

参考并发章节示例，生产需结合守护、热重载与健康检查；或使用 RoadRunner（Go 网关 + PHP Worker）。
