### 类型守卫与窄化

#### ToC

- 内置守卫：typeof/instanceof/in
- 自定义守卫与断言函数
- satisfies 与 const 断言

#### 内置守卫

```ts
function f(x: unknown) {
  if (typeof x === 'string') { x.toUpperCase() }
  if (x instanceof Date) { x.getTime() }
  if ('id' in (x as any)) { /* ... */ }
}
```

#### 自定义守卫与断言函数

```ts
function isUser(x: any): x is { id: string } { return x && typeof x.id === 'string' }
function assertNonNull<T>(x: T): asserts x is NonNullable<T> { if (x == null) throw new Error('nullish') }
```

#### satisfies 与 const 断言（TS 4.9+）

```ts
const cfg = { port: 8080 } as const satisfies { port: number };
```

