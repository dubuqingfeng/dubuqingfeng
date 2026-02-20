---
title: 一些软件源的收集
description: "0x01 前言 在国内的大环境下，一些软件使用官方源会有很大的延迟，而使用国内搭建的同步官方源的话，速度会提升很多的，因此，本文总结一些常用的软件源，并不定期更新。"
date: 2016-03-12 13:13
updated: 2016-03-12 20:42
tags: 
  - 软件源
  - Linux
  - Docker
  - 技术
excerpt: 在国内，使用一些常见的软件源会大幅度提升速度，提升工作上的效率，本文总结了一些常用的软件源。
categories: 自由软件
permalink: 201603-some-sources.html
author: admin
toc: true
---

# 0x01 前言

在国内的大环境下，一些软件使用官方源会有很大的延迟，而使用国内搭建的同步官方源的话，速度会提升很多的，因此，本文总结一些常用的软件源，并不定期更新。

# 0x02 Linux
+ [清华源](https://mirrors.tuna.tsinghua.edu.cn/)
+ [中科大](https://mirrors.ustc.edu.cn/)
+ [阿里云](http://mirrors.aliyun.com/)
+ [自由軟體實驗室](http://free.nchc.org.tw/pmwiki/index.php?n=FSLab.MirrorLists)
+ [重庆大学](https://mirrors.cqu.edu.cn/)
+ [浙大镜像](http://mirrors.zju.edu.cn/)
+ [中科院](http://mirrors.opencas.cn/)
+ [网易](http://mirrors.163.com/)
+ [搜狐](http://mirrors.sohu.com/)
+ [北京理工大学](http://mirror.bit.edu.cn/web/)
+ [北京交通大学](http://mirror.bjtu.edu.cn/cn/)
+ [厦门大学](http://mirrors.xmu.edu.cn/)
+ [华中科技大学](http://mirrors.hust.edu.cn/)
+ [Linuxstory](http://mirrors.linuxstory.org/)
+ [首都在线](http://mirrors.yun-idc.com/)
+ [上海交通大学](http://ftp.sjtu.edu.cn/)
+ [兰州大学](http://mirror.lzu.edu.cn/)
+ [哈尔滨工业大学](http://run.hit.edu.cn/html/)
+ [吉林大学](http://mirrors.jlu.edu.cn/)
+ [南信大多火工作室](https://mirrors.duohuo.org/)
+ [江苏开放大学](http://mirrors.jstvu.edu.cn/)

<br />

+ [Ubuntu官方](http://wiki.ubuntu.org.cn/%E6%BA%90%E5%88%97%E8%A1%A8)
+ [Deepin](https://www.deepin.org/mirror.html)
+ [archlinux](https://www.archlinuxcn.org/archlinux-cn-repo-and-mirror/)

以ubuntu为例，需要编辑**/etc/apt/sources.list**文件

# 0x03 Docker
+ [清华源](https://mirrors.tuna.tsinghua.edu.cn/help/docker/)
+ [Daocloud获取Docker](https://get.daocloud.io/)
+ [灵雀云](http://www.alauda.cn/)
+ [时速云](https://www.tenxcloud.com/)


# 0x04 Android

+ [AndroidDevTools](http://www.androiddevtools.cn/)
+ [中科院](http://mirrors.opencas.cn/)

# 0x05 Ruby (gem,bundle)

+ [淘宝](https://ruby.taobao.org/)
+ [山东理工大学](http://ruby.sdutlinux.org/)

配置：

```
$ gem sources --add https://ruby.taobao.org/ --remove https://rubygems.org/
$ gem sources -l
*** CURRENT SOURCES ***
https://ruby.taobao.org
# 请确保只有 ruby.taobao.org
$ gem install rails
*** bundle ***
可以用 Bundler 的 Gem 源代码镜像命令:
$ bundle config mirror.https://rubygems.org https://ruby.taobao.org
```

# 0x06 composer

+ [Packagist](http://pkg.phpcomposer.com/)

配置：

```
例1：修改 composer 的全局配置文件（推荐方式）

打开命令行窗口（windows用户）或控制台（Linux、Mac 用户）并执行如下命令：

composer config -g repo.packagist composer 
https://packagist.phpcomposer.com

例2：修改当前项目的 composer.json 配置文件：

打开命令行窗口（windows用户）或控制台（Linux、Mac 用户），进入你的项目的根目录
（也就是 composer.json 文件所在目录），执行如下命令：

composer config repo.packagist composer https://packagist.phpcomposer.com
上述命令将会在当前项目中的 composer.json 文件的末尾自动添加镜像的配置信息
（你也可以自己手工添加）：

"repositories": {
"packagist": {
"type": "composer",
"url": "https://packagist.phpcomposer.com"
}
}
```

#####0x07 NodeJs npm

+ [淘宝源](https://npm.taobao.org/)
+ [cnpm](https://cnpmjs.org/)

配置：

```
可以使用我们定制的 cnpm (gzip 压缩支持) 命令行工具代替默认的 npm:

$ npm install -g cnpm --registry=https://registry.npm.taobao.org

或者直接通过添加 npm 参数 alias 一个新命令:

alias cnpm="npm --registry=https://registry.npm.taobao.org \
--cache=$HOME/.npm/.cache/cnpm \
--disturl=https://npm.taobao.org/dist \
--userconfig=$HOME/.cnpmrc"

# Or alias it in .bashrc or .zshrc
$ echo '\n#alias for cnpm\nalias cnpm="npm --registry=https://registry.npm.taobao.org \
--cache=$HOME/.npm/.cache/cnpm \
--disturl=https://npm.taobao.org/dist \
--userconfig=$HOME/.cnpmrc"' >> ~/.zshrc && source ~/.zshrc
```
使用方法
```
安装模块：
$ cnpm install [name]
同步模块：
$ cnpm sync connect
```

# 0x08 Python pip

+ [中科大](https://pypi.mirrors.ustc.edu.cn/)
+ [豆瓣](http://pypi.douban.com/)

```
sudo pip install -i http://pypi.douban.com/simple/ xxx
```


# 0x09 maven
+ [阿里](http://maven.aliyun.com/nexus/content/groups/public)

```
在maven的settings.xml 文件里配置mirrors的子节点，添加如下mirror
<mirror>
   <id>nexus-aliyun</id>
   <mirrorOf>*</mirrorOf>
   <name>Nexus aliyun</name>
   <url>http://maven.aliyun.com/nexus/content/groups/public</url>
</mirror> 
```

```
本地配置文件：
<?xml version="1.0" encoding="utf-8"?>
<settings>
<mirrors>
<mirror>
    <id>nexus-aliyun</id>
    <mirrorOf>*</mirrorOf>
    <name>Nexus aliyun</name>
    <url>http://maven.aliyun.com/nexus/content/groups/public</url>
</mirror>
</mirrors>
</settings>
```


