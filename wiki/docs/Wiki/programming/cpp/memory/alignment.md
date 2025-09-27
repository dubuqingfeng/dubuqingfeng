### 内存对齐 alignas/alignof

对齐影响性能与 ABI：

```cpp
#include <cstddef>

struct alignas(32) Vec4 { float v[8]; };
static_assert(alignof(Vec4) == 32);
```

注意：自定义对齐需匹配平台支持；与 SIMD/缓存行对齐结合可降低伪共享。

