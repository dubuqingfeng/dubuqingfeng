### 包管理器与依赖策略

npm/yarn/pnpm 的锁文件与解析差异、workspace 管理与发布流程。更多基础参考 JavaScript 章节的[包管理：npm/yarn/pnpm](../../javascript/toolchain/package-managers.md)。

#### 要点
- 锁文件与一致性：`package-lock.json`/`yarn.lock`/`pnpm-lock.yaml`；
- Workspace：monorepo 管理与版本策略（changeset / release-please）；
- 安全：`npm audit`/`yarn audit`、供应链风险与镜像策略；
- 分发：`exports`/`types` 字段、ESM/CJS 双包。

#### 实务建议

- Monorepo：使用 workspace 隔离私有包，避免跨包相对路径；控制 hoist 策略（pnpm 默认隔离，yarn 可配置 nohoist）；
- 版本与发布：changesets 生成变更与版本，自动 PR 合并后发布；
- CI 可复现：`npm ci` 或 `pnpm install --frozen-lockfile`；
- 缓存：缓存包管理器与 `.npm`/`~/.pnpm-store`；确保 node_modules 不缓存过久导致漂移。
