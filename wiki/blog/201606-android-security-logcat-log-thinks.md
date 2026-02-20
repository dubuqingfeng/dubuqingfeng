---
title: LogCat 及 Log 的一些思考
description: "0x00 TOC 原理 smali注入 手机查看log并导出 so打log 发布(release)版屏蔽Log输出 查看内核日志 参考链接"
date: 2016-06-21 17:36 
updated: 2016-06-23 18:27
tags: 
  - Android安全
  - Log
  - LogCat
  - 技术
excerpt: Android 系统是如何实现 Log 机制的，以及有关 Log 的一些问题，smali 注入，so 打 log，屏蔽 log 输出，查看内核日志等。
categories: Android安全
permalink: 201606-android-security-logcat-log-thinks.html
author: admin
toc: true
---

# 0x00  TOC

+ 原理
+ smali注入
+ 手机查看log并导出
+ so打log
+ 发布(release)版屏蔽Log输出
+ 查看内核日志
+ 参考链接

#####0x01  原理

常见的一些打Log的语句

```java
Log.i(TAG, "");
Log.d(TAG, "");
Log.e(TAG, "");
Log.v(TAG, "");
Log.w(TAG, "");
Log.wtf(TAG, "");
```

Log给开发者开放了6种级别(分别对应info，debug，error，verbose，warning，assert)，隐藏了两种级别:

```
F — Fatal
S — Silent (highest priority, on which nothing is ever printed)
```

通过阅读[Log的代码](https://android.googlesource.com/platform/frameworks/base/+/master/core/java/android/util/Log.java)，里面说明了通过`println_native(LOG_ID_MAIN, Priority, tag, msg);`代码进行输出了日志。并声明了LOG_ID_MAIN、LOG_ID_RADIO、LOG_ID_EVENTS、LOG_ID_SYSTEM、LOG_ID_CRASH五个缓冲区。

而`println_native()`的代码在[`frameworks/base/core/jni/android_util_log.cpp`](http://www.netmite.com/android/mydroid/frameworks/base/core/jni/android_util_Log.cpp)，其中判断了msg是否为空，如果为空，抛出空指针异常。

其中levels_t是一个结构体，其中包括了那六种级别，其中`assert`，查阅代码可得知，如果利用Log.wtf()方法，就会打印一个标志成ASSERT的错误。

并通过以下函数进行了打印操作。即[__android_log_buf_write](https://github.com/cgjones/android-system-core/blob/master/liblog/logd_write.c)。在`__android_log_buf_write`函数里通过调用`write_to_log`函数进行打印。

```C++
int res = __android_log_buf_write(bufID, (android_LogPriority)priority, tag, msg);
```

然后`write_to_log`是怎样的情况呢，在文件45行有以下信息。

```C++
static int (*write_to_log)(log_id_t, struct iovec *vec, size_t nr) = __write_to_log_init;
static int __write_to_log_init(log_id_t, struct iovec *vec, size_t nr);
```

然后追溯到`__write_to_log_init`这个函数里，这个函数其中有一些打开文件等的操作，然后`__write_to_log_kernel`这个就写入到文件里。

具体底层Log设备Logger机制，就不再阐述，如果细研下去，就是另一篇文章了，并且嵌入式的同学还学到了`ioctl`函数，这需要一些Linux驱动方面的知识。

LogCat是如何获取Log的？通过[`logcat.cpp`](https://github.com/cgjones/android-system-core/blob/master/logcat/logcat.cpp)，可以知道，定义了一个Log文件目录，即`#define LOG_FILE_DIR    "/dev/log/"`。具体读取log的过程，可以参考田海立的文章－[解读Android LOG机制的实现：（5）获取LOG的应用程序LogCat
](http://blog.csdn.net/thl789/article/details/6638344)。

如何去修改logcat的显示颜色呢，可以通过[android studio的设置](http://blog.csdn.net/hotlinhao/article/details/9150519)，也可以安装一个[logcat-color](https://github.com/marshall/logcat-color)直接改变颜色，通过以下命令。

```
$ logcat-color -e | egrep '(Tag1|Tag2)'
```

# 0x02  smali注入

通过以下命令，进行apktool反编译

```
apktool d xxx.apk
```

在合适位置插入以下语句，其中v0为寄存器，尽量不要随意添加寄存器。

```smali
invoke-static {v0, v0}, Landroid/util/Log;->e(Ljava/lang/String;Ljava/lang/String;)I
```

然后进行打包

```
apktool b xxx -o xxx.apk
```

打包完安装需要签名，由于已经有了android.keystore ，这里使用jarsigner进行签名。

```
jarsigner -verbose -keystore android.keystore -signedjar android_signed.apk app.apk android.keystore
```

运行即可看到Log信息。

# 0x03  手机查看log并导出

如何在手机上读取其他应用的log并可以导出呢，谷歌在4.1以后禁止了相关权限，改为了`signature|system|development`权限。就算有android.PREMISSION.READ_LOGS，也读取不到其他应用的log了。只能root以后查看。

在谷歌Android Developer论坛里也有[相关讨论](https://groups.google.com/forum/?fromgroups#!topic/android-developers/6U4A5irWang)。在4.1之后，禁止了去阅读其他应用log的权限。

并且在google play商店上也有几款手机上查看log的软件，需要root权限。比如[CatLog - Logcat Reader!](https://play.google.com/store/apps/details?id=com.nolanlawson.logcat&hl=en)，[aLogcat (free) - logcat
](https://play.google.com/store/apps/details?id=org.jtb.alogcat&hl=en)等。aLogCat也开源了，地址在[GitHub上](https://github.com/nolanlawson/Catlog)。

# 0x04  so打log

如何在so文件，即jni开发中里打log呢

这里如何配置NDK就不再叙述。详细可参考[ndk官网](https://developer.android.com/ndk/guides/index.html)

需要在cpp文件中添加以下语句：

```C++
#include <android/log.h>
//打印相关信息
__android_log_write(ANDROID_LOG_DEBUG,"Tag","Java_com_sxau_ndkdemo_MainActivity_getStringFromC");
```

然后在build.gradle文件里，修改成以下片段：

```java
ndk {
    moduleName "JniDemo"
    ldLibs("log", "z", "m")
}
```

引入`liblog.h`，或者通过自定义`Android.mk`进行导入。

可以通过一些宏定义定义：

```c++
#define LOG_TAG "ANDROID_LAB"  
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)  
```

# 0x05  发布(release)版屏蔽Log输出
一种方法是通过添加一个Log辅助类，配置级别，或者通过变量控制显示。

```java
public class Log {
    public static int logLevel = Log.VERBOSE;
    
    public static void i(String tag, String msg) {
        if (logLevel <= Log.INFO)
            android.util.Log.i(tag, msg);
    }
    
    public static void e(String tag, String msg) {
        if (logLevel <= Log.ERROR)
            android.util.Log.e(tag, msg);
    }
    
    public static void d(String tag, String msg) {
        if (logLevel <= Log.DEBUG)
            android.util.Log.d(tag, msg);
    }
    
    public static void v(String tag, String msg) {
        if (logLevel <= Log.VERBOSE)
            android.util.Log.v(tag, msg);
    }
    
    public static void w(String tag, String msg) {
        if (logLevel <= Log.WARN)
            android.util.Log.w(tag, msg);
    }
}
```

使用时直接使用这个Log类打印方法。

release版屏蔽log输出，另外一种方法是，可以通过ProGuard的方式，将log语句删除。

ProGuard是Android SDK的一部分。只需要开启即可。

在android studio中，编辑build.gradle文件，配置如下代码：

```java
android {
...
    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

后来gradle的runProguard更名为minifyEnabled，所以直接改为true即可。

```java
proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
```

注意这段位置，本来按默认的配置一直没有消除成功，直到看了一篇[文章](http://blog.csdn.net/weizaishouex2010/article/details/49866621)以后，改为了`proguard-android-optimize.txt`，才屏蔽输出成功。即：

```java
release {
    minifyEnabled true
    proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
}
```

修改Proguard的配置文件`proguard-rules.pro`，添加以下配置：

```
-assumenosideeffects class android.util.Log {
    public static int v(...);
    public static int i(...);
    public static int w(...);
    public static int d(...);
    public static int e(...);
}

-assumenosideeffects class java.io.PrintStream{
    public void println(%);
    public void println(**);
}
```

即结果。然后打包签名输出就不会有log日志了。


# 0x06  查看内核日志

```
./adb shell
su
dmesg
cat /proc/kmsg
```

dmesg是内核中的一个命令，可以查看内核日志，当然，也可以用`cat/proc/kmsg`。两者不同的是，dmesg只读取缓冲区中的内核日志，而`cat /proc/kmsg`则可以原始的、完整的日志文件。

# 0x07  参考链接

>[Google API](https://developer.android.com/reference/android/util/Log.html)

>[Android LogCat Security](http://drops.wooyun.org/tips/3812)

>[Stackoverflow](http://stackoverflow.com/questions/25149481/can-logcat-be-used-to-log-ndk-code-in-android-or-what-are-logging-options-from)

>[android系统源代码情景分析](https://book.douban.com/subject/19986441/)

>[如何在JNI编程中使用logCat](http://blog.csdn.net/zgjxwl/article/details/6234025)