### 语法与核心概念（ES6+）

#### ToC

- let/const 与暂时性死区
- 解构、展开与默认参数
- 模板字符串与标签模板
- 箭头函数与尾随逗号
- 严格模式与模块默认严格

#### let/const 与暂时性死区

- `let/const` 具有块级作用域；在声明前访问会触发暂时性死区（TDZ）。
- `const` 绑定不可重新赋值，但不保证对象内部不可变（需 `Object.freeze`）。

#### 解构、展开与默认参数

```js
const {a, b: alias = 42, ...rest} = obj;
const [x, , y = 0] = arr;
const args = [...list, 123];
function f({p = 1} = {}) {}
```

#### 模板字符串与标签模板

```js
const s = `hello ${name}`;
// 标签模板可对字面量分片进行处理
```

#### 箭头函数与 this

- 箭头函数没有自己的 `this/arguments`，`this` 由词法作用域决定；不适合做方法或构造函数。

#### 严格模式

- ESM 文件默认严格模式；CJS 需 `'use strict'` 开启；严格模式下静默错误会抛异常（如重复属性、不可写属性赋值）。

