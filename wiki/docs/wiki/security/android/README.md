---
title: "安全：Android"
slug: /wiki/security/android
---

# 安全：Android

Android 的安全模型可以概括为：**每个应用一个 UID、一个沙箱、一组被显式授予的权限；跨边界通信必须经过系统检查。** 大多数 Android 漏洞不是“加密算法被攻破”，而是边界没关好：组件导出、WebView 桥接、数据落盘、调试开关、深链参数。

这篇文章从攻击面讲到检查命令，重点是“怎么验证”，而不是列一堆名词。

## 1. 沙箱与权限 {#sandbox}

- 每个应用安装时分配独立 UID；默认只能访问自己的私有目录。
- 权限分普通权限、危险权限（运行时申请）、签名权限、特殊权限。
- `android:sharedUserId` 会让多个应用共享 UID，除非历史兼容，不要使用。
- SELinux 在 UID 隔离之上再加一层域约束；root 后仍可能受 SELinux 限制。

```bash
adb shell pm list packages -3
adb shell dumpsys package com.example.app | sed -n '/requested permissions/,/install permissions/p'
adb shell dumpsys package com.example.app | grep -E 'userId=|sharedUserId'
```

## 2. 组件暴露：exported 是首要检查项 {#components}

四大组件：

| 组件 | 暴露后的风险 |
| --- | --- |
| Activity | 被任意应用拉起；深链参数进入敏感逻辑 |
| Service | 被绑定/启动；执行后台动作 |
| BroadcastReceiver | 接收伪造广播；触发内部状态变更 |
| ContentProvider | 被查询/写入；路径穿越、SQL 注入、越权 |

```xml
<activity
    android:name=".DeepLinkActivity"
    android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="myapp" android:host="pay" />
    </intent-filter>
</activity>
```

检查：

```bash
adb shell dumpsys package com.example.app | grep -B3 -A8 'exported=true'
```

要点：

- 只有 launcher、必须被外部拉起的深链、系统广播接收器才需要 `exported="true"`。
- 导出的组件要校验调用方/参数；不要信任 `Intent` 里的 `extras`、URI、`ClipData`。
- `PendingIntent` 要设置 `FLAG_IMMUTABLE`，除非确实需要可变；可变 PendingIntent 可能被劫持。
- `ContentProvider` 的 `grantUriPermissions`、`pathPermission` 要收紧；不要把 `openFile` 做成任意路径读取。

## 3. 数据存储：私有目录、外部存储、Keystore {#storage}

| 位置 | 默认可见性 | 建议 |
| --- | --- | --- |
| `/data/data/<pkg>/` | 仅本应用（未 root） | 敏感数据放这里，必要时再加密 |
| `getExternalFilesDir()` | 其他应用可读（旧版本） | 不放密钥/令牌 |
| `SharedPreferences` | 私有目录明文 XML | 敏感值用 Keystore 加密 |
| `SQLite` | 私有目录 | 注意 SQL 注入与备份泄露 |
| Android Keystore | 密钥不出 TEE/StrongBox | 用于加密密钥、签名 |

> **`android:allowBackup="true"`** 会让应用数据进入备份；敏感应用应关闭，或用 `backupRules` 排除。

```xml
<application
    android:allowBackup="false"
    android:fullBackupContent="false"
    android:dataExtractionRules="@xml/data_extraction_rules" />
```

## 4. 网络：明文、证书固定、WebView {#network}

Android 9+ 默认禁止明文 HTTP。显式配置：

```xml
<!-- res/xml/network_security_config.xml -->
<network-security-config>
  <base-config cleartextTrafficPermitted="false" />
  <domain-config>
    <domain includeSubdomains="true">api.example.com</domain>
    <pin-set expiration="2027-01-01">
      <pin digest="SHA-256">AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=</pin>
    </pin-set>
  </domain-config>
</network-security-config>
```

```xml
<application android:networkSecurityConfig="@xml/network_security_config" />
```

- 证书固定能降低 CA 被攻破的风险，但要有备份 pin 和轮换计划；pin 过期会导致全量不可用。
- WebView 不要开启 `setJavaScriptEnabled(true)` 后又暴露 `addJavascriptInterface` 给不可信页面。
- `WebViewClient.onReceivedSslError` 不要无条件 `proceed()`。
- 深链/网页跳转要校验 scheme/host，避免开放重定向和 intent 重定向。

## 5. 逆向与动态分析（仅限授权环境） {#reverse}

```bash
apktool d app.apk -o app-src          # 资源、manifest
jadx -d app-java app.apk              # Java/Kotlin 反编译
frida-ps -U                           # 已连接设备进程
objection -g com.example.app explore  # 运行时探针
```

常见检查点：

- `AndroidManifest.xml` 的 `exported`、`debuggable`、`allowBackup`、`usesCleartextTraffic`；
- `strings`/资源里是否有硬编码 token、内网地址、测试开关；
- 网络请求是否可被用户证书拦截（说明未做 pinning 或 pinning 可绕过）；
- 本地文件是否明文保存会话/密码；
- 日志是否输出敏感信息（`adb logcat`）。

> **边界：** root 检测、模拟器检测、Frida 检测都只是提高门槛，不是安全边界。真正的敏感操作应在服务端校验，并配合 Play Integrity/Attestation。

## 6. 常见漏洞模式 {#vulns}

| 模式 | 表现 | 修复 |
| --- | --- | --- |
| 导出组件无校验 | 任意应用拉起 Activity/Service | `exported=false` 或加权限/调用方校验 |
| Intent 重定向 | 内部 Intent 被转发到任意组件 | 显式 `setPackage`/`setComponent`，校验来源 |
| ContentProvider 路径穿越 | `openFile` 读取任意文件 | 规范化路径，白名单目录 |
| WebView JS 桥 | 不可信页面调用原生方法 | 限制域名、移除桥接、校验参数 |
| 明文存储 | SharedPreferences/SQLite 泄露 token | Keystore 加密、最小化存储 |
| 弱随机/硬编码密钥 | 可预测 token、固定 AES key | `SecureRandom`、Keystore、服务端密钥 |
| 调试开关 | release 包 `debuggable=true` | 构建类型区分，CI 检查 |
| 日志泄露 | logcat 输出密码/token | 发布包关闭敏感日志 |

## 7. 加固与发布检查 {#hardening}

- `minSdkVersion` 不要为了兼容过旧设备而放弃安全补丁；按业务权衡。
- 开启 R8/ProGuard，保留必要的反射/序列化规则；混淆不是加密。
- 发布包关闭 `debuggable`、`allowBackup`，移除测试 Activity/Provider。
- 使用 Play App Signing/App Bundle，保护签名密钥。
- 敏感接口做服务端鉴权、速率限制、设备绑定；不要只靠客户端校验。
- 对高风险应用考虑 Play Integrity、Key Attestation、TLS pinning 的组合。

## 8. 最小检查清单 {#checklist}

- [ ] `dumpsys package` 里没有不必要的 `exported=true`。
- [ ] 导出组件校验调用方和参数；PendingIntent 用 `FLAG_IMMUTABLE`。
- [ ] `allowBackup=false` 或配置 backup rules 排除敏感数据。
- [ ] 明文 HTTP 关闭；高风险域名做证书固定并有轮换计划。
- [ ] WebView 不向不可信页面暴露 JS 桥；SSL 错误不无条件放行。
- [ ] 敏感数据用 Keystore 加密，不写日志、不放外部存储。
- [ ] release 包 `debuggable=false`，移除测试组件和硬编码密钥。
- [ ] 服务端做最终鉴权，客户端检测只作为信号。

## 相关阅读 {#related}

- [安全](./../README.md)
- [安全：Web](./../web/README.md)
- [安全：二进制](./../bin/README.md)
- [Android 开发](./../../programming/android/README.md)
