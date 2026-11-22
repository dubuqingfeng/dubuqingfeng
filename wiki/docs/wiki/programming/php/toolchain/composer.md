### Composer 包管理

依赖声明、自动加载、脚本与发布；镜像与私有仓库。

#### 基本命令

```bash
composer init              # 初始化
composer require vendor/pkg:^1.2  # 安装依赖
composer update            # 升级依赖
composer dump-autoload -o  # 生成优化的自动加载
```

`composer.json`（PSR-4 自动加载）：

```json
{
  "autoload": { "psr-4": { "App\\": "src/" } },
  "scripts": { "test": "phpunit" }
}
```

#### 版本约束

- `^1.2` 兼容 1.x 次要/补丁更新；`~1.2` 兼容到 1.2.x；
- `>=1.2 <2.0` 明确区间；避免使用 `dev-master` 于生产。

#### 镜像与私有仓库

- 临时切换镜像：`composer config -g repos.packagist composer https://mirrors.aliyun.com/composer/`；
- 私有仓库：

```json
{
  "repositories": [
    { "type": "vcs", "url": "git@internal/repo.git" }
  ]
}
```

