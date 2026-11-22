### 原型与原型链

#### ToC

- 对象与 [[Prototype]]
- 构造函数与 new
- `class` 语法糖
- 继承与 super

#### 对象与 [[Prototype]]

- 每个对象都有 `[[Prototype]]` 指向其原型；属性访问会沿原型链向上查找。
- 相关 API：`Object.create(proto)`、`Object.getPrototypeOf(obj)`、`Object.setPrototypeOf(obj)`。

#### 构造函数与 new

`new F()` 等价于：

1) 创建空对象并将其 `[[Prototype]] = F.prototype`
2) 执行 `F.call(this, ...)`
3) 若构造函数返回对象则返回该对象，否则返回 `this`

#### class 语法糖与继承

```js
class A { m() {} }
class B extends A { constructor() { super(); } }
```

- `class` 本质仍是基于原型的封装；方法定义在 `prototype` 上；
- `super` 在子类构造函数中必须先调用以初始化 `this`。

