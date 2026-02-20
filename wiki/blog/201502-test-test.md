---
title: Hello,World!
description: "0x01 搭建环境 Linux(Ubuntu)"
date: 2015-02-10 12:11
updated: 2015-02-10 12:11
tags: 
  - github pages
  - pelican
  - 技术
excerpt: 这是搭建pelican后的第一篇文章，还将会修改主题，建立一种编辑器环境。本文记述了如何搭建pelican的环境，写作环境，主题的编写，pelican插件配置，以及程序后续维护，域名、Rss等服务配置。
categories: test
permalink: 2015-create-blog.html
author: admin
toc: true
---

#  0x01 搭建环境

>Linux(Ubuntu)

```bash
Virtualenv

sudo pip install virtualenv
```

>
>MAC

```
pip install pelican markdown

pelican-quickstart
```

#  0x02 写作环境
>Markdown

主要采取一款开源在线的markdown编辑器，并计划在其基础上进行改进，使其更加符合个人习惯。

#  0x03 修改主题
>Dubuqingfeng

主题在bootstrap的样式和最近的material design材料样式之间纠结，在看了pelican的bootstrap的主题以后，想自己写一个主题，于是就去找关于material design设计的网站方面的资料，一开始谷歌推出这种设计语言的时候，大量应用于安卓应用，以摆脱应用风格不统一的问题，一些谷歌web网页也采取了这种设计。找到了多种设计框架，有material for bootstrap，materialize，...

然后看了这两个官网，觉得materialize更简单，并且有相关实例，文档不难看懂，弄出的效果也接近material design。所以先用这种尝试写博客主题。写的时候，主要参考pelican文档里[主题编写](http://pelican-docs-zh-cn.readthedocs.org/en/latest/themes.html)部分，进行相关样式及模板的修改。

在templates文件夹下，有base.html文件，其他继承这个文件，并且模板中还可以包含其他文件。设置或者读取常量可以在pelicanconf.py中配置。

主题源码都在[这里](https://github.com/sxau-web-team/MaterialDesignPelicanTheme)，其中包含了用到的插件，以及个人博客的配置。

#  0x04 插件配置

目前主要使用了[sitemap](https://github.com/sxau-web-team/MaterialDesignPelicanTheme/tree/master/pelican-plugins/sitemap)，[gravatar](https://github.com/sxau-web-team/MaterialDesignPelicanTheme/tree/master/pelican-plugins/gravatar)这两个插件，以后采用新插件的时候，还会补充。

# 0x05 程序维护

pelican使用jinja2进行模板渲染，需要定期查看是否有新版本。

jinja2

flask

Frozen-Flask

相关系统：
Cactus

# 0x06 域名等服务配置

因blog放在github pages上，所以域名绑定可以在目录下建立名为CNAME的文件，里面保存顶级域名。然后域名A记录指向dubuqingfeng.github.io

SSL证书配置？

因blog为静态的，也不需要涉及后台的操作，所以https加密显得不是特别重要。

RSS的配置：

```
# Feed generation is usually not desired when developing
FEED_RSS = u"feeds/all.rss.xml"
CATEGORY_FEED_RSS=u"feeds/%s.rss.xml"
FEED_ALL_ATOM = 'feeds/all.atom.xml'
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
AUTHOR_FEED_ATOM = None
AUTHOR_FEED_RSS = None
```

然后RSS的地址为/feeds/all.rss.xml

# 0x07 20170213更新

博客通过阿里云万网进行国内和国外的分流，国内使用Coding pages进行托管，最近也上了SSL证书，设置了强制跳转，由于HTTPS不能访问HTTP资源，所以对主题进行了一定的改写，先将图片托管到七牛云平台，并通过认证开通HTTPS，然后就是百度分享的问题，根据[这个仓库](https://github.com/hrwhisper/baiduShare)的说明，修改了一些地址。然后就是评论就不支持多说了，于是换了友言，原来的评论后来被墙了，可怜。然后又加上了打赏按钮，虽然知道并不会有人打赏的。

并且将博客代码放到了坚果云上，达到同步的效果（好几次苹果电脑打不开的情况，做个备份也罢）。后来发现，[hexo博客](https://xiaoye.me)部署起来也很方便，只需要一个命令就可以了，**hexo deploy**类似这种的，配合git-deployer直接推到github pages，并且主分支就是hexo博客的代码，不用坚果云去同步。

