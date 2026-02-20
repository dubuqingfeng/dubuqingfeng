---
title: 利用 VMProtect sdk 和 ASProtect sdk 加密 delphi 程序
description: "0x01 前言 普通的一些加密壳能够较为容易的被脱掉，而一些稍微难一点壳，例如VMProtect等，刚入门的新手就不是那么好脱了，而这些壳也提供了一些sdk帮助我们加密需要加密的函数，使保护壳能够识别源码中需要加密保护的代码段。下面以我的一个delphi程序为例，介绍VMProtect sdk和EncryptPE的一些加密方法，其他vc，或者易语言写的程序也可以使用其进行加密。"
date: 2014-07-28 14:32
updated: 2014-07-28 20:48
tags: 
  - 逆向
  - delphi加密
  - 技术
excerpt: 下面以我的一个 delphi 程序为例，介绍 VMProtect sdk 和 EncryptPE 的一些加密方法，其他vc，或者易语言写的程序也可以使用其进行加密。
categories: 逆向加密
permalink: 201407-reverse-disassemble-delphi.html
author: admin
toc: true
---

# 0x01 前言

普通的一些加密壳能够较为容易的被脱掉，而一些稍微难一点壳，例如VMProtect等，刚入门的新手就不是那么好脱了，而这些壳也提供了一些sdk帮助我们加密需要加密的函数，使保护壳能够识别源码中需要加密保护的代码段。下面以我的一个delphi程序为例，介绍VMProtect sdk和EncryptPE的一些加密方法，其他vc，或者易语言写的程序也可以使用其进行加密。

# 0x02 VMProtect保护

VMProtect sdk保护方式可以有两种，map法和标记法，在官方文档中，有下述方法。

```
it is possible by doing the following: use the main menu of the Delphi IDE 
to open the project options (Project – Options) and select the “Detailed” 
option in the “MAP file” group on the “Linker” tab:
```

<img src="https://dubuqingfeng.oss-cn-hongkong.aliyuncs.com/blog/tech/blog201407reverse-disassemble-delphi-1.jpg" class="responsive-img" />

将项目设置中map文件的设置从无改成详细。

可以看到产生了如图的map文件，map文件中包含了有关被链接的程序的下列信息：模块名称，为1文件的基名称，时间戳，来自程序的文件头（不是来自文件系统，程序中的组列表，包括每个组的起始地 址（节：偏移量的形式）、长度、组名和类；公共符号的列表，包括每个地址（节：偏移量的形式）、符号名称、平直地址和包含符号定义的obj文件；入口点（节：偏移量的形式），另外可以通过map文件确定程序奔溃的位置。

<img src="https://dubuqingfeng.oss-cn-hongkong.aliyuncs.com/blog/tech/blog201407reverse-disassemble-delphi-2.jpg" class="responsive-img" />

然后下载VMProtect，官网上是未激活版。本文以注册版演示。

载入文件后，VMProtect界面如图所示。

<img src="https://dubuqingfeng.oss-cn-hongkong.aliyuncs.com/blog/tech/blog201407reverse-disassemble-delphi-3.jpg" class="responsive-img" />

VMProtect根据map文件得到了一些函数信息，然后F9即可进行编译加壳，然后会生成后缀为.vmp.exe的保护后的文件，在peid0.95中查壳，结果如图所示。虽然结果为什么都没找到，但是区段中已经有了vmp1，vmp0。可以以vmprotect来进行脱壳等操作。

<img src="https://dubuqingfeng.oss-cn-hongkong.aliyuncs.com/blog/tech/blog201407reverse-disassemble-delphi-4.jpg" class="responsive-img" />

而语句标记法，主要利用了下列语句进行需要保护的代码的标记

```assembly
asm
db $EB,$10,’VMProtect begin’,0 //标记开始处.
end;
//想保护的程序代码
asm
db $EB,$0E,’VMProtect end’,0 //标记结束处.
end;
```

Vc当中标记模式为：

```assembly
 __asm    //标记开始处.
{
_emit 0xEB
_emit 0x10  //jmp 0x10
_emit 0x56  //ascii “VMProtect begin”,0
_emit 0x4D
_emit 0x50
_emit 0x72
_emit 0x6F
_emit 0x74
_emit 0x65
_emit 0x63
_emit 0x74
_emit 0x20
_emit 0x62
_emit 0x65
_emit 0x67
_emit 0x69
_emit 0x6E
_emit 0x00
}
//想保护的程序代码
__asm  //标记结束处.
{
_emit 0xEB
_emit 0x0E   //jmp 0x0e
_emit 0x56   //ascii “VMProtect end”,0
_emit 0x4D
_emit 0x50
_emit 0x72
_emit 0x6F
_emit 0x74
_emit 0x65
_emit 0x63
_emit 0x74
_emit 0x20
_emit 0x65
_emit 0x6E
_emit 0x64
_emit 0x00
}
```

而在官方文档中，有下列例子可供参考，将sdk的动态链接库引入，在lib目录下有相关的dll文件，在library目录下也有相关的库文件。

```
Markers are inserted in the code to protect separate sections of the code and also
protect string constants. Markers are calls of imported procedures stored in an external
 DLL (VMProtectSDK32.dll is used for 32-bit applications and VMProtectSDK64.dll is used
for 64-bit applications; VMProtectDDK32.sys and VMProtectDDK64.sys respectively are
used to protect drivers), VMProtectSDK are used hereinafter. Procedures and functions
located in VMProtectSDK do not do anything and serve only as markers by which VMProtect
determines the borders of the protected code. Correspondingly, the beginning and end of a
protected block are marked in the following way:

Delphi
uses VMProtectSDK;
VMProtectBegin(MARKER_NAME);
…
VMProtectEnd;
C/C++
#include “VMProtectSDK.h”
VMProtectBegin(MARKER_NAME);
…
VMProtectEnd();
MASM
include VMProtectSDK.inc
invoke VMProtectBegin,SADD(MARKER_NAME)
…
invoke VMProtectEnd
Visual Basic
Call VarPtr(“VMProtect begin”)
…
Call VarPtr(“VMProtect end”)
```

# 0x03 VMProtect 和 ASProtect 的混合加密

Asprotect 也有相关的sdk，也提供了注册机制，主要 delphi 通过标记语句，`{$I filename}`，实现文件的引入，它主要有多态变形标记，crc 检查标记，外壳完整性检查。不同的标记需要引入不同的文件，例如在多态变形标记中，示例为：

```delphi
Delphiexample:
 Procedure Test;
 begin
 {$I Inc\UserPolyBuffer.inc}
 // some code
 end;
```

还得引入相关的api，uses  aspr_api;

如果有map文件时，在软件界面中也可以导入，如图所示。

<img src="https://dubuqingfeng.oss-cn-hongkong.aliyuncs.com/blog/tech/blog201407reverse-disassemble-delphi-5.jpg" class="responsive-img" />

在保护的时候即可自动识别函数。
试验的程序当先用VMProtect，后用ASProtect时，会出现一个如图文件损坏的对话框，可能是因为区段的问题，无法找到入口。

<img src="https://dubuqingfeng.oss-cn-hongkong.aliyuncs.com/blog/tech/blog201407reverse-disassemble-delphi-6.jpg" class="responsive-img" />

而先用ASProtect，后用VMProtect时，程序正常运行，当然因为加壳的原因，在在线杀毒引擎中有23%的杀软(9/38)报告发现病毒。

# 0x04 MAP文件的结构

一开始是

```assembly
 Start         Length     Name                   Class
 0001:00000000 00050F4CH .text                   CODE
 0002:00000000 000011D8H .data                   DATA
 0002:000011D8 00000BE1H .bss                    BSS
```

Pe文件的区段:

```
Detailed map of segments，一些细节方面的东西
Address Publics by Name，然后一些关于函数的偏移量
Line numbers for SysConst(C:\Program Files (x86)\Borland\Delphi7\lib\
sysconst.pas) segment .text SysConst代码中行数的偏移量
Line numbers for Unit1(Unit1.pas) segment .text    代码中行数的偏移量
Line numbers for Project2(C:\Program Files (x86)\Borland\Delphi7\
Projects\Project2.dpr) segment .text
Bound resource files 与之相关的资源文件
Program entry point at 0001:00050EE0  程序入口点
```
