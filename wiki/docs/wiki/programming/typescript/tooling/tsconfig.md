### tsconfig 关键选项

建议开启严格模式并按需增加安全选项：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitOverride": true,
    "forceConsistentCasingInFileNames": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "skipLibCheck": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
```

要点：

- `strict` 汇总多项严格检查；
- `exactOptionalPropertyTypes`/`noUncheckedIndexedAccess` 提升健壮性；
- `moduleResolution: bundler` 更贴近现代打包器；
- `paths` 配合工具链需要同步（Vite/Webpack/ts-node）。

