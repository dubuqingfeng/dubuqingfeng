"use strict";(self.webpackChunkmy_website=self.webpackChunkmy_website||[]).push([[6574],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>s});var r=n(67294);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var c=r.createContext({}),g=function(e){var t=r.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},p=function(e){var t=g(e.components);return r.createElement(c.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},m=r.forwardRef((function(e,t){var n=e.components,o=e.mdxType,a=e.originalType,c=e.parentName,p=l(e,["components","mdxType","originalType","parentName"]),m=g(n),s=o,d=m["".concat(c,".").concat(s)]||m[s]||u[s]||a;return n?r.createElement(d,i(i({ref:t},p),{},{components:n})):r.createElement(d,i({ref:t},p))}));function s(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=n.length,i=new Array(a);i[0]=m;var l={};for(var c in t)hasOwnProperty.call(t,c)&&(l[c]=t[c]);l.originalType=e,l.mdxType="string"==typeof e?e:o,i[1]=l;for(var g=2;g<a;g++)i[g]=n[g];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}m.displayName="MDXCreateElement"},11896:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>c,contentTitle:()=>i,default:()=>u,frontMatter:()=>a,metadata:()=>l,toc:()=>g});var r=n(87462),o=(n(67294),n(3905));const a={},i=void 0,l={unversionedId:"Wiki/programming/golang/goroutine/gmp",id:"Wiki/programming/golang/goroutine/gmp",title:"gmp",description:"GMP \u6a21\u578b",source:"@site/docs/Wiki/programming/golang/goroutine/gmp.md",sourceDirName:"Wiki/programming/golang/goroutine",slug:"/Wiki/programming/golang/goroutine/gmp",permalink:"/docs/Wiki/programming/golang/goroutine/gmp",draft:!1,editUrl:"https://github.com/dubuqingfeng/dubuqingfeng/tree/master/wiki/docs/Wiki/programming/golang/goroutine/gmp.md",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"gm",permalink:"/docs/Wiki/programming/golang/goroutine/gm"},next:{title:"leak",permalink:"/docs/Wiki/programming/golang/goroutine/leak"}},c={},g=[{value:"GMP \u6a21\u578b",id:"gmp-\u6a21\u578b",level:3},{value:"ToC",id:"toc",level:4},{value:"\u6e90\u7801\u5730\u5740",id:"\u6e90\u7801\u5730\u5740",level:4},{value:"\u6e90\u7801\u5206\u6790",id:"\u6e90\u7801\u5206\u6790",level:4},{value:"M:N \u6a21\u578b",id:"mn-\u6a21\u578b",level:4},{value:"\u53c2\u8003\u94fe\u63a5",id:"\u53c2\u8003\u94fe\u63a5",level:4}],p={toc:g};function u(e){let{components:t,...n}=e;return(0,o.kt)("wrapper",(0,r.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("h3",{id:"gmp-\u6a21\u578b"},"GMP \u6a21\u578b"),(0,o.kt)("h4",{id:"toc"},"ToC"),(0,o.kt)("h4",{id:"\u6e90\u7801\u5730\u5740"},"\u6e90\u7801\u5730\u5740"),(0,o.kt)("p",null,(0,o.kt)("a",{parentName:"p",href:"https://github.com/golang/go/blob/master/src/runtime/proc.go"},"https://github.com/golang/go/blob/master/src/runtime/proc.go")),(0,o.kt)("h4",{id:"\u6e90\u7801\u5206\u6790"},"\u6e90\u7801\u5206\u6790"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre"},"// The bootstrap sequence is:\n//\n//  call osinit\n//  call schedinit\n//  make & queue new G\n//  call runtime\xb7mstart\n//\n// The new G calls runtime\xb7main.\n")),(0,o.kt)("p",null,"G \u4ee3\u8868 goroutine\uff0cM \u4ee3\u8868 \u5de5\u4f5c\u7ebf\u7a0b\uff0cP \u4ee3\u8868\u5904\u7406\u5668\uff0c\u4e00\u4e2a M \u8981\u7ed1\u5b9a\u4e00\u4e2a P\uff0c\u6bcf\u4e2a P \u6709\u4e00\u4e2a\u81ea\u5df1\u7684\u672c\u5730\u961f\u5217\u3002"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre"},"// G - goroutine.\n// M - worker thread, or machine.\n// P - processor, a resource that is required to execute Go code.\n//     M must have an associated P to execute Go code, however it can be\n//     blocked or in a syscall w/o an associated P.\n")),(0,o.kt)("p",null,"\u72b6\u6001\uff1aGidle,Grunnable,Grunning,Gsyscall,Gwaiting,Gdead"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre"},"struct P\n{\n    Lock;\n    G *gfree; // freelist, moved from sched\n    G *ghead; // runnable, moved from sched\n    G *gtail;\n    MCache *mcache; // moved from M\n    FixAlloc *stackalloc; // moved from M\n    uint64 ncgocall;\n    GCStats gcstats;\n    // etc\n...\n};\n")),(0,o.kt)("h4",{id:"mn-\u6a21\u578b"},"M:N \u6a21\u578b"),(0,o.kt)("h4",{id:"\u53c2\u8003\u94fe\u63a5"},"\u53c2\u8003\u94fe\u63a5"),(0,o.kt)("p",null,(0,o.kt)("a",{parentName:"p",href:"https://golang.org/s/go11sched"},"https://golang.org/s/go11sched")),(0,o.kt)("p",null,"golang \u6e90\u7801\u5b66\u4e60\u4e4bGMP (goroutine)"),(0,o.kt)("p",null,(0,o.kt)("a",{parentName:"p",href:"https://www.jianshu.com/p/665aca7af949"},"https://www.jianshu.com/p/665aca7af949")))}u.isMDXComponent=!0}}]);