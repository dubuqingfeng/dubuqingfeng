"use strict";(self.webpackChunkdubuqingfeng=self.webpackChunkdubuqingfeng||[]).push([[6679],{75192:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>c,contentTitle:()=>i,default:()=>p,frontMatter:()=>a,metadata:()=>s,toc:()=>l});var r=n(74848),o=n(28453);const a={},i=void 0,s={id:"Wiki/programming/golang/source/map",title:"map",description:"map \u6e90\u7801\u5206\u6790",source:"@site/docs/Wiki/programming/golang/source/map.md",sourceDirName:"Wiki/programming/golang/source",slug:"/Wiki/programming/golang/source/map",permalink:"/docs/Wiki/programming/golang/source/map",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"memory",permalink:"/docs/Wiki/programming/golang/memory/"},next:{title:"web",permalink:"/docs/Wiki/programming/golang/web/"}},c={},l=[{value:"map \u6e90\u7801\u5206\u6790",id:"map-\u6e90\u7801\u5206\u6790",level:3}];function u(e){const t={a:"a",code:"code",h3:"h3",p:"p",pre:"pre",...(0,o.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(t.h3,{id:"map-\u6e90\u7801\u5206\u6790",children:"map \u6e90\u7801\u5206\u6790"}),"\n",(0,r.jsx)(t.p,{children:"\u5730\u5740\uff1a"}),"\n",(0,r.jsx)(t.p,{children:(0,r.jsx)(t.a,{href:"https://github.com/golang/go/blob/master/src/runtime/map.go",children:"https://github.com/golang/go/blob/master/src/runtime/map.go"})}),"\n",(0,r.jsx)(t.p,{children:"\u5206\u4e3a\u4e24\u90e8\u5206\uff0cheader \u548c bucket\uff1a"}),"\n",(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{children:"// A header for a Go map.\r\ntype hmap struct {\r\n\t// Note: the format of the hmap is also encoded in cmd/compile/internal/reflectdata/reflect.go.\r\n\t// Make sure this stays in sync with the compiler's definition.\r\n\tcount     int // # live cells == size of map.  Must be first (used by len() builtin)\r\n\tflags     uint8\r\n\tB         uint8  // log_2 of # of buckets (can hold up to loadFactor * 2^B items)\r\n\tnoverflow uint16 // approximate number of overflow buckets; see incrnoverflow for details\r\n\thash0     uint32 // hash seed\r\n\r\n\tbuckets    unsafe.Pointer // array of 2^B Buckets. may be nil if count==0.\r\n\toldbuckets unsafe.Pointer // previous bucket array of half the size, non-nil only when growing\r\n\tnevacuate  uintptr        // progress counter for evacuation (buckets less than this have been evacuated)\r\n\r\n\textra *mapextra // optional fields\r\n}\n"})}),"\n",(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{children:"// A bucket for a Go map.\r\ntype bmap struct {\r\n\t// tophash generally contains the top byte of the hash value\r\n\t// for each key in this bucket. If tophash[0] < minTopHash,\r\n\t// tophash[0] is a bucket evacuation state instead.\r\n\ttophash [bucketCnt]uint8\r\n\t// Followed by bucketCnt keys and then bucketCnt elems.\r\n\t// NOTE: packing all the keys together and then all the elems together makes the\r\n\t// code a bit more complicated than alternating key/elem/key/elem/... but it allows\r\n\t// us to eliminate padding which would be needed for, e.g., map[int64]int8.\r\n\t// Followed by an overflow pointer.\r\n}\n"})})]})}function p(e={}){const{wrapper:t}={...(0,o.R)(),...e.components};return t?(0,r.jsx)(t,{...e,children:(0,r.jsx)(u,{...e})}):u(e)}},28453:(e,t,n)=>{n.d(t,{R:()=>i,x:()=>s});var r=n(96540);const o={},a=r.createContext(o);function i(e){const t=r.useContext(a);return r.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function s(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(o):e.components||o:i(e.components),r.createElement(a.Provider,{value:t},e.children)}}}]);