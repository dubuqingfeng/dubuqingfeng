---
title: Claude & Codex 优化与配置
description: "用 Agent / Skills / Memory / Plugin / Ultrathink 稳定产出，再用 Spec-Driven + TDD 把需求与质量落到可验证的结果。"
date: 2026-02-18 09:00
updated: 2026-02-18 09:00
tags:
  - AI
  - Claude
  - Codex
  - Agent
  - 技术
categories: AI
permalink: 20260218-claude-codex-agent-skills-memory-ultrathink.html
author: codex, claude
toc: true
---

这里主要是对于 claude、codex 的相关实践总结，相关的边界、回路、验收是否清楚。

## Agent

默认约定 `AGENTS.md` 或者 `CLAUDE.md`：

- 目标：产出什么（文件/PR/命令清单/说明）
- 禁区：不做什么（不升级依赖、不大范围重构、不跑破坏性命令）
- 约束：目录/权限/网络/输出格式
- 验收：怎么证明完成（测试、构建、可复现步骤）

对 Agent，相关 prompt 要求其遵守“三步走”：

- 先定位：读关键文件，关键逻辑，别上来就改
- 先小改：改最小可行点（能编译/能测/能跑），提升效率
- 再扩面：同类问题批量化时，给出“影响面 + 回滚点”

一些基础的 agent 命令：

https://github.com/dubuqingfeng/dotfiles/blob/master/coding-agent/docs/codex.md

相关的一些 agent 项目：

* https://github.com/mhattingpete/claude-skills-marketplace
* https://github.com/affaan-m/everything-claude-code
* https://github.com/peterfei/ai-agent-team

## Skills

用过/常用的一些相关 skills（按场景）：

- `siyuan-notes`：查找、检索、浏览思源笔记内容
- `skill-creator`：创建/改造 skill，把高频工作流固化下来
- `skill-installer`
- `skill-from-github`
- `evm-blockchain-rpc`

## Memory：只记“能复用的结论”

如果是代码 Agent 的话，不追求记住所有细节，只记三类东西：

- 项目级事实：测试命令、目录约定、发布方式
- 个人偏好：输出风格、语言、是否要链接/引用
- 本次变更：改了哪些文件、为什么改、怎么回滚

目前来说有以下参考：

claude

* https://github.com/thedotmack/claude-mem

openclaw

* https://github.com/geq1fan/openclaw-memory
* https://github.com/oceanbase/powermem
* https://github.com/zilliztech/memsearch

其他的一些项目

* 一个开源的、专为 AI Agent 设计的上下文数据库，[OpenViking](https://github.com/volcengine/OpenViking)

* 一个本地优先（local-first）的 AI 对话客户端：它将每一次对话建模为节点化的 DAG（树 + 分支），并提供显式的 Context Box，用于可控地组装提示词上下文。[prompt-tree](https://github.com/yxp934/prompt-tree)

* 为 AI Agent 打造的长期记忆操作系统，[Memory Palace](https://github.com/AGI-is-going-to-arrive/Memory-Palace)

* 一个基于uri而不是RAG的轻量级、可回滚、可视化的 **AI 外挂MCP记忆库**。[nocturne_memory](https://github.com/Dataojitori/nocturne_memory)

* [nowledge](https://mem.nowledge.co/zh/docs/ai-now)

## Ultrathink：只在高风险时开启

在这些场景要求开启 ultrathink，否则就按常规执行：

- 改动量比较大
- 安全/权限/资金/隐私相关

## Spec-Driven Development

写 spec 很合适，以及按 spec 落地。关键是 spec 要标准：

```md
## Goal
## Non-goals
## Architecture
## API / UX (examples)
## Edge cases
## Acceptance criteria (checklist)
```

相关项目可以参考：

- [spec-kit](https://github.com/github/spec-kit)：Spec-Driven Development 工具包 + `specify` CLI
- [OpenSpec](https://github.com/Fission-AI/OpenSpec)：围绕“规格/说明”驱动交付的项目
- [codex-skill-spec](https://github.com/grid-oaa/codex-skill-spec/tree/main)
- [claude-code-spec-workflow](https://github.com/Pimzino/claude-code-spec-workflow)

几个点：

- 先写“项目原则”（质量、测试标准、UX 一致性、性能要求），后面就不容易跑偏
- 再写 spec（讲清 what/why），再补技术计划（讲清 how），最后拆 task 执行
- 规格文档不是一次性产物，而是后续实现/验收的基准

## Test-Driven Development

推荐按场景选策略：

- 简单功能：单个方法、逻辑直观，先实现，后验证（补回归 + 边界）。
- 复杂业务逻辑：多分支判断、算法计算、状态转换，用 TDD：先验证，后实现。
- 存量代码修改：先加“安全防御”（关键路径回归 + 典型 case），再动实现。
- 提示词难以描述需求：测试用例就是最好的需求文档，用 TDD 让代码直接表达需求。

一个可使用的 TDD 节奏：

1) 先写测试：把输入/输出、边界条件、失败场景写死
2) 再写实现：只做到测试通过（先别急着“优化/重构”）
3) 最后重构：保持测试一直绿

### 测试用例的文档怎么补全

很多测试“有”，但不可读。建议把测试当成一份可执行说明书，至少能回答四个问题：**测什么、在什么前提下、怎么触发、期望是什么**。

建议补齐这几项（放到测试文件注释、或相关的 `README.md` 都可以）：

- 用例名：一句话讲清场景与期望
- Given/When/Then：前置条件 / 行为 / 期望结果
- 覆盖面：主路径、关键分支、边界条件、失败场景
- 不变量：业务约束（例如金额不能为负）

一个常用的用例描述模板：

```md
## Test Cases

### Case: <一句话描述场景>
- Given: <初始状态/依赖数据/配置>
- When: <调用/事件/输入>
- Then: <可观察结果>
- Notes: <为什么需要这个用例 / 对应的 bug / 风险点>
```

如果规则多，就再加一张用例表（等价于“可执行的规格清单”）：

```md
| Case | Input | Precondition | Expected | Edge |
|------|-------|--------------|----------|------|
| ...  | ...   | ...          | ...      | ...  |
```

测试用例文档的最低标准是：换一个人 / AI 接手，能用这份说明在不读实现的情况下补齐新用例/定位失败原因。通常需要再补两类信息：

- 数据与依赖：哪些是 fixtures，哪些要 mock，哪些来自线上数据
- 可重现：用例是否确定性（时间/随机数/并发/网络），如何让它稳定可复现
