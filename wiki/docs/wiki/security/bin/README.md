---
title: "安全：二进制"
slug: /wiki/security/bin
---

# 安全：二进制

“二进制安全”通常指两件事：**理解一个已编译程序的实际行为**，以及**判断它在面对恶意输入时是否容易被利用**。前者靠格式、符号、反汇编和动态调试；后者靠缓解措施、输入边界和代码审计。

这篇文章覆盖 ELF/PE/Mach-O 的基本结构、常见 hardening、静态/动态分析工具、漏洞类型和样本分析的安全边界。不会给出可直接武器化的利用代码。

## 1. 可执行文件格式 {#format}

| 平台 | 格式 | 关键结构 |
| --- | --- | --- |
| Linux/Android | ELF | ELF header、program header（段）、section header（节）、动态表 |
| Windows | PE/COFF | DOS header、NT headers、section table、导入/导出表 |
| macOS/iOS | Mach-O | mach header、load commands、segments、symbol table |

```bash
file ./bin
readelf -hW ./bin          # ELF header
readelf -lW ./bin          # segments / program headers
readelf -SW ./bin          # sections
readelf -dW ./bin          # dynamic section
```

> 段（segment）决定加载时怎么映射；节（section）更多是链接/调试信息。分析运行时行为优先看 program header 和动态表。

## 2. 常见缓解措施 {#hardening}

| 机制 | 作用 | 检查 |
| --- | --- | --- |
| PIE | 代码段随机化 | `readelf -h` 的 `Type: DYN` |
| NX/DEP | 栈/堆不可执行 | `GNU_STACK` 是否 `RW` 而非 `RWE` |
| RELRO | 保护 GOT | `GNU_RELRO`；Full RELRO 还有 `BIND_NOW` |
| Stack Canary | 检测栈溢出 | 符号 `__stack_chk_fail` |
| FORTIFY | 编译期/运行期检查 | `_chk` 符号 |
| ASLR | 地址空间随机化 | 系统级，不是二进制属性 |

```bash
checksec --file=./bin
# 没有 checksec 时：
readelf -hW ./bin | grep Type
readelf -lW ./bin | grep -E 'GNU_STACK|GNU_RELRO'
readelf -dW ./bin | grep -E 'BIND_NOW|FLAGS'
nm -D ./bin 2>/dev/null | grep -E '__stack_chk_fail|_chk'
```

> `checksec` 的结果是“编译/链接属性”，不等于“不可利用”。逻辑漏洞、越权、命令注入与这些缓解措施无关。

## 3. 静态分析：先看结构和字符串 {#static}

```bash
strings -a -n 6 ./bin | head -50
objdump -d ./bin | head -80
objdump -T ./bin | grep -i ' UND '
nm -C ./bin | head
```

关注：

- 导入表里是否有 `system`、`popen`、`execve`、`memcpy`、`sprintf` 等高风险函数；
- 是否有硬编码路径、密钥、内网地址、调试字符串；
- 反汇编中的边界检查、长度计算、错误处理；
- 符号是否被 strip；有符号时先看函数名和调用关系。

```bash
# 反编译（按工具可用性选择）
ghidra ./bin
rizin -A ./bin
```

## 4. 动态分析：观察真实行为 {#dynamic}

```bash
strace -f -s 200 -o /tmp/trace.txt ./bin
ltrace -f -o /tmp/ltrace.txt ./bin
gdb ./bin
lldb ./bin
```

- `strace` 看系统调用：文件、网络、进程、权限。
- `ltrace` 看库调用：`malloc`、`memcpy`、`strcmp`。
- 调试器看寄存器、栈、堆和调用链；配合 `core` 文件分析崩溃。
- 在隔离环境运行不可信样本；不要在生产机/带凭证的环境执行。

## 5. 常见漏洞类型 {#vulns}

| 类型 | 根因 | 典型信号 |
| --- | --- | --- |
| 栈溢出 | 拷贝长度超过栈缓冲区 | 崩溃时返回地址被覆盖、canary 触发 |
| 堆溢出 | 堆块边界计算错误 | `malloc`/`free` 异常、堆元数据损坏 |
| UAF | 释放后继续使用 | 崩溃在已释放对象、类型混淆 |
| 整数溢出 | 长度/索引计算回绕 | 超大长度、负数转无符号 |
| 格式化字符串 | 用户输入作为格式串 | `printf(buf)`、`%n` |
| 命令/路径注入 | 拼接后交给 shell/文件 API | `system`、`popen`、路径穿越 |
| 竞态 | TOCTOU、并发共享状态 | 时间窗口、重复请求 |

审计顺序：

1. 找到外部输入（argv、env、文件、网络、IPC）；
2. 跟踪到长度/索引/路径/命令拼接；
3. 检查边界、符号、整数类型和错误处理；
4. 用最小输入验证崩溃/异常，再判断可利用性。

## 6. 利用缓解与绕过（概念层） {#exploitation}

现代利用通常不是“直接跳 shell”，而是组合：

- 信息泄露绕过 ASLR/PIE；
- ROP/JOP 绕过 NX；
- GOT/函数指针改写绕过 Full RELRO 的难度；
- 堆布局/类型混淆绕过分配器检查；
- 逻辑漏洞绕过所有内存缓解。

> 防御视角更重要：减少攻击面、开启所有可用缓解、用内存安全语言重写解析器、对输入做长度/类型/路径校验、最小权限运行、沙箱化。

## 7. 恶意样本分析的安全边界 {#malware}

- 使用隔离 VM/专用分析机，禁用共享剪贴板/共享目录/网络（或使用受控网络）。
- 分析前打快照；分析后回滚。
- 不要在宿主机直接运行样本；不要用真实账号/证书。
- 记录哈希（SHA-256）、文件类型、首次发现时间、来源。
- 动态分析时监控进程、文件、注册表/配置、网络连接和持久化项。
- 报告里区分“观察到的行为”和“推断的意图”。

## 8. 最小检查清单 {#checklist}

- [ ] `file`/`readelf` 确认架构、位数、动态/静态链接。
- [ ] `checksec` 或手工确认 PIE/NX/RELRO/Canary。
- [ ] 导入表和高风险函数有清单。
- [ ] 外部输入到危险 sink 的路径有审计记录。
- [ ] 崩溃/异常有最小复现输入和调用栈。
- [ ] 不可信样本在隔离环境分析，分析后回滚。
- [ ] 修复建议优先“减少攻击面/内存安全”，而不是只加检测。

## 相关阅读 {#related}

- [安全](./../README.md)
- [安全：Android](./../android/README.md)
- [安全：Web](./../web/README.md)
- [Linux](../../devops/linux/README.md)
