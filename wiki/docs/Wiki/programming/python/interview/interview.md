### Python 面试题整理

按主题汇总：语法题、并发/异步、性能优化、Web 实战、数据结构/算法应用等。

#### 高频题要点

- 可变默认参数陷阱、深浅拷贝；
- 迭代器/生成器、装饰器与闭包、`nonlocal`；
- GIL 影响与线程/协程/多进程适用场景；
- `asyncio` 基本模型与取消/超时；
- 数据结构复杂度（list/dict/set）与常用 `collections`；
- Web：WSGI vs ASGI、部署（Gunicorn/Uvicorn/Nginx）；
- 性能：`multiprocessing`、`numba`/`cython` 场景；
- 工具链：venv/poetry、打包与版本锁定。

#### 代码题模板

```py
def solve():
    import sys
    data = sys.stdin.read().strip().split()
    # 解析输入并求解
    print(...)

if __name__ == '__main__':
    solve()
```

注意事项：明确时间/空间复杂度、边界条件与异常输入；给出测试样例与复杂度分析。
