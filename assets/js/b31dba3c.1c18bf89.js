"use strict";(self.webpackChunkdubuqingfeng=self.webpackChunkdubuqingfeng||[]).push([[3768],{49150:(e,s,n)=>{n.r(s),n.d(s,{assets:()=>a,contentTitle:()=>i,default:()=>l,frontMatter:()=>o,metadata:()=>c,toc:()=>d});var r=n(74848),t=n(28453);const o={},i=void 0,c={id:"life/devices/nas/docker/freshrss/freshrss",title:"freshrss",description:"freshrss",source:"@site/docs/life/devices/nas/docker/freshrss/freshrss.md",sourceDirName:"life/devices/nas/docker/freshrss",slug:"/life/devices/nas/docker/freshrss/",permalink:"/docs/life/devices/nas/docker/freshrss/",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"filecodebox",permalink:"/docs/life/devices/nas/docker/filecodebox/"},next:{title:"frpc",permalink:"/docs/life/devices/nas/docker/frpc/"}},a={},d=[{value:"freshrss",id:"freshrss",level:2}];function f(e){const s={code:"code",h2:"h2",pre:"pre",...(0,t.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(s.h2,{id:"freshrss",children:"freshrss"}),"\n",(0,r.jsx)(s.pre,{children:(0,r.jsx)(s.code,{children:'version: "3"\n\nvolumes:\n  data:\n  extensions:\n\nservices:\n  freshrss:\n    image:  dockerproxy.com/freshrss/freshrss:latest\n    # Optional build section if you want to build the image locally:\n    container_name: freshrss\n    ports:\n      - "${PUBLISHED_PORT:-3080}:${LISTEN:-80}"\n    hostname: freshrss\n    restart: unless-stopped\n    logging:\n      options:\n        max-size: 10m\n    volumes:\n      - data:/var/www/FreshRSS/data\n      - extensions:/var/www/FreshRSS/extensions\n    environment:\n      TZ: Europe/Paris\n      CRON_MIN: \'3,33\'\n      TRUSTED_PROXY: 172.16.0.1/12 192.168.0.1/16\n'})})]})}function l(e={}){const{wrapper:s}={...(0,t.R)(),...e.components};return s?(0,r.jsx)(s,{...e,children:(0,r.jsx)(f,{...e})}):f(e)}},28453:(e,s,n)=>{n.d(s,{R:()=>i,x:()=>c});var r=n(96540);const t={},o=r.createContext(t);function i(e){const s=r.useContext(o);return r.useMemo((function(){return"function"==typeof e?e(s):{...s,...e}}),[s,e])}function c(e){let s;return s=e.disableParentContext?"function"==typeof e.components?e.components(t):e.components||t:i(e.components),r.createElement(o.Provider,{value:s},e.children)}}}]);