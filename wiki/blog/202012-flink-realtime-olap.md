---
title: 实时 OLAP， 从 0 到 1
description: "概要： 高正炎，BTC.com"
date: 2020-12-15 10:42
updated: 2020-12-15 10:42
tags: 
  - flink
  - olap
  - clickhouse
  - btc.com
  - 技术
categories: flink
excerpt: BTC.com 是一家区块链数据与服务提供商，目前提供各种区块链方向的解决方案。在业务发展的过程中，有着各种实时和准实时以及 OLAP 的需求场景，面临着从 0 到 1 的挑战；Flink 作为计算基础设施组件，业务目前覆盖了在线业务支持、实时报表统计等，处于不断发展中。本次主要介绍 BTC.com 实时计算的起步与当前的 OLAP 技术架构。
permalink: 202012-flink-realtime-olap.html
author: admin
toc: true
---


#### 概要：


高正炎，BTC.com

整理：赵宇彤（Apache Flink China 社区志愿者）, 苗文婷（Apache Flink China 社区志愿者）

摘要：本文主要介绍BTC.com团队，在实时 OLAP 方面的技术演进，主要包括5个方面：业务背景：BTC.com主要做比特币或者以及区块链相关的一些业务；机遇挑战：原有架构存在的挑战；架构演进：从技术选型，到整个架构搭建；架构优化：基于 Flink 和 ClickHouse 做优化；未来展望；

## 0x00	TOC

## 0x01 业务背景

### 1.1 业务介绍 - ABCD

<img src="https://dubuqingfeng.oss-cn-hongkong.aliyuncs.com/blog/tech/202012-flink-realtime/00.png" class="responsive-img" />

首先介绍一下我们的业务。总结来说就是ABCD, A是人工智能机器学习，B是区块链，C代表云，D是数据。这些模块不是独立的，是可以结合起来的。为什么这几年人工智能，区块链这么热门呢？因为大数据给了他们很好的支持。

### 1.2 业务介绍 - 区块链技术方案提供商

<img src="https://dubuqingfeng.oss-cn-hongkong.aliyuncs.com/blog/tech/202012-flink-realtime/01.png" class="responsive-img" />

区块链是一个不可逆的分布式账本，我们的作用是让大家能更好的浏览账本。挖掘账本背后的信息数据。目前比特币的数据量级大概在几十亿到百亿，数据量大概在数10T，当然我们也有其他的一些货币，包括一些以太坊等的货币，还有智能合约分析的服务。

总的来说我们是一家区块链技术方案的提供商。俗话说得好，炒币毁一生，挖矿富三代。所以我们也提供挖矿的服务，跟其他做金融的银行一样，我们也有很多的 OLAP 需求，比方说黑客攻击了一些交易所，或者是一些供应链上的攻击，他想把钱转走。这时需要经过链上的操作，包括洗钱，在链上我们可以对它进行分析，分析他去了你的交易所进行洗钱，以及交易上的跟踪，统计数据。

### 0x03 机遇挑战

2.1 之前的架构

<img src="https://dubuqingfeng.oss-cn-hongkong.aliyuncs.com/blog/tech/202012-flink-realtime/02.png" class="responsive-img" />


大概2018年的时候，竞争对手比较少，我们整体的架构就是上图。底层是区块链的节点，通过 Parser 不断的解析到 MySQL ，再从 MySQL 抽取到 Hive 或者 Presto ，从 Spark 跑各种定时任务分析数据，再通过可视化的查询，得到报表或者数据。架构的问题也是显而易见的：

+ 不能做到实时处理数据
+ 有单点的问题，比方说某一条链路突然挂掉，这个时候整个环节都会出现问题。

2.2 遇到的需求与挑战

<img src="https://dubuqingfeng.oss-cn-hongkong.aliyuncs.com/blog/tech/202012-flink-realtime/03.png" class="responsive-img" />


+ 效率问题，这对于我们来说是非常常见的 SQL。表大概在几十亿的量级，跑这种 SQL ，可能需要很长时间， sql查询比较慢，严重影响我们的统计效率。
+ 数据不是实时的，需要等到一定的时间才会更新，比方说昨天的数据今天才能看到。
+ 实时需求，比方说实时风控，每当区块链出现一个区块，我们就要对它进行分析，但是区块出现的时间是随机的。缺乏完整的监控，有时候作业突然坏了，或者是没达到指标，我们不能及时知道。

2.3 技术选型我们需要考虑什么

<img src="https://dubuqingfeng.oss-cn-hongkong.aliyuncs.com/blog/tech/202012-flink-realtime/04.png" class="responsive-img" />


在技术选型的时候我们需要考虑什么呢？首先是缩容。今年（2020年）行情不太好，大家都在尽力缩减成本，更好的活下去。在成本有限的情况下，我们如何能做更多的东西，必须提高自身的效率，同时也要保证质量。所以我们需要找到一种平衡，在成本效率还有质量这三者之间进行一定的平衡。

## 0x04  架构演进

### 3.1 技术选型

<img src="https://dubuqingfeng.oss-cn-hongkong.aliyuncs.com/blog/tech/202012-flink-realtime/05.png" class="responsive-img" />


俗话说的好，工具选的好，下班下的早，关于是否引入 Flink，我们想了很久，它和 Spark 相比优势在哪里？我们实际调研以后，发现 Flink 还是有很多优势，比方说灵活的窗口，精准的语义，低延迟，支持秒级的，实时的数据处理。

因为团队本身更熟练 Python ，所以我们当时就选择了 PyFlink ，有专业的开发团队支撑，近几个版本变化比较大，实现了很多功能。在实时 OLAP 方面，数据库我们采用了 ClickHouse 。

### 3.2 为什么使用 ClickHouse 

<img src="https://dubuqingfeng.oss-cn-hongkong.aliyuncs.com/blog/tech/202012-flink-realtime/06.png" class="responsive-img" />


为什么要使用 ClickHouse ？首先是快，查询的效率高。字节跳动，腾讯，快手等大公司都在用，老板觉得靠谱。同时我们也有 C++方面的技术积累，使用起来比较容易，成本不是太高。

### 3.3 实时 OLAP 架构

<img src="https://dubuqingfeng.oss-cn-hongkong.aliyuncs.com/blog/tech/202012-flink-realtime/07.png" class="responsive-img" />


于是我们就形成了上图的架构，底层是数据源，包括区块链的节点，右边的这些，通过 Parser 解析到 Kafka ，Kafka 负责对接 Flink 和 Spark 任务，Flink 把数据输出到 MySQL 和 ClickHouse 。支持报表导出，数据统计，数据同步，OLAP 统计。我们的基础架构，比较适合中小公司，大公司比较复杂，中间会加很多 Kafka 。

数据治理方面，我们参考了业界的分层，分成了原始层、明细层、汇总层以及应用层。

我们还有机器学习的任务，也在这上面跑的。这些都部署在 k8s 平台上。

### 3.4 架构演进历程

<img src="https://dubuqingfeng.oss-cn-hongkong.aliyuncs.com/blog/tech/202012-flink-realtime/08.png" class="responsive-img" />


我们的架构演进过程如上图，从2018年的 Spark 和 Hive ，到后来的 Tableau 可视化，今年接触了 Flink ，下半年开始使用 ClickHouse ，后来 Flink 任务比较多了，我们开发了简易的调度平台，开发者只需要上传任务，就会定时或者实时的跑任务。

### 3.5 架构演进思考

<img src="https://dubuqingfeng.oss-cn-hongkong.aliyuncs.com/blog/tech/202012-flink-realtime/09.png" class="responsive-img" />


+ 为什么演进这么慢，因为区块链的发展还没有达到一定量级，不可能像某些大公司，有上亿 B 级别或者 PB 级别的数据量。我们的数据量没有那么大，区块链是一个新鲜的事物，没有一定的历史。另外的问题就是钱不够，能用钱解决的问题都不是问题。我们的人员不足，人员成本上也有所控制。

+ 刚才讲的架构，我们总结了它适合怎样的企业。首先是有一定的数据规模，比方说某个企业 MySQL 只有几千万的数据，用 MySQL , Redis , MongoDB 都可以，就不适合这套架构。其次是需要一定的成本控制，这一整套成本算下来比 Spark 那一套会低很多。要有技术储备，要开发了解相关的东西。

+ 区块链数据的特点。数据量比较多，历史数据基本上是不变的，实时数据相对来说是更有价值的，数据和时间是有一定的关联的。

### 3.6 实时 OLAP 产生的价值

<img src="https://dubuqingfeng.oss-cn-hongkong.aliyuncs.com/blog/tech/202012-flink-realtime/10.png" class="responsive-img" />

+ 适合的是最好的，不要去盲目的追求新技术，比如说数据湖，他虽然挺好，但是我们的量级用不到，只有当达到一定的量级，才会考虑那些。
+ 我们不考虑建设技术中台，因为我们本来是一个中小公司，人员不是特别多，部门沟通起来比较容易，没有太多的隔阂，没有发展到一定的组织规模，所以我们没有打算发展技术中台，数据中台，我也劝大家，没有达到一定的量级的公司，不要去盲目跟风上中台。
+ 我们达到的效果是缩短了开发的时长，减少作业的运行时间。

## 0x04  架构优化

### 4.1 Flink 和 ClickHouse

<img src="https://dubuqingfeng.oss-cn-hongkong.aliyuncs.com/blog/tech/202012-flink-realtime/11.png" class="responsive-img" />


Flink 和 ClickHouse 之间有一些联动，我们自定义了三个工作。

+ 自定义 sink 。
+ ClickHouse 要一次性插入很多数据，需要控制好写入的频次，优先写入本地表，耗时比较多。
+ 我们主要用在智能合约的交易分析，新增的数据比较多，比较频繁，每几秒就有很多数据。数据上关联比较多。

### 4.2 ClickHouse 遇到的问题

<img src="https://dubuqingfeng.oss-cn-hongkong.aliyuncs.com/blog/tech/202012-flink-realtime/12.png" class="responsive-img" />

+ 批量导入时失败和容错。
+ Upsert 的优化。
+ 开发了常用 UDF ，大家知道 ClickHouse 官方是不支持 UDF  的吗？只能通过打补丁，保证 ClickHouse 不会挂。

我们也在做一些开源方面的跟进，做一些补丁方面的尝试，把我们业务上，技术上常用的 UDF ，集合在一起。

### 4.3 批量导入策略

<img src="https://dubuqingfeng.oss-cn-hongkong.aliyuncs.com/blog/tech/202012-flink-realtime/13.png" class="responsive-img" />

+ 历史数据，可以认为是一种冷数据，相对来说不会经常改变的。导入的时候按照大小切分，按照主键排序，类似于 bitcoind ，它底层的 Checker 和 Fixer 工作，导入过程中及时报警和修复工作。做 CheckPoint 和修复工作，在导入过程中及时去报警和修复工作。

比方说导入某一个东西失败了，我们如何更好的发现这些东西，以前+ 话，只能去人肉监控。

+ 实时数据，不断的解析实时数据，大家可能对重组，51%的概念不太熟悉，我给大家简单讲一下，大家可以看到这一条最长的链，也是最重要的链。

他上面一条链是一个重组并且分叉的一条链，比方说有一个攻击者或者是有一个矿工，他去挖了上面那一条链，最终的结果是他这一条链被废弃掉了，拿不到任何奖励，

如果超过51%的算力，就会达到这样的效果，成为最长的链，这个是累计难度比较高的，这个时候我们会认为导入失败，在实时数据中导入失败，是一个不完整的分叉。

比方说是上一部分，我们是可以认为从导入失败的一种情况，我们会利用回撤的功能，不断的把它回滚回去，进行重组，直到他满足最完整的那一条链。当然我们也会设置一些记录和 CheckPoint ，这里的 CheckPoint 和 Flink 的 CheckPoint 的概念是不太一样的。

它是区块链方面的 CheckPoint ，区块链有一个币种叫 bch ，会定义 CheckPoint，当满足一定的长度的时候，它无法再回滚回去，这正好就避免了攻击者去攻击他。我们主要是利用 CheckPoint 记录信息，防止它回滚，同时我们还会按照级别/表记录，批量插入的失败或者成功，如果失败就会进行重试，进行报警回滚等操作。

### 4.4 Upsert 的优化

<img src="https://dubuqingfeng.oss-cn-hongkong.aliyuncs.com/blog/tech/202012-flink-realtime/14.png" class="responsive-img" />


ClickHouse 不支持 Upsert ，主要在 sdk 方面做兼容，之前是直接往 Mysql 写数据，目标就是 sql 语句，修改对应的 sdk 增加临时小表的 join ，通过 join 临时小表，进行 Upsert 的操作。

给大家举个例子，区块链地址账户余额，就像银行的账户余额，必须非常的精确。

### 4.5 Kubernetes 方面优化

<img src="https://dubuqingfeng.oss-cn-hongkong.aliyuncs.com/blog/tech/202012-flink-realtime/15.png" class="responsive-img" />

Kubernetes 方面的优化。Kubernetes 是一个很完整的平台。

+ 高可用的存储，在早期的时候，我们就尽可能的将服务部署在 Kubernetes ，包括 Flink 的集群，基础的业务组件，币种节点，ClickHouse 节点，在这方面 ClickHouse 做的比较好，方便兼容，做高可用操作。
+ 支持横向扩展。
+ 服务发现方面，我们做了一些定制。

### 4.6 如何保证一致性？

<img src="https://dubuqingfeng.oss-cn-hongkong.aliyuncs.com/blog/tech/202012-flink-realtime/16.png" class="responsive-img" />

+ 采用 Final 进行查询，等待它的数据合并完成。
+ 在数据方面的话，实现幂等性，保证他的唯一，通过主键排序，整理出来一组数据，再写入。
+ 写入异常时就及时修复和回填，保证最终一致性。

### 4.7 监控

<img src="https://dubuqingfeng.oss-cn-hongkong.aliyuncs.com/blog/tech/202012-flink-realtime/17.png" class="responsive-img" />

使用Prometheus作为监控工具。使用方便，成本较低。

## 0x05  未来展望

### 5.1 从 1 到 2

<img src="https://dubuqingfeng.oss-cn-hongkong.aliyuncs.com/blog/tech/202012-flink-realtime/18.png" class="responsive-img" />


+ 扩展更多的业务和数据。之前我们的业务模式比较单一，只有数据方面的统计，之后会挖掘更多信息，包括链上追踪，金融方面的审计。
+ 赚更多的钱，尽可能的活下去，我们才能去做更多的事情，去探索更多的盈利模式。
+ 跟进 Flink 和 PyFlink 的生态，积极参与开源的工作，优化相关作业。探索多 sink 方面的工作，原生 Kubernetes 的实践。

### 5.2 从 2 到 3

<img src="https://dubuqingfeng.oss-cn-hongkong.aliyuncs.com/blog/tech/202012-flink-realtime/19.png" class="responsive-img" />

+ 数据建模的规范，规定手段，操作。
+ Flink 和机器学习相结合。
+ 争取拿到实时在线训练的业务，Flink 做实时监控，是非常不错的选择。大公司都已经有相关的实践。包括报警等操作。

### final

<img src="https://dubuqingfeng.oss-cn-hongkong.aliyuncs.com/blog/tech/202012-flink-realtime/20.png" class="responsive-img" />

	总的来说的话，路漫漫其修远兮，使用 Flink 真不错。谢谢大家。

## 资料

大会网址：https://2020.flink-forward.org.cn/