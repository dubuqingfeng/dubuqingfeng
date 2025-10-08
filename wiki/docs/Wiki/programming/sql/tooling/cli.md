### CLI 与客户端

常用命令行客户端与 GUI 工具，连接管理与脚本化执行。

#### 要点
- CLI：`psql`、`mysql`、`sqlite3` 等；
- 连接：DSN/环境变量、连接池（在应用层）；
- 脚本化：批量执行、事务包裹与错误处理；
- GUI：DataGrip、DBeaver 等。

#### 凭据管理

- Postgres：`~/.pgpass` 格式 `host:port:database:user:password`；权限 0600；
- MySQL：`~/.my.cnf` 中 `[client] user=... password=...`；
- 避免明文：优先环境变量/密钥管理服务。

#### 常用命令

```bash
psql "$DSN" -c "SELECT now();"
mysql -e "SHOW VARIABLES LIKE 'sql_mode'"
sqlite3 db.sqlite ".tables"
```
