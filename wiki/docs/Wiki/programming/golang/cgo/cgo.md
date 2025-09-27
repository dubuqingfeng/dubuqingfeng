### cgo



#### ToC



+ 基础概念与启用
+ 语法与类型映射
+ 内存与指针规则
+ 字符串/字节互转
+ 构建与链接（#cgo）
+ 调用示例：Go 调 C
+ 调用示例：C 调 Go（c-shared/c-archive）
+ 并发与线程注意事项
+ 性能与测试
+ 交叉编译与平台差异
+ 常见错误与排查
+ 参考链接



#### 基础概念与启用



cgo 允许在 Go 中直接调用 C 代码与库，或将 Go 代码导出给 C 调用。

- 启用：默认在本机构建时开启；通过 `CGO_ENABLED=0/1` 控制
- 依赖编译器：需要系统 C 编译器（如 gcc/clang）
- 入口：`import "C"`，并在其上方的注释块里写 `#include`、`#cgo` 等预处理指令

示例结构：

```go
/*
#include <stdlib.h>
*/
import "C"
```



#### 语法与类型映射



- 访问 C 符号：`C.funcName`、`C.TypeName`、`C.variable`
- C 头文件：写在 `import "C"` 前的注释块中使用 `#include` 引入
- 常见类型映射（部分）：
  - `C.char` ↔ `byte`/`rune`（依使用场景），字符串需转换
  - `C.int` ↔ `C.int`（Go 侧保持 `C.int`，或显式转换 `int(C.int)`）
  - 指针：`*C.char`、`*C.void`，用 `unsafe.Pointer` 做桥接



#### 内存与指针规则（重要）



Go 与 C 的内存管理不同，必须遵守以下规则：

- 不要把 Go 指针存到 C 内存中（C 中长期保存 Go 指针是禁止的）
- 不要将指向 Go 内存的指针在 C 侧跨越调用生命周期持有
- C 需要长期持有的内存请用 `C.malloc` 分配，并在合适时机 `C.free`
- 需要把 Go 值传给 C 保持时，使用 `cgo.Handle` 进行“句柄化”

句柄示例：

```go
import "runtime/cgo"

// 创建句柄并交给 C 持有（以 uintptr 形式）
h := cgo.NewHandle(myGoValue)
// 传给 C: (C.uintptr_t)(uintptr(h))
// 从 C 回传后在 Go 侧恢复：
v := h.Value().(MyType)
// 用完后释放，避免泄漏
h.Delete()
```



#### 字符串/字节互转



常见转换：

```go
// Go -> C 字符串（需要释放）
cs := C.CString(goStr)
defer C.free(unsafe.Pointer(cs))

// C -> Go 字符串（复制一份）
goStr := C.GoString(cstr)

// C 指针 + 长度 -> Go []byte
bs := C.GoBytes(unsafe.Pointer(ptr), C.int(n))
```



#### 构建与链接（#cgo）



在 `import "C"` 上方的注释中使用 `#cgo` 指定编译/链接参数：

```go
/*
#cgo CFLAGS: -I/usr/local/include/mylib
#cgo LDFLAGS: -L/usr/local/lib -lmylib
#cgo pkg-config: libssl
#include <mylib.h>
*/
import "C"
```

说明：

- `CFLAGS`/`CPPFLAGS`：头文件、宏定义等
- `LDFLAGS`：库路径、依赖库（顺序重要，通常依赖放后）
- `pkg-config`：通过 pkg-config 自动注入 cflags/libs



#### 调用示例：Go 调 C



简单示例：调用 C 的加法与打印。

```go
package main

/*
#include <stdio.h>

static int add(int a, int b) { return a + b; }
*/
import "C"

import (
    "fmt"
)

func main() {
    s := C.add(3, 5)
    C.printf(C.CString("C add: %d\n"), s) // 演示用途，CString 需释放，可分两步写并 free
    fmt.Println("Go side: ", int(s))
}
```

注意：上例中直接内联 `C.CString` 会泄漏，正确方式：

```go
msg := C.CString("C add: %d\n")
defer C.free(unsafe.Pointer(msg))
C.printf(msg, s)
```



#### 调用示例：C 调 Go（c-shared/c-archive）



方式一：产出共享库供 C 链接（Linux/macOS）：

```bash
go build -buildmode=c-shared -o libcalc.so
```

方式二：产出静态库与头文件：

```bash
go build -buildmode=c-archive -o libcalc.a
```

导出 Go 函数给 C 使用：

```go
package main

/*
#include <stdint.h>
*/
import "C"

//export Sum
func Sum(a, b C.int) C.int {
    return a + b
}

func main() {} // c-archive/c-shared 需要 main 包
```

生成的头文件中会有 `int32_t Sum(int32_t a, int32_t b);` 等声明，C 侧直接链接调用。

提示：`//export` 需紧贴 Go 函数声明之上；文件内必须包含一次 `import "C"`。



#### 并发与线程注意事项



- 每次 cgo 调用会切到一个 OS 线程，阻塞 C 调用不会阻塞 Go 调度器（但会占用线程）
- 若 C API 绑定线程上下文（如 GUI、TLS、驱动），Go 侧使用 `runtime.LockOSThread()` 固定线程
- C 回调 Go：只能调用通过 `//export` 导出的函数；注意避免在回调里长时间阻塞
- `errno`：可在 C 调用返回后立即读取 `C.errno`（线程局部），不要跨函数长期持有



#### 性能与测试



- cgo 调用有明显开销（微秒级），高频场景建议批量化或纯 Go 实现
- 基准测试：使用 `go test -bench=.` 对比 cgo 与纯 Go 的开销
- 数据竞争：`go test -race`，C 侧多线程需与 Go 同步策略配合



#### 交叉编译与平台差异



- 交叉编译时常需指定交叉编译器，例如：

```bash
GOOS=linux GOARCH=amd64 CGO_ENABLED=1 CC=x86_64-linux-gnu-gcc go build
```

- 静态链接：glibc 环境下完全静态链接困难，推荐基于 musl（如在 Alpine/musl 交叉编译）
- Windows：可用 `x86_64-w64-mingw32-gcc` 作为 CC



#### 常见错误与排查



- undefined reference/找不到符号：检查 `#cgo LDFLAGS` 库顺序与 `-L` 路径
- header not found：检查 `#cgo CFLAGS: -I...` 路径与 SDK 安装
- invalid pointer/崩溃：违反指针规则（把 Go 指针存在 C，或跨调用持有 Go 内存）
- memory leak：`C.CString`、`C.malloc` 未 `C.free`
- cross-compile 失败：未设置合适 `CC` 或目标库缺失



#### 参考链接



- 官方文档（cmd/cgo）：https://pkg.go.dev/cmd/cgo
- cgo 指南：
  - https://go.dev/blog/cgo
  - https://go.dev/cmd/cgo/
- cgo.Handle（Go 1.17+）：https://pkg.go.dev/runtime/cgo#Handle
- 构建模式（c-archive/c-shared）：https://pkg.go.dev/cmd/go#hdr-Build_modes
