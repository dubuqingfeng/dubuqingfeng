### Lambda 与捕获

Lambda 是匿名函数对象，可捕获外部变量：

```cpp
#include <vector>
#include <algorithm>

int main() {
  int base = 10;
  std::vector<int> v{1,2,3};
  std::for_each(v.begin(), v.end(), [base](int &x){ x += base; });
}
```

捕获方式：按值 `[=]`、按引用 `[&]`、显式列出 `[base]`；尽量最小化捕获集合。

