/*! For license information please see 4550.39669177.js.LICENSE.txt */
"use strict";(self.webpackChunkdubuqingfeng=self.webpackChunkdubuqingfeng||[]).push([[4550],{67557:(e,t)=>{function n(e){if(!Number.isSafeInteger(e)||e<0)throw new Error(`Wrong positive integer: ${e}`)}function o(e){if("boolean"!=typeof e)throw new Error(`Expected boolean, not ${e}`)}function r(e,...t){if(!((n=e)instanceof Uint8Array||null!=n&&"object"==typeof n&&"Uint8Array"===n.constructor.name))throw new Error("Expected Uint8Array");var n;if(t.length>0&&!t.includes(e.length))throw new Error(`Expected Uint8Array of length ${t}, not of length=${e.length}`)}function s(e){if("function"!=typeof e||"function"!=typeof e.create)throw new Error("Hash should be wrapped by utils.wrapConstructor");n(e.outputLen),n(e.blockLen)}function i(e,t=!0){if(e.destroyed)throw new Error("Hash instance has been destroyed");if(t&&e.finished)throw new Error("Hash#digest() has already been called")}function a(e,t){r(e);const n=t.outputLen;if(e.length<n)throw new Error(`digestInto() expects output buffer of length at least ${n}`)}Object.defineProperty(t,"__esModule",{value:!0}),t.output=t.exists=t.hash=t.bytes=t.bool=t.number=void 0,t.number=n,t.bool=o,t.bytes=r,t.hash=s,t.exists=i,t.output=a;const c={number:n,bool:o,bytes:r,hash:s,exists:i,output:a};t.default=c},90915:(e,t,n)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.SHA2=void 0;const o=n(67557),r=n(99175);class s extends r.Hash{constructor(e,t,n,o){super(),this.blockLen=e,this.outputLen=t,this.padOffset=n,this.isLE=o,this.finished=!1,this.length=0,this.pos=0,this.destroyed=!1,this.buffer=new Uint8Array(e),this.view=(0,r.createView)(this.buffer)}update(e){(0,o.exists)(this);const{view:t,buffer:n,blockLen:s}=this,i=(e=(0,r.toBytes)(e)).length;for(let o=0;o<i;){const a=Math.min(s-this.pos,i-o);if(a!==s)n.set(e.subarray(o,o+a),this.pos),this.pos+=a,o+=a,this.pos===s&&(this.process(t,0),this.pos=0);else{const t=(0,r.createView)(e);for(;s<=i-o;o+=s)this.process(t,o)}}return this.length+=e.length,this.roundClean(),this}digestInto(e){(0,o.exists)(this),(0,o.output)(e,this),this.finished=!0;const{buffer:t,view:n,blockLen:s,isLE:i}=this;let{pos:a}=this;t[a++]=128,this.buffer.subarray(a).fill(0),this.padOffset>s-a&&(this.process(n,0),a=0);for(let o=a;o<s;o++)t[o]=0;!function(e,t,n,o){if("function"==typeof e.setBigUint64)return e.setBigUint64(t,n,o);const r=BigInt(32),s=BigInt(4294967295),i=Number(n>>r&s),a=Number(n&s),c=o?4:0,l=o?0:4;e.setUint32(t+c,i,o),e.setUint32(t+l,a,o)}(n,s-8,BigInt(8*this.length),i),this.process(n,0);const c=(0,r.createView)(e),l=this.outputLen;if(l%4)throw new Error("_sha2: outputLen should be aligned to 32bit");const u=l/4,d=this.get();if(u>d.length)throw new Error("_sha2: outputLen bigger than state");for(let o=0;o<u;o++)c.setUint32(4*o,d[o],i)}digest(){const{buffer:e,outputLen:t}=this;this.digestInto(e);const n=e.slice(0,t);return this.destroy(),n}_cloneInto(e){e||(e=new this.constructor),e.set(...this.get());const{blockLen:t,buffer:n,length:o,finished:r,destroyed:s,pos:i}=this;return e.length=o,e.pos=i,e.finished=r,e.destroyed=s,o%t&&e.buffer.set(n),e}}t.SHA2=s},25145:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.crypto=void 0,t.crypto="object"==typeof globalThis&&"crypto"in globalThis?globalThis.crypto:void 0},22623:(e,t,n)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.sha224=t.sha256=void 0;const o=n(90915),r=n(99175),s=(e,t,n)=>e&t^e&n^t&n,i=new Uint32Array([1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298]),a=new Uint32Array([1779033703,3144134277,1013904242,2773480762,1359893119,2600822924,528734635,1541459225]),c=new Uint32Array(64);class l extends o.SHA2{constructor(){super(64,32,8,!1),this.A=0|a[0],this.B=0|a[1],this.C=0|a[2],this.D=0|a[3],this.E=0|a[4],this.F=0|a[5],this.G=0|a[6],this.H=0|a[7]}get(){const{A:e,B:t,C:n,D:o,E:r,F:s,G:i,H:a}=this;return[e,t,n,o,r,s,i,a]}set(e,t,n,o,r,s,i,a){this.A=0|e,this.B=0|t,this.C=0|n,this.D=0|o,this.E=0|r,this.F=0|s,this.G=0|i,this.H=0|a}process(e,t){for(let r=0;r<16;r++,t+=4)c[r]=e.getUint32(t,!1);for(let s=16;s<64;s++){const e=c[s-15],t=c[s-2],n=(0,r.rotr)(e,7)^(0,r.rotr)(e,18)^e>>>3,o=(0,r.rotr)(t,17)^(0,r.rotr)(t,19)^t>>>10;c[s]=o+c[s-7]+n+c[s-16]|0}let{A:n,B:o,C:a,D:l,E:u,F:d,G:h,H:f}=this;for(let b=0;b<64;b++){const e=f+((0,r.rotr)(u,6)^(0,r.rotr)(u,11)^(0,r.rotr)(u,25))+((p=u)&d^~p&h)+i[b]+c[b]|0,t=((0,r.rotr)(n,2)^(0,r.rotr)(n,13)^(0,r.rotr)(n,22))+s(n,o,a)|0;f=h,h=d,d=u,u=l+e|0,l=a,a=o,o=n,n=e+t|0}var p;n=n+this.A|0,o=o+this.B|0,a=a+this.C|0,l=l+this.D|0,u=u+this.E|0,d=d+this.F|0,h=h+this.G|0,f=f+this.H|0,this.set(n,o,a,l,u,d,h,f)}roundClean(){c.fill(0)}destroy(){this.set(0,0,0,0,0,0,0,0),this.buffer.fill(0)}}class u extends l{constructor(){super(),this.A=-1056596264,this.B=914150663,this.C=812702999,this.D=-150054599,this.E=-4191439,this.F=1750603025,this.G=1694076839,this.H=-1090891868,this.outputLen=28}}t.sha256=(0,r.wrapConstructor)((()=>new l)),t.sha224=(0,r.wrapConstructor)((()=>new u))},99175:(e,t,n)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.randomBytes=t.wrapXOFConstructorWithOpts=t.wrapConstructorWithOpts=t.wrapConstructor=t.checkOpts=t.Hash=t.concatBytes=t.toBytes=t.utf8ToBytes=t.asyncLoop=t.nextTick=t.hexToBytes=t.bytesToHex=t.isLE=t.rotr=t.createView=t.u32=t.u8=void 0;const o=n(25145);t.u8=e=>new Uint8Array(e.buffer,e.byteOffset,e.byteLength);function r(e){return e instanceof Uint8Array||null!=e&&"object"==typeof e&&"Uint8Array"===e.constructor.name}t.u32=e=>new Uint32Array(e.buffer,e.byteOffset,Math.floor(e.byteLength/4));t.createView=e=>new DataView(e.buffer,e.byteOffset,e.byteLength);if(t.rotr=(e,t)=>e<<32-t|e>>>t,t.isLE=68===new Uint8Array(new Uint32Array([287454020]).buffer)[0],!t.isLE)throw new Error("Non little-endian hardware is not supported");const s=Array.from({length:256},((e,t)=>t.toString(16).padStart(2,"0")));t.bytesToHex=function(e){if(!r(e))throw new Error("Uint8Array expected");let t="";for(let n=0;n<e.length;n++)t+=s[e[n]];return t};const i={_0:48,_9:57,_A:65,_F:70,_a:97,_f:102};function a(e){return e>=i._0&&e<=i._9?e-i._0:e>=i._A&&e<=i._F?e-(i._A-10):e>=i._a&&e<=i._f?e-(i._a-10):void 0}t.hexToBytes=function(e){if("string"!=typeof e)throw new Error("hex string expected, got "+typeof e);const t=e.length,n=t/2;if(t%2)throw new Error("padded hex string expected, got unpadded hex of length "+t);const o=new Uint8Array(n);for(let r=0,s=0;r<n;r++,s+=2){const t=a(e.charCodeAt(s)),n=a(e.charCodeAt(s+1));if(void 0===t||void 0===n){const t=e[s]+e[s+1];throw new Error('hex string expected, got non-hex character "'+t+'" at index '+s)}o[r]=16*t+n}return o};function c(e){if("string"!=typeof e)throw new Error("utf8ToBytes expected string, got "+typeof e);return new Uint8Array((new TextEncoder).encode(e))}function l(e){if("string"==typeof e&&(e=c(e)),!r(e))throw new Error("expected Uint8Array, got "+typeof e);return e}t.nextTick=async()=>{},t.asyncLoop=async function(e,n,o){let r=Date.now();for(let s=0;s<e;s++){o(s);const e=Date.now()-r;e>=0&&e<n||(await(0,t.nextTick)(),r+=e)}},t.utf8ToBytes=c,t.toBytes=l,t.concatBytes=function(...e){let t=0;for(let o=0;o<e.length;o++){const n=e[o];if(!r(n))throw new Error("Uint8Array expected");t+=n.length}const n=new Uint8Array(t);for(let o=0,r=0;o<e.length;o++){const t=e[o];n.set(t,r),r+=t.length}return n};t.Hash=class{clone(){return this._cloneInto()}};const u={}.toString;t.checkOpts=function(e,t){if(void 0!==t&&"[object Object]"!==u.call(t))throw new Error("Options should be object or undefined");return Object.assign(e,t)},t.wrapConstructor=function(e){const t=t=>e().update(l(t)).digest(),n=e();return t.outputLen=n.outputLen,t.blockLen=n.blockLen,t.create=()=>e(),t},t.wrapConstructorWithOpts=function(e){const t=(t,n)=>e(n).update(l(t)).digest(),n=e({});return t.outputLen=n.outputLen,t.blockLen=n.blockLen,t.create=t=>e(t),t},t.wrapXOFConstructorWithOpts=function(e){const t=(t,n)=>e(n).update(l(t)).digest(),n=e({});return t.outputLen=n.outputLen,t.blockLen=n.blockLen,t.create=t=>e(t),t},t.randomBytes=function(e=32){if(o.crypto&&"function"==typeof o.crypto.getRandomValues)return o.crypto.getRandomValues(new Uint8Array(e));throw new Error("crypto.getRandomValues must be defined")}},98232:(e,t,n)=>{n.d(t,{A:()=>c});n(96540);var o=n(18215),r=n(23230),s=n(55772);const i={collapseSidebarButton:"collapseSidebarButton_PEFL",collapseSidebarButtonIcon:"collapseSidebarButtonIcon_kv0_"};var a=n(74848);function c(e){let{onClick:t}=e;return(0,a.jsx)("button",{type:"button",title:(0,r.translate)({id:"theme.docs.sidebar.collapseButtonTitle",message:"Collapse sidebar",description:"The title attribute for collapse button of doc sidebar"}),"aria-label":(0,r.translate)({id:"theme.docs.sidebar.collapseButtonAriaLabel",message:"Collapse sidebar",description:"The title attribute for collapse button of doc sidebar"}),className:(0,o.A)("button button--secondary button--outline",i.collapseSidebarButton),onClick:t,children:(0,a.jsx)(s.A,{className:i.collapseSidebarButtonIcon})})}},75216:(e,t,n)=>{n.d(t,{A:()=>h});var o=n(96540),r=n(18215),s=n(18630),i=n(40002),a=n(24245),c=n(23230),l=n(32567);const u={menu:"menu_SIkG",menuWithAnnouncementBar:"menuWithAnnouncementBar_GW3s"};var d=n(74848);function h(e){let{path:t,sidebar:n,className:h}=e;const f=function(){const{isActive:e}=(0,i.Mj)(),[t,n]=(0,o.useState)(e);return(0,a.Mq)((t=>{let{scrollY:o}=t;e&&n(0===o)}),[e]),e&&t}();return(0,d.jsx)("nav",{"aria-label":(0,c.translate)({id:"theme.docs.sidebar.navAriaLabel",message:"Docs sidebar",description:"The ARIA label for the sidebar navigation"}),className:(0,r.A)("menu thin-scrollbar",u.menu,f&&u.menuWithAnnouncementBar,h),children:(0,d.jsx)("ul",{className:(0,r.A)(s.G.docs.docSidebarMenu,"menu__list"),children:(0,d.jsx)(l.A,{items:n,activePath:t,level:1})})})}},19044:(e,t,n)=>{n.d(t,{A:()=>h});var o=n(96540),r=n(18215),s=n(18630),i=n(70763),a=n(61938),c=n(32567),l=n(74848);const u=e=>{let{sidebar:t,path:n}=e;const o=(0,a.M)();return(0,l.jsx)("ul",{className:(0,r.A)(s.G.docs.docSidebarMenu,"menu__list"),children:(0,l.jsx)(c.A,{items:t,activePath:n,onItemClick:e=>{"category"===e.type&&e.href&&o.toggle(),"link"===e.type&&o.toggle()},level:1})})};function d(e){return(0,l.jsx)(i.GX,{component:u,props:e})}const h=o.memo(d)},32567:(e,t,n)=>{n.d(t,{A:()=>k});var o=n(96540),r=n(5215),s=n(71480),i=n(18215),a=n(4799),c=n(86957),l=n(94549),u=n(18630),d=n(80260),h=n(14783),f=n(23230),p=n(11062),b=n(74848);function m(e){let{collapsed:t,categoryLabel:n,onClick:o}=e;return(0,b.jsx)("button",{"aria-label":t?(0,f.translate)({id:"theme.DocSidebarItem.expandCategoryAriaLabel",message:"Expand sidebar category '{label}'",description:"The ARIA label to expand the sidebar category"},{label:n}):(0,f.translate)({id:"theme.DocSidebarItem.collapseCategoryAriaLabel",message:"Collapse sidebar category '{label}'",description:"The ARIA label to collapse the sidebar category"},{label:n}),type:"button",className:"clean-btn menu__caret",onClick:o})}function y(e){let{item:t,onItemClick:n,activePath:f,level:y,index:g,...w}=e;const{items:x,label:A,collapsible:_,className:v,href:C}=t,{docs:{sidebar:{autoCollapseCategories:L}}}=(0,c.p)(),E=function(e){const t=(0,p.default)();return(0,o.useMemo)((()=>e.href&&!e.linkUnlisted?e.href:!t&&e.collapsible?(0,r.Nr)(e):void 0),[e,t])}(t),j=(0,r.w8)(t,f),B=(0,d.ys)(C,f),{collapsed:I,setCollapsed:S}=(0,l.u)({initialState:()=>!!_&&(!j&&t.collapsed)}),{expandedItem:U,setExpandedItem:H}=(0,s.G)(),N=function(e){void 0===e&&(e=!I),H(e?null:g),S(e)};return function(e){let{isActive:t,collapsed:n,updateCollapsed:r}=e;const s=(0,a.ZC)(t);(0,o.useEffect)((()=>{t&&!s&&n&&r(!1)}),[t,s,n,r])}({isActive:j,collapsed:I,updateCollapsed:N}),(0,o.useEffect)((()=>{_&&null!=U&&U!==g&&L&&S(!0)}),[_,U,g,S,L]),(0,b.jsxs)("li",{className:(0,i.A)(u.G.docs.docSidebarItemCategory,u.G.docs.docSidebarItemCategoryLevel(y),"menu__list-item",{"menu__list-item--collapsed":I},v),children:[(0,b.jsxs)("div",{className:(0,i.A)("menu__list-item-collapsible",{"menu__list-item-collapsible--active":B}),children:[(0,b.jsx)(h.default,{className:(0,i.A)("menu__link",{"menu__link--sublist":_,"menu__link--sublist-caret":!C&&_,"menu__link--active":j}),onClick:_?e=>{n?.(t),C?N(!1):(e.preventDefault(),N())}:()=>{n?.(t)},"aria-current":B?"page":void 0,"aria-expanded":_?!I:void 0,href:_?E??"#":E,...w,children:A}),C&&_&&(0,b.jsx)(m,{collapsed:I,categoryLabel:A,onClick:e=>{e.preventDefault(),N()}})]}),(0,b.jsx)(l.N,{lazy:!0,as:"ul",className:"menu__list",collapsed:I,children:(0,b.jsx)(k,{items:x,tabIndex:I?-1:0,onItemClick:n,activePath:f,level:y+1})})]})}var g=n(40877),w=n(90716);const x={menuExternalLink:"menuExternalLink_NmtK"};function A(e){let{item:t,onItemClick:n,activePath:o,level:s,index:a,...c}=e;const{href:l,label:d,className:f,autoAddBaseUrl:p}=t,m=(0,r.w8)(t,o),y=(0,g.A)(l);return(0,b.jsx)("li",{className:(0,i.A)(u.G.docs.docSidebarItemLink,u.G.docs.docSidebarItemLinkLevel(s),"menu__list-item",f),children:(0,b.jsxs)(h.default,{className:(0,i.A)("menu__link",!y&&x.menuExternalLink,{"menu__link--active":m}),autoAddBaseUrl:p,"aria-current":m?"page":void 0,to:l,...y&&{onClick:n?()=>n(t):void 0},...c,children:[d,!y&&(0,b.jsx)(w.A,{})]})},d)}const _={menuHtmlItem:"menuHtmlItem_M9Kj"};function v(e){let{item:t,level:n,index:o}=e;const{value:r,defaultStyle:s,className:a}=t;return(0,b.jsx)("li",{className:(0,i.A)(u.G.docs.docSidebarItemLink,u.G.docs.docSidebarItemLinkLevel(n),s&&[_.menuHtmlItem,"menu__list-item"],a),dangerouslySetInnerHTML:{__html:r}},o)}function C(e){let{item:t,...n}=e;switch(t.type){case"category":return(0,b.jsx)(y,{item:t,...n});case"html":return(0,b.jsx)(v,{item:t,...n});default:return(0,b.jsx)(A,{item:t,...n})}}function L(e){let{items:t,...n}=e;const o=(0,r.Y)(t,n.activePath);return(0,b.jsx)(s.A,{children:o.map(((e,t)=>(0,b.jsx)(C,{item:e,index:t,...n},t)))})}const k=(0,o.memo)(L)},55772:(e,t,n)=>{n.d(t,{A:()=>r});n(96540);var o=n(74848);function r(e){return(0,o.jsx)("svg",{width:"20",height:"20","aria-hidden":"true",...e,children:(0,o.jsxs)("g",{fill:"#7a7a7a",children:[(0,o.jsx)("path",{d:"M9.992 10.023c0 .2-.062.399-.172.547l-4.996 7.492a.982.982 0 01-.828.454H1c-.55 0-1-.453-1-1 0-.2.059-.403.168-.551l4.629-6.942L.168 3.078A.939.939 0 010 2.528c0-.548.45-.997 1-.997h2.996c.352 0 .649.18.828.45L9.82 9.472c.11.148.172.347.172.55zm0 0"}),(0,o.jsx)("path",{d:"M19.98 10.023c0 .2-.058.399-.168.547l-4.996 7.492a.987.987 0 01-.828.454h-3c-.547 0-.996-.453-.996-1 0-.2.059-.403.168-.551l4.625-6.942-4.625-6.945a.939.939 0 01-.168-.55 1 1 0 01.996-.997h3c.348 0 .649.18.828.45l4.996 7.492c.11.148.168.347.168.55zm0 0"})]})})}},71480:(e,t,n)=>{n.d(t,{A:()=>c,G:()=>l});var o=n(96540),r=n(4799),s=n(74848);const i=Symbol("EmptyContext"),a=o.createContext(i);function c(e){let{children:t}=e;const[n,r]=(0,o.useState)(null),i=(0,o.useMemo)((()=>({expandedItem:n,setExpandedItem:r})),[n]);return(0,s.jsx)(a.Provider,{value:i,children:t})}function l(){const e=(0,o.useContext)(a);if(e===i)throw new r.dV("DocSidebarItemsExpandedStateProvider");return e}},20053:(e,t,n)=>{function o(e){var t,n,r="";if("string"==typeof e||"number"==typeof e)r+=e;else if("object"==typeof e)if(Array.isArray(e))for(t=0;t<e.length;t++)e[t]&&(n=o(e[t]))&&(r&&(r+=" "),r+=n);else for(t in e)e[t]&&(r&&(r+=" "),r+=t);return r}function r(){for(var e,t,n=0,r="";n<arguments.length;)(e=arguments[n++])&&(t=o(e))&&(r&&(r+=" "),r+=t);return r}n.r(t),n.d(t,{clsx:()=>r,default:()=>s});const s=r},73142:(e,t,n)=>{n.d(t,{A:()=>o});const o={docMainContainer:"docMainContainer_TBSr",docMainContainerEnhanced:"docMainContainerEnhanced_lQrH",docItemWrapperEnhanced:"docItemWrapperEnhanced_JWYK"}},71195:(e,t,n)=>{n.d(t,{A:()=>o});const o={docSidebarContainer:"docSidebarContainer_YfHR",docSidebarContainerHidden:"docSidebarContainerHidden_DPk8",sidebarViewport:"sidebarViewport_aRkj"}},53654:(e,t,n)=>{n.d(t,{A:()=>o});const o={docRoot:"docRoot_UBD9",docsWrapper:"docsWrapper_hBAB"}}}]);