"use strict";(self.webpackChunkmy_website=self.webpackChunkmy_website||[]).push([[5737],{3905:(e,t,r)=>{r.d(t,{Zo:()=>c,kt:()=>u});var a=r(7294);function n(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,a)}return r}function l(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){n(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function g(e,t){if(null==e)return{};var r,a,n=function(e,t){if(null==e)return{};var r,a,n={},o=Object.keys(e);for(a=0;a<o.length;a++)r=o[a],t.indexOf(r)>=0||(n[r]=e[r]);return n}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(a=0;a<o.length;a++)r=o[a],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(n[r]=e[r])}return n}var i=a.createContext({}),m=function(e){var t=a.useContext(i),r=t;return e&&(r="function"==typeof e?e(t):l(l({},t),e)),r},c=function(e){var t=m(e.components);return a.createElement(i.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},s=a.forwardRef((function(e,t){var r=e.components,n=e.mdxType,o=e.originalType,i=e.parentName,c=g(e,["components","mdxType","originalType","parentName"]),s=m(r),u=n,k=s["".concat(i,".").concat(u)]||s[u]||p[u]||o;return r?a.createElement(k,l(l({ref:t},c),{},{components:r})):a.createElement(k,l({ref:t},c))}));function u(e,t){var r=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var o=r.length,l=new Array(o);l[0]=s;var g={};for(var i in t)hasOwnProperty.call(t,i)&&(g[i]=t[i]);g.originalType=e,g.mdxType="string"==typeof e?e:n,l[1]=g;for(var m=2;m<o;m++)l[m]=r[m];return a.createElement.apply(null,l)}return a.createElement.apply(null,r)}s.displayName="MDXCreateElement"},6515:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>i,contentTitle:()=>l,default:()=>p,frontMatter:()=>o,metadata:()=>g,toc:()=>m});var a=r(7462),n=(r(7294),r(3905));const o={},l=void 0,g={unversionedId:"Wiki/programming/golang/gc/gc",id:"Wiki/programming/golang/gc/gc",title:"gc",description:"GC",source:"@site/docs/Wiki/programming/golang/gc/gc.md",sourceDirName:"Wiki/programming/golang/gc",slug:"/Wiki/programming/golang/gc/",permalink:"/docs/Wiki/programming/golang/gc/",draft:!1,editUrl:"https://github.com/dubuqingfeng/dubuqingfeng/tree/master/wiki/docs/Wiki/programming/golang/gc/gc.md",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"unsafe-pointer",permalink:"/docs/Wiki/programming/golang/data-structure/unsafe-pointer"},next:{title:"goroutine",permalink:"/docs/Wiki/programming/golang/goroutine/"}},i={},m=[{value:"GC",id:"gc",level:3},{value:"ToC",id:"toc",level:4},{value:"\u6e90\u7801\u5730\u5740",id:"\u6e90\u7801\u5730\u5740",level:4},{value:"\u53d1\u5c55\u5386\u53f2",id:"\u53d1\u5c55\u5386\u53f2",level:4},{value:"\u8fc7\u7a0b",id:"\u8fc7\u7a0b",level:4},{value:"\u4e09\u8272\u6807\u8bb0",id:"\u4e09\u8272\u6807\u8bb0",level:4},{value:"STW",id:"stw",level:3},{value:"\u6df7\u5408\u5c4f\u969c",id:"\u6df7\u5408\u5c4f\u969c",level:4},{value:"\u53c2\u8003\u94fe\u63a5",id:"\u53c2\u8003\u94fe\u63a5",level:4}],c={toc:m};function p(e){let{components:t,...r}=e;return(0,n.kt)("wrapper",(0,a.Z)({},c,r,{components:t,mdxType:"MDXLayout"}),(0,n.kt)("h3",{id:"gc"},"GC"),(0,n.kt)("h4",{id:"toc"},"ToC"),(0,n.kt)("h4",{id:"\u6e90\u7801\u5730\u5740"},"\u6e90\u7801\u5730\u5740"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"https://github.com/golang/go/blob/master/src/runtime/mgc.go"},"https://github.com/golang/go/blob/master/src/runtime/mgc.go")),(0,n.kt)("h4",{id:"\u53d1\u5c55\u5386\u53f2"},"\u53d1\u5c55\u5386\u53f2"),(0,n.kt)("ol",null,(0,n.kt)("li",{parentName:"ol"},(0,n.kt)("a",{parentName:"li",href:"https://github.com/golang/go/blob/go1.0.1/src/pkg/runtime/mgc0.c#L882"},"v1.0")," \u2014 \u5b8c\u5168\u4e32\u884c\u7684\u6807\u8bb0\u548c\u6e05\u9664\u8fc7\u7a0b\uff0c\u9700\u8981\u6682\u505c\u6574\u4e2a\u7a0b\u5e8f\uff1b"),(0,n.kt)("li",{parentName:"ol"},(0,n.kt)("a",{parentName:"li",href:"https://github.com/golang/go/blob/go1.1/src/pkg/runtime/mgc0.c#L1938"},"v1.1")," \u2014 \u5728\u591a\u6838\u4e3b\u673a\u5e76\u884c\u6267\u884c\u5783\u573e\u6536\u96c6\u7684\u6807\u8bb0\u548c\u6e05\u9664\u9636\u6bb5",(0,n.kt)("a",{parentName:"li",href:"https://draveness.me/golang/docs/part3-runtime/ch07-memory/golang-garbage-collector/#fn:11"},"11"),"\uff1b"),(0,n.kt)("li",{parentName:"ol"},"v1.3 \u2014 \u8fd0\u884c\u65f6\u57fa\u4e8e\u53ea\u6709\u6307\u9488\u7c7b\u578b\u7684\u503c\u5305\u542b\u6307\u9488\u7684\u5047\u8bbe\u589e\u52a0\u4e86\u5bf9\u6808\u5185\u5b58\u7684\u7cbe\u786e\u626b\u63cf\u652f\u6301\uff0c\u5b9e\u73b0\u4e86\u771f\u6b63\u7cbe\u786e\u7684\u5783\u573e\u6536\u96c6",(0,n.kt)("a",{parentName:"li",href:"https://draveness.me/golang/docs/part3-runtime/ch07-memory/golang-garbage-collector/#fn:12"},"12"),"\uff1b",(0,n.kt)("ul",{parentName:"li"},(0,n.kt)("li",{parentName:"ul"},"\u5c06 ",(0,n.kt)("inlineCode",{parentName:"li"},"unsafe.Pointer")," \u7c7b\u578b\u8f6c\u6362\u6210\u6574\u6570\u7c7b\u578b\u7684\u503c\u8ba4\u5b9a\u4e3a\u4e0d\u5408\u6cd5\u7684\uff0c\u53ef\u80fd\u4f1a\u9020\u6210\u60ac\u6302\u6307\u9488\u7b49\u4e25\u91cd\u95ee\u9898\uff1b"))),(0,n.kt)("li",{parentName:"ol"},"v1.5 \u2014 \u5b9e\u73b0\u4e86\u57fa\u4e8e\u4e09\u8272\u6807\u8bb0\u6e05\u626b\u7684\u5e76\u53d1\u5783\u573e\u6536\u96c6\u5668",(0,n.kt)("a",{parentName:"li",href:"https://draveness.me/golang/docs/part3-runtime/ch07-memory/golang-garbage-collector/#fn:13"},"13"),"\uff1b",(0,n.kt)("ul",{parentName:"li"},(0,n.kt)("li",{parentName:"ul"},"\u5927\u5e45\u5ea6\u964d\u4f4e\u5783\u573e\u6536\u96c6\u7684\u5ef6\u8fdf\u4ece\u51e0\u767e ms \u964d\u4f4e\u81f3 10ms \u4ee5\u4e0b\uff1b"),(0,n.kt)("li",{parentName:"ul"},"\u8ba1\u7b97\u5783\u573e\u6536\u96c6\u542f\u52a8\u7684\u5408\u9002\u65f6\u95f4\u5e76\u901a\u8fc7\u5e76\u53d1\u52a0\u901f\u5783\u573e\u6536\u96c6\u7684\u8fc7\u7a0b\uff1b"))),(0,n.kt)("li",{parentName:"ol"},"v1.6 \u2014 \u5b9e\u73b0\u4e86\u53bb\u4e2d\u5fc3\u5316\u7684\u5783\u573e\u6536\u96c6\u534f\u8c03\u5668\uff1b",(0,n.kt)("ul",{parentName:"li"},(0,n.kt)("li",{parentName:"ul"},"\u57fa\u4e8e\u663e\u5f0f\u7684\u72b6\u6001\u673a\u4f7f\u5f97\u4efb\u610f Goroutine \u90fd\u80fd\u89e6\u53d1\u5783\u573e\u6536\u96c6\u7684\u72b6\u6001\u8fc1\u79fb\uff1b"),(0,n.kt)("li",{parentName:"ul"},"\u4f7f\u7528\u5bc6\u96c6\u7684\u4f4d\u56fe\u66ff\u4ee3\u7a7a\u95f2\u94fe\u8868\u8868\u793a\u7684\u5806\u5185\u5b58\uff0c\u964d\u4f4e\u6e05\u9664\u9636\u6bb5\u7684 CPU \u5360\u7528",(0,n.kt)("a",{parentName:"li",href:"https://draveness.me/golang/docs/part3-runtime/ch07-memory/golang-garbage-collector/#fn:14"},"14"),"\uff1b"))),(0,n.kt)("li",{parentName:"ol"},(0,n.kt)("a",{parentName:"li",href:"https://github.com/golang/go/blob/go1.7/src/runtime/mgc.go#L884"},"v1.7")," \u2014 \u901a\u8fc7",(0,n.kt)("strong",{parentName:"li"},"\u5e76\u884c\u6808\u6536\u7f29"),"\u5c06\u5783\u573e\u6536\u96c6\u7684\u65f6\u95f4\u7f29\u77ed\u81f3 2ms \u4ee5\u5185",(0,n.kt)("a",{parentName:"li",href:"https://draveness.me/golang/docs/part3-runtime/ch07-memory/golang-garbage-collector/#fn:15"},"15"),"\uff1b"),(0,n.kt)("li",{parentName:"ol"},(0,n.kt)("a",{parentName:"li",href:"https://github.com/golang/go/blob/go1.8/src/runtime/mgc.go#L930"},"v1.8")," \u2014 \u4f7f\u7528",(0,n.kt)("strong",{parentName:"li"},"\u6df7\u5408\u5199\u5c4f\u969c"),"\u5c06\u5783\u573e\u6536\u96c6\u7684\u65f6\u95f4\u7f29\u77ed\u81f3 0.5ms \u4ee5\u5185",(0,n.kt)("a",{parentName:"li",href:"https://draveness.me/golang/docs/part3-runtime/ch07-memory/golang-garbage-collector/#fn:16"},"16"),"\uff1b"),(0,n.kt)("li",{parentName:"ol"},(0,n.kt)("a",{parentName:"li",href:"https://github.com/golang/go/blob/go1.9/src/runtime/mgc.go#L1187"},"v1.9")," \u2014 \u5f7b\u5e95\u79fb\u9664\u6682\u505c\u7a0b\u5e8f\u7684\u91cd\u65b0\u626b\u63cf\u6808\u7684\u8fc7\u7a0b",(0,n.kt)("a",{parentName:"li",href:"https://draveness.me/golang/docs/part3-runtime/ch07-memory/golang-garbage-collector/#fn:17"},"17"),"\uff1b"),(0,n.kt)("li",{parentName:"ol"},(0,n.kt)("a",{parentName:"li",href:"https://github.com/golang/go/blob/go1.10/src/runtime/mgc.go#L1239"},"v1.10")," \u2014 \u66f4\u65b0\u4e86\u5783\u573e\u6536\u96c6\u8c03\u9891\u5668\uff08Pacer\uff09\u7684\u5b9e\u73b0\uff0c\u5206\u79bb\u8f6f\u786c\u5806\u5927\u5c0f\u7684\u76ee\u6807",(0,n.kt)("a",{parentName:"li",href:"https://draveness.me/golang/docs/part3-runtime/ch07-memory/golang-garbage-collector/#fn:18"},"18"),"\uff1b"),(0,n.kt)("li",{parentName:"ol"},(0,n.kt)("a",{parentName:"li",href:"https://github.com/golang/go/blob/go1.12/src/runtime/mgc.go#L1199"},"v1.12")," \u2014 \u4f7f\u7528",(0,n.kt)("strong",{parentName:"li"},"\u65b0\u7684\u6807\u8bb0\u7ec8\u6b62\u7b97\u6cd5"),"\u7b80\u5316\u5783\u573e\u6536\u96c6\u5668\u7684\u51e0\u4e2a\u9636\u6bb5",(0,n.kt)("a",{parentName:"li",href:"https://draveness.me/golang/docs/part3-runtime/ch07-memory/golang-garbage-collector/#fn:19"},"19"),"\uff1b"),(0,n.kt)("li",{parentName:"ol"},(0,n.kt)("a",{parentName:"li",href:"https://github.com/golang/go/blob/go1.13/src/runtime/mgc.go#L1200"},"v1.13")," \u2014 \u901a\u8fc7\u65b0\u7684 Scavenger \u89e3\u51b3\u77ac\u65f6\u5185\u5b58\u5360\u7528\u8fc7\u9ad8\u7684\u5e94\u7528\u7a0b\u5e8f\u5411\u64cd\u4f5c\u7cfb\u7edf\u5f52\u8fd8\u5185\u5b58\u7684\u95ee\u9898",(0,n.kt)("a",{parentName:"li",href:"https://draveness.me/golang/docs/part3-runtime/ch07-memory/golang-garbage-collector/#fn:20"},"20"),"\uff1b"),(0,n.kt)("li",{parentName:"ol"},(0,n.kt)("a",{parentName:"li",href:"https://github.com/golang/go/blob/go1.14/src/runtime/mgc.go#L1221"},"v1.14")," \u2014 \u4f7f\u7528\u5168\u65b0\u7684\u9875\u5206\u914d\u5668",(0,n.kt)("strong",{parentName:"li"},"\u4f18\u5316\u5185\u5b58\u5206\u914d\u7684\u901f\u5ea6"),(0,n.kt)("a",{parentName:"li",href:"https://draveness.me/golang/docs/part3-runtime/ch07-memory/golang-garbage-collector/#fn:21"},"21"),"\uff1b")),(0,n.kt)("h4",{id:"\u8fc7\u7a0b"},"\u8fc7\u7a0b"),(0,n.kt)("p",null,"We consider a cycle to be: sweep termination, mark, mark termination, and sweep."),(0,n.kt)("p",null,"\u6e05\u626b\u7ec8\u6b62\uff0c\u6807\u8bb0\uff0c\u6807\u8bb0\u7ec8\u6b62\uff0c\u4ea4\u6362"),(0,n.kt)("h4",{id:"\u4e09\u8272\u6807\u8bb0"},"\u4e09\u8272\u6807\u8bb0"),(0,n.kt)("p",null,(0,n.kt)("img",{parentName:"p",src:"https://433327134-files.gitbook.io/~/files/v0/b/gitbook-legacy-files/o/assets%2F-LjLtSYqqsBQODAJIhQ5%2F-Lxxz34HPuUqSYyGYrbb%2F-Lxxz3wrkAVKZ93IQ_MI%2Fgc-blueprint.png?generation=1578366688391319&alt=media",alt:"img"})),(0,n.kt)("h3",{id:"stw"},"STW"),(0,n.kt)("p",null,"\u4ece ",(0,n.kt)("inlineCode",{parentName:"p"}," stop the world")," \u5230 ",(0,n.kt)("inlineCode",{parentName:"p"}," start the world")," \u7684\u65f6\u95f4"),(0,n.kt)("h4",{id:"\u6df7\u5408\u5c4f\u969c"},"\u6df7\u5408\u5c4f\u969c"),(0,n.kt)("h4",{id:"\u53c2\u8003\u94fe\u63a5"},"\u53c2\u8003\u94fe\u63a5"),(0,n.kt)("p",null,"\u7801\u519c\u6843\u82b1\u6e90\uff1a"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"https://qcrao91.gitbook.io/go/gc/gc"},"https://qcrao91.gitbook.io/go/gc/gc")),(0,n.kt)("p",null,"Go \u8bed\u8a00\u7684 GC \u5b9e\u73b0\u5206\u6790"),(0,n.kt)("p",null,(0,n.kt)("a",{parentName:"p",href:"https://xargin.com/impl-of-go-gc/"},"https://xargin.com/impl-of-go-gc/")))}p.isMDXComponent=!0}}]);