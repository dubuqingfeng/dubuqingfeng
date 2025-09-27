### 模块解析与路径别名

#### ToC

- Node/Classic/Bundler 解析
- baseUrl/paths 设置
- 与打包器/运行器对齐

#### 解析策略

- `moduleResolution: node|classic|bundler`；现代前端建议 `bundler`；Node 后端/库选择 `node`；

#### baseUrl/paths

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/utils/*": ["src/utils/*"] }
  }
}
```

#### 与工具链对齐

- Vite：`resolve.alias`；Webpack：`resolve.alias`；ts-node：`tsconfig-paths/register`；
- Jest：`moduleNameMapper`；ESBuild/Rollup：alias 插件；保持配置一致。

