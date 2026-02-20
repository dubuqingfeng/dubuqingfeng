---
title: chromebook 的 ubuntu 安装和软件配置
description: "0x01 安装系统 需进入开发者模式，在关机状态下，按住Esc+F3（刷新）+电源键，启动Chromebook，看到ChromeOS系统损坏的界面以后（顺带一提，按方向键可以切换成不同的语 音；需要重装ChromeOS的话就在这个界面里插入ChromeOS恢复U盘，google下载）按Ctrl+D，系统提示是否确认要进入开发者模式，回车确认。然后等待系统重启，第一次重启会显示修复系统，耐心等待就可以了，从此系统就进入开发者模式。注意一旦..."
date: 2014-10-19 12:41
updated: 2014-10-19 12:42
tags: 
  - chromebook
  - ubuntu
  - 技术
excerpt: 在入手了 chromebook 以后，原生的 ChromeOS 满足不了平时的需要，所以需要安装一些其它的系统，在贴吧等的指引下，安装配置好了ubuntu，记录一下安装的过程和软件。
categories: chromebook
permalink: 201410-chromebook-install-ubuntu.html
author: admin
toc: true
---

# 0x01 安装系统
需进入开发者模式，在关机状态下，按住Esc+F3（刷新）+电源键，启动Chromebook，看到ChromeOS系统损坏的界面以后（顺带一提，按方向键可以切换成不同的语 音；需要重装ChromeOS的话就在这个界面里插入ChromeOS恢复U盘，google下载）按Ctrl+D，系统提示是否确认要进入开发者模式，回车确认。然后等待系统重启，第一次重启会显示修复系统，耐心等待就可以了，从此系统就进入开发者模式。注意一旦开启开发者模式，开机界面都会显示一个警告界面。要么等待 30秒后系统自动启动，要么按Ctrl+D跳过等待时间。切记不可以按空格键，否则ChromeOS就自动关闭开发者模式了！

<br />
进入开发者模式的ChromeOS，不要登录google帐号。保持网络连通（我使用了手机usb分享网络，一开始还没研究翻墙），在登录界面按Ctrl+Alt+F2，切换到命令行界面。用chronos帐号登录，不需要密码。紧接着输入curl -L -O http://goo.gl/9sgchs下载脚本，然后sudo bash 9sgchs 执行脚本，保持网络畅通。

# 0x02 安装软件

	sudo apt-get update

安装 emacs
	
	sudo apt-get install emacs

设置 utf8

```
sudo gedit /etc/default/locale
LANG=”en_US.UTF-8″
sudo gedit /etc/environment
LANG=”en_US.UTF-8″
LANGUAGE=”zh_CN:zh:en_US:en”
```

安装 Apache2
	
	sudo apt-get install apache2

安装 PHP5

	sudo apt-get install php5 libapache2-mod-php5

重启 Apache2

	sudo /etc/init.d/apache2 restart

安装 mysql
	
	sudo apt-get install mysql-server
	sudo apt-get install libapache2-mod-auth-mysql php5-mysql phpmyadmin

添加 phpmyadmin 链接

	sudo ln -s /usr/share/phpmyadmin /var/www/html

安装 chrome

```
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
dpkg -i google-chrome-stable_current_amd64.deb
apt-get install -f
```

安装 git

```
apt-get install git
#git config --global user.name “dubuqingfeng”
#git config --global user.email “1135326346@qq.com”
#cd ~/.ssh
#ssh-keygen -t rsa -C "1135326346@qq.com"
```

安装 java

```
cd /usr/lib
mkdir jdk
tar xvzf jdk-8u45-linux-x64.tar.gz
cp -r ~/Download/jdk1.8.0_45 /usr/lib/jdk/
#gedit /etc/profile
```

安装 adt，android-studio

安装有道词典

	wget http://codown.youdao.com/cidian/linux/youdao-dict_1.0.2~ubuntu_amd64.deb

# 0x03 一些备份内容

+ pelican的博客
+ android项目文件

# 0x04 链接
+ [Gist](https://gist.github.com/dubuqingfeng/c0c42a4805bee049321c#file-ubuntu-install-software-sh-L48)
+ [GitHub](https://github.com/dubuqingfeng/Chromebook-For-Chinese)
+ [Ubuntu-dotfiles](https://github.com/dubuqingfeng/ubuntu-dotfiles)