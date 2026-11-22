---
slug: "/Wiki/blockchain/ethereum/contract/uniswap"
---
### uniswap





#### 参考链接





https://liaoph.com/uniswap-v3-3/



https://github.com/Uniswap/interface

#### 按版本阅读

- V2：用常数乘积和 Pair 储备建立基础；不要将全局储备公式直接套到 V3。
- V3：[跨 Tick Swap 与回调结算](../../defi/uniswap/v3-swap.md)。以 2026-11-19 核查的最新适用 V3 core/periphery 发布为基线，沿源码解释 Router、分段计算、跨初始化 tick、回调付款与余额校验，并提供可复算数值和实际本地 EVM 成功/失败证据。
- V4：singleton、unlock 结算和 Hook 另成体系，见[官方概览](https://docs.uniswap.org/contracts/v4/overview)；不与 V3 调用链混读。

#### 源码样板导航

从[Uniswap 专题导读](./../../defi/uniswap/README.md)选择前置知识，再进入[V3 本地实验](../../defi/uniswap/v3-swap.md#experiment)。实验限本地池与夹具，Router仅源码核查，不是主网或fork验证。返回[DeFi 导读](./../../defi/README.md)或[区块链总导读](../../README.md)。
