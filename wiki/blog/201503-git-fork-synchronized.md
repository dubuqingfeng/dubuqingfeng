---
title: git-fork 项目后与原项目进行同步
description: "0x01 与原项目进行同步 在github里，每当fork一个项目后，如何保持与原作者的同步？一般可以以下几步。"
date: 2015-03-04 12:22
updated: 2015-03-04 12:22
tags: 
  - git
  - fork
  - 技术
excerpt: 每fork一个项目后，当进行改动，然后push上去以后，如何进行保持与原作者的同步，以及git的一些协同命令和Pull Request。
categories: git
permalink: 201503-git-fork-synchronized.html
author: admin
toc: true
---


# 0x01 与原项目进行同步

+ 在github里，每当fork一个项目后，如何保持与原作者的同步？一般可以以下几步。

1.首先clone自己，从git获取自己仓库的内容。

    git clone https://github.com/xxx.git

2.添加远程仓库
添加远程仓库的别名，获取远程仓库的内容并合并。如果有冲突则需要手动解决冲突。

    git remote add username https://github.com/xxx.git
    git fetch username
    git merge username/master
    git rebase username/master

3.提交改动，推到远程的master分支。

    git commit -m "merge from username-xx"
    git push -u origin master

4.查看本地仓库

    git remote -v
    git branch -a

# 0x02 git协同命令

如果是个人产品，不是那种产品需要上线的服务。

当使用git进行协作开发的时候，可以设置好几个分支，以主分支master为开发版，Release分支为发行版。

而产品类型的git协作时，主分支只用来分布重大版本，日常开发应该在另一条分支上完成。我们把开发用的分支，叫做Develop。

Git创建Develop分支的命令：
	
	git checkout -b develop master
将Develop分支发布到Master分支的命令：

切换到Master分支

	git checkout master
对Develop分支进行合并

	git merge --no-ff develop
默认情况下，Git执行"快进式合并"（fast-farward merge），会直接将Master分支指向Develop分支。
其他分支：

功能（feature）分支

预发布（release）分支

修补bug（fixbug）分支

# 0x03 Pull Request

> 当某个人fork项目后，并推送改动后如何处理？

这时会收到一个open的Pull Request，然后决定是否合并，不合并可以忽略。
