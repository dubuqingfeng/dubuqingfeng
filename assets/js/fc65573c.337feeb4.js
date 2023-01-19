"use strict";(self.webpackChunkmy_website=self.webpackChunkmy_website||[]).push([[213],{3905:(e,t,r)=>{r.d(t,{Zo:()=>u,kt:()=>g});var n=r(67294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function o(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function l(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var p=n.createContext({}),c=function(e){var t=n.useContext(p),r=t;return e&&(r="function"==typeof e?e(t):o(o({},t),e)),r},u=function(e){var t=c(e.components);return n.createElement(p.Provider,{value:t},e.children)},m={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},s=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,i=e.originalType,p=e.parentName,u=l(e,["components","mdxType","originalType","parentName"]),s=c(r),g=a,d=s["".concat(p,".").concat(g)]||s[g]||m[g]||i;return r?n.createElement(d,o(o({ref:t},u),{},{components:r})):n.createElement(d,o({ref:t},u))}));function g(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=r.length,o=new Array(i);o[0]=s;var l={};for(var p in t)hasOwnProperty.call(t,p)&&(l[p]=t[p]);l.originalType=e,l.mdxType="string"==typeof e?e:a,o[1]=l;for(var c=2;c<i;c++)o[c]=r[c];return n.createElement.apply(null,o)}return n.createElement.apply(null,r)}s.displayName="MDXCreateElement"},91749:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>p,contentTitle:()=>o,default:()=>m,frontMatter:()=>i,metadata:()=>l,toc:()=>c});var n=r(87462),a=(r(67294),r(3905));const i={},o=void 0,l={unversionedId:"Wiki/programming/golang/data-structure/map",id:"Wiki/programming/golang/data-structure/map",title:"map",description:"map",source:"@site/docs/Wiki/programming/golang/data-structure/map.md",sourceDirName:"Wiki/programming/golang/data-structure",slug:"/Wiki/programming/golang/data-structure/map",permalink:"/docs/Wiki/programming/golang/data-structure/map",draft:!1,editUrl:"https://github.com/dubuqingfeng/dubuqingfeng/tree/master/wiki/docs/Wiki/programming/golang/data-structure/map.md",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"data-race",permalink:"/docs/Wiki/programming/golang/data-race/"},next:{title:"slice",permalink:"/docs/Wiki/programming/golang/data-structure/slice"}},p={},c=[{value:"map",id:"map",level:3},{value:"\u76ee\u5f55",id:"\u76ee\u5f55",level:4},{value:"\u7ebf\u7a0b\u5b89\u5168",id:"\u7ebf\u7a0b\u5b89\u5168",level:4},{value:"\u53c2\u8003\u94fe\u63a5",id:"\u53c2\u8003\u94fe\u63a5",level:4}],u={toc:c};function m(e){let{components:t,...r}=e;return(0,a.kt)("wrapper",(0,n.Z)({},u,r,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h3",{id:"map"},"map"),(0,a.kt)("h4",{id:"\u76ee\u5f55"},"\u76ee\u5f55"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"\u7ebf\u7a0b\u5b89\u5168"),(0,a.kt)("li",{parentName:"ul"},"\u51b2\u7a81\u89e3\u51b3")),(0,a.kt)("h4",{id:"\u7ebf\u7a0b\u5b89\u5168"},"\u7ebf\u7a0b\u5b89\u5168"),(0,a.kt)("p",null,"map \u5e76\u4e0d\u662f\u4e00\u4e2a\u7ebf\u7a0b\u5b89\u5168\u7684\u7ed3\u6784\uff0c\u5982\u679c\u9700\u8981\u591a\u4e2a goroutine \u8bfb\u5199\uff0c\u53ef\u4ee5\u4f7f\u7528\u8bfb\u5199\u9501\u6216\u8005\u662f sync.map"),(0,a.kt)("p",null,"\u5177\u4f53\u539f\u56e0\uff1a"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-go"},'if h.flags&hashWriting == 0 {\n    throw("concurrent map writes")\n}\n')),(0,a.kt)("p",null,"\u5982\u679c\u540c\u65f6\u591a\u4e2a goroutine \u8bfb\u5199\u4f1a\u600e\u6837\uff1f"),(0,a.kt)("p",null,"example\uff1a"),(0,a.kt)("h4",{id:"\u53c2\u8003\u94fe\u63a5"},"\u53c2\u8003\u94fe\u63a5"))}m.isMDXComponent=!0}}]);