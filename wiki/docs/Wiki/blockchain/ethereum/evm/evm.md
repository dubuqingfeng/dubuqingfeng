### evm





#### 存储部分



EVM内存中的存储部分（Storage）。
可以把它视为数据库。每个合约都管理自己的存储变量。它是一个键值数据存储区（256位的键和值）。就每次执行使用的gas而言，读取和写入的成本比较高。



EVM内存中的内存部分（Memory）。
这是一个临时存储。执行终止后，数据将丢失。您可以分配复杂的数据类型，如数组和结构体。



EVM内存中的回调数据部分（Calldata）。
它可以被认为是一个调用栈。它是临时的、不可修改的。它存储EVM的执行数据。



状态变量和局部变量（对状态变量的引用）存储在存储部分中。函数参数位于内存部分中。





#### 字节码



#### 参考链接



https://eth.wiki/en/concepts/evm/ethereum-virtual-machine-(evm)-awesome-list

yellow paper	

https://ethereum.github.io/yellowpaper/paper.pdf