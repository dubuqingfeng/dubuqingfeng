---
title: c 程序的启动过程的反汇编分析
description: "0x01 工具准备 1.最简c代码一只"
date: 2014-07-24 15:42:00
updated: 2014-07-24 15:42:00
tags: 
  - c 
  - 反汇编
  - 技术
excerpt: 在认识启动函数的过程中，得知main函数之前系统要做一些准备工作，再加上上学期学的C语言程序入口函数不是main函数，而是_start函数。因此想对启动过程进行一定分析。
categories: 反汇编
permalink: 201407-reverse-disassemble-c-main.html
author: admin
toc: true
---

# 0x01  工具准备

1.最简c代码一只

```c
int main()
{
	return 0;
}
```

2.ollydbg

3.VC++6.0

4.GCC（mingw）

# 0x02  代码分析
```c
int main()
{
	return 0;
}
```

在gcc下，添加-nostdlib编译选项，即链接器不链接标准库，会提示以下错误信息：

```
D:\Backup\我的文档\src>gcc main.c -nostdlib-o main.exe
C:\DOCUME~1\ADMINI~1\LOCALS~1\Temp\ccmSU3wr.o:main.c:(.text+0x9): undefined reference to `__main’
collect2.exe: error: ld returned 1 exit status
```

关于-nostdlib编译选项，只有命令行指定的项才传递给链接器。标准启动文件和库都不会传递给链接器。该选项隐式打开选项-nostartfiles 和-nodefaultlibs。该选项也可以写作–no-standard-libraries。

在gcc执行汇编之后，在链接部分，当只打开选项-nostartfiles时，结果正常，未出现错误信息。而在-nodefaultlibs选项中，提示很多错误信息。

<img src="https://dubuqingfeng.oss-cn-hongkong.aliyuncs.com/blog/tech/blog201407reverse-disassemble-c-main-1.png" class="responsive-img" />

说明main函数，依赖了一些系统标准库文件，在链接的时候，需要到了一些函数，例如pre_cpp_init、check_managed_app、pre_c_init、_tmainCRTStartup、_InterlockedCompareExchangePointer、duplicate_ppstrings、WinMainCRTStartup、mainCRTStartup、_mingw_prepare_except_fr_msvcr80_and_higher….

汇编里面的_main就是C语言里面的main，是因为汇编器和C编译器对符号的命名差一个下划线。

链接器会在系统标准库文件，类似于/lib/crt2.o的文件中，寻找_start符号，然后在_start中执行创建堆对象，栈，打开系统预先提供的设备，将argv,argc参数传入main函数，然后调用main函数。

#  0x03  vc main函数反汇编分析

```assembly
1:    int main()
2:    {
00401010   push        ebp   //在堆栈上保存EBP
00401011   mov         ebp,esp //将堆栈当前位置给EBP，以在堆栈结构中存储值时的参考点
00401013   sub         esp,40h //分配空间
00401016   push        ebx  //保存数据段值
00401017   push        esi //源地址指针
00401018   push        edi //目的地址指针
00401019   lea         edi,[ebp-40h] //装入有效地址，用来得到局部变量和函数参数的指针。这里[ebp-40h]就是基地址再向下偏移40h，就是前面说的为本地变量留出的空间的起始地址；将这个值装载入edi寄存器，从而得到局部变量的地址
0040101C   mov         ecx,10h //在ecx寄存器存储10h
00401021   mov         eax,0CCCCCCCCh
00401026   rep stos    dword ptr [edi] //初始化局部变量空间,ds:[edi]
3:        return 0;
00401028   xor         eax,eax
4:    }
0040102A   pop         edi //恢复所有寄存器的值
0040102B   pop         esi
0040102C   pop         ebx
0040102D   mov         esp,ebp //恢复堆栈
0040102F   pop         ebp
00401030   ret //返回到源EIP地址
```

Vc查看调用栈，可以看到在main函数之前，系统还启动了mainCRTStartup函数，这个函数是控制台环境下多字节编码的启动函数。在kernel32.dll中地址7c816fd7处调用了mainCRTStartup函数。

```
main() line 2
mainCRTStartup() line 206 + 25 bytes
KERNEL32! 7c816fd7()
```

# 0x04 ollydbg反汇编分析

Od载入，如图所示。

<img src="https://dubuqingfeng.oss-cn-hongkong.aliyuncs.com/blog/tech/blog201407reverse-disassemble-c-main-2.png" class="responsive-img" />

堆栈窗口如图所示。

<img src="https://dubuqingfeng.oss-cn-hongkong.aliyuncs.com/blog/tech/blog201407reverse-disassemble-c-main-3.png" class="responsive-img" />

通过堆栈，可以看到kelnel32调用了入口函数(mainCRTStartup)，对于od来说，main函数并不是Entry point，而是mainCRTStartup函数。

一直单步，单步到00401146处，od分析为调用GetVersion函数，获取当前运行平台的版本号，因为是控制台程序，所以获取版本号为ms-dos的版本信息。

继续单步，单步到0040119E处，单步进入，可以看到有HeapCreate申请堆空间函数，大小由传递的参数决定，并且该call里有HeapDestroy销毁堆函数。因此0040119E为初始化堆空间，如图所示。

<img src="https://dubuqingfeng.oss-cn-hongkong.aliyuncs.com/blog/tech/blog201407reverse-disassemble-c-main-4.png" class="responsive-img" />

在004011C0处，od分析为GetCommandLineA函数，获取命令行参数信息的首地址。

进入下面的那个call后，可以看到GetEnvironmentStringsW和GetEnvironmentStrings函数，获取环境变量的首地址，如图所示。以Unicode编码形式返回到寄存器和堆栈中，最后采用WideCharToMultiByte函数将Unicode字符串到一个多字节字符串

<img src="https://dubuqingfeng.oss-cn-hongkong.aliyuncs.com/blog/tech/blog201407reverse-disassemble-c-main-5.png" class="responsive-img" />

并且后续有参数分析的一些函数，环境变量信息分析，从而得到main函数所需的参数，然后在00402D4B位置，将参数传到main函数中，从而执行main函数中的内容。

# 0x05 后记

最近在阅读《c++反汇编与逆向分析技术揭秘》，在阅读到第三章认识启动函数，找到用户入口时，得知main函数之前系统要做一些准备工作，再加上上学期学的C语言程序入口函数不是main函数，而是_start函数，这不禁引发了一些思考，到底编译器在编译和系统执行程序的时候发生了什么，因此想以实例进行一定的分析。在思考的过程中，有些涉及到了编译器的知识，包括它如何工作的，汇编之后又是如何链接的，这一部分内容不太熟悉，这一方面得掌握编译原理的知识，还得学习编译器的相关内容。那些东西还没学，因此不免有一些缺憾。了解反汇编的一些内容，可以更深层次的理解相对底层的一些东西，包括栈，堆和寄存器的数据交换。另外并未使用到神器IDA，利用IDA会更好地静态分析一些函数。