"use strict";(self.webpackChunkdubuqingfeng=self.webpackChunkdubuqingfeng||[]).push([[6061],{55339:(e,t,o)=>{o.r(t),o.d(t,{default:()=>_});var n=o(96540),c=o(11062),s=o(18215),a=o(84631),l=o(18630),r=o(49292);const i={codeBlockContainer:"codeBlockContainer_Ckt0"};var d=o(74848);function u(e){let{as:t,...o}=e;const n=(0,a.A)(),c=(0,r.M$)(n);return(0,d.jsx)(t,{...o,style:c,className:(0,s.A)(o.className,i.codeBlockContainer,l.G.common.codeBlock)})}const m={codeBlockContent:"codeBlockContent_biex",codeBlockTitle:"codeBlockTitle_Ktv7",codeBlock:"codeBlock_bY9V",codeBlockStandalone:"codeBlockStandalone_MEMb",codeBlockLines:"codeBlockLines_e6Vv",codeBlockLinesWithNumbering:"codeBlockLinesWithNumbering_o6Pm",buttonGroup:"buttonGroup__atx"};function p(e){let{children:t,className:o}=e;return(0,d.jsx)(u,{as:"pre",tabIndex:0,className:(0,s.A)(m.codeBlockStandalone,"thin-scrollbar",o),children:(0,d.jsx)("code",{className:m.codeBlockLines,children:t})})}var g=o(86957),h=o(16419),x=o(78181);const b={codeLine:"codeLine_lJS_",codeLineNumber:"codeLineNumber_Tfdd",codeLineContent:"codeLineContent_feaV"};function B(e){let{line:t,classNames:o,showLineNumbers:n,getLineProps:c,getTokenProps:a}=e;1===t.length&&"\n"===t[0].content&&(t[0].content="");const l=c({line:t,className:(0,s.A)(o,n&&b.codeLine)}),r=t.map(((e,t)=>(0,d.jsx)("span",{...a({token:e,key:t})},t)));return(0,d.jsxs)("span",{...l,children:[n?(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)("span",{className:b.codeLineNumber}),(0,d.jsx)("span",{className:b.codeLineContent,children:r})]}):r,(0,d.jsx)("br",{})]})}var k=o(76316),f=o(23230);function j(e){return(0,d.jsx)("svg",{viewBox:"0 0 24 24",...e,children:(0,d.jsx)("path",{fill:"currentColor",d:"M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"})})}function N(e){return(0,d.jsx)("svg",{viewBox:"0 0 24 24",...e,children:(0,d.jsx)("path",{fill:"currentColor",d:"M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"})})}const y={copyButtonCopied:"copyButtonCopied_obH4",copyButtonIcons:"copyButtonIcons_eSgA",copyButtonIcon:"copyButtonIcon_y97N",copyButtonSuccessIcon:"copyButtonSuccessIcon_LjdS"};function C(e){let{code:t,className:o}=e;const[c,a]=(0,n.useState)(!1),l=(0,n.useRef)(void 0),r=(0,n.useCallback)((()=>{(0,k.default)(t),a(!0),l.current=window.setTimeout((()=>{a(!1)}),1e3)}),[t]);return(0,n.useEffect)((()=>()=>window.clearTimeout(l.current)),[]),(0,d.jsx)("button",{type:"button","aria-label":c?(0,f.translate)({id:"theme.CodeBlock.copied",message:"Copied",description:"The copied button label on code blocks"}):(0,f.translate)({id:"theme.CodeBlock.copyButtonAriaLabel",message:"Copy code to clipboard",description:"The ARIA label for copy code blocks button"}),title:(0,f.translate)({id:"theme.CodeBlock.copy",message:"Copy",description:"The copy button label on code blocks"}),className:(0,s.A)("clean-btn",o,y.copyButton,c&&y.copyButtonCopied),onClick:r,children:(0,d.jsxs)("span",{className:y.copyButtonIcons,"aria-hidden":"true",children:[(0,d.jsx)(j,{className:y.copyButtonIcon}),(0,d.jsx)(N,{className:y.copyButtonSuccessIcon})]})})}function v(e){return(0,d.jsx)("svg",{viewBox:"0 0 24 24",...e,children:(0,d.jsx)("path",{fill:"currentColor",d:"M4 19h6v-2H4v2zM20 5H4v2h16V5zm-3 6H4v2h13.25c1.1 0 2 .9 2 2s-.9 2-2 2H15v-2l-3 3l3 3v-2h2c2.21 0 4-1.79 4-4s-1.79-4-4-4z"})})}const L={wordWrapButtonIcon:"wordWrapButtonIcon_Bwma",wordWrapButtonEnabled:"wordWrapButtonEnabled_EoeP"};function w(e){let{className:t,onClick:o,isEnabled:n}=e;const c=(0,f.translate)({id:"theme.CodeBlock.wordWrapToggle",message:"Toggle word wrap",description:"The title attribute for toggle word wrapping button of code block lines"});return(0,d.jsx)("button",{type:"button",onClick:o,className:(0,s.A)("clean-btn",t,n&&L.wordWrapButtonEnabled),"aria-label":c,title:c,children:(0,d.jsx)(v,{className:L.wordWrapButtonIcon,"aria-hidden":"true"})})}function A(e){let{children:t,className:o="",metastring:n,title:c,showLineNumbers:l,language:i}=e;const{prism:{defaultLanguage:p,magicComments:b}}=(0,g.p)(),k=function(e){return e?.toLowerCase()}(i??(0,r.Op)(o)??p),f=(0,a.A)(),j=(0,h.f)(),N=(0,r.wt)(n)||c,{lineClassNames:y,code:v}=(0,r.Li)(t,{metastring:n,language:k,magicComments:b}),L=l??(0,r._u)(n);return(0,d.jsxs)(u,{as:"div",className:(0,s.A)(o,k&&!o.includes(`language-${k}`)&&`language-${k}`),children:[N&&(0,d.jsx)("div",{className:m.codeBlockTitle,children:N}),(0,d.jsxs)("div",{className:m.codeBlockContent,children:[(0,d.jsx)(x.Highlight,{theme:f,code:v,language:k??"text",children:e=>{let{className:t,style:o,tokens:n,getLineProps:c,getTokenProps:a}=e;return(0,d.jsx)("pre",{tabIndex:0,ref:j.codeBlockRef,className:(0,s.A)(t,m.codeBlock,"thin-scrollbar"),style:o,children:(0,d.jsx)("code",{className:(0,s.A)(m.codeBlockLines,L&&m.codeBlockLinesWithNumbering),children:n.map(((e,t)=>(0,d.jsx)(B,{line:e,getLineProps:c,getTokenProps:a,classNames:y[t],showLineNumbers:L},t)))})})}}),(0,d.jsxs)("div",{className:m.buttonGroup,children:[(j.isEnabled||j.isCodeScrollable)&&(0,d.jsx)(w,{className:m.codeButton,onClick:()=>j.toggle(),isEnabled:j.isEnabled}),(0,d.jsx)(C,{className:m.codeButton,code:v})]})]})]})}function _(e){let{children:t,...o}=e;const s=(0,c.default)(),a=function(e){return n.Children.toArray(e).some((e=>(0,n.isValidElement)(e)))?e:Array.isArray(e)?e.join(""):e}(t),l="string"==typeof a?A:p;return(0,d.jsx)(l,{...o,children:a},String(s))}},57591:(e,t,o)=>{o.r(t),o.d(t,{default:()=>m});o(96540);var n=o(18215),c=o(94239),s=o(18630),a=o(13227),l=o(40600),r=o(98793),i=o(32829);const d={mdxPageWrapper:"mdxPageWrapper_j9I6"};var u=o(74848);function m(e){const{content:t}=e,{metadata:{title:o,description:m,frontMatter:p,unlisted:g},assets:h}=t,{keywords:x,wrapperClassName:b,hide_table_of_contents:B}=p,k=h.image??p.image;return(0,u.jsx)(c.e3,{className:(0,n.A)(b??s.G.wrapper.mdxPages,s.G.page.mdxPage),children:(0,u.jsxs)(a.A,{children:[(0,u.jsx)(c.be,{title:o,description:m,keywords:x,image:k}),(0,u.jsx)("main",{className:"container container--fluid margin-vert--lg",children:(0,u.jsxs)("div",{className:(0,n.A)("row",d.mdxPageWrapper),children:[(0,u.jsxs)("div",{className:(0,n.A)("col",!B&&"col--8"),children:[g&&(0,u.jsx)(i.default,{}),(0,u.jsx)("article",{children:(0,u.jsx)(l.A,{children:(0,u.jsx)(t,{})})})]}),!B&&t.toc.length>0&&(0,u.jsx)("div",{className:"col col--2",children:(0,u.jsx)(r.A,{toc:t.toc,minHeadingLevel:p.toc_min_heading_level,maxHeadingLevel:p.toc_max_heading_level})})]})})]})})}},76316:(e,t,o)=>{function n(e,t){let{target:o=document.body}=void 0===t?{}:t;if("string"!=typeof e)throw new TypeError(`Expected parameter \`text\` to be a \`string\`, got \`${typeof e}\`.`);const n=document.createElement("textarea"),c=document.activeElement;n.value=e,n.setAttribute("readonly",""),n.style.contain="strict",n.style.position="absolute",n.style.left="-9999px",n.style.fontSize="12pt";const s=document.getSelection(),a=s.rangeCount>0&&s.getRangeAt(0);o.append(n),n.select(),n.selectionStart=0,n.selectionEnd=e.length;let l=!1;try{l=document.execCommand("copy")}catch{}return n.remove(),a&&(s.removeAllRanges(),s.addRange(a)),c&&c.focus(),l}o.r(t),o.d(t,{default:()=>n})}}]);