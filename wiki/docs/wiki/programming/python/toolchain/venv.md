### 虚拟环境 venv

隔离依赖与解释器，多项目并行；常见于 `venv`、`virtualenv`、`conda`。

#### 创建与激活

```bash
python -m venv .venv
# macOS/Linux
source .venv/bin/activate
# Windows PowerShell
.venv\Scripts\Activate.ps1
deactivate
```

#### 多版本管理（pyenv）

```bash
pyenv install 3.12.4
pyenv local 3.12.4   # 生成 .python-version
```

#### 对比

- venv：标准库、轻量；
- conda：带包管理与二进制依赖；
- poetry：集成依赖与虚拟环境管理（基于 venv）。
