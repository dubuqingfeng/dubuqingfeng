### 文件系统（fs）

异步优先、避免长时间同步 I/O；大文件使用流式处理，注意权限与跨平台路径。

#### 要点
- API 风格：回调、Promise（`fs/promises`）、同步；
- 路径：`path` 与 `URL`、`path.join/resolve`、`__dirname` 在 ESM 中的替代；
- 权限与安全：目录遍历防护、`umask`、原子写（临时文件 + rename）；
- 大文件：流式读写、`pipeline`/`stream.promises.pipeline`；
- 监控：`fs.watch` vs `chokidar`。

#### 跨平台与编码

- 换行：`os.EOL` 或在读取后统一规范化；
- 编码：文本优先 `utf8`，谨慎处理含 BOM 文件（`fs.readFile(path, { encoding: 'utf8' })` 会去除 BOM）。

#### 临时目录与清理

- 使用 `os.tmpdir()`/`fs.mkdtemp` 创建唯一临时目录；
- 进程退出时清理，或使用 `tmp`/`tempy` 等库托管生命周期。
