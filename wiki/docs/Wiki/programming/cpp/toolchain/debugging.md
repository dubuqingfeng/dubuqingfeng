### 调试（gdb/lldb）

编译带调试信息：`-g -O0` 或 `-g -Og`。

常用命令：

```bash
gdb ./app
(gdb) break main
(gdb) run
(gdb) bt        # 回溯
(gdb) info threads
(gdb) thread apply all bt
```

LLDB 类似：`lldb ./app`，`br set -n main`，`run`，`bt`。

