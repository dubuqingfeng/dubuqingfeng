---
title: 自己动手写 drozer 模块
description: "0x01 前言及TOC drozer 是一个 android 渗透与测试比较出名的一个框架，其源码托管在 GitHub。我们可以利用其进行一些自动化测试工作，以及测试一些拒绝式服务，写一些 exploit 等。 TOC： 前言 安装与配置 drozer 安装模块 动手写一些模块 drozer module 自动化测试脚本思考 后记"
date: 2016-06-08 17:42
updated: 2016-06-09 18:34
tags: 
  - Android安全
  - drozer
  - 技术
excerpt: drozer 采用了模块化的设计，用户可以自由地定制一些Python模块和dex模块。
categories: Android安全
permalink: 201606-write-drozer-module.html
author: admin
toc: true
---

# 0x01    前言及TOC
drozer 是一个 android 渗透与测试比较出名的一个框架，其源码托管在 [GitHub](https://github.com/mwrlabs/drozer)。我们可以利用其进行一些自动化测试工作，以及测试一些拒绝式服务，写一些 exploit 等。

TOC：
+ 前言
+ 安装与配置 drozer
+ 安装模块
+ 动手写一些模块
+ drozer module
+ 自动化测试脚本思考
+ 后记

# 0x02    安装与配置 drozer

mac10.11 系统：
安装配置好 python，然后使用下面的命令，或者 pip 安装也可以。

```
sudo easy_install --allow-hosts pypi.python.org protobuf==2.4.1
sudo easy_install twisted==10.2.0
```

遇到了如下的问题：

```
error: Setup script exited with error: command 'clang' failed with exit status 1
```

然后在github上的仓库上寻找方案。其中[ISSUE#155](https://github.com/mwrlabs/drozer/issues/155)叙述了这个问题。但是官网的2.3.4并没有修复依赖。

于是应该clone这个仓库进行安装。然后修复更新的是develop分支，就是clone这个分支的事情了。

```
sudo easy_install pyopenssl==0.15
git clone https://github.com/mwrlabs/drozer.git -b develop
```

然后**sudo python setup.py install**即可

并且**/usr/local/lib/python2.7/site-packages/drozer-2.3.4-py2.7.egg/drozer/lib/aapt**这个需要配置好755权限。

```
sudo chmod 755 /usr/local/lib/python2.7/site-packages/drozer-2.3.4-py2.7.egg/drozer/lib/aapt
```

配置drozer，需要在android端也安装好对应的agent

连接上android设备，并打开调试，允许安装未知来源的应用。

然后**adb install drozer.apk**，或者在官网下载apk包，传到android设备上安装。

之后打开drozer应用，并且设备通过USB线连接上，并设置好端口转发：

```
adb forward tcp:31415 tcp:31415
```

然后启动drozer应用上的嵌入式服务，**Embedded Server**，然后按一下**Embedded Server**滑块，再将**Disabled**滑块拖到右边。

然后计算机设备上就可以通过下面这条命令连接到drozer console了。

```
drozer console connect
```

可以进行一些常见的命令：

```
枚举已安装的包：
run app.package.list
查看application信息：
run app.package.info -a application_name
```

# 0x03    安装模块

打开**drozer console**，执行以下命令：

```
module repository create [path-to-your-module-dir]
module install [pach-to-your-module-dir]/[module-name](模块代码所在路径)
run [module-name]
```

其中为**pach-to-your-module-dir**存放编写的模块的目录的路径。

# 0x04    动手写一些模块

[官方文档](https://github.com/mwrlabs/drozer/wiki/Writing-a-Module#metadata)里说明了需要书写的一些属性：

name、description、examples、author、date、license、path

如果增加参数可使用**add_arguments()**方法，其利用**argparse**的原理。

模块一：

枚举所有的可导出的activity、content provider、service、broadcast receiver：

```python
from drozer.modules import common, Module


class Info(Module, common.Filters, common.PackageManager):
    name = "Get App Info"
    description = ""
    examples = ""
    author = "Dubu qingfeng"
    date = "2016-06-06"
    license = "BSD (3-clause)"
    path = ["ex", "app"]
    permissions = ["com.mwr.dz.permissions.GET_CONTEXT"]

    def add_arguments(self, parser):
        parser.add_argument("-p", "--package", default=None, help="The Package Name")

    def execute(self, arguments):
        if arguments.package is None:
            for package in self.packageManager().getPackages(common.PackageManager.GET_ACTIVITIES):
                self.stdout.write("Package: %s\n" % package.packageName)
                self.__get_activities(arguments, package)
                self.__get_services(arguments, package)
                self.__get_receivers(arguments, package)
                self.__get_providers(arguments, package)

        else:
            package = self.packageManager().getPackageInfo(arguments.package, common.PackageManager.GET_ACTIVITIES)
            self.stdout.write("Package: %s\n" % package.packageName)
            self.__get_activities(arguments, package)
            self.__get_services(arguments, package)
            self.__get_receivers(arguments, package)
            self.__get_providers(arguments, package)

    def __get_providers(self, arguments, package):
        exported_providers = self.match_filter(package.providers, 'exported', True)
        if len(exported_providers) > 0:
            for provider in exported_providers:
                for authority in provider.authority.split(";"):
                    self.__print_provider(provider, authority, "  ")
        else:
            self.stdout.write(" No exported providers.\n\n")

    def __print_provider(self, provider, authority, prefix):
        self.stdout.write("%sAuthority: %s\n" % (prefix, authority))
        self.stdout.write("%s  Read Permission: %s\n" % (prefix, provider.readPermission))
        self.stdout.write("%s  Write Permission: %s\n" % (prefix, provider.writePermission))
        self.stdout.write("%s  Content Provider: %s\n" % (prefix, provider.name))
        self.stdout.write("%s  Multiprocess Allowed: %s\n" % (prefix, provider.multiprocess))
        self.stdout.write("%s  Grant Uri Permissions: %s\n" % (prefix, provider.grantUriPermissions))
        if provider.uriPermissionPatterns is not None:
            self.stdout.write("%s  Uri Permission Patterns:\n" % prefix)
            for pattern in provider.uriPermissionPatterns:
                self.stdout.write("%s    Path: %s\n" % (prefix, pattern.getPath()))
                self.stdout.write("%s      Type: %s\n" % (prefix, Info.PatternMatcherTypes[int(pattern.getType())]))
        if provider.pathPermissions is not None:
            self.stdout.write("%s  Path Permissions:\n" % prefix)
            for permission in provider.pathPermissions:
                self.stdout.write("%s    Path: %s\n" % (prefix, permission.getPath()))
                self.stdout.write("%s      Type: %s\n" % (prefix, Info.PatternMatcherTypes[int(permission.getType())]))
                self.stdout.write("%s      Read Permission: %s\n" % (prefix, permission.getReadPermission()))
                self.stdout.write("%s      Write Permission: %s\n" % (prefix, permission.getWritePermission()))

    def __get_receivers(self, arguments, package):
        exported_receivers = self.match_filter(package.receivers, 'exported', True)
        if len(exported_receivers) > 0:
            for receiver in exported_receivers:
                self.__print_receiver(receiver, "  ")
        else:
            self.stdout.write(" No exported receivers.\n\n")

    def __print_receiver(self, receiver, prefix):
        self.stdout.write("%s%s\n" % (prefix, receiver.name))
        self.stdout.write("%s  Permission: %s\n" % (prefix, receiver.permission))

    def __get_services(self, arguments, package):
        exported_services = self.match_filter(package.services, "exported", True)
        if len(exported_services) > 0:
            for service in exported_services:
                self.__print_service(service, "  ")
        else:
            self.stdout.write(" No exported services.\n\n")

    def __print_service(self, service, prefix):
        self.stdout.write("%s%s\n" % (prefix, service.name))
        self.stdout.write("%s  Permission: %s\n" % (prefix, service.permission))

    def __get_activities(self, arguments, package):
        exported_activities = self.match_filter(package.activities, 'exported', True)
        if len(exported_activities) > 0:
            for activity in exported_activities:
                self.__print_activity(package, activity, "    ")
        else:
            self.stdout.write(" No exported activities.\n\n")

    def __print_activity(self, package, activity, prefix):
        self.stdout.write("%s%s\n" % (prefix, activity.name))
        if activity._has_property("parentActivityName") and activity.parentActivityName is not None:
            self.stdout.write("%s  Parent Activity: %s\n" % (prefix, activity.parentActivityName))
        self.stdout.write("%s  Permission: %s\n" % (prefix, activity.permission))
        if activity.targetActivity is not None:
            self.stdout.write("%s  Target Activity: %s\n" % (prefix, activity.targetActivity))

```

在模块一的基础上实现自动启动可导出的activity，以测试是否产生拒绝式服务。

```python
try:
    intent = self.new("android.content.Intent")
    comp = (package.packageName, activity.name)
    com = self.new("android.content.ComponentName", *comp)
    intent.setComponent(com)
    intent.setFlags(0x10000000)
    self.getContext().startActivity(intent)
except Exception:
    self.stderr.write("%s need some premission." % activity.name)

```

# 0x05    drozer module

QA:
1.drozer 模块存放在哪，从哪寻找那些模块？


用户自定义的模块，在当前目录下面会生成如下图所示的结构，当删除这个目录后，模块也被删除。并且 drozer 会在模块目录，存在一个名为 .drozer_repository 的文件。


并且 drozer 的文件中说明了寻找模块的方法。

```python
def __locate(self):
    """
    Search the module paths for Python modules, which may contain drozer
    Modules, and build a collection of Python modules to load.
    """

    modules = {}
    
    for path in self.__paths():
        for dirpath, _dirnames, filenames in os.walk(path):
            for filename in filenames:
                module_path = os.path.join(dirpath[len(path) + len(os.path.sep):], filename)
                module_name, ext = os.path.splitext(module_path)

                if ext in [".py", ".pyc", ".pyo"]:
                    namespace = ".".join(module_name.split(os.path.sep))
                    filepath = os.path.join(path, module_path)

                    module = filepath[len(path)+1:filepath.rindex(".")].replace(os.path.sep, ".")

                    if os.path.abspath(self.__module_paths) in path:
                        modules[namespace] = "drozer.modules." + module
                    else:
                        modules[namespace] = module

    return modules
```

# 0x06    自动化测试脚本思考

主要就是爬虫下载apk，然后自动安装apk，然后drozer去分析利用。

爬虫下载apk的思路，曾经利用scrapy去下载一些apk网站上的排行apk。托管在了[Coding](https://coding.net/u/1433res/p/appchina-crawl/git)。

如何自动安装apk呢？利用**adb install -r xxx.apk**？

所以是爬虫下载apk，然后分开不同的目录，再利用脚本adb安装到设备上，并将包名输出到一个文件里，然后模块里在读取文件，然后进行检查package，或者拒绝服务的检测。

# 0x07    后记
drozer 是利用 protobuf 协议作为通信的，如果这个协议出现了问题，又会怎么样呢？这是以后思考的方向吧。

当然 drozer 的可利用范围是比较广的，可以测试 SQL 注入，以及各种组件的漏洞，或者配合 nc 进行 shell 的获取。以后再整理一些利用思路，或者一些 exploit 的编写。

# 0x08    参考链接

[自己动手开发Drozer插件之AutoAttack](http://appscan.360.cn/blog/?p=45)