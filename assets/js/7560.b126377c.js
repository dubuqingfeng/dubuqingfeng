"use strict";(self.webpackChunkdubuqingfeng=self.webpackChunkdubuqingfeng||[]).push([[7560],{85055:(e,t,r)=>{r.d(t,{A:()=>ae});var n=function(){function e(e){var t=this;this._insertTag=function(e){var r;r=0===t.tags.length?t.insertionPoint?t.insertionPoint.nextSibling:t.prepend?t.container.firstChild:t.before:t.tags[t.tags.length-1].nextSibling,t.container.insertBefore(e,r),t.tags.push(e)},this.isSpeedy=void 0===e.speedy||e.speedy,this.tags=[],this.ctr=0,this.nonce=e.nonce,this.key=e.key,this.container=e.container,this.prepend=e.prepend,this.insertionPoint=e.insertionPoint,this.before=null}var t=e.prototype;return t.hydrate=function(e){e.forEach(this._insertTag)},t.insert=function(e){this.ctr%(this.isSpeedy?65e3:1)==0&&this._insertTag(function(e){var t=document.createElement("style");return t.setAttribute("data-emotion",e.key),void 0!==e.nonce&&t.setAttribute("nonce",e.nonce),t.appendChild(document.createTextNode("")),t.setAttribute("data-s",""),t}(this));var t=this.tags[this.tags.length-1];if(this.isSpeedy){var r=function(e){if(e.sheet)return e.sheet;for(var t=0;t<document.styleSheets.length;t++)if(document.styleSheets[t].ownerNode===e)return document.styleSheets[t]}(t);try{r.insertRule(e,r.cssRules.length)}catch(n){0}}else t.appendChild(document.createTextNode(e));this.ctr++},t.flush=function(){this.tags.forEach((function(e){return e.parentNode&&e.parentNode.removeChild(e)})),this.tags=[],this.ctr=0},e}(),a=Math.abs,s=String.fromCharCode,c=Object.assign;function i(e){return e.trim()}function o(e,t,r){return e.replace(t,r)}function u(e,t){return e.indexOf(t)}function l(e,t){return 0|e.charCodeAt(t)}function f(e,t,r){return e.slice(t,r)}function d(e){return e.length}function h(e){return e.length}function p(e,t){return t.push(e),e}var v=1,g=1,m=0,y=0,b=0,k="";function w(e,t,r,n,a,s,c){return{value:e,root:t,parent:r,type:n,props:a,children:s,line:v,column:g,length:c,return:""}}function x(e,t){return c(w("",null,null,"",null,null,0),e,{length:-e.length},t)}function $(){return b=y>0?l(k,--y):0,g--,10===b&&(g=1,v--),b}function A(){return b=y<m?l(k,y++):0,g++,10===b&&(g=1,v++),b}function C(){return l(k,y)}function S(){return y}function R(e,t){return f(k,e,t)}function _(e){switch(e){case 0:case 9:case 10:case 13:case 32:return 5;case 33:case 43:case 44:case 47:case 62:case 64:case 126:case 59:case 123:case 125:return 4;case 58:return 3;case 34:case 39:case 40:case 91:return 2;case 41:case 93:return 1}return 0}function O(e){return v=g=1,m=d(k=e),y=0,[]}function N(e){return k="",e}function E(e){return i(R(y-1,P(91===e?e+2:40===e?e+1:e)))}function j(e){for(;(b=C())&&b<33;)A();return _(e)>2||_(b)>3?"":" "}function z(e,t){for(;--t&&A()&&!(b<48||b>102||b>57&&b<65||b>70&&b<97););return R(e,S()+(t<6&&32==C()&&32==A()))}function P(e){for(;A();)switch(b){case e:return y;case 34:case 39:34!==e&&39!==e&&P(b);break;case 40:41===e&&P(e);break;case 92:A()}return y}function G(e,t){for(;A()&&e+b!==57&&(e+b!==84||47!==C()););return"/*"+R(t,y-1)+"*"+s(47===e?e:A())}function T(e){for(;!_(C());)A();return R(e,y)}var W="-ms-",I="-moz-",M="-webkit-",q="comm",B="rule",D="decl",F="@keyframes";function L(e,t){for(var r="",n=h(e),a=0;a<n;a++)r+=t(e[a],a,e,t)||"";return r}function H(e,t,r,n){switch(e.type){case"@layer":if(e.children.length)break;case"@import":case D:return e.return=e.return||e.value;case q:return"";case F:return e.return=e.value+"{"+L(e.children,n)+"}";case B:e.value=e.props.join(",")}return d(r=L(e.children,n))?e.return=e.value+"{"+r+"}":""}function J(e){return N(U("",null,null,null,[""],e=O(e),0,[0],e))}function U(e,t,r,n,a,c,i,f,h){for(var v=0,g=0,m=i,y=0,b=0,k=0,w=1,x=1,R=1,_=0,O="",N=a,P=c,W=n,I=O;x;)switch(k=_,_=A()){case 40:if(108!=k&&58==l(I,m-1)){-1!=u(I+=o(E(_),"&","&\f"),"&\f")&&(R=-1);break}case 34:case 39:case 91:I+=E(_);break;case 9:case 10:case 13:case 32:I+=j(k);break;case 92:I+=z(S()-1,7);continue;case 47:switch(C()){case 42:case 47:p(K(G(A(),S()),t,r),h);break;default:I+="/"}break;case 123*w:f[v++]=d(I)*R;case 125*w:case 59:case 0:switch(_){case 0:case 125:x=0;case 59+g:-1==R&&(I=o(I,/\f/g,"")),b>0&&d(I)-m&&p(b>32?Q(I+";",n,r,m-1):Q(o(I," ","")+";",n,r,m-2),h);break;case 59:I+=";";default:if(p(W=Z(I,t,r,v,g,a,f,O,N=[],P=[],m),c),123===_)if(0===g)U(I,t,W,W,N,c,m,f,P);else switch(99===y&&110===l(I,3)?100:y){case 100:case 108:case 109:case 115:U(e,W,W,n&&p(Z(e,W,W,0,0,a,f,O,a,N=[],m),P),a,P,m,f,n?N:P);break;default:U(I,W,W,W,[""],P,0,f,P)}}v=g=b=0,w=R=1,O=I="",m=i;break;case 58:m=1+d(I),b=k;default:if(w<1)if(123==_)--w;else if(125==_&&0==w++&&125==$())continue;switch(I+=s(_),_*w){case 38:R=g>0?1:(I+="\f",-1);break;case 44:f[v++]=(d(I)-1)*R,R=1;break;case 64:45===C()&&(I+=E(A())),y=C(),g=m=d(O=I+=T(S())),_++;break;case 45:45===k&&2==d(I)&&(w=0)}}return c}function Z(e,t,r,n,s,c,u,l,d,p,v){for(var g=s-1,m=0===s?c:[""],y=h(m),b=0,k=0,x=0;b<n;++b)for(var $=0,A=f(e,g+1,g=a(k=u[b])),C=e;$<y;++$)(C=i(k>0?m[$]+" "+A:o(A,/&\f/g,m[$])))&&(d[x++]=C);return w(e,t,r,0===s?B:l,d,p,v)}function K(e,t,r){return w(e,t,r,q,s(b),f(e,2,-2),0)}function Q(e,t,r,n){return w(e,t,r,D,f(e,0,n),f(e,n+1,-1),n)}r(96763);var V=function(e,t,r){for(var n=0,a=0;n=a,a=C(),38===n&&12===a&&(t[r]=1),!_(a);)A();return R(e,y)},X=function(e,t){return N(function(e,t){var r=-1,n=44;do{switch(_(n)){case 0:38===n&&12===C()&&(t[r]=1),e[r]+=V(y-1,t,r);break;case 2:e[r]+=E(n);break;case 4:if(44===n){e[++r]=58===C()?"&\f":"",t[r]=e[r].length;break}default:e[r]+=s(n)}}while(n=A());return e}(O(e),t))},Y=new WeakMap,ee=function(e){if("rule"===e.type&&e.parent&&!(e.length<1)){for(var t=e.value,r=e.parent,n=e.column===r.column&&e.line===r.line;"rule"!==r.type;)if(!(r=r.parent))return;if((1!==e.props.length||58===t.charCodeAt(0)||Y.get(r))&&!n){Y.set(e,!0);for(var a=[],s=X(t,a),c=r.props,i=0,o=0;i<s.length;i++)for(var u=0;u<c.length;u++,o++)e.props[o]=a[i]?s[i].replace(/&\f/g,c[u]):c[u]+" "+s[i]}}},te=function(e){if("decl"===e.type){var t=e.value;108===t.charCodeAt(0)&&98===t.charCodeAt(2)&&(e.return="",e.value="")}};function re(e,t){switch(function(e,t){return 45^l(e,0)?(((t<<2^l(e,0))<<2^l(e,1))<<2^l(e,2))<<2^l(e,3):0}(e,t)){case 5103:return M+"print-"+e+e;case 5737:case 4201:case 3177:case 3433:case 1641:case 4457:case 2921:case 5572:case 6356:case 5844:case 3191:case 6645:case 3005:case 6391:case 5879:case 5623:case 6135:case 4599:case 4855:case 4215:case 6389:case 5109:case 5365:case 5621:case 3829:return M+e+e;case 5349:case 4246:case 4810:case 6968:case 2756:return M+e+I+e+W+e+e;case 6828:case 4268:return M+e+W+e+e;case 6165:return M+e+W+"flex-"+e+e;case 5187:return M+e+o(e,/(\w+).+(:[^]+)/,M+"box-$1$2"+W+"flex-$1$2")+e;case 5443:return M+e+W+"flex-item-"+o(e,/flex-|-self/,"")+e;case 4675:return M+e+W+"flex-line-pack"+o(e,/align-content|flex-|-self/,"")+e;case 5548:return M+e+W+o(e,"shrink","negative")+e;case 5292:return M+e+W+o(e,"basis","preferred-size")+e;case 6060:return M+"box-"+o(e,"-grow","")+M+e+W+o(e,"grow","positive")+e;case 4554:return M+o(e,/([^-])(transform)/g,"$1"+M+"$2")+e;case 6187:return o(o(o(e,/(zoom-|grab)/,M+"$1"),/(image-set)/,M+"$1"),e,"")+e;case 5495:case 3959:return o(e,/(image-set\([^]*)/,M+"$1$`$1");case 4968:return o(o(e,/(.+:)(flex-)?(.*)/,M+"box-pack:$3"+W+"flex-pack:$3"),/s.+-b[^;]+/,"justify")+M+e+e;case 4095:case 3583:case 4068:case 2532:return o(e,/(.+)-inline(.+)/,M+"$1$2")+e;case 8116:case 7059:case 5753:case 5535:case 5445:case 5701:case 4933:case 4677:case 5533:case 5789:case 5021:case 4765:if(d(e)-1-t>6)switch(l(e,t+1)){case 109:if(45!==l(e,t+4))break;case 102:return o(e,/(.+:)(.+)-([^]+)/,"$1"+M+"$2-$3$1"+I+(108==l(e,t+3)?"$3":"$2-$3"))+e;case 115:return~u(e,"stretch")?re(o(e,"stretch","fill-available"),t)+e:e}break;case 4949:if(115!==l(e,t+1))break;case 6444:switch(l(e,d(e)-3-(~u(e,"!important")&&10))){case 107:return o(e,":",":"+M)+e;case 101:return o(e,/(.+:)([^;!]+)(;|!.+)?/,"$1"+M+(45===l(e,14)?"inline-":"")+"box$3$1"+M+"$2$3$1"+W+"$2box$3")+e}break;case 5936:switch(l(e,t+11)){case 114:return M+e+W+o(e,/[svh]\w+-[tblr]{2}/,"tb")+e;case 108:return M+e+W+o(e,/[svh]\w+-[tblr]{2}/,"tb-rl")+e;case 45:return M+e+W+o(e,/[svh]\w+-[tblr]{2}/,"lr")+e}return M+e+W+e+e}return e}var ne=[function(e,t,r,n){if(e.length>-1&&!e.return)switch(e.type){case D:e.return=re(e.value,e.length);break;case F:return L([x(e,{value:o(e.value,"@","@"+M)})],n);case B:if(e.length)return function(e,t){return e.map(t).join("")}(e.props,(function(t){switch(function(e,t){return(e=t.exec(e))?e[0]:e}(t,/(::plac\w+|:read-\w+)/)){case":read-only":case":read-write":return L([x(e,{props:[o(t,/:(read-\w+)/,":-moz-$1")]})],n);case"::placeholder":return L([x(e,{props:[o(t,/:(plac\w+)/,":"+M+"input-$1")]}),x(e,{props:[o(t,/:(plac\w+)/,":-moz-$1")]}),x(e,{props:[o(t,/:(plac\w+)/,W+"input-$1")]})],n)}return""}))}}],ae=function(e){var t=e.key;if("css"===t){var r=document.querySelectorAll("style[data-emotion]:not([data-s])");Array.prototype.forEach.call(r,(function(e){-1!==e.getAttribute("data-emotion").indexOf(" ")&&(document.head.appendChild(e),e.setAttribute("data-s",""))}))}var a=e.stylisPlugins||ne;var s,c,i={},o=[];s=e.container||document.head,Array.prototype.forEach.call(document.querySelectorAll('style[data-emotion^="'+t+' "]'),(function(e){for(var t=e.getAttribute("data-emotion").split(" "),r=1;r<t.length;r++)i[t[r]]=!0;o.push(e)}));var u,l,f,d,p=[H,(d=function(e){u.insert(e)},function(e){e.root||(e=e.return)&&d(e)})],v=(l=[ee,te].concat(a,p),f=h(l),function(e,t,r,n){for(var a="",s=0;s<f;s++)a+=l[s](e,t,r,n)||"";return a});c=function(e,t,r,n){u=r,L(J(e?e+"{"+t.styles+"}":t.styles),v),n&&(g.inserted[t.name]=!0)};var g={key:t,sheet:new n({key:t,container:s,nonce:e.nonce,speedy:e.speedy,prepend:e.prepend,insertionPoint:e.insertionPoint}),nonce:e.nonce,inserted:i,registered:{},insert:c};return g.sheet.hydrate(o),g}},84559:(e,t,r)=>{r.d(t,{J:()=>p});var n={animationIterationCount:1,aspectRatio:1,borderImageOutset:1,borderImageSlice:1,borderImageWidth:1,boxFlex:1,boxFlexGroup:1,boxOrdinalGroup:1,columnCount:1,columns:1,flex:1,flexGrow:1,flexPositive:1,flexShrink:1,flexNegative:1,flexOrder:1,gridRow:1,gridRowEnd:1,gridRowSpan:1,gridRowStart:1,gridColumn:1,gridColumnEnd:1,gridColumnSpan:1,gridColumnStart:1,msGridRow:1,msGridRowSpan:1,msGridColumn:1,msGridColumnSpan:1,fontWeight:1,lineHeight:1,opacity:1,order:1,orphans:1,tabSize:1,widows:1,zIndex:1,zoom:1,WebkitLineClamp:1,fillOpacity:1,floodOpacity:1,stopOpacity:1,strokeDasharray:1,strokeDashoffset:1,strokeMiterlimit:1,strokeOpacity:1,strokeWidth:1};function a(e){var t=Object.create(null);return function(r){return void 0===t[r]&&(t[r]=e(r)),t[r]}}var s=/[A-Z]|^ms/g,c=/_EMO_([^_]+?)_([^]*?)_EMO_/g,i=function(e){return 45===e.charCodeAt(1)},o=function(e){return null!=e&&"boolean"!=typeof e},u=a((function(e){return i(e)?e:e.replace(s,"-$&").toLowerCase()})),l=function(e,t){switch(e){case"animation":case"animationName":if("string"==typeof t)return t.replace(c,(function(e,t,r){return d={name:t,styles:r,next:d},t}))}return 1===n[e]||i(e)||"number"!=typeof t||0===t?t:t+"px"};function f(e,t,r){if(null==r)return"";if(void 0!==r.__emotion_styles)return r;switch(typeof r){case"boolean":return"";case"object":if(1===r.anim)return d={name:r.name,styles:r.styles,next:d},r.name;if(void 0!==r.styles){var n=r.next;if(void 0!==n)for(;void 0!==n;)d={name:n.name,styles:n.styles,next:d},n=n.next;return r.styles+";"}return function(e,t,r){var n="";if(Array.isArray(r))for(var a=0;a<r.length;a++)n+=f(e,t,r[a])+";";else for(var s in r){var c=r[s];if("object"!=typeof c)null!=t&&void 0!==t[c]?n+=s+"{"+t[c]+"}":o(c)&&(n+=u(s)+":"+l(s,c)+";");else if(!Array.isArray(c)||"string"!=typeof c[0]||null!=t&&void 0!==t[c[0]]){var i=f(e,t,c);switch(s){case"animation":case"animationName":n+=u(s)+":"+i+";";break;default:n+=s+"{"+i+"}"}}else for(var d=0;d<c.length;d++)o(c[d])&&(n+=u(s)+":"+l(s,c[d])+";")}return n}(e,t,r);case"function":if(void 0!==e){var a=d,s=r(e);return d=a,f(e,t,s)}}if(null==t)return r;var c=t[r];return void 0!==c?c:r}var d,h=/label:\s*([^\s;\n{]+)\s*(;|$)/g;var p=function(e,t,r){if(1===e.length&&"object"==typeof e[0]&&null!==e[0]&&void 0!==e[0].styles)return e[0];var n=!0,a="";d=void 0;var s=e[0];null==s||void 0===s.raw?(n=!1,a+=f(r,t,s)):a+=s[0];for(var c=1;c<e.length;c++)a+=f(r,t,e[c]),n&&(a+=s[c]);h.lastIndex=0;for(var i,o="";null!==(i=h.exec(a));)o+="-"+i[1];var u=function(e){for(var t,r=0,n=0,a=e.length;a>=4;++n,a-=4)t=1540483477*(65535&(t=255&e.charCodeAt(n)|(255&e.charCodeAt(++n))<<8|(255&e.charCodeAt(++n))<<16|(255&e.charCodeAt(++n))<<24))+(59797*(t>>>16)<<16),r=1540483477*(65535&(t^=t>>>24))+(59797*(t>>>16)<<16)^1540483477*(65535&r)+(59797*(r>>>16)<<16);switch(a){case 3:r^=(255&e.charCodeAt(n+2))<<16;case 2:r^=(255&e.charCodeAt(n+1))<<8;case 1:r=1540483477*(65535&(r^=255&e.charCodeAt(n)))+(59797*(r>>>16)<<16)}return(((r=1540483477*(65535&(r^=r>>>13))+(59797*(r>>>16)<<16))^r>>>15)>>>0).toString(36)}(a)+o;return{name:u,styles:a,next:d}}},52422:(e,t,r)=>{r.d(t,{Rk:()=>n,SF:()=>a,sk:()=>s});function n(e,t,r){var n="";return r.split(" ").forEach((function(r){void 0!==e[r]?t.push(e[r]+";"):n+=r+" "})),n}var a=function(e,t,r){var n=e.key+"-"+t.name;!1===r&&void 0===e.registered[n]&&(e.registered[n]=t.styles)},s=function(e,t,r){a(e,t,r);var n=e.key+"-"+t.name;if(void 0===e.inserted[t.name]){var s=t;do{e.insert(t===s?"."+n:"",s,e.sheet,!0),s=s.next}while(void 0!==s)}}},20053:(e,t,r)=>{function n(e){var t,r,a="";if("string"==typeof e||"number"==typeof e)a+=e;else if("object"==typeof e)if(Array.isArray(e))for(t=0;t<e.length;t++)e[t]&&(r=n(e[t]))&&(a&&(a+=" "),a+=r);else for(t in e)e[t]&&(a&&(a+=" "),a+=t);return a}function a(){for(var e,t,r=0,a="";r<arguments.length;)(e=arguments[r++])&&(t=n(e))&&(a&&(a+=" "),a+=t);return a}r.r(t),r.d(t,{clsx:()=>a,default:()=>s});const s=a},41811:(e,t,r)=>{r.r(t),r.d(t,{default:()=>s});var n=Number.isNaN||function(e){return"number"==typeof e&&e!=e};function a(e,t){if(e.length!==t.length)return!1;for(var r=0;r<e.length;r++)if(a=e[r],s=t[r],!(a===s||n(a)&&n(s)))return!1;var a,s;return!0}function s(e,t){void 0===t&&(t=a);var r=null;function n(){for(var n=[],a=0;a<arguments.length;a++)n[a]=arguments[a];if(r&&r.lastThis===this&&t(n,r.lastArgs))return r.lastResult;var s=e.apply(this,n);return r={lastResult:s,lastArgs:n,lastThis:this},s}return n.clear=function(){r=null},n}},53654:(e,t,r)=>{r.d(t,{A:()=>n});const n={docRoot:"docRoot_UBD9",docsWrapper:"docsWrapper_hBAB"}}}]);