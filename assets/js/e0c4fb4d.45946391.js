"use strict";(self.webpackChunkdubuqingfeng=self.webpackChunkdubuqingfeng||[]).push([[4249],{13452:(e,n,r)=>{r.r(n),r.d(n,{assets:()=>c,contentTitle:()=>s,default:()=>p,frontMatter:()=>o,metadata:()=>i,toc:()=>d});var a=r(74848),t=r(28453);const o={},s=void 0,i={id:"life/devices/nas/docker/nginx-proxy-manager/nginx-proxy-manager",title:"nginx-proxy-manager",description:"nginx-proxy-manager",source:"@site/docs/life/devices/nas/docker/nginx-proxy-manager/nginx-proxy-manager.md",sourceDirName:"life/devices/nas/docker/nginx-proxy-manager",slug:"/life/devices/nas/docker/nginx-proxy-manager/",permalink:"/docs/life/devices/nas/docker/nginx-proxy-manager/",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"crawlab",permalink:"/docs/life/devices/nas/docker/crawlab/"},next:{title:"siyuan",permalink:"/docs/life/devices/nas/docker/siyuan/"}},c={},d=[{value:"nginx-proxy-manager",id:"nginx-proxy-manager",level:2}];function l(e){const n={code:"code",h2:"h2",pre:"pre",...(0,t.R)(),...e.components};return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(n.h2,{id:"nginx-proxy-manager",children:"nginx-proxy-manager"}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-yaml",children:"version: '3'\nservices:\n  app:\n    image: 'jc21/nginx-proxy-manager:latest'\n    restart: unless-stopped\n    ports:\n      - '80:80'\n      - '8086:81'\n      - '8087:443'\n    volumes:\n      - ./data:/data\n      - ./letsencrypt:/etc/letsencrypt\n"})})]})}function p(e={}){const{wrapper:n}={...(0,t.R)(),...e.components};return n?(0,a.jsx)(n,{...e,children:(0,a.jsx)(l,{...e})}):l(e)}},28453:(e,n,r)=>{r.d(n,{R:()=>s,x:()=>i});var a=r(96540);const t={},o=a.createContext(t);function s(e){const n=a.useContext(o);return a.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function i(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(t):e.components||t:s(e.components),a.createElement(o.Provider,{value:n},e.children)}}}]);