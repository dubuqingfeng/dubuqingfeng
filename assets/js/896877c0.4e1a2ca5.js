"use strict";(self.webpackChunkmy_website=self.webpackChunkmy_website||[]).push([[5075],{3905:(e,t,n)=>{n.d(t,{Zo:()=>p,kt:()=>g});var r=n(67294);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var c=r.createContext({}),s=function(e){var t=r.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):a(a({},t),e)),n},p=function(e){var t=s(e.components);return r.createElement(c.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},m=r.forwardRef((function(e,t){var n=e.components,o=e.mdxType,i=e.originalType,c=e.parentName,p=l(e,["components","mdxType","originalType","parentName"]),m=s(n),g=o,f=m["".concat(c,".").concat(g)]||m[g]||u[g]||i;return n?r.createElement(f,a(a({ref:t},p),{},{components:n})):r.createElement(f,a({ref:t},p))}));function g(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var i=n.length,a=new Array(i);a[0]=m;var l={};for(var c in t)hasOwnProperty.call(t,c)&&(l[c]=t[c]);l.originalType=e,l.mdxType="string"==typeof e?e:o,a[1]=l;for(var s=2;s<i;s++)a[s]=n[s];return r.createElement.apply(null,a)}return r.createElement.apply(null,n)}m.displayName="MDXCreateElement"},71465:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>c,contentTitle:()=>a,default:()=>u,frontMatter:()=>i,metadata:()=>l,toc:()=>s});var r=n(87462),o=(n(67294),n(3905));const i={},a=void 0,l={unversionedId:"Wiki/programming/golang/data-structure/slice",id:"Wiki/programming/golang/data-structure/slice",title:"slice",description:"Slice",source:"@site/docs/Wiki/programming/golang/data-structure/slice.md",sourceDirName:"Wiki/programming/golang/data-structure",slug:"/Wiki/programming/golang/data-structure/slice",permalink:"/docs/Wiki/programming/golang/data-structure/slice",draft:!1,tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"map",permalink:"/docs/Wiki/programming/golang/data-structure/map"},next:{title:"unsafe-pointer",permalink:"/docs/Wiki/programming/golang/data-structure/unsafe-pointer"}},c={},s=[{value:"Slice",id:"slice",level:3},{value:"\u6e90\u7801",id:"\u6e90\u7801",level:4},{value:"Question",id:"question",level:4},{value:"\u53c2\u8003\u94fe\u63a5",id:"\u53c2\u8003\u94fe\u63a5",level:4}],p={toc:s};function u(e){let{components:t,...n}=e;return(0,o.kt)("wrapper",(0,r.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("h3",{id:"slice"},"Slice"),(0,o.kt)("h4",{id:"\u6e90\u7801"},"\u6e90\u7801"),(0,o.kt)("p",null,"\u6e90\u7801\u5730\u5740\u4e3a\uff1a"),(0,o.kt)("p",null,(0,o.kt)("a",{parentName:"p",href:"https://github.com/golang/go/blob/master/src/runtime/slice.go"},"https://github.com/golang/go/blob/master/src/runtime/slice.go")),(0,o.kt)("p",null,"\u5177\u4f53\u90e8\u5206\uff1a"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-go"},"type slice struct {\n    array unsafe.Pointer\n    len   int\n    cap   int\n}\n")),(0,o.kt)("p",null,"\u5e38\u89c1\u7684\u4e00\u4e9b\u51fd\u6570\uff1a"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre"},'// growslice handles slice growth during append.\nfunc growslice(et *_type, old slice, cap int) slice\n// slicecopy is used to copy from a string or slice of pointerless elements into a slice.\nfunc slicecopy(toPtr unsafe.Pointer, toLen int, fromPtr unsafe.Pointer, fromLen int, width uintptr) int\n// makeslicecopy allocates a slice of "tolen" elements of type "et",\nfunc makeslicecopy(et *_type, tolen int, fromlen int, from unsafe.Pointer) unsafe.Pointer\n')),(0,o.kt)("h4",{id:"question"},"Question"),(0,o.kt)("ol",null,(0,o.kt)("li",{parentName:"ol"},"\u5728\u6e90\u7801\u4e2d\uff0c\u6709\u4e00\u4e2a notInHeapSlice \uff0c\u7528\u6765 go:notinheap memory \u7684\uff0c\u90a3\u4e48\u662f\u4e0d\u662f\u610f\u5473\u7740 unsafe.pointer \u5728\u5806\u4e0a\u5462\uff1f")),(0,o.kt)("h4",{id:"\u53c2\u8003\u94fe\u63a5"},"\u53c2\u8003\u94fe\u63a5"),(0,o.kt)("p",null,"\u3010Go\u3011\u6df1\u5165\u5256\u6790slice\u548carray"),(0,o.kt)("p",null,(0,o.kt)("a",{parentName:"p",href:"https://zhuanlan.zhihu.com/p/54780689"},"https://zhuanlan.zhihu.com/p/54780689")),(0,o.kt)("p",null,"\u6df1\u5165\u89e3\u6790 Go \u4e2d Slice \u5e95\u5c42\u5b9e\u73b0"),(0,o.kt)("p",null,(0,o.kt)("a",{parentName:"p",href:"https://halfrost.com/go_slice/"},"https://halfrost.com/go_slice/")))}u.isMDXComponent=!0}}]);