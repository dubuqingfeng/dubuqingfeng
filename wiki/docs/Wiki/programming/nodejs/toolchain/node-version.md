### Node 版本管理（nvm 等）

多版本并存与切换、项目内约束与 CI 对齐。更多细节可参考 JavaScript 章节的[Node 版本管理](../../javascript/toolchain/node-version.md)。

#### 要点
- nvm/nodenv/Volta 的选择与团队对齐；
- `engines` 字段与 CI 矩阵；
- 全局 vs 本地依赖、Corepack 与 pnpm；
- 忽略文件与缓存加速（CI）。

#### 实务建议

- `.nvmrc`/`.node-version` 固定版本；CI 使用同版本矩阵：

```yaml
# .github/workflows/ci.yml
strategy:
  matrix:
    node: [20, 22]
steps:
  - uses: actions/setup-node@v4
    with: { node-version: ${{ matrix.node }}, cache: 'npm' }
```

- `package.json#engines` 与 `engine-strict` 约束；
- Corepack 固定包管器版本：`corepack enable && corepack prepare pnpm@9.0.0 --activate`；
- 锁文件在 CI 使用 `--frozen-lockfile/ci` 保证可复现构建。
