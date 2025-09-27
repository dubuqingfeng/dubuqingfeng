### React/Redux 类型集成

#### ToC

- 组件/Props/Ref
- Hooks 与上下文
- Redux Toolkit 与 Hooks 类型

#### 组件/Props/Ref

```tsx
type Props = { title: string; onClick?: () => void }
function Button({ title, onClick }: Props) { return <button onClick={onClick}>{title}</button> }

type InputProps = React.ComponentProps<'input'> & { format?: (v: string) => string }
const Input = React.forwardRef<HTMLInputElement, InputProps>((p, ref) => <input ref={ref} {...p} />)
```

#### Hooks 与上下文

```tsx
const Ctx = React.createContext<{ user?: User } | null>(null)
function useUser(){ const ctx = React.useContext(Ctx); if(!ctx) throw new Error('no ctx'); return ctx.user }
```

#### Redux Toolkit 与 Hooks 类型

```ts
import { configureStore } from '@reduxjs/toolkit'
const store = configureStore({ reducer: { /* ... */ } })
type RootState = ReturnType<typeof store.getState>
type AppDispatch = typeof store.dispatch
```

- 优先使用 RTK（切片、immer、内置 thunk），结合 `useAppSelector/useAppDispatch` 提供类型安全。

