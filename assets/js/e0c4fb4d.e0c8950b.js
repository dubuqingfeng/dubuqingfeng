"use strict";(self.webpackChunkdubuqingfeng=self.webpackChunkdubuqingfeng||[]).push([[4249],{13452:(e,n,r)=>{r.r(n),r.d(n,{assets:()=>c,contentTitle:()=>s,default:()=>l,frontMatter:()=>o,metadata:()=>i,toc:()=>d});var t=r(74848),a=r(28453);const o={},s=void 0,i={id:"life/devices/nas/docker/nginx-proxy-manager/nginx-proxy-manager",title:"nginx-proxy-manager",description:"nginx-proxy-manager",source:"@site/docs/life/devices/nas/docker/nginx-proxy-manager/nginx-proxy-manager.md",sourceDirName:"life/devices/nas/docker/nginx-proxy-manager",slug:"/life/devices/nas/docker/nginx-proxy-manager/",permalink:"/docs/life/devices/nas/docker/nginx-proxy-manager/",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"gitea",permalink:"/docs/life/devices/nas/docker/gitea/"},next:{title:"openobserve",permalink:"/docs/life/devices/nas/docker/openobserve/"}},c={},d=[{value:"nginx-proxy-manager",id:"nginx-proxy-manager",level:2}];function p(e){const n={code:"code",h2:"h2",pre:"pre",...(0,a.R)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(n.h2,{id:"nginx-proxy-manager",children:"nginx-proxy-manager"}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-yaml",children:"version: '3'\nservices:\n  app:\n    image: 'jc21/nginx-proxy-manager:latest'\n    restart: unless-stopped\n    ports:\n      - '80:80'\n      - '8086:81'\n      - '8087:443'\n    volumes:\n      - ./data:/data\n      - ./letsencrypt:/etc/letsencrypt\n"})})]})}function l(e={}){const{wrapper:n}={...(0,a.R)(),...e.components};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(p,{...e})}):p(e)}},28453:(e,n,r)=>{r.d(n,{R:()=>s,x:()=>i});var t=r(96540);const a={},o=t.createContext(a);function s(e){const n=t.useContext(o);return t.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function i(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(a):e.components||a:s(e.components),t.createElement(o.Provider,{value:n},e.children)}}}]);