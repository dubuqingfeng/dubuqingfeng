"use strict";(self.webpackChunkmy_website=self.webpackChunkmy_website||[]).push([[8922],{3905:(e,t,l)=>{l.d(t,{Zo:()=>c,kt:()=>g});var n=l(67294);function a(e,t,l){return t in e?Object.defineProperty(e,t,{value:l,enumerable:!0,configurable:!0,writable:!0}):e[t]=l,e}function r(e,t){var l=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),l.push.apply(l,n)}return l}function i(e){for(var t=1;t<arguments.length;t++){var l=null!=arguments[t]?arguments[t]:{};t%2?r(Object(l),!0).forEach((function(t){a(e,t,l[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(l)):r(Object(l)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(l,t))}))}return e}function o(e,t){if(null==e)return{};var l,n,a=function(e,t){if(null==e)return{};var l,n,a={},r=Object.keys(e);for(n=0;n<r.length;n++)l=r[n],t.indexOf(l)>=0||(a[l]=e[l]);return a}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(n=0;n<r.length;n++)l=r[n],t.indexOf(l)>=0||Object.prototype.propertyIsEnumerable.call(e,l)&&(a[l]=e[l])}return a}var p=n.createContext({}),u=function(e){var t=n.useContext(p),l=t;return e&&(l="function"==typeof e?e(t):i(i({},t),e)),l},c=function(e){var t=u(e.components);return n.createElement(p.Provider,{value:t},e.children)},m={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},k=n.forwardRef((function(e,t){var l=e.components,a=e.mdxType,r=e.originalType,p=e.parentName,c=o(e,["components","mdxType","originalType","parentName"]),k=u(l),g=a,s=k["".concat(p,".").concat(g)]||k[g]||m[g]||r;return l?n.createElement(s,i(i({ref:t},c),{},{components:l})):n.createElement(s,i({ref:t},c))}));function g(e,t){var l=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var r=l.length,i=new Array(r);i[0]=k;var o={};for(var p in t)hasOwnProperty.call(t,p)&&(o[p]=t[p]);o.originalType=e,o.mdxType="string"==typeof e?e:a,i[1]=o;for(var u=2;u<r;u++)i[u]=l[u];return n.createElement.apply(null,i)}return n.createElement.apply(null,l)}k.displayName="MDXCreateElement"},51251:(e,t,l)=>{l.r(t),l.d(t,{assets:()=>p,contentTitle:()=>i,default:()=>m,frontMatter:()=>r,metadata:()=>o,toc:()=>u});var n=l(87462),a=(l(67294),l(3905));const r={},i=void 0,o={unversionedId:"Wiki/programming/golang/interview/interview",id:"Wiki/programming/golang/interview/interview",title:"interview",description:"\u5e38\u89c1\u7684\u4e00\u4e9b Golang \u9762\u8bd5\u9898\uff0c\u516b\u80a1\u6587",source:"@site/docs/Wiki/programming/golang/interview/interview.md",sourceDirName:"Wiki/programming/golang/interview",slug:"/Wiki/programming/golang/interview/",permalink:"/docs/Wiki/programming/golang/interview/",draft:!1,tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"scheduler",permalink:"/docs/Wiki/programming/golang/goroutine/scheduler"},next:{title:"code",permalink:"/docs/Wiki/programming/golang/interview/code"}},p={},u=[{value:"\u5e38\u89c1\u7684\u4e00\u4e9b Golang \u9762\u8bd5\u9898\uff0c\u516b\u80a1\u6587",id:"\u5e38\u89c1\u7684\u4e00\u4e9b-golang-\u9762\u8bd5\u9898\u516b\u80a1\u6587",level:3},{value:"\u76ee\u5f55",id:"\u76ee\u5f55",level:4},{value:"\u534f\u7a0b",id:"\u534f\u7a0b",level:4},{value:"Map",id:"map",level:4},{value:"make\uff0cnew",id:"makenew",level:3},{value:"Array\uff0cSlice",id:"arrayslice",level:4},{value:"Mutex",id:"mutex",level:4},{value:"Channel",id:"channel",level:4},{value:"\u5783\u573e\u56de\u6536",id:"\u5783\u573e\u56de\u6536",level:4},{value:"\u5185\u5b58\u9003\u9038",id:"\u5185\u5b58\u9003\u9038",level:4},{value:"\u53c2\u8003\u94fe\u63a5",id:"\u53c2\u8003\u94fe\u63a5",level:4}],c={toc:u};function m(e){let{components:t,...l}=e;return(0,a.kt)("wrapper",(0,n.Z)({},c,l,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h3",{id:"\u5e38\u89c1\u7684\u4e00\u4e9b-golang-\u9762\u8bd5\u9898\u516b\u80a1\u6587"},"\u5e38\u89c1\u7684\u4e00\u4e9b Golang \u9762\u8bd5\u9898\uff0c\u516b\u80a1\u6587"),(0,a.kt)("p",null,"\u9009\u81ea\u725b\u5ba2\u7f51\uff0c\u6398\u91d1\u7b49\u7f51\u7ad9"),(0,a.kt)("h4",{id:"\u76ee\u5f55"},"\u76ee\u5f55"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"\u534f\u7a0b"),(0,a.kt)("li",{parentName:"ul"},"map"),(0,a.kt)("li",{parentName:"ul"},"Mutex"),(0,a.kt)("li",{parentName:"ul"},"Channel"),(0,a.kt)("li",{parentName:"ul"},"\u5783\u573e\u56de\u6536")),(0,a.kt)("h4",{id:"\u534f\u7a0b"},"\u534f\u7a0b"),(0,a.kt)("ol",null,(0,a.kt)("li",{parentName:"ol"},"\u8fdb\u7a0b\u3001\u7ebf\u7a0b\u3001\u534f\u7a0b\u7684\u6bd4\u8f83"),(0,a.kt)("li",{parentName:"ol"},"GMP\u6a21\u578b"),(0,a.kt)("li",{parentName:"ol"},"goroutine \u81ea\u65cb\u5360\u7528cpu\u5982\u4f55\u89e3\u51b3\uff08go\u8c03\u7528\u3001gmp\uff09"),(0,a.kt)("li",{parentName:"ol"},"goroutine \u62a2\u5360\u65f6\u673a\uff08gc \u6808\u626b\u63cf\uff09")),(0,a.kt)("h4",{id:"map"},"Map"),(0,a.kt)("ol",null,(0,a.kt)("li",{parentName:"ol"},"Golang Map \u5e95\u5c42\u5b9e\u73b0"),(0,a.kt)("li",{parentName:"ol"},"\u5982\u4f55\u5b9e\u73b0Map\u7684\u6709\u5e8f\u67e5\u627e\uff08\u5229\u7528\u4e00\u4e2a\u8f85\u52a9slice\uff09"),(0,a.kt)("li",{parentName:"ol"},"map \u7684\u5e76\u53d1\u5b89\u5168"),(0,a.kt)("li",{parentName:"ol"},"Map \u53ef\u4ee5\u7528\u6570\u7ec4\u4f5c\u4e3aKey\u5417\uff08\u6570\u7ec4\u53ef\u4ee5\uff0c\u5207\u7247\u4e0d\u53ef\u4ee5\uff09")),(0,a.kt)("h3",{id:"makenew"},"make\uff0cnew"),(0,a.kt)("ol",null,(0,a.kt)("li",{parentName:"ol"},"make \u548c new \u7684\u533a\u522b")),(0,a.kt)("blockquote",null,(0,a.kt)("ol",{parentName:"blockquote"},(0,a.kt)("li",{parentName:"ol"},"make \u8fd4\u56de\u7684\u662f\u7c7b\u578b\uff0cnew\u8fd4\u56de\u7684\u662f\u6307\u9488"),(0,a.kt)("li",{parentName:"ol"},"make \u53ea\u7528\u4e8e chan\uff0cmap\uff0cslice \u7684\u521d\u59cb\u5316"),(0,a.kt)("li",{parentName:"ol"},"new \u7528\u4e8e\u7ed9\u7c7b\u578b\u5206\u914d\u5185\u5b58\u7a7a\u95f4\uff0c\u5e76\u4e14\u7f6e\u96f6"))),(0,a.kt)("h4",{id:"arrayslice"},"Array\uff0cSlice"),(0,a.kt)("ol",null,(0,a.kt)("li",{parentName:"ol"},"Slice \u548c Array \u7684\u533a\u522b")),(0,a.kt)("blockquote",null,(0,a.kt)("ol",{parentName:"blockquote"},(0,a.kt)("li",{parentName:"ol"},"array \u662f\u5b9a\u957f\u7684\uff0cslice \u662f\u4e0d\u5b9a\u957f\uff0c\u53ef\u4ee5\u52a8\u6001\u6269\u5bb9"),(0,a.kt)("li",{parentName:"ol"},"slice \u5305\u542b\u5bf9 array \u7684\u5f15\u7528\uff0clen\uff0ccap"),(0,a.kt)("li",{parentName:"ol"},"array \u662f\u4f1a\u5728\u7f16\u8bd1\u65f6 panic\uff0c\u800c slice \u662f\u8fd0\u884c\u65f6\uff0c\u5177\u4f53\u9700\u8981\u770b\u573a\u666f\u4f7f\u7528"),(0,a.kt)("li",{parentName:"ol"},"array \u662f\u503c\u8d4b\u503c\u7684\uff0c\u5982\u679c\u91cf\u7ea7\u5f88\u5927\uff0c\u4f1a\u6d88\u8017\u4e00\u5b9a\u5185\u5b58"))),(0,a.kt)("h4",{id:"mutex"},"Mutex"),(0,a.kt)("ol",null,(0,a.kt)("li",{parentName:"ol"},"Mutex \u4e0e RWMutex \u600e\u4e48\u5b9e\u73b0")),(0,a.kt)("h4",{id:"channel"},"Channel"),(0,a.kt)("ol",null,(0,a.kt)("li",{parentName:"ol"},"\u5411\u4e3a nil \u7684 channel \u53d1\u9001\u6570\u636e\u4f1a\u600e\u4e48\u6837")),(0,a.kt)("p",null,"\u25aa \u7ed9\u2f00\u4e2a nil channel \u53d1\u9001\u6570\u636e\uff0c\u9020\u6210\u6c38\u8fdc\u963b\u585e\n\u25aa \u4ece\u2f00\u4e2a nil channel \u63a5\u6536\u6570\u636e\uff0c\u9020\u6210\u6c38\u8fdc\u963b\u585e\n\u25aa \u7ed9\u2f00\u4e2a\u5df2\u7ecf\u5173\u95ed\u7684 channel \u53d1\u9001\u6570\u636e\uff0c\u5f15\u8d77 panic\n\u25aa \u4ece\u2f00\u4e2a\u5df2\u7ecf\u5173\u95ed\u7684 channel \u63a5\u6536\u6570\u636e\uff0c\u5982\u679c\u7f13\u51b2\u533a\u4e2d\u4e3a\u7a7a\uff0c\u5219\u8fd4\u56de\u2f00\u4e2a\u96f6\u503c\n\u25aa \u2f46\u7f13\u51b2\u7684channel\u662f\u540c\u6b65\u7684\uff0c\u2f7d\u6709\u7f13\u51b2\u7684channel\u662f\u2fae\u540c\u6b65\u7684"),(0,a.kt)("p",null,"15\u5b57\u2f1d\u8bc0: \u7a7a(nil)\u8bfb\u5199\u963b\u585e\uff0c\u5199\u5173\u95ed\u5f02\u5e38\uff0c\u8bfb\u5173\u95ed\u7a7a\u96f6"),(0,a.kt)("ol",{start:2},(0,a.kt)("li",{parentName:"ol"},"channel \u662f\u5426\u7ebf\u7a0b\u5b89\u5168\uff1f")),(0,a.kt)("ol",{start:3},(0,a.kt)("li",{parentName:"ol"},"\u4ecb\u7ecd\u4e00\u4e0b channel\uff0c\u65e0\u7f13\u51b2\u548c\u6709\u7f13\u51b2\u533a\u522b")),(0,a.kt)("ol",{start:4},(0,a.kt)("li",{parentName:"ol"},"\u662f\u5426\u4e86\u89e3 channel \u5e95\u5c42\u5b9e\u73b0\uff0c\u6bd4\u5982\u5b9e\u73b0 channel \u7684\u6570\u636e\u7ed3\u6784\u662f\u4ec0\u4e48\uff1f")),(0,a.kt)("p",null,"\u4e24\u53cc\u5411\u5217\u8868\u7684\u961f\u5217\uff0c\u6709\u7f13\u51b2\u7684\u662f\u5faa\u73af\u6570\u7ec4"),(0,a.kt)("ol",{start:5},(0,a.kt)("li",{parentName:"ol"},"Channel \u5206\u914d\u5728\u6808\u4e0a\u8fd8\u662f\u5806\u4e0a\uff1f\u54ea\u4e9b\u5bf9\u8c61\u5206\u914d\u5728\u5806\u4e0a\uff0c\u54ea\u4e9b\u5bf9\u8c61\u5206\u914d\u5728\u6808\u4e0a\uff1f")),(0,a.kt)("p",null,"Go \u7a0b\u5e8f\u4f1a\u5728 2 \u4e2a\u5730\u65b9\u4e3a\u53d8\u91cf\u5206\u914d\u5185\u5b58\uff0c\u4e00\u4e2a\u662f\u5168\u5c40\u7684\u5806(heap)\u7a7a\u95f4\u7528\u6765\u52a8\u6001\u5206\u914d\u5185\u5b58\uff0c\u53e6\u4e00\u4e2a\u662f\u6bcf\u4e2a goroutine \u7684\u6808(stack)\u7a7a\u95f4\u3002\u4e0e Java\u3001Python \u7b49\u8bed\u8a00\u7c7b\u4f3c\uff0cGo \u8bed\u8a00\u5b9e\u73b0\u5783\u573e\u56de\u6536(Garbage Collector)\u673a\u5236\uff0c\u56e0\u6b64\u5462\uff0cGo \u8bed\u8a00\u7684\u5185\u5b58\u7ba1\u7406\u662f\u81ea\u52a8\u7684\uff0c\u901a\u5e38\u5f00\u53d1\u8005\u5e76\u4e0d\u9700\u8981\u5173\u5fc3\u5185\u5b58\u5206\u914d\u5728\u6808\u4e0a\uff0c\u8fd8\u662f\u5806\u4e0a\u3002\u4f46\u662f\u4ece\u6027\u80fd\u7684\u89d2\u5ea6\u51fa\u53d1\uff0c\u5728\u6808\u4e0a\u5206\u914d\u5185\u5b58\u548c\u5728\u5806\u4e0a\u5206\u914d\u5185\u5b58\uff0c\u6027\u80fd\u5dee\u5f02\u662f\u975e\u5e38\u5927\u7684\u3002"),(0,a.kt)("p",null,"\u5728\u51fd\u6570\u4e2d\u7533\u8bf7\u4e00\u4e2a\u5bf9\u8c61\uff0c\u5982\u679c\u5206\u914d\u5728\u6808\u4e2d\uff0c\u51fd\u6570\u6267\u884c\u7ed3\u675f\u65f6\u81ea\u52a8\u56de\u6536\uff0c\u5982\u679c\u5206\u914d\u5728\u5806\u4e2d\uff0c\u5219\u5728\u51fd\u6570\u7ed3\u675f\u540e\u67d0\u4e2a\u65f6\u95f4\u70b9\u8fdb\u884c\u5783\u573e\u56de\u6536\u3002"),(0,a.kt)("p",null,"\u5728\u6808\u4e0a\u5206\u914d\u548c\u56de\u6536\u5185\u5b58\u7684\u5f00\u9500\u5f88\u4f4e\uff0c\u53ea\u9700\u8981 2 \u4e2a CPU \u6307\u4ee4\uff1aPUSH \u548c POP\uff0c\u4e00\u4e2a\u662f\u5c06\u6570\u636e push \u5230\u6808\u7a7a\u95f4\u4ee5\u5b8c\u6210\u5206\u914d\uff0cpop \u5219\u662f\u91ca\u653e\u7a7a\u95f4\uff0c\u4e5f\u5c31\u662f\u8bf4\u5728\u6808\u4e0a\u5206\u914d\u5185\u5b58\uff0c\u6d88\u8017\u7684\u4ec5\u662f\u5c06\u6570\u636e\u62f7\u8d1d\u5230\u5185\u5b58\u7684\u65f6\u95f4\uff0c\u800c\u5185\u5b58\u7684 I/O \u901a\u5e38\u80fd\u591f\u8fbe\u5230 30GB/s\uff0c\u56e0\u6b64\u5728\u6808\u4e0a\u5206\u914d\u5185\u5b58\u6548\u7387\u662f\u975e\u5e38\u9ad8\u7684\u3002"),(0,a.kt)("p",null,"\u5806\u5185\u5b58\uff1a\u7531\u5185\u5b58\u5206\u914d\u5668\u548c\u5783\u573e\u6536\u96c6\u5668\u8d1f\u8d23\u56de\u6536"),(0,a.kt)("p",null,"\u6808\u5185\u5b58\uff1a\u7531\u7f16\u8bd1\u5668\u81ea\u52a8\u8fdb\u884c\u5206\u914d\u548c\u91ca\u653e"),(0,a.kt)("h4",{id:"\u5783\u573e\u56de\u6536"},"\u5783\u573e\u56de\u6536"),(0,a.kt)("ol",null,(0,a.kt)("li",{parentName:"ol"},"Gc\u89e6\u53d1\u65f6\u673a"),(0,a.kt)("li",{parentName:"ol"},"\u662f\u5426\u4e86\u89e3\u5176\u4ed6gc\u673a\u5236"),(0,a.kt)("li",{parentName:"ol"},"Go \u7684\u5783\u573e\u56de\u6536\u662f\u600e\u4e48\u5b9e\u73b0\u7684\uff0c\u597d\u5728\u54ea\u91cc\uff0c\u4e0d\u597d\u5728\u54ea\u91cc\u3002")),(0,a.kt)("h4",{id:"\u5185\u5b58\u9003\u9038"},"\u5185\u5b58\u9003\u9038"),(0,a.kt)("p",null,"\u4ec0\u4e48\u662f\u5185\u5b58\u9003\u9038\uff1f"),(0,a.kt)("p",null,'\u5728\u7a0b\u5e8f\u4e2d\uff0c\u6bcf\u4e2a\u51fd\u6570\u5757\u90fd\u4f1a\u6709\u81ea\u5df1\u7684\u5185\u5b58\u533a\u57df\u7528\u6765\u5b58\u81ea\u5df1\u7684\u5c40\u90e8\u53d8\u91cf\uff08\u5185\u5b58\u5360\u7528\u5c11\uff09\u3001\u8fd4\u56de\u5730\u5740\u3001\u8fd4\u56de\u503c\u4e4b\u7c7b\u7684\u6570\u636e\uff0c\u8fd9\u4e00\u5757\u5185\u5b58\u533a\u57df\u6709\u7279\u5b9a\u7684\u7ed3\u6784\u548c\u5bfb\u5740\u65b9\u5f0f\uff0c\u5bfb\u5740\u8d77\u6765\u5341\u5206\u8fc5\u901f\uff0c\u5f00\u9500\u5f88\u5c11\u3002\u8fd9\u4e00\u5757\u5185\u5b58\u5730\u5740\u79f0\u4e3a\u6808\u3002\u6808\u662f\u7ebf\u7a0b\u7ea7\u522b\u7684\uff0c\u5927\u5c0f\u5728\u521b\u5efa\u7684\u65f6\u5019\u5df2\u7ecf\u786e\u5b9a\uff0c\u5f53\u53d8\u91cf\u592a\u5927\u7684\u65f6\u5019\uff0c\u4f1a"\u9003\u9038"\u5230\u5806\u4e0a\uff0c\u8fd9\u79cd\u73b0\u8c61\u79f0\u4e3a\u5185\u5b58\u9003\u9038\u3002\u7b80\u5355\u6765\u8bf4\uff0c\u5c40\u90e8\u53d8\u91cf\u901a\u8fc7\u5806\u5206\u914d\u548c\u56de\u6536\uff0c\u5c31\u53eb\u5185\u5b58\u9003\u9038\u3002'),(0,a.kt)("p",null,"build \u7684\u65f6\u5019\uff0c\u589e\u52a0 -gcflags=-m \u53c2\u6570"),(0,a.kt)("ol",null,(0,a.kt)("li",{parentName:"ol"},"\u53d1\u751f\u5185\u5b58\u9003\u9038\u7684\u60c5\u51b5")),(0,a.kt)("p",null,"\u80fd\u5f15\u8d77\u53d8\u91cf\u9003\u9038\u5230\u5806\u4e0a\u7684",(0,a.kt)("strong",{parentName:"p"},"\u5178\u578b\u60c5\u51b5"),"\uff1a"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("strong",{parentName:"li"},"\u5728\u65b9\u6cd5\u5185\u628a\u5c40\u90e8\u53d8\u91cf\u6307\u9488\u8fd4\u56de")," \u5c40\u90e8\u53d8\u91cf\u539f\u672c\u5e94\u8be5\u5728\u6808\u4e2d\u5206\u914d\uff0c\u5728\u6808\u4e2d\u56de\u6536\u3002\u4f46\u662f\u7531\u4e8e\u8fd4\u56de\u65f6\u88ab\u5916\u90e8\u5f15\u7528\uff0c\u56e0\u6b64\u5176\u751f\u547d\u5468\u671f\u5927\u4e8e\u6808\uff0c\u5219\u6ea2\u51fa\u3002"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("strong",{parentName:"li"},"\u53d1\u9001\u6307\u9488\u6216\u5e26\u6709\u6307\u9488\u7684\u503c\u5230 channel \u4e2d\u3002")," \u5728\u7f16\u8bd1\u65f6\uff0c\u662f\u6ca1\u6709\u529e\u6cd5\u77e5\u9053\u54ea\u4e2a goroutine \u4f1a\u5728 channel \u4e0a\u63a5\u6536\u6570\u636e\u3002\u6240\u4ee5\u7f16\u8bd1\u5668\u6ca1\u6cd5\u77e5\u9053\u53d8\u91cf\u4ec0\u4e48\u65f6\u5019\u624d\u4f1a\u88ab\u91ca\u653e\u3002"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("strong",{parentName:"li"},"\u5728\u4e00\u4e2a\u5207\u7247\u4e0a\u5b58\u50a8\u6307\u9488\u6216\u5e26\u6307\u9488\u7684\u503c\u3002")," \u4e00\u4e2a\u5178\u578b\u7684\u4f8b\u5b50\u5c31\u662f []*string \u3002\u8fd9\u4f1a\u5bfc\u81f4\u5207\u7247\u7684\u5185\u5bb9\u9003\u9038\u3002\u5c3d\u7ba1\u5176\u540e\u9762\u7684\u6570\u7ec4\u53ef\u80fd\u662f\u5728\u6808\u4e0a\u5206\u914d\u7684\uff0c\u4f46\u5176\u5f15\u7528\u7684\u503c\u4e00\u5b9a\u662f\u5728\u5806\u4e0a\u3002"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("strong",{parentName:"li"},"slice \u7684\u80cc\u540e\u6570\u7ec4\u88ab\u91cd\u65b0\u5206\u914d\u4e86\uff0c\u56e0\u4e3a append \u65f6\u53ef\u80fd\u4f1a\u8d85\u51fa\u5176\u5bb9\u91cf( cap )\u3002")," slice \u521d\u59cb\u5316\u7684\u5730\u65b9\u5728\u7f16\u8bd1\u65f6\u662f\u53ef\u4ee5\u77e5\u9053\u7684\uff0c\u5b83\u6700\u5f00\u59cb\u4f1a\u5728\u6808\u4e0a\u5206\u914d\u3002\u5982\u679c\u5207\u7247\u80cc\u540e\u7684\u5b58\u50a8\u8981\u57fa\u4e8e\u8fd0\u884c\u65f6\u7684\u6570\u636e\u8fdb\u884c\u6269\u5145\uff0c\u5c31\u4f1a\u5728\u5806\u4e0a\u5206\u914d\u3002"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("strong",{parentName:"li"},"\u5728 interface \u7c7b\u578b\u4e0a\u8c03\u7528\u65b9\u6cd5\u3002")," \u5728 interface \u7c7b\u578b\u4e0a\u8c03\u7528\u65b9\u6cd5\u90fd\u662f\u52a8\u6001\u8c03\u5ea6\u7684 \u2014\u2014 \u65b9\u6cd5\u7684\u771f\u6b63\u5b9e\u73b0\u53ea\u80fd\u5728\u8fd0\u884c\u65f6\u77e5\u9053\u3002\u60f3\u50cf\u4e00\u4e2a io.Reader \u7c7b\u578b\u7684\u53d8\u91cf r , \u8c03\u7528 r.Read(b) \u4f1a\u4f7f\u5f97 r \u7684\u503c\u548c\u5207\u7247b \u7684\u80cc\u540e\u5b58\u50a8\u90fd\u9003\u9038\u6389\uff0c\u6240\u4ee5\u4f1a\u5728\u5806\u4e0a\u5206\u914d\u3002")),(0,a.kt)("ol",{start:2},(0,a.kt)("li",{parentName:"ol"},"\u4ec0\u4e48\u5185\u5bb9\u4f1a\u5206\u914d\u5728\u5806\u4e0a")),(0,a.kt)("ol",{start:3},(0,a.kt)("li",{parentName:"ol"},"\u600e\u4e48\u907f\u514d",(0,a.kt)("strong",{parentName:"li"},"\u5185\u5b58\u9003\u9038"),"\uff1f")),(0,a.kt)("p",null,"noescape"),(0,a.kt)("ol",null,(0,a.kt)("li",{parentName:"ol"},"init \u51fd\u6570\u662f\u4ec0\u4e48\u65f6\u5019\u6267\u884c\u7684")),(0,a.kt)("h4",{id:"\u53c2\u8003\u94fe\u63a5"},"\u53c2\u8003\u94fe\u63a5"),(0,a.kt)("p",null,"golang \u9762\u8bd5\u603b\u7ed3"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"https://developer.aliyun.com/article/865593"},"https://developer.aliyun.com/article/865593")),(0,a.kt)("p",null,"GitHub\uff1a"),(0,a.kt)("p",null,"Golang \u9762\u8bd5\u9898\u641c\u96c6"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"https://github.com/lifei6671/interview-go"},"https://github.com/lifei6671/interview-go")),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"https://github.com/xiaobaiTech/golangFamily"},"https://github.com/xiaobaiTech/golangFamily")),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"https://github.com/iswbm/golang-interview"},"https://github.com/iswbm/golang-interview")),(0,a.kt)("p",null,"GolangStudy: Golang \u9762\u8bd5\u5b66\u4e60"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"https://github.com/cnymw/GolangStudy"},"https://github.com/cnymw/GolangStudy")))}m.isMDXComponent=!0}}]);