---
title: 捕捉 android 网络流量及中间人攻击
description: "0x01 前言： 作为开发者或者安全研究员，开发或分析一些与网络相关的程序时，必然要涉及到 HTTP 协议，而了解信息的传输，是非常必要的。所以我们需要抓取并控制到网路流量，并且需要对中间人攻击有一定的认识。 TOC： 前言 捕捉网络流量 Charles抓包工具 利用ettercap进行中间人 MITM工具 中间人的利用 参考链接"
date: 2016-06-17 17:42
updated: 2016-06-18 18:34
tags: 
  - Android安全
  - mitm
  - 技术
excerpt: 一些捕捉 android 网路流量的方式以及认识中间人攻击的方式和利用
categories: Android安全
permalink: 201606-capture-android-mitm.html
author: admin
toc: true
---

# 0x01	前言：
作为开发者或者安全研究员，开发或分析一些与网络相关的程序时，必然要涉及到 HTTP 协议，而了解信息的传输，是非常必要的。所以我们需要抓取并控制到网路流量，并且需要对中间人攻击有一定的认识。

TOC：
+ 前言
+ 捕捉网络流量
+ Charles抓包工具
+ 利用ettercap进行中间人
+ MITM工具
+ 中间人的利用
+ 参考链接

# 0x02    捕捉网络流量

需要一些nc、wireshark、tcpdump for Android软件。

wireshark可通过以下代码进行安装：

```
brew cask install wireshark
```

netcat可通过以下代码进行安装；

```
brew install netcat
```
然后下载好**TCPdump for android**，注意是可执行文件，不是文件扩展名为bin的。

然后usb线连接好设备，或者启动虚拟机。

进入**platform-tools**文件夹，输入以下的命令：

```
查看连接的设备：
./adb devices
通过adb执行android命令
./adb shell
su
mkdir /data/tcpdump/
chmod 755 /data/tcpdump/
```
通过数据线或者其他adb push的方式，将**tcpdump**复制到设备的**/data/tcpdump/**文件夹。

在android设备里执行以下命令：
```
./adb shell
su
chmod 755 /data/tcpdump/tcpdump
或者是以下这个：
./adb shell chmod 755 /data/tcpdump/tcpdump
```
然后确认一下android设备中是否安装有**netcat**，可以通过nc命令来判断是否安装。

以下是：在android端转发流量的命令

```
./data/tcpdump/tcpdump -w - | nc -l -p 31337
```

需要配置adb的端口转发：

```
./adb forward tcp:12345 tcp:31337
```

然后pc端需要nc转发流量，然后wireshark进行分析。

```
netcat 127.0.0.1 12345 | wireshark -k -S -i -
```

安装配置好捕捉流量，wireshark分析：

<img src="https://dubuqingfeng.oss-cn-hongkong.aliyuncs.com/blog/tech/blog201606-capture-android-mitm-01.gif" class="responsive-img" />


# 0x03    Charles抓包工具的使用

安装并配置Charles。

```
brew cask install charles
```

捕捉HTTP流量：

<img src="https://dubuqingfeng.oss-cn-hongkong.aliyuncs.com/blog/tech/blog201606-capture-android-mitm-02.png" class="responsive-img" />

手机上设置代理，如下所示：

<img src="https://dubuqingfeng.oss-cn-hongkong.aliyuncs.com/blog/tech/blog201606-capture-android-mitm-03.gif" class="responsive-img" />

捕捉HTTPS流量：

安装证书：

下载Charles证书http://www.charlesproxy.com/getssl/，输入文件名进行安装。

<img src="https://dubuqingfeng.oss-cn-hongkong.aliyuncs.com/blog/tech/blog201606-capture-android-mitm-04.gif" class="responsive-img" />

在Charles的工具栏上点击设置按钮，选择SSL Proxy Settings；选项卡的Locations表单可以填写要抓包的域名和端口，点击Add按钮，在弹出的表单中Host填写域名，比如填*，Port填443。默认的空值表示应用于所有地址。

<img src="https://dubuqingfeng.oss-cn-hongkong.aliyuncs.com/blog/tech/blog201606-capture-android-mitm-05.png" class="responsive-img" />

0x04    利用ettercap进行中间人
ettercap是linux上常用的一种中间人工具，作为网上的一种sniffer，曾经利用其接收到机房的广播出来的数据包。

MAC系统上如何利用其进行中间人攻击呢？

ettercap安装与配置：

```
sudo brew install ettercap --with-gtk+
sudo port install driftnet
```

而driftnet是一款简单而使用的图片捕获工具，可以很方便的在网络数据包中抓取图片。可以利用其和ettercap进行抓取局域网中的图片。

ARP欺骗：

```
ettercap -i eth0 -T -M arp:remote /10.0.0.1/ // 欺骗局域网内所有主机
其他的命令可以通过-h --help来查看帮助。
```


# 0x05    MITM工具

常见的有dSploit，zANTI。

android设备使用dSploit进行中间人攻击：

<img src="https://dubuqingfeng.oss-cn-hongkong.aliyuncs.com/blog/tech/blog201606-capture-android-mitm-06.png" class="responsive-img" />

# 0x06    中间人的利用

当成为中间人了以后，就可以进行各种利用了，比如查看流量，网页劫持，提取密码，会话劫持等。

以弹对话框为例：

<img src="https://dubuqingfeng.oss-cn-hongkong.aliyuncs.com/blog/tech/blog201606-capture-android-mitm-07.png" class="responsive-img" />

# 0x07    参考链接

热爱互联网，对操作系统和网络安全有狂热的追求，专业不限；熟悉漏洞挖掘、网络安全攻防技术，了解常见黑客攻击手法；掌握基本开发能力，熟练使用C/C++语言；对数据库、操作系统、网络原理有较好掌握；具有软件逆向，网络安全攻防或安全系统开发经验者优先。

+ [bettercap](https://www.bettercap.org/)
+ [Linux渗透之Ettercap详解](https://www.91ri.org/4408.html)
+ [内网渗透小tricks](http://xkon.github.io/2015/04/17/%E5%86%85%E7%BD%91%E6%B8%97%E9%80%8F%E5%B0%8Ftricks/)