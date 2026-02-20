---
title: XSS Filter
description: "0x01 前言及TOC 最近在看 XSS 的相关内容，也有很多需要注意的东西。在平时的开发及设计当中，不可避免的会遇到XSS，于是就有了设计一些filter的想法，以前也在phithon的github上看到过Python的XSS filter，毕竟自己动手实现一个对于理解XSS，以及过滤的相关事情是很有帮助的。因此设计一些简单的filter，以备自己使用，并且这些filter是不安全的，不要放在生产环境，毕竟没有经过一些专业的检测，以及..."
date: 2016-05-23 23:22
updated: 2016-05-24 22:34
tags: 
  - Web安全
  - xss
  - 技术
excerpt: XSS 漏洞的Filter设计，并对一些语言，PHP、Python、Java进行了实践。
categories: Web安全
permalink: 201605-xss-filter.html
author: admin
toc: true
---

# 0x01  前言及TOC
最近在看 XSS 的相关内容，也有很多需要注意的东西。在平时的开发及设计当中，不可避免的会遇到XSS，于是就有了设计一些filter的想法，以前也在phithon的github上看到过Python的[XSS filter](https://github.com/phith0n/python-xss-filter)，毕竟自己动手实现一个对于理解XSS，以及过滤的相关事情是很有帮助的。因此设计一些简单的filter，以备自己使用，并且这些filter是不安全的，不要放在生产环境，毕竟没有经过一些专业的检测，以及自己的JavaScript和XSS水平有待提高。以及以后可能还会写一些如何attack 这个filter的文章。

TOC：

+ 基础的filter
+ Python filter设计
+ Java filter设计
+ PHP filter设计
+ 系统层面filter
+ 后记
+ 相关paper

# 0x02  基础的filter

首先需要过滤 `< > " ( ) / script` 等字符(`">_<script123"`)，在PHP里可以使用preg_replace函数去过滤，并且通过htmlspecialchars函数转换为HTML实体编码。即：

```php
function safe_replace($content){
	$tags = array(
		"'<iframe[^>]*?>.*?</iframe>'is",
		"'<frame[^>]*?>.*?</frame>'is",
		"'<script[^>]*?>.*?</script>'is",
		"'<head[^>]*?>.*?</head>'is",
		"'<title[^>]*?>.*?</title>'is",
		"'<meta[^ />]*?>'is",
		"'<link[^ />]*?>'is",
	);
	return preg_replace($tags, "", $content);
}
echo htmlspecialchars(safe_replace($content));
```

这里可以采用[zicai的XSS-learn代码](https://github.com/zicai/xss-learn/)进行实验。

java可以使用：

```java
string = string.replaceAll("<", "&lt;");
string = string.replaceAll(">", "&gt;");
import org.apache.commons.lang.StringEscapeUtils;
StringEscapeUtils.escapeHtml("<script>alert('xss')</script>");
//如果引用spring框架
import org.springframework.web.util.HtmlUtils;
HtmlUtils.htmlEscape("<script>alert(1)</script>");
```

当有了过滤以后，测试 `<>"(` 号时，发现 `<>` 被转义成`&lt;`和`&gt;`，而 `"` / `(` 等的并没有转义，当时怀疑是被实体编码了。当看到实际代码时，发现是字符串正则替换，后来一想，如果是类似于httpspecialchars那种的实体编码的话，引号也应该转义才对。当时还想着怎么绕过实体编码转义，于是又有了一个问题，关于java里的escapeHtml的底层实现是怎样的？以及实体编码是怎样的过程，似乎这个有点偏离主题了，这个完了再思考去写一篇总结编码的文章。

而在Python里可以使用

```python
import cgi
cgi.escape("")
```

以上都是一些正则过滤和escape编码的手段，当然不会过滤掉所有的XSS，仅可以防御一些小白。

还是会有人去寻找其他的可控点，或者想办法去绕过过滤。

当然这可以过滤**';alert(String.fromCharCode(88,83,83))**这种的攻击向量么，如果可控点在JavaScript代码里呢，或者javascript伪协议，例如

```html
<img src="javascript:alert('xss');" />
```

以及如果使用黑名单去过滤javascript伪协议的XSS，可以使用一些空格或者回车Tab等的绕过。即：

```html
<img src="javas
cript:
alert(/xss/)" />
```

如何去过滤这种的呢？

将换行符换成\n，将回车符换成\r，将制表符换成\t，空格可以遍历去除。

当过滤完这种的以后呢，又会出现一些大小写混淆或者十进制十六进制编码或者注释的示例：

```html
<img src="JavaScRiPt:alert('xss');" />
<img src="jav&#97;ascript:alert('xss);" />
<img src="jav&#x09;ascript:alert('xss);" />
<img src="jav/**/ascript:alert('xss');" />
```

面对这些，如果过滤`/*&#javascript\;`，不如采取一些白名单的形式，仅允许执行特定形式的，去正则匹配结果。例如：仅允许`<img src="http://" />`这种的。

可以构造正则语句："/^((http|ftp|https):\/\/)?[\w-_.]+(\/[\w-_]+)*\/?$/"

如果单纯地过滤一些常见的`<script>`标签或者`onerror、onResume`等事件，还是可能会利用`<link />`引入一个内容为如下的CSS进行hack。

```css
@import 'javascript:alert("XSS")';
```

当然还是要记得去判断变量类型，数字型的直接判断是否是数字，字符型的限定一些长度，并且不能有特殊字符，还有不能有[拆分跨站法(疯狂的跨站之行)](http://hx99.net/Article/Tech/201409/36125.html)的出现。

如果一直针对绕过的方法，去不断过滤，未免有点麻烦，应该设计一个统一的filter，加强防御。

#####0x03  Python filter设计

一些用户的输入都是不可信的。

基础的过滤就得使用一些函数或者开源库:

```python
//基础的过滤
escape(text, quote=True).replace(':','&#58;')
//以及一个富文本过滤类
lxml.html.clean.Cleaner.clean_html(html)
```

富文本过滤类的一种思路：

1.解析HTML节点

2.过滤白名单标签，删除不在白名单的标签，并且判断属性及属性值。

以及一些框架的处理策略：

tornado：

Tornado框架原则上所有输出在模板里的变量都会经过"HTML实体化"，并且官方文档也给出了[一篇文章的链接](http://wonko.com/post/html-escaping)，说明了仅过滤 `&`、`<`、`>`、`"`、`'` 这些字符是不够的。

tornado都会自动执行xhtml_escape方法，将 `<`、`>`、`"`、`'`、`&` 进行了转义。

但是也需要针对特殊情况去过滤，关注一些输出在JavaScript代码的地方，进行特定形式的转义、正则匹配。

# 0x04  PHP filter设计

《XSS跨站脚本与防御》的第242页给出了一个通用的过滤XSS的函数，贴到了[gist](https://gist.github.com/dubuqingfeng/019414ea26ddba6257c089c26ed3852c)。

PHP在处理`$_GET`、`$_POST`、`$_REQUEST`等变量时需过滤一次。

需要使用一些filter_var()，filter_input()函数来进行构造一些规则，进行一些模式的匹配，过滤。

网上的一个防止基本的XSS函数：

```php
function transform_HTML($string, $length = null) {
	// Helps prevent XSS attacks
	// Remove dead space.
	$string = trim($string);
	// Prevent potential Unicode codec problems.
	$string = utf8_decode($string);
	// HTMLize HTML-specific characters.
	$string = htmlentities($string, ENT_NOQUOTES);
	$string = str_replace("#", "&#35;", $string);
	$string = str_replace("%", "&#37;", $string);
	$length = intval($length);
	if ($length > 0) {
		$string = substr($string, 0, $length);
	}
	return $string;
}
```

从代码可以看到，期间过滤的一些空格，Unicode转码的问题，一些十进制十六进制的编码，并且限定了长度，进行了HTML实体编码，针对基础的XSS问题足够了。可以设计一个函数，获取GET、POST、REQUEST参数的时候，可以进行XSS的防护。

以及可以使用一些类似于HTML Purifier，或者一些富文本过滤类。

# 0x05  Java filter设计

Java Web方面，通过过滤一些Request请求，在GET或者POST请求层面进行过滤。

Java里面本来就有一个Filter类，继承这个Filter类，然后可以通过构造一个XSSRequestWrapper，过滤一些HttpServletRequest，配置好Web.xml，使这个继承后的Filter类全局有效，进行自动的anti一些xss，过滤掉所有请求里的恶意脚本。

在XSSRequestWrapper这个类里，需要重写一些getParameterValues(), getParameter() 和 getHeader()方法，期间实现一些过滤xss的函数，通过一些HTML实体编码的手段，以及正则匹配替换掉一些关键词，或者直接replaceAll去替换。

Web.xml的配置方法：

```xml
<!-- XSS过滤器  -->
<filter>
<filter-name>XSSFilter</filter-name>
<filter-class>
com.sxau.filter.XssFilter
</filter-class>
</filter>
<filter-mapping>
<filter-name>XSSFilter</filter-name>
<url-pattern>/*</url-pattern>
</filter-mapping>
```

也可以使用一些类似于[Lucy-XSS : XssFilter, XssPreventer](https://github.com/naver/lucy-xss-filter)的模块去处理。

# 0x06  系统层面filter

这里的系统层面，侧重于WAF方面。

WAF可以是硬件层面，也可以是软件层面，[ngx_lua_waf](https://github.com/loveshell/ngx_lua_waf)就提供了一种基于nginx_lua的思路。

通常会定义一些过滤规则，就像下面这样的正则匹配规则：

```
\.\./
\:\$
\$\{
\<(iframe|script|body|img|layer|div|meta|style|base|object|input)
(onmouseover|onerror|onload)\=
(gopher|doc|php|glob|file|phar|zlib|ftp|ldap|dict|ogg|data)\:\/
java\.lang
\$_(GET|post|cookie|files|session|env|phplib|GLOBALS|SERVER)\[
```

当然有些WAF还是联网获取这些规则的，它们采用的一些正则表达式匹配的方法，比较容易被绕过的，也有人提出了[主动防御](http://www.edu.cn/web_9955/20100609/t20100609_484473.shtml)的概念。

# 0x07  后记

当学习地渐渐深入的时候，会越来越发现其的神奇，不断的过滤，不断的绕过，以及还有二哥和长短短的一些猥琐的思路，并且也有很多人教导学习XSS时候，一定要注意JavaScript基础，毕竟好的一名跨站师，xsser都是JavaScript很厉害。

当然防御XSS，不只有建立filter，也需要一些HttpOnly，Noscript，WAF，CSP的配合，更需要加强安全意识。

以后探索的方向：

自动化挖掘XSS漏洞，自动化防御，CVE里的XSS，以及总结一些好的XSS思路，新型XSS，自动化利用框架，浏览器Filter策略，防御XSS，机器学习等。。。

# 0x08  相关paper及资料

+ 给开发者的终极XSS备忘录
+  [python-xss-filter](https://github.com/phith0n/python-xss-filter)
+ site:freebuf.com xss
+ [Wooyun Drops](http://drops.wooyun.org/?s=xss&submit=%E6%90%9C%E7%B4%A2)
+ [owasp-esapi-python](https://code.google.com/p/owasp-esapi-python/)
