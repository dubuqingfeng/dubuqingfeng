---
title: 比特币新特性：Schnorr 签名系列：初识 Schnorr 签名
description: "在隔离见证（Segwit）实行以后，令开发者振奋的 Schnorr 签名也将踏上日程。本文主要讲述比特币新特性：Schnorr 签名系列的初识 Schnorr 签名。介绍什么是 Schnorr 签名，以及发展历程，如何实现 Schnorr 的多重签名，还有 BCH 在 Schnorr 签名上的探索。 0x01 Schnorr 签名介绍"
date: 2020-12-19 11:42
updated: 2020-12-19 11:42
tags: 
  - bitcoin
  - schnorr
  - 技术
categories: bitcoin
excerpt: 在隔离见证（Segwit）实行以后，令开发者振奋的 Schnorr 签名也将踏上日程。本文主要讲述比特币新特性：Schnorr 签名系列的初识 Schnorr 签名。介绍什么是 Schnorr 签名，以及发展历程，如何实现 Schnorr 的多重签名，还有 BCH 在 Schnorr 签名上的探索。
permalink: 202012-bitcoin-schnorr-start.html
author: admin
toc: true
---


在隔离见证（Segwit）实行以后，令开发者振奋的 Schnorr 签名也将踏上日程。本文主要讲述比特币新特性：Schnorr 签名系列的初识 Schnorr 签名。介绍什么是 Schnorr 签名，以及发展历程，如何实现 Schnorr 的多重签名，还有 BCH 在 Schnorr 签名上的探索。

## 0x01	Schnorr 签名介绍

在前不久，比特币 Core 开发者将实现 BIP-340 Schnorr 签名的提交合并到了 [Secp256k1](https://github.com/bitcoin-core/secp256k1)，而 Bitcoin 代码也在 10 月 15 日时合并了[相关提交](https://github.com/bitcoin/bitcoin/pull/19953)，这将意味着会在 12 月份发布 0.21 的版本中，有相关的实现。并且按照 BIP 9 的软分叉规范，大概在近几年内，会进行实际投票通过软分叉的形式激活这些特性。

在比特币上实现 Schnorr 签名具体可以追溯到 [BIP340]()，其中讨论了 Bitcoin Schnorr 的相关标准与实现，讲了一些特性，包括与之前的 ECDSA 的对比，以及具体的标准规范，具体的分析在下面 Schnorr 实现一节参阅。

在 2017 年 8 月份，比特币激活了隔离见证（SegWit），解决了之前遗留的延展性问题，将签名部分的数据移到了见证部分，进一步节省了区块体积。

Schnorr 签名算法由 Claus Schnorr 于 1991 年申请专利，在 2008 年到期，在专利到期以后，该算法就可以免费使用。在 2019 年 5 月份，BCH 正式发布新版本，其中实现了 Schnorr 签名。在今年 7 月的时候，Zcash 基金会发布了新的 FROST （Flexible Round-Optimized Schnorr Threshold），具体参阅[https://www.zfnd.org/blog/frost-update/](https://www.zfnd.org/blog/frost-update/)，相类似的签名优化方案有 Two-Round，在之后的系列会有相关介绍。

在以前，比特币签名方案一直是 ECDSA，签名方案的选择，要有公开，隐私性强，破解难度高，体积小等优点，在当时 RSA 和 ECDSA 的选择下，最后选择了 ECDSA，不得不说这是正确的决定，相对来说，ECDSA 和 RSA 相比之下，密钥更短，计算更快，安全性更强。在研究区块体积和验证速度上，出现了 Schnorr 签名方案，这种方案和传统的 ECDSA 相比，公钥体积可以更小，并且支持线性，不需要每个输入都对应一个公钥，类似于叠加的方式，签名时组合出最终的公钥，而验证的时候，也极大的节省了时间和空间。

在加密算法上，Schnorr 签名同样可以使用椭圆曲线，甚至可以使用和比特币同样的椭圆曲线secp256k1，这意味着，切换的成本降低了许多。

那么具体什么是 Schnorr 签名，如何验证 Schnorr 签名？如何在 Schnorr 签名上实现 m-n 多重签名。

首先我们的私钥可以认为成一个特别大随机的数字 x，乘以在椭圆曲线上的 G 点，而这个过程是不可逆的，最后结果在大量的运算下是无法推到出之前的特别大随机的数字即私钥，这将是我们讨论的基础，而数字签名的过程中，某个人想要对一段信息做签名，如何验证其的合法性，确保其拥有一定的承诺。这里这一段消息称之为 m，m 和 x 之间使用乘法进行组合，再进行椭圆曲线函数的计算。如果这样推导公钥的话，很有可能会反推出私钥，通过进行相约，会有暴露私钥的风险，所以在签名的过程中，引入了一个每次都不同的随机值k，进行组合。其中我们将椭圆曲线计算称之为 G，因此可得以下公式：

```
(k + m*x)*G = k*G + (m*x)*G
```

按上面公式进行扩展：

这里将 ```k*G``` 称之为 R，在之后会称之为签名的一部分，```x*G```称之为 P，可以理解为私钥对应的椭圆曲线公钥。

这里 ```H（R，m）``` 为对消息 m 进行哈希处理时，使用 R，有时也写成 ```H(R||m)```，以表达追加。

```
R = k * G
s = k + H（R，m）* x
```

以此计算出了 R，s 两值，这将作为签名的 R、S 。在比特币中，这对（*R*，*s*）使用64个字节进行编码，其中前32个字节表示*R*，后32个字节表示*s*。

在验证时，会提供 R，s，P。P 为私钥 x 对应的公钥，且无法反推出私钥。

主要检查：

由 s 值的定义：

```
s = k + H（R，m）* x
```

等式两边同时乘以椭圆曲线 G：

```
s * G = k * G + H（R，m）* x * G
```

那么可得：

```
s * G = R + H（R，m）* P
```

这个显然当提供 R，s，P 且正确的时候，是可以成立的。

但是这个时候，是容易受到 “related-key attacks”（相关密钥差分攻击） 的影响，第三方会有替换的思路，利用信息输入上的差别对输出结果变化的影响，从而破解相关的密钥。

于是提出了将公钥也参与哈希运算，那么最终的 s 和证明公式会变成：

```
s * G = R + H(R || P || m)* P
```



## 0x02		Schnorr 签名特性



+ 线性

在介绍的 Schnorr 签名的过程以后，不可避免的会被其独有的特性而感兴趣，它是如何实现线性的呢。

当消息 m 相同时，Schnorr 可以做合并的操作，可以在验证时，仅做一次，而之前的 ECDSA，需要进行每一个签名的验证。

用公式表达如下：

```
SchnorrSign（x 1，k 1，m）+ SchnorrSign（x 2，k 2，m）= SchnorrSign（x 1 + x 2，k 1 + k 2，m）
```

推导过程如下：

```
SchnorrSign（x 1，k 1，m）+ SchnorrSign（x 2，k 2，m）

=（k 1 + H（R || P || m）* x 1）+（k 2 + H（R || P || m）* x 2）

=（k 1 + k 2）+ H（R || P || m）*（x 1 + x 2）

= SchnorrSign（x 1 + x 2，k 1 + k 2，m）
```

+ 公钥格式更小

比特币使用的 ECDSA 签名（DER编码）的长度为 70 或 71 个字节，而 Schnorr 签名仅为 64 个字节（R，s 各 32 字节）。

+ 禁止随机数重用

## 0x03		Schnorr 多签名

在近期，签名导致的事故也有所发生。

总所周知，多重签名方案需要一组多个签名密钥（*X* *1*，*X* *2*，…，*X* *n*），这些签名密钥共同为消息生成签名。最常见的就是 Pay to Script Key Hash，P2SH。按照 btc.com 的脚本统计，类似的交易也在不断增长中。

那么 Schnorr 如何实现多重签名呢？

这时，提出了 MuSig 的方案。

Schnorr 的核心内容是其线性，根据其特性，多重签名的过程主要包括以下内容：

+ 各方构造对应的承诺 commitments
+ 各方公开随机数 nonce，和所有各方验证 commitments = H（随机数nonce）
+ 各方进行计算和发送签名

多签名的核心问题，是如何更好地进行密钥聚合（Key Aggregation）。

一开始的方案是各方每一方都有对应的公钥，这些公钥都在椭圆曲线的点上，因此可以进行加法运算进行聚合，那么根据椭圆曲线的加法之后，是一个新点，并且也将签名的 R，s 也做累加，然后进行验证。

但是这种方案，容易受到 Rogue Key Attack 类似的攻击，一些 CTF 比赛甚至有类似的[题目](https://www.anquanke.com/post/id/188174)，和上面的差分攻击不同，这个思路是攻击者去欺骗别人一起聚合，那么可以得到一个最终的聚合点，这时，攻击者再减去自己的点，也可以正常广播出符合签名校验的内容。

于是在这个过程中进行了升级，将中间的过程也进行公开，然后可以各方进行验证，引入随机数nonce，先发布承诺（对随机数的哈希运算的值），而并不会直接得到最终的聚合密钥。

具体过程可以详细查阅[论文](https://eprint.iacr.org/2018/068.pdf)。

这个过程整体用了三轮，而在最近，Blockstream 研究人员发表了一篇新论文《MuSig2: Simple Two-Round Schnorr Multi-Signatures》（https://eprint.iacr.org/2020/1261），有兴趣的可以简单看看，具体会在之后的系列进行相关分析。

## 0x04		BCH  Schnorr 签名

在 2019 年 5 月，BCH 常规硬分叉升级中，支持了 Schnorr 签名，而在当年 11 月的升级中，更是直接对 OP_CHECKMULTISIG 支持了  Schnorr 签名，@[checksum0](https://gist.github.com/checksum0)，发布了利用 Schnorr 签名的多重签名的示例：https://gist.github.com/checksum0/47d5ee7ee513a9d2e9fcb0b2761c7c73

目前来说，BCH 是不支持 Schnorr 和 ECDSA 混合进行多签名的，在未来大多数钱包和应用支持 Schnorr 签名，这样在区块体积和验证速度上会有一定的效果和提升。

以 2b5fe26f6f903021b343da52d8d8b316c88986c480cfd6fc80ffbc027cbd2039 这笔交易为例：

将 bitcoincash:qr2n5jt6sfnd06ts25l9dqg2sycc8q6qvv6eyk65lq 的输出进行了花费。

构造出的验证脚本如下：

```
OP_DUP
OP_HASH160
d53a497a8266d7e970553e56810a813183834063
OP_EQUALVERIFY
OP_CHECKSIG
```

通过示例中的私钥公钥，最后构造出以下原始交易：

```
01000000016377d5d92f7244deddab0c3cf0268d2005eee238491fa6c8cb40e43b0e98245e010000006441f7f9f9ca507031b26c972fc23ab9b052843f7c3b3ee4e29acdd4dc09dbc03addf9f07e069d52009f5ded90a741c5223b90b20e39ebf9af37b0ca3ef1010959c0412102ff08fda3ea73d50eb7c52f82b55d7883e1843c7e6c80ba0daf08032f2e88692efeffffff020000000000000000866a4c834243482069732061626f757420676976696e672070656f706c65207468652066726565646f6d20746f206d616b65207468656972206f776e2063686f696365732c20746f20707572737565207468656972206f776e2068617070696e6573732c20686f7765766572207468657920696e646976696475616c6c7920736565206669742e3a9598000000000017a914785ca29645c56f51ff2581dd29e812764fe79636871ae60800
```

并且在第一个输出里，opreturn 对 ```BCH is about giving people the freedom to make their own choices, to pursue their own happiness, however they individually see fit. ```消息进行了编码。



## 0x05		参考链接

Schnorr Signatures for secp256k1：https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki

隐私加密系列｜MuSig Schnorr签名方案：https://www.qukuaiwang.com.cn/news/147169.html

MuSig2: Simple Two-Round Schnorr Multi-Signatures：https://www.chainnode.com/doc/4807

MuSig：一个新的多重签名标准：https://blockstream.com/2019/02/18/zh-musig-a-new-multisignature-standard/

Simple Schnorr Multi-Signatures with Applications to Bitcoin：https://eprint.iacr.org/2018/068.pdf

Key Aggregation for Schnorr Signatures：https://blockstream.com/2018/01/23/en-musig-key-aggregation-schnorr-signatures/

https://bch.btc.com/2b5fe26f6f903021b343da52d8d8b316c88986c480cfd6fc80ffbc027cbd2039