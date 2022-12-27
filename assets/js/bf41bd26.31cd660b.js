"use strict";(self.webpackChunkmy_website=self.webpackChunkmy_website||[]).push([[4750],{3905:(e,t,r)=>{r.d(t,{Zo:()=>u,kt:()=>m});var n=r(7294);function i(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function l(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function a(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?l(Object(r),!0).forEach((function(t){i(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):l(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function o(e,t){if(null==e)return{};var r,n,i=function(e,t){if(null==e)return{};var r,n,i={},l=Object.keys(e);for(n=0;n<l.length;n++)r=l[n],t.indexOf(r)>=0||(i[r]=e[r]);return i}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(n=0;n<l.length;n++)r=l[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(i[r]=e[r])}return i}var p=n.createContext({}),s=function(e){var t=n.useContext(p),r=t;return e&&(r="function"==typeof e?e(t):a(a({},t),e)),r},u=function(e){var t=s(e.components);return n.createElement(p.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},c=n.forwardRef((function(e,t){var r=e.components,i=e.mdxType,l=e.originalType,p=e.parentName,u=o(e,["components","mdxType","originalType","parentName"]),c=s(r),m=i,k=c["".concat(p,".").concat(m)]||c[m]||d[m]||l;return r?n.createElement(k,a(a({ref:t},u),{},{components:r})):n.createElement(k,a({ref:t},u))}));function m(e,t){var r=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var l=r.length,a=new Array(l);a[0]=c;var o={};for(var p in t)hasOwnProperty.call(t,p)&&(o[p]=t[p]);o.originalType=e,o.mdxType="string"==typeof e?e:i,a[1]=o;for(var s=2;s<l;s++)a[s]=r[s];return n.createElement.apply(null,a)}return n.createElement.apply(null,r)}c.displayName="MDXCreateElement"},589:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>p,contentTitle:()=>a,default:()=>d,frontMatter:()=>l,metadata:()=>o,toc:()=>s});var n=r(7462),i=(r(7294),r(3905));const l={},a=void 0,o={unversionedId:"Wiki/programming/database/redis/interview/interview",id:"Wiki/programming/database/redis/interview/interview",title:"interview",description:"interview",source:"@site/docs/Wiki/programming/database/redis/interview/interview.md",sourceDirName:"Wiki/programming/database/redis/interview",slug:"/Wiki/programming/database/redis/interview/",permalink:"/docs/Wiki/programming/database/redis/interview/",draft:!1,editUrl:"https://github.com/dubuqingfeng/dubuqingfeng/tree/master/wiki/docs/Wiki/programming/database/redis/interview/interview.md",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"b+tree",permalink:"/docs/Wiki/programming/database/mysql/b+tree"},next:{title:"list",permalink:"/docs/Wiki/programming/database/redis/source/list"}},p={},s=[{value:"interview",id:"interview",level:3},{value:"\u6570\u636e\u7ed3\u6784",id:"\u6570\u636e\u7ed3\u6784",level:4},{value:"\u6301\u4e45\u5316",id:"\u6301\u4e45\u5316",level:4},{value:"\u7ebf\u7a0b",id:"\u7ebf\u7a0b",level:4},{value:"\u4e00\u81f4\u6027",id:"\u4e00\u81f4\u6027",level:4},{value:"\u8df3\u8868",id:"\u8df3\u8868",level:4},{value:"\u5206\u5e03\u5f0f\u9501",id:"\u5206\u5e03\u5f0f\u9501",level:4},{value:"\u5206\u5e03\u5f0f\u9650\u6d41",id:"\u5206\u5e03\u5f0f\u9650\u6d41",level:4}],u={toc:s};function d(e){let{components:t,...r}=e;return(0,i.kt)("wrapper",(0,n.Z)({},u,r,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("h3",{id:"interview"},"interview"),(0,i.kt)("h4",{id:"\u6570\u636e\u7ed3\u6784"},"\u6570\u636e\u7ed3\u6784"),(0,i.kt)("ol",null,(0,i.kt)("li",{parentName:"ol"},"redis\u4e3a\u4ec0\u4e48\u662fkey,value\u7684\uff0c\u4e3a\u4ec0\u4e48\u4e0d\u652f\u6301sql\uff1f")),(0,i.kt)("p",null,(0,i.kt)("strong",{parentName:"p"},"Remote Dictionary Server")),(0,i.kt)("ol",{start:2},(0,i.kt)("li",{parentName:"ol"},"10\u4e07\u7528\u6237\u4e00\u5e74365\u5929\u7684\u767b\u5f55\u60c5\u51b5\u5982\u4f55\u7528redis\u5b58\u50a8\uff0c\u5e76\u5feb\u901f\u68c0\u7d22\u4efb\u610f\u65f6\u95f4\u7a97\u5185\u7684\u6d3b\u8dc3\u7528\u6237\uff1f")),(0,i.kt)("p",null,"bitmap"),(0,i.kt)("h4",{id:"\u6301\u4e45\u5316"},"\u6301\u4e45\u5316"),(0,i.kt)("ol",null,(0,i.kt)("li",{parentName:"ol"},"AOF \u548c RDB \u7684\u533a\u522b\uff0c\u4f18\u70b9")),(0,i.kt)("ol",{start:2},(0,i.kt)("li",{parentName:"ol"},"redis\u7684\u6301\u4e45\u5316\u5f00\u542f\u4e86RDB\u548cAOF\u4e0b\u91cd\u542f\u670d\u52a1\u662f\u5982\u4f55\u52a0\u8f7d\u7684")),(0,i.kt)("p",null,"1\uff09 AOF\u6301\u4e45\u5316\u5f00\u542f\u4e14\u5b58\u5728AOF\u6587\u4ef6\u65f6\uff0c\u4f18\u5148\u52a0\u8f7dAOF\u6587\u4ef6\uff0c\n2\uff09 AOF\u5173\u95ed\u6216\u8005AOF\u6587\u4ef6\u4e0d\u5b58\u5728\u65f6\uff0c\u52a0\u8f7dRDB\u6587\u4ef6\uff0c\n3\uff09 \u52a0\u8f7dAOF/RDB\u6587\u4ef6\u6210\u529f\u540e\uff0cRedis\u542f\u52a8\u6210\u529f\u3002\n4\uff09 AOF/RDB\u6587\u4ef6\u5b58\u5728\u9519\u8bef\u65f6\uff0cRedis\u542f\u52a8\u5931\u8d25\u5e76\u6253\u5370\u9519\u8bef\u4fe1\u606f"),(0,i.kt)("h4",{id:"\u7ebf\u7a0b"},"\u7ebf\u7a0b"),(0,i.kt)("ol",null,(0,i.kt)("li",{parentName:"ol"},"Redis \u662f\u5355\u7ebf\u7a0b\u7684\u5417\uff1f")),(0,i.kt)("p",null,'\u76ee\u524d\u6240\u8bf4\u7684Redis\u5355\u7ebf\u7a0b\uff0c\u6307\u7684\u662f"\u5176\u7f51\u7edcIO\u548c\u952e\u503c\u5bf9\u8bfb\u5199\u662f\u7531\u4e00\u4e2a\u7ebf\u7a0b\u5b8c\u6210\u7684"\uff0c\u4e5f\u5c31\u662f\u8bf4\uff0cRedis\u4e2d\u53ea\u6709\u7f51\u7edc\u8bf7\u6c42\u6a21\u5757\u548c\u6570\u636e\u64cd\u4f5c\u6a21\u5757\u662f\u5355\u7ebf\u7a0b\u7684\u3002 \u800c\u5176\u4ed6\u7684\u5982\u6301\u4e45\u5316\u5b58\u50a8\u6a21\u5757\u3001\u96c6\u7fa4\u652f\u6491\u6a21\u5757\u7b49\u662f\u591a\u7ebf\u7a0b\u7684\u3002 \u6240\u4ee5\u8bf4\uff0cRedis\u4e2d\u5e76\u4e0d\u662f\u6ca1\u6709\u591a\u7ebf\u7a0b\u6a21\u578b\u7684\uff0c\u65e9\u5728Redis 4.0\u7684\u65f6\u5019\u5c31\u5df2\u7ecf\u9488\u5bf9\u90e8\u5206\u547d\u4ee4\u505a\u4e86\u591a\u7ebf\u7a0b\u5316\u3002'),(0,i.kt)("h4",{id:"\u4e00\u81f4\u6027"},"\u4e00\u81f4\u6027"),(0,i.kt)("ol",null,(0,i.kt)("li",{parentName:"ol"},"Redis\u4e2d\u5982\u4f55\u89e3\u51b3\u7f13\u5b58\u7684\u4e00\u81f4\u6027\u95ee\u9898")),(0,i.kt)("p",null,"\u770b\u573a\u666f\uff0c\u8bfb\u591a\u5199\u5c11"),(0,i.kt)("p",null,"\u5ef6\u65f6\u53cc\u5220"),(0,i.kt)("h4",{id:"\u8df3\u8868"},"\u8df3\u8868"),(0,i.kt)("ol",null,(0,i.kt)("li",{parentName:"ol"},"\u65f6\u95f4\u590d\u6742\u5ea6\uff1a",(0,i.kt)("strong",{parentName:"li"},"O(log n)"))),(0,i.kt)("ol",{start:2},(0,i.kt)("li",{parentName:"ol"},"redis\u4e2d\u4e3a\u5565\u4e0d\u7528\u7ea2\u9ed1\u6811\u800c\u7528\u8df3\u8868\uff1f")),(0,i.kt)("p",null,"1 \u5185\u5b58\u5360\u7528\u65b9\u9762\u8df3\u8868\u6bd4\u7ea2\u9ed1\u6811\u591a\uff0c\u4f46\u662f\u591a\u7684\u5185\u5b58\u5f88\u6709\u9650\n2 \u5b9e\u73b0\u6bd4\u7ea2\u9ed1\u6811\u7b80\u5355\n3 \u8ddf\u7ea2\u9ed1\u6811\u66f4\u65b9\u4fbf\u7684\u652f\u6301\u8303\u56f4\u67e5\u8be2"),(0,i.kt)("h4",{id:"\u5206\u5e03\u5f0f\u9501"},"\u5206\u5e03\u5f0f\u9501"),(0,i.kt)("ol",null,(0,i.kt)("li",{parentName:"ol"},"redlock")),(0,i.kt)("h4",{id:"\u5206\u5e03\u5f0f\u9650\u6d41"},"\u5206\u5e03\u5f0f\u9650\u6d41"),(0,i.kt)("ol",null,(0,i.kt)("li",{parentName:"ol"},"Redis-Cell")),(0,i.kt)("p",null,"\u9762\u8bd5\u9898\uff1a"),(0,i.kt)("p",null,(0,i.kt)("a",{parentName:"p",href:"https://juejin.cn/post/7004681100228296717"},"https://juejin.cn/post/7004681100228296717")))}d.isMDXComponent=!0}}]);