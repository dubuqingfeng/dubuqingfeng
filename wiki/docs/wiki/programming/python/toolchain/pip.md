### pip 包管理

常用操作：安装/升级/卸载、源配置、冻结与锁定、私有源。

#### 安装与冻结

```bash
pip install -r requirements.txt
pip freeze > requirements.txt
```

#### 源配置

- 临时：`pip install -i https://pypi.tuna.tsinghua.edu.cn/simple pkg`
- 永久（macOS/Linux）：`~/.pip/pip.conf`

```ini
[global]
index-url = https://pypi.tuna.tsinghua.edu.cn/simple
```

#### 版本锁定

- pip-tools：`pip-compile` 生成锁定、`pip-sync` 同步；
- poetry：`poetry add`/`poetry lock`/`poetry export -f requirements.txt`。
