### 运行时类型校验（Zod/io-ts/valibot）

#### ToC

- 为什么需要运行时校验
- Zod 实用示例
- 与 TS 类型联动

#### 为什么需要运行时校验

- TS 类型在编译时擦除，外部输入（接口/表单/JSON）不可信；
- 通过运行时 schema 校验，保障边界安全并生成类型。

#### Zod 示例

```ts
import { z } from 'zod'
const UserSchema = z.object({ id: z.string().uuid(), name: z.string().min(1), age: z.number().int().nonnegative().optional() })
type User = z.infer<typeof UserSchema>
const user = UserSchema.parse(json)
```

#### 与 TS 类型联动

- 单一事实来源：由 schema 推导类型（`z.infer`）；
- 对复杂对象/联合类型/嵌套数组效果显著；
- API 客户端/服务端共用 schema，减少错配。

