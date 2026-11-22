### 文件系统 std::filesystem

遍历目录与文件操作：

```cpp
#include <filesystem>
#include <iostream>

int main(){
  namespace fs = std::filesystem;
  for (auto &p : fs::directory_iterator(".")) {
    std::cout << p.path() << "\n";
  }
}
```

常用操作：`exists`、`create_directories`、`remove_all`、`copy`、`rename` 等。

