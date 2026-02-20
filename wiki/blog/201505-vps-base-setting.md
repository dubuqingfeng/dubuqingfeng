---
title: Linux VPS的一些配置
description: "0x01 更改默认ssh登录端口 一般ssh是开放的，容易受到攻击或者爆破等行为。 vim #vi /etc/ssh/sshd_config"
date: 2015-05-16 12:53
updated: 2015-05-16 12:53
tags: 
  - linux
  - vps
  - 技术
excerpt: 对于Linux的VPS的一些基础设置，例如更换端口，加强登录验证，日志的记录，shadowsocks的安装，shadowsocks的优化等。
categories: linux
permalink: 201505-vps-base-setting.html
author: admin
toc: true
---

# 0x01 更改默认ssh登录端口
一般ssh是开放的，容易受到攻击或者爆破等行为。

```vim
#vi /etc/ssh/sshd_config

#Port 22             //先把22注释掉
```

	Port 2754            //添加一个新的端口

重启ssh服务

	service sshd restart

# 0x02 使用密钥登录而不是密码

在一个自用的vps上，避免使用密码登录，妥善保管好密钥，可以提高一定的安全性。

一开始使用Xshell的密钥生成工具，在工具选项卡中，有新建用户密钥生成向导，选择RSA，密钥长度为2048位，下一步输入私钥密码，涉及到了非对称加密，详细原理正在读《深入浅出密码学》，一些RSA算法，在256位密钥以上进行蛮力攻击时耗费时间较长。生成了pub格式的公钥。

将我们生成的pub公钥文件上传到/root/.ssh文件夹下面（如果没有我们需要创建），然后我们需要将id_rsa_2048.pub重命名为authorized_keys 并且用chmod 600 authorized_keys设置权限。

	chmod 600 /root/.ssh/authorized_keys

找到/etc/ssh/sshd_config ，把RSAAuthentication和PubkeyAuthentication两行前面的#注释去掉。

	vi /etc/ssh/sshd_config

重启sshd服务的另一种方法：
	
	Debian/Ubuntu执行：/etc/init.d/ssh restart

	CentOS执行：/etc/init.d/sshd restart

禁止密码登录：
	
	vi /etc/ssh/sshd_config 文件

	找到PasswordAuthentication后面的yes改成no。
# 0x03 查看登录日志

首先进入日志目录：
	
	cd /var/log

查看ssh用户的登录日志：

	less secure

查看登录成功的ip信息：

	last

查看登录失败的ip信息：
	
	lastb

# 0x04 配置shadowsocks

安装setuptools
	
	yum install -y python-setuptools

安装完毕后，easy_install命令就可以使用了。

安装pip，默认安装到/usr/bin目录下。

```
easy_install pip
pip install shadowsocks
```

创建shadowsocks的配置文件：

	vi /etc/shadowsocks.json

内容如下：

```json
{
        "server":"your_server_ip",
        "server_port":8989,
        "local_address": "127.0.0.1",
        "local_port":1080,
        "password":"yourpassword",
        "timeout":600,
        "method":"aes-256-cfb",
        "fast_open": false,
        "workers": 1
}
```
一些优化：

安装 gevent可以提高 Shadowsocks的性能。CentOS下安装gevent依赖libevent和greenlet。

安装libevent：

	yum install -y libevent

安装greenlet：

	pip install greenlet

安装gevent：
	
	pip install gevent

运行shadowsocks服务端：

	ssserver -c /etc/shadowsocks.json

如果想在后台一直运行Shadowsocks，启动命令如下：
	
	nohup ssserver -c /etc/shadowsocks.json > /dev/null 2>&1 &

防火墙的设置

编辑防火墙配置文件/etc/sysconfig/iptables，将服务器端口（server_port）放行。 新增一条防火墙规则：

	-A INPUT -m state --state NEW -m tcp -p tcp --dport 8989 -j ACCEPT

重启防火墙iptables：

	service iptables restart

使用docker部署shadowsocks服务。

1.安装并测试Docker，可以参考官方文档。或者是《Docker入门与实践》安装一节。

2.拉取镜像

	docker pull dubuqingfeng/shadowsocks:vps

3.运行容器

	docker run -d -p 1984:1984 dubuqingfeng/shadowsocks:vps -p 1984 -k sspassword -m aes-256-cfb

1984即为服务器端口。

sspassword为连接密码，自行更换。

aes-256-cfb为加密方式。

也可以使用-c /etc/shadowsocks.json参数。

4.测试运行

	docker ps -a
如果出现up即为安装成功。

Centos7版本：

	docker pull index.alauda.cn/dubuqingfeng/centos7-shadowsocks

运行容器
	
	docker run -d -p 1984:1984 index.alauda.cn/dubuqingfeng/centos7-shadowsocks -p 1984 -k sspassword -m aes-256-cfb
	
	PS：现在提升ss速度，可以通过开启BBR的方法。（20161101）

# 0x05 Koding环境配置pelican简记

Koding是一个在线IDE环境，适合进行Web方面的开发，支持Java、PHP、NodeJS、Perl、Python、Ruby、C、C++和Go等编程语言，貌似不太好绑定自定义域名。

```
sudo apt-get install python-pip
pip install pelican
sudo apt-get install python-virtualenv
```

# 0x06 后记

需要进一步学习SSH协议，Linux服务器管理，密码学，sock5代理，iptables。

路漫漫，盖余之勤且艰若此。

专注地做好每一件事。

