"use strict";(self.webpackChunkdubuqingfeng=self.webpackChunkdubuqingfeng||[]).push([[4024],{71080:(t,e,n)=>{n.r(e),n.d(e,{assets:()=>d,contentTitle:()=>s,default:()=>a,frontMatter:()=>c,metadata:()=>i,toc:()=>x});var o=n(74848),r=n(28453);const c={},s=void 0,i={id:"code/python/byte2str",title:"byte2str",description:"",source:"@site/docs/code/python/byte2str.md",sourceDirName:"code/python",slug:"/code/python/byte2str",permalink:"/docs/code/python/byte2str",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"mddir",permalink:"/docs/code/dir/mddir"},next:{title:"trace",permalink:"/docs/code/python/trace/"}},d={},x=[];function u(t){const e={code:"code",pre:"pre",...(0,r.R)(),...t.components};return(0,o.jsx)(e.pre,{children:(0,o.jsx)(e.code,{children:"#!/usr/bin/env python\n# coding=utf-8\nimport codecs\n\n# byte string to be converted\n#b_string = b'\\xc3\\xa9\\xc3\\xa0\\xc3\\xb4'\nb_string = b'\\x85\\xfd\\xda\\xd7\\x14\\x98\\xb4\\xb7:\\xbb\\xf2\\xde\\xf0\\xc8/\\xdcI\\x83\\x18\\x1f\\x8c\\xb5\\x85DK\\xad#\\xfa\\x96\\xe5\\xbb\\xbf\\x00\\x00\\x00\\x00'\n# decoding the byte string to unicode string\nu_string = b_string.hex()\n\nprint(u_string)\n"})})}function a(t={}){const{wrapper:e}={...(0,r.R)(),...t.components};return e?(0,o.jsx)(e,{...t,children:(0,o.jsx)(u,{...t})}):u(t)}},28453:(t,e,n)=>{n.d(e,{R:()=>s,x:()=>i});var o=n(96540);const r={},c=o.createContext(r);function s(t){const e=o.useContext(c);return o.useMemo((function(){return"function"==typeof t?t(e):{...e,...t}}),[e,t])}function i(t){let e;return e=t.disableParentContext?"function"==typeof t.components?t.components(r):t.components||r:s(t.components),o.createElement(c.Provider,{value:e},t.children)}}}]);