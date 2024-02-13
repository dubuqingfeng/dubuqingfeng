"use strict";(self.webpackChunkmy_website=self.webpackChunkmy_website||[]).push([[5519],{3905:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>f});var r=n(67294);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var c=r.createContext({}),p=function(e){var t=r.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},s=function(e){var t=p(e.components);return r.createElement(c.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},m=r.forwardRef((function(e,t){var n=e.components,o=e.mdxType,a=e.originalType,c=e.parentName,s=l(e,["components","mdxType","originalType","parentName"]),m=p(n),f=o,g=m["".concat(c,".").concat(f)]||m[f]||u[f]||a;return n?r.createElement(g,i(i({ref:t},s),{},{components:n})):r.createElement(g,i({ref:t},s))}));function f(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=n.length,i=new Array(a);i[0]=m;var l={};for(var c in t)hasOwnProperty.call(t,c)&&(l[c]=t[c]);l.originalType=e,l.mdxType="string"==typeof e?e:o,i[1]=l;for(var p=2;p<a;p++)i[p]=n[p];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}m.displayName="MDXCreateElement"},67289:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>c,contentTitle:()=>i,default:()=>u,frontMatter:()=>a,metadata:()=>l,toc:()=>p});var r=n(87462),o=(n(67294),n(3905));const a={},i=void 0,l={unversionedId:"Wiki/programming/golang/source/map",id:"Wiki/programming/golang/source/map",title:"map",description:"map \u6e90\u7801\u5206\u6790",source:"@site/docs/Wiki/programming/golang/source/map.md",sourceDirName:"Wiki/programming/golang/source",slug:"/Wiki/programming/golang/source/map",permalink:"/docs/Wiki/programming/golang/source/map",draft:!1,tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"memory",permalink:"/docs/Wiki/programming/golang/memory/"},next:{title:"web",permalink:"/docs/Wiki/programming/golang/web/"}},c={},p=[{value:"map \u6e90\u7801\u5206\u6790",id:"map-\u6e90\u7801\u5206\u6790",level:3}],s={toc:p};function u(e){let{components:t,...n}=e;return(0,o.kt)("wrapper",(0,r.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("h3",{id:"map-\u6e90\u7801\u5206\u6790"},"map \u6e90\u7801\u5206\u6790"),(0,o.kt)("p",null,"\u5730\u5740\uff1a"),(0,o.kt)("p",null,(0,o.kt)("a",{parentName:"p",href:"https://github.com/golang/go/blob/master/src/runtime/map.go"},"https://github.com/golang/go/blob/master/src/runtime/map.go")),(0,o.kt)("p",null,"\u5206\u4e3a\u4e24\u90e8\u5206\uff0cheader \u548c bucket\uff1a"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre"},"// A header for a Go map.\ntype hmap struct {\n    // Note: the format of the hmap is also encoded in cmd/compile/internal/reflectdata/reflect.go.\n    // Make sure this stays in sync with the compiler's definition.\n    count     int // # live cells == size of map.  Must be first (used by len() builtin)\n    flags     uint8\n    B         uint8  // log_2 of # of buckets (can hold up to loadFactor * 2^B items)\n    noverflow uint16 // approximate number of overflow buckets; see incrnoverflow for details\n    hash0     uint32 // hash seed\n\n    buckets    unsafe.Pointer // array of 2^B Buckets. may be nil if count==0.\n    oldbuckets unsafe.Pointer // previous bucket array of half the size, non-nil only when growing\n    nevacuate  uintptr        // progress counter for evacuation (buckets less than this have been evacuated)\n\n    extra *mapextra // optional fields\n}\n")),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre"},"// A bucket for a Go map.\ntype bmap struct {\n    // tophash generally contains the top byte of the hash value\n    // for each key in this bucket. If tophash[0] < minTopHash,\n    // tophash[0] is a bucket evacuation state instead.\n    tophash [bucketCnt]uint8\n    // Followed by bucketCnt keys and then bucketCnt elems.\n    // NOTE: packing all the keys together and then all the elems together makes the\n    // code a bit more complicated than alternating key/elem/key/elem/... but it allows\n    // us to eliminate padding which would be needed for, e.g., map[int64]int8.\n    // Followed by an overflow pointer.\n}\n")))}u.isMDXComponent=!0}}]);