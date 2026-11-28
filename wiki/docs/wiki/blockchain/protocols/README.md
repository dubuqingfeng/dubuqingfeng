---
title: "协议分析"
slug: "/Wiki/blockchain/protocols"
description: "按统一模板分析 Polymarket、four.meme、Aave、PancakeSwap、Jupiter、Raydium、Morpho、Pendle、Chainlink 等协议的资产流、状态机、源码入口与失败模式。"
---

# 协议分析

这里不是“项目介绍”，而是按同一组问题拆协议：

1. **谁把什么资产交给谁？** 角色、抵押品、份额、债务、订单和结算资产。
2. **链上到底存了什么状态？** 账户/合约、余额、索引、队列、oracle 和参数。
3. **价格/利率/清算/结算由谁决定？** 公式、预言机、拍卖、订单簿或管理员。
4. **源码或链上入口在哪？** 固定仓库/提交、合约地址、IDL/ABI；闭源部分明确写“未取得源码”。
5. **什么情况下会坏？** 预言机、流动性、清算、治理、升级、MEV、会计和实现边界。

> 每篇都区分“源码/文档核查”和“未执行的运行期行为”。协议参数会变，阅读时以文中固定版本和链上当前值为准。

## 协议列表 {#list}

| 协议 | 类别 | 链 | 这篇想回答的问题 |
| --- | --- | --- | --- |
| [Polymarket](./polymarket.md) | 预测市场 | Polygon | YES/NO 份额如何铸造、交易、解析和赎回？ |
| [four.meme](./four-meme.md) | Meme 发射台 | BNB Chain |  bonding curve 如何定价，毕业后流动性去哪？ |
| [Aave](./aave.md) | 借贷 | Ethereum / 多链 | 存款、债务指数、健康因子和清算如何联动？ |
| [PancakeSwap](./pancakeswap.md) | DEX | BNB Chain / 多链 | V2/V3/Infinity 的定价、LP 和治理如何演进？ |
| [Jupiter](./jupiter.md) | 聚合器 | Solana | 报价、路由、RFQ 和交易落地分别信任什么？ |
| [Raydium](./raydium.md) | DEX / Launchpad | Solana | AMM、CLMM 与 LaunchLab 的流动性和定价边界 |
| [Morpho](./morpho.md) | 借贷 | Ethereum / 多链 | 隔离市场、LLTV、oracle 和 curator 如何分担风险？ |
| [Pendle](./pendle.md) | 收益代币化 | Ethereum / 多链 | PT/YT/SY 如何拆分本金与收益，AMM 如何定价？ |
| [Chainlink](./chainlink.md) | 预言机 / 跨链 | 多链 | Data Feeds、CCIP、VRF 的信任边界在哪？ |
| [Uniswap V4](./uniswap-v4.md) | DEX | Ethereum / 多链 | singleton、hooks、flash accounting 改变了什么？ |
| [Curve](./curve.md) | StableSwap / 稳定币 | Ethereum / 多链 | StableSwap 与 crvUSD 的软清算如何工作？ |
| [Lido](./lido.md) | 流动性质押 | Ethereum | stETH 份额、oracle 报告和提款队列如何对账？ |
| [Kamino](./kamino.md) | 借贷 | Solana | Obligation、close factor、oracle 和 auto-deleverage |
| [Meteora](./meteora.md) | DLMM | Solana | bin 流动性、动态费用和 swap 路径 |

## 阅读模板 {#template}

每篇尽量按这六层写：

- **角色与资产流**：谁付款、谁收份额、谁承担债务、谁负责结算。
- **核心状态**：账户/合约字段、索引、队列、参数。
- **机制**：定价、利率、清算、预言机、费用、治理。
- **源码/链上入口**：固定提交或地址；闭源就明确标注。
- **失败模式**：经济攻击、预言机、流动性、清算、治理、实现。
- **检查清单**：读哪些事件/账户，核对哪些不变量。

## 证据边界 {#evidence}

- 源码链接固定到文中写明的提交；合约地址以官方文档/区块浏览器为准。
- 闭源或只有前端/API 的协议（如 four.meme、Jupiter 的核心路由）不会伪造“源码级调用链”。
- 参数、费率和地址会变；文中数字是核查时的快照，不构成当前部署证明。
- 本目录不替代审计报告，也不把“读过源码”写成“已验证运行”。

返回[区块链索引](./../README.md)。
