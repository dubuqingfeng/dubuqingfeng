### Python 语法速览

记录常用语法与易错点：缩进、切片、可变/不可变类型、推导式、上下文管理器等。

#### 变量与作用域、函数与装饰器

- 作用域：LEGB（Local/Enclosing/Global/Builtins）；
- `global`/`nonlocal` 修改外层绑定；
- 装饰器是高阶函数的语法糖：

```py
def log(func):
    def wrapper(*a, **kw):
        print('call', func.__name__)
        return func(*a, **kw)
    return wrapper

@log
def add(x, y):
    return x + y
```

#### 推导式（列表/字典/集合）

```py
squares = [x*x for x in range(10) if x % 2 == 0]
index = {u.id: u for u in users}
tags = {t.strip().lower() for t in raw_tags}
```

生成器表达式（惰性）：`sum(x*x for x in nums)`。

#### with/contextlib

```py
from contextlib import contextmanager

@contextmanager
def open_text(path, mode='r'):
    f = open(path, mode, encoding='utf-8')
    try:
        yield f
    finally:
        f.close()

with open_text('a.txt') as f:
    print(f.read())
```

