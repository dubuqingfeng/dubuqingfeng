### 可选与代数类型：std::optional/std::variant

`std::optional<T>` 表示可有可无的值：

```cpp
#include <optional>
std::optional<int> parse(const char* s);
```

`std::variant` 表示“联合但安全”的代数数据类型，配合 `std::visit` 进行模式匹配：

```cpp
#include <variant>
#include <string>

using Result = std::variant<int, std::string>;

Result f(bool ok){ return ok ? Result{42} : Result{std::string("err")}; }
```

建议：接口返回错误时优先 `expected` 风格（C++23 `std::expected` 或自定义/第三方）。

