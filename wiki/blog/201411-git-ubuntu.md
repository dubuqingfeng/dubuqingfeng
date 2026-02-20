---
title: ubuntu 下 git 入门与配置
description: "0x01 git GIT最初是由Linus Benedict Torvalds为了更有效地管理Linux内核开发而创立的分布式版本控制软件，与常用的版本控制工具如CVS、Subversion不同，它不必服务器端软件支持，速度和效率也有着相当程度的提高。"
date: 2014-11-18 14:51
updated: 2014-10-19 12:42
tags: 
  - git
  - ubuntu
  - 技术
excerpt: 记录一下在ubuntu下的git入门及其配置，以及git常用的命令。
categories: git
permalink: 201411-git-ubuntu.html
author: admin
toc: true
---

# 0x01 git

GIT最初是由Linus Benedict Torvalds为了更有效地管理Linux内核开发而创立的分布式版本控制软件，与常用的版本控制工具如CVS、Subversion不同，它不必服务器端软件支持，速度和效率也有着相当程度的提高。

# 0x02 准备安装

从这里 http://git-scm.com/download 下载GIT或者使用wget命令获取

```
$ tar -zxf git-1.9.1.tar.gz
$ cd git-1.9.1
$ make prefix=/usr/local all
$ sudo make prefix=/usr/local install
```

或者使用命令

Debian/Ubuntu

	$ apt-get install git

Fedora
	
	$ yum install git

GIT默认安装在 /usr/local/bin ，安装之后可以验证一下是否安装好

```
$ whereis git
git: /usr/local/bin/git
$ git –version
git version 1.9.1
$ git –help
```

设置用户信息：

```
$ git config –global user.name “dubuqingfeng”//给自己起个用户名
$ git config –global user.email “1135326346@qq.com”//填写自己的邮箱
```

再验证一下配置信息

	$ git config –list

其实这些配置是存放在个人主目录下的 .gitconfig 文件中的

```
$ cat ~/.gitconfig
[user]
name = dubuqingfeng
email = 1135326346@qq.com
```

# 0x03 配置

	$ ssh-keygen -t rsa -C “1135326346@qq.com”//填写email地址，然后一直“回车”ok

打开本地..\.ssh\id_rsa.pub文件。此文件里面内容为刚才生成人密钥。

登陆github系统。点击右上角的Account Settings—>SSH Public keys —> add another public keys

把你本地生成的密钥复制到里面（key文本框中）， 点击add key 就ok了
接着打开git测试连接是否成功

```
$ ssh -T git@github.com
```

如果提示：Hi dubuqingfeng You’ve successfully authenticated, but GitHub does not provide shell access. 说明连接成功了

# 0x04 git基础使用

1.创建新仓库
创建新文件夹，打开，然后执行
	
	git init

以创建新的 git 仓库。
2.检出仓库
执行如下命令以创建一个本地仓库的克隆版本：

	git clone /path/to/repository

如果是远端服务器上的仓库，命令会是这个样子：

	git clone username@host:/path/to/repository

3.添加与提交
可以计划改动（把它们添加到缓存区），使用如下命令：

	git add 
	git add *

这是 git 基本工作流程的第一步；使用如下命令以实际提交改动：
	
	git commit -m “代码提交信息”

现在，改动已经提交到了 HEAD，但是还没到远端仓库。

4.推送改动

改动现在已经在本地仓库的 HEAD 中了。执行如下命令以将这些改动提交到远端仓库：
	
	git push origin master

可以把 master 换成想要推送的任何分支。

如果还没有克隆现有仓库，并欲将仓库连接到某个远程服务器，可以使用如下命令添加：

	git remote add origin 

如此你就能够将改动推送到所添加的服务器上去了。

5.更新
要更新你的本地仓库至最新改动，执行：

	git pull
# 0x05 gitg

在ubuntu里使用过gitg的客户端，基本不大的项目够用。
