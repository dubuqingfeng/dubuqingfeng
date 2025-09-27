### 包管理：npm/yarn/pnpm 与版本策略

#### 要点

- 版本语义：`^1.2.3` 兼容次版本，`~1.2.3` 兼容补丁；锁定版本用 `package-lock.json`/`yarn.lock`/`pnpm-lock.yaml`；
- workspace/monorepo：使用 npm workspaces / Yarn workspaces / pnpm workspaces 管理多包；
- pnpm 的硬链接/去重机制更省空间与安装时间；
- 发布：`npm version` + `npm publish --access public`，注意双因子与 token 管理。

