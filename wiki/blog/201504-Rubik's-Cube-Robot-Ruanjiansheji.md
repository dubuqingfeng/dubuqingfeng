---
title: 基于 Arduino 的解魔方机器人软件设计与实现
description: Android 上位机（相机采集/颜色识别/求解/通信）与下位机固件（命令解析/动作时序/舵机驱动）的软件架构与调试要点。
date: 2015-04-10 16:25
updated: 2015-04-10 20:18
tags:
  - 电子设计
  - 解魔方机器人
  - 技术
excerpt: 本文在上一篇解魔方机器人初步设计的基础上进行的详细设计，基于 Android 和控制板，后期可以扩展到 Arduino、树莓派等，逐步完善从识别到执行的整条链路。
categories: 电子设计
permalink: 201504-Rubik's-Cube-Robot-Ruanjiansheji.html
author: admin, codex
toc: true
---

# 0x00 目标与边界
这篇主要补齐“软件怎么做才能跑起来”：Android 上位机负责识别与求解，下位机负责稳定执行动作。重点在**模块拆分、通信协议、调试路径**。

![解魔方机器人软件架构（上位机与下位机）](/img/blog/rubiks-cube-robot/software-architecture.svg)

<!-- truncate -->

# 0x01 Android 上位机（App）设计

- 相机采集：稳定曝光、固定取样区域（九宫格）
- 颜色识别：把采样点归类成 6 种颜色，并输出状态矩阵
- 求解器：状态矩阵 -> 动作序列（例如 `U R2 F' ...`）
- 通信：动作序列编码、分包、校验、ACK/重发

UI 上建议至少给出：

- 连接状态（蓝牙是否连接）
- 当前阶段（识别/求解/执行/完成/异常）
- 步数与计时（便于对比优化）

# 0x02 Android 代码组织建议
如果用 Android Studio，推荐目录类似：

- `ui/`：页面与状态展示（尽量不要写算法）
- `camera/`：相机采集、取样
- `vision/`：颜色识别、状态矩阵
- `solver/`：求解算法封装（可替换实现）
- `transport/`：蓝牙/串口协议与可靠传输
- `domain/`：动作序列、魔方记号、状态对象

这样后续你要替换“识别算法”或“求解器”时，不会牵扯整个项目。

# 0x03 Android 端测试（先保证可重复）
建议先把每个阶段单独测通：

1. 只做识别：固定光照，反复识别同一面，看结果是否稳定
2. 只做求解：把已知状态喂进去，看动作序列是否一致、步数是否合理
3. 只做通信：用串口助手模拟下位机，验证分包/ACK/重发逻辑

# 0x04 下位机测试（先从舵机开始）
无论是直接用 Arduino 驱动舵机，还是通过“多路舵机控制板”间接驱动，都建议跑官方示例：

- 舵机本体没问题
- 供电足够
- PWM/控制指令有效

下面是经典的 Knob/Sweep 示例（用于验证舵机在 0-180 度范围内是否稳定）：

```c
/*
 Controlling a servo position using a potentiometer (variable resistor)
 by Michal Rinott <http://people.interaction-ivrea.it/m.rinott>

 modified on 8 Nov 2013
 by Scott Fitzgerald
 http://arduino.cc/en/Tutorial/Knob
*/
#include <Servo.h>
Servo myservo;  // create servo object to control a servo
int potpin = 0;  // analog pin used to connect the potentiometer
int val;    // variable to read the value from the analog pin
void setup()
{
  myservo.attach(9);  // attaches the servo on pin 9 to the servo object
}
void loop()
{
  val = analogRead(potpin);            // reads the value of the potentiometer (value between 0 and 1023)
  val = map(val, 0, 1023, 0, 180);     // scale it to use it with the servo (value between 0 and 180)
  myservo.write(val);                  // sets the servo position according to the scaled value
  delay(15);                           // waits for the servo to get there
}

/* Sweep
 by BARRAGAN <http://barraganstudio.com>
 This example code is in the public domain.

 modified 8 Nov 2013
 by Scott Fitzgerald
 http://arduino.cc/en/Tutorial/Sweep
*/

#include <Servo.h>

Servo myservo;  // create servo object to control a servo
                // twelve servo objects can be created on most boards
int pos = 0;    // variable to store the servo position
void setup()
{
  myservo.attach(9);  // attaches the servo on pin 9 to the servo object
}

void loop()
{
  for(pos = 0; pos <= 180; pos += 1) // goes from 0 degrees to 180 degrees
  {                                  // in steps of 1 degree
    myservo.write(pos);              // tell servo to go to position in variable 'pos'
    delay(15);                       // waits 15ms for the servo to reach the position
  }
  for(pos = 180; pos>=0; pos-=1)     // goes from 180 degrees to 0 degrees
  {
    myservo.write(pos);              // tell servo to go to position in variable 'pos'
    delay(15);                       // waits 15ms for the servo to reach the position
  }
}
```

# 0x05 固件结构（命令解析与动作时序）
固件建议拆成三层：

- 协议层：接收/解析命令帧，校验，ACK/错误码返回
- 逻辑层：把“魔方动作”映射成“执行宏”（推进/夹持/旋转/退回）
- 驱动层：PWM 或舵机控制板指令输出

强烈建议加两个能力：

- 急停：立刻停止输出、松手、回安全位
- 超时：某一步超过时间阈值就报错并停机（避免卡死烧舵机）

# 0x06 计算解法与动作表示
动作表示建议采用标准魔方记号（更通用）：

- 单步：`U R F D L B`
- 逆时针：`U'`
- 180 度：`U2`

求解器输出这些记号后，再由下位机映射到具体舵机宏，会更容易维护与复用。

# 0x07 蓝牙发送（操作码与可靠性）

1. “动作序列”消息：上位机直接发 `U R2 F' ...`

# 0x08 动作到舵机的映射
以四向导轨结构为例，一个动作通常不是“转一下”就结束，而是一段固定时序：

1. 伸出（推进到位）
2. 夹紧（夹持到位）
3. 旋转（90/180/-90）
4. 松开
5. 退回（回安全位）

例如一个 R 动作可以抽象为宏步骤（伪代码）：

```text
R:
  arm2.rotate_to(90)
  wait()
  arm2.back()
  wait()
  arm2.rotate_to(0)
  wait()
  arm2.forward()
```

具体舵机编号/角度会随机械结构变化，这里更重要的是“把动作拆成可调的时序步骤”。

# 0x09 其他
- 颜色识别鲁棒性：黄/橙、反光、曝光变化
- 校验与纠错：执行若干步后重新识别校验（不必每一步闭环）
- 参数表：每个舵机安全角度范围、推进/夹持/旋转的延时参数

