### Web 基础与框架概览

常见框架：Flask、Django、FastAPI；WSGI/ASGI、Uvicorn/Gunicorn；路由、中间件、依赖注入。

#### WSGI vs ASGI

- WSGI：同步接口，适合 Flask/Django 传统视图；
- ASGI：异步接口，支持长连接/WebSocket，FastAPI/Starlette。

#### 最小示例

Flask（WSGI）：

```py
from flask import Flask
app = Flask(__name__)

@app.get('/ping')
def ping():
    return {'pong': 'ok'}

# gunicorn -w 4 'app:app'
```

FastAPI（ASGI）：

```py
from fastapi import FastAPI
app = FastAPI()

@app.get('/ping')
async def ping():
    return {'pong': 'ok'}

# uvicorn app:app --workers 4 --host 0.0.0.0 --port 8000
```

#### 部署与常见问题

- 静态资源：由反向代理（Nginx）或框架静态目录提供；
- 日志：结构化（json）、统一时区、反代真实 IP；
- 配置：环境变量/12-Factor，区分 dev/staging/prod。
