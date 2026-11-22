## ABI 进阶：动态类型与布局

Solidity ABI 采用“头（head）+尾（tail）”布局：

- 头部固定 32 字节对齐，每个动态元素在头部占 32 字节“偏移量”（相对整个编码起始位置的字节偏移）
- 尾部顺序存放动态数据：长度（32 字节）+ 实际数据（右填充到 32 字节倍数）

适用范围：`bytes`、`string`、动态数组 `T[]`、元素含动态的 `tuple`/`struct`。

### 函数选择器与参数编码

- 函数调用数据：`4B selector || ABI-encoded(args...)`
- 选择器：方法签名做 Keccak-256，取前 4 字节，例如：`transfer(address,uint256)`

### 动态数组示例（伪十六进制）

函数签名：`f(uint256 a, uint256[] b, bytes c)`

1) 选择器：`sel = keccak("f(uint256,uint256[],bytes)")[:4]`
2) 头部（3 × 32B）：
   - `a`
   - 偏移 `offset_b`（到 b 的尾部数据起点）
   - 偏移 `offset_c`（到 c 的尾部数据起点）
3) 尾部依次：
   - `b.length`、`b[0]`、`b[1]`、…（每项 32B）
   - `len(c)`、`c bytes...`（右填充到 32B 整）

偏移量计算：以“编码起点”为 0，头部大小为 `32 * 参数个数`；若有嵌套，偏移指向其最外层动态块。

### 二维数组与嵌套 tuple

- 二维动态：外层数组尾部中每个元素位置再写入“该元素的偏移”，随后是内层数组块（长度 + 元素）
- struct/tuple：扁平化后按元素顺序编码；若包含动态，头部写偏移，尾部再跟数据块

### 编码细节

- 数值类型右对齐（高位填零），big-endian 表示
- 地址与 `uint160` 视作 20B 值，仍右对齐到 32B
- `bytesN`（N ≤ 32）为静态类型，右对齐，空余零填充
- `bytes`/`string`：头部偏移，尾部`len + data + padding`

### 事件编码（topics/data）

- `topic0 = keccak("EventName(T1,T2,...)")`（非 `anonymous`）
- `indexed` 参数进入 topics（静态值直接写，动态值写 Keccak-256 哈希）
- 其它参数按 ABI 编码进 `data`

### Go 代码提示（head/tail 计算）

```go
type Encoded struct{ Head, Tail []byte }

// 伪代码：遍历参数，静态写 head，动态先占位偏移，收集数据块并回填偏移
```

### 常见陷阱

- 将偏移解释为“相对头部”的偏移（应为相对整段）
- 忘记尾部的右填充或长度字段单位（字节）
- 事件 indexed 动态参数在 topics 中是哈希，不是原始值
