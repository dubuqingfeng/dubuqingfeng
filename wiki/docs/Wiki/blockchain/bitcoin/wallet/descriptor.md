## 输出描述符与 Miniscript

描述符（Descriptors）用声明式语法描述输出模板与密钥来源，实现“可审核、可复现”的地址与脚本生成。

### 典型语法

- `wpkh(key)`、`sh(wpkh(key))`、`wsh(multi(2, key1, key2, key3))`、`tr(key, {script_branches})`
- 支持 key origin 与派生：`[fingerprint/deriv]xpub/...`

### Miniscript

- 将策略映射为可组合、可验证的脚本表达，如 `and_v(v:older(12960), pk(key))`
- 工具可分析可达性、花费路径与大小/权重上限

### 优势

- 规范化：跨钱包/实现的互操作
- 安全：自动检查策略可达性与边界
- 便捷：与 PSBT/硬件钱包良好协作

