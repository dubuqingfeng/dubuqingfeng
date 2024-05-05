"use strict";(self.webpackChunkdubuqingfeng=self.webpackChunkdubuqingfeng||[]).push([[5291],{85208:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>i,contentTitle:()=>s,default:()=>u,frontMatter:()=>a,metadata:()=>c,toc:()=>d});var r=n(74848),o=n(28453);const a={},s=void 0,c={id:"code/python/trace/trace",title:"trace",description:"",source:"@site/docs/code/python/trace/trace.md",sourceDirName:"code/python/trace",slug:"/code/python/trace/",permalink:"/docs/code/python/trace/",draft:!1,unlisted:!1,tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"byte2str",permalink:"/docs/code/python/byte2str"},next:{title:"alfred",permalink:"/docs/life/devices/alfred"}},i={},d=[];function p(e){const t={code:"code",pre:"pre",...(0,o.R)(),...e.components};return(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{children:'#!/usr/bin/env python\n# coding=utf-8\n#!/usr/bin/env python3\n\nimport logging\n\nimport uptrace\nfrom opentelemetry import trace\n\n# Configure OpenTelemetry with sensible defaults.\nuptrace.configure_opentelemetry(\n    # Set dsn or UPTRACE_DSN env var.\n    dsn="",\n    service_name="myservice",\n    service_version="1.0.0",\n)\n\n# Create a tracer. Usually, tracer is a global variable.\ntracer = trace.get_tracer("app_or_package_name", "1.0.0")\n\n# Create a root span (a trace) to measure some operation.\nwith tracer.start_as_current_span("main-operation") as main:\n    with tracer.start_as_current_span("GET /posts/:id") as child1:\n        child1.set_attribute("http.method", "GET")\n        child1.set_attribute("http.route", "/posts/:id")\n        child1.set_attribute("http.url", "http://localhost:8080/posts/123")\n        child1.set_attribute("http.status_code", 200)\n        child1.record_exception(ValueError("error1"))\n\n    with tracer.start_as_current_span("SELECT") as child2:\n        child2.set_attribute("db.system", "mysql")\n        child2.set_attribute("db.statement", "SELECT * FROM posts LIMIT 100")\n\n    logging.error("Jackdaws love my big sphinx of quartz.")\n\n    print("trace:", uptrace.trace_url(main))\n\n# Send buffered spans and free resources.\nuptrace.shutdown()\n\n'})})}function u(e={}){const{wrapper:t}={...(0,o.R)(),...e.components};return t?(0,r.jsx)(t,{...e,children:(0,r.jsx)(p,{...e})}):p(e)}},28453:(e,t,n)=>{n.d(t,{R:()=>s,x:()=>c});var r=n(96540);const o={},a=r.createContext(o);function s(e){const t=r.useContext(a);return r.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function c(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(o):e.components||o:s(e.components),r.createElement(a.Provider,{value:t},e.children)}}}]);