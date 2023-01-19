"use strict";(self.webpackChunkmy_website=self.webpackChunkmy_website||[]).push([[9514,4972],{22337:(e,t,n)=>{n.r(t),n.d(t,{default:()=>q});var a=n(67294),l=n(86010),o=n(1944),r=n(35281),c=n(43320),i=n(52802),s=n(74477),d=n(1116),m=n(41550),u=n(95999),b=n(12466),p=n(85936);const h="backToTopButton_sjWU",E="backToTopButtonShow_xfvO";function v(){const{shown:e,scrollToTop:t}=function(e){let{threshold:t}=e;const[n,l]=(0,a.useState)(!1),o=(0,a.useRef)(!1),{startScroll:r,cancelScroll:c}=(0,b.Ct)();return(0,b.RF)(((e,n)=>{let{scrollY:a}=e;const r=null==n?void 0:n.scrollY;r&&(o.current?o.current=!1:a>=r?(c(),l(!1)):a<t?l(!1):a+window.innerHeight<document.documentElement.scrollHeight&&l(!0))})),(0,p.S)((e=>{e.location.hash&&(o.current=!0,l(!1))})),{shown:n,scrollToTop:()=>r(0)}}({threshold:300});return a.createElement("button",{"aria-label":(0,u.I)({id:"theme.BackToTopButton.buttonAriaLabel",message:"Scroll back to top",description:"The ARIA label for the back to top button"}),className:(0,l.Z)("clean-btn",r.k.common.backToTopButton,h,e&&E),type:"button",onClick:t})}var f=n(76775),g=n(87524),_=n(86668),k=n(21327),Z=n(6351),C=n(27215);const S="sidebar_njMd",I="sidebarWithHideableNavbar_wUlq",N="sidebarHidden_VK0M",y="sidebarLogo_isFc";function x(e){let{path:t,sidebar:n,onCollapse:o,isHidden:r}=e;const{navbar:{hideOnScroll:c},docs:{sidebar:{hideable:i}}}=(0,_.L)();return a.createElement("div",{className:(0,l.Z)(S,c&&I,r&&N)},c&&a.createElement(k.Z,{tabIndex:-1,className:y}),a.createElement(C.Z,{path:t,sidebar:n}),i&&a.createElement(Z.Z,{onClick:o}))}const T=a.memo(x);var w=n(57125);function L(e){const t=(0,g.i)(),n="desktop"===t||"ssr"===t,l="mobile"===t;return a.createElement(a.Fragment,null,n&&a.createElement(T,e),l&&a.createElement(w.Z,e))}var M=n(6023);const A="expandButton_m80_",B="expandButtonIcon_BlDH";function F(e){let{toggleSidebar:t}=e;return a.createElement("div",{className:A,title:(0,u.I)({id:"theme.docs.sidebar.expandButtonTitle",message:"Expand sidebar",description:"The ARIA label and title attribute for expand button of doc sidebar"}),"aria-label":(0,u.I)({id:"theme.docs.sidebar.expandButtonAriaLabel",message:"Expand sidebar",description:"The ARIA label and title attribute for expand button of doc sidebar"}),tabIndex:0,role:"button",onKeyDown:t,onClick:t},a.createElement(M.Z,{className:B}))}var P=n(26542);function H(e){let{children:t}=e;const n=(0,d.V)();return a.createElement(a.Fragment,{key:(null==n?void 0:n.name)??"noSidebar"},t)}function W(e){let{sidebar:t,hiddenSidebarContainer:n,setHiddenSidebarContainer:o}=e;const{pathname:c}=(0,f.TH)(),[i,s]=(0,a.useState)(!1),d=(0,a.useCallback)((()=>{i&&s(!1),o((e=>!e))}),[o,i]);return a.createElement("aside",{className:(0,l.Z)(r.k.docs.docSidebarContainer,P.Z.docSidebarContainer,n&&P.Z.docSidebarContainerHidden),onTransitionEnd:e=>{e.currentTarget.classList.contains(P.Z.docSidebarContainer)&&n&&s(!0)}},a.createElement(H,null,a.createElement(L,{sidebar:t,path:c,onCollapse:d,isHidden:i})),i&&a.createElement(F,{toggleSidebar:d}))}var D=n(33227);function R(e){let{hiddenSidebarContainer:t,children:n}=e;const o=(0,d.V)();return a.createElement("main",{className:(0,l.Z)(D.Z.docMainContainer,(t||!o)&&D.Z.docMainContainerEnhanced)},a.createElement("div",{className:(0,l.Z)("container padding-top--md padding-bottom--lg",D.Z.docItemWrapper,t&&D.Z.docItemWrapperEnhanced)},n))}var z=n(13379);function U(e){let{children:t}=e;const n=(0,d.V)(),[l,o]=(0,a.useState)(!1);return a.createElement(m.Z,{wrapperClassName:z.Z.docsWrapper},a.createElement(v,null),a.createElement("div",{className:z.Z.docPage},n&&a.createElement(W,{sidebar:n.items,hiddenSidebarContainer:l,setHiddenSidebarContainer:o}),a.createElement(R,{hiddenSidebarContainer:l},t)))}var V=n(4972),K=n(90197);function j(e){const{versionMetadata:t}=e;return a.createElement(a.Fragment,null,a.createElement(K.Z,{version:t.version,tag:(0,c.os)(t.pluginId,t.version)}),a.createElement(o.d,null,t.noIndex&&a.createElement("meta",{name:"robots",content:"noindex, nofollow"})))}function q(e){const{versionMetadata:t}=e,n=(0,i.hI)(e);if(!n)return a.createElement(V.default,null);const{docElement:c,sidebarName:m,sidebarItems:u}=n;return a.createElement(a.Fragment,null,a.createElement(j,e),a.createElement(o.FG,{className:(0,l.Z)(r.k.wrapper.docsPages,r.k.page.docsDocPage,e.versionMetadata.className)},a.createElement(s.q,{version:t},a.createElement(d.b,{name:m,items:u},a.createElement(U,null,c)))))}},6351:(e,t,n)=>{n.d(t,{Z:()=>s});var a=n(67294),l=n(86010),o=n(95999),r=n(6023);const c="collapseSidebarButton_PEFL",i="collapseSidebarButtonIcon_kv0_";function s(e){let{onClick:t}=e;return a.createElement("button",{type:"button",title:(0,o.I)({id:"theme.docs.sidebar.collapseButtonTitle",message:"Collapse sidebar",description:"The title attribute for collapse button of doc sidebar"}),"aria-label":(0,o.I)({id:"theme.docs.sidebar.collapseButtonAriaLabel",message:"Collapse sidebar",description:"The title attribute for collapse button of doc sidebar"}),className:(0,l.Z)("button button--secondary button--outline",c),onClick:t},a.createElement(r.Z,{className:i}))}},27215:(e,t,n)=>{n.d(t,{Z:()=>m});var a=n(67294),l=n(86010),o=n(35281),r=n(59689),c=n(12466),i=n(15469);const s="menu_SIkG",d="menuWithAnnouncementBar_GW3s";function m(e){let{path:t,sidebar:n,className:m}=e;const u=function(){const{isActive:e}=(0,r.nT)(),[t,n]=(0,a.useState)(e);return(0,c.RF)((t=>{let{scrollY:a}=t;e&&n(0===a)}),[e]),e&&t}();return a.createElement("nav",{className:(0,l.Z)("menu thin-scrollbar",s,u&&d,m)},a.createElement("ul",{className:(0,l.Z)(o.k.docs.docSidebarMenu,"menu__list")},a.createElement(i.Z,{items:n,activePath:t,level:1})))}},57125:(e,t,n)=>{n.d(t,{Z:()=>m});var a=n(67294),l=n(86010),o=n(35281),r=n(13102),c=n(72961),i=n(15469);const s=e=>{let{sidebar:t,path:n}=e;const r=(0,c.e)();return a.createElement("ul",{className:(0,l.Z)(o.k.docs.docSidebarMenu,"menu__list")},a.createElement(i.Z,{items:t,activePath:n,onItemClick:e=>{"category"===e.type&&e.href&&r.toggle(),"link"===e.type&&r.toggle()},level:1}))};function d(e){return a.createElement(r.Zo,{component:s,props:e})}const m=a.memo(d)},15469:(e,t,n)=>{n.d(t,{Z:()=>x});var a=n(87462),l=n(67294),o=n(902);const r=Symbol("EmptyContext"),c=l.createContext(r);function i(e){let{children:t}=e;const[n,a]=(0,l.useState)(null),o=(0,l.useMemo)((()=>({expandedItem:n,setExpandedItem:a})),[n]);return l.createElement(c.Provider,{value:o},t)}var s=n(86010),d=n(86668),m=n(86043),u=n(35281),b=n(52802),p=n(48596),h=n(39960),E=n(95999),v=n(72389);function f(e){let{categoryLabel:t,onClick:n}=e;return l.createElement("button",{"aria-label":(0,E.I)({id:"theme.DocSidebarItem.toggleCollapsedCategoryAriaLabel",message:"Toggle the collapsible sidebar category '{label}'",description:"The ARIA label to toggle the collapsible sidebar category"},{label:t}),type:"button",className:"clean-btn menu__caret",onClick:n})}function g(e){let{item:t,onItemClick:n,activePath:i,level:E,index:g,..._}=e;const{items:k,label:Z,collapsible:C,className:S,href:I}=t,{docs:{sidebar:{autoCollapseCategories:N}}}=(0,d.L)(),y=function(e){const t=(0,v.Z)();return(0,l.useMemo)((()=>e.href?e.href:!t&&e.collapsible?(0,b.Wl)(e):void 0),[e,t])}(t),T=(0,b._F)(t,i),w=(0,p.Mg)(I,i),{collapsed:L,setCollapsed:M}=(0,m.u)({initialState:()=>!!C&&(!T&&t.collapsed)}),{expandedItem:A,setExpandedItem:B}=function(){const e=(0,l.useContext)(c);if(e===r)throw new o.i6("DocSidebarItemsExpandedStateProvider");return e}(),F=function(e){void 0===e&&(e=!L),B(e?null:g),M(e)};return function(e){let{isActive:t,collapsed:n,updateCollapsed:a}=e;const r=(0,o.D9)(t);(0,l.useEffect)((()=>{t&&!r&&n&&a(!1)}),[t,r,n,a])}({isActive:T,collapsed:L,updateCollapsed:F}),(0,l.useEffect)((()=>{C&&null!=A&&A!==g&&N&&M(!0)}),[C,A,g,M,N]),l.createElement("li",{className:(0,s.Z)(u.k.docs.docSidebarItemCategory,u.k.docs.docSidebarItemCategoryLevel(E),"menu__list-item",{"menu__list-item--collapsed":L},S)},l.createElement("div",{className:(0,s.Z)("menu__list-item-collapsible",{"menu__list-item-collapsible--active":w})},l.createElement(h.Z,(0,a.Z)({className:(0,s.Z)("menu__link",{"menu__link--sublist":C,"menu__link--sublist-caret":!I&&C,"menu__link--active":T}),onClick:C?e=>{null==n||n(t),I?F(!1):(e.preventDefault(),F())}:()=>{null==n||n(t)},"aria-current":w?"page":void 0,"aria-expanded":C?!L:void 0,href:C?y??"#":y},_),Z),I&&C&&l.createElement(f,{categoryLabel:Z,onClick:e=>{e.preventDefault(),F()}})),l.createElement(m.z,{lazy:!0,as:"ul",className:"menu__list",collapsed:L},l.createElement(x,{items:k,tabIndex:L?-1:0,onItemClick:n,activePath:i,level:E+1})))}var _=n(13919),k=n(39471);const Z="menuExternalLink_NmtK";function C(e){let{item:t,onItemClick:n,activePath:o,level:r,index:c,...i}=e;const{href:d,label:m,className:p,autoAddBaseUrl:E}=t,v=(0,b._F)(t,o),f=(0,_.Z)(d);return l.createElement("li",{className:(0,s.Z)(u.k.docs.docSidebarItemLink,u.k.docs.docSidebarItemLinkLevel(r),"menu__list-item",p),key:m},l.createElement(h.Z,(0,a.Z)({className:(0,s.Z)("menu__link",!f&&Z,{"menu__link--active":v}),autoAddBaseUrl:E,"aria-current":v?"page":void 0,to:d},f&&{onClick:n?()=>n(t):void 0},i),m,!f&&l.createElement(k.Z,null)))}const S="menuHtmlItem_M9Kj";function I(e){let{item:t,level:n,index:a}=e;const{value:o,defaultStyle:r,className:c}=t;return l.createElement("li",{className:(0,s.Z)(u.k.docs.docSidebarItemLink,u.k.docs.docSidebarItemLinkLevel(n),r&&[S,"menu__list-item"],c),key:a,dangerouslySetInnerHTML:{__html:o}})}function N(e){let{item:t,...n}=e;switch(t.type){case"category":return l.createElement(g,(0,a.Z)({item:t},n));case"html":return l.createElement(I,(0,a.Z)({item:t},n));default:return l.createElement(C,(0,a.Z)({item:t},n))}}function y(e){let{items:t,...n}=e;return l.createElement(i,null,t.map(((e,t)=>l.createElement(N,(0,a.Z)({key:t,item:e,index:t},n)))))}const x=(0,l.memo)(y)},6023:(e,t,n)=>{n.d(t,{Z:()=>o});var a=n(87462),l=n(67294);function o(e){return l.createElement("svg",(0,a.Z)({width:"20",height:"20","aria-hidden":"true"},e),l.createElement("g",{fill:"#7a7a7a"},l.createElement("path",{d:"M9.992 10.023c0 .2-.062.399-.172.547l-4.996 7.492a.982.982 0 01-.828.454H1c-.55 0-1-.453-1-1 0-.2.059-.403.168-.551l4.629-6.942L.168 3.078A.939.939 0 010 2.528c0-.548.45-.997 1-.997h2.996c.352 0 .649.18.828.45L9.82 9.472c.11.148.172.347.172.55zm0 0"}),l.createElement("path",{d:"M19.98 10.023c0 .2-.058.399-.168.547l-4.996 7.492a.987.987 0 01-.828.454h-3c-.547 0-.996-.453-.996-1 0-.2.059-.403.168-.551l4.625-6.942-4.625-6.945a.939.939 0 01-.168-.55 1 1 0 01.996-.997h3c.348 0 .649.18.828.45l4.996 7.492c.11.148.168.347.168.55zm0 0"})))}},4972:(e,t,n)=>{n.r(t),n.d(t,{default:()=>c});var a=n(67294),l=n(95999),o=n(1944),r=n(41550);function c(){return a.createElement(a.Fragment,null,a.createElement(o.d,{title:(0,l.I)({id:"theme.NotFound.title",message:"Page Not Found"})}),a.createElement(r.Z,null,a.createElement("main",{className:"container margin-vert--xl"},a.createElement("div",{className:"row"},a.createElement("div",{className:"col col--6 col--offset-3"},a.createElement("h1",{className:"hero__title"},a.createElement(l.Z,{id:"theme.NotFound.title",description:"The title of the 404 page"},"Page Not Found")),a.createElement("p",null,a.createElement(l.Z,{id:"theme.NotFound.p1",description:"The first paragraph of the 404 page"},"We could not find what you were looking for.")),a.createElement("p",null,a.createElement(l.Z,{id:"theme.NotFound.p2",description:"The 2nd paragraph of the 404 page"},"Please contact the owner of the site that linked you to the original URL and let them know their link is broken.")))))))}},74477:(e,t,n)=>{n.d(t,{E:()=>c,q:()=>r});var a=n(67294),l=n(902);const o=a.createContext(null);function r(e){let{children:t,version:n}=e;return a.createElement(o.Provider,{value:n},t)}function c(){const e=(0,a.useContext)(o);if(null===e)throw new l.i6("DocsVersionProvider");return e}},33227:(e,t,n)=>{n.d(t,{Z:()=>a});const a={docMainContainer:"docMainContainer_gTbr",docMainContainerEnhanced:"docMainContainerEnhanced_Uz_u",docItemWrapperEnhanced:"docItemWrapperEnhanced_czyv"}},26542:(e,t,n)=>{n.d(t,{Z:()=>a});const a={docSidebarContainer:"docSidebarContainer_b6E3",docSidebarContainerHidden:"docSidebarContainerHidden_b3ry"}},13379:(e,t,n)=>{n.d(t,{Z:()=>a});const a={docPage:"docPage__5DB",docsWrapper:"docsWrapper_BCFX"}}}]);