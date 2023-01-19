"use strict";(self.webpackChunkmy_website=self.webpackChunkmy_website||[]).push([[1054],{3905:(e,n,r)=>{r.d(n,{Zo:()=>l,kt:()=>m});var t=r(67294);function a(e,n,r){return n in e?Object.defineProperty(e,n,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[n]=r,e}function o(e,n){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);n&&(t=t.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),r.push.apply(r,t)}return r}function i(e){for(var n=1;n<arguments.length;n++){var r=null!=arguments[n]?arguments[n]:{};n%2?o(Object(r),!0).forEach((function(n){a(e,n,r[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(r,n))}))}return e}function c(e,n){if(null==e)return{};var r,t,a=function(e,n){if(null==e)return{};var r,t,a={},o=Object.keys(e);for(t=0;t<o.length;t++)r=o[t],n.indexOf(r)>=0||(a[r]=e[r]);return a}(e,n);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(t=0;t<o.length;t++)r=o[t],n.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var p=t.createContext({}),s=function(e){var n=t.useContext(p),r=n;return e&&(r="function"==typeof e?e(n):i(i({},n),e)),r},l=function(e){var n=s(e.components);return t.createElement(p.Provider,{value:n},e.children)},u={inlineCode:"code",wrapper:function(e){var n=e.children;return t.createElement(t.Fragment,{},n)}},g=t.forwardRef((function(e,n){var r=e.components,a=e.mdxType,o=e.originalType,p=e.parentName,l=c(e,["components","mdxType","originalType","parentName"]),g=s(r),m=a,d=g["".concat(p,".").concat(m)]||g[m]||u[m]||o;return r?t.createElement(d,i(i({ref:n},l),{},{components:r})):t.createElement(d,i({ref:n},l))}));function m(e,n){var r=arguments,a=n&&n.mdxType;if("string"==typeof e||a){var o=r.length,i=new Array(o);i[0]=g;var c={};for(var p in n)hasOwnProperty.call(n,p)&&(c[p]=n[p]);c.originalType=e,c.mdxType="string"==typeof e?e:a,i[1]=c;for(var s=2;s<o;s++)i[s]=r[s];return t.createElement.apply(null,i)}return t.createElement.apply(null,r)}g.displayName="MDXCreateElement"},44019:(e,n,r)=>{r.r(n),r.d(n,{assets:()=>p,contentTitle:()=>i,default:()=>u,frontMatter:()=>o,metadata:()=>c,toc:()=>s});var t=r(87462),a=(r(67294),r(3905));const o={},i=void 0,c={unversionedId:"devices/nas/docker/nginx-proxy-manager/nginx-proxy-manager",id:"devices/nas/docker/nginx-proxy-manager/nginx-proxy-manager",title:"nginx-proxy-manager",description:"nginx-proxy-manager",source:"@site/docs/devices/nas/docker/nginx-proxy-manager/nginx-proxy-manager.md",sourceDirName:"devices/nas/docker/nginx-proxy-manager",slug:"/devices/nas/docker/nginx-proxy-manager/",permalink:"/docs/devices/nas/docker/nginx-proxy-manager/",draft:!1,editUrl:"https://github.com/dubuqingfeng/dubuqingfeng/tree/master/wiki/docs/devices/nas/docker/nginx-proxy-manager/nginx-proxy-manager.md",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"crawlab",permalink:"/docs/devices/nas/docker/crawlab/"},next:{title:"siyuan",permalink:"/docs/devices/nas/docker/siyuan/"}},p={},s=[{value:"nginx-proxy-manager",id:"nginx-proxy-manager",level:2}],l={toc:s};function u(e){let{components:n,...r}=e;return(0,a.kt)("wrapper",(0,t.Z)({},l,r,{components:n,mdxType:"MDXLayout"}),(0,a.kt)("h2",{id:"nginx-proxy-manager"},"nginx-proxy-manager"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-yaml"},"version: '3'\nservices:\n  app:\n    image: 'jc21/nginx-proxy-manager:latest'\n    restart: unless-stopped\n    ports:\n      - '80:80'\n      - '8086:81'\n      - '8087:443'\n    volumes:\n      - ./data:/data\n      - ./letsencrypt:/etc/letsencrypt\n")))}u.isMDXComponent=!0}}]);