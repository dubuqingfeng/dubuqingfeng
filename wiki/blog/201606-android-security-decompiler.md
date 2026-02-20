---
title: Android Decompiler / 初探反编译
description: "0x00 TOC 原理 无混淆无加密无加壳 仅混淆 仅加密 仅加壳 自动化实现 一些软件 参考链接"
date: 2016-06-25 17:24 
updated: 2016-06-27 22:31
tags: 
  - Android安全
  - 反编译
  - Decompiler
  - 技术
excerpt: 本文对 Android 反编译领域进行了简要的分析，如何进行反编译，以及如何混淆如何加密如何加壳，以及其对策，进行了实践和探索。
categories: Android安全
permalink: 201606-android-security-decompiler.html
author: admin
toc: true
---

#  0x00  TOC

+ 原理
+ 无混淆无加密无加壳
+ 仅混淆
+ 仅加密
+ 仅加壳
+ 自动化实现
+ 一些软件
+ 参考链接

# 0x01  原理

首先在逆向领域，有一个是需要区别的。就是反汇编和反编译。

反汇编把程序的原始机器码，翻译成较便于阅读理解的汇编代码。比如IDA、OD等。

反编译，通常是将机器码(汇编语言)转换为高级编程语言。

由于Java、.net这样的基于虚拟机技术的语言都是采用了ByteCode的二进制结构，因此很容易将ByteCode转化为“抽象语法树”（简称AST，《编译原理》这门课中的概念），然后采用反编译器就可以将AST转换为代码了。

详细可以参考乌云上的文章[反编译系列教程(上)](http://drops.wooyun.org/papers/13686)

#####0x02  无混淆无加密无加壳

一个Android程序，如果没有进行混淆，加密，加壳等行为时，如果进行反编译的话，是可以逆向到Java源码的。

1.[Dex2Jar](https://github.com/pxb1988/dex2jar)和[JD-GUI](https://github.com/java-decompiler/jd-gui)(或者Jad)

先通过Dex2Jar软件将`classes.dex`转换为jar文件，然后再通过Java反编译工具JD-GUI将jar文件转换成JAVA源文件。

总之这是通过dex转jar，然后再转java源代码的思路。其中dex转jar也可以选择一些其他软件，例如谷歌官方的[enjarify](https://github.com/google/enjarify)。

下载Dex2Jar和Jd-gui的地址：

Dex2Jar:[https://github.com/pxb1988/dex2jar/releases](https://github.com/pxb1988/dex2jar/releases)

JD-GUI:[http://jd.benow.ca/](http://jd.benow.ca/)

使用Dex2Jar和Jd-gui的命令：

```
dex2jar <file0>
//即
./d2j-dex2jar.sh xxx.apk
java -jar jd-gui-x.y.z.jar
//或者是
java -classpath jd-gui-x.y.z.jar org.jd.gui.App
//也可以直接运行客户端
```

以下即为反汇编出来的结果。

<img src="https://dubuqingfeng.oss-cn-hongkong.aliyuncs.com/blog/tech/blog201606-android-security-decompiler-01.png" class="responsive-img" />

2.APK改之理、APKDB、Android逆向助手、Android Killer之类软件

实际本质上还是通过Dex2jar或者apktool工具的封装。

还有一个Jadx的软件也比较好用。

<img src="https://dubuqingfeng.oss-cn-hongkong.aliyuncs.com/blog/tech/blog201606-android-security-decompiler-02.png" class="responsive-img" />

3.在线反编译网站

地址：[http://www.decompileandroid.com/](http://www.decompileandroid.com/)

地址：[http://www.ludaima.cn/android.html](http://www.ludaima.cn/android.html)

只需要上传需要反编译的apk，稍等片刻，即可下载源码。

4.smali和Baksmali以及[Smali Viewer](http://blog.avlyun.com/show/%E3%80%8Asv%E7%94%A8%E6%88%B7%E6%8C%87%E5%8D%97%E3%80%8B/)

smali是将smali文件转换成dex。

Baksmali和smali相反，将dex转换成smali。

在[Quora的一篇问答](https://www.quora.com/What-is-smali-in-Android)中，介绍了smali和baksmali的作用。

```
Smali/Baksmali is an assembler/disassembler for the dex format used by dalvik,
 Android's Java VM implementation. The names "Smali" and "Baksmali" are the
  Icelandic equivalents of "assembler" and "disassembler" respectively.
```

# 0x03  仅混淆

通常Android混淆方法，有ProGuard、DexGuard和APKfuscator等。

怎样使用ProGuard对Android项目源码进行混淆保护，在Android Studio中build.gradle，修改以下代码片段

```java
release {
    minifyEnabled true
    proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'),
     'proguard-rules.pro'
}
```
将`minifyEnabled`改为true。去除无效资源的话需要添加[`shrinkResources true`](http://tools.android.com/tech-docs/new-build-system/resource-shrinking)。

然后在`proguard-rules.pro`文件中，编写一些特定框架的混淆规则。

```
# ProGuard configurations for Bugtags
-keepattributes LineNumberTable,SourceFile

-keep class com.bugtags.library.** {*;}
-dontwarn org.apache.http.**
-dontwarn android.net.http.AndroidHttpClient
-dontwarn com.bugtags.library.**
# End Bugtags

# retrofit
-dontwarn retrofit2.**
-keep class retrofit2.** { *; }
-keepattributes Signature
-keepattributes Exceptions

# android-async-http
-dontwarn android-async-http-1.4.9.jar.**
-keep class android-async-http-1.4.9.jar.**{*;}
-keep class org.apache.http.** {*; }
```

并且混淆时需要对使用的框架进行混淆，或者是避免混淆一些类。这时就对框架的文档进行阅读，分析需要增加的混淆规则。

混淆的效果如下图所示。

<img src="https://dubuqingfeng.oss-cn-hongkong.aliyuncs.com/blog/tech/blog201606-android-security-decompiler-03.png" class="responsive-img" />

以及加速gradle编译的配置：

```
org.gradle.daemon=true
org.gradle.jvmargs=-Xmx2048m -XX:MaxPermSize=512m -XX:
+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
org.gradle.parallel=true
org.gradle.configureondemand=true
```

如何对抗这种混淆呢？这种混淆仅仅是增大了阅读难度，在反汇编之后，类名变成了a,b,c之类的。

dex2jar作者在[Android混淆技巧与反混淆](http://secwiki.neu.edu.cn/wiki/images/e/eb/Android%E6%B7%B7%E6%B7%86%E6%8A%80%E5%B7%A7%E4%B8%8E%E5%8F%8D%E6%B7%B7%E6%B7%86_%E5%B0%8F%E6%B3%A2.pdf)中谈到，ProGuard有Shrinking、Optimization、Name Obfuscation、Removal of logging code等功能。在面对名字替换时，有阅读源代码、JEB、ProGuard分析等方法，Flanker大牛也分享过利用[JEB API编写插件分析](http://drops.wooyun.org/mobile/6665)。

默认的混淆规则在[proguard-android.txt](https://android.googlesource.com/platform/sdk/+/master/files/proguard-android.txt)。

可以使用Proguard再混淆一次，利用自己写的规则Mapping文件。

这里以一个文件为例。进行Proguard的混淆以及反混淆。

在Proguard配置文件中，添加如下语句，可打印出默认混淆规则的Mapping文件。

```
-printmapping mapping.txt
```

在修改好对应的值以后，利用以下语句，应用Mapping文件，再建一个项目，分析对应的代码。

```
-applymapping mapping.txt
```

最后结果如下：

<img src="https://dubuqingfeng.oss-cn-hongkong.aliyuncs.com/blog/tech/blog201606-android-security-decompiler-04.png" class="responsive-img" />

<img src="https://dubuqingfeng.oss-cn-hongkong.aliyuncs.com/blog/tech/blog201606-android-security-decompiler-05.png" class="responsive-img" />

这样反混淆了以后，降低了代码阅读的难度，增加了应用被破解的风险。

# 0x04  仅加密

加密方式有很多种，本文不能面面俱到，只能找出一些典型的。比如有流程混排加密、代码内部字符串加密，对so源码、so函数名称以及接口调用进行加密隐藏，对classes.dex中的所有函数功能代码进行提取，然后加密单独存放等。

当然如果面面俱到，文章篇幅就比较长了，并且实践、研究花费的时间也比较多。这里就举比较简单的例子。

Android签名校验：

在android程序中，可以使用以下代码进行签名的获取。

```java
public int getSignature(String packageName) {
    PackageManager pm = this.getPackageManager();
    PackageInfo pi = null;
    int sig = 0;
    try {
        pi = pm.getPackageInfo(packageName, PackageManager.GET_SIGNATURES);
        Signature[] s = pi.signatures;
        sig = s[0].hashCode();
    } catch (Exception e1) {
        sig = 0;
        e1.printStackTrace();
    }
    return sig;
}
```

可以在APP每次访问服务器的时候，携带上当前APP的签名，服务端做个签名验证，如果不对，直接不通过，返回客户端信息，然后客户端进行一定的处理。当然这样的话破解者也可以通过抓包的方式，抓取到签名验证的包，然后每次通信时修改对应的包即可。

# 0x05  仅加壳

so加壳，upx是最为so加壳的首选，以前在PC端也做过[upx的脱壳](http://qingfeng520.blog.51cto.com/7098444/1256106)。

这里做个示例，加壳so。

在前一篇文章里，涉及到了如何在so里打log文件。在写好jni代码了以后，将so文件复制出来。

然后添加到文件夹里，如下图所示。

<img src="https://dubuqingfeng.oss-cn-hongkong.aliyuncs.com/blog/tech/blog201606-android-security-decompiler-06.png" class="responsive-img" />

准备UPX壳编译环境：

```
zlib-1.2.8.tar.gz
ucl-1.03.tar.gz
lzma443.tar.bz2
upx-hg-68db2e569c63.tar.gz
```

编译安装:

```
cd ucl-1.03
./configure --prefix=$PWD/../../upx-hg-6cd5982ece4f/build
make
cd zlib-1.2.8
./configure --prefix=$PWD/../../upx-hg-6cd5982ece4f/build
make
vi .bash_profile
```

设置环境变量。

```
export UPX_UCLDIR=/Users/qingfeng/software/upx/libs/ucl-1.03
export UPX_ZLIBDIR=/Users/qingfeng/software/upx/libs/zlib-1.2.8
export UPX_LZMADIR=/Users/qingfeng/software/upx/libs/lzma443
export UPX_LZMA_VERSION=0x443
export UPX_DIR=/Users/qingfeng/software/upx/upx-hg-68db2e569c63
```

查看环境变量的命令env，应用环境变量的命令`source .bash_profile`。

然后在编译`make all`的过程中，遇到了以下的错误。

```
./bele_policy.h:156:9: error: unused typedef 'acc_cta_t__39' [-Werror,-Wunused-local-typedef]
        COMPILE_TIME_ASSERT(sizeof(U16) == 2)
        ^
./conf.h:359:34: note: expanded from macro 'COMPILE_TIME_ASSERT'
#define COMPILE_TIME_ASSERT(e)   ACC_COMPILE_TIME_ASSERT(e)
./miniacc.h:1563:54: note: expanded from macro 'ACC_COMPILE_TIME_ASSERT'
#    define ACC_COMPILE_TIME_ASSERT(e)  {typedef int __ACC_CTA_NAME(acc_cta_t__)[1-2*!(e)];}
./miniacc.h:1531:37: note: expanded from macro '__ACC_CTA_NAME'
#  define __ACC_CTA_NAME(a)         ACC_PP_ECONCAT2(a,__COUNTER__)
./miniacc.h:331:41: note: expanded from macro 'ACC_PP_ECONCAT2'
#define ACC_PP_ECONCAT2(a,b)            ACC_PP_CONCAT2(a,b)
./miniacc.h:325:41: note: expanded from macro 'ACC_PP_CONCAT2'
#define ACC_PP_CONCAT2(a,b)             a ## b
<scratch space>:183:1: note: expanded from here
acc_cta_t__39
```

无论是upx是3.9.1，还是最新版，无论lzma是443版本还是最新版1610，编译的时候都会出现这个问题

然后试着升级了一下g++的版本，mac自带的是4.2版本，用brew升级到了4.8，然后用zsh的alias功能（vi .zshrc）将自带的替换掉，然后再编译还是不行，最后还是使用ubuntu进行编译吧。

然后就下了一个16.04的镜像，然后跑起了虚拟机，下载并[编译那些依赖](http://www.chinapyg.com/thread-77929-1-1.html)，然后在upx目录下`make all`的过程中，出现了以下的问题：

```
compress.cpp:32:18: fatal error: zlib.h: No such file or directory
     #include <zlib.h>
```

没找到`zlib.h`，可是自己在zlib那也`make`了啊，在查找资料的过程中，试着在zlib目录`make install`了一下，然后就编译完成了，在src目录下也有`./upx.out`了，版本是3.9.2。

这个时候就应该考虑so的init段的问题了。据这篇文章说，加壳的文件中需要有INIT段，添加init段的代码如下：

```C++
void _init(void){} \\c++
extern "C" {void _init(void){}}    \\c
```

然后加壳的命令如下：

```
./upx.out -f -o libdemo_upx.so libdemo.so
```

然后脱壳自然-d参数即可，需要判断标志是否为UPX!，以及处理变形等问题，脱完壳就可以使用IDA进行android的so分析了。

# 0x06  自动化实现

如何实现一些自动化脚本，进行反汇编的还原工作。

当然网上已经有人实现过相关内容，比如Mac下的[AndroidDecompiler](https://github.com/dirkvranckaert/AndroidDecompiler)，或者是[easy-android-decompiler](https://github.com/luckyandyzhang/easy-android-decompiler)。

# 0x07  一些软件

+ Baksmali 和 Dedexer
+ apktool
+ JEB
+ jadx
+ jdgui

DEX转jar：

+ enjarify
+ dex2jar

app调试器：

+ [gikdbg](http://gikir.com/product.php)

代码混淆软件：

+ Proguard
+ DashO
+ Dexguard
+ DexProtector
+ ApkProtect
+ Shield4j
+ Stringer
+ Allitori

对抗混淆：

+ [dex-oracle](https://github.com/CalebFenton/dex-oracle)
+ [simplify](https://github.com/CalebFenton/simplify)
+ [bytecode-viewer](https://github.com/konloch/bytecode-viewer)

[逆向工程集](https://github.com/Juude/droidReverse)

# 0x08  参考链接

当然实际情况是混淆，加密，加壳综合起来的，实际情况要具体分析。

参考链接：

[一次app抓包引发的Android分析记录](http://drops.wooyun.org/tips/2871)

[Android 安全工具包（持续更新）](http://kiya.space/2015/11/12/Android-security-tools/)

[Android安全攻防战，反编译与混淆技术完全解析](http://blog.csdn.net/guolin_blog/article/details/49738023)

[Android应用安全开发之源码安全](http://drops.wooyun.org/mobile/12172)

[Android逆向之旅—反编译利器Apktool和Jadx源码分析以及错误纠正](http://www.wjdiankong.cn/blog/android%E9%80%86%E5%90%91%E4%B9%8B%E6%97%85-%E5%8F%8D%E7%BC%96%E8%AF%91%E5%88%A9%E5%99%A8apktool%E5%92%8Cjadx%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%90%E4%BB%A5%E5%8F%8A%E9%94%99%E8%AF%AF%E7%BA%A0/)

