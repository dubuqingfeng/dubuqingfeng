### 测试与覆盖率（Jest/Vitest）

#### 要点

- 单测框架：前端建议 Vitest（与 Vite 深度集成）；Node/通用可用 Jest；
- 覆盖率：`c8`/`istanbul`；
- TS 支持：Vitest 原生支持；Jest 使用 `babel-jest` 或 `ts-jest`；
- Mock：模块/计时器/网络；小心过度 mock 影响可信度。

示例（Vitest）：

```ts
import { describe, it, expect } from 'vitest'
describe('sum', () => { it('ok', () => expect(1+1).toBe(2)) })
```

