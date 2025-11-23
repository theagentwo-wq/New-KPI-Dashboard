import{L as Od,_ as Ld,C as Cc,r as mu,F as Bd,a as ee,g as _t,c as qd,d as xc,S as Ud,i as Dc,b as Vs,e as Gd,f as Kd}from"./index.esm2017-O9OTs5JD.js";var gu=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var je,Nc;(function(){var r;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function t(T,_){function y(){}y.prototype=_.prototype,T.D=_.prototype,T.prototype=new y,T.prototype.constructor=T,T.C=function(E,w,R){for(var p=Array(arguments.length-2),Xt=2;Xt<arguments.length;Xt++)p[Xt-2]=arguments[Xt];return _.prototype[w].apply(E,p)}}function e(){this.blockSize=-1}function n(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}t(n,e),n.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function s(T,_,y){y||(y=0);var E=Array(16);if(typeof _=="string")for(var w=0;16>w;++w)E[w]=_.charCodeAt(y++)|_.charCodeAt(y++)<<8|_.charCodeAt(y++)<<16|_.charCodeAt(y++)<<24;else for(w=0;16>w;++w)E[w]=_[y++]|_[y++]<<8|_[y++]<<16|_[y++]<<24;_=T.g[0],y=T.g[1],w=T.g[2];var R=T.g[3],p=_+(R^y&(w^R))+E[0]+3614090360&4294967295;_=y+(p<<7&4294967295|p>>>25),p=R+(w^_&(y^w))+E[1]+3905402710&4294967295,R=_+(p<<12&4294967295|p>>>20),p=w+(y^R&(_^y))+E[2]+606105819&4294967295,w=R+(p<<17&4294967295|p>>>15),p=y+(_^w&(R^_))+E[3]+3250441966&4294967295,y=w+(p<<22&4294967295|p>>>10),p=_+(R^y&(w^R))+E[4]+4118548399&4294967295,_=y+(p<<7&4294967295|p>>>25),p=R+(w^_&(y^w))+E[5]+1200080426&4294967295,R=_+(p<<12&4294967295|p>>>20),p=w+(y^R&(_^y))+E[6]+2821735955&4294967295,w=R+(p<<17&4294967295|p>>>15),p=y+(_^w&(R^_))+E[7]+4249261313&4294967295,y=w+(p<<22&4294967295|p>>>10),p=_+(R^y&(w^R))+E[8]+1770035416&4294967295,_=y+(p<<7&4294967295|p>>>25),p=R+(w^_&(y^w))+E[9]+2336552879&4294967295,R=_+(p<<12&4294967295|p>>>20),p=w+(y^R&(_^y))+E[10]+4294925233&4294967295,w=R+(p<<17&4294967295|p>>>15),p=y+(_^w&(R^_))+E[11]+2304563134&4294967295,y=w+(p<<22&4294967295|p>>>10),p=_+(R^y&(w^R))+E[12]+1804603682&4294967295,_=y+(p<<7&4294967295|p>>>25),p=R+(w^_&(y^w))+E[13]+4254626195&4294967295,R=_+(p<<12&4294967295|p>>>20),p=w+(y^R&(_^y))+E[14]+2792965006&4294967295,w=R+(p<<17&4294967295|p>>>15),p=y+(_^w&(R^_))+E[15]+1236535329&4294967295,y=w+(p<<22&4294967295|p>>>10),p=_+(w^R&(y^w))+E[1]+4129170786&4294967295,_=y+(p<<5&4294967295|p>>>27),p=R+(y^w&(_^y))+E[6]+3225465664&4294967295,R=_+(p<<9&4294967295|p>>>23),p=w+(_^y&(R^_))+E[11]+643717713&4294967295,w=R+(p<<14&4294967295|p>>>18),p=y+(R^_&(w^R))+E[0]+3921069994&4294967295,y=w+(p<<20&4294967295|p>>>12),p=_+(w^R&(y^w))+E[5]+3593408605&4294967295,_=y+(p<<5&4294967295|p>>>27),p=R+(y^w&(_^y))+E[10]+38016083&4294967295,R=_+(p<<9&4294967295|p>>>23),p=w+(_^y&(R^_))+E[15]+3634488961&4294967295,w=R+(p<<14&4294967295|p>>>18),p=y+(R^_&(w^R))+E[4]+3889429448&4294967295,y=w+(p<<20&4294967295|p>>>12),p=_+(w^R&(y^w))+E[9]+568446438&4294967295,_=y+(p<<5&4294967295|p>>>27),p=R+(y^w&(_^y))+E[14]+3275163606&4294967295,R=_+(p<<9&4294967295|p>>>23),p=w+(_^y&(R^_))+E[3]+4107603335&4294967295,w=R+(p<<14&4294967295|p>>>18),p=y+(R^_&(w^R))+E[8]+1163531501&4294967295,y=w+(p<<20&4294967295|p>>>12),p=_+(w^R&(y^w))+E[13]+2850285829&4294967295,_=y+(p<<5&4294967295|p>>>27),p=R+(y^w&(_^y))+E[2]+4243563512&4294967295,R=_+(p<<9&4294967295|p>>>23),p=w+(_^y&(R^_))+E[7]+1735328473&4294967295,w=R+(p<<14&4294967295|p>>>18),p=y+(R^_&(w^R))+E[12]+2368359562&4294967295,y=w+(p<<20&4294967295|p>>>12),p=_+(y^w^R)+E[5]+4294588738&4294967295,_=y+(p<<4&4294967295|p>>>28),p=R+(_^y^w)+E[8]+2272392833&4294967295,R=_+(p<<11&4294967295|p>>>21),p=w+(R^_^y)+E[11]+1839030562&4294967295,w=R+(p<<16&4294967295|p>>>16),p=y+(w^R^_)+E[14]+4259657740&4294967295,y=w+(p<<23&4294967295|p>>>9),p=_+(y^w^R)+E[1]+2763975236&4294967295,_=y+(p<<4&4294967295|p>>>28),p=R+(_^y^w)+E[4]+1272893353&4294967295,R=_+(p<<11&4294967295|p>>>21),p=w+(R^_^y)+E[7]+4139469664&4294967295,w=R+(p<<16&4294967295|p>>>16),p=y+(w^R^_)+E[10]+3200236656&4294967295,y=w+(p<<23&4294967295|p>>>9),p=_+(y^w^R)+E[13]+681279174&4294967295,_=y+(p<<4&4294967295|p>>>28),p=R+(_^y^w)+E[0]+3936430074&4294967295,R=_+(p<<11&4294967295|p>>>21),p=w+(R^_^y)+E[3]+3572445317&4294967295,w=R+(p<<16&4294967295|p>>>16),p=y+(w^R^_)+E[6]+76029189&4294967295,y=w+(p<<23&4294967295|p>>>9),p=_+(y^w^R)+E[9]+3654602809&4294967295,_=y+(p<<4&4294967295|p>>>28),p=R+(_^y^w)+E[12]+3873151461&4294967295,R=_+(p<<11&4294967295|p>>>21),p=w+(R^_^y)+E[15]+530742520&4294967295,w=R+(p<<16&4294967295|p>>>16),p=y+(w^R^_)+E[2]+3299628645&4294967295,y=w+(p<<23&4294967295|p>>>9),p=_+(w^(y|~R))+E[0]+4096336452&4294967295,_=y+(p<<6&4294967295|p>>>26),p=R+(y^(_|~w))+E[7]+1126891415&4294967295,R=_+(p<<10&4294967295|p>>>22),p=w+(_^(R|~y))+E[14]+2878612391&4294967295,w=R+(p<<15&4294967295|p>>>17),p=y+(R^(w|~_))+E[5]+4237533241&4294967295,y=w+(p<<21&4294967295|p>>>11),p=_+(w^(y|~R))+E[12]+1700485571&4294967295,_=y+(p<<6&4294967295|p>>>26),p=R+(y^(_|~w))+E[3]+2399980690&4294967295,R=_+(p<<10&4294967295|p>>>22),p=w+(_^(R|~y))+E[10]+4293915773&4294967295,w=R+(p<<15&4294967295|p>>>17),p=y+(R^(w|~_))+E[1]+2240044497&4294967295,y=w+(p<<21&4294967295|p>>>11),p=_+(w^(y|~R))+E[8]+1873313359&4294967295,_=y+(p<<6&4294967295|p>>>26),p=R+(y^(_|~w))+E[15]+4264355552&4294967295,R=_+(p<<10&4294967295|p>>>22),p=w+(_^(R|~y))+E[6]+2734768916&4294967295,w=R+(p<<15&4294967295|p>>>17),p=y+(R^(w|~_))+E[13]+1309151649&4294967295,y=w+(p<<21&4294967295|p>>>11),p=_+(w^(y|~R))+E[4]+4149444226&4294967295,_=y+(p<<6&4294967295|p>>>26),p=R+(y^(_|~w))+E[11]+3174756917&4294967295,R=_+(p<<10&4294967295|p>>>22),p=w+(_^(R|~y))+E[2]+718787259&4294967295,w=R+(p<<15&4294967295|p>>>17),p=y+(R^(w|~_))+E[9]+3951481745&4294967295,T.g[0]=T.g[0]+_&4294967295,T.g[1]=T.g[1]+(w+(p<<21&4294967295|p>>>11))&4294967295,T.g[2]=T.g[2]+w&4294967295,T.g[3]=T.g[3]+R&4294967295}n.prototype.u=function(T,_){_===void 0&&(_=T.length);for(var y=_-this.blockSize,E=this.B,w=this.h,R=0;R<_;){if(w==0)for(;R<=y;)s(this,T,R),R+=this.blockSize;if(typeof T=="string"){for(;R<_;)if(E[w++]=T.charCodeAt(R++),w==this.blockSize){s(this,E),w=0;break}}else for(;R<_;)if(E[w++]=T[R++],w==this.blockSize){s(this,E),w=0;break}}this.h=w,this.o+=_},n.prototype.v=function(){var T=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);T[0]=128;for(var _=1;_<T.length-8;++_)T[_]=0;var y=8*this.o;for(_=T.length-8;_<T.length;++_)T[_]=y&255,y/=256;for(this.u(T),T=Array(16),_=y=0;4>_;++_)for(var E=0;32>E;E+=8)T[y++]=this.g[_]>>>E&255;return T};function i(T,_){var y=u;return Object.prototype.hasOwnProperty.call(y,T)?y[T]:y[T]=_(T)}function a(T,_){this.h=_;for(var y=[],E=!0,w=T.length-1;0<=w;w--){var R=T[w]|0;E&&R==_||(y[w]=R,E=!1)}this.g=y}var u={};function l(T){return-128<=T&&128>T?i(T,function(_){return new a([_|0],0>_?-1:0)}):new a([T|0],0>T?-1:0)}function d(T){if(isNaN(T)||!isFinite(T))return g;if(0>T)return D(d(-T));for(var _=[],y=1,E=0;T>=y;E++)_[E]=T/y|0,y*=4294967296;return new a(_,0)}function f(T,_){if(T.length==0)throw Error("number format error: empty string");if(_=_||10,2>_||36<_)throw Error("radix out of range: "+_);if(T.charAt(0)=="-")return D(f(T.substring(1),_));if(0<=T.indexOf("-"))throw Error('number format error: interior "-" character');for(var y=d(Math.pow(_,8)),E=g,w=0;w<T.length;w+=8){var R=Math.min(8,T.length-w),p=parseInt(T.substring(w,w+R),_);8>R?(R=d(Math.pow(_,R)),E=E.j(R).add(d(p))):(E=E.j(y),E=E.add(d(p)))}return E}var g=l(0),I=l(1),P=l(16777216);r=a.prototype,r.m=function(){if(N(this))return-D(this).m();for(var T=0,_=1,y=0;y<this.g.length;y++){var E=this.i(y);T+=(0<=E?E:4294967296+E)*_,_*=4294967296}return T},r.toString=function(T){if(T=T||10,2>T||36<T)throw Error("radix out of range: "+T);if(x(this))return"0";if(N(this))return"-"+D(this).toString(T);for(var _=d(Math.pow(T,6)),y=this,E="";;){var w=Y(y,_).g;y=U(y,w.j(_));var R=((0<y.g.length?y.g[0]:y.h)>>>0).toString(T);if(y=w,x(y))return R+E;for(;6>R.length;)R="0"+R;E=R+E}},r.i=function(T){return 0>T?0:T<this.g.length?this.g[T]:this.h};function x(T){if(T.h!=0)return!1;for(var _=0;_<T.g.length;_++)if(T.g[_]!=0)return!1;return!0}function N(T){return T.h==-1}r.l=function(T){return T=U(this,T),N(T)?-1:x(T)?0:1};function D(T){for(var _=T.g.length,y=[],E=0;E<_;E++)y[E]=~T.g[E];return new a(y,~T.h).add(I)}r.abs=function(){return N(this)?D(this):this},r.add=function(T){for(var _=Math.max(this.g.length,T.g.length),y=[],E=0,w=0;w<=_;w++){var R=E+(this.i(w)&65535)+(T.i(w)&65535),p=(R>>>16)+(this.i(w)>>>16)+(T.i(w)>>>16);E=p>>>16,R&=65535,p&=65535,y[w]=p<<16|R}return new a(y,y[y.length-1]&-2147483648?-1:0)};function U(T,_){return T.add(D(_))}r.j=function(T){if(x(this)||x(T))return g;if(N(this))return N(T)?D(this).j(D(T)):D(D(this).j(T));if(N(T))return D(this.j(D(T)));if(0>this.l(P)&&0>T.l(P))return d(this.m()*T.m());for(var _=this.g.length+T.g.length,y=[],E=0;E<2*_;E++)y[E]=0;for(E=0;E<this.g.length;E++)for(var w=0;w<T.g.length;w++){var R=this.i(E)>>>16,p=this.i(E)&65535,Xt=T.i(w)>>>16,Gn=T.i(w)&65535;y[2*E+2*w]+=p*Gn,K(y,2*E+2*w),y[2*E+2*w+1]+=R*Gn,K(y,2*E+2*w+1),y[2*E+2*w+1]+=p*Xt,K(y,2*E+2*w+1),y[2*E+2*w+2]+=R*Xt,K(y,2*E+2*w+2)}for(E=0;E<_;E++)y[E]=y[2*E+1]<<16|y[2*E];for(E=_;E<2*_;E++)y[E]=0;return new a(y,0)};function K(T,_){for(;(T[_]&65535)!=T[_];)T[_+1]+=T[_]>>>16,T[_]&=65535,_++}function q(T,_){this.g=T,this.h=_}function Y(T,_){if(x(_))throw Error("division by zero");if(x(T))return new q(g,g);if(N(T))return _=Y(D(T),_),new q(D(_.g),D(_.h));if(N(_))return _=Y(T,D(_)),new q(D(_.g),_.h);if(30<T.g.length){if(N(T)||N(_))throw Error("slowDivide_ only works with positive integers.");for(var y=I,E=_;0>=E.l(T);)y=et(y),E=et(E);var w=W(y,1),R=W(E,1);for(E=W(E,2),y=W(y,2);!x(E);){var p=R.add(E);0>=p.l(T)&&(w=w.add(y),R=p),E=W(E,1),y=W(y,1)}return _=U(T,w.j(_)),new q(w,_)}for(w=g;0<=T.l(_);){for(y=Math.max(1,Math.floor(T.m()/_.m())),E=Math.ceil(Math.log(y)/Math.LN2),E=48>=E?1:Math.pow(2,E-48),R=d(y),p=R.j(_);N(p)||0<p.l(T);)y-=E,R=d(y),p=R.j(_);x(R)&&(R=I),w=w.add(R),T=U(T,p)}return new q(w,T)}r.A=function(T){return Y(this,T).h},r.and=function(T){for(var _=Math.max(this.g.length,T.g.length),y=[],E=0;E<_;E++)y[E]=this.i(E)&T.i(E);return new a(y,this.h&T.h)},r.or=function(T){for(var _=Math.max(this.g.length,T.g.length),y=[],E=0;E<_;E++)y[E]=this.i(E)|T.i(E);return new a(y,this.h|T.h)},r.xor=function(T){for(var _=Math.max(this.g.length,T.g.length),y=[],E=0;E<_;E++)y[E]=this.i(E)^T.i(E);return new a(y,this.h^T.h)};function et(T){for(var _=T.g.length+1,y=[],E=0;E<_;E++)y[E]=T.i(E)<<1|T.i(E-1)>>>31;return new a(y,T.h)}function W(T,_){var y=_>>5;_%=32;for(var E=T.g.length-y,w=[],R=0;R<E;R++)w[R]=0<_?T.i(R+y)>>>_|T.i(R+y+1)<<32-_:T.i(R+y);return new a(w,T.h)}n.prototype.digest=n.prototype.v,n.prototype.reset=n.prototype.s,n.prototype.update=n.prototype.u,Nc=n,a.prototype.add=a.prototype.add,a.prototype.multiply=a.prototype.j,a.prototype.modulo=a.prototype.A,a.prototype.compare=a.prototype.l,a.prototype.toNumber=a.prototype.m,a.prototype.toString=a.prototype.toString,a.prototype.getBits=a.prototype.i,a.fromNumber=d,a.fromString=f,je=a}).apply(typeof gu<"u"?gu:typeof self<"u"?self:typeof window<"u"?window:{});var fs=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var kc,lr,Fc,Is,qi,Mc,Oc,Lc;(function(){var r,t=typeof Object.defineProperties=="function"?Object.defineProperty:function(o,c,h){return o==Array.prototype||o==Object.prototype||(o[c]=h.value),o};function e(o){o=[typeof globalThis=="object"&&globalThis,o,typeof window=="object"&&window,typeof self=="object"&&self,typeof fs=="object"&&fs];for(var c=0;c<o.length;++c){var h=o[c];if(h&&h.Math==Math)return h}throw Error("Cannot find global object")}var n=e(this);function s(o,c){if(c)t:{var h=n;o=o.split(".");for(var m=0;m<o.length-1;m++){var v=o[m];if(!(v in h))break t;h=h[v]}o=o[o.length-1],m=h[o],c=c(m),c!=m&&c!=null&&t(h,o,{configurable:!0,writable:!0,value:c})}}function i(o,c){o instanceof String&&(o+="");var h=0,m=!1,v={next:function(){if(!m&&h<o.length){var S=h++;return{value:c(S,o[S]),done:!1}}return m=!0,{done:!0,value:void 0}}};return v[Symbol.iterator]=function(){return v},v}s("Array.prototype.values",function(o){return o||function(){return i(this,function(c,h){return h})}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var a=a||{},u=this||self;function l(o){var c=typeof o;return c=c!="object"?c:o?Array.isArray(o)?"array":c:"null",c=="array"||c=="object"&&typeof o.length=="number"}function d(o){var c=typeof o;return c=="object"&&o!=null||c=="function"}function f(o,c,h){return o.call.apply(o.bind,arguments)}function g(o,c,h){if(!o)throw Error();if(2<arguments.length){var m=Array.prototype.slice.call(arguments,2);return function(){var v=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(v,m),o.apply(c,v)}}return function(){return o.apply(c,arguments)}}function I(o,c,h){return I=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?f:g,I.apply(null,arguments)}function P(o,c){var h=Array.prototype.slice.call(arguments,1);return function(){var m=h.slice();return m.push.apply(m,arguments),o.apply(this,m)}}function x(o,c){function h(){}h.prototype=c.prototype,o.aa=c.prototype,o.prototype=new h,o.prototype.constructor=o,o.Qb=function(m,v,S){for(var k=Array(arguments.length-2),tt=2;tt<arguments.length;tt++)k[tt-2]=arguments[tt];return c.prototype[v].apply(m,k)}}function N(o){const c=o.length;if(0<c){const h=Array(c);for(let m=0;m<c;m++)h[m]=o[m];return h}return[]}function D(o,c){for(let h=1;h<arguments.length;h++){const m=arguments[h];if(l(m)){const v=o.length||0,S=m.length||0;o.length=v+S;for(let k=0;k<S;k++)o[v+k]=m[k]}else o.push(m)}}class U{constructor(c,h){this.i=c,this.j=h,this.h=0,this.g=null}get(){let c;return 0<this.h?(this.h--,c=this.g,this.g=c.next,c.next=null):c=this.i(),c}}function K(o){return/^[\s\xa0]*$/.test(o)}function q(){var o=u.navigator;return o&&(o=o.userAgent)?o:""}function Y(o){return Y[" "](o),o}Y[" "]=function(){};var et=q().indexOf("Gecko")!=-1&&!(q().toLowerCase().indexOf("webkit")!=-1&&q().indexOf("Edge")==-1)&&!(q().indexOf("Trident")!=-1||q().indexOf("MSIE")!=-1)&&q().indexOf("Edge")==-1;function W(o,c,h){for(const m in o)c.call(h,o[m],m,o)}function T(o,c){for(const h in o)c.call(void 0,o[h],h,o)}function _(o){const c={};for(const h in o)c[h]=o[h];return c}const y="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function E(o,c){let h,m;for(let v=1;v<arguments.length;v++){m=arguments[v];for(h in m)o[h]=m[h];for(let S=0;S<y.length;S++)h=y[S],Object.prototype.hasOwnProperty.call(m,h)&&(o[h]=m[h])}}function w(o){var c=1;o=o.split(":");const h=[];for(;0<c&&o.length;)h.push(o.shift()),c--;return o.length&&h.push(o.join(":")),h}function R(o){u.setTimeout(()=>{throw o},0)}function p(){var o=li;let c=null;return o.g&&(c=o.g,o.g=o.g.next,o.g||(o.h=null),c.next=null),c}class Xt{constructor(){this.h=this.g=null}add(c,h){const m=Gn.get();m.set(c,h),this.h?this.h.next=m:this.g=m,this.h=m}}var Gn=new U(()=>new nd,o=>o.reset());class nd{constructor(){this.next=this.g=this.h=null}set(c,h){this.h=c,this.g=h,this.next=null}reset(){this.next=this.g=this.h=null}}let Kn,jn=!1,li=new Xt,ma=()=>{const o=u.Promise.resolve(void 0);Kn=()=>{o.then(rd)}};var rd=()=>{for(var o;o=p();){try{o.h.call(o.g)}catch(h){R(h)}var c=Gn;c.j(o),100>c.h&&(c.h++,o.next=c.g,c.g=o)}jn=!1};function ue(){this.s=this.s,this.C=this.C}ue.prototype.s=!1,ue.prototype.ma=function(){this.s||(this.s=!0,this.N())},ue.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function At(o,c){this.type=o,this.g=this.target=c,this.defaultPrevented=!1}At.prototype.h=function(){this.defaultPrevented=!0};var sd=function(){if(!u.addEventListener||!Object.defineProperty)return!1;var o=!1,c=Object.defineProperty({},"passive",{get:function(){o=!0}});try{const h=()=>{};u.addEventListener("test",h,c),u.removeEventListener("test",h,c)}catch{}return o}();function zn(o,c){if(At.call(this,o?o.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,o){var h=this.type=o.type,m=o.changedTouches&&o.changedTouches.length?o.changedTouches[0]:null;if(this.target=o.target||o.srcElement,this.g=c,c=o.relatedTarget){if(et){t:{try{Y(c.nodeName);var v=!0;break t}catch{}v=!1}v||(c=null)}}else h=="mouseover"?c=o.fromElement:h=="mouseout"&&(c=o.toElement);this.relatedTarget=c,m?(this.clientX=m.clientX!==void 0?m.clientX:m.pageX,this.clientY=m.clientY!==void 0?m.clientY:m.pageY,this.screenX=m.screenX||0,this.screenY=m.screenY||0):(this.clientX=o.clientX!==void 0?o.clientX:o.pageX,this.clientY=o.clientY!==void 0?o.clientY:o.pageY,this.screenX=o.screenX||0,this.screenY=o.screenY||0),this.button=o.button,this.key=o.key||"",this.ctrlKey=o.ctrlKey,this.altKey=o.altKey,this.shiftKey=o.shiftKey,this.metaKey=o.metaKey,this.pointerId=o.pointerId||0,this.pointerType=typeof o.pointerType=="string"?o.pointerType:id[o.pointerType]||"",this.state=o.state,this.i=o,o.defaultPrevented&&zn.aa.h.call(this)}}x(zn,At);var id={2:"touch",3:"pen",4:"mouse"};zn.prototype.h=function(){zn.aa.h.call(this);var o=this.i;o.preventDefault?o.preventDefault():o.returnValue=!1};var Wr="closure_listenable_"+(1e6*Math.random()|0),od=0;function ad(o,c,h,m,v){this.listener=o,this.proxy=null,this.src=c,this.type=h,this.capture=!!m,this.ha=v,this.key=++od,this.da=this.fa=!1}function Hr(o){o.da=!0,o.listener=null,o.proxy=null,o.src=null,o.ha=null}function Jr(o){this.src=o,this.g={},this.h=0}Jr.prototype.add=function(o,c,h,m,v){var S=o.toString();o=this.g[S],o||(o=this.g[S]=[],this.h++);var k=di(o,c,m,v);return-1<k?(c=o[k],h||(c.fa=!1)):(c=new ad(c,this.src,S,!!m,v),c.fa=h,o.push(c)),c};function hi(o,c){var h=c.type;if(h in o.g){var m=o.g[h],v=Array.prototype.indexOf.call(m,c,void 0),S;(S=0<=v)&&Array.prototype.splice.call(m,v,1),S&&(Hr(c),o.g[h].length==0&&(delete o.g[h],o.h--))}}function di(o,c,h,m){for(var v=0;v<o.length;++v){var S=o[v];if(!S.da&&S.listener==c&&S.capture==!!h&&S.ha==m)return v}return-1}var fi="closure_lm_"+(1e6*Math.random()|0),mi={};function ga(o,c,h,m,v){if(Array.isArray(c)){for(var S=0;S<c.length;S++)ga(o,c[S],h,m,v);return null}return h=ya(h),o&&o[Wr]?o.K(c,h,d(m)?!!m.capture:!1,v):ud(o,c,h,!1,m,v)}function ud(o,c,h,m,v,S){if(!c)throw Error("Invalid event type");var k=d(v)?!!v.capture:!!v,tt=_i(o);if(tt||(o[fi]=tt=new Jr(o)),h=tt.add(c,h,m,k,S),h.proxy)return h;if(m=cd(),h.proxy=m,m.src=o,m.listener=h,o.addEventListener)sd||(v=k),v===void 0&&(v=!1),o.addEventListener(c.toString(),m,v);else if(o.attachEvent)o.attachEvent(pa(c.toString()),m);else if(o.addListener&&o.removeListener)o.addListener(m);else throw Error("addEventListener and attachEvent are unavailable.");return h}function cd(){function o(h){return c.call(o.src,o.listener,h)}const c=ld;return o}function _a(o,c,h,m,v){if(Array.isArray(c))for(var S=0;S<c.length;S++)_a(o,c[S],h,m,v);else m=d(m)?!!m.capture:!!m,h=ya(h),o&&o[Wr]?(o=o.i,c=String(c).toString(),c in o.g&&(S=o.g[c],h=di(S,h,m,v),-1<h&&(Hr(S[h]),Array.prototype.splice.call(S,h,1),S.length==0&&(delete o.g[c],o.h--)))):o&&(o=_i(o))&&(c=o.g[c.toString()],o=-1,c&&(o=di(c,h,m,v)),(h=-1<o?c[o]:null)&&gi(h))}function gi(o){if(typeof o!="number"&&o&&!o.da){var c=o.src;if(c&&c[Wr])hi(c.i,o);else{var h=o.type,m=o.proxy;c.removeEventListener?c.removeEventListener(h,m,o.capture):c.detachEvent?c.detachEvent(pa(h),m):c.addListener&&c.removeListener&&c.removeListener(m),(h=_i(c))?(hi(h,o),h.h==0&&(h.src=null,c[fi]=null)):Hr(o)}}}function pa(o){return o in mi?mi[o]:mi[o]="on"+o}function ld(o,c){if(o.da)o=!0;else{c=new zn(c,this);var h=o.listener,m=o.ha||o.src;o.fa&&gi(o),o=h.call(m,c)}return o}function _i(o){return o=o[fi],o instanceof Jr?o:null}var pi="__closure_events_fn_"+(1e9*Math.random()>>>0);function ya(o){return typeof o=="function"?o:(o[pi]||(o[pi]=function(c){return o.handleEvent(c)}),o[pi])}function Rt(){ue.call(this),this.i=new Jr(this),this.M=this,this.F=null}x(Rt,ue),Rt.prototype[Wr]=!0,Rt.prototype.removeEventListener=function(o,c,h,m){_a(this,o,c,h,m)};function Ct(o,c){var h,m=o.F;if(m)for(h=[];m;m=m.F)h.push(m);if(o=o.M,m=c.type||c,typeof c=="string")c=new At(c,o);else if(c instanceof At)c.target=c.target||o;else{var v=c;c=new At(m,o),E(c,v)}if(v=!0,h)for(var S=h.length-1;0<=S;S--){var k=c.g=h[S];v=Yr(k,m,!0,c)&&v}if(k=c.g=o,v=Yr(k,m,!0,c)&&v,v=Yr(k,m,!1,c)&&v,h)for(S=0;S<h.length;S++)k=c.g=h[S],v=Yr(k,m,!1,c)&&v}Rt.prototype.N=function(){if(Rt.aa.N.call(this),this.i){var o=this.i,c;for(c in o.g){for(var h=o.g[c],m=0;m<h.length;m++)Hr(h[m]);delete o.g[c],o.h--}}this.F=null},Rt.prototype.K=function(o,c,h,m){return this.i.add(String(o),c,!1,h,m)},Rt.prototype.L=function(o,c,h,m){return this.i.add(String(o),c,!0,h,m)};function Yr(o,c,h,m){if(c=o.i.g[String(c)],!c)return!0;c=c.concat();for(var v=!0,S=0;S<c.length;++S){var k=c[S];if(k&&!k.da&&k.capture==h){var tt=k.listener,Tt=k.ha||k.src;k.fa&&hi(o.i,k),v=tt.call(Tt,m)!==!1&&v}}return v&&!m.defaultPrevented}function Ia(o,c,h){if(typeof o=="function")h&&(o=I(o,h));else if(o&&typeof o.handleEvent=="function")o=I(o.handleEvent,o);else throw Error("Invalid listener argument");return 2147483647<Number(c)?-1:u.setTimeout(o,c||0)}function Ta(o){o.g=Ia(()=>{o.g=null,o.i&&(o.i=!1,Ta(o))},o.l);const c=o.h;o.h=null,o.m.apply(null,c)}class hd extends ue{constructor(c,h){super(),this.m=c,this.l=h,this.h=null,this.i=!1,this.g=null}j(c){this.h=arguments,this.g?this.i=!0:Ta(this)}N(){super.N(),this.g&&(u.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function Qn(o){ue.call(this),this.h=o,this.g={}}x(Qn,ue);var Ea=[];function wa(o){W(o.g,function(c,h){this.g.hasOwnProperty(h)&&gi(c)},o),o.g={}}Qn.prototype.N=function(){Qn.aa.N.call(this),wa(this)},Qn.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var yi=u.JSON.stringify,dd=u.JSON.parse,fd=class{stringify(o){return u.JSON.stringify(o,void 0)}parse(o){return u.JSON.parse(o,void 0)}};function Ii(){}Ii.prototype.h=null;function va(o){return o.h||(o.h=o.i())}function Aa(){}var $n={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function Ti(){At.call(this,"d")}x(Ti,At);function Ei(){At.call(this,"c")}x(Ei,At);var xe={},Ra=null;function Xr(){return Ra=Ra||new Rt}xe.La="serverreachability";function Pa(o){At.call(this,xe.La,o)}x(Pa,At);function Wn(o){const c=Xr();Ct(c,new Pa(c))}xe.STAT_EVENT="statevent";function Va(o,c){At.call(this,xe.STAT_EVENT,o),this.stat=c}x(Va,At);function xt(o){const c=Xr();Ct(c,new Va(c,o))}xe.Ma="timingevent";function Sa(o,c){At.call(this,xe.Ma,o),this.size=c}x(Sa,At);function Hn(o,c){if(typeof o!="function")throw Error("Fn must not be null and must be a function");return u.setTimeout(function(){o()},c)}function Jn(){this.g=!0}Jn.prototype.xa=function(){this.g=!1};function md(o,c,h,m,v,S){o.info(function(){if(o.g)if(S)for(var k="",tt=S.split("&"),Tt=0;Tt<tt.length;Tt++){var H=tt[Tt].split("=");if(1<H.length){var Pt=H[0];H=H[1];var Vt=Pt.split("_");k=2<=Vt.length&&Vt[1]=="type"?k+(Pt+"="+H+"&"):k+(Pt+"=redacted&")}}else k=null;else k=S;return"XMLHTTP REQ ("+m+") [attempt "+v+"]: "+c+`
`+h+`
`+k})}function gd(o,c,h,m,v,S,k){o.info(function(){return"XMLHTTP RESP ("+m+") [ attempt "+v+"]: "+c+`
`+h+`
`+S+" "+k})}function on(o,c,h,m){o.info(function(){return"XMLHTTP TEXT ("+c+"): "+pd(o,h)+(m?" "+m:"")})}function _d(o,c){o.info(function(){return"TIMEOUT: "+c})}Jn.prototype.info=function(){};function pd(o,c){if(!o.g)return c;if(!c)return null;try{var h=JSON.parse(c);if(h){for(o=0;o<h.length;o++)if(Array.isArray(h[o])){var m=h[o];if(!(2>m.length)){var v=m[1];if(Array.isArray(v)&&!(1>v.length)){var S=v[0];if(S!="noop"&&S!="stop"&&S!="close")for(var k=1;k<v.length;k++)v[k]=""}}}}return yi(h)}catch{return c}}var Zr={NO_ERROR:0,gb:1,tb:2,sb:3,nb:4,rb:5,ub:6,Ia:7,TIMEOUT:8,xb:9},ba={lb:"complete",Hb:"success",Ja:"error",Ia:"abort",zb:"ready",Ab:"readystatechange",TIMEOUT:"timeout",vb:"incrementaldata",yb:"progress",ob:"downloadprogress",Pb:"uploadprogress"},wi;function ts(){}x(ts,Ii),ts.prototype.g=function(){return new XMLHttpRequest},ts.prototype.i=function(){return{}},wi=new ts;function ce(o,c,h,m){this.j=o,this.i=c,this.l=h,this.R=m||1,this.U=new Qn(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new Ca}function Ca(){this.i=null,this.g="",this.h=!1}var xa={},vi={};function Ai(o,c,h){o.L=1,o.v=ss(Zt(c)),o.m=h,o.P=!0,Da(o,null)}function Da(o,c){o.F=Date.now(),es(o),o.A=Zt(o.v);var h=o.A,m=o.R;Array.isArray(m)||(m=[String(m)]),Qa(h.i,"t",m),o.C=0,h=o.j.J,o.h=new Ca,o.g=lu(o.j,h?c:null,!o.m),0<o.O&&(o.M=new hd(I(o.Y,o,o.g),o.O)),c=o.U,h=o.g,m=o.ca;var v="readystatechange";Array.isArray(v)||(v&&(Ea[0]=v.toString()),v=Ea);for(var S=0;S<v.length;S++){var k=ga(h,v[S],m||c.handleEvent,!1,c.h||c);if(!k)break;c.g[k.key]=k}c=o.H?_(o.H):{},o.m?(o.u||(o.u="POST"),c["Content-Type"]="application/x-www-form-urlencoded",o.g.ea(o.A,o.u,o.m,c)):(o.u="GET",o.g.ea(o.A,o.u,null,c)),Wn(),md(o.i,o.u,o.A,o.l,o.R,o.m)}ce.prototype.ca=function(o){o=o.target;const c=this.M;c&&te(o)==3?c.j():this.Y(o)},ce.prototype.Y=function(o){try{if(o==this.g)t:{const Vt=te(this.g);var c=this.g.Ba();const cn=this.g.Z();if(!(3>Vt)&&(Vt!=3||this.g&&(this.h.h||this.g.oa()||Za(this.g)))){this.J||Vt!=4||c==7||(c==8||0>=cn?Wn(3):Wn(2)),Ri(this);var h=this.g.Z();this.X=h;e:if(Na(this)){var m=Za(this.g);o="";var v=m.length,S=te(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){De(this),Yn(this);var k="";break e}this.h.i=new u.TextDecoder}for(c=0;c<v;c++)this.h.h=!0,o+=this.h.i.decode(m[c],{stream:!(S&&c==v-1)});m.length=0,this.h.g+=o,this.C=0,k=this.h.g}else k=this.g.oa();if(this.o=h==200,gd(this.i,this.u,this.A,this.l,this.R,Vt,h),this.o){if(this.T&&!this.K){e:{if(this.g){var tt,Tt=this.g;if((tt=Tt.g?Tt.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!K(tt)){var H=tt;break e}}H=null}if(h=H)on(this.i,this.l,h,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,Pi(this,h);else{this.o=!1,this.s=3,xt(12),De(this),Yn(this);break t}}if(this.P){h=!0;let jt;for(;!this.J&&this.C<k.length;)if(jt=yd(this,k),jt==vi){Vt==4&&(this.s=4,xt(14),h=!1),on(this.i,this.l,null,"[Incomplete Response]");break}else if(jt==xa){this.s=4,xt(15),on(this.i,this.l,k,"[Invalid Chunk]"),h=!1;break}else on(this.i,this.l,jt,null),Pi(this,jt);if(Na(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),Vt!=4||k.length!=0||this.h.h||(this.s=1,xt(16),h=!1),this.o=this.o&&h,!h)on(this.i,this.l,k,"[Invalid Chunked Response]"),De(this),Yn(this);else if(0<k.length&&!this.W){this.W=!0;var Pt=this.j;Pt.g==this&&Pt.ba&&!Pt.M&&(Pt.j.info("Great, no buffering proxy detected. Bytes received: "+k.length),Di(Pt),Pt.M=!0,xt(11))}}else on(this.i,this.l,k,null),Pi(this,k);Vt==4&&De(this),this.o&&!this.J&&(Vt==4?ou(this.j,this):(this.o=!1,es(this)))}else Fd(this.g),h==400&&0<k.indexOf("Unknown SID")?(this.s=3,xt(12)):(this.s=0,xt(13)),De(this),Yn(this)}}}catch{}finally{}};function Na(o){return o.g?o.u=="GET"&&o.L!=2&&o.j.Ca:!1}function yd(o,c){var h=o.C,m=c.indexOf(`
`,h);return m==-1?vi:(h=Number(c.substring(h,m)),isNaN(h)?xa:(m+=1,m+h>c.length?vi:(c=c.slice(m,m+h),o.C=m+h,c)))}ce.prototype.cancel=function(){this.J=!0,De(this)};function es(o){o.S=Date.now()+o.I,ka(o,o.I)}function ka(o,c){if(o.B!=null)throw Error("WatchDog timer not null");o.B=Hn(I(o.ba,o),c)}function Ri(o){o.B&&(u.clearTimeout(o.B),o.B=null)}ce.prototype.ba=function(){this.B=null;const o=Date.now();0<=o-this.S?(_d(this.i,this.A),this.L!=2&&(Wn(),xt(17)),De(this),this.s=2,Yn(this)):ka(this,this.S-o)};function Yn(o){o.j.G==0||o.J||ou(o.j,o)}function De(o){Ri(o);var c=o.M;c&&typeof c.ma=="function"&&c.ma(),o.M=null,wa(o.U),o.g&&(c=o.g,o.g=null,c.abort(),c.ma())}function Pi(o,c){try{var h=o.j;if(h.G!=0&&(h.g==o||Vi(h.h,o))){if(!o.K&&Vi(h.h,o)&&h.G==3){try{var m=h.Da.g.parse(c)}catch{m=null}if(Array.isArray(m)&&m.length==3){var v=m;if(v[0]==0){t:if(!h.u){if(h.g)if(h.g.F+3e3<o.F)ls(h),us(h);else break t;xi(h),xt(18)}}else h.za=v[1],0<h.za-h.T&&37500>v[2]&&h.F&&h.v==0&&!h.C&&(h.C=Hn(I(h.Za,h),6e3));if(1>=Oa(h.h)&&h.ca){try{h.ca()}catch{}h.ca=void 0}}else ke(h,11)}else if((o.K||h.g==o)&&ls(h),!K(c))for(v=h.Da.g.parse(c),c=0;c<v.length;c++){let H=v[c];if(h.T=H[0],H=H[1],h.G==2)if(H[0]=="c"){h.K=H[1],h.ia=H[2];const Pt=H[3];Pt!=null&&(h.la=Pt,h.j.info("VER="+h.la));const Vt=H[4];Vt!=null&&(h.Aa=Vt,h.j.info("SVER="+h.Aa));const cn=H[5];cn!=null&&typeof cn=="number"&&0<cn&&(m=1.5*cn,h.L=m,h.j.info("backChannelRequestTimeoutMs_="+m)),m=h;const jt=o.g;if(jt){const ds=jt.g?jt.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(ds){var S=m.h;S.g||ds.indexOf("spdy")==-1&&ds.indexOf("quic")==-1&&ds.indexOf("h2")==-1||(S.j=S.l,S.g=new Set,S.h&&(Si(S,S.h),S.h=null))}if(m.D){const Ni=jt.g?jt.g.getResponseHeader("X-HTTP-Session-Id"):null;Ni&&(m.ya=Ni,rt(m.I,m.D,Ni))}}h.G=3,h.l&&h.l.ua(),h.ba&&(h.R=Date.now()-o.F,h.j.info("Handshake RTT: "+h.R+"ms")),m=h;var k=o;if(m.qa=cu(m,m.J?m.ia:null,m.W),k.K){La(m.h,k);var tt=k,Tt=m.L;Tt&&(tt.I=Tt),tt.B&&(Ri(tt),es(tt)),m.g=k}else su(m);0<h.i.length&&cs(h)}else H[0]!="stop"&&H[0]!="close"||ke(h,7);else h.G==3&&(H[0]=="stop"||H[0]=="close"?H[0]=="stop"?ke(h,7):Ci(h):H[0]!="noop"&&h.l&&h.l.ta(H),h.v=0)}}Wn(4)}catch{}}var Id=class{constructor(o,c){this.g=o,this.map=c}};function Fa(o){this.l=o||10,u.PerformanceNavigationTiming?(o=u.performance.getEntriesByType("navigation"),o=0<o.length&&(o[0].nextHopProtocol=="hq"||o[0].nextHopProtocol=="h2")):o=!!(u.chrome&&u.chrome.loadTimes&&u.chrome.loadTimes()&&u.chrome.loadTimes().wasFetchedViaSpdy),this.j=o?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function Ma(o){return o.h?!0:o.g?o.g.size>=o.j:!1}function Oa(o){return o.h?1:o.g?o.g.size:0}function Vi(o,c){return o.h?o.h==c:o.g?o.g.has(c):!1}function Si(o,c){o.g?o.g.add(c):o.h=c}function La(o,c){o.h&&o.h==c?o.h=null:o.g&&o.g.has(c)&&o.g.delete(c)}Fa.prototype.cancel=function(){if(this.i=Ba(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const o of this.g.values())o.cancel();this.g.clear()}};function Ba(o){if(o.h!=null)return o.i.concat(o.h.D);if(o.g!=null&&o.g.size!==0){let c=o.i;for(const h of o.g.values())c=c.concat(h.D);return c}return N(o.i)}function Td(o){if(o.V&&typeof o.V=="function")return o.V();if(typeof Map<"u"&&o instanceof Map||typeof Set<"u"&&o instanceof Set)return Array.from(o.values());if(typeof o=="string")return o.split("");if(l(o)){for(var c=[],h=o.length,m=0;m<h;m++)c.push(o[m]);return c}c=[],h=0;for(m in o)c[h++]=o[m];return c}function Ed(o){if(o.na&&typeof o.na=="function")return o.na();if(!o.V||typeof o.V!="function"){if(typeof Map<"u"&&o instanceof Map)return Array.from(o.keys());if(!(typeof Set<"u"&&o instanceof Set)){if(l(o)||typeof o=="string"){var c=[];o=o.length;for(var h=0;h<o;h++)c.push(h);return c}c=[],h=0;for(const m in o)c[h++]=m;return c}}}function qa(o,c){if(o.forEach&&typeof o.forEach=="function")o.forEach(c,void 0);else if(l(o)||typeof o=="string")Array.prototype.forEach.call(o,c,void 0);else for(var h=Ed(o),m=Td(o),v=m.length,S=0;S<v;S++)c.call(void 0,m[S],h&&h[S],o)}var Ua=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function wd(o,c){if(o){o=o.split("&");for(var h=0;h<o.length;h++){var m=o[h].indexOf("="),v=null;if(0<=m){var S=o[h].substring(0,m);v=o[h].substring(m+1)}else S=o[h];c(S,v?decodeURIComponent(v.replace(/\+/g," ")):"")}}}function Ne(o){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,o instanceof Ne){this.h=o.h,ns(this,o.j),this.o=o.o,this.g=o.g,rs(this,o.s),this.l=o.l;var c=o.i,h=new tr;h.i=c.i,c.g&&(h.g=new Map(c.g),h.h=c.h),Ga(this,h),this.m=o.m}else o&&(c=String(o).match(Ua))?(this.h=!1,ns(this,c[1]||"",!0),this.o=Xn(c[2]||""),this.g=Xn(c[3]||"",!0),rs(this,c[4]),this.l=Xn(c[5]||"",!0),Ga(this,c[6]||"",!0),this.m=Xn(c[7]||"")):(this.h=!1,this.i=new tr(null,this.h))}Ne.prototype.toString=function(){var o=[],c=this.j;c&&o.push(Zn(c,Ka,!0),":");var h=this.g;return(h||c=="file")&&(o.push("//"),(c=this.o)&&o.push(Zn(c,Ka,!0),"@"),o.push(encodeURIComponent(String(h)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),h=this.s,h!=null&&o.push(":",String(h))),(h=this.l)&&(this.g&&h.charAt(0)!="/"&&o.push("/"),o.push(Zn(h,h.charAt(0)=="/"?Rd:Ad,!0))),(h=this.i.toString())&&o.push("?",h),(h=this.m)&&o.push("#",Zn(h,Vd)),o.join("")};function Zt(o){return new Ne(o)}function ns(o,c,h){o.j=h?Xn(c,!0):c,o.j&&(o.j=o.j.replace(/:$/,""))}function rs(o,c){if(c){if(c=Number(c),isNaN(c)||0>c)throw Error("Bad port number "+c);o.s=c}else o.s=null}function Ga(o,c,h){c instanceof tr?(o.i=c,Sd(o.i,o.h)):(h||(c=Zn(c,Pd)),o.i=new tr(c,o.h))}function rt(o,c,h){o.i.set(c,h)}function ss(o){return rt(o,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),o}function Xn(o,c){return o?c?decodeURI(o.replace(/%25/g,"%2525")):decodeURIComponent(o):""}function Zn(o,c,h){return typeof o=="string"?(o=encodeURI(o).replace(c,vd),h&&(o=o.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),o):null}function vd(o){return o=o.charCodeAt(0),"%"+(o>>4&15).toString(16)+(o&15).toString(16)}var Ka=/[#\/\?@]/g,Ad=/[#\?:]/g,Rd=/[#\?]/g,Pd=/[#\?@]/g,Vd=/#/g;function tr(o,c){this.h=this.g=null,this.i=o||null,this.j=!!c}function le(o){o.g||(o.g=new Map,o.h=0,o.i&&wd(o.i,function(c,h){o.add(decodeURIComponent(c.replace(/\+/g," ")),h)}))}r=tr.prototype,r.add=function(o,c){le(this),this.i=null,o=an(this,o);var h=this.g.get(o);return h||this.g.set(o,h=[]),h.push(c),this.h+=1,this};function ja(o,c){le(o),c=an(o,c),o.g.has(c)&&(o.i=null,o.h-=o.g.get(c).length,o.g.delete(c))}function za(o,c){return le(o),c=an(o,c),o.g.has(c)}r.forEach=function(o,c){le(this),this.g.forEach(function(h,m){h.forEach(function(v){o.call(c,v,m,this)},this)},this)},r.na=function(){le(this);const o=Array.from(this.g.values()),c=Array.from(this.g.keys()),h=[];for(let m=0;m<c.length;m++){const v=o[m];for(let S=0;S<v.length;S++)h.push(c[m])}return h},r.V=function(o){le(this);let c=[];if(typeof o=="string")za(this,o)&&(c=c.concat(this.g.get(an(this,o))));else{o=Array.from(this.g.values());for(let h=0;h<o.length;h++)c=c.concat(o[h])}return c},r.set=function(o,c){return le(this),this.i=null,o=an(this,o),za(this,o)&&(this.h-=this.g.get(o).length),this.g.set(o,[c]),this.h+=1,this},r.get=function(o,c){return o?(o=this.V(o),0<o.length?String(o[0]):c):c};function Qa(o,c,h){ja(o,c),0<h.length&&(o.i=null,o.g.set(an(o,c),N(h)),o.h+=h.length)}r.toString=function(){if(this.i)return this.i;if(!this.g)return"";const o=[],c=Array.from(this.g.keys());for(var h=0;h<c.length;h++){var m=c[h];const S=encodeURIComponent(String(m)),k=this.V(m);for(m=0;m<k.length;m++){var v=S;k[m]!==""&&(v+="="+encodeURIComponent(String(k[m]))),o.push(v)}}return this.i=o.join("&")};function an(o,c){return c=String(c),o.j&&(c=c.toLowerCase()),c}function Sd(o,c){c&&!o.j&&(le(o),o.i=null,o.g.forEach(function(h,m){var v=m.toLowerCase();m!=v&&(ja(this,m),Qa(this,v,h))},o)),o.j=c}function bd(o,c){const h=new Jn;if(u.Image){const m=new Image;m.onload=P(he,h,"TestLoadImage: loaded",!0,c,m),m.onerror=P(he,h,"TestLoadImage: error",!1,c,m),m.onabort=P(he,h,"TestLoadImage: abort",!1,c,m),m.ontimeout=P(he,h,"TestLoadImage: timeout",!1,c,m),u.setTimeout(function(){m.ontimeout&&m.ontimeout()},1e4),m.src=o}else c(!1)}function Cd(o,c){const h=new Jn,m=new AbortController,v=setTimeout(()=>{m.abort(),he(h,"TestPingServer: timeout",!1,c)},1e4);fetch(o,{signal:m.signal}).then(S=>{clearTimeout(v),S.ok?he(h,"TestPingServer: ok",!0,c):he(h,"TestPingServer: server error",!1,c)}).catch(()=>{clearTimeout(v),he(h,"TestPingServer: error",!1,c)})}function he(o,c,h,m,v){try{v&&(v.onload=null,v.onerror=null,v.onabort=null,v.ontimeout=null),m(h)}catch{}}function xd(){this.g=new fd}function Dd(o,c,h){const m=h||"";try{qa(o,function(v,S){let k=v;d(v)&&(k=yi(v)),c.push(m+S+"="+encodeURIComponent(k))})}catch(v){throw c.push(m+"type="+encodeURIComponent("_badmap")),v}}function is(o){this.l=o.Ub||null,this.j=o.eb||!1}x(is,Ii),is.prototype.g=function(){return new os(this.l,this.j)},is.prototype.i=function(o){return function(){return o}}({});function os(o,c){Rt.call(this),this.D=o,this.o=c,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}x(os,Rt),r=os.prototype,r.open=function(o,c){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=o,this.A=c,this.readyState=1,nr(this)},r.send=function(o){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const c={headers:this.u,method:this.B,credentials:this.m,cache:void 0};o&&(c.body=o),(this.D||u).fetch(new Request(this.A,c)).then(this.Sa.bind(this),this.ga.bind(this))},r.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,er(this)),this.readyState=0},r.Sa=function(o){if(this.g&&(this.l=o,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=o.headers,this.readyState=2,nr(this)),this.g&&(this.readyState=3,nr(this),this.g)))if(this.responseType==="arraybuffer")o.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof u.ReadableStream<"u"&&"body"in o){if(this.j=o.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;$a(this)}else o.text().then(this.Ra.bind(this),this.ga.bind(this))};function $a(o){o.j.read().then(o.Pa.bind(o)).catch(o.ga.bind(o))}r.Pa=function(o){if(this.g){if(this.o&&o.value)this.response.push(o.value);else if(!this.o){var c=o.value?o.value:new Uint8Array(0);(c=this.v.decode(c,{stream:!o.done}))&&(this.response=this.responseText+=c)}o.done?er(this):nr(this),this.readyState==3&&$a(this)}},r.Ra=function(o){this.g&&(this.response=this.responseText=o,er(this))},r.Qa=function(o){this.g&&(this.response=o,er(this))},r.ga=function(){this.g&&er(this)};function er(o){o.readyState=4,o.l=null,o.j=null,o.v=null,nr(o)}r.setRequestHeader=function(o,c){this.u.append(o,c)},r.getResponseHeader=function(o){return this.h&&this.h.get(o.toLowerCase())||""},r.getAllResponseHeaders=function(){if(!this.h)return"";const o=[],c=this.h.entries();for(var h=c.next();!h.done;)h=h.value,o.push(h[0]+": "+h[1]),h=c.next();return o.join(`\r
`)};function nr(o){o.onreadystatechange&&o.onreadystatechange.call(o)}Object.defineProperty(os.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(o){this.m=o?"include":"same-origin"}});function Wa(o){let c="";return W(o,function(h,m){c+=m,c+=":",c+=h,c+=`\r
`}),c}function bi(o,c,h){t:{for(m in h){var m=!1;break t}m=!0}m||(h=Wa(h),typeof o=="string"?h!=null&&encodeURIComponent(String(h)):rt(o,c,h))}function lt(o){Rt.call(this),this.headers=new Map,this.o=o||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}x(lt,Rt);var Nd=/^https?$/i,kd=["POST","PUT"];r=lt.prototype,r.Ha=function(o){this.J=o},r.ea=function(o,c,h,m){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+o);c=c?c.toUpperCase():"GET",this.D=o,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():wi.g(),this.v=this.o?va(this.o):va(wi),this.g.onreadystatechange=I(this.Ea,this);try{this.B=!0,this.g.open(c,String(o),!0),this.B=!1}catch(S){Ha(this,S);return}if(o=h||"",h=new Map(this.headers),m)if(Object.getPrototypeOf(m)===Object.prototype)for(var v in m)h.set(v,m[v]);else if(typeof m.keys=="function"&&typeof m.get=="function")for(const S of m.keys())h.set(S,m.get(S));else throw Error("Unknown input type for opt_headers: "+String(m));m=Array.from(h.keys()).find(S=>S.toLowerCase()=="content-type"),v=u.FormData&&o instanceof u.FormData,!(0<=Array.prototype.indexOf.call(kd,c,void 0))||m||v||h.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[S,k]of h)this.g.setRequestHeader(S,k);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{Xa(this),this.u=!0,this.g.send(o),this.u=!1}catch(S){Ha(this,S)}};function Ha(o,c){o.h=!1,o.g&&(o.j=!0,o.g.abort(),o.j=!1),o.l=c,o.m=5,Ja(o),as(o)}function Ja(o){o.A||(o.A=!0,Ct(o,"complete"),Ct(o,"error"))}r.abort=function(o){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=o||7,Ct(this,"complete"),Ct(this,"abort"),as(this))},r.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),as(this,!0)),lt.aa.N.call(this)},r.Ea=function(){this.s||(this.B||this.u||this.j?Ya(this):this.bb())},r.bb=function(){Ya(this)};function Ya(o){if(o.h&&typeof a<"u"&&(!o.v[1]||te(o)!=4||o.Z()!=2)){if(o.u&&te(o)==4)Ia(o.Ea,0,o);else if(Ct(o,"readystatechange"),te(o)==4){o.h=!1;try{const k=o.Z();t:switch(k){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var c=!0;break t;default:c=!1}var h;if(!(h=c)){var m;if(m=k===0){var v=String(o.D).match(Ua)[1]||null;!v&&u.self&&u.self.location&&(v=u.self.location.protocol.slice(0,-1)),m=!Nd.test(v?v.toLowerCase():"")}h=m}if(h)Ct(o,"complete"),Ct(o,"success");else{o.m=6;try{var S=2<te(o)?o.g.statusText:""}catch{S=""}o.l=S+" ["+o.Z()+"]",Ja(o)}}finally{as(o)}}}}function as(o,c){if(o.g){Xa(o);const h=o.g,m=o.v[0]?()=>{}:null;o.g=null,o.v=null,c||Ct(o,"ready");try{h.onreadystatechange=m}catch{}}}function Xa(o){o.I&&(u.clearTimeout(o.I),o.I=null)}r.isActive=function(){return!!this.g};function te(o){return o.g?o.g.readyState:0}r.Z=function(){try{return 2<te(this)?this.g.status:-1}catch{return-1}},r.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},r.Oa=function(o){if(this.g){var c=this.g.responseText;return o&&c.indexOf(o)==0&&(c=c.substring(o.length)),dd(c)}};function Za(o){try{if(!o.g)return null;if("response"in o.g)return o.g.response;switch(o.H){case"":case"text":return o.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in o.g)return o.g.mozResponseArrayBuffer}return null}catch{return null}}function Fd(o){const c={};o=(o.g&&2<=te(o)&&o.g.getAllResponseHeaders()||"").split(`\r
`);for(let m=0;m<o.length;m++){if(K(o[m]))continue;var h=w(o[m]);const v=h[0];if(h=h[1],typeof h!="string")continue;h=h.trim();const S=c[v]||[];c[v]=S,S.push(h)}T(c,function(m){return m.join(", ")})}r.Ba=function(){return this.m},r.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function rr(o,c,h){return h&&h.internalChannelParams&&h.internalChannelParams[o]||c}function tu(o){this.Aa=0,this.i=[],this.j=new Jn,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=rr("failFast",!1,o),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=rr("baseRetryDelayMs",5e3,o),this.cb=rr("retryDelaySeedMs",1e4,o),this.Wa=rr("forwardChannelMaxRetries",2,o),this.wa=rr("forwardChannelRequestTimeoutMs",2e4,o),this.pa=o&&o.xmlHttpFactory||void 0,this.Xa=o&&o.Tb||void 0,this.Ca=o&&o.useFetchStreams||!1,this.L=void 0,this.J=o&&o.supportsCrossDomainXhr||!1,this.K="",this.h=new Fa(o&&o.concurrentRequestLimit),this.Da=new xd,this.P=o&&o.fastHandshake||!1,this.O=o&&o.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=o&&o.Rb||!1,o&&o.xa&&this.j.xa(),o&&o.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&o&&o.detectBufferingProxy||!1,this.ja=void 0,o&&o.longPollingTimeout&&0<o.longPollingTimeout&&(this.ja=o.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}r=tu.prototype,r.la=8,r.G=1,r.connect=function(o,c,h,m){xt(0),this.W=o,this.H=c||{},h&&m!==void 0&&(this.H.OSID=h,this.H.OAID=m),this.F=this.X,this.I=cu(this,null,this.W),cs(this)};function Ci(o){if(eu(o),o.G==3){var c=o.U++,h=Zt(o.I);if(rt(h,"SID",o.K),rt(h,"RID",c),rt(h,"TYPE","terminate"),sr(o,h),c=new ce(o,o.j,c),c.L=2,c.v=ss(Zt(h)),h=!1,u.navigator&&u.navigator.sendBeacon)try{h=u.navigator.sendBeacon(c.v.toString(),"")}catch{}!h&&u.Image&&(new Image().src=c.v,h=!0),h||(c.g=lu(c.j,null),c.g.ea(c.v)),c.F=Date.now(),es(c)}uu(o)}function us(o){o.g&&(Di(o),o.g.cancel(),o.g=null)}function eu(o){us(o),o.u&&(u.clearTimeout(o.u),o.u=null),ls(o),o.h.cancel(),o.s&&(typeof o.s=="number"&&u.clearTimeout(o.s),o.s=null)}function cs(o){if(!Ma(o.h)&&!o.s){o.s=!0;var c=o.Ga;Kn||ma(),jn||(Kn(),jn=!0),li.add(c,o),o.B=0}}function Md(o,c){return Oa(o.h)>=o.h.j-(o.s?1:0)?!1:o.s?(o.i=c.D.concat(o.i),!0):o.G==1||o.G==2||o.B>=(o.Va?0:o.Wa)?!1:(o.s=Hn(I(o.Ga,o,c),au(o,o.B)),o.B++,!0)}r.Ga=function(o){if(this.s)if(this.s=null,this.G==1){if(!o){this.U=Math.floor(1e5*Math.random()),o=this.U++;const v=new ce(this,this.j,o);let S=this.o;if(this.S&&(S?(S=_(S),E(S,this.S)):S=this.S),this.m!==null||this.O||(v.H=S,S=null),this.P)t:{for(var c=0,h=0;h<this.i.length;h++){e:{var m=this.i[h];if("__data__"in m.map&&(m=m.map.__data__,typeof m=="string")){m=m.length;break e}m=void 0}if(m===void 0)break;if(c+=m,4096<c){c=h;break t}if(c===4096||h===this.i.length-1){c=h+1;break t}}c=1e3}else c=1e3;c=ru(this,v,c),h=Zt(this.I),rt(h,"RID",o),rt(h,"CVER",22),this.D&&rt(h,"X-HTTP-Session-Id",this.D),sr(this,h),S&&(this.O?c="headers="+encodeURIComponent(String(Wa(S)))+"&"+c:this.m&&bi(h,this.m,S)),Si(this.h,v),this.Ua&&rt(h,"TYPE","init"),this.P?(rt(h,"$req",c),rt(h,"SID","null"),v.T=!0,Ai(v,h,null)):Ai(v,h,c),this.G=2}}else this.G==3&&(o?nu(this,o):this.i.length==0||Ma(this.h)||nu(this))};function nu(o,c){var h;c?h=c.l:h=o.U++;const m=Zt(o.I);rt(m,"SID",o.K),rt(m,"RID",h),rt(m,"AID",o.T),sr(o,m),o.m&&o.o&&bi(m,o.m,o.o),h=new ce(o,o.j,h,o.B+1),o.m===null&&(h.H=o.o),c&&(o.i=c.D.concat(o.i)),c=ru(o,h,1e3),h.I=Math.round(.5*o.wa)+Math.round(.5*o.wa*Math.random()),Si(o.h,h),Ai(h,m,c)}function sr(o,c){o.H&&W(o.H,function(h,m){rt(c,m,h)}),o.l&&qa({},function(h,m){rt(c,m,h)})}function ru(o,c,h){h=Math.min(o.i.length,h);var m=o.l?I(o.l.Na,o.l,o):null;t:{var v=o.i;let S=-1;for(;;){const k=["count="+h];S==-1?0<h?(S=v[0].g,k.push("ofs="+S)):S=0:k.push("ofs="+S);let tt=!0;for(let Tt=0;Tt<h;Tt++){let H=v[Tt].g;const Pt=v[Tt].map;if(H-=S,0>H)S=Math.max(0,v[Tt].g-100),tt=!1;else try{Dd(Pt,k,"req"+H+"_")}catch{m&&m(Pt)}}if(tt){m=k.join("&");break t}}}return o=o.i.splice(0,h),c.D=o,m}function su(o){if(!o.g&&!o.u){o.Y=1;var c=o.Fa;Kn||ma(),jn||(Kn(),jn=!0),li.add(c,o),o.v=0}}function xi(o){return o.g||o.u||3<=o.v?!1:(o.Y++,o.u=Hn(I(o.Fa,o),au(o,o.v)),o.v++,!0)}r.Fa=function(){if(this.u=null,iu(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var o=2*this.R;this.j.info("BP detection timer enabled: "+o),this.A=Hn(I(this.ab,this),o)}},r.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,xt(10),us(this),iu(this))};function Di(o){o.A!=null&&(u.clearTimeout(o.A),o.A=null)}function iu(o){o.g=new ce(o,o.j,"rpc",o.Y),o.m===null&&(o.g.H=o.o),o.g.O=0;var c=Zt(o.qa);rt(c,"RID","rpc"),rt(c,"SID",o.K),rt(c,"AID",o.T),rt(c,"CI",o.F?"0":"1"),!o.F&&o.ja&&rt(c,"TO",o.ja),rt(c,"TYPE","xmlhttp"),sr(o,c),o.m&&o.o&&bi(c,o.m,o.o),o.L&&(o.g.I=o.L);var h=o.g;o=o.ia,h.L=1,h.v=ss(Zt(c)),h.m=null,h.P=!0,Da(h,o)}r.Za=function(){this.C!=null&&(this.C=null,us(this),xi(this),xt(19))};function ls(o){o.C!=null&&(u.clearTimeout(o.C),o.C=null)}function ou(o,c){var h=null;if(o.g==c){ls(o),Di(o),o.g=null;var m=2}else if(Vi(o.h,c))h=c.D,La(o.h,c),m=1;else return;if(o.G!=0){if(c.o)if(m==1){h=c.m?c.m.length:0,c=Date.now()-c.F;var v=o.B;m=Xr(),Ct(m,new Sa(m,h)),cs(o)}else su(o);else if(v=c.s,v==3||v==0&&0<c.X||!(m==1&&Md(o,c)||m==2&&xi(o)))switch(h&&0<h.length&&(c=o.h,c.i=c.i.concat(h)),v){case 1:ke(o,5);break;case 4:ke(o,10);break;case 3:ke(o,6);break;default:ke(o,2)}}}function au(o,c){let h=o.Ta+Math.floor(Math.random()*o.cb);return o.isActive()||(h*=2),h*c}function ke(o,c){if(o.j.info("Error code "+c),c==2){var h=I(o.fb,o),m=o.Xa;const v=!m;m=new Ne(m||"//www.google.com/images/cleardot.gif"),u.location&&u.location.protocol=="http"||ns(m,"https"),ss(m),v?bd(m.toString(),h):Cd(m.toString(),h)}else xt(2);o.G=0,o.l&&o.l.sa(c),uu(o),eu(o)}r.fb=function(o){o?(this.j.info("Successfully pinged google.com"),xt(2)):(this.j.info("Failed to ping google.com"),xt(1))};function uu(o){if(o.G=0,o.ka=[],o.l){const c=Ba(o.h);(c.length!=0||o.i.length!=0)&&(D(o.ka,c),D(o.ka,o.i),o.h.i.length=0,N(o.i),o.i.length=0),o.l.ra()}}function cu(o,c,h){var m=h instanceof Ne?Zt(h):new Ne(h);if(m.g!="")c&&(m.g=c+"."+m.g),rs(m,m.s);else{var v=u.location;m=v.protocol,c=c?c+"."+v.hostname:v.hostname,v=+v.port;var S=new Ne(null);m&&ns(S,m),c&&(S.g=c),v&&rs(S,v),h&&(S.l=h),m=S}return h=o.D,c=o.ya,h&&c&&rt(m,h,c),rt(m,"VER",o.la),sr(o,m),m}function lu(o,c,h){if(c&&!o.J)throw Error("Can't create secondary domain capable XhrIo object.");return c=o.Ca&&!o.pa?new lt(new is({eb:h})):new lt(o.pa),c.Ha(o.J),c}r.isActive=function(){return!!this.l&&this.l.isActive(this)};function hu(){}r=hu.prototype,r.ua=function(){},r.ta=function(){},r.sa=function(){},r.ra=function(){},r.isActive=function(){return!0},r.Na=function(){};function hs(){}hs.prototype.g=function(o,c){return new Ut(o,c)};function Ut(o,c){Rt.call(this),this.g=new tu(c),this.l=o,this.h=c&&c.messageUrlParams||null,o=c&&c.messageHeaders||null,c&&c.clientProtocolHeaderRequired&&(o?o["X-Client-Protocol"]="webchannel":o={"X-Client-Protocol":"webchannel"}),this.g.o=o,o=c&&c.initMessageHeaders||null,c&&c.messageContentType&&(o?o["X-WebChannel-Content-Type"]=c.messageContentType:o={"X-WebChannel-Content-Type":c.messageContentType}),c&&c.va&&(o?o["X-WebChannel-Client-Profile"]=c.va:o={"X-WebChannel-Client-Profile":c.va}),this.g.S=o,(o=c&&c.Sb)&&!K(o)&&(this.g.m=o),this.v=c&&c.supportsCrossDomainXhr||!1,this.u=c&&c.sendRawJson||!1,(c=c&&c.httpSessionIdParam)&&!K(c)&&(this.g.D=c,o=this.h,o!==null&&c in o&&(o=this.h,c in o&&delete o[c])),this.j=new un(this)}x(Ut,Rt),Ut.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},Ut.prototype.close=function(){Ci(this.g)},Ut.prototype.o=function(o){var c=this.g;if(typeof o=="string"){var h={};h.__data__=o,o=h}else this.u&&(h={},h.__data__=yi(o),o=h);c.i.push(new Id(c.Ya++,o)),c.G==3&&cs(c)},Ut.prototype.N=function(){this.g.l=null,delete this.j,Ci(this.g),delete this.g,Ut.aa.N.call(this)};function du(o){Ti.call(this),o.__headers__&&(this.headers=o.__headers__,this.statusCode=o.__status__,delete o.__headers__,delete o.__status__);var c=o.__sm__;if(c){t:{for(const h in c){o=h;break t}o=void 0}(this.i=o)&&(o=this.i,c=c!==null&&o in c?c[o]:void 0),this.data=c}else this.data=o}x(du,Ti);function fu(){Ei.call(this),this.status=1}x(fu,Ei);function un(o){this.g=o}x(un,hu),un.prototype.ua=function(){Ct(this.g,"a")},un.prototype.ta=function(o){Ct(this.g,new du(o))},un.prototype.sa=function(o){Ct(this.g,new fu)},un.prototype.ra=function(){Ct(this.g,"b")},hs.prototype.createWebChannel=hs.prototype.g,Ut.prototype.send=Ut.prototype.o,Ut.prototype.open=Ut.prototype.m,Ut.prototype.close=Ut.prototype.close,Lc=function(){return new hs},Oc=function(){return Xr()},Mc=xe,qi={mb:0,pb:1,qb:2,Jb:3,Ob:4,Lb:5,Mb:6,Kb:7,Ib:8,Nb:9,PROXY:10,NOPROXY:11,Gb:12,Cb:13,Db:14,Bb:15,Eb:16,Fb:17,ib:18,hb:19,jb:20},Zr.NO_ERROR=0,Zr.TIMEOUT=8,Zr.HTTP_ERROR=6,Is=Zr,ba.COMPLETE="complete",Fc=ba,Aa.EventType=$n,$n.OPEN="a",$n.CLOSE="b",$n.ERROR="c",$n.MESSAGE="d",Rt.prototype.listen=Rt.prototype.K,lr=Aa,lt.prototype.listenOnce=lt.prototype.L,lt.prototype.getLastError=lt.prototype.Ka,lt.prototype.getLastErrorCode=lt.prototype.Ba,lt.prototype.getStatus=lt.prototype.Z,lt.prototype.getResponseJson=lt.prototype.Oa,lt.prototype.getResponseText=lt.prototype.oa,lt.prototype.send=lt.prototype.ea,lt.prototype.setWithCredentials=lt.prototype.Ha,kc=lt}).apply(typeof fs<"u"?fs:typeof self<"u"?self:typeof window<"u"?window:{});const _u="@firebase/firestore";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class It{constructor(t){this.uid=t}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(t){return t.uid===this.uid}}It.UNAUTHENTICATED=new It(null),It.GOOGLE_CREDENTIALS=new It("google-credentials-uid"),It.FIRST_PARTY=new It("first-party-uid"),It.MOCK_USER=new It("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let kn="10.14.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ie=new Od("@firebase/firestore");function mn(){return Ie.logLevel}function jd(r){Ie.setLogLevel(r)}function C(r,...t){if(Ie.logLevel<=ee.DEBUG){const e=t.map(lo);Ie.debug(`Firestore (${kn}): ${r}`,...e)}}function dt(r,...t){if(Ie.logLevel<=ee.ERROR){const e=t.map(lo);Ie.error(`Firestore (${kn}): ${r}`,...e)}}function Ht(r,...t){if(Ie.logLevel<=ee.WARN){const e=t.map(lo);Ie.warn(`Firestore (${kn}): ${r}`,...e)}}function lo(r){if(typeof r=="string")return r;try{/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/return function(e){return JSON.stringify(e)}(r)}catch{return r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function O(r="Unexpected state"){const t=`FIRESTORE (${kn}) INTERNAL ASSERTION FAILED: `+r;throw dt(t),new Error(t)}function L(r,t){r||O()}function zd(r,t){r||O()}function M(r,t){return r}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const V={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class b extends Bd{constructor(t,e){super(t,e),this.code=t,this.message=e,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vt{constructor(){this.promise=new Promise((t,e)=>{this.resolve=t,this.reject=e})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bc{constructor(t,e){this.user=e,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${t}`)}}class Qd{getToken(){return Promise.resolve(null)}invalidateToken(){}start(t,e){t.enqueueRetryable(()=>e(It.UNAUTHENTICATED))}shutdown(){}}class $d{constructor(t){this.token=t,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(t,e){this.changeListener=e,t.enqueueRetryable(()=>e(this.token.user))}shutdown(){this.changeListener=null}}class Wd{constructor(t){this.t=t,this.currentUser=It.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(t,e){L(this.o===void 0);let n=this.i;const s=l=>this.i!==n?(n=this.i,e(l)):Promise.resolve();let i=new vt;this.o=()=>{this.i++,this.currentUser=this.u(),i.resolve(),i=new vt,t.enqueueRetryable(()=>s(this.currentUser))};const a=()=>{const l=i;t.enqueueRetryable(async()=>{await l.promise,await s(this.currentUser)})},u=l=>{C("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=l,this.o&&(this.auth.addAuthTokenListener(this.o),a())};this.t.onInit(l=>u(l)),setTimeout(()=>{if(!this.auth){const l=this.t.getImmediate({optional:!0});l?u(l):(C("FirebaseAuthCredentialsProvider","Auth not yet detected"),i.resolve(),i=new vt)}},0),a()}getToken(){const t=this.i,e=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(e).then(n=>this.i!==t?(C("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):n?(L(typeof n.accessToken=="string"),new Bc(n.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const t=this.auth&&this.auth.getUid();return L(t===null||typeof t=="string"),new It(t)}}class Hd{constructor(t,e,n){this.l=t,this.h=e,this.P=n,this.type="FirstParty",this.user=It.FIRST_PARTY,this.I=new Map}T(){return this.P?this.P():null}get headers(){this.I.set("X-Goog-AuthUser",this.l);const t=this.T();return t&&this.I.set("Authorization",t),this.h&&this.I.set("X-Goog-Iam-Authorization-Token",this.h),this.I}}class Jd{constructor(t,e,n){this.l=t,this.h=e,this.P=n}getToken(){return Promise.resolve(new Hd(this.l,this.h,this.P))}start(t,e){t.enqueueRetryable(()=>e(It.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class Yd{constructor(t){this.value=t,this.type="AppCheck",this.headers=new Map,t&&t.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class Xd{constructor(t){this.A=t,this.forceRefresh=!1,this.appCheck=null,this.R=null}start(t,e){L(this.o===void 0);const n=i=>{i.error!=null&&C("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${i.error.message}`);const a=i.token!==this.R;return this.R=i.token,C("FirebaseAppCheckTokenProvider",`Received ${a?"new":"existing"} token.`),a?e(i.token):Promise.resolve()};this.o=i=>{t.enqueueRetryable(()=>n(i))};const s=i=>{C("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=i,this.o&&this.appCheck.addTokenListener(this.o)};this.A.onInit(i=>s(i)),setTimeout(()=>{if(!this.appCheck){const i=this.A.getImmediate({optional:!0});i?s(i):C("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){const t=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(t).then(e=>e?(L(typeof e.token=="string"),this.R=e.token,new Yd(e.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Zd(r){const t=typeof self<"u"&&(self.crypto||self.msCrypto),e=new Uint8Array(r);if(t&&typeof t.getRandomValues=="function")t.getRandomValues(e);else for(let n=0;n<r;n++)e[n]=Math.floor(256*Math.random());return e}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qc{static newId(){const t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",e=Math.floor(256/t.length)*t.length;let n="";for(;n.length<20;){const s=Zd(40);for(let i=0;i<s.length;++i)n.length<20&&s[i]<e&&(n+=t.charAt(s[i]%t.length))}return n}}function G(r,t){return r<t?-1:r>t?1:0}function En(r,t,e){return r.length===t.length&&r.every((n,s)=>e(n,t[s]))}function Uc(r){return r+"\0"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ut{constructor(t,e){if(this.seconds=t,this.nanoseconds=e,e<0)throw new b(V.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+e);if(e>=1e9)throw new b(V.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+e);if(t<-62135596800)throw new b(V.INVALID_ARGUMENT,"Timestamp seconds out of range: "+t);if(t>=253402300800)throw new b(V.INVALID_ARGUMENT,"Timestamp seconds out of range: "+t)}static now(){return ut.fromMillis(Date.now())}static fromDate(t){return ut.fromMillis(t.getTime())}static fromMillis(t){const e=Math.floor(t/1e3),n=Math.floor(1e6*(t-1e3*e));return new ut(e,n)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/1e6}_compareTo(t){return this.seconds===t.seconds?G(this.nanoseconds,t.nanoseconds):G(this.seconds,t.seconds)}isEqual(t){return t.seconds===this.seconds&&t.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{seconds:this.seconds,nanoseconds:this.nanoseconds}}valueOf(){const t=this.seconds- -62135596800;return String(t).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class B{constructor(t){this.timestamp=t}static fromTimestamp(t){return new B(t)}static min(){return new B(new ut(0,0))}static max(){return new B(new ut(253402300799,999999999))}compareTo(t){return this.timestamp._compareTo(t.timestamp)}isEqual(t){return this.timestamp.isEqual(t.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Tr{constructor(t,e,n){e===void 0?e=0:e>t.length&&O(),n===void 0?n=t.length-e:n>t.length-e&&O(),this.segments=t,this.offset=e,this.len=n}get length(){return this.len}isEqual(t){return Tr.comparator(this,t)===0}child(t){const e=this.segments.slice(this.offset,this.limit());return t instanceof Tr?t.forEach(n=>{e.push(n)}):e.push(t),this.construct(e)}limit(){return this.offset+this.length}popFirst(t){return t=t===void 0?1:t,this.construct(this.segments,this.offset+t,this.length-t)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(t){return this.segments[this.offset+t]}isEmpty(){return this.length===0}isPrefixOf(t){if(t.length<this.length)return!1;for(let e=0;e<this.length;e++)if(this.get(e)!==t.get(e))return!1;return!0}isImmediateParentOf(t){if(this.length+1!==t.length)return!1;for(let e=0;e<this.length;e++)if(this.get(e)!==t.get(e))return!1;return!0}forEach(t){for(let e=this.offset,n=this.limit();e<n;e++)t(this.segments[e])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(t,e){const n=Math.min(t.length,e.length);for(let s=0;s<n;s++){const i=t.get(s),a=e.get(s);if(i<a)return-1;if(i>a)return 1}return t.length<e.length?-1:t.length>e.length?1:0}}class z extends Tr{construct(t,e,n){return new z(t,e,n)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...t){const e=[];for(const n of t){if(n.indexOf("//")>=0)throw new b(V.INVALID_ARGUMENT,`Invalid segment (${n}). Paths must not contain // in them.`);e.push(...n.split("/").filter(s=>s.length>0))}return new z(e)}static emptyPath(){return new z([])}}const tf=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class ot extends Tr{construct(t,e,n){return new ot(t,e,n)}static isValidIdentifier(t){return tf.test(t)}canonicalString(){return this.toArray().map(t=>(t=t.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),ot.isValidIdentifier(t)||(t="`"+t+"`"),t)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)==="__name__"}static keyField(){return new ot(["__name__"])}static fromServerFormat(t){const e=[];let n="",s=0;const i=()=>{if(n.length===0)throw new b(V.INVALID_ARGUMENT,`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);e.push(n),n=""};let a=!1;for(;s<t.length;){const u=t[s];if(u==="\\"){if(s+1===t.length)throw new b(V.INVALID_ARGUMENT,"Path has trailing escape character: "+t);const l=t[s+1];if(l!=="\\"&&l!=="."&&l!=="`")throw new b(V.INVALID_ARGUMENT,"Path has invalid escape sequence: "+t);n+=l,s+=2}else u==="`"?(a=!a,s++):u!=="."||a?(n+=u,s++):(i(),s++)}if(i(),a)throw new b(V.INVALID_ARGUMENT,"Unterminated ` in path: "+t);return new ot(e)}static emptyPath(){return new ot([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class F{constructor(t){this.path=t}static fromPath(t){return new F(z.fromString(t))}static fromName(t){return new F(z.fromString(t).popFirst(5))}static empty(){return new F(z.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(t){return this.path.length>=2&&this.path.get(this.path.length-2)===t}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(t){return t!==null&&z.comparator(this.path,t.path)===0}toString(){return this.path.toString()}static comparator(t,e){return z.comparator(t.path,e.path)}static isDocumentKey(t){return t.length%2==0}static fromSegments(t){return new F(new z(t.slice()))}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ss{constructor(t,e,n,s){this.indexId=t,this.collectionGroup=e,this.fields=n,this.indexState=s}}function Ui(r){return r.fields.find(t=>t.kind===2)}function Me(r){return r.fields.filter(t=>t.kind!==2)}Ss.UNKNOWN_ID=-1;class Ts{constructor(t,e){this.fieldPath=t,this.kind=e}}class Er{constructor(t,e){this.sequenceNumber=t,this.offset=e}static empty(){return new Er(0,Gt.min())}}function Gc(r,t){const e=r.toTimestamp().seconds,n=r.toTimestamp().nanoseconds+1,s=B.fromTimestamp(n===1e9?new ut(e+1,0):new ut(e,n));return new Gt(s,F.empty(),t)}function Kc(r){return new Gt(r.readTime,r.key,-1)}class Gt{constructor(t,e,n){this.readTime=t,this.documentKey=e,this.largestBatchId=n}static min(){return new Gt(B.min(),F.empty(),-1)}static max(){return new Gt(B.max(),F.empty(),-1)}}function ho(r,t){let e=r.readTime.compareTo(t.readTime);return e!==0?e:(e=F.comparator(r.documentKey,t.documentKey),e!==0?e:G(r.largestBatchId,t.largestBatchId))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const jc="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class zc{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(t){this.onCommittedListeners.push(t)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(t=>t())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ve(r){if(r.code!==V.FAILED_PRECONDITION||r.message!==jc)throw r;C("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class A{constructor(t){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,t(e=>{this.isDone=!0,this.result=e,this.nextCallback&&this.nextCallback(e)},e=>{this.isDone=!0,this.error=e,this.catchCallback&&this.catchCallback(e)})}catch(t){return this.next(void 0,t)}next(t,e){return this.callbackAttached&&O(),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(e,this.error):this.wrapSuccess(t,this.result):new A((n,s)=>{this.nextCallback=i=>{this.wrapSuccess(t,i).next(n,s)},this.catchCallback=i=>{this.wrapFailure(e,i).next(n,s)}})}toPromise(){return new Promise((t,e)=>{this.next(t,e)})}wrapUserFunction(t){try{const e=t();return e instanceof A?e:A.resolve(e)}catch(e){return A.reject(e)}}wrapSuccess(t,e){return t?this.wrapUserFunction(()=>t(e)):A.resolve(e)}wrapFailure(t,e){return t?this.wrapUserFunction(()=>t(e)):A.reject(e)}static resolve(t){return new A((e,n)=>{e(t)})}static reject(t){return new A((e,n)=>{n(t)})}static waitFor(t){return new A((e,n)=>{let s=0,i=0,a=!1;t.forEach(u=>{++s,u.next(()=>{++i,a&&i===s&&e()},l=>n(l))}),a=!0,i===s&&e()})}static or(t){let e=A.resolve(!1);for(const n of t)e=e.next(s=>s?A.resolve(s):n());return e}static forEach(t,e){const n=[];return t.forEach((s,i)=>{n.push(e.call(this,s,i))}),this.waitFor(n)}static mapArray(t,e){return new A((n,s)=>{const i=t.length,a=new Array(i);let u=0;for(let l=0;l<i;l++){const d=l;e(t[d]).next(f=>{a[d]=f,++u,u===i&&n(a)},f=>s(f))}})}static doWhile(t,e){return new A((n,s)=>{const i=()=>{t()===!0?e().next(()=>{i()},s):n()};i()})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Us{constructor(t,e){this.action=t,this.transaction=e,this.aborted=!1,this.V=new vt,this.transaction.oncomplete=()=>{this.V.resolve()},this.transaction.onabort=()=>{e.error?this.V.reject(new mr(t,e.error)):this.V.resolve()},this.transaction.onerror=n=>{const s=fo(n.target.error);this.V.reject(new mr(t,s))}}static open(t,e,n,s){try{return new Us(e,t.transaction(s,n))}catch(i){throw new mr(e,i)}}get m(){return this.V.promise}abort(t){t&&this.V.reject(t),this.aborted||(C("SimpleDb","Aborting transaction:",t?t.message:"Client-initiated abort"),this.aborted=!0,this.transaction.abort())}g(){const t=this.transaction;this.aborted||typeof t.commit!="function"||t.commit()}store(t){const e=this.transaction.objectStore(t);return new nf(e)}}class $t{constructor(t,e,n){this.name=t,this.version=e,this.p=n,$t.S(Vs())===12.2&&dt("Firestore persistence suffers from a bug in iOS 12.2 Safari that may cause your app to stop working. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.")}static delete(t){return C("SimpleDb","Removing database:",t),Oe(window.indexedDB.deleteDatabase(t)).toPromise()}static D(){if(!Gd())return!1;if($t.v())return!0;const t=Vs(),e=$t.S(t),n=0<e&&e<10,s=Qc(t),i=0<s&&s<4.5;return!(t.indexOf("MSIE ")>0||t.indexOf("Trident/")>0||t.indexOf("Edge/")>0||n||i)}static v(){var t;return typeof process<"u"&&((t=process.__PRIVATE_env)===null||t===void 0?void 0:t.C)==="YES"}static F(t,e){return t.store(e)}static S(t){const e=t.match(/i(?:phone|pad|pod) os ([\d_]+)/i),n=e?e[1].split("_").slice(0,2).join("."):"-1";return Number(n)}async M(t){return this.db||(C("SimpleDb","Opening database:",this.name),this.db=await new Promise((e,n)=>{const s=indexedDB.open(this.name,this.version);s.onsuccess=i=>{const a=i.target.result;e(a)},s.onblocked=()=>{n(new mr(t,"Cannot upgrade IndexedDB schema while another tab is open. Close all tabs that access Firestore and reload this page to proceed."))},s.onerror=i=>{const a=i.target.error;a.name==="VersionError"?n(new b(V.FAILED_PRECONDITION,"A newer version of the Firestore SDK was previously used and so the persisted data is not compatible with the version of the SDK you are now using. The SDK will operate with persistence disabled. If you need persistence, please re-upgrade to a newer version of the SDK or else clear the persisted IndexedDB data for your app to start fresh.")):a.name==="InvalidStateError"?n(new b(V.FAILED_PRECONDITION,"Unable to open an IndexedDB connection. This could be due to running in a private browsing session on a browser whose private browsing sessions do not support IndexedDB: "+a)):n(new mr(t,a))},s.onupgradeneeded=i=>{C("SimpleDb",'Database "'+this.name+'" requires upgrade from version:',i.oldVersion);const a=i.target.result;this.p.O(a,s.transaction,i.oldVersion,this.version).next(()=>{C("SimpleDb","Database upgrade to version "+this.version+" complete")})}})),this.N&&(this.db.onversionchange=e=>this.N(e)),this.db}L(t){this.N=t,this.db&&(this.db.onversionchange=e=>t(e))}async runTransaction(t,e,n,s){const i=e==="readonly";let a=0;for(;;){++a;try{this.db=await this.M(t);const u=Us.open(this.db,t,i?"readonly":"readwrite",n),l=s(u).next(d=>(u.g(),d)).catch(d=>(u.abort(d),A.reject(d))).toPromise();return l.catch(()=>{}),await u.m,l}catch(u){const l=u,d=l.name!=="FirebaseError"&&a<3;if(C("SimpleDb","Transaction failed with error:",l.message,"Retrying:",d),this.close(),!d)return Promise.reject(l)}}}close(){this.db&&this.db.close(),this.db=void 0}}function Qc(r){const t=r.match(/Android ([\d.]+)/i),e=t?t[1].split(".").slice(0,2).join("."):"-1";return Number(e)}class ef{constructor(t){this.B=t,this.k=!1,this.q=null}get isDone(){return this.k}get K(){return this.q}set cursor(t){this.B=t}done(){this.k=!0}$(t){this.q=t}delete(){return Oe(this.B.delete())}}class mr extends b{constructor(t,e){super(V.UNAVAILABLE,`IndexedDB transaction '${t}' failed: ${e}`),this.name="IndexedDbTransactionError"}}function Se(r){return r.name==="IndexedDbTransactionError"}class nf{constructor(t){this.store=t}put(t,e){let n;return e!==void 0?(C("SimpleDb","PUT",this.store.name,t,e),n=this.store.put(e,t)):(C("SimpleDb","PUT",this.store.name,"<auto-key>",t),n=this.store.put(t)),Oe(n)}add(t){return C("SimpleDb","ADD",this.store.name,t,t),Oe(this.store.add(t))}get(t){return Oe(this.store.get(t)).next(e=>(e===void 0&&(e=null),C("SimpleDb","GET",this.store.name,t,e),e))}delete(t){return C("SimpleDb","DELETE",this.store.name,t),Oe(this.store.delete(t))}count(){return C("SimpleDb","COUNT",this.store.name),Oe(this.store.count())}U(t,e){const n=this.options(t,e),s=n.index?this.store.index(n.index):this.store;if(typeof s.getAll=="function"){const i=s.getAll(n.range);return new A((a,u)=>{i.onerror=l=>{u(l.target.error)},i.onsuccess=l=>{a(l.target.result)}})}{const i=this.cursor(n),a=[];return this.W(i,(u,l)=>{a.push(l)}).next(()=>a)}}G(t,e){const n=this.store.getAll(t,e===null?void 0:e);return new A((s,i)=>{n.onerror=a=>{i(a.target.error)},n.onsuccess=a=>{s(a.target.result)}})}j(t,e){C("SimpleDb","DELETE ALL",this.store.name);const n=this.options(t,e);n.H=!1;const s=this.cursor(n);return this.W(s,(i,a,u)=>u.delete())}J(t,e){let n;e?n=t:(n={},e=t);const s=this.cursor(n);return this.W(s,e)}Y(t){const e=this.cursor({});return new A((n,s)=>{e.onerror=i=>{const a=fo(i.target.error);s(a)},e.onsuccess=i=>{const a=i.target.result;a?t(a.primaryKey,a.value).next(u=>{u?a.continue():n()}):n()}})}W(t,e){const n=[];return new A((s,i)=>{t.onerror=a=>{i(a.target.error)},t.onsuccess=a=>{const u=a.target.result;if(!u)return void s();const l=new ef(u),d=e(u.primaryKey,u.value,l);if(d instanceof A){const f=d.catch(g=>(l.done(),A.reject(g)));n.push(f)}l.isDone?s():l.K===null?u.continue():u.continue(l.K)}}).next(()=>A.waitFor(n))}options(t,e){let n;return t!==void 0&&(typeof t=="string"?n=t:e=t),{index:n,range:e}}cursor(t){let e="next";if(t.reverse&&(e="prev"),t.index){const n=this.store.index(t.index);return t.H?n.openKeyCursor(t.range,e):n.openCursor(t.range,e)}return this.store.openCursor(t.range,e)}}function Oe(r){return new A((t,e)=>{r.onsuccess=n=>{const s=n.target.result;t(s)},r.onerror=n=>{const s=fo(n.target.error);e(s)}})}let pu=!1;function fo(r){const t=$t.S(Vs());if(t>=12.2&&t<13){const e="An internal error was encountered in the Indexed Database server";if(r.message.indexOf(e)>=0){const n=new b("internal",`IOS_INDEXEDDB_BUG1: IndexedDb has thrown '${e}'. This is likely due to an unavoidable bug in iOS. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.`);return pu||(pu=!0,setTimeout(()=>{throw n},0)),n}}return r}class rf{constructor(t,e){this.asyncQueue=t,this.Z=e,this.task=null}start(){this.X(15e3)}stop(){this.task&&(this.task.cancel(),this.task=null)}get started(){return this.task!==null}X(t){C("IndexBackfiller",`Scheduled in ${t}ms`),this.task=this.asyncQueue.enqueueAfterDelay("index_backfill",t,async()=>{this.task=null;try{C("IndexBackfiller",`Documents written: ${await this.Z.ee()}`)}catch(e){Se(e)?C("IndexBackfiller","Ignoring IndexedDB error during index backfill: ",e):await Ve(e)}await this.X(6e4)})}}class sf{constructor(t,e){this.localStore=t,this.persistence=e}async ee(t=50){return this.persistence.runTransaction("Backfill Indexes","readwrite-primary",e=>this.te(e,t))}te(t,e){const n=new Set;let s=e,i=!0;return A.doWhile(()=>i===!0&&s>0,()=>this.localStore.indexManager.getNextCollectionGroupToUpdate(t).next(a=>{if(a!==null&&!n.has(a))return C("IndexBackfiller",`Processing collection: ${a}`),this.ne(t,a,s).next(u=>{s-=u,n.add(a)});i=!1})).next(()=>e-s)}ne(t,e,n){return this.localStore.indexManager.getMinOffsetFromCollectionGroup(t,e).next(s=>this.localStore.localDocuments.getNextDocuments(t,e,s,n).next(i=>{const a=i.changes;return this.localStore.indexManager.updateIndexEntries(t,a).next(()=>this.re(s,i)).next(u=>(C("IndexBackfiller",`Updating offset: ${u}`),this.localStore.indexManager.updateCollectionGroup(t,e,u))).next(()=>a.size)}))}re(t,e){let n=t;return e.changes.forEach((s,i)=>{const a=Kc(i);ho(a,n)>0&&(n=a)}),new Gt(n.readTime,n.documentKey,Math.max(e.batchId,t.largestBatchId))}}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Lt{constructor(t,e){this.previousValue=t,e&&(e.sequenceNumberHandler=n=>this.ie(n),this.se=n=>e.writeSequenceNumber(n))}ie(t){return this.previousValue=Math.max(t,this.previousValue),this.previousValue}next(){const t=++this.previousValue;return this.se&&this.se(t),t}}Lt.oe=-1;function Fr(r){return r==null}function wr(r){return r===0&&1/r==-1/0}function $c(r){return typeof r=="number"&&Number.isInteger(r)&&!wr(r)&&r<=Number.MAX_SAFE_INTEGER&&r>=Number.MIN_SAFE_INTEGER}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function kt(r){let t="";for(let e=0;e<r.length;e++)t.length>0&&(t=yu(t)),t=of(r.get(e),t);return yu(t)}function of(r,t){let e=t;const n=r.length;for(let s=0;s<n;s++){const i=r.charAt(s);switch(i){case"\0":e+="";break;case"":e+="";break;default:e+=i}}return e}function yu(r){return r+""}function zt(r){const t=r.length;if(L(t>=2),t===2)return L(r.charAt(0)===""&&r.charAt(1)===""),z.emptyPath();const e=t-2,n=[];let s="";for(let i=0;i<t;){const a=r.indexOf("",i);switch((a<0||a>e)&&O(),r.charAt(a+1)){case"":const u=r.substring(i,a);let l;s.length===0?l=u:(s+=u,l=s,s=""),n.push(l);break;case"":s+=r.substring(i,a),s+="\0";break;case"":s+=r.substring(i,a+1);break;default:O()}i=a+2}return new z(n)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Iu=["userId","batchId"];/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Es(r,t){return[r,kt(t)]}function Wc(r,t,e){return[r,kt(t),e]}const af={},uf=["prefixPath","collectionGroup","readTime","documentId"],cf=["prefixPath","collectionGroup","documentId"],lf=["collectionGroup","readTime","prefixPath","documentId"],hf=["canonicalId","targetId"],df=["targetId","path"],ff=["path","targetId"],mf=["collectionId","parent"],gf=["indexId","uid"],_f=["uid","sequenceNumber"],pf=["indexId","uid","arrayValue","directionalValue","orderedDocumentKey","documentKey"],yf=["indexId","uid","orderedDocumentKey"],If=["userId","collectionPath","documentId"],Tf=["userId","collectionPath","largestBatchId"],Ef=["userId","collectionGroup","largestBatchId"],Hc=["mutationQueues","mutations","documentMutations","remoteDocuments","targets","owner","targetGlobal","targetDocuments","clientMetadata","remoteDocumentGlobal","collectionParents","bundles","namedQueries"],wf=[...Hc,"documentOverlays"],Jc=["mutationQueues","mutations","documentMutations","remoteDocumentsV14","targets","owner","targetGlobal","targetDocuments","clientMetadata","remoteDocumentGlobal","collectionParents","bundles","namedQueries","documentOverlays"],Yc=Jc,mo=[...Yc,"indexConfiguration","indexState","indexEntries"],vf=mo,Af=[...mo,"globals"];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gi extends zc{constructor(t,e){super(),this._e=t,this.currentSequenceNumber=e}}function pt(r,t){const e=M(r);return $t.F(e._e,t)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Tu(r){let t=0;for(const e in r)Object.prototype.hasOwnProperty.call(r,e)&&t++;return t}function tn(r,t){for(const e in r)Object.prototype.hasOwnProperty.call(r,e)&&t(e,r[e])}function Xc(r){for(const t in r)if(Object.prototype.hasOwnProperty.call(r,t))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nt{constructor(t,e){this.comparator=t,this.root=e||Et.EMPTY}insert(t,e){return new nt(this.comparator,this.root.insert(t,e,this.comparator).copy(null,null,Et.BLACK,null,null))}remove(t){return new nt(this.comparator,this.root.remove(t,this.comparator).copy(null,null,Et.BLACK,null,null))}get(t){let e=this.root;for(;!e.isEmpty();){const n=this.comparator(t,e.key);if(n===0)return e.value;n<0?e=e.left:n>0&&(e=e.right)}return null}indexOf(t){let e=0,n=this.root;for(;!n.isEmpty();){const s=this.comparator(t,n.key);if(s===0)return e+n.left.size;s<0?n=n.left:(e+=n.left.size+1,n=n.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(t){return this.root.inorderTraversal(t)}forEach(t){this.inorderTraversal((e,n)=>(t(e,n),!1))}toString(){const t=[];return this.inorderTraversal((e,n)=>(t.push(`${e}:${n}`),!1)),`{${t.join(", ")}}`}reverseTraversal(t){return this.root.reverseTraversal(t)}getIterator(){return new ms(this.root,null,this.comparator,!1)}getIteratorFrom(t){return new ms(this.root,t,this.comparator,!1)}getReverseIterator(){return new ms(this.root,null,this.comparator,!0)}getReverseIteratorFrom(t){return new ms(this.root,t,this.comparator,!0)}}class ms{constructor(t,e,n,s){this.isReverse=s,this.nodeStack=[];let i=1;for(;!t.isEmpty();)if(i=e?n(t.key,e):1,e&&s&&(i*=-1),i<0)t=this.isReverse?t.left:t.right;else{if(i===0){this.nodeStack.push(t);break}this.nodeStack.push(t),t=this.isReverse?t.right:t.left}}getNext(){let t=this.nodeStack.pop();const e={key:t.key,value:t.value};if(this.isReverse)for(t=t.left;!t.isEmpty();)this.nodeStack.push(t),t=t.right;else for(t=t.right;!t.isEmpty();)this.nodeStack.push(t),t=t.left;return e}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const t=this.nodeStack[this.nodeStack.length-1];return{key:t.key,value:t.value}}}class Et{constructor(t,e,n,s,i){this.key=t,this.value=e,this.color=n??Et.RED,this.left=s??Et.EMPTY,this.right=i??Et.EMPTY,this.size=this.left.size+1+this.right.size}copy(t,e,n,s,i){return new Et(t??this.key,e??this.value,n??this.color,s??this.left,i??this.right)}isEmpty(){return!1}inorderTraversal(t){return this.left.inorderTraversal(t)||t(this.key,this.value)||this.right.inorderTraversal(t)}reverseTraversal(t){return this.right.reverseTraversal(t)||t(this.key,this.value)||this.left.reverseTraversal(t)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(t,e,n){let s=this;const i=n(t,s.key);return s=i<0?s.copy(null,null,null,s.left.insert(t,e,n),null):i===0?s.copy(null,e,null,null,null):s.copy(null,null,null,null,s.right.insert(t,e,n)),s.fixUp()}removeMin(){if(this.left.isEmpty())return Et.EMPTY;let t=this;return t.left.isRed()||t.left.left.isRed()||(t=t.moveRedLeft()),t=t.copy(null,null,null,t.left.removeMin(),null),t.fixUp()}remove(t,e){let n,s=this;if(e(t,s.key)<0)s.left.isEmpty()||s.left.isRed()||s.left.left.isRed()||(s=s.moveRedLeft()),s=s.copy(null,null,null,s.left.remove(t,e),null);else{if(s.left.isRed()&&(s=s.rotateRight()),s.right.isEmpty()||s.right.isRed()||s.right.left.isRed()||(s=s.moveRedRight()),e(t,s.key)===0){if(s.right.isEmpty())return Et.EMPTY;n=s.right.min(),s=s.copy(n.key,n.value,null,null,s.right.removeMin())}s=s.copy(null,null,null,null,s.right.remove(t,e))}return s.fixUp()}isRed(){return this.color}fixUp(){let t=this;return t.right.isRed()&&!t.left.isRed()&&(t=t.rotateLeft()),t.left.isRed()&&t.left.left.isRed()&&(t=t.rotateRight()),t.left.isRed()&&t.right.isRed()&&(t=t.colorFlip()),t}moveRedLeft(){let t=this.colorFlip();return t.right.left.isRed()&&(t=t.copy(null,null,null,null,t.right.rotateRight()),t=t.rotateLeft(),t=t.colorFlip()),t}moveRedRight(){let t=this.colorFlip();return t.left.left.isRed()&&(t=t.rotateRight(),t=t.colorFlip()),t}rotateLeft(){const t=this.copy(null,null,Et.RED,null,this.right.left);return this.right.copy(null,null,this.color,t,null)}rotateRight(){const t=this.copy(null,null,Et.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,t)}colorFlip(){const t=this.left.copy(null,null,!this.left.color,null,null),e=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,t,e)}checkMaxDepth(){const t=this.check();return Math.pow(2,t)<=this.size+1}check(){if(this.isRed()&&this.left.isRed()||this.right.isRed())throw O();const t=this.left.check();if(t!==this.right.check())throw O();return t+(this.isRed()?0:1)}}Et.EMPTY=null,Et.RED=!0,Et.BLACK=!1;Et.EMPTY=new class{constructor(){this.size=0}get key(){throw O()}get value(){throw O()}get color(){throw O()}get left(){throw O()}get right(){throw O()}copy(t,e,n,s,i){return this}insert(t,e,n){return new Et(t,e)}remove(t,e){return this}isEmpty(){return!0}inorderTraversal(t){return!1}reverseTraversal(t){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Z{constructor(t){this.comparator=t,this.data=new nt(this.comparator)}has(t){return this.data.get(t)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(t){return this.data.indexOf(t)}forEach(t){this.data.inorderTraversal((e,n)=>(t(e),!1))}forEachInRange(t,e){const n=this.data.getIteratorFrom(t[0]);for(;n.hasNext();){const s=n.getNext();if(this.comparator(s.key,t[1])>=0)return;e(s.key)}}forEachWhile(t,e){let n;for(n=e!==void 0?this.data.getIteratorFrom(e):this.data.getIterator();n.hasNext();)if(!t(n.getNext().key))return}firstAfterOrEqual(t){const e=this.data.getIteratorFrom(t);return e.hasNext()?e.getNext().key:null}getIterator(){return new Eu(this.data.getIterator())}getIteratorFrom(t){return new Eu(this.data.getIteratorFrom(t))}add(t){return this.copy(this.data.remove(t).insert(t,!0))}delete(t){return this.has(t)?this.copy(this.data.remove(t)):this}isEmpty(){return this.data.isEmpty()}unionWith(t){let e=this;return e.size<t.size&&(e=t,t=this),t.forEach(n=>{e=e.add(n)}),e}isEqual(t){if(!(t instanceof Z)||this.size!==t.size)return!1;const e=this.data.getIterator(),n=t.data.getIterator();for(;e.hasNext();){const s=e.getNext().key,i=n.getNext().key;if(this.comparator(s,i)!==0)return!1}return!0}toArray(){const t=[];return this.forEach(e=>{t.push(e)}),t}toString(){const t=[];return this.forEach(e=>t.push(e)),"SortedSet("+t.toString()+")"}copy(t){const e=new Z(this.comparator);return e.data=t,e}}class Eu{constructor(t){this.iter=t}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}function ln(r){return r.hasNext()?r.getNext():void 0}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bt{constructor(t){this.fields=t,t.sort(ot.comparator)}static empty(){return new Bt([])}unionWith(t){let e=new Z(ot.comparator);for(const n of this.fields)e=e.add(n);for(const n of t)e=e.add(n);return new Bt(e.toArray())}covers(t){for(const e of this.fields)if(e.isPrefixOf(t))return!0;return!1}isEqual(t){return En(this.fields,t.fields,(e,n)=>e.isEqual(n))}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zc extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Rf(){return typeof atob<"u"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ht{constructor(t){this.binaryString=t}static fromBase64String(t){const e=function(s){try{return atob(s)}catch(i){throw typeof DOMException<"u"&&i instanceof DOMException?new Zc("Invalid base64 string: "+i):i}}(t);return new ht(e)}static fromUint8Array(t){const e=function(s){let i="";for(let a=0;a<s.length;++a)i+=String.fromCharCode(s[a]);return i}(t);return new ht(e)}[Symbol.iterator](){let t=0;return{next:()=>t<this.binaryString.length?{value:this.binaryString.charCodeAt(t++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(e){return btoa(e)}(this.binaryString)}toUint8Array(){return function(e){const n=new Uint8Array(e.length);for(let s=0;s<e.length;s++)n[s]=e.charCodeAt(s);return n}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(t){return G(this.binaryString,t.binaryString)}isEqual(t){return this.binaryString===t.binaryString}}ht.EMPTY_BYTE_STRING=new ht("");const Pf=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function re(r){if(L(!!r),typeof r=="string"){let t=0;const e=Pf.exec(r);if(L(!!e),e[1]){let s=e[1];s=(s+"000000000").substr(0,9),t=Number(s)}const n=new Date(r);return{seconds:Math.floor(n.getTime()/1e3),nanos:t}}return{seconds:it(r.seconds),nanos:it(r.nanos)}}function it(r){return typeof r=="number"?r:typeof r=="string"?Number(r):0}function Te(r){return typeof r=="string"?ht.fromBase64String(r):ht.fromUint8Array(r)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Gs(r){var t,e;return((e=(((t=r==null?void 0:r.mapValue)===null||t===void 0?void 0:t.fields)||{}).__type__)===null||e===void 0?void 0:e.stringValue)==="server_timestamp"}function go(r){const t=r.mapValue.fields.__previous_value__;return Gs(t)?go(t):t}function vr(r){const t=re(r.mapValue.fields.__local_write_time__.timestampValue);return new ut(t.seconds,t.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vf{constructor(t,e,n,s,i,a,u,l,d){this.databaseId=t,this.appId=e,this.persistenceKey=n,this.host=s,this.ssl=i,this.forceLongPolling=a,this.autoDetectLongPolling=u,this.longPollingOptions=l,this.useFetchStreams=d}}class Ee{constructor(t,e){this.projectId=t,this.database=e||"(default)"}static empty(){return new Ee("","")}get isDefaultDatabase(){return this.database==="(default)"}isEqual(t){return t instanceof Ee&&t.projectId===this.projectId&&t.database===this.database}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pe={mapValue:{fields:{__type__:{stringValue:"__max__"}}}},ws={nullValue:"NULL_VALUE"};function ze(r){return"nullValue"in r?0:"booleanValue"in r?1:"integerValue"in r||"doubleValue"in r?2:"timestampValue"in r?3:"stringValue"in r?5:"bytesValue"in r?6:"referenceValue"in r?7:"geoPointValue"in r?8:"arrayValue"in r?9:"mapValue"in r?Gs(r)?4:tl(r)?9007199254740991:Ks(r)?10:11:O()}function Jt(r,t){if(r===t)return!0;const e=ze(r);if(e!==ze(t))return!1;switch(e){case 0:case 9007199254740991:return!0;case 1:return r.booleanValue===t.booleanValue;case 4:return vr(r).isEqual(vr(t));case 3:return function(s,i){if(typeof s.timestampValue=="string"&&typeof i.timestampValue=="string"&&s.timestampValue.length===i.timestampValue.length)return s.timestampValue===i.timestampValue;const a=re(s.timestampValue),u=re(i.timestampValue);return a.seconds===u.seconds&&a.nanos===u.nanos}(r,t);case 5:return r.stringValue===t.stringValue;case 6:return function(s,i){return Te(s.bytesValue).isEqual(Te(i.bytesValue))}(r,t);case 7:return r.referenceValue===t.referenceValue;case 8:return function(s,i){return it(s.geoPointValue.latitude)===it(i.geoPointValue.latitude)&&it(s.geoPointValue.longitude)===it(i.geoPointValue.longitude)}(r,t);case 2:return function(s,i){if("integerValue"in s&&"integerValue"in i)return it(s.integerValue)===it(i.integerValue);if("doubleValue"in s&&"doubleValue"in i){const a=it(s.doubleValue),u=it(i.doubleValue);return a===u?wr(a)===wr(u):isNaN(a)&&isNaN(u)}return!1}(r,t);case 9:return En(r.arrayValue.values||[],t.arrayValue.values||[],Jt);case 10:case 11:return function(s,i){const a=s.mapValue.fields||{},u=i.mapValue.fields||{};if(Tu(a)!==Tu(u))return!1;for(const l in a)if(a.hasOwnProperty(l)&&(u[l]===void 0||!Jt(a[l],u[l])))return!1;return!0}(r,t);default:return O()}}function Ar(r,t){return(r.values||[]).find(e=>Jt(e,t))!==void 0}function we(r,t){if(r===t)return 0;const e=ze(r),n=ze(t);if(e!==n)return G(e,n);switch(e){case 0:case 9007199254740991:return 0;case 1:return G(r.booleanValue,t.booleanValue);case 2:return function(i,a){const u=it(i.integerValue||i.doubleValue),l=it(a.integerValue||a.doubleValue);return u<l?-1:u>l?1:u===l?0:isNaN(u)?isNaN(l)?0:-1:1}(r,t);case 3:return wu(r.timestampValue,t.timestampValue);case 4:return wu(vr(r),vr(t));case 5:return G(r.stringValue,t.stringValue);case 6:return function(i,a){const u=Te(i),l=Te(a);return u.compareTo(l)}(r.bytesValue,t.bytesValue);case 7:return function(i,a){const u=i.split("/"),l=a.split("/");for(let d=0;d<u.length&&d<l.length;d++){const f=G(u[d],l[d]);if(f!==0)return f}return G(u.length,l.length)}(r.referenceValue,t.referenceValue);case 8:return function(i,a){const u=G(it(i.latitude),it(a.latitude));return u!==0?u:G(it(i.longitude),it(a.longitude))}(r.geoPointValue,t.geoPointValue);case 9:return vu(r.arrayValue,t.arrayValue);case 10:return function(i,a){var u,l,d,f;const g=i.fields||{},I=a.fields||{},P=(u=g.value)===null||u===void 0?void 0:u.arrayValue,x=(l=I.value)===null||l===void 0?void 0:l.arrayValue,N=G(((d=P==null?void 0:P.values)===null||d===void 0?void 0:d.length)||0,((f=x==null?void 0:x.values)===null||f===void 0?void 0:f.length)||0);return N!==0?N:vu(P,x)}(r.mapValue,t.mapValue);case 11:return function(i,a){if(i===pe.mapValue&&a===pe.mapValue)return 0;if(i===pe.mapValue)return 1;if(a===pe.mapValue)return-1;const u=i.fields||{},l=Object.keys(u),d=a.fields||{},f=Object.keys(d);l.sort(),f.sort();for(let g=0;g<l.length&&g<f.length;++g){const I=G(l[g],f[g]);if(I!==0)return I;const P=we(u[l[g]],d[f[g]]);if(P!==0)return P}return G(l.length,f.length)}(r.mapValue,t.mapValue);default:throw O()}}function wu(r,t){if(typeof r=="string"&&typeof t=="string"&&r.length===t.length)return G(r,t);const e=re(r),n=re(t),s=G(e.seconds,n.seconds);return s!==0?s:G(e.nanos,n.nanos)}function vu(r,t){const e=r.values||[],n=t.values||[];for(let s=0;s<e.length&&s<n.length;++s){const i=we(e[s],n[s]);if(i)return i}return G(e.length,n.length)}function wn(r){return Ki(r)}function Ki(r){return"nullValue"in r?"null":"booleanValue"in r?""+r.booleanValue:"integerValue"in r?""+r.integerValue:"doubleValue"in r?""+r.doubleValue:"timestampValue"in r?function(e){const n=re(e);return`time(${n.seconds},${n.nanos})`}(r.timestampValue):"stringValue"in r?r.stringValue:"bytesValue"in r?function(e){return Te(e).toBase64()}(r.bytesValue):"referenceValue"in r?function(e){return F.fromName(e).toString()}(r.referenceValue):"geoPointValue"in r?function(e){return`geo(${e.latitude},${e.longitude})`}(r.geoPointValue):"arrayValue"in r?function(e){let n="[",s=!0;for(const i of e.values||[])s?s=!1:n+=",",n+=Ki(i);return n+"]"}(r.arrayValue):"mapValue"in r?function(e){const n=Object.keys(e.fields||{}).sort();let s="{",i=!0;for(const a of n)i?i=!1:s+=",",s+=`${a}:${Ki(e.fields[a])}`;return s+"}"}(r.mapValue):O()}function Qe(r,t){return{referenceValue:`projects/${r.projectId}/databases/${r.database}/documents/${t.path.canonicalString()}`}}function ji(r){return!!r&&"integerValue"in r}function Rr(r){return!!r&&"arrayValue"in r}function Au(r){return!!r&&"nullValue"in r}function Ru(r){return!!r&&"doubleValue"in r&&isNaN(Number(r.doubleValue))}function vs(r){return!!r&&"mapValue"in r}function Ks(r){var t,e;return((e=(((t=r==null?void 0:r.mapValue)===null||t===void 0?void 0:t.fields)||{}).__type__)===null||e===void 0?void 0:e.stringValue)==="__vector__"}function gr(r){if(r.geoPointValue)return{geoPointValue:Object.assign({},r.geoPointValue)};if(r.timestampValue&&typeof r.timestampValue=="object")return{timestampValue:Object.assign({},r.timestampValue)};if(r.mapValue){const t={mapValue:{fields:{}}};return tn(r.mapValue.fields,(e,n)=>t.mapValue.fields[e]=gr(n)),t}if(r.arrayValue){const t={arrayValue:{values:[]}};for(let e=0;e<(r.arrayValue.values||[]).length;++e)t.arrayValue.values[e]=gr(r.arrayValue.values[e]);return t}return Object.assign({},r)}function tl(r){return(((r.mapValue||{}).fields||{}).__type__||{}).stringValue==="__max__"}const el={mapValue:{fields:{__type__:{stringValue:"__vector__"},value:{arrayValue:{}}}}};function Sf(r){return"nullValue"in r?ws:"booleanValue"in r?{booleanValue:!1}:"integerValue"in r||"doubleValue"in r?{doubleValue:NaN}:"timestampValue"in r?{timestampValue:{seconds:Number.MIN_SAFE_INTEGER}}:"stringValue"in r?{stringValue:""}:"bytesValue"in r?{bytesValue:""}:"referenceValue"in r?Qe(Ee.empty(),F.empty()):"geoPointValue"in r?{geoPointValue:{latitude:-90,longitude:-180}}:"arrayValue"in r?{arrayValue:{}}:"mapValue"in r?Ks(r)?el:{mapValue:{}}:O()}function bf(r){return"nullValue"in r?{booleanValue:!1}:"booleanValue"in r?{doubleValue:NaN}:"integerValue"in r||"doubleValue"in r?{timestampValue:{seconds:Number.MIN_SAFE_INTEGER}}:"timestampValue"in r?{stringValue:""}:"stringValue"in r?{bytesValue:""}:"bytesValue"in r?Qe(Ee.empty(),F.empty()):"referenceValue"in r?{geoPointValue:{latitude:-90,longitude:-180}}:"geoPointValue"in r?{arrayValue:{}}:"arrayValue"in r?el:"mapValue"in r?Ks(r)?{mapValue:{}}:pe:O()}function Pu(r,t){const e=we(r.value,t.value);return e!==0?e:r.inclusive&&!t.inclusive?-1:!r.inclusive&&t.inclusive?1:0}function Vu(r,t){const e=we(r.value,t.value);return e!==0?e:r.inclusive&&!t.inclusive?1:!r.inclusive&&t.inclusive?-1:0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wt{constructor(t){this.value=t}static empty(){return new wt({mapValue:{}})}field(t){if(t.isEmpty())return this.value;{let e=this.value;for(let n=0;n<t.length-1;++n)if(e=(e.mapValue.fields||{})[t.get(n)],!vs(e))return null;return e=(e.mapValue.fields||{})[t.lastSegment()],e||null}}set(t,e){this.getFieldsMap(t.popLast())[t.lastSegment()]=gr(e)}setAll(t){let e=ot.emptyPath(),n={},s=[];t.forEach((a,u)=>{if(!e.isImmediateParentOf(u)){const l=this.getFieldsMap(e);this.applyChanges(l,n,s),n={},s=[],e=u.popLast()}a?n[u.lastSegment()]=gr(a):s.push(u.lastSegment())});const i=this.getFieldsMap(e);this.applyChanges(i,n,s)}delete(t){const e=this.field(t.popLast());vs(e)&&e.mapValue.fields&&delete e.mapValue.fields[t.lastSegment()]}isEqual(t){return Jt(this.value,t.value)}getFieldsMap(t){let e=this.value;e.mapValue.fields||(e.mapValue={fields:{}});for(let n=0;n<t.length;++n){let s=e.mapValue.fields[t.get(n)];vs(s)&&s.mapValue.fields||(s={mapValue:{fields:{}}},e.mapValue.fields[t.get(n)]=s),e=s}return e.mapValue.fields}applyChanges(t,e,n){tn(e,(s,i)=>t[s]=i);for(const s of n)delete t[s]}clone(){return new wt(gr(this.value))}}function nl(r){const t=[];return tn(r.fields,(e,n)=>{const s=new ot([e]);if(vs(n)){const i=nl(n.mapValue).fields;if(i.length===0)t.push(s);else for(const a of i)t.push(s.child(a))}else t.push(s)}),new Bt(t)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class st{constructor(t,e,n,s,i,a,u){this.key=t,this.documentType=e,this.version=n,this.readTime=s,this.createTime=i,this.data=a,this.documentState=u}static newInvalidDocument(t){return new st(t,0,B.min(),B.min(),B.min(),wt.empty(),0)}static newFoundDocument(t,e,n,s){return new st(t,1,e,B.min(),n,s,0)}static newNoDocument(t,e){return new st(t,2,e,B.min(),B.min(),wt.empty(),0)}static newUnknownDocument(t,e){return new st(t,3,e,B.min(),B.min(),wt.empty(),2)}convertToFoundDocument(t,e){return!this.createTime.isEqual(B.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=t),this.version=t,this.documentType=1,this.data=e,this.documentState=0,this}convertToNoDocument(t){return this.version=t,this.documentType=2,this.data=wt.empty(),this.documentState=0,this}convertToUnknownDocument(t){return this.version=t,this.documentType=3,this.data=wt.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=B.min(),this}setReadTime(t){return this.readTime=t,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(t){return t instanceof st&&this.key.isEqual(t.key)&&this.version.isEqual(t.version)&&this.documentType===t.documentType&&this.documentState===t.documentState&&this.data.isEqual(t.data)}mutableCopy(){return new st(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ve{constructor(t,e){this.position=t,this.inclusive=e}}function Su(r,t,e){let n=0;for(let s=0;s<r.position.length;s++){const i=t[s],a=r.position[s];if(i.field.isKeyField()?n=F.comparator(F.fromName(a.referenceValue),e.key):n=we(a,e.data.field(i.field)),i.dir==="desc"&&(n*=-1),n!==0)break}return n}function bu(r,t){if(r===null)return t===null;if(t===null||r.inclusive!==t.inclusive||r.position.length!==t.position.length)return!1;for(let e=0;e<r.position.length;e++)if(!Jt(r.position[e],t.position[e]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pr{constructor(t,e="asc"){this.field=t,this.dir=e}}function Cf(r,t){return r.dir===t.dir&&r.field.isEqual(t.field)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rl{}class Q extends rl{constructor(t,e,n){super(),this.field=t,this.op=e,this.value=n}static create(t,e,n){return t.isKeyField()?e==="in"||e==="not-in"?this.createKeyFieldInFilter(t,e,n):new xf(t,e,n):e==="array-contains"?new kf(t,n):e==="in"?new cl(t,n):e==="not-in"?new Ff(t,n):e==="array-contains-any"?new Mf(t,n):new Q(t,e,n)}static createKeyFieldInFilter(t,e,n){return e==="in"?new Df(t,n):new Nf(t,n)}matches(t){const e=t.data.field(this.field);return this.op==="!="?e!==null&&this.matchesComparison(we(e,this.value)):e!==null&&ze(this.value)===ze(e)&&this.matchesComparison(we(e,this.value))}matchesComparison(t){switch(this.op){case"<":return t<0;case"<=":return t<=0;case"==":return t===0;case"!=":return t!==0;case">":return t>0;case">=":return t>=0;default:return O()}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class X extends rl{constructor(t,e){super(),this.filters=t,this.op=e,this.ae=null}static create(t,e){return new X(t,e)}matches(t){return vn(this)?this.filters.find(e=>!e.matches(t))===void 0:this.filters.find(e=>e.matches(t))!==void 0}getFlattenedFilters(){return this.ae!==null||(this.ae=this.filters.reduce((t,e)=>t.concat(e.getFlattenedFilters()),[])),this.ae}getFilters(){return Object.assign([],this.filters)}}function vn(r){return r.op==="and"}function zi(r){return r.op==="or"}function _o(r){return sl(r)&&vn(r)}function sl(r){for(const t of r.filters)if(t instanceof X)return!1;return!0}function Qi(r){if(r instanceof Q)return r.field.canonicalString()+r.op.toString()+wn(r.value);if(_o(r))return r.filters.map(t=>Qi(t)).join(",");{const t=r.filters.map(e=>Qi(e)).join(",");return`${r.op}(${t})`}}function il(r,t){return r instanceof Q?function(n,s){return s instanceof Q&&n.op===s.op&&n.field.isEqual(s.field)&&Jt(n.value,s.value)}(r,t):r instanceof X?function(n,s){return s instanceof X&&n.op===s.op&&n.filters.length===s.filters.length?n.filters.reduce((i,a,u)=>i&&il(a,s.filters[u]),!0):!1}(r,t):void O()}function ol(r,t){const e=r.filters.concat(t);return X.create(e,r.op)}function al(r){return r instanceof Q?function(e){return`${e.field.canonicalString()} ${e.op} ${wn(e.value)}`}(r):r instanceof X?function(e){return e.op.toString()+" {"+e.getFilters().map(al).join(" ,")+"}"}(r):"Filter"}class xf extends Q{constructor(t,e,n){super(t,e,n),this.key=F.fromName(n.referenceValue)}matches(t){const e=F.comparator(t.key,this.key);return this.matchesComparison(e)}}class Df extends Q{constructor(t,e){super(t,"in",e),this.keys=ul("in",e)}matches(t){return this.keys.some(e=>e.isEqual(t.key))}}class Nf extends Q{constructor(t,e){super(t,"not-in",e),this.keys=ul("not-in",e)}matches(t){return!this.keys.some(e=>e.isEqual(t.key))}}function ul(r,t){var e;return(((e=t.arrayValue)===null||e===void 0?void 0:e.values)||[]).map(n=>F.fromName(n.referenceValue))}class kf extends Q{constructor(t,e){super(t,"array-contains",e)}matches(t){const e=t.data.field(this.field);return Rr(e)&&Ar(e.arrayValue,this.value)}}class cl extends Q{constructor(t,e){super(t,"in",e)}matches(t){const e=t.data.field(this.field);return e!==null&&Ar(this.value.arrayValue,e)}}class Ff extends Q{constructor(t,e){super(t,"not-in",e)}matches(t){if(Ar(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const e=t.data.field(this.field);return e!==null&&!Ar(this.value.arrayValue,e)}}class Mf extends Q{constructor(t,e){super(t,"array-contains-any",e)}matches(t){const e=t.data.field(this.field);return!(!Rr(e)||!e.arrayValue.values)&&e.arrayValue.values.some(n=>Ar(this.value.arrayValue,n))}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Of{constructor(t,e=null,n=[],s=[],i=null,a=null,u=null){this.path=t,this.collectionGroup=e,this.orderBy=n,this.filters=s,this.limit=i,this.startAt=a,this.endAt=u,this.ue=null}}function $i(r,t=null,e=[],n=[],s=null,i=null,a=null){return new Of(r,t,e,n,s,i,a)}function $e(r){const t=M(r);if(t.ue===null){let e=t.path.canonicalString();t.collectionGroup!==null&&(e+="|cg:"+t.collectionGroup),e+="|f:",e+=t.filters.map(n=>Qi(n)).join(","),e+="|ob:",e+=t.orderBy.map(n=>function(i){return i.field.canonicalString()+i.dir}(n)).join(","),Fr(t.limit)||(e+="|l:",e+=t.limit),t.startAt&&(e+="|lb:",e+=t.startAt.inclusive?"b:":"a:",e+=t.startAt.position.map(n=>wn(n)).join(",")),t.endAt&&(e+="|ub:",e+=t.endAt.inclusive?"a:":"b:",e+=t.endAt.position.map(n=>wn(n)).join(",")),t.ue=e}return t.ue}function Mr(r,t){if(r.limit!==t.limit||r.orderBy.length!==t.orderBy.length)return!1;for(let e=0;e<r.orderBy.length;e++)if(!Cf(r.orderBy[e],t.orderBy[e]))return!1;if(r.filters.length!==t.filters.length)return!1;for(let e=0;e<r.filters.length;e++)if(!il(r.filters[e],t.filters[e]))return!1;return r.collectionGroup===t.collectionGroup&&!!r.path.isEqual(t.path)&&!!bu(r.startAt,t.startAt)&&bu(r.endAt,t.endAt)}function bs(r){return F.isDocumentKey(r.path)&&r.collectionGroup===null&&r.filters.length===0}function Cs(r,t){return r.filters.filter(e=>e instanceof Q&&e.field.isEqual(t))}function Cu(r,t,e){let n=ws,s=!0;for(const i of Cs(r,t)){let a=ws,u=!0;switch(i.op){case"<":case"<=":a=Sf(i.value);break;case"==":case"in":case">=":a=i.value;break;case">":a=i.value,u=!1;break;case"!=":case"not-in":a=ws}Pu({value:n,inclusive:s},{value:a,inclusive:u})<0&&(n=a,s=u)}if(e!==null){for(let i=0;i<r.orderBy.length;++i)if(r.orderBy[i].field.isEqual(t)){const a=e.position[i];Pu({value:n,inclusive:s},{value:a,inclusive:e.inclusive})<0&&(n=a,s=e.inclusive);break}}return{value:n,inclusive:s}}function xu(r,t,e){let n=pe,s=!0;for(const i of Cs(r,t)){let a=pe,u=!0;switch(i.op){case">=":case">":a=bf(i.value),u=!1;break;case"==":case"in":case"<=":a=i.value;break;case"<":a=i.value,u=!1;break;case"!=":case"not-in":a=pe}Vu({value:n,inclusive:s},{value:a,inclusive:u})>0&&(n=a,s=u)}if(e!==null){for(let i=0;i<r.orderBy.length;++i)if(r.orderBy[i].field.isEqual(t)){const a=e.position[i];Vu({value:n,inclusive:s},{value:a,inclusive:e.inclusive})>0&&(n=a,s=e.inclusive);break}}return{value:n,inclusive:s}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ie{constructor(t,e=null,n=[],s=[],i=null,a="F",u=null,l=null){this.path=t,this.collectionGroup=e,this.explicitOrderBy=n,this.filters=s,this.limit=i,this.limitType=a,this.startAt=u,this.endAt=l,this.ce=null,this.le=null,this.he=null,this.startAt,this.endAt}}function ll(r,t,e,n,s,i,a,u){return new ie(r,t,e,n,s,i,a,u)}function Fn(r){return new ie(r)}function Du(r){return r.filters.length===0&&r.limit===null&&r.startAt==null&&r.endAt==null&&(r.explicitOrderBy.length===0||r.explicitOrderBy.length===1&&r.explicitOrderBy[0].field.isKeyField())}function po(r){return r.collectionGroup!==null}function In(r){const t=M(r);if(t.ce===null){t.ce=[];const e=new Set;for(const i of t.explicitOrderBy)t.ce.push(i),e.add(i.field.canonicalString());const n=t.explicitOrderBy.length>0?t.explicitOrderBy[t.explicitOrderBy.length-1].dir:"asc";(function(a){let u=new Z(ot.comparator);return a.filters.forEach(l=>{l.getFlattenedFilters().forEach(d=>{d.isInequality()&&(u=u.add(d.field))})}),u})(t).forEach(i=>{e.has(i.canonicalString())||i.isKeyField()||t.ce.push(new Pr(i,n))}),e.has(ot.keyField().canonicalString())||t.ce.push(new Pr(ot.keyField(),n))}return t.ce}function Ft(r){const t=M(r);return t.le||(t.le=Lf(t,In(r))),t.le}function Lf(r,t){if(r.limitType==="F")return $i(r.path,r.collectionGroup,t,r.filters,r.limit,r.startAt,r.endAt);{t=t.map(s=>{const i=s.dir==="desc"?"asc":"desc";return new Pr(s.field,i)});const e=r.endAt?new ve(r.endAt.position,r.endAt.inclusive):null,n=r.startAt?new ve(r.startAt.position,r.startAt.inclusive):null;return $i(r.path,r.collectionGroup,t,r.filters,r.limit,e,n)}}function Wi(r,t){const e=r.filters.concat([t]);return new ie(r.path,r.collectionGroup,r.explicitOrderBy.slice(),e,r.limit,r.limitType,r.startAt,r.endAt)}function xs(r,t,e){return new ie(r.path,r.collectionGroup,r.explicitOrderBy.slice(),r.filters.slice(),t,e,r.startAt,r.endAt)}function Or(r,t){return Mr(Ft(r),Ft(t))&&r.limitType===t.limitType}function hl(r){return`${$e(Ft(r))}|lt:${r.limitType}`}function gn(r){return`Query(target=${function(e){let n=e.path.canonicalString();return e.collectionGroup!==null&&(n+=" collectionGroup="+e.collectionGroup),e.filters.length>0&&(n+=`, filters: [${e.filters.map(s=>al(s)).join(", ")}]`),Fr(e.limit)||(n+=", limit: "+e.limit),e.orderBy.length>0&&(n+=`, orderBy: [${e.orderBy.map(s=>function(a){return`${a.field.canonicalString()} (${a.dir})`}(s)).join(", ")}]`),e.startAt&&(n+=", startAt: ",n+=e.startAt.inclusive?"b:":"a:",n+=e.startAt.position.map(s=>wn(s)).join(",")),e.endAt&&(n+=", endAt: ",n+=e.endAt.inclusive?"a:":"b:",n+=e.endAt.position.map(s=>wn(s)).join(",")),`Target(${n})`}(Ft(r))}; limitType=${r.limitType})`}function Lr(r,t){return t.isFoundDocument()&&function(n,s){const i=s.key.path;return n.collectionGroup!==null?s.key.hasCollectionId(n.collectionGroup)&&n.path.isPrefixOf(i):F.isDocumentKey(n.path)?n.path.isEqual(i):n.path.isImmediateParentOf(i)}(r,t)&&function(n,s){for(const i of In(n))if(!i.field.isKeyField()&&s.data.field(i.field)===null)return!1;return!0}(r,t)&&function(n,s){for(const i of n.filters)if(!i.matches(s))return!1;return!0}(r,t)&&function(n,s){return!(n.startAt&&!function(a,u,l){const d=Su(a,u,l);return a.inclusive?d<=0:d<0}(n.startAt,In(n),s)||n.endAt&&!function(a,u,l){const d=Su(a,u,l);return a.inclusive?d>=0:d>0}(n.endAt,In(n),s))}(r,t)}function dl(r){return r.collectionGroup||(r.path.length%2==1?r.path.lastSegment():r.path.get(r.path.length-2))}function fl(r){return(t,e)=>{let n=!1;for(const s of In(r)){const i=Bf(s,t,e);if(i!==0)return i;n=n||s.field.isKeyField()}return 0}}function Bf(r,t,e){const n=r.field.isKeyField()?F.comparator(t.key,e.key):function(i,a,u){const l=a.data.field(i),d=u.data.field(i);return l!==null&&d!==null?we(l,d):O()}(r.field,t,e);switch(r.dir){case"asc":return n;case"desc":return-1*n;default:return O()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class be{constructor(t,e){this.mapKeyFn=t,this.equalsFn=e,this.inner={},this.innerSize=0}get(t){const e=this.mapKeyFn(t),n=this.inner[e];if(n!==void 0){for(const[s,i]of n)if(this.equalsFn(s,t))return i}}has(t){return this.get(t)!==void 0}set(t,e){const n=this.mapKeyFn(t),s=this.inner[n];if(s===void 0)return this.inner[n]=[[t,e]],void this.innerSize++;for(let i=0;i<s.length;i++)if(this.equalsFn(s[i][0],t))return void(s[i]=[t,e]);s.push([t,e]),this.innerSize++}delete(t){const e=this.mapKeyFn(t),n=this.inner[e];if(n===void 0)return!1;for(let s=0;s<n.length;s++)if(this.equalsFn(n[s][0],t))return n.length===1?delete this.inner[e]:n.splice(s,1),this.innerSize--,!0;return!1}forEach(t){tn(this.inner,(e,n)=>{for(const[s,i]of n)t(s,i)})}isEmpty(){return Xc(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qf=new nt(F.comparator);function qt(){return qf}const ml=new nt(F.comparator);function hr(...r){let t=ml;for(const e of r)t=t.insert(e.key,e);return t}function gl(r){let t=ml;return r.forEach((e,n)=>t=t.insert(e,n.overlayedDocument)),t}function Qt(){return _r()}function _l(){return _r()}function _r(){return new be(r=>r.toString(),(r,t)=>r.isEqual(t))}const Uf=new nt(F.comparator),Gf=new Z(F.comparator);function j(...r){let t=Gf;for(const e of r)t=t.add(e);return t}const Kf=new Z(G);function yo(){return Kf}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Io(r,t){if(r.useProto3Json){if(isNaN(t))return{doubleValue:"NaN"};if(t===1/0)return{doubleValue:"Infinity"};if(t===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:wr(t)?"-0":t}}function pl(r){return{integerValue:""+r}}function yl(r,t){return $c(t)?pl(t):Io(r,t)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class js{constructor(){this._=void 0}}function jf(r,t,e){return r instanceof An?function(s,i){const a={fields:{__type__:{stringValue:"server_timestamp"},__local_write_time__:{timestampValue:{seconds:s.seconds,nanos:s.nanoseconds}}}};return i&&Gs(i)&&(i=go(i)),i&&(a.fields.__previous_value__=i),{mapValue:a}}(e,t):r instanceof We?Tl(r,t):r instanceof He?El(r,t):function(s,i){const a=Il(s,i),u=Nu(a)+Nu(s.Pe);return ji(a)&&ji(s.Pe)?pl(u):Io(s.serializer,u)}(r,t)}function zf(r,t,e){return r instanceof We?Tl(r,t):r instanceof He?El(r,t):e}function Il(r,t){return r instanceof Rn?function(n){return ji(n)||function(i){return!!i&&"doubleValue"in i}(n)}(t)?t:{integerValue:0}:null}class An extends js{}class We extends js{constructor(t){super(),this.elements=t}}function Tl(r,t){const e=wl(t);for(const n of r.elements)e.some(s=>Jt(s,n))||e.push(n);return{arrayValue:{values:e}}}class He extends js{constructor(t){super(),this.elements=t}}function El(r,t){let e=wl(t);for(const n of r.elements)e=e.filter(s=>!Jt(s,n));return{arrayValue:{values:e}}}class Rn extends js{constructor(t,e){super(),this.serializer=t,this.Pe=e}}function Nu(r){return it(r.integerValue||r.doubleValue)}function wl(r){return Rr(r)&&r.arrayValue.values?r.arrayValue.values.slice():[]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Br{constructor(t,e){this.field=t,this.transform=e}}function Qf(r,t){return r.field.isEqual(t.field)&&function(n,s){return n instanceof We&&s instanceof We||n instanceof He&&s instanceof He?En(n.elements,s.elements,Jt):n instanceof Rn&&s instanceof Rn?Jt(n.Pe,s.Pe):n instanceof An&&s instanceof An}(r.transform,t.transform)}class $f{constructor(t,e){this.version=t,this.transformResults=e}}class at{constructor(t,e){this.updateTime=t,this.exists=e}static none(){return new at}static exists(t){return new at(void 0,t)}static updateTime(t){return new at(t)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(t){return this.exists===t.exists&&(this.updateTime?!!t.updateTime&&this.updateTime.isEqual(t.updateTime):!t.updateTime)}}function As(r,t){return r.updateTime!==void 0?t.isFoundDocument()&&t.version.isEqual(r.updateTime):r.exists===void 0||r.exists===t.isFoundDocument()}class zs{}function vl(r,t){if(!r.hasLocalMutations||t&&t.fields.length===0)return null;if(t===null)return r.isNoDocument()?new On(r.key,at.none()):new Mn(r.key,r.data,at.none());{const e=r.data,n=wt.empty();let s=new Z(ot.comparator);for(let i of t.fields)if(!s.has(i)){let a=e.field(i);a===null&&i.length>1&&(i=i.popLast(),a=e.field(i)),a===null?n.delete(i):n.set(i,a),s=s.add(i)}return new oe(r.key,n,new Bt(s.toArray()),at.none())}}function Wf(r,t,e){r instanceof Mn?function(s,i,a){const u=s.value.clone(),l=Fu(s.fieldTransforms,i,a.transformResults);u.setAll(l),i.convertToFoundDocument(a.version,u).setHasCommittedMutations()}(r,t,e):r instanceof oe?function(s,i,a){if(!As(s.precondition,i))return void i.convertToUnknownDocument(a.version);const u=Fu(s.fieldTransforms,i,a.transformResults),l=i.data;l.setAll(Al(s)),l.setAll(u),i.convertToFoundDocument(a.version,l).setHasCommittedMutations()}(r,t,e):function(s,i,a){i.convertToNoDocument(a.version).setHasCommittedMutations()}(0,t,e)}function pr(r,t,e,n){return r instanceof Mn?function(i,a,u,l){if(!As(i.precondition,a))return u;const d=i.value.clone(),f=Mu(i.fieldTransforms,l,a);return d.setAll(f),a.convertToFoundDocument(a.version,d).setHasLocalMutations(),null}(r,t,e,n):r instanceof oe?function(i,a,u,l){if(!As(i.precondition,a))return u;const d=Mu(i.fieldTransforms,l,a),f=a.data;return f.setAll(Al(i)),f.setAll(d),a.convertToFoundDocument(a.version,f).setHasLocalMutations(),u===null?null:u.unionWith(i.fieldMask.fields).unionWith(i.fieldTransforms.map(g=>g.field))}(r,t,e,n):function(i,a,u){return As(i.precondition,a)?(a.convertToNoDocument(a.version).setHasLocalMutations(),null):u}(r,t,e)}function Hf(r,t){let e=null;for(const n of r.fieldTransforms){const s=t.data.field(n.field),i=Il(n.transform,s||null);i!=null&&(e===null&&(e=wt.empty()),e.set(n.field,i))}return e||null}function ku(r,t){return r.type===t.type&&!!r.key.isEqual(t.key)&&!!r.precondition.isEqual(t.precondition)&&!!function(n,s){return n===void 0&&s===void 0||!(!n||!s)&&En(n,s,(i,a)=>Qf(i,a))}(r.fieldTransforms,t.fieldTransforms)&&(r.type===0?r.value.isEqual(t.value):r.type!==1||r.data.isEqual(t.data)&&r.fieldMask.isEqual(t.fieldMask))}class Mn extends zs{constructor(t,e,n,s=[]){super(),this.key=t,this.value=e,this.precondition=n,this.fieldTransforms=s,this.type=0}getFieldMask(){return null}}class oe extends zs{constructor(t,e,n,s,i=[]){super(),this.key=t,this.data=e,this.fieldMask=n,this.precondition=s,this.fieldTransforms=i,this.type=1}getFieldMask(){return this.fieldMask}}function Al(r){const t=new Map;return r.fieldMask.fields.forEach(e=>{if(!e.isEmpty()){const n=r.data.field(e);t.set(e,n)}}),t}function Fu(r,t,e){const n=new Map;L(r.length===e.length);for(let s=0;s<e.length;s++){const i=r[s],a=i.transform,u=t.data.field(i.field);n.set(i.field,zf(a,u,e[s]))}return n}function Mu(r,t,e){const n=new Map;for(const s of r){const i=s.transform,a=e.data.field(s.field);n.set(s.field,jf(i,a,t))}return n}class On extends zs{constructor(t,e){super(),this.key=t,this.precondition=e,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class To extends zs{constructor(t,e){super(),this.key=t,this.precondition=e,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Eo{constructor(t,e,n,s){this.batchId=t,this.localWriteTime=e,this.baseMutations=n,this.mutations=s}applyToRemoteDocument(t,e){const n=e.mutationResults;for(let s=0;s<this.mutations.length;s++){const i=this.mutations[s];i.key.isEqual(t.key)&&Wf(i,t,n[s])}}applyToLocalView(t,e){for(const n of this.baseMutations)n.key.isEqual(t.key)&&(e=pr(n,t,e,this.localWriteTime));for(const n of this.mutations)n.key.isEqual(t.key)&&(e=pr(n,t,e,this.localWriteTime));return e}applyToLocalDocumentSet(t,e){const n=_l();return this.mutations.forEach(s=>{const i=t.get(s.key),a=i.overlayedDocument;let u=this.applyToLocalView(a,i.mutatedFields);u=e.has(s.key)?null:u;const l=vl(a,u);l!==null&&n.set(s.key,l),a.isValidDocument()||a.convertToNoDocument(B.min())}),n}keys(){return this.mutations.reduce((t,e)=>t.add(e.key),j())}isEqual(t){return this.batchId===t.batchId&&En(this.mutations,t.mutations,(e,n)=>ku(e,n))&&En(this.baseMutations,t.baseMutations,(e,n)=>ku(e,n))}}class wo{constructor(t,e,n,s){this.batch=t,this.commitVersion=e,this.mutationResults=n,this.docVersions=s}static from(t,e,n){L(t.mutations.length===n.length);let s=function(){return Uf}();const i=t.mutations;for(let a=0;a<i.length;a++)s=s.insert(i[a].key,n[a].version);return new wo(t,e,n,s)}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vo{constructor(t,e){this.largestBatchId=t,this.mutation=e}getKey(){return this.mutation.key}isEqual(t){return t!==null&&this.mutation===t.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jf{constructor(t,e){this.count=t,this.unchangedNames=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var gt,$;function Rl(r){switch(r){default:return O();case V.CANCELLED:case V.UNKNOWN:case V.DEADLINE_EXCEEDED:case V.RESOURCE_EXHAUSTED:case V.INTERNAL:case V.UNAVAILABLE:case V.UNAUTHENTICATED:return!1;case V.INVALID_ARGUMENT:case V.NOT_FOUND:case V.ALREADY_EXISTS:case V.PERMISSION_DENIED:case V.FAILED_PRECONDITION:case V.ABORTED:case V.OUT_OF_RANGE:case V.UNIMPLEMENTED:case V.DATA_LOSS:return!0}}function Pl(r){if(r===void 0)return dt("GRPC error has no .code"),V.UNKNOWN;switch(r){case gt.OK:return V.OK;case gt.CANCELLED:return V.CANCELLED;case gt.UNKNOWN:return V.UNKNOWN;case gt.DEADLINE_EXCEEDED:return V.DEADLINE_EXCEEDED;case gt.RESOURCE_EXHAUSTED:return V.RESOURCE_EXHAUSTED;case gt.INTERNAL:return V.INTERNAL;case gt.UNAVAILABLE:return V.UNAVAILABLE;case gt.UNAUTHENTICATED:return V.UNAUTHENTICATED;case gt.INVALID_ARGUMENT:return V.INVALID_ARGUMENT;case gt.NOT_FOUND:return V.NOT_FOUND;case gt.ALREADY_EXISTS:return V.ALREADY_EXISTS;case gt.PERMISSION_DENIED:return V.PERMISSION_DENIED;case gt.FAILED_PRECONDITION:return V.FAILED_PRECONDITION;case gt.ABORTED:return V.ABORTED;case gt.OUT_OF_RANGE:return V.OUT_OF_RANGE;case gt.UNIMPLEMENTED:return V.UNIMPLEMENTED;case gt.DATA_LOSS:return V.DATA_LOSS;default:return O()}}($=gt||(gt={}))[$.OK=0]="OK",$[$.CANCELLED=1]="CANCELLED",$[$.UNKNOWN=2]="UNKNOWN",$[$.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",$[$.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",$[$.NOT_FOUND=5]="NOT_FOUND",$[$.ALREADY_EXISTS=6]="ALREADY_EXISTS",$[$.PERMISSION_DENIED=7]="PERMISSION_DENIED",$[$.UNAUTHENTICATED=16]="UNAUTHENTICATED",$[$.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",$[$.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",$[$.ABORTED=10]="ABORTED",$[$.OUT_OF_RANGE=11]="OUT_OF_RANGE",$[$.UNIMPLEMENTED=12]="UNIMPLEMENTED",$[$.INTERNAL=13]="INTERNAL",$[$.UNAVAILABLE=14]="UNAVAILABLE",$[$.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Vl(){return new TextEncoder}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Yf=new je([4294967295,4294967295],0);function Ou(r){const t=Vl().encode(r),e=new Nc;return e.update(t),new Uint8Array(e.digest())}function Lu(r){const t=new DataView(r.buffer),e=t.getUint32(0,!0),n=t.getUint32(4,!0),s=t.getUint32(8,!0),i=t.getUint32(12,!0);return[new je([e,n],0),new je([s,i],0)]}class Ao{constructor(t,e,n){if(this.bitmap=t,this.padding=e,this.hashCount=n,e<0||e>=8)throw new dr(`Invalid padding: ${e}`);if(n<0)throw new dr(`Invalid hash count: ${n}`);if(t.length>0&&this.hashCount===0)throw new dr(`Invalid hash count: ${n}`);if(t.length===0&&e!==0)throw new dr(`Invalid padding when bitmap length is 0: ${e}`);this.Ie=8*t.length-e,this.Te=je.fromNumber(this.Ie)}Ee(t,e,n){let s=t.add(e.multiply(je.fromNumber(n)));return s.compare(Yf)===1&&(s=new je([s.getBits(0),s.getBits(1)],0)),s.modulo(this.Te).toNumber()}de(t){return(this.bitmap[Math.floor(t/8)]&1<<t%8)!=0}mightContain(t){if(this.Ie===0)return!1;const e=Ou(t),[n,s]=Lu(e);for(let i=0;i<this.hashCount;i++){const a=this.Ee(n,s,i);if(!this.de(a))return!1}return!0}static create(t,e,n){const s=t%8==0?0:8-t%8,i=new Uint8Array(Math.ceil(t/8)),a=new Ao(i,s,e);return n.forEach(u=>a.insert(u)),a}insert(t){if(this.Ie===0)return;const e=Ou(t),[n,s]=Lu(e);for(let i=0;i<this.hashCount;i++){const a=this.Ee(n,s,i);this.Ae(a)}}Ae(t){const e=Math.floor(t/8),n=t%8;this.bitmap[e]|=1<<n}}class dr extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qr{constructor(t,e,n,s,i){this.snapshotVersion=t,this.targetChanges=e,this.targetMismatches=n,this.documentUpdates=s,this.resolvedLimboDocuments=i}static createSynthesizedRemoteEventForCurrentChange(t,e,n){const s=new Map;return s.set(t,Ur.createSynthesizedTargetChangeForCurrentChange(t,e,n)),new qr(B.min(),s,new nt(G),qt(),j())}}class Ur{constructor(t,e,n,s,i){this.resumeToken=t,this.current=e,this.addedDocuments=n,this.modifiedDocuments=s,this.removedDocuments=i}static createSynthesizedTargetChangeForCurrentChange(t,e,n){return new Ur(n,e,j(),j(),j())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rs{constructor(t,e,n,s){this.Re=t,this.removedTargetIds=e,this.key=n,this.Ve=s}}class Sl{constructor(t,e){this.targetId=t,this.me=e}}class bl{constructor(t,e,n=ht.EMPTY_BYTE_STRING,s=null){this.state=t,this.targetIds=e,this.resumeToken=n,this.cause=s}}class Bu{constructor(){this.fe=0,this.ge=Uu(),this.pe=ht.EMPTY_BYTE_STRING,this.ye=!1,this.we=!0}get current(){return this.ye}get resumeToken(){return this.pe}get Se(){return this.fe!==0}get be(){return this.we}De(t){t.approximateByteSize()>0&&(this.we=!0,this.pe=t)}ve(){let t=j(),e=j(),n=j();return this.ge.forEach((s,i)=>{switch(i){case 0:t=t.add(s);break;case 2:e=e.add(s);break;case 1:n=n.add(s);break;default:O()}}),new Ur(this.pe,this.ye,t,e,n)}Ce(){this.we=!1,this.ge=Uu()}Fe(t,e){this.we=!0,this.ge=this.ge.insert(t,e)}Me(t){this.we=!0,this.ge=this.ge.remove(t)}xe(){this.fe+=1}Oe(){this.fe-=1,L(this.fe>=0)}Ne(){this.we=!0,this.ye=!0}}class Xf{constructor(t){this.Le=t,this.Be=new Map,this.ke=qt(),this.qe=qu(),this.Qe=new nt(G)}Ke(t){for(const e of t.Re)t.Ve&&t.Ve.isFoundDocument()?this.$e(e,t.Ve):this.Ue(e,t.key,t.Ve);for(const e of t.removedTargetIds)this.Ue(e,t.key,t.Ve)}We(t){this.forEachTarget(t,e=>{const n=this.Ge(e);switch(t.state){case 0:this.ze(e)&&n.De(t.resumeToken);break;case 1:n.Oe(),n.Se||n.Ce(),n.De(t.resumeToken);break;case 2:n.Oe(),n.Se||this.removeTarget(e);break;case 3:this.ze(e)&&(n.Ne(),n.De(t.resumeToken));break;case 4:this.ze(e)&&(this.je(e),n.De(t.resumeToken));break;default:O()}})}forEachTarget(t,e){t.targetIds.length>0?t.targetIds.forEach(e):this.Be.forEach((n,s)=>{this.ze(s)&&e(s)})}He(t){const e=t.targetId,n=t.me.count,s=this.Je(e);if(s){const i=s.target;if(bs(i))if(n===0){const a=new F(i.path);this.Ue(e,a,st.newNoDocument(a,B.min()))}else L(n===1);else{const a=this.Ye(e);if(a!==n){const u=this.Ze(t),l=u?this.Xe(u,t,a):1;if(l!==0){this.je(e);const d=l===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Qe=this.Qe.insert(e,d)}}}}}Ze(t){const e=t.me.unchangedNames;if(!e||!e.bits)return null;const{bits:{bitmap:n="",padding:s=0},hashCount:i=0}=e;let a,u;try{a=Te(n).toUint8Array()}catch(l){if(l instanceof Zc)return Ht("Decoding the base64 bloom filter in existence filter failed ("+l.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw l}try{u=new Ao(a,s,i)}catch(l){return Ht(l instanceof dr?"BloomFilter error: ":"Applying bloom filter failed: ",l),null}return u.Ie===0?null:u}Xe(t,e,n){return e.me.count===n-this.nt(t,e.targetId)?0:2}nt(t,e){const n=this.Le.getRemoteKeysForTarget(e);let s=0;return n.forEach(i=>{const a=this.Le.tt(),u=`projects/${a.projectId}/databases/${a.database}/documents/${i.path.canonicalString()}`;t.mightContain(u)||(this.Ue(e,i,null),s++)}),s}rt(t){const e=new Map;this.Be.forEach((i,a)=>{const u=this.Je(a);if(u){if(i.current&&bs(u.target)){const l=new F(u.target.path);this.ke.get(l)!==null||this.it(a,l)||this.Ue(a,l,st.newNoDocument(l,t))}i.be&&(e.set(a,i.ve()),i.Ce())}});let n=j();this.qe.forEach((i,a)=>{let u=!0;a.forEachWhile(l=>{const d=this.Je(l);return!d||d.purpose==="TargetPurposeLimboResolution"||(u=!1,!1)}),u&&(n=n.add(i))}),this.ke.forEach((i,a)=>a.setReadTime(t));const s=new qr(t,e,this.Qe,this.ke,n);return this.ke=qt(),this.qe=qu(),this.Qe=new nt(G),s}$e(t,e){if(!this.ze(t))return;const n=this.it(t,e.key)?2:0;this.Ge(t).Fe(e.key,n),this.ke=this.ke.insert(e.key,e),this.qe=this.qe.insert(e.key,this.st(e.key).add(t))}Ue(t,e,n){if(!this.ze(t))return;const s=this.Ge(t);this.it(t,e)?s.Fe(e,1):s.Me(e),this.qe=this.qe.insert(e,this.st(e).delete(t)),n&&(this.ke=this.ke.insert(e,n))}removeTarget(t){this.Be.delete(t)}Ye(t){const e=this.Ge(t).ve();return this.Le.getRemoteKeysForTarget(t).size+e.addedDocuments.size-e.removedDocuments.size}xe(t){this.Ge(t).xe()}Ge(t){let e=this.Be.get(t);return e||(e=new Bu,this.Be.set(t,e)),e}st(t){let e=this.qe.get(t);return e||(e=new Z(G),this.qe=this.qe.insert(t,e)),e}ze(t){const e=this.Je(t)!==null;return e||C("WatchChangeAggregator","Detected inactive target",t),e}Je(t){const e=this.Be.get(t);return e&&e.Se?null:this.Le.ot(t)}je(t){this.Be.set(t,new Bu),this.Le.getRemoteKeysForTarget(t).forEach(e=>{this.Ue(t,e,null)})}it(t,e){return this.Le.getRemoteKeysForTarget(t).has(e)}}function qu(){return new nt(F.comparator)}function Uu(){return new nt(F.comparator)}const Zf={asc:"ASCENDING",desc:"DESCENDING"},tm={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},em={and:"AND",or:"OR"};class nm{constructor(t,e){this.databaseId=t,this.useProto3Json=e}}function Hi(r,t){return r.useProto3Json||Fr(t)?t:{value:t}}function Pn(r,t){return r.useProto3Json?`${new Date(1e3*t.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+t.nanoseconds).slice(-9)}Z`:{seconds:""+t.seconds,nanos:t.nanoseconds}}function Cl(r,t){return r.useProto3Json?t.toBase64():t.toUint8Array()}function rm(r,t){return Pn(r,t.toTimestamp())}function ft(r){return L(!!r),B.fromTimestamp(function(e){const n=re(e);return new ut(n.seconds,n.nanos)}(r))}function Ro(r,t){return Ji(r,t).canonicalString()}function Ji(r,t){const e=function(s){return new z(["projects",s.projectId,"databases",s.database])}(r).child("documents");return t===void 0?e:e.child(t)}function xl(r){const t=z.fromString(r);return L(Ul(t)),t}function Vr(r,t){return Ro(r.databaseId,t.path)}function Wt(r,t){const e=xl(t);if(e.get(1)!==r.databaseId.projectId)throw new b(V.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+e.get(1)+" vs "+r.databaseId.projectId);if(e.get(3)!==r.databaseId.database)throw new b(V.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+e.get(3)+" vs "+r.databaseId.database);return new F(kl(e))}function Dl(r,t){return Ro(r.databaseId,t)}function Nl(r){const t=xl(r);return t.length===4?z.emptyPath():kl(t)}function Yi(r){return new z(["projects",r.databaseId.projectId,"databases",r.databaseId.database]).canonicalString()}function kl(r){return L(r.length>4&&r.get(4)==="documents"),r.popFirst(5)}function Gu(r,t,e){return{name:Vr(r,t),fields:e.value.mapValue.fields}}function Fl(r,t,e){const n=Wt(r,t.name),s=ft(t.updateTime),i=t.createTime?ft(t.createTime):B.min(),a=new wt({mapValue:{fields:t.fields}}),u=st.newFoundDocument(n,s,i,a);return e&&u.setHasCommittedMutations(),e?u.setHasCommittedMutations():u}function sm(r,t){return"found"in t?function(n,s){L(!!s.found),s.found.name,s.found.updateTime;const i=Wt(n,s.found.name),a=ft(s.found.updateTime),u=s.found.createTime?ft(s.found.createTime):B.min(),l=new wt({mapValue:{fields:s.found.fields}});return st.newFoundDocument(i,a,u,l)}(r,t):"missing"in t?function(n,s){L(!!s.missing),L(!!s.readTime);const i=Wt(n,s.missing),a=ft(s.readTime);return st.newNoDocument(i,a)}(r,t):O()}function im(r,t){let e;if("targetChange"in t){t.targetChange;const n=function(d){return d==="NO_CHANGE"?0:d==="ADD"?1:d==="REMOVE"?2:d==="CURRENT"?3:d==="RESET"?4:O()}(t.targetChange.targetChangeType||"NO_CHANGE"),s=t.targetChange.targetIds||[],i=function(d,f){return d.useProto3Json?(L(f===void 0||typeof f=="string"),ht.fromBase64String(f||"")):(L(f===void 0||f instanceof Buffer||f instanceof Uint8Array),ht.fromUint8Array(f||new Uint8Array))}(r,t.targetChange.resumeToken),a=t.targetChange.cause,u=a&&function(d){const f=d.code===void 0?V.UNKNOWN:Pl(d.code);return new b(f,d.message||"")}(a);e=new bl(n,s,i,u||null)}else if("documentChange"in t){t.documentChange;const n=t.documentChange;n.document,n.document.name,n.document.updateTime;const s=Wt(r,n.document.name),i=ft(n.document.updateTime),a=n.document.createTime?ft(n.document.createTime):B.min(),u=new wt({mapValue:{fields:n.document.fields}}),l=st.newFoundDocument(s,i,a,u),d=n.targetIds||[],f=n.removedTargetIds||[];e=new Rs(d,f,l.key,l)}else if("documentDelete"in t){t.documentDelete;const n=t.documentDelete;n.document;const s=Wt(r,n.document),i=n.readTime?ft(n.readTime):B.min(),a=st.newNoDocument(s,i),u=n.removedTargetIds||[];e=new Rs([],u,a.key,a)}else if("documentRemove"in t){t.documentRemove;const n=t.documentRemove;n.document;const s=Wt(r,n.document),i=n.removedTargetIds||[];e=new Rs([],i,s,null)}else{if(!("filter"in t))return O();{t.filter;const n=t.filter;n.targetId;const{count:s=0,unchangedNames:i}=n,a=new Jf(s,i),u=n.targetId;e=new Sl(u,a)}}return e}function Sr(r,t){let e;if(t instanceof Mn)e={update:Gu(r,t.key,t.value)};else if(t instanceof On)e={delete:Vr(r,t.key)};else if(t instanceof oe)e={update:Gu(r,t.key,t.data),updateMask:hm(t.fieldMask)};else{if(!(t instanceof To))return O();e={verify:Vr(r,t.key)}}return t.fieldTransforms.length>0&&(e.updateTransforms=t.fieldTransforms.map(n=>function(i,a){const u=a.transform;if(u instanceof An)return{fieldPath:a.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(u instanceof We)return{fieldPath:a.field.canonicalString(),appendMissingElements:{values:u.elements}};if(u instanceof He)return{fieldPath:a.field.canonicalString(),removeAllFromArray:{values:u.elements}};if(u instanceof Rn)return{fieldPath:a.field.canonicalString(),increment:u.Pe};throw O()}(0,n))),t.precondition.isNone||(e.currentDocument=function(s,i){return i.updateTime!==void 0?{updateTime:rm(s,i.updateTime)}:i.exists!==void 0?{exists:i.exists}:O()}(r,t.precondition)),e}function Xi(r,t){const e=t.currentDocument?function(i){return i.updateTime!==void 0?at.updateTime(ft(i.updateTime)):i.exists!==void 0?at.exists(i.exists):at.none()}(t.currentDocument):at.none(),n=t.updateTransforms?t.updateTransforms.map(s=>function(a,u){let l=null;if("setToServerValue"in u)L(u.setToServerValue==="REQUEST_TIME"),l=new An;else if("appendMissingElements"in u){const f=u.appendMissingElements.values||[];l=new We(f)}else if("removeAllFromArray"in u){const f=u.removeAllFromArray.values||[];l=new He(f)}else"increment"in u?l=new Rn(a,u.increment):O();const d=ot.fromServerFormat(u.fieldPath);return new Br(d,l)}(r,s)):[];if(t.update){t.update.name;const s=Wt(r,t.update.name),i=new wt({mapValue:{fields:t.update.fields}});if(t.updateMask){const a=function(l){const d=l.fieldPaths||[];return new Bt(d.map(f=>ot.fromServerFormat(f)))}(t.updateMask);return new oe(s,i,a,e,n)}return new Mn(s,i,e,n)}if(t.delete){const s=Wt(r,t.delete);return new On(s,e)}if(t.verify){const s=Wt(r,t.verify);return new To(s,e)}return O()}function om(r,t){return r&&r.length>0?(L(t!==void 0),r.map(e=>function(s,i){let a=s.updateTime?ft(s.updateTime):ft(i);return a.isEqual(B.min())&&(a=ft(i)),new $f(a,s.transformResults||[])}(e,t))):[]}function Ml(r,t){return{documents:[Dl(r,t.path)]}}function Ol(r,t){const e={structuredQuery:{}},n=t.path;let s;t.collectionGroup!==null?(s=n,e.structuredQuery.from=[{collectionId:t.collectionGroup,allDescendants:!0}]):(s=n.popLast(),e.structuredQuery.from=[{collectionId:n.lastSegment()}]),e.parent=Dl(r,s);const i=function(d){if(d.length!==0)return ql(X.create(d,"and"))}(t.filters);i&&(e.structuredQuery.where=i);const a=function(d){if(d.length!==0)return d.map(f=>function(I){return{field:_n(I.field),direction:um(I.dir)}}(f))}(t.orderBy);a&&(e.structuredQuery.orderBy=a);const u=Hi(r,t.limit);return u!==null&&(e.structuredQuery.limit=u),t.startAt&&(e.structuredQuery.startAt=function(d){return{before:d.inclusive,values:d.position}}(t.startAt)),t.endAt&&(e.structuredQuery.endAt=function(d){return{before:!d.inclusive,values:d.position}}(t.endAt)),{_t:e,parent:s}}function Ll(r){let t=Nl(r.parent);const e=r.structuredQuery,n=e.from?e.from.length:0;let s=null;if(n>0){L(n===1);const f=e.from[0];f.allDescendants?s=f.collectionId:t=t.child(f.collectionId)}let i=[];e.where&&(i=function(g){const I=Bl(g);return I instanceof X&&_o(I)?I.getFilters():[I]}(e.where));let a=[];e.orderBy&&(a=function(g){return g.map(I=>function(x){return new Pr(pn(x.field),function(D){switch(D){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(x.direction))}(I))}(e.orderBy));let u=null;e.limit&&(u=function(g){let I;return I=typeof g=="object"?g.value:g,Fr(I)?null:I}(e.limit));let l=null;e.startAt&&(l=function(g){const I=!!g.before,P=g.values||[];return new ve(P,I)}(e.startAt));let d=null;return e.endAt&&(d=function(g){const I=!g.before,P=g.values||[];return new ve(P,I)}(e.endAt)),ll(t,s,a,i,u,"F",l,d)}function am(r,t){const e=function(s){switch(s){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return O()}}(t.purpose);return e==null?null:{"goog-listen-tags":e}}function Bl(r){return r.unaryFilter!==void 0?function(e){switch(e.unaryFilter.op){case"IS_NAN":const n=pn(e.unaryFilter.field);return Q.create(n,"==",{doubleValue:NaN});case"IS_NULL":const s=pn(e.unaryFilter.field);return Q.create(s,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const i=pn(e.unaryFilter.field);return Q.create(i,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const a=pn(e.unaryFilter.field);return Q.create(a,"!=",{nullValue:"NULL_VALUE"});default:return O()}}(r):r.fieldFilter!==void 0?function(e){return Q.create(pn(e.fieldFilter.field),function(s){switch(s){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";default:return O()}}(e.fieldFilter.op),e.fieldFilter.value)}(r):r.compositeFilter!==void 0?function(e){return X.create(e.compositeFilter.filters.map(n=>Bl(n)),function(s){switch(s){case"AND":return"and";case"OR":return"or";default:return O()}}(e.compositeFilter.op))}(r):O()}function um(r){return Zf[r]}function cm(r){return tm[r]}function lm(r){return em[r]}function _n(r){return{fieldPath:r.canonicalString()}}function pn(r){return ot.fromServerFormat(r.fieldPath)}function ql(r){return r instanceof Q?function(e){if(e.op==="=="){if(Ru(e.value))return{unaryFilter:{field:_n(e.field),op:"IS_NAN"}};if(Au(e.value))return{unaryFilter:{field:_n(e.field),op:"IS_NULL"}}}else if(e.op==="!="){if(Ru(e.value))return{unaryFilter:{field:_n(e.field),op:"IS_NOT_NAN"}};if(Au(e.value))return{unaryFilter:{field:_n(e.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:_n(e.field),op:cm(e.op),value:e.value}}}(r):r instanceof X?function(e){const n=e.getFilters().map(s=>ql(s));return n.length===1?n[0]:{compositeFilter:{op:lm(e.op),filters:n}}}(r):O()}function hm(r){const t=[];return r.fields.forEach(e=>t.push(e.canonicalString())),{fieldPaths:t}}function Ul(r){return r.length>=4&&r.get(0)==="projects"&&r.get(2)==="databases"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ne{constructor(t,e,n,s,i=B.min(),a=B.min(),u=ht.EMPTY_BYTE_STRING,l=null){this.target=t,this.targetId=e,this.purpose=n,this.sequenceNumber=s,this.snapshotVersion=i,this.lastLimboFreeSnapshotVersion=a,this.resumeToken=u,this.expectedCount=l}withSequenceNumber(t){return new ne(this.target,this.targetId,this.purpose,t,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(t,e){return new ne(this.target,this.targetId,this.purpose,this.sequenceNumber,e,this.lastLimboFreeSnapshotVersion,t,null)}withExpectedCount(t){return new ne(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,t)}withLastLimboFreeSnapshotVersion(t){return new ne(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,t,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gl{constructor(t){this.ct=t}}function dm(r,t){let e;if(t.document)e=Fl(r.ct,t.document,!!t.hasCommittedMutations);else if(t.noDocument){const n=F.fromSegments(t.noDocument.path),s=Ye(t.noDocument.readTime);e=st.newNoDocument(n,s),t.hasCommittedMutations&&e.setHasCommittedMutations()}else{if(!t.unknownDocument)return O();{const n=F.fromSegments(t.unknownDocument.path),s=Ye(t.unknownDocument.version);e=st.newUnknownDocument(n,s)}}return t.readTime&&e.setReadTime(function(s){const i=new ut(s[0],s[1]);return B.fromTimestamp(i)}(t.readTime)),e}function Ku(r,t){const e=t.key,n={prefixPath:e.getCollectionPath().popLast().toArray(),collectionGroup:e.collectionGroup,documentId:e.path.lastSegment(),readTime:Ds(t.readTime),hasCommittedMutations:t.hasCommittedMutations};if(t.isFoundDocument())n.document=function(i,a){return{name:Vr(i,a.key),fields:a.data.value.mapValue.fields,updateTime:Pn(i,a.version.toTimestamp()),createTime:Pn(i,a.createTime.toTimestamp())}}(r.ct,t);else if(t.isNoDocument())n.noDocument={path:e.path.toArray(),readTime:Je(t.version)};else{if(!t.isUnknownDocument())return O();n.unknownDocument={path:e.path.toArray(),version:Je(t.version)}}return n}function Ds(r){const t=r.toTimestamp();return[t.seconds,t.nanoseconds]}function Je(r){const t=r.toTimestamp();return{seconds:t.seconds,nanoseconds:t.nanoseconds}}function Ye(r){const t=new ut(r.seconds,r.nanoseconds);return B.fromTimestamp(t)}function Le(r,t){const e=(t.baseMutations||[]).map(i=>Xi(r.ct,i));for(let i=0;i<t.mutations.length-1;++i){const a=t.mutations[i];if(i+1<t.mutations.length&&t.mutations[i+1].transform!==void 0){const u=t.mutations[i+1];a.updateTransforms=u.transform.fieldTransforms,t.mutations.splice(i+1,1),++i}}const n=t.mutations.map(i=>Xi(r.ct,i)),s=ut.fromMillis(t.localWriteTimeMs);return new Eo(t.batchId,s,e,n)}function fr(r){const t=Ye(r.readTime),e=r.lastLimboFreeSnapshotVersion!==void 0?Ye(r.lastLimboFreeSnapshotVersion):B.min();let n;return n=function(i){return i.documents!==void 0}(r.query)?function(i){return L(i.documents.length===1),Ft(Fn(Nl(i.documents[0])))}(r.query):function(i){return Ft(Ll(i))}(r.query),new ne(n,r.targetId,"TargetPurposeListen",r.lastListenSequenceNumber,t,e,ht.fromBase64String(r.resumeToken))}function Kl(r,t){const e=Je(t.snapshotVersion),n=Je(t.lastLimboFreeSnapshotVersion);let s;s=bs(t.target)?Ml(r.ct,t.target):Ol(r.ct,t.target)._t;const i=t.resumeToken.toBase64();return{targetId:t.targetId,canonicalId:$e(t.target),readTime:e,resumeToken:i,lastListenSequenceNumber:t.sequenceNumber,lastLimboFreeSnapshotVersion:n,query:s}}function Po(r){const t=Ll({parent:r.parent,structuredQuery:r.structuredQuery});return r.limitType==="LAST"?xs(t,t.limit,"L"):t}function ki(r,t){return new vo(t.largestBatchId,Xi(r.ct,t.overlayMutation))}function ju(r,t){const e=t.path.lastSegment();return[r,kt(t.path.popLast()),e]}function zu(r,t,e,n){return{indexId:r,uid:t,sequenceNumber:e,readTime:Je(n.readTime),documentKey:kt(n.documentKey.path),largestBatchId:n.largestBatchId}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fm{getBundleMetadata(t,e){return Qu(t).get(e).next(n=>{if(n)return function(i){return{id:i.bundleId,createTime:Ye(i.createTime),version:i.version}}(n)})}saveBundleMetadata(t,e){return Qu(t).put(function(s){return{bundleId:s.id,createTime:Je(ft(s.createTime)),version:s.version}}(e))}getNamedQuery(t,e){return $u(t).get(e).next(n=>{if(n)return function(i){return{name:i.name,query:Po(i.bundledQuery),readTime:Ye(i.readTime)}}(n)})}saveNamedQuery(t,e){return $u(t).put(function(s){return{name:s.name,readTime:Je(ft(s.readTime)),bundledQuery:s.bundledQuery}}(e))}}function Qu(r){return pt(r,"bundles")}function $u(r){return pt(r,"namedQueries")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qs{constructor(t,e){this.serializer=t,this.userId=e}static lt(t,e){const n=e.uid||"";return new Qs(t,n)}getOverlay(t,e){return ir(t).get(ju(this.userId,e)).next(n=>n?ki(this.serializer,n):null)}getOverlays(t,e){const n=Qt();return A.forEach(e,s=>this.getOverlay(t,s).next(i=>{i!==null&&n.set(s,i)})).next(()=>n)}saveOverlays(t,e,n){const s=[];return n.forEach((i,a)=>{const u=new vo(e,a);s.push(this.ht(t,u))}),A.waitFor(s)}removeOverlaysForBatchId(t,e,n){const s=new Set;e.forEach(a=>s.add(kt(a.getCollectionPath())));const i=[];return s.forEach(a=>{const u=IDBKeyRange.bound([this.userId,a,n],[this.userId,a,n+1],!1,!0);i.push(ir(t).j("collectionPathOverlayIndex",u))}),A.waitFor(i)}getOverlaysForCollection(t,e,n){const s=Qt(),i=kt(e),a=IDBKeyRange.bound([this.userId,i,n],[this.userId,i,Number.POSITIVE_INFINITY],!0);return ir(t).U("collectionPathOverlayIndex",a).next(u=>{for(const l of u){const d=ki(this.serializer,l);s.set(d.getKey(),d)}return s})}getOverlaysForCollectionGroup(t,e,n,s){const i=Qt();let a;const u=IDBKeyRange.bound([this.userId,e,n],[this.userId,e,Number.POSITIVE_INFINITY],!0);return ir(t).J({index:"collectionGroupOverlayIndex",range:u},(l,d,f)=>{const g=ki(this.serializer,d);i.size()<s||g.largestBatchId===a?(i.set(g.getKey(),g),a=g.largestBatchId):f.done()}).next(()=>i)}ht(t,e){return ir(t).put(function(s,i,a){const[u,l,d]=ju(i,a.mutation.key);return{userId:i,collectionPath:l,documentId:d,collectionGroup:a.mutation.key.getCollectionGroup(),largestBatchId:a.largestBatchId,overlayMutation:Sr(s.ct,a.mutation)}}(this.serializer,this.userId,e))}}function ir(r){return pt(r,"documentOverlays")}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mm{Pt(t){return pt(t,"globals")}getSessionToken(t){return this.Pt(t).get("sessionToken").next(e=>{const n=e==null?void 0:e.value;return n?ht.fromUint8Array(n):ht.EMPTY_BYTE_STRING})}setSessionToken(t,e){return this.Pt(t).put({name:"sessionToken",value:e.toUint8Array()})}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Be{constructor(){}It(t,e){this.Tt(t,e),e.Et()}Tt(t,e){if("nullValue"in t)this.dt(e,5);else if("booleanValue"in t)this.dt(e,10),e.At(t.booleanValue?1:0);else if("integerValue"in t)this.dt(e,15),e.At(it(t.integerValue));else if("doubleValue"in t){const n=it(t.doubleValue);isNaN(n)?this.dt(e,13):(this.dt(e,15),wr(n)?e.At(0):e.At(n))}else if("timestampValue"in t){let n=t.timestampValue;this.dt(e,20),typeof n=="string"&&(n=re(n)),e.Rt(`${n.seconds||""}`),e.At(n.nanos||0)}else if("stringValue"in t)this.Vt(t.stringValue,e),this.ft(e);else if("bytesValue"in t)this.dt(e,30),e.gt(Te(t.bytesValue)),this.ft(e);else if("referenceValue"in t)this.yt(t.referenceValue,e);else if("geoPointValue"in t){const n=t.geoPointValue;this.dt(e,45),e.At(n.latitude||0),e.At(n.longitude||0)}else"mapValue"in t?tl(t)?this.dt(e,Number.MAX_SAFE_INTEGER):Ks(t)?this.wt(t.mapValue,e):(this.St(t.mapValue,e),this.ft(e)):"arrayValue"in t?(this.bt(t.arrayValue,e),this.ft(e)):O()}Vt(t,e){this.dt(e,25),this.Dt(t,e)}Dt(t,e){e.Rt(t)}St(t,e){const n=t.fields||{};this.dt(e,55);for(const s of Object.keys(n))this.Vt(s,e),this.Tt(n[s],e)}wt(t,e){var n,s;const i=t.fields||{};this.dt(e,53);const a="value",u=((s=(n=i[a].arrayValue)===null||n===void 0?void 0:n.values)===null||s===void 0?void 0:s.length)||0;this.dt(e,15),e.At(it(u)),this.Vt(a,e),this.Tt(i[a],e)}bt(t,e){const n=t.values||[];this.dt(e,50);for(const s of n)this.Tt(s,e)}yt(t,e){this.dt(e,37),F.fromName(t).path.forEach(n=>{this.dt(e,60),this.Dt(n,e)})}dt(t,e){t.At(e)}ft(t){t.At(2)}}Be.vt=new Be;function gm(r){if(r===0)return 8;let t=0;return!(r>>4)&&(t+=4,r<<=4),!(r>>6)&&(t+=2,r<<=2),!(r>>7)&&(t+=1),t}function Wu(r){const t=64-function(n){let s=0;for(let i=0;i<8;++i){const a=gm(255&n[i]);if(s+=a,a!==8)break}return s}(r);return Math.ceil(t/8)}class _m{constructor(){this.buffer=new Uint8Array(1024),this.position=0}Ct(t){const e=t[Symbol.iterator]();let n=e.next();for(;!n.done;)this.Ft(n.value),n=e.next();this.Mt()}xt(t){const e=t[Symbol.iterator]();let n=e.next();for(;!n.done;)this.Ot(n.value),n=e.next();this.Nt()}Lt(t){for(const e of t){const n=e.charCodeAt(0);if(n<128)this.Ft(n);else if(n<2048)this.Ft(960|n>>>6),this.Ft(128|63&n);else if(e<"\uD800"||"\uDBFF"<e)this.Ft(480|n>>>12),this.Ft(128|63&n>>>6),this.Ft(128|63&n);else{const s=e.codePointAt(0);this.Ft(240|s>>>18),this.Ft(128|63&s>>>12),this.Ft(128|63&s>>>6),this.Ft(128|63&s)}}this.Mt()}Bt(t){for(const e of t){const n=e.charCodeAt(0);if(n<128)this.Ot(n);else if(n<2048)this.Ot(960|n>>>6),this.Ot(128|63&n);else if(e<"\uD800"||"\uDBFF"<e)this.Ot(480|n>>>12),this.Ot(128|63&n>>>6),this.Ot(128|63&n);else{const s=e.codePointAt(0);this.Ot(240|s>>>18),this.Ot(128|63&s>>>12),this.Ot(128|63&s>>>6),this.Ot(128|63&s)}}this.Nt()}kt(t){const e=this.qt(t),n=Wu(e);this.Qt(1+n),this.buffer[this.position++]=255&n;for(let s=e.length-n;s<e.length;++s)this.buffer[this.position++]=255&e[s]}Kt(t){const e=this.qt(t),n=Wu(e);this.Qt(1+n),this.buffer[this.position++]=~(255&n);for(let s=e.length-n;s<e.length;++s)this.buffer[this.position++]=~(255&e[s])}$t(){this.Ut(255),this.Ut(255)}Wt(){this.Gt(255),this.Gt(255)}reset(){this.position=0}seed(t){this.Qt(t.length),this.buffer.set(t,this.position),this.position+=t.length}zt(){return this.buffer.slice(0,this.position)}qt(t){const e=function(i){const a=new DataView(new ArrayBuffer(8));return a.setFloat64(0,i,!1),new Uint8Array(a.buffer)}(t),n=(128&e[0])!=0;e[0]^=n?255:128;for(let s=1;s<e.length;++s)e[s]^=n?255:0;return e}Ft(t){const e=255&t;e===0?(this.Ut(0),this.Ut(255)):e===255?(this.Ut(255),this.Ut(0)):this.Ut(e)}Ot(t){const e=255&t;e===0?(this.Gt(0),this.Gt(255)):e===255?(this.Gt(255),this.Gt(0)):this.Gt(t)}Mt(){this.Ut(0),this.Ut(1)}Nt(){this.Gt(0),this.Gt(1)}Ut(t){this.Qt(1),this.buffer[this.position++]=t}Gt(t){this.Qt(1),this.buffer[this.position++]=~t}Qt(t){const e=t+this.position;if(e<=this.buffer.length)return;let n=2*this.buffer.length;n<e&&(n=e);const s=new Uint8Array(n);s.set(this.buffer),this.buffer=s}}class pm{constructor(t){this.jt=t}gt(t){this.jt.Ct(t)}Rt(t){this.jt.Lt(t)}At(t){this.jt.kt(t)}Et(){this.jt.$t()}}class ym{constructor(t){this.jt=t}gt(t){this.jt.xt(t)}Rt(t){this.jt.Bt(t)}At(t){this.jt.Kt(t)}Et(){this.jt.Wt()}}class or{constructor(){this.jt=new _m,this.Ht=new pm(this.jt),this.Jt=new ym(this.jt)}seed(t){this.jt.seed(t)}Yt(t){return t===0?this.Ht:this.Jt}zt(){return this.jt.zt()}reset(){this.jt.reset()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qe{constructor(t,e,n,s){this.indexId=t,this.documentKey=e,this.arrayValue=n,this.directionalValue=s}Zt(){const t=this.directionalValue.length,e=t===0||this.directionalValue[t-1]===255?t+1:t,n=new Uint8Array(e);return n.set(this.directionalValue,0),e!==t?n.set([0],this.directionalValue.length):++n[n.length-1],new qe(this.indexId,this.documentKey,this.arrayValue,n)}}function de(r,t){let e=r.indexId-t.indexId;return e!==0?e:(e=Hu(r.arrayValue,t.arrayValue),e!==0?e:(e=Hu(r.directionalValue,t.directionalValue),e!==0?e:F.comparator(r.documentKey,t.documentKey)))}function Hu(r,t){for(let e=0;e<r.length&&e<t.length;++e){const n=r[e]-t[e];if(n!==0)return n}return r.length-t.length}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ju{constructor(t){this.Xt=new Z((e,n)=>ot.comparator(e.field,n.field)),this.collectionId=t.collectionGroup!=null?t.collectionGroup:t.path.lastSegment(),this.en=t.orderBy,this.tn=[];for(const e of t.filters){const n=e;n.isInequality()?this.Xt=this.Xt.add(n):this.tn.push(n)}}get nn(){return this.Xt.size>1}rn(t){if(L(t.collectionGroup===this.collectionId),this.nn)return!1;const e=Ui(t);if(e!==void 0&&!this.sn(e))return!1;const n=Me(t);let s=new Set,i=0,a=0;for(;i<n.length&&this.sn(n[i]);++i)s=s.add(n[i].fieldPath.canonicalString());if(i===n.length)return!0;if(this.Xt.size>0){const u=this.Xt.getIterator().getNext();if(!s.has(u.field.canonicalString())){const l=n[i];if(!this.on(u,l)||!this._n(this.en[a++],l))return!1}++i}for(;i<n.length;++i){const u=n[i];if(a>=this.en.length||!this._n(this.en[a++],u))return!1}return!0}an(){if(this.nn)return null;let t=new Z(ot.comparator);const e=[];for(const n of this.tn)if(!n.field.isKeyField())if(n.op==="array-contains"||n.op==="array-contains-any")e.push(new Ts(n.field,2));else{if(t.has(n.field))continue;t=t.add(n.field),e.push(new Ts(n.field,0))}for(const n of this.en)n.field.isKeyField()||t.has(n.field)||(t=t.add(n.field),e.push(new Ts(n.field,n.dir==="asc"?0:1)));return new Ss(Ss.UNKNOWN_ID,this.collectionId,e,Er.empty())}sn(t){for(const e of this.tn)if(this.on(e,t))return!0;return!1}on(t,e){if(t===void 0||!t.field.isEqual(e.fieldPath))return!1;const n=t.op==="array-contains"||t.op==="array-contains-any";return e.kind===2===n}_n(t,e){return!!t.field.isEqual(e.fieldPath)&&(e.kind===0&&t.dir==="asc"||e.kind===1&&t.dir==="desc")}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function jl(r){var t,e;if(L(r instanceof Q||r instanceof X),r instanceof Q){if(r instanceof cl){const s=((e=(t=r.value.arrayValue)===null||t===void 0?void 0:t.values)===null||e===void 0?void 0:e.map(i=>Q.create(r.field,"==",i)))||[];return X.create(s,"or")}return r}const n=r.filters.map(s=>jl(s));return X.create(n,r.op)}function Im(r){if(r.getFilters().length===0)return[];const t=eo(jl(r));return L(zl(t)),Zi(t)||to(t)?[t]:t.getFilters()}function Zi(r){return r instanceof Q}function to(r){return r instanceof X&&_o(r)}function zl(r){return Zi(r)||to(r)||function(e){if(e instanceof X&&zi(e)){for(const n of e.getFilters())if(!Zi(n)&&!to(n))return!1;return!0}return!1}(r)}function eo(r){if(L(r instanceof Q||r instanceof X),r instanceof Q)return r;if(r.filters.length===1)return eo(r.filters[0]);const t=r.filters.map(n=>eo(n));let e=X.create(t,r.op);return e=Ns(e),zl(e)?e:(L(e instanceof X),L(vn(e)),L(e.filters.length>1),e.filters.reduce((n,s)=>Vo(n,s)))}function Vo(r,t){let e;return L(r instanceof Q||r instanceof X),L(t instanceof Q||t instanceof X),e=r instanceof Q?t instanceof Q?function(s,i){return X.create([s,i],"and")}(r,t):Yu(r,t):t instanceof Q?Yu(t,r):function(s,i){if(L(s.filters.length>0&&i.filters.length>0),vn(s)&&vn(i))return ol(s,i.getFilters());const a=zi(s)?s:i,u=zi(s)?i:s,l=a.filters.map(d=>Vo(d,u));return X.create(l,"or")}(r,t),Ns(e)}function Yu(r,t){if(vn(t))return ol(t,r.getFilters());{const e=t.filters.map(n=>Vo(r,n));return X.create(e,"or")}}function Ns(r){if(L(r instanceof Q||r instanceof X),r instanceof Q)return r;const t=r.getFilters();if(t.length===1)return Ns(t[0]);if(sl(r))return r;const e=t.map(s=>Ns(s)),n=[];return e.forEach(s=>{s instanceof Q?n.push(s):s instanceof X&&(s.op===r.op?n.push(...s.filters):n.push(s))}),n.length===1?n[0]:X.create(n,r.op)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Tm{constructor(){this.un=new So}addToCollectionParentIndex(t,e){return this.un.add(e),A.resolve()}getCollectionParents(t,e){return A.resolve(this.un.getEntries(e))}addFieldIndex(t,e){return A.resolve()}deleteFieldIndex(t,e){return A.resolve()}deleteAllFieldIndexes(t){return A.resolve()}createTargetIndexes(t,e){return A.resolve()}getDocumentsMatchingTarget(t,e){return A.resolve(null)}getIndexType(t,e){return A.resolve(0)}getFieldIndexes(t,e){return A.resolve([])}getNextCollectionGroupToUpdate(t){return A.resolve(null)}getMinOffset(t,e){return A.resolve(Gt.min())}getMinOffsetFromCollectionGroup(t,e){return A.resolve(Gt.min())}updateCollectionGroup(t,e,n){return A.resolve()}updateIndexEntries(t,e){return A.resolve()}}class So{constructor(){this.index={}}add(t){const e=t.lastSegment(),n=t.popLast(),s=this.index[e]||new Z(z.comparator),i=!s.has(n);return this.index[e]=s.add(n),i}has(t){const e=t.lastSegment(),n=t.popLast(),s=this.index[e];return s&&s.has(n)}getEntries(t){return(this.index[t]||new Z(z.comparator)).toArray()}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const gs=new Uint8Array(0);class Em{constructor(t,e){this.databaseId=e,this.cn=new So,this.ln=new be(n=>$e(n),(n,s)=>Mr(n,s)),this.uid=t.uid||""}addToCollectionParentIndex(t,e){if(!this.cn.has(e)){const n=e.lastSegment(),s=e.popLast();t.addOnCommittedListener(()=>{this.cn.add(e)});const i={collectionId:n,parent:kt(s)};return Xu(t).put(i)}return A.resolve()}getCollectionParents(t,e){const n=[],s=IDBKeyRange.bound([e,""],[Uc(e),""],!1,!0);return Xu(t).U(s).next(i=>{for(const a of i){if(a.collectionId!==e)break;n.push(zt(a.parent))}return n})}addFieldIndex(t,e){const n=ar(t),s=function(u){return{indexId:u.indexId,collectionGroup:u.collectionGroup,fields:u.fields.map(l=>[l.fieldPath.canonicalString(),l.kind])}}(e);delete s.indexId;const i=n.add(s);if(e.indexState){const a=dn(t);return i.next(u=>{a.put(zu(u,this.uid,e.indexState.sequenceNumber,e.indexState.offset))})}return i.next()}deleteFieldIndex(t,e){const n=ar(t),s=dn(t),i=hn(t);return n.delete(e.indexId).next(()=>s.delete(IDBKeyRange.bound([e.indexId],[e.indexId+1],!1,!0))).next(()=>i.delete(IDBKeyRange.bound([e.indexId],[e.indexId+1],!1,!0)))}deleteAllFieldIndexes(t){const e=ar(t),n=hn(t),s=dn(t);return e.j().next(()=>n.j()).next(()=>s.j())}createTargetIndexes(t,e){return A.forEach(this.hn(e),n=>this.getIndexType(t,n).next(s=>{if(s===0||s===1){const i=new Ju(n).an();if(i!=null)return this.addFieldIndex(t,i)}}))}getDocumentsMatchingTarget(t,e){const n=hn(t);let s=!0;const i=new Map;return A.forEach(this.hn(e),a=>this.Pn(t,a).next(u=>{s&&(s=!!u),i.set(a,u)})).next(()=>{if(s){let a=j();const u=[];return A.forEach(i,(l,d)=>{C("IndexedDbIndexManager",`Using index ${function(q){return`id=${q.indexId}|cg=${q.collectionGroup}|f=${q.fields.map(Y=>`${Y.fieldPath}:${Y.kind}`).join(",")}`}(l)} to execute ${$e(e)}`);const f=function(q,Y){const et=Ui(Y);if(et===void 0)return null;for(const W of Cs(q,et.fieldPath))switch(W.op){case"array-contains-any":return W.value.arrayValue.values||[];case"array-contains":return[W.value]}return null}(d,l),g=function(q,Y){const et=new Map;for(const W of Me(Y))for(const T of Cs(q,W.fieldPath))switch(T.op){case"==":case"in":et.set(W.fieldPath.canonicalString(),T.value);break;case"not-in":case"!=":return et.set(W.fieldPath.canonicalString(),T.value),Array.from(et.values())}return null}(d,l),I=function(q,Y){const et=[];let W=!0;for(const T of Me(Y)){const _=T.kind===0?Cu(q,T.fieldPath,q.startAt):xu(q,T.fieldPath,q.startAt);et.push(_.value),W&&(W=_.inclusive)}return new ve(et,W)}(d,l),P=function(q,Y){const et=[];let W=!0;for(const T of Me(Y)){const _=T.kind===0?xu(q,T.fieldPath,q.endAt):Cu(q,T.fieldPath,q.endAt);et.push(_.value),W&&(W=_.inclusive)}return new ve(et,W)}(d,l),x=this.In(l,d,I),N=this.In(l,d,P),D=this.Tn(l,d,g),U=this.En(l.indexId,f,x,I.inclusive,N,P.inclusive,D);return A.forEach(U,K=>n.G(K,e.limit).next(q=>{q.forEach(Y=>{const et=F.fromSegments(Y.documentKey);a.has(et)||(a=a.add(et),u.push(et))})}))}).next(()=>u)}return A.resolve(null)})}hn(t){let e=this.ln.get(t);return e||(t.filters.length===0?e=[t]:e=Im(X.create(t.filters,"and")).map(n=>$i(t.path,t.collectionGroup,t.orderBy,n.getFilters(),t.limit,t.startAt,t.endAt)),this.ln.set(t,e),e)}En(t,e,n,s,i,a,u){const l=(e!=null?e.length:1)*Math.max(n.length,i.length),d=l/(e!=null?e.length:1),f=[];for(let g=0;g<l;++g){const I=e?this.dn(e[g/d]):gs,P=this.An(t,I,n[g%d],s),x=this.Rn(t,I,i[g%d],a),N=u.map(D=>this.An(t,I,D,!0));f.push(...this.createRange(P,x,N))}return f}An(t,e,n,s){const i=new qe(t,F.empty(),e,n);return s?i:i.Zt()}Rn(t,e,n,s){const i=new qe(t,F.empty(),e,n);return s?i.Zt():i}Pn(t,e){const n=new Ju(e),s=e.collectionGroup!=null?e.collectionGroup:e.path.lastSegment();return this.getFieldIndexes(t,s).next(i=>{let a=null;for(const u of i)n.rn(u)&&(!a||u.fields.length>a.fields.length)&&(a=u);return a})}getIndexType(t,e){let n=2;const s=this.hn(e);return A.forEach(s,i=>this.Pn(t,i).next(a=>{a?n!==0&&a.fields.length<function(l){let d=new Z(ot.comparator),f=!1;for(const g of l.filters)for(const I of g.getFlattenedFilters())I.field.isKeyField()||(I.op==="array-contains"||I.op==="array-contains-any"?f=!0:d=d.add(I.field));for(const g of l.orderBy)g.field.isKeyField()||(d=d.add(g.field));return d.size+(f?1:0)}(i)&&(n=1):n=0})).next(()=>function(a){return a.limit!==null}(e)&&s.length>1&&n===2?1:n)}Vn(t,e){const n=new or;for(const s of Me(t)){const i=e.data.field(s.fieldPath);if(i==null)return null;const a=n.Yt(s.kind);Be.vt.It(i,a)}return n.zt()}dn(t){const e=new or;return Be.vt.It(t,e.Yt(0)),e.zt()}mn(t,e){const n=new or;return Be.vt.It(Qe(this.databaseId,e),n.Yt(function(i){const a=Me(i);return a.length===0?0:a[a.length-1].kind}(t))),n.zt()}Tn(t,e,n){if(n===null)return[];let s=[];s.push(new or);let i=0;for(const a of Me(t)){const u=n[i++];for(const l of s)if(this.fn(e,a.fieldPath)&&Rr(u))s=this.gn(s,a,u);else{const d=l.Yt(a.kind);Be.vt.It(u,d)}}return this.pn(s)}In(t,e,n){return this.Tn(t,e,n.position)}pn(t){const e=[];for(let n=0;n<t.length;++n)e[n]=t[n].zt();return e}gn(t,e,n){const s=[...t],i=[];for(const a of n.arrayValue.values||[])for(const u of s){const l=new or;l.seed(u.zt()),Be.vt.It(a,l.Yt(e.kind)),i.push(l)}return i}fn(t,e){return!!t.filters.find(n=>n instanceof Q&&n.field.isEqual(e)&&(n.op==="in"||n.op==="not-in"))}getFieldIndexes(t,e){const n=ar(t),s=dn(t);return(e?n.U("collectionGroupIndex",IDBKeyRange.bound(e,e)):n.U()).next(i=>{const a=[];return A.forEach(i,u=>s.get([u.indexId,this.uid]).next(l=>{a.push(function(f,g){const I=g?new Er(g.sequenceNumber,new Gt(Ye(g.readTime),new F(zt(g.documentKey)),g.largestBatchId)):Er.empty(),P=f.fields.map(([x,N])=>new Ts(ot.fromServerFormat(x),N));return new Ss(f.indexId,f.collectionGroup,P,I)}(u,l))})).next(()=>a)})}getNextCollectionGroupToUpdate(t){return this.getFieldIndexes(t).next(e=>e.length===0?null:(e.sort((n,s)=>{const i=n.indexState.sequenceNumber-s.indexState.sequenceNumber;return i!==0?i:G(n.collectionGroup,s.collectionGroup)}),e[0].collectionGroup))}updateCollectionGroup(t,e,n){const s=ar(t),i=dn(t);return this.yn(t).next(a=>s.U("collectionGroupIndex",IDBKeyRange.bound(e,e)).next(u=>A.forEach(u,l=>i.put(zu(l.indexId,this.uid,a,n)))))}updateIndexEntries(t,e){const n=new Map;return A.forEach(e,(s,i)=>{const a=n.get(s.collectionGroup);return(a?A.resolve(a):this.getFieldIndexes(t,s.collectionGroup)).next(u=>(n.set(s.collectionGroup,u),A.forEach(u,l=>this.wn(t,s,l).next(d=>{const f=this.Sn(i,l);return d.isEqual(f)?A.resolve():this.bn(t,i,l,d,f)}))))})}Dn(t,e,n,s){return hn(t).put({indexId:s.indexId,uid:this.uid,arrayValue:s.arrayValue,directionalValue:s.directionalValue,orderedDocumentKey:this.mn(n,e.key),documentKey:e.key.path.toArray()})}vn(t,e,n,s){return hn(t).delete([s.indexId,this.uid,s.arrayValue,s.directionalValue,this.mn(n,e.key),e.key.path.toArray()])}wn(t,e,n){const s=hn(t);let i=new Z(de);return s.J({index:"documentKeyIndex",range:IDBKeyRange.only([n.indexId,this.uid,this.mn(n,e)])},(a,u)=>{i=i.add(new qe(n.indexId,e,u.arrayValue,u.directionalValue))}).next(()=>i)}Sn(t,e){let n=new Z(de);const s=this.Vn(e,t);if(s==null)return n;const i=Ui(e);if(i!=null){const a=t.data.field(i.fieldPath);if(Rr(a))for(const u of a.arrayValue.values||[])n=n.add(new qe(e.indexId,t.key,this.dn(u),s))}else n=n.add(new qe(e.indexId,t.key,gs,s));return n}bn(t,e,n,s,i){C("IndexedDbIndexManager","Updating index entries for document '%s'",e.key);const a=[];return function(l,d,f,g,I){const P=l.getIterator(),x=d.getIterator();let N=ln(P),D=ln(x);for(;N||D;){let U=!1,K=!1;if(N&&D){const q=f(N,D);q<0?K=!0:q>0&&(U=!0)}else N!=null?K=!0:U=!0;U?(g(D),D=ln(x)):K?(I(N),N=ln(P)):(N=ln(P),D=ln(x))}}(s,i,de,u=>{a.push(this.Dn(t,e,n,u))},u=>{a.push(this.vn(t,e,n,u))}),A.waitFor(a)}yn(t){let e=1;return dn(t).J({index:"sequenceNumberIndex",reverse:!0,range:IDBKeyRange.upperBound([this.uid,Number.MAX_SAFE_INTEGER])},(n,s,i)=>{i.done(),e=s.sequenceNumber+1}).next(()=>e)}createRange(t,e,n){n=n.sort((a,u)=>de(a,u)).filter((a,u,l)=>!u||de(a,l[u-1])!==0);const s=[];s.push(t);for(const a of n){const u=de(a,t),l=de(a,e);if(u===0)s[0]=t.Zt();else if(u>0&&l<0)s.push(a),s.push(a.Zt());else if(l>0)break}s.push(e);const i=[];for(let a=0;a<s.length;a+=2){if(this.Cn(s[a],s[a+1]))return[];const u=[s[a].indexId,this.uid,s[a].arrayValue,s[a].directionalValue,gs,[]],l=[s[a+1].indexId,this.uid,s[a+1].arrayValue,s[a+1].directionalValue,gs,[]];i.push(IDBKeyRange.bound(u,l))}return i}Cn(t,e){return de(t,e)>0}getMinOffsetFromCollectionGroup(t,e){return this.getFieldIndexes(t,e).next(Zu)}getMinOffset(t,e){return A.mapArray(this.hn(e),n=>this.Pn(t,n).next(s=>s||O())).next(Zu)}}function Xu(r){return pt(r,"collectionParents")}function hn(r){return pt(r,"indexEntries")}function ar(r){return pt(r,"indexConfiguration")}function dn(r){return pt(r,"indexState")}function Zu(r){L(r.length!==0);let t=r[0].indexState.offset,e=t.largestBatchId;for(let n=1;n<r.length;n++){const s=r[n].indexState.offset;ho(s,t)<0&&(t=s),e<s.largestBatchId&&(e=s.largestBatchId)}return new Gt(t.readTime,t.documentKey,e)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tc={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0};class Ot{constructor(t,e,n){this.cacheSizeCollectionThreshold=t,this.percentileToCollect=e,this.maximumSequenceNumbersToCollect=n}static withCacheSize(t){return new Ot(t,Ot.DEFAULT_COLLECTION_PERCENTILE,Ot.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ql(r,t,e){const n=r.store("mutations"),s=r.store("documentMutations"),i=[],a=IDBKeyRange.only(e.batchId);let u=0;const l=n.J({range:a},(f,g,I)=>(u++,I.delete()));i.push(l.next(()=>{L(u===1)}));const d=[];for(const f of e.mutations){const g=Wc(t,f.key.path,e.batchId);i.push(s.delete(g)),d.push(f.key)}return A.waitFor(i).next(()=>d)}function ks(r){if(!r)return 0;let t;if(r.document)t=r.document;else if(r.unknownDocument)t=r.unknownDocument;else{if(!r.noDocument)throw O();t=r.noDocument}return JSON.stringify(t).length}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Ot.DEFAULT_COLLECTION_PERCENTILE=10,Ot.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,Ot.DEFAULT=new Ot(41943040,Ot.DEFAULT_COLLECTION_PERCENTILE,Ot.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),Ot.DISABLED=new Ot(-1,0,0);class $s{constructor(t,e,n,s){this.userId=t,this.serializer=e,this.indexManager=n,this.referenceDelegate=s,this.Fn={}}static lt(t,e,n,s){L(t.uid!=="");const i=t.isAuthenticated()?t.uid:"";return new $s(i,e,n,s)}checkEmpty(t){let e=!0;const n=IDBKeyRange.bound([this.userId,Number.NEGATIVE_INFINITY],[this.userId,Number.POSITIVE_INFINITY]);return fe(t).J({index:"userMutationsIndex",range:n},(s,i,a)=>{e=!1,a.done()}).next(()=>e)}addMutationBatch(t,e,n,s){const i=yn(t),a=fe(t);return a.add({}).next(u=>{L(typeof u=="number");const l=new Eo(u,e,n,s),d=function(P,x,N){const D=N.baseMutations.map(K=>Sr(P.ct,K)),U=N.mutations.map(K=>Sr(P.ct,K));return{userId:x,batchId:N.batchId,localWriteTimeMs:N.localWriteTime.toMillis(),baseMutations:D,mutations:U}}(this.serializer,this.userId,l),f=[];let g=new Z((I,P)=>G(I.canonicalString(),P.canonicalString()));for(const I of s){const P=Wc(this.userId,I.key.path,u);g=g.add(I.key.path.popLast()),f.push(a.put(d)),f.push(i.put(P,af))}return g.forEach(I=>{f.push(this.indexManager.addToCollectionParentIndex(t,I))}),t.addOnCommittedListener(()=>{this.Fn[u]=l.keys()}),A.waitFor(f).next(()=>l)})}lookupMutationBatch(t,e){return fe(t).get(e).next(n=>n?(L(n.userId===this.userId),Le(this.serializer,n)):null)}Mn(t,e){return this.Fn[e]?A.resolve(this.Fn[e]):this.lookupMutationBatch(t,e).next(n=>{if(n){const s=n.keys();return this.Fn[e]=s,s}return null})}getNextMutationBatchAfterBatchId(t,e){const n=e+1,s=IDBKeyRange.lowerBound([this.userId,n]);let i=null;return fe(t).J({index:"userMutationsIndex",range:s},(a,u,l)=>{u.userId===this.userId&&(L(u.batchId>=n),i=Le(this.serializer,u)),l.done()}).next(()=>i)}getHighestUnacknowledgedBatchId(t){const e=IDBKeyRange.upperBound([this.userId,Number.POSITIVE_INFINITY]);let n=-1;return fe(t).J({index:"userMutationsIndex",range:e,reverse:!0},(s,i,a)=>{n=i.batchId,a.done()}).next(()=>n)}getAllMutationBatches(t){const e=IDBKeyRange.bound([this.userId,-1],[this.userId,Number.POSITIVE_INFINITY]);return fe(t).U("userMutationsIndex",e).next(n=>n.map(s=>Le(this.serializer,s)))}getAllMutationBatchesAffectingDocumentKey(t,e){const n=Es(this.userId,e.path),s=IDBKeyRange.lowerBound(n),i=[];return yn(t).J({range:s},(a,u,l)=>{const[d,f,g]=a,I=zt(f);if(d===this.userId&&e.path.isEqual(I))return fe(t).get(g).next(P=>{if(!P)throw O();L(P.userId===this.userId),i.push(Le(this.serializer,P))});l.done()}).next(()=>i)}getAllMutationBatchesAffectingDocumentKeys(t,e){let n=new Z(G);const s=[];return e.forEach(i=>{const a=Es(this.userId,i.path),u=IDBKeyRange.lowerBound(a),l=yn(t).J({range:u},(d,f,g)=>{const[I,P,x]=d,N=zt(P);I===this.userId&&i.path.isEqual(N)?n=n.add(x):g.done()});s.push(l)}),A.waitFor(s).next(()=>this.xn(t,n))}getAllMutationBatchesAffectingQuery(t,e){const n=e.path,s=n.length+1,i=Es(this.userId,n),a=IDBKeyRange.lowerBound(i);let u=new Z(G);return yn(t).J({range:a},(l,d,f)=>{const[g,I,P]=l,x=zt(I);g===this.userId&&n.isPrefixOf(x)?x.length===s&&(u=u.add(P)):f.done()}).next(()=>this.xn(t,u))}xn(t,e){const n=[],s=[];return e.forEach(i=>{s.push(fe(t).get(i).next(a=>{if(a===null)throw O();L(a.userId===this.userId),n.push(Le(this.serializer,a))}))}),A.waitFor(s).next(()=>n)}removeMutationBatch(t,e){return Ql(t._e,this.userId,e).next(n=>(t.addOnCommittedListener(()=>{this.On(e.batchId)}),A.forEach(n,s=>this.referenceDelegate.markPotentiallyOrphaned(t,s))))}On(t){delete this.Fn[t]}performConsistencyCheck(t){return this.checkEmpty(t).next(e=>{if(!e)return A.resolve();const n=IDBKeyRange.lowerBound(function(a){return[a]}(this.userId)),s=[];return yn(t).J({range:n},(i,a,u)=>{if(i[0]===this.userId){const l=zt(i[1]);s.push(l)}else u.done()}).next(()=>{L(s.length===0)})})}containsKey(t,e){return $l(t,this.userId,e)}Nn(t){return Wl(t).get(this.userId).next(e=>e||{userId:this.userId,lastAcknowledgedBatchId:-1,lastStreamToken:""})}}function $l(r,t,e){const n=Es(t,e.path),s=n[1],i=IDBKeyRange.lowerBound(n);let a=!1;return yn(r).J({range:i,H:!0},(u,l,d)=>{const[f,g,I]=u;f===t&&g===s&&(a=!0),d.done()}).next(()=>a)}function fe(r){return pt(r,"mutations")}function yn(r){return pt(r,"documentMutations")}function Wl(r){return pt(r,"mutationQueues")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xe{constructor(t){this.Ln=t}next(){return this.Ln+=2,this.Ln}static Bn(){return new Xe(0)}static kn(){return new Xe(-1)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wm{constructor(t,e){this.referenceDelegate=t,this.serializer=e}allocateTargetId(t){return this.qn(t).next(e=>{const n=new Xe(e.highestTargetId);return e.highestTargetId=n.next(),this.Qn(t,e).next(()=>e.highestTargetId)})}getLastRemoteSnapshotVersion(t){return this.qn(t).next(e=>B.fromTimestamp(new ut(e.lastRemoteSnapshotVersion.seconds,e.lastRemoteSnapshotVersion.nanoseconds)))}getHighestSequenceNumber(t){return this.qn(t).next(e=>e.highestListenSequenceNumber)}setTargetsMetadata(t,e,n){return this.qn(t).next(s=>(s.highestListenSequenceNumber=e,n&&(s.lastRemoteSnapshotVersion=n.toTimestamp()),e>s.highestListenSequenceNumber&&(s.highestListenSequenceNumber=e),this.Qn(t,s)))}addTargetData(t,e){return this.Kn(t,e).next(()=>this.qn(t).next(n=>(n.targetCount+=1,this.$n(e,n),this.Qn(t,n))))}updateTargetData(t,e){return this.Kn(t,e)}removeTargetData(t,e){return this.removeMatchingKeysForTargetId(t,e.targetId).next(()=>fn(t).delete(e.targetId)).next(()=>this.qn(t)).next(n=>(L(n.targetCount>0),n.targetCount-=1,this.Qn(t,n)))}removeTargets(t,e,n){let s=0;const i=[];return fn(t).J((a,u)=>{const l=fr(u);l.sequenceNumber<=e&&n.get(l.targetId)===null&&(s++,i.push(this.removeTargetData(t,l)))}).next(()=>A.waitFor(i)).next(()=>s)}forEachTarget(t,e){return fn(t).J((n,s)=>{const i=fr(s);e(i)})}qn(t){return ec(t).get("targetGlobalKey").next(e=>(L(e!==null),e))}Qn(t,e){return ec(t).put("targetGlobalKey",e)}Kn(t,e){return fn(t).put(Kl(this.serializer,e))}$n(t,e){let n=!1;return t.targetId>e.highestTargetId&&(e.highestTargetId=t.targetId,n=!0),t.sequenceNumber>e.highestListenSequenceNumber&&(e.highestListenSequenceNumber=t.sequenceNumber,n=!0),n}getTargetCount(t){return this.qn(t).next(e=>e.targetCount)}getTargetData(t,e){const n=$e(e),s=IDBKeyRange.bound([n,Number.NEGATIVE_INFINITY],[n,Number.POSITIVE_INFINITY]);let i=null;return fn(t).J({range:s,index:"queryTargetsIndex"},(a,u,l)=>{const d=fr(u);Mr(e,d.target)&&(i=d,l.done())}).next(()=>i)}addMatchingKeys(t,e,n){const s=[],i=ge(t);return e.forEach(a=>{const u=kt(a.path);s.push(i.put({targetId:n,path:u})),s.push(this.referenceDelegate.addReference(t,n,a))}),A.waitFor(s)}removeMatchingKeys(t,e,n){const s=ge(t);return A.forEach(e,i=>{const a=kt(i.path);return A.waitFor([s.delete([n,a]),this.referenceDelegate.removeReference(t,n,i)])})}removeMatchingKeysForTargetId(t,e){const n=ge(t),s=IDBKeyRange.bound([e],[e+1],!1,!0);return n.delete(s)}getMatchingKeysForTargetId(t,e){const n=IDBKeyRange.bound([e],[e+1],!1,!0),s=ge(t);let i=j();return s.J({range:n,H:!0},(a,u,l)=>{const d=zt(a[1]),f=new F(d);i=i.add(f)}).next(()=>i)}containsKey(t,e){const n=kt(e.path),s=IDBKeyRange.bound([n],[Uc(n)],!1,!0);let i=0;return ge(t).J({index:"documentTargetsIndex",H:!0,range:s},([a,u],l,d)=>{a!==0&&(i++,d.done())}).next(()=>i>0)}ot(t,e){return fn(t).get(e).next(n=>n?fr(n):null)}}function fn(r){return pt(r,"targets")}function ec(r){return pt(r,"targetGlobal")}function ge(r){return pt(r,"targetDocuments")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function nc([r,t],[e,n]){const s=G(r,e);return s===0?G(t,n):s}class vm{constructor(t){this.Un=t,this.buffer=new Z(nc),this.Wn=0}Gn(){return++this.Wn}zn(t){const e=[t,this.Gn()];if(this.buffer.size<this.Un)this.buffer=this.buffer.add(e);else{const n=this.buffer.last();nc(e,n)<0&&(this.buffer=this.buffer.delete(n).add(e))}}get maxValue(){return this.buffer.last()[0]}}class Am{constructor(t,e,n){this.garbageCollector=t,this.asyncQueue=e,this.localStore=n,this.jn=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.Hn(6e4)}stop(){this.jn&&(this.jn.cancel(),this.jn=null)}get started(){return this.jn!==null}Hn(t){C("LruGarbageCollector",`Garbage collection scheduled in ${t}ms`),this.jn=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",t,async()=>{this.jn=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(e){Se(e)?C("LruGarbageCollector","Ignoring IndexedDB error during garbage collection: ",e):await Ve(e)}await this.Hn(3e5)})}}class Rm{constructor(t,e){this.Jn=t,this.params=e}calculateTargetCount(t,e){return this.Jn.Yn(t).next(n=>Math.floor(e/100*n))}nthSequenceNumber(t,e){if(e===0)return A.resolve(Lt.oe);const n=new vm(e);return this.Jn.forEachTarget(t,s=>n.zn(s.sequenceNumber)).next(()=>this.Jn.Zn(t,s=>n.zn(s))).next(()=>n.maxValue)}removeTargets(t,e,n){return this.Jn.removeTargets(t,e,n)}removeOrphanedDocuments(t,e){return this.Jn.removeOrphanedDocuments(t,e)}collect(t,e){return this.params.cacheSizeCollectionThreshold===-1?(C("LruGarbageCollector","Garbage collection skipped; disabled"),A.resolve(tc)):this.getCacheSize(t).next(n=>n<this.params.cacheSizeCollectionThreshold?(C("LruGarbageCollector",`Garbage collection skipped; Cache size ${n} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),tc):this.Xn(t,e))}getCacheSize(t){return this.Jn.getCacheSize(t)}Xn(t,e){let n,s,i,a,u,l,d;const f=Date.now();return this.calculateTargetCount(t,this.params.percentileToCollect).next(g=>(g>this.params.maximumSequenceNumbersToCollect?(C("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${g}`),s=this.params.maximumSequenceNumbersToCollect):s=g,a=Date.now(),this.nthSequenceNumber(t,s))).next(g=>(n=g,u=Date.now(),this.removeTargets(t,n,e))).next(g=>(i=g,l=Date.now(),this.removeOrphanedDocuments(t,n))).next(g=>(d=Date.now(),mn()<=ee.DEBUG&&C("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${a-f}ms
	Determined least recently used ${s} in `+(u-a)+`ms
	Removed ${i} targets in `+(l-u)+`ms
	Removed ${g} documents in `+(d-l)+`ms
Total Duration: ${d-f}ms`),A.resolve({didRun:!0,sequenceNumbersCollected:s,targetsRemoved:i,documentsRemoved:g})))}}function Pm(r,t){return new Rm(r,t)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vm{constructor(t,e){this.db=t,this.garbageCollector=Pm(this,e)}Yn(t){const e=this.er(t);return this.db.getTargetCache().getTargetCount(t).next(n=>e.next(s=>n+s))}er(t){let e=0;return this.Zn(t,n=>{e++}).next(()=>e)}forEachTarget(t,e){return this.db.getTargetCache().forEachTarget(t,e)}Zn(t,e){return this.tr(t,(n,s)=>e(s))}addReference(t,e,n){return _s(t,n)}removeReference(t,e,n){return _s(t,n)}removeTargets(t,e,n){return this.db.getTargetCache().removeTargets(t,e,n)}markPotentiallyOrphaned(t,e){return _s(t,e)}nr(t,e){return function(s,i){let a=!1;return Wl(s).Y(u=>$l(s,u,i).next(l=>(l&&(a=!0),A.resolve(!l)))).next(()=>a)}(t,e)}removeOrphanedDocuments(t,e){const n=this.db.getRemoteDocumentCache().newChangeBuffer(),s=[];let i=0;return this.tr(t,(a,u)=>{if(u<=e){const l=this.nr(t,a).next(d=>{if(!d)return i++,n.getEntry(t,a).next(()=>(n.removeEntry(a,B.min()),ge(t).delete(function(g){return[0,kt(g.path)]}(a))))});s.push(l)}}).next(()=>A.waitFor(s)).next(()=>n.apply(t)).next(()=>i)}removeTarget(t,e){const n=e.withSequenceNumber(t.currentSequenceNumber);return this.db.getTargetCache().updateTargetData(t,n)}updateLimboDocument(t,e){return _s(t,e)}tr(t,e){const n=ge(t);let s,i=Lt.oe;return n.J({index:"documentTargetsIndex"},([a,u],{path:l,sequenceNumber:d})=>{a===0?(i!==Lt.oe&&e(new F(zt(s)),i),i=d,s=l):i=Lt.oe}).next(()=>{i!==Lt.oe&&e(new F(zt(s)),i)})}getCacheSize(t){return this.db.getRemoteDocumentCache().getSize(t)}}function _s(r,t){return ge(r).put(function(n,s){return{targetId:0,path:kt(n.path),sequenceNumber:s}}(t,r.currentSequenceNumber))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hl{constructor(){this.changes=new be(t=>t.toString(),(t,e)=>t.isEqual(e)),this.changesApplied=!1}addEntry(t){this.assertNotApplied(),this.changes.set(t.key,t)}removeEntry(t,e){this.assertNotApplied(),this.changes.set(t,st.newInvalidDocument(t).setReadTime(e))}getEntry(t,e){this.assertNotApplied();const n=this.changes.get(e);return n!==void 0?A.resolve(n):this.getFromCache(t,e)}getEntries(t,e){return this.getAllFromCache(t,e)}apply(t){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(t)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sm{constructor(t){this.serializer=t}setIndexManager(t){this.indexManager=t}addEntry(t,e,n){return Fe(t).put(n)}removeEntry(t,e,n){return Fe(t).delete(function(i,a){const u=i.path.toArray();return[u.slice(0,u.length-2),u[u.length-2],Ds(a),u[u.length-1]]}(e,n))}updateMetadata(t,e){return this.getMetadata(t).next(n=>(n.byteSize+=e,this.rr(t,n)))}getEntry(t,e){let n=st.newInvalidDocument(e);return Fe(t).J({index:"documentKeyIndex",range:IDBKeyRange.only(ur(e))},(s,i)=>{n=this.ir(e,i)}).next(()=>n)}sr(t,e){let n={size:0,document:st.newInvalidDocument(e)};return Fe(t).J({index:"documentKeyIndex",range:IDBKeyRange.only(ur(e))},(s,i)=>{n={document:this.ir(e,i),size:ks(i)}}).next(()=>n)}getEntries(t,e){let n=qt();return this._r(t,e,(s,i)=>{const a=this.ir(s,i);n=n.insert(s,a)}).next(()=>n)}ar(t,e){let n=qt(),s=new nt(F.comparator);return this._r(t,e,(i,a)=>{const u=this.ir(i,a);n=n.insert(i,u),s=s.insert(i,ks(a))}).next(()=>({documents:n,ur:s}))}_r(t,e,n){if(e.isEmpty())return A.resolve();let s=new Z(ic);e.forEach(l=>s=s.add(l));const i=IDBKeyRange.bound(ur(s.first()),ur(s.last())),a=s.getIterator();let u=a.getNext();return Fe(t).J({index:"documentKeyIndex",range:i},(l,d,f)=>{const g=F.fromSegments([...d.prefixPath,d.collectionGroup,d.documentId]);for(;u&&ic(u,g)<0;)n(u,null),u=a.getNext();u&&u.isEqual(g)&&(n(u,d),u=a.hasNext()?a.getNext():null),u?f.$(ur(u)):f.done()}).next(()=>{for(;u;)n(u,null),u=a.hasNext()?a.getNext():null})}getDocumentsMatchingQuery(t,e,n,s,i){const a=e.path,u=[a.popLast().toArray(),a.lastSegment(),Ds(n.readTime),n.documentKey.path.isEmpty()?"":n.documentKey.path.lastSegment()],l=[a.popLast().toArray(),a.lastSegment(),[Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER],""];return Fe(t).U(IDBKeyRange.bound(u,l,!0)).next(d=>{i==null||i.incrementDocumentReadCount(d.length);let f=qt();for(const g of d){const I=this.ir(F.fromSegments(g.prefixPath.concat(g.collectionGroup,g.documentId)),g);I.isFoundDocument()&&(Lr(e,I)||s.has(I.key))&&(f=f.insert(I.key,I))}return f})}getAllFromCollectionGroup(t,e,n,s){let i=qt();const a=sc(e,n),u=sc(e,Gt.max());return Fe(t).J({index:"collectionGroupIndex",range:IDBKeyRange.bound(a,u,!0)},(l,d,f)=>{const g=this.ir(F.fromSegments(d.prefixPath.concat(d.collectionGroup,d.documentId)),d);i=i.insert(g.key,g),i.size===s&&f.done()}).next(()=>i)}newChangeBuffer(t){return new bm(this,!!t&&t.trackRemovals)}getSize(t){return this.getMetadata(t).next(e=>e.byteSize)}getMetadata(t){return rc(t).get("remoteDocumentGlobalKey").next(e=>(L(!!e),e))}rr(t,e){return rc(t).put("remoteDocumentGlobalKey",e)}ir(t,e){if(e){const n=dm(this.serializer,e);if(!(n.isNoDocument()&&n.version.isEqual(B.min())))return n}return st.newInvalidDocument(t)}}function Jl(r){return new Sm(r)}class bm extends Hl{constructor(t,e){super(),this.cr=t,this.trackRemovals=e,this.lr=new be(n=>n.toString(),(n,s)=>n.isEqual(s))}applyChanges(t){const e=[];let n=0,s=new Z((i,a)=>G(i.canonicalString(),a.canonicalString()));return this.changes.forEach((i,a)=>{const u=this.lr.get(i);if(e.push(this.cr.removeEntry(t,i,u.readTime)),a.isValidDocument()){const l=Ku(this.cr.serializer,a);s=s.add(i.path.popLast());const d=ks(l);n+=d-u.size,e.push(this.cr.addEntry(t,i,l))}else if(n-=u.size,this.trackRemovals){const l=Ku(this.cr.serializer,a.convertToNoDocument(B.min()));e.push(this.cr.addEntry(t,i,l))}}),s.forEach(i=>{e.push(this.cr.indexManager.addToCollectionParentIndex(t,i))}),e.push(this.cr.updateMetadata(t,n)),A.waitFor(e)}getFromCache(t,e){return this.cr.sr(t,e).next(n=>(this.lr.set(e,{size:n.size,readTime:n.document.readTime}),n.document))}getAllFromCache(t,e){return this.cr.ar(t,e).next(({documents:n,ur:s})=>(s.forEach((i,a)=>{this.lr.set(i,{size:a,readTime:n.get(i).readTime})}),n))}}function rc(r){return pt(r,"remoteDocumentGlobal")}function Fe(r){return pt(r,"remoteDocumentsV14")}function ur(r){const t=r.path.toArray();return[t.slice(0,t.length-2),t[t.length-2],t[t.length-1]]}function sc(r,t){const e=t.documentKey.path.toArray();return[r,Ds(t.readTime),e.slice(0,e.length-2),e.length>0?e[e.length-1]:""]}function ic(r,t){const e=r.path.toArray(),n=t.path.toArray();let s=0;for(let i=0;i<e.length-2&&i<n.length-2;++i)if(s=G(e[i],n[i]),s)return s;return s=G(e.length,n.length),s||(s=G(e[e.length-2],n[n.length-2]),s||G(e[e.length-1],n[n.length-1]))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Cm{constructor(t,e){this.overlayedDocument=t,this.mutatedFields=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yl{constructor(t,e,n,s){this.remoteDocumentCache=t,this.mutationQueue=e,this.documentOverlayCache=n,this.indexManager=s}getDocument(t,e){let n=null;return this.documentOverlayCache.getOverlay(t,e).next(s=>(n=s,this.remoteDocumentCache.getEntry(t,e))).next(s=>(n!==null&&pr(n.mutation,s,Bt.empty(),ut.now()),s))}getDocuments(t,e){return this.remoteDocumentCache.getEntries(t,e).next(n=>this.getLocalViewOfDocuments(t,n,j()).next(()=>n))}getLocalViewOfDocuments(t,e,n=j()){const s=Qt();return this.populateOverlays(t,s,e).next(()=>this.computeViews(t,e,s,n).next(i=>{let a=hr();return i.forEach((u,l)=>{a=a.insert(u,l.overlayedDocument)}),a}))}getOverlayedDocuments(t,e){const n=Qt();return this.populateOverlays(t,n,e).next(()=>this.computeViews(t,e,n,j()))}populateOverlays(t,e,n){const s=[];return n.forEach(i=>{e.has(i)||s.push(i)}),this.documentOverlayCache.getOverlays(t,s).next(i=>{i.forEach((a,u)=>{e.set(a,u)})})}computeViews(t,e,n,s){let i=qt();const a=_r(),u=function(){return _r()}();return e.forEach((l,d)=>{const f=n.get(d.key);s.has(d.key)&&(f===void 0||f.mutation instanceof oe)?i=i.insert(d.key,d):f!==void 0?(a.set(d.key,f.mutation.getFieldMask()),pr(f.mutation,d,f.mutation.getFieldMask(),ut.now())):a.set(d.key,Bt.empty())}),this.recalculateAndSaveOverlays(t,i).next(l=>(l.forEach((d,f)=>a.set(d,f)),e.forEach((d,f)=>{var g;return u.set(d,new Cm(f,(g=a.get(d))!==null&&g!==void 0?g:null))}),u))}recalculateAndSaveOverlays(t,e){const n=_r();let s=new nt((a,u)=>a-u),i=j();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(t,e).next(a=>{for(const u of a)u.keys().forEach(l=>{const d=e.get(l);if(d===null)return;let f=n.get(l)||Bt.empty();f=u.applyToLocalView(d,f),n.set(l,f);const g=(s.get(u.batchId)||j()).add(l);s=s.insert(u.batchId,g)})}).next(()=>{const a=[],u=s.getReverseIterator();for(;u.hasNext();){const l=u.getNext(),d=l.key,f=l.value,g=_l();f.forEach(I=>{if(!i.has(I)){const P=vl(e.get(I),n.get(I));P!==null&&g.set(I,P),i=i.add(I)}}),a.push(this.documentOverlayCache.saveOverlays(t,d,g))}return A.waitFor(a)}).next(()=>n)}recalculateAndSaveOverlaysForDocumentKeys(t,e){return this.remoteDocumentCache.getEntries(t,e).next(n=>this.recalculateAndSaveOverlays(t,n))}getDocumentsMatchingQuery(t,e,n,s){return function(a){return F.isDocumentKey(a.path)&&a.collectionGroup===null&&a.filters.length===0}(e)?this.getDocumentsMatchingDocumentQuery(t,e.path):po(e)?this.getDocumentsMatchingCollectionGroupQuery(t,e,n,s):this.getDocumentsMatchingCollectionQuery(t,e,n,s)}getNextDocuments(t,e,n,s){return this.remoteDocumentCache.getAllFromCollectionGroup(t,e,n,s).next(i=>{const a=s-i.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(t,e,n.largestBatchId,s-i.size):A.resolve(Qt());let u=-1,l=i;return a.next(d=>A.forEach(d,(f,g)=>(u<g.largestBatchId&&(u=g.largestBatchId),i.get(f)?A.resolve():this.remoteDocumentCache.getEntry(t,f).next(I=>{l=l.insert(f,I)}))).next(()=>this.populateOverlays(t,d,i)).next(()=>this.computeViews(t,l,d,j())).next(f=>({batchId:u,changes:gl(f)})))})}getDocumentsMatchingDocumentQuery(t,e){return this.getDocument(t,new F(e)).next(n=>{let s=hr();return n.isFoundDocument()&&(s=s.insert(n.key,n)),s})}getDocumentsMatchingCollectionGroupQuery(t,e,n,s){const i=e.collectionGroup;let a=hr();return this.indexManager.getCollectionParents(t,i).next(u=>A.forEach(u,l=>{const d=function(g,I){return new ie(I,null,g.explicitOrderBy.slice(),g.filters.slice(),g.limit,g.limitType,g.startAt,g.endAt)}(e,l.child(i));return this.getDocumentsMatchingCollectionQuery(t,d,n,s).next(f=>{f.forEach((g,I)=>{a=a.insert(g,I)})})}).next(()=>a))}getDocumentsMatchingCollectionQuery(t,e,n,s){let i;return this.documentOverlayCache.getOverlaysForCollection(t,e.path,n.largestBatchId).next(a=>(i=a,this.remoteDocumentCache.getDocumentsMatchingQuery(t,e,n,i,s))).next(a=>{i.forEach((l,d)=>{const f=d.getKey();a.get(f)===null&&(a=a.insert(f,st.newInvalidDocument(f)))});let u=hr();return a.forEach((l,d)=>{const f=i.get(l);f!==void 0&&pr(f.mutation,d,Bt.empty(),ut.now()),Lr(e,d)&&(u=u.insert(l,d))}),u})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xm{constructor(t){this.serializer=t,this.hr=new Map,this.Pr=new Map}getBundleMetadata(t,e){return A.resolve(this.hr.get(e))}saveBundleMetadata(t,e){return this.hr.set(e.id,function(s){return{id:s.id,version:s.version,createTime:ft(s.createTime)}}(e)),A.resolve()}getNamedQuery(t,e){return A.resolve(this.Pr.get(e))}saveNamedQuery(t,e){return this.Pr.set(e.name,function(s){return{name:s.name,query:Po(s.bundledQuery),readTime:ft(s.readTime)}}(e)),A.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dm{constructor(){this.overlays=new nt(F.comparator),this.Ir=new Map}getOverlay(t,e){return A.resolve(this.overlays.get(e))}getOverlays(t,e){const n=Qt();return A.forEach(e,s=>this.getOverlay(t,s).next(i=>{i!==null&&n.set(s,i)})).next(()=>n)}saveOverlays(t,e,n){return n.forEach((s,i)=>{this.ht(t,e,i)}),A.resolve()}removeOverlaysForBatchId(t,e,n){const s=this.Ir.get(n);return s!==void 0&&(s.forEach(i=>this.overlays=this.overlays.remove(i)),this.Ir.delete(n)),A.resolve()}getOverlaysForCollection(t,e,n){const s=Qt(),i=e.length+1,a=new F(e.child("")),u=this.overlays.getIteratorFrom(a);for(;u.hasNext();){const l=u.getNext().value,d=l.getKey();if(!e.isPrefixOf(d.path))break;d.path.length===i&&l.largestBatchId>n&&s.set(l.getKey(),l)}return A.resolve(s)}getOverlaysForCollectionGroup(t,e,n,s){let i=new nt((d,f)=>d-f);const a=this.overlays.getIterator();for(;a.hasNext();){const d=a.getNext().value;if(d.getKey().getCollectionGroup()===e&&d.largestBatchId>n){let f=i.get(d.largestBatchId);f===null&&(f=Qt(),i=i.insert(d.largestBatchId,f)),f.set(d.getKey(),d)}}const u=Qt(),l=i.getIterator();for(;l.hasNext()&&(l.getNext().value.forEach((d,f)=>u.set(d,f)),!(u.size()>=s)););return A.resolve(u)}ht(t,e,n){const s=this.overlays.get(n.key);if(s!==null){const a=this.Ir.get(s.largestBatchId).delete(n.key);this.Ir.set(s.largestBatchId,a)}this.overlays=this.overlays.insert(n.key,new vo(e,n));let i=this.Ir.get(e);i===void 0&&(i=j(),this.Ir.set(e,i)),this.Ir.set(e,i.add(n.key))}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nm{constructor(){this.sessionToken=ht.EMPTY_BYTE_STRING}getSessionToken(t){return A.resolve(this.sessionToken)}setSessionToken(t,e){return this.sessionToken=e,A.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bo{constructor(){this.Tr=new Z(yt.Er),this.dr=new Z(yt.Ar)}isEmpty(){return this.Tr.isEmpty()}addReference(t,e){const n=new yt(t,e);this.Tr=this.Tr.add(n),this.dr=this.dr.add(n)}Rr(t,e){t.forEach(n=>this.addReference(n,e))}removeReference(t,e){this.Vr(new yt(t,e))}mr(t,e){t.forEach(n=>this.removeReference(n,e))}gr(t){const e=new F(new z([])),n=new yt(e,t),s=new yt(e,t+1),i=[];return this.dr.forEachInRange([n,s],a=>{this.Vr(a),i.push(a.key)}),i}pr(){this.Tr.forEach(t=>this.Vr(t))}Vr(t){this.Tr=this.Tr.delete(t),this.dr=this.dr.delete(t)}yr(t){const e=new F(new z([])),n=new yt(e,t),s=new yt(e,t+1);let i=j();return this.dr.forEachInRange([n,s],a=>{i=i.add(a.key)}),i}containsKey(t){const e=new yt(t,0),n=this.Tr.firstAfterOrEqual(e);return n!==null&&t.isEqual(n.key)}}class yt{constructor(t,e){this.key=t,this.wr=e}static Er(t,e){return F.comparator(t.key,e.key)||G(t.wr,e.wr)}static Ar(t,e){return G(t.wr,e.wr)||F.comparator(t.key,e.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class km{constructor(t,e){this.indexManager=t,this.referenceDelegate=e,this.mutationQueue=[],this.Sr=1,this.br=new Z(yt.Er)}checkEmpty(t){return A.resolve(this.mutationQueue.length===0)}addMutationBatch(t,e,n,s){const i=this.Sr;this.Sr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const a=new Eo(i,e,n,s);this.mutationQueue.push(a);for(const u of s)this.br=this.br.add(new yt(u.key,i)),this.indexManager.addToCollectionParentIndex(t,u.key.path.popLast());return A.resolve(a)}lookupMutationBatch(t,e){return A.resolve(this.Dr(e))}getNextMutationBatchAfterBatchId(t,e){const n=e+1,s=this.vr(n),i=s<0?0:s;return A.resolve(this.mutationQueue.length>i?this.mutationQueue[i]:null)}getHighestUnacknowledgedBatchId(){return A.resolve(this.mutationQueue.length===0?-1:this.Sr-1)}getAllMutationBatches(t){return A.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(t,e){const n=new yt(e,0),s=new yt(e,Number.POSITIVE_INFINITY),i=[];return this.br.forEachInRange([n,s],a=>{const u=this.Dr(a.wr);i.push(u)}),A.resolve(i)}getAllMutationBatchesAffectingDocumentKeys(t,e){let n=new Z(G);return e.forEach(s=>{const i=new yt(s,0),a=new yt(s,Number.POSITIVE_INFINITY);this.br.forEachInRange([i,a],u=>{n=n.add(u.wr)})}),A.resolve(this.Cr(n))}getAllMutationBatchesAffectingQuery(t,e){const n=e.path,s=n.length+1;let i=n;F.isDocumentKey(i)||(i=i.child(""));const a=new yt(new F(i),0);let u=new Z(G);return this.br.forEachWhile(l=>{const d=l.key.path;return!!n.isPrefixOf(d)&&(d.length===s&&(u=u.add(l.wr)),!0)},a),A.resolve(this.Cr(u))}Cr(t){const e=[];return t.forEach(n=>{const s=this.Dr(n);s!==null&&e.push(s)}),e}removeMutationBatch(t,e){L(this.Fr(e.batchId,"removed")===0),this.mutationQueue.shift();let n=this.br;return A.forEach(e.mutations,s=>{const i=new yt(s.key,e.batchId);return n=n.delete(i),this.referenceDelegate.markPotentiallyOrphaned(t,s.key)}).next(()=>{this.br=n})}On(t){}containsKey(t,e){const n=new yt(e,0),s=this.br.firstAfterOrEqual(n);return A.resolve(e.isEqual(s&&s.key))}performConsistencyCheck(t){return this.mutationQueue.length,A.resolve()}Fr(t,e){return this.vr(t)}vr(t){return this.mutationQueue.length===0?0:t-this.mutationQueue[0].batchId}Dr(t){const e=this.vr(t);return e<0||e>=this.mutationQueue.length?null:this.mutationQueue[e]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fm{constructor(t){this.Mr=t,this.docs=function(){return new nt(F.comparator)}(),this.size=0}setIndexManager(t){this.indexManager=t}addEntry(t,e){const n=e.key,s=this.docs.get(n),i=s?s.size:0,a=this.Mr(e);return this.docs=this.docs.insert(n,{document:e.mutableCopy(),size:a}),this.size+=a-i,this.indexManager.addToCollectionParentIndex(t,n.path.popLast())}removeEntry(t){const e=this.docs.get(t);e&&(this.docs=this.docs.remove(t),this.size-=e.size)}getEntry(t,e){const n=this.docs.get(e);return A.resolve(n?n.document.mutableCopy():st.newInvalidDocument(e))}getEntries(t,e){let n=qt();return e.forEach(s=>{const i=this.docs.get(s);n=n.insert(s,i?i.document.mutableCopy():st.newInvalidDocument(s))}),A.resolve(n)}getDocumentsMatchingQuery(t,e,n,s){let i=qt();const a=e.path,u=new F(a.child("")),l=this.docs.getIteratorFrom(u);for(;l.hasNext();){const{key:d,value:{document:f}}=l.getNext();if(!a.isPrefixOf(d.path))break;d.path.length>a.length+1||ho(Kc(f),n)<=0||(s.has(f.key)||Lr(e,f))&&(i=i.insert(f.key,f.mutableCopy()))}return A.resolve(i)}getAllFromCollectionGroup(t,e,n,s){O()}Or(t,e){return A.forEach(this.docs,n=>e(n))}newChangeBuffer(t){return new Mm(this)}getSize(t){return A.resolve(this.size)}}class Mm extends Hl{constructor(t){super(),this.cr=t}applyChanges(t){const e=[];return this.changes.forEach((n,s)=>{s.isValidDocument()?e.push(this.cr.addEntry(t,s)):this.cr.removeEntry(n)}),A.waitFor(e)}getFromCache(t,e){return this.cr.getEntry(t,e)}getAllFromCache(t,e){return this.cr.getEntries(t,e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Om{constructor(t){this.persistence=t,this.Nr=new be(e=>$e(e),Mr),this.lastRemoteSnapshotVersion=B.min(),this.highestTargetId=0,this.Lr=0,this.Br=new bo,this.targetCount=0,this.kr=Xe.Bn()}forEachTarget(t,e){return this.Nr.forEach((n,s)=>e(s)),A.resolve()}getLastRemoteSnapshotVersion(t){return A.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(t){return A.resolve(this.Lr)}allocateTargetId(t){return this.highestTargetId=this.kr.next(),A.resolve(this.highestTargetId)}setTargetsMetadata(t,e,n){return n&&(this.lastRemoteSnapshotVersion=n),e>this.Lr&&(this.Lr=e),A.resolve()}Kn(t){this.Nr.set(t.target,t);const e=t.targetId;e>this.highestTargetId&&(this.kr=new Xe(e),this.highestTargetId=e),t.sequenceNumber>this.Lr&&(this.Lr=t.sequenceNumber)}addTargetData(t,e){return this.Kn(e),this.targetCount+=1,A.resolve()}updateTargetData(t,e){return this.Kn(e),A.resolve()}removeTargetData(t,e){return this.Nr.delete(e.target),this.Br.gr(e.targetId),this.targetCount-=1,A.resolve()}removeTargets(t,e,n){let s=0;const i=[];return this.Nr.forEach((a,u)=>{u.sequenceNumber<=e&&n.get(u.targetId)===null&&(this.Nr.delete(a),i.push(this.removeMatchingKeysForTargetId(t,u.targetId)),s++)}),A.waitFor(i).next(()=>s)}getTargetCount(t){return A.resolve(this.targetCount)}getTargetData(t,e){const n=this.Nr.get(e)||null;return A.resolve(n)}addMatchingKeys(t,e,n){return this.Br.Rr(e,n),A.resolve()}removeMatchingKeys(t,e,n){this.Br.mr(e,n);const s=this.persistence.referenceDelegate,i=[];return s&&e.forEach(a=>{i.push(s.markPotentiallyOrphaned(t,a))}),A.waitFor(i)}removeMatchingKeysForTargetId(t,e){return this.Br.gr(e),A.resolve()}getMatchingKeysForTargetId(t,e){const n=this.Br.yr(e);return A.resolve(n)}containsKey(t,e){return A.resolve(this.Br.containsKey(e))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xl{constructor(t,e){this.qr={},this.overlays={},this.Qr=new Lt(0),this.Kr=!1,this.Kr=!0,this.$r=new Nm,this.referenceDelegate=t(this),this.Ur=new Om(this),this.indexManager=new Tm,this.remoteDocumentCache=function(s){return new Fm(s)}(n=>this.referenceDelegate.Wr(n)),this.serializer=new Gl(e),this.Gr=new xm(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.Kr=!1,Promise.resolve()}get started(){return this.Kr}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(t){return this.indexManager}getDocumentOverlayCache(t){let e=this.overlays[t.toKey()];return e||(e=new Dm,this.overlays[t.toKey()]=e),e}getMutationQueue(t,e){let n=this.qr[t.toKey()];return n||(n=new km(e,this.referenceDelegate),this.qr[t.toKey()]=n),n}getGlobalsCache(){return this.$r}getTargetCache(){return this.Ur}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Gr}runTransaction(t,e,n){C("MemoryPersistence","Starting transaction:",t);const s=new Lm(this.Qr.next());return this.referenceDelegate.zr(),n(s).next(i=>this.referenceDelegate.jr(s).next(()=>i)).toPromise().then(i=>(s.raiseOnCommittedEvent(),i))}Hr(t,e){return A.or(Object.values(this.qr).map(n=>()=>n.containsKey(t,e)))}}class Lm extends zc{constructor(t){super(),this.currentSequenceNumber=t}}class Ws{constructor(t){this.persistence=t,this.Jr=new bo,this.Yr=null}static Zr(t){return new Ws(t)}get Xr(){if(this.Yr)return this.Yr;throw O()}addReference(t,e,n){return this.Jr.addReference(n,e),this.Xr.delete(n.toString()),A.resolve()}removeReference(t,e,n){return this.Jr.removeReference(n,e),this.Xr.add(n.toString()),A.resolve()}markPotentiallyOrphaned(t,e){return this.Xr.add(e.toString()),A.resolve()}removeTarget(t,e){this.Jr.gr(e.targetId).forEach(s=>this.Xr.add(s.toString()));const n=this.persistence.getTargetCache();return n.getMatchingKeysForTargetId(t,e.targetId).next(s=>{s.forEach(i=>this.Xr.add(i.toString()))}).next(()=>n.removeTargetData(t,e))}zr(){this.Yr=new Set}jr(t){const e=this.persistence.getRemoteDocumentCache().newChangeBuffer();return A.forEach(this.Xr,n=>{const s=F.fromPath(n);return this.ei(t,s).next(i=>{i||e.removeEntry(s,B.min())})}).next(()=>(this.Yr=null,e.apply(t)))}updateLimboDocument(t,e){return this.ei(t,e).next(n=>{n?this.Xr.delete(e.toString()):this.Xr.add(e.toString())})}Wr(t){return 0}ei(t,e){return A.or([()=>A.resolve(this.Jr.containsKey(e)),()=>this.persistence.getTargetCache().containsKey(t,e),()=>this.persistence.Hr(t,e)])}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bm{constructor(t){this.serializer=t}O(t,e,n,s){const i=new Us("createOrUpgrade",e);n<1&&s>=1&&(function(l){l.createObjectStore("owner")}(t),function(l){l.createObjectStore("mutationQueues",{keyPath:"userId"}),l.createObjectStore("mutations",{keyPath:"batchId",autoIncrement:!0}).createIndex("userMutationsIndex",Iu,{unique:!0}),l.createObjectStore("documentMutations")}(t),oc(t),function(l){l.createObjectStore("remoteDocuments")}(t));let a=A.resolve();return n<3&&s>=3&&(n!==0&&(function(l){l.deleteObjectStore("targetDocuments"),l.deleteObjectStore("targets"),l.deleteObjectStore("targetGlobal")}(t),oc(t)),a=a.next(()=>function(l){const d=l.store("targetGlobal"),f={highestTargetId:0,highestListenSequenceNumber:0,lastRemoteSnapshotVersion:B.min().toTimestamp(),targetCount:0};return d.put("targetGlobalKey",f)}(i))),n<4&&s>=4&&(n!==0&&(a=a.next(()=>function(l,d){return d.store("mutations").U().next(f=>{l.deleteObjectStore("mutations"),l.createObjectStore("mutations",{keyPath:"batchId",autoIncrement:!0}).createIndex("userMutationsIndex",Iu,{unique:!0});const g=d.store("mutations"),I=f.map(P=>g.put(P));return A.waitFor(I)})}(t,i))),a=a.next(()=>{(function(l){l.createObjectStore("clientMetadata",{keyPath:"clientId"})})(t)})),n<5&&s>=5&&(a=a.next(()=>this.ni(i))),n<6&&s>=6&&(a=a.next(()=>(function(l){l.createObjectStore("remoteDocumentGlobal")}(t),this.ri(i)))),n<7&&s>=7&&(a=a.next(()=>this.ii(i))),n<8&&s>=8&&(a=a.next(()=>this.si(t,i))),n<9&&s>=9&&(a=a.next(()=>{(function(l){l.objectStoreNames.contains("remoteDocumentChanges")&&l.deleteObjectStore("remoteDocumentChanges")})(t)})),n<10&&s>=10&&(a=a.next(()=>this.oi(i))),n<11&&s>=11&&(a=a.next(()=>{(function(l){l.createObjectStore("bundles",{keyPath:"bundleId"})})(t),function(l){l.createObjectStore("namedQueries",{keyPath:"name"})}(t)})),n<12&&s>=12&&(a=a.next(()=>{(function(l){const d=l.createObjectStore("documentOverlays",{keyPath:If});d.createIndex("collectionPathOverlayIndex",Tf,{unique:!1}),d.createIndex("collectionGroupOverlayIndex",Ef,{unique:!1})})(t)})),n<13&&s>=13&&(a=a.next(()=>function(l){const d=l.createObjectStore("remoteDocumentsV14",{keyPath:uf});d.createIndex("documentKeyIndex",cf),d.createIndex("collectionGroupIndex",lf)}(t)).next(()=>this._i(t,i)).next(()=>t.deleteObjectStore("remoteDocuments"))),n<14&&s>=14&&(a=a.next(()=>this.ai(t,i))),n<15&&s>=15&&(a=a.next(()=>function(l){l.createObjectStore("indexConfiguration",{keyPath:"indexId",autoIncrement:!0}).createIndex("collectionGroupIndex","collectionGroup",{unique:!1}),l.createObjectStore("indexState",{keyPath:gf}).createIndex("sequenceNumberIndex",_f,{unique:!1}),l.createObjectStore("indexEntries",{keyPath:pf}).createIndex("documentKeyIndex",yf,{unique:!1})}(t))),n<16&&s>=16&&(a=a.next(()=>{e.objectStore("indexState").clear()}).next(()=>{e.objectStore("indexEntries").clear()})),n<17&&s>=17&&(a=a.next(()=>{(function(l){l.createObjectStore("globals",{keyPath:"name"})})(t)})),a}ri(t){let e=0;return t.store("remoteDocuments").J((n,s)=>{e+=ks(s)}).next(()=>{const n={byteSize:e};return t.store("remoteDocumentGlobal").put("remoteDocumentGlobalKey",n)})}ni(t){const e=t.store("mutationQueues"),n=t.store("mutations");return e.U().next(s=>A.forEach(s,i=>{const a=IDBKeyRange.bound([i.userId,-1],[i.userId,i.lastAcknowledgedBatchId]);return n.U("userMutationsIndex",a).next(u=>A.forEach(u,l=>{L(l.userId===i.userId);const d=Le(this.serializer,l);return Ql(t,i.userId,d).next(()=>{})}))}))}ii(t){const e=t.store("targetDocuments"),n=t.store("remoteDocuments");return t.store("targetGlobal").get("targetGlobalKey").next(s=>{const i=[];return n.J((a,u)=>{const l=new z(a),d=function(g){return[0,kt(g)]}(l);i.push(e.get(d).next(f=>f?A.resolve():(g=>e.put({targetId:0,path:kt(g),sequenceNumber:s.highestListenSequenceNumber}))(l)))}).next(()=>A.waitFor(i))})}si(t,e){t.createObjectStore("collectionParents",{keyPath:mf});const n=e.store("collectionParents"),s=new So,i=a=>{if(s.add(a)){const u=a.lastSegment(),l=a.popLast();return n.put({collectionId:u,parent:kt(l)})}};return e.store("remoteDocuments").J({H:!0},(a,u)=>{const l=new z(a);return i(l.popLast())}).next(()=>e.store("documentMutations").J({H:!0},([a,u,l],d)=>{const f=zt(u);return i(f.popLast())}))}oi(t){const e=t.store("targets");return e.J((n,s)=>{const i=fr(s),a=Kl(this.serializer,i);return e.put(a)})}_i(t,e){const n=e.store("remoteDocuments"),s=[];return n.J((i,a)=>{const u=e.store("remoteDocumentsV14"),l=function(g){return g.document?new F(z.fromString(g.document.name).popFirst(5)):g.noDocument?F.fromSegments(g.noDocument.path):g.unknownDocument?F.fromSegments(g.unknownDocument.path):O()}(a).path.toArray(),d={prefixPath:l.slice(0,l.length-2),collectionGroup:l[l.length-2],documentId:l[l.length-1],readTime:a.readTime||[0,0],unknownDocument:a.unknownDocument,noDocument:a.noDocument,document:a.document,hasCommittedMutations:!!a.hasCommittedMutations};s.push(u.put(d))}).next(()=>A.waitFor(s))}ai(t,e){const n=e.store("mutations"),s=Jl(this.serializer),i=new Xl(Ws.Zr,this.serializer.ct);return n.U().next(a=>{const u=new Map;return a.forEach(l=>{var d;let f=(d=u.get(l.userId))!==null&&d!==void 0?d:j();Le(this.serializer,l).keys().forEach(g=>f=f.add(g)),u.set(l.userId,f)}),A.forEach(u,(l,d)=>{const f=new It(d),g=Qs.lt(this.serializer,f),I=i.getIndexManager(f),P=$s.lt(f,this.serializer,I,i.referenceDelegate);return new Yl(s,P,g,I).recalculateAndSaveOverlaysForDocumentKeys(new Gi(e,Lt.oe),l).next()})})}}function oc(r){r.createObjectStore("targetDocuments",{keyPath:df}).createIndex("documentTargetsIndex",ff,{unique:!0}),r.createObjectStore("targets",{keyPath:"targetId"}).createIndex("queryTargetsIndex",hf,{unique:!0}),r.createObjectStore("targetGlobal")}const Fi="Failed to obtain exclusive access to the persistence layer. To allow shared access, multi-tab synchronization has to be enabled in all tabs. If you are using `experimentalForceOwningTab:true`, make sure that only one tab has persistence enabled at any given time.";class Co{constructor(t,e,n,s,i,a,u,l,d,f,g=17){if(this.allowTabSynchronization=t,this.persistenceKey=e,this.clientId=n,this.ui=i,this.window=a,this.document=u,this.ci=d,this.li=f,this.hi=g,this.Qr=null,this.Kr=!1,this.isPrimary=!1,this.networkEnabled=!0,this.Pi=null,this.inForeground=!1,this.Ii=null,this.Ti=null,this.Ei=Number.NEGATIVE_INFINITY,this.di=I=>Promise.resolve(),!Co.D())throw new b(V.UNIMPLEMENTED,"This platform is either missing IndexedDB or is known to have an incomplete implementation. Offline persistence has been disabled.");this.referenceDelegate=new Vm(this,s),this.Ai=e+"main",this.serializer=new Gl(l),this.Ri=new $t(this.Ai,this.hi,new Bm(this.serializer)),this.$r=new mm,this.Ur=new wm(this.referenceDelegate,this.serializer),this.remoteDocumentCache=Jl(this.serializer),this.Gr=new fm,this.window&&this.window.localStorage?this.Vi=this.window.localStorage:(this.Vi=null,f===!1&&dt("IndexedDbPersistence","LocalStorage is unavailable. As a result, persistence may not work reliably. In particular enablePersistence() could fail immediately after refreshing the page."))}start(){return this.mi().then(()=>{if(!this.isPrimary&&!this.allowTabSynchronization)throw new b(V.FAILED_PRECONDITION,Fi);return this.fi(),this.gi(),this.pi(),this.runTransaction("getHighestListenSequenceNumber","readonly",t=>this.Ur.getHighestSequenceNumber(t))}).then(t=>{this.Qr=new Lt(t,this.ci)}).then(()=>{this.Kr=!0}).catch(t=>(this.Ri&&this.Ri.close(),Promise.reject(t)))}yi(t){return this.di=async e=>{if(this.started)return t(e)},t(this.isPrimary)}setDatabaseDeletedListener(t){this.Ri.L(async e=>{e.newVersion===null&&await t()})}setNetworkEnabled(t){this.networkEnabled!==t&&(this.networkEnabled=t,this.ui.enqueueAndForget(async()=>{this.started&&await this.mi()}))}mi(){return this.runTransaction("updateClientMetadataAndTryBecomePrimary","readwrite",t=>ps(t).put({clientId:this.clientId,updateTimeMs:Date.now(),networkEnabled:this.networkEnabled,inForeground:this.inForeground}).next(()=>{if(this.isPrimary)return this.wi(t).next(e=>{e||(this.isPrimary=!1,this.ui.enqueueRetryable(()=>this.di(!1)))})}).next(()=>this.Si(t)).next(e=>this.isPrimary&&!e?this.bi(t).next(()=>!1):!!e&&this.Di(t).next(()=>!0))).catch(t=>{if(Se(t))return C("IndexedDbPersistence","Failed to extend owner lease: ",t),this.isPrimary;if(!this.allowTabSynchronization)throw t;return C("IndexedDbPersistence","Releasing owner lease after error during lease refresh",t),!1}).then(t=>{this.isPrimary!==t&&this.ui.enqueueRetryable(()=>this.di(t)),this.isPrimary=t})}wi(t){return cr(t).get("owner").next(e=>A.resolve(this.vi(e)))}Ci(t){return ps(t).delete(this.clientId)}async Fi(){if(this.isPrimary&&!this.Mi(this.Ei,18e5)){this.Ei=Date.now();const t=await this.runTransaction("maybeGarbageCollectMultiClientState","readwrite-primary",e=>{const n=pt(e,"clientMetadata");return n.U().next(s=>{const i=this.xi(s,18e5),a=s.filter(u=>i.indexOf(u)===-1);return A.forEach(a,u=>n.delete(u.clientId)).next(()=>a)})}).catch(()=>[]);if(this.Vi)for(const e of t)this.Vi.removeItem(this.Oi(e.clientId))}}pi(){this.Ti=this.ui.enqueueAfterDelay("client_metadata_refresh",4e3,()=>this.mi().then(()=>this.Fi()).then(()=>this.pi()))}vi(t){return!!t&&t.ownerId===this.clientId}Si(t){return this.li?A.resolve(!0):cr(t).get("owner").next(e=>{if(e!==null&&this.Mi(e.leaseTimestampMs,5e3)&&!this.Ni(e.ownerId)){if(this.vi(e)&&this.networkEnabled)return!0;if(!this.vi(e)){if(!e.allowTabSynchronization)throw new b(V.FAILED_PRECONDITION,Fi);return!1}}return!(!this.networkEnabled||!this.inForeground)||ps(t).U().next(n=>this.xi(n,5e3).find(s=>{if(this.clientId!==s.clientId){const i=!this.networkEnabled&&s.networkEnabled,a=!this.inForeground&&s.inForeground,u=this.networkEnabled===s.networkEnabled;if(i||a&&u)return!0}return!1})===void 0)}).next(e=>(this.isPrimary!==e&&C("IndexedDbPersistence",`Client ${e?"is":"is not"} eligible for a primary lease.`),e))}async shutdown(){this.Kr=!1,this.Li(),this.Ti&&(this.Ti.cancel(),this.Ti=null),this.Bi(),this.ki(),await this.Ri.runTransaction("shutdown","readwrite",["owner","clientMetadata"],t=>{const e=new Gi(t,Lt.oe);return this.bi(e).next(()=>this.Ci(e))}),this.Ri.close(),this.qi()}xi(t,e){return t.filter(n=>this.Mi(n.updateTimeMs,e)&&!this.Ni(n.clientId))}Qi(){return this.runTransaction("getActiveClients","readonly",t=>ps(t).U().next(e=>this.xi(e,18e5).map(n=>n.clientId)))}get started(){return this.Kr}getGlobalsCache(){return this.$r}getMutationQueue(t,e){return $s.lt(t,this.serializer,e,this.referenceDelegate)}getTargetCache(){return this.Ur}getRemoteDocumentCache(){return this.remoteDocumentCache}getIndexManager(t){return new Em(t,this.serializer.ct.databaseId)}getDocumentOverlayCache(t){return Qs.lt(this.serializer,t)}getBundleCache(){return this.Gr}runTransaction(t,e,n){C("IndexedDbPersistence","Starting transaction:",t);const s=e==="readonly"?"readonly":"readwrite",i=function(l){return l===17?Af:l===16?vf:l===15?mo:l===14?Yc:l===13?Jc:l===12?wf:l===11?Hc:void O()}(this.hi);let a;return this.Ri.runTransaction(t,s,i,u=>(a=new Gi(u,this.Qr?this.Qr.next():Lt.oe),e==="readwrite-primary"?this.wi(a).next(l=>!!l||this.Si(a)).next(l=>{if(!l)throw dt(`Failed to obtain primary lease for action '${t}'.`),this.isPrimary=!1,this.ui.enqueueRetryable(()=>this.di(!1)),new b(V.FAILED_PRECONDITION,jc);return n(a)}).next(l=>this.Di(a).next(()=>l)):this.Ki(a).next(()=>n(a)))).then(u=>(a.raiseOnCommittedEvent(),u))}Ki(t){return cr(t).get("owner").next(e=>{if(e!==null&&this.Mi(e.leaseTimestampMs,5e3)&&!this.Ni(e.ownerId)&&!this.vi(e)&&!(this.li||this.allowTabSynchronization&&e.allowTabSynchronization))throw new b(V.FAILED_PRECONDITION,Fi)})}Di(t){const e={ownerId:this.clientId,allowTabSynchronization:this.allowTabSynchronization,leaseTimestampMs:Date.now()};return cr(t).put("owner",e)}static D(){return $t.D()}bi(t){const e=cr(t);return e.get("owner").next(n=>this.vi(n)?(C("IndexedDbPersistence","Releasing primary lease."),e.delete("owner")):A.resolve())}Mi(t,e){const n=Date.now();return!(t<n-e)&&(!(t>n)||(dt(`Detected an update time that is in the future: ${t} > ${n}`),!1))}fi(){this.document!==null&&typeof this.document.addEventListener=="function"&&(this.Ii=()=>{this.ui.enqueueAndForget(()=>(this.inForeground=this.document.visibilityState==="visible",this.mi()))},this.document.addEventListener("visibilitychange",this.Ii),this.inForeground=this.document.visibilityState==="visible")}Bi(){this.Ii&&(this.document.removeEventListener("visibilitychange",this.Ii),this.Ii=null)}gi(){var t;typeof((t=this.window)===null||t===void 0?void 0:t.addEventListener)=="function"&&(this.Pi=()=>{this.Li();const e=/(?:Version|Mobile)\/1[456]/;Dc()&&(navigator.appVersion.match(e)||navigator.userAgent.match(e))&&this.ui.enterRestrictedMode(!0),this.ui.enqueueAndForget(()=>this.shutdown())},this.window.addEventListener("pagehide",this.Pi))}ki(){this.Pi&&(this.window.removeEventListener("pagehide",this.Pi),this.Pi=null)}Ni(t){var e;try{const n=((e=this.Vi)===null||e===void 0?void 0:e.getItem(this.Oi(t)))!==null;return C("IndexedDbPersistence",`Client '${t}' ${n?"is":"is not"} zombied in LocalStorage`),n}catch(n){return dt("IndexedDbPersistence","Failed to get zombied client id.",n),!1}}Li(){if(this.Vi)try{this.Vi.setItem(this.Oi(this.clientId),String(Date.now()))}catch(t){dt("Failed to set zombie client id.",t)}}qi(){if(this.Vi)try{this.Vi.removeItem(this.Oi(this.clientId))}catch{}}Oi(t){return`firestore_zombie_${this.persistenceKey}_${t}`}}function cr(r){return pt(r,"owner")}function ps(r){return pt(r,"clientMetadata")}function xo(r,t){let e=r.projectId;return r.isDefaultDatabase||(e+="."+r.database),"firestore/"+t+"/"+e+"/"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Do{constructor(t,e,n,s){this.targetId=t,this.fromCache=e,this.$i=n,this.Ui=s}static Wi(t,e){let n=j(),s=j();for(const i of e.docChanges)switch(i.type){case 0:n=n.add(i.doc.key);break;case 1:s=s.add(i.doc.key)}return new Do(t,e.fromCache,n,s)}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qm{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(t){this._documentReadCount+=t}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zl{constructor(){this.Gi=!1,this.zi=!1,this.ji=100,this.Hi=function(){return Dc()?8:Qc(Vs())>0?6:4}()}initialize(t,e){this.Ji=t,this.indexManager=e,this.Gi=!0}getDocumentsMatchingQuery(t,e,n,s){const i={result:null};return this.Yi(t,e).next(a=>{i.result=a}).next(()=>{if(!i.result)return this.Zi(t,e,s,n).next(a=>{i.result=a})}).next(()=>{if(i.result)return;const a=new qm;return this.Xi(t,e,a).next(u=>{if(i.result=u,this.zi)return this.es(t,e,a,u.size)})}).next(()=>i.result)}es(t,e,n,s){return n.documentReadCount<this.ji?(mn()<=ee.DEBUG&&C("QueryEngine","SDK will not create cache indexes for query:",gn(e),"since it only creates cache indexes for collection contains","more than or equal to",this.ji,"documents"),A.resolve()):(mn()<=ee.DEBUG&&C("QueryEngine","Query:",gn(e),"scans",n.documentReadCount,"local documents and returns",s,"documents as results."),n.documentReadCount>this.Hi*s?(mn()<=ee.DEBUG&&C("QueryEngine","The SDK decides to create cache indexes for query:",gn(e),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(t,Ft(e))):A.resolve())}Yi(t,e){if(Du(e))return A.resolve(null);let n=Ft(e);return this.indexManager.getIndexType(t,n).next(s=>s===0?null:(e.limit!==null&&s===1&&(e=xs(e,null,"F"),n=Ft(e)),this.indexManager.getDocumentsMatchingTarget(t,n).next(i=>{const a=j(...i);return this.Ji.getDocuments(t,a).next(u=>this.indexManager.getMinOffset(t,n).next(l=>{const d=this.ts(e,u);return this.ns(e,d,a,l.readTime)?this.Yi(t,xs(e,null,"F")):this.rs(t,d,e,l)}))})))}Zi(t,e,n,s){return Du(e)||s.isEqual(B.min())?A.resolve(null):this.Ji.getDocuments(t,n).next(i=>{const a=this.ts(e,i);return this.ns(e,a,n,s)?A.resolve(null):(mn()<=ee.DEBUG&&C("QueryEngine","Re-using previous result from %s to execute query: %s",s.toString(),gn(e)),this.rs(t,a,e,Gc(s,-1)).next(u=>u))})}ts(t,e){let n=new Z(fl(t));return e.forEach((s,i)=>{Lr(t,i)&&(n=n.add(i))}),n}ns(t,e,n,s){if(t.limit===null)return!1;if(n.size!==e.size)return!0;const i=t.limitType==="F"?e.last():e.first();return!!i&&(i.hasPendingWrites||i.version.compareTo(s)>0)}Xi(t,e,n){return mn()<=ee.DEBUG&&C("QueryEngine","Using full collection scan to execute query:",gn(e)),this.Ji.getDocumentsMatchingQuery(t,e,Gt.min(),n)}rs(t,e,n,s){return this.Ji.getDocumentsMatchingQuery(t,n,s).next(i=>(e.forEach(a=>{i=i.insert(a.key,a)}),i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Um{constructor(t,e,n,s){this.persistence=t,this.ss=e,this.serializer=s,this.os=new nt(G),this._s=new be(i=>$e(i),Mr),this.us=new Map,this.cs=t.getRemoteDocumentCache(),this.Ur=t.getTargetCache(),this.Gr=t.getBundleCache(),this.ls(n)}ls(t){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(t),this.indexManager=this.persistence.getIndexManager(t),this.mutationQueue=this.persistence.getMutationQueue(t,this.indexManager),this.localDocuments=new Yl(this.cs,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.cs.setIndexManager(this.indexManager),this.ss.initialize(this.localDocuments,this.indexManager)}collectGarbage(t){return this.persistence.runTransaction("Collect garbage","readwrite-primary",e=>t.collect(e,this.os))}}function th(r,t,e,n){return new Um(r,t,e,n)}async function eh(r,t){const e=M(r);return await e.persistence.runTransaction("Handle user change","readonly",n=>{let s;return e.mutationQueue.getAllMutationBatches(n).next(i=>(s=i,e.ls(t),e.mutationQueue.getAllMutationBatches(n))).next(i=>{const a=[],u=[];let l=j();for(const d of s){a.push(d.batchId);for(const f of d.mutations)l=l.add(f.key)}for(const d of i){u.push(d.batchId);for(const f of d.mutations)l=l.add(f.key)}return e.localDocuments.getDocuments(n,l).next(d=>({hs:d,removedBatchIds:a,addedBatchIds:u}))})})}function Gm(r,t){const e=M(r);return e.persistence.runTransaction("Acknowledge batch","readwrite-primary",n=>{const s=t.batch.keys(),i=e.cs.newChangeBuffer({trackRemovals:!0});return function(u,l,d,f){const g=d.batch,I=g.keys();let P=A.resolve();return I.forEach(x=>{P=P.next(()=>f.getEntry(l,x)).next(N=>{const D=d.docVersions.get(x);L(D!==null),N.version.compareTo(D)<0&&(g.applyToRemoteDocument(N,d),N.isValidDocument()&&(N.setReadTime(d.commitVersion),f.addEntry(N)))})}),P.next(()=>u.mutationQueue.removeMutationBatch(l,g))}(e,n,t,i).next(()=>i.apply(n)).next(()=>e.mutationQueue.performConsistencyCheck(n)).next(()=>e.documentOverlayCache.removeOverlaysForBatchId(n,s,t.batch.batchId)).next(()=>e.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(n,function(u){let l=j();for(let d=0;d<u.mutationResults.length;++d)u.mutationResults[d].transformResults.length>0&&(l=l.add(u.batch.mutations[d].key));return l}(t))).next(()=>e.localDocuments.getDocuments(n,s))})}function nh(r){const t=M(r);return t.persistence.runTransaction("Get last remote snapshot version","readonly",e=>t.Ur.getLastRemoteSnapshotVersion(e))}function Km(r,t){const e=M(r),n=t.snapshotVersion;let s=e.os;return e.persistence.runTransaction("Apply remote event","readwrite-primary",i=>{const a=e.cs.newChangeBuffer({trackRemovals:!0});s=e.os;const u=[];t.targetChanges.forEach((f,g)=>{const I=s.get(g);if(!I)return;u.push(e.Ur.removeMatchingKeys(i,f.removedDocuments,g).next(()=>e.Ur.addMatchingKeys(i,f.addedDocuments,g)));let P=I.withSequenceNumber(i.currentSequenceNumber);t.targetMismatches.get(g)!==null?P=P.withResumeToken(ht.EMPTY_BYTE_STRING,B.min()).withLastLimboFreeSnapshotVersion(B.min()):f.resumeToken.approximateByteSize()>0&&(P=P.withResumeToken(f.resumeToken,n)),s=s.insert(g,P),function(N,D,U){return N.resumeToken.approximateByteSize()===0||D.snapshotVersion.toMicroseconds()-N.snapshotVersion.toMicroseconds()>=3e8?!0:U.addedDocuments.size+U.modifiedDocuments.size+U.removedDocuments.size>0}(I,P,f)&&u.push(e.Ur.updateTargetData(i,P))});let l=qt(),d=j();if(t.documentUpdates.forEach(f=>{t.resolvedLimboDocuments.has(f)&&u.push(e.persistence.referenceDelegate.updateLimboDocument(i,f))}),u.push(rh(i,a,t.documentUpdates).next(f=>{l=f.Ps,d=f.Is})),!n.isEqual(B.min())){const f=e.Ur.getLastRemoteSnapshotVersion(i).next(g=>e.Ur.setTargetsMetadata(i,i.currentSequenceNumber,n));u.push(f)}return A.waitFor(u).next(()=>a.apply(i)).next(()=>e.localDocuments.getLocalViewOfDocuments(i,l,d)).next(()=>l)}).then(i=>(e.os=s,i))}function rh(r,t,e){let n=j(),s=j();return e.forEach(i=>n=n.add(i)),t.getEntries(r,n).next(i=>{let a=qt();return e.forEach((u,l)=>{const d=i.get(u);l.isFoundDocument()!==d.isFoundDocument()&&(s=s.add(u)),l.isNoDocument()&&l.version.isEqual(B.min())?(t.removeEntry(u,l.readTime),a=a.insert(u,l)):!d.isValidDocument()||l.version.compareTo(d.version)>0||l.version.compareTo(d.version)===0&&d.hasPendingWrites?(t.addEntry(l),a=a.insert(u,l)):C("LocalStore","Ignoring outdated watch update for ",u,". Current version:",d.version," Watch version:",l.version)}),{Ps:a,Is:s}})}function jm(r,t){const e=M(r);return e.persistence.runTransaction("Get next mutation batch","readonly",n=>(t===void 0&&(t=-1),e.mutationQueue.getNextMutationBatchAfterBatchId(n,t)))}function Vn(r,t){const e=M(r);return e.persistence.runTransaction("Allocate target","readwrite",n=>{let s;return e.Ur.getTargetData(n,t).next(i=>i?(s=i,A.resolve(s)):e.Ur.allocateTargetId(n).next(a=>(s=new ne(t,a,"TargetPurposeListen",n.currentSequenceNumber),e.Ur.addTargetData(n,s).next(()=>s))))}).then(n=>{const s=e.os.get(n.targetId);return(s===null||n.snapshotVersion.compareTo(s.snapshotVersion)>0)&&(e.os=e.os.insert(n.targetId,n),e._s.set(t,n.targetId)),n})}async function Sn(r,t,e){const n=M(r),s=n.os.get(t),i=e?"readwrite":"readwrite-primary";try{e||await n.persistence.runTransaction("Release target",i,a=>n.persistence.referenceDelegate.removeTarget(a,s))}catch(a){if(!Se(a))throw a;C("LocalStore",`Failed to update sequence numbers for target ${t}: ${a}`)}n.os=n.os.remove(t),n._s.delete(s.target)}function Fs(r,t,e){const n=M(r);let s=B.min(),i=j();return n.persistence.runTransaction("Execute query","readwrite",a=>function(l,d,f){const g=M(l),I=g._s.get(f);return I!==void 0?A.resolve(g.os.get(I)):g.Ur.getTargetData(d,f)}(n,a,Ft(t)).next(u=>{if(u)return s=u.lastLimboFreeSnapshotVersion,n.Ur.getMatchingKeysForTargetId(a,u.targetId).next(l=>{i=l})}).next(()=>n.ss.getDocumentsMatchingQuery(a,t,e?s:B.min(),e?i:j())).next(u=>(oh(n,dl(t),u),{documents:u,Ts:i})))}function sh(r,t){const e=M(r),n=M(e.Ur),s=e.os.get(t);return s?Promise.resolve(s.target):e.persistence.runTransaction("Get target data","readonly",i=>n.ot(i,t).next(a=>a?a.target:null))}function ih(r,t){const e=M(r),n=e.us.get(t)||B.min();return e.persistence.runTransaction("Get new document changes","readonly",s=>e.cs.getAllFromCollectionGroup(s,t,Gc(n,-1),Number.MAX_SAFE_INTEGER)).then(s=>(oh(e,t,s),s))}function oh(r,t,e){let n=r.us.get(t)||B.min();e.forEach((s,i)=>{i.readTime.compareTo(n)>0&&(n=i.readTime)}),r.us.set(t,n)}async function zm(r,t,e,n){const s=M(r);let i=j(),a=qt();for(const d of e){const f=t.Es(d.metadata.name);d.document&&(i=i.add(f));const g=t.ds(d);g.setReadTime(t.As(d.metadata.readTime)),a=a.insert(f,g)}const u=s.cs.newChangeBuffer({trackRemovals:!0}),l=await Vn(s,function(f){return Ft(Fn(z.fromString(`__bundle__/docs/${f}`)))}(n));return s.persistence.runTransaction("Apply bundle documents","readwrite",d=>rh(d,u,a).next(f=>(u.apply(d),f)).next(f=>s.Ur.removeMatchingKeysForTargetId(d,l.targetId).next(()=>s.Ur.addMatchingKeys(d,i,l.targetId)).next(()=>s.localDocuments.getLocalViewOfDocuments(d,f.Ps,f.Is)).next(()=>f.Ps)))}async function Qm(r,t,e=j()){const n=await Vn(r,Ft(Po(t.bundledQuery))),s=M(r);return s.persistence.runTransaction("Save named query","readwrite",i=>{const a=ft(t.readTime);if(n.snapshotVersion.compareTo(a)>=0)return s.Gr.saveNamedQuery(i,t);const u=n.withResumeToken(ht.EMPTY_BYTE_STRING,a);return s.os=s.os.insert(u.targetId,u),s.Ur.updateTargetData(i,u).next(()=>s.Ur.removeMatchingKeysForTargetId(i,n.targetId)).next(()=>s.Ur.addMatchingKeys(i,e,n.targetId)).next(()=>s.Gr.saveNamedQuery(i,t))})}function ac(r,t){return`firestore_clients_${r}_${t}`}function uc(r,t,e){let n=`firestore_mutations_${r}_${e}`;return t.isAuthenticated()&&(n+=`_${t.uid}`),n}function Mi(r,t){return`firestore_targets_${r}_${t}`}class Ms{constructor(t,e,n,s){this.user=t,this.batchId=e,this.state=n,this.error=s}static Rs(t,e,n){const s=JSON.parse(n);let i,a=typeof s=="object"&&["pending","acknowledged","rejected"].indexOf(s.state)!==-1&&(s.error===void 0||typeof s.error=="object");return a&&s.error&&(a=typeof s.error.message=="string"&&typeof s.error.code=="string",a&&(i=new b(s.error.code,s.error.message))),a?new Ms(t,e,s.state,i):(dt("SharedClientState",`Failed to parse mutation state for ID '${e}': ${n}`),null)}Vs(){const t={state:this.state,updateTimeMs:Date.now()};return this.error&&(t.error={code:this.error.code,message:this.error.message}),JSON.stringify(t)}}class yr{constructor(t,e,n){this.targetId=t,this.state=e,this.error=n}static Rs(t,e){const n=JSON.parse(e);let s,i=typeof n=="object"&&["not-current","current","rejected"].indexOf(n.state)!==-1&&(n.error===void 0||typeof n.error=="object");return i&&n.error&&(i=typeof n.error.message=="string"&&typeof n.error.code=="string",i&&(s=new b(n.error.code,n.error.message))),i?new yr(t,n.state,s):(dt("SharedClientState",`Failed to parse target state for ID '${t}': ${e}`),null)}Vs(){const t={state:this.state,updateTimeMs:Date.now()};return this.error&&(t.error={code:this.error.code,message:this.error.message}),JSON.stringify(t)}}class Os{constructor(t,e){this.clientId=t,this.activeTargetIds=e}static Rs(t,e){const n=JSON.parse(e);let s=typeof n=="object"&&n.activeTargetIds instanceof Array,i=yo();for(let a=0;s&&a<n.activeTargetIds.length;++a)s=$c(n.activeTargetIds[a]),i=i.add(n.activeTargetIds[a]);return s?new Os(t,i):(dt("SharedClientState",`Failed to parse client data for instance '${t}': ${e}`),null)}}class No{constructor(t,e){this.clientId=t,this.onlineState=e}static Rs(t){const e=JSON.parse(t);return typeof e=="object"&&["Unknown","Online","Offline"].indexOf(e.onlineState)!==-1&&typeof e.clientId=="string"?new No(e.clientId,e.onlineState):(dt("SharedClientState",`Failed to parse online state: ${t}`),null)}}class no{constructor(){this.activeTargetIds=yo()}fs(t){this.activeTargetIds=this.activeTargetIds.add(t)}gs(t){this.activeTargetIds=this.activeTargetIds.delete(t)}Vs(){const t={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(t)}}class Oi{constructor(t,e,n,s,i){this.window=t,this.ui=e,this.persistenceKey=n,this.ps=s,this.syncEngine=null,this.onlineStateHandler=null,this.sequenceNumberHandler=null,this.ys=this.ws.bind(this),this.Ss=new nt(G),this.started=!1,this.bs=[];const a=n.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");this.storage=this.window.localStorage,this.currentUser=i,this.Ds=ac(this.persistenceKey,this.ps),this.vs=function(l){return`firestore_sequence_number_${l}`}(this.persistenceKey),this.Ss=this.Ss.insert(this.ps,new no),this.Cs=new RegExp(`^firestore_clients_${a}_([^_]*)$`),this.Fs=new RegExp(`^firestore_mutations_${a}_(\\d+)(?:_(.*))?$`),this.Ms=new RegExp(`^firestore_targets_${a}_(\\d+)$`),this.xs=function(l){return`firestore_online_state_${l}`}(this.persistenceKey),this.Os=function(l){return`firestore_bundle_loaded_v2_${l}`}(this.persistenceKey),this.window.addEventListener("storage",this.ys)}static D(t){return!(!t||!t.localStorage)}async start(){const t=await this.syncEngine.Qi();for(const n of t){if(n===this.ps)continue;const s=this.getItem(ac(this.persistenceKey,n));if(s){const i=Os.Rs(n,s);i&&(this.Ss=this.Ss.insert(i.clientId,i))}}this.Ns();const e=this.storage.getItem(this.xs);if(e){const n=this.Ls(e);n&&this.Bs(n)}for(const n of this.bs)this.ws(n);this.bs=[],this.window.addEventListener("pagehide",()=>this.shutdown()),this.started=!0}writeSequenceNumber(t){this.setItem(this.vs,JSON.stringify(t))}getAllActiveQueryTargets(){return this.ks(this.Ss)}isActiveQueryTarget(t){let e=!1;return this.Ss.forEach((n,s)=>{s.activeTargetIds.has(t)&&(e=!0)}),e}addPendingMutation(t){this.qs(t,"pending")}updateMutationState(t,e,n){this.qs(t,e,n),this.Qs(t)}addLocalQueryTarget(t,e=!0){let n="not-current";if(this.isActiveQueryTarget(t)){const s=this.storage.getItem(Mi(this.persistenceKey,t));if(s){const i=yr.Rs(t,s);i&&(n=i.state)}}return e&&this.Ks.fs(t),this.Ns(),n}removeLocalQueryTarget(t){this.Ks.gs(t),this.Ns()}isLocalQueryTarget(t){return this.Ks.activeTargetIds.has(t)}clearQueryState(t){this.removeItem(Mi(this.persistenceKey,t))}updateQueryState(t,e,n){this.$s(t,e,n)}handleUserChange(t,e,n){e.forEach(s=>{this.Qs(s)}),this.currentUser=t,n.forEach(s=>{this.addPendingMutation(s)})}setOnlineState(t){this.Us(t)}notifyBundleLoaded(t){this.Ws(t)}shutdown(){this.started&&(this.window.removeEventListener("storage",this.ys),this.removeItem(this.Ds),this.started=!1)}getItem(t){const e=this.storage.getItem(t);return C("SharedClientState","READ",t,e),e}setItem(t,e){C("SharedClientState","SET",t,e),this.storage.setItem(t,e)}removeItem(t){C("SharedClientState","REMOVE",t),this.storage.removeItem(t)}ws(t){const e=t;if(e.storageArea===this.storage){if(C("SharedClientState","EVENT",e.key,e.newValue),e.key===this.Ds)return void dt("Received WebStorage notification for local change. Another client might have garbage-collected our state");this.ui.enqueueRetryable(async()=>{if(this.started){if(e.key!==null){if(this.Cs.test(e.key)){if(e.newValue==null){const n=this.Gs(e.key);return this.zs(n,null)}{const n=this.js(e.key,e.newValue);if(n)return this.zs(n.clientId,n)}}else if(this.Fs.test(e.key)){if(e.newValue!==null){const n=this.Hs(e.key,e.newValue);if(n)return this.Js(n)}}else if(this.Ms.test(e.key)){if(e.newValue!==null){const n=this.Ys(e.key,e.newValue);if(n)return this.Zs(n)}}else if(e.key===this.xs){if(e.newValue!==null){const n=this.Ls(e.newValue);if(n)return this.Bs(n)}}else if(e.key===this.vs){const n=function(i){let a=Lt.oe;if(i!=null)try{const u=JSON.parse(i);L(typeof u=="number"),a=u}catch(u){dt("SharedClientState","Failed to read sequence number from WebStorage",u)}return a}(e.newValue);n!==Lt.oe&&this.sequenceNumberHandler(n)}else if(e.key===this.Os){const n=this.Xs(e.newValue);await Promise.all(n.map(s=>this.syncEngine.eo(s)))}}}else this.bs.push(e)})}}get Ks(){return this.Ss.get(this.ps)}Ns(){this.setItem(this.Ds,this.Ks.Vs())}qs(t,e,n){const s=new Ms(this.currentUser,t,e,n),i=uc(this.persistenceKey,this.currentUser,t);this.setItem(i,s.Vs())}Qs(t){const e=uc(this.persistenceKey,this.currentUser,t);this.removeItem(e)}Us(t){const e={clientId:this.ps,onlineState:t};this.storage.setItem(this.xs,JSON.stringify(e))}$s(t,e,n){const s=Mi(this.persistenceKey,t),i=new yr(t,e,n);this.setItem(s,i.Vs())}Ws(t){const e=JSON.stringify(Array.from(t));this.setItem(this.Os,e)}Gs(t){const e=this.Cs.exec(t);return e?e[1]:null}js(t,e){const n=this.Gs(t);return Os.Rs(n,e)}Hs(t,e){const n=this.Fs.exec(t),s=Number(n[1]),i=n[2]!==void 0?n[2]:null;return Ms.Rs(new It(i),s,e)}Ys(t,e){const n=this.Ms.exec(t),s=Number(n[1]);return yr.Rs(s,e)}Ls(t){return No.Rs(t)}Xs(t){return JSON.parse(t)}async Js(t){if(t.user.uid===this.currentUser.uid)return this.syncEngine.no(t.batchId,t.state,t.error);C("SharedClientState",`Ignoring mutation for non-active user ${t.user.uid}`)}Zs(t){return this.syncEngine.ro(t.targetId,t.state,t.error)}zs(t,e){const n=e?this.Ss.insert(t,e):this.Ss.remove(t),s=this.ks(this.Ss),i=this.ks(n),a=[],u=[];return i.forEach(l=>{s.has(l)||a.push(l)}),s.forEach(l=>{i.has(l)||u.push(l)}),this.syncEngine.io(a,u).then(()=>{this.Ss=n})}Bs(t){this.Ss.get(t.clientId)&&this.onlineStateHandler(t.onlineState)}ks(t){let e=yo();return t.forEach((n,s)=>{e=e.unionWith(s.activeTargetIds)}),e}}class ah{constructor(){this.so=new no,this.oo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(t){}updateMutationState(t,e,n){}addLocalQueryTarget(t,e=!0){return e&&this.so.fs(t),this.oo[t]||"not-current"}updateQueryState(t,e,n){this.oo[t]=e}removeLocalQueryTarget(t){this.so.gs(t)}isLocalQueryTarget(t){return this.so.activeTargetIds.has(t)}clearQueryState(t){delete this.oo[t]}getAllActiveQueryTargets(){return this.so.activeTargetIds}isActiveQueryTarget(t){return this.so.activeTargetIds.has(t)}start(){return this.so=new no,Promise.resolve()}handleUserChange(t,e,n){}setOnlineState(t){}shutdown(){}writeSequenceNumber(t){}notifyBundleLoaded(t){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $m{_o(t){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cc{constructor(){this.ao=()=>this.uo(),this.co=()=>this.lo(),this.ho=[],this.Po()}_o(t){this.ho.push(t)}shutdown(){window.removeEventListener("online",this.ao),window.removeEventListener("offline",this.co)}Po(){window.addEventListener("online",this.ao),window.addEventListener("offline",this.co)}uo(){C("ConnectivityMonitor","Network connectivity changed: AVAILABLE");for(const t of this.ho)t(0)}lo(){C("ConnectivityMonitor","Network connectivity changed: UNAVAILABLE");for(const t of this.ho)t(1)}static D(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let ys=null;function Li(){return ys===null?ys=function(){return 268435456+Math.round(2147483648*Math.random())}():ys++,"0x"+ys.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Wm={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hm{constructor(t){this.Io=t.Io,this.To=t.To}Eo(t){this.Ao=t}Ro(t){this.Vo=t}mo(t){this.fo=t}onMessage(t){this.po=t}close(){this.To()}send(t){this.Io(t)}yo(){this.Ao()}wo(){this.Vo()}So(t){this.fo(t)}bo(t){this.po(t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const St="WebChannelConnection";class Jm extends class{constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const n=e.ssl?"https":"http",s=encodeURIComponent(this.databaseId.projectId),i=encodeURIComponent(this.databaseId.database);this.Do=n+"://"+e.host,this.vo=`projects/${s}/databases/${i}`,this.Co=this.databaseId.database==="(default)"?`project_id=${s}`:`project_id=${s}&database_id=${i}`}get Fo(){return!1}Mo(e,n,s,i,a){const u=Li(),l=this.xo(e,n.toUriEncodedString());C("RestConnection",`Sending RPC '${e}' ${u}:`,l,s);const d={"google-cloud-resource-prefix":this.vo,"x-goog-request-params":this.Co};return this.Oo(d,i,a),this.No(e,l,d,s).then(f=>(C("RestConnection",`Received RPC '${e}' ${u}: `,f),f),f=>{throw Ht("RestConnection",`RPC '${e}' ${u} failed with error: `,f,"url: ",l,"request:",s),f})}Lo(e,n,s,i,a,u){return this.Mo(e,n,s,i,a)}Oo(e,n,s){e["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+kn}(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),n&&n.headers.forEach((i,a)=>e[a]=i),s&&s.headers.forEach((i,a)=>e[a]=i)}xo(e,n){const s=Wm[e];return`${this.Do}/v1/${n}:${s}`}terminate(){}}{constructor(t){super(t),this.forceLongPolling=t.forceLongPolling,this.autoDetectLongPolling=t.autoDetectLongPolling,this.useFetchStreams=t.useFetchStreams,this.longPollingOptions=t.longPollingOptions}No(t,e,n,s){const i=Li();return new Promise((a,u)=>{const l=new kc;l.setWithCredentials(!0),l.listenOnce(Fc.COMPLETE,()=>{try{switch(l.getLastErrorCode()){case Is.NO_ERROR:const f=l.getResponseJson();C(St,`XHR for RPC '${t}' ${i} received:`,JSON.stringify(f)),a(f);break;case Is.TIMEOUT:C(St,`RPC '${t}' ${i} timed out`),u(new b(V.DEADLINE_EXCEEDED,"Request time out"));break;case Is.HTTP_ERROR:const g=l.getStatus();if(C(St,`RPC '${t}' ${i} failed with status:`,g,"response text:",l.getResponseText()),g>0){let I=l.getResponseJson();Array.isArray(I)&&(I=I[0]);const P=I==null?void 0:I.error;if(P&&P.status&&P.message){const x=function(D){const U=D.toLowerCase().replace(/_/g,"-");return Object.values(V).indexOf(U)>=0?U:V.UNKNOWN}(P.status);u(new b(x,P.message))}else u(new b(V.UNKNOWN,"Server responded with status "+l.getStatus()))}else u(new b(V.UNAVAILABLE,"Connection failed."));break;default:O()}}finally{C(St,`RPC '${t}' ${i} completed.`)}});const d=JSON.stringify(s);C(St,`RPC '${t}' ${i} sending request:`,s),l.send(e,"POST",d,n,15)})}Bo(t,e,n){const s=Li(),i=[this.Do,"/","google.firestore.v1.Firestore","/",t,"/channel"],a=Lc(),u=Oc(),l={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},d=this.longPollingOptions.timeoutSeconds;d!==void 0&&(l.longPollingTimeout=Math.round(1e3*d)),this.useFetchStreams&&(l.useFetchStreams=!0),this.Oo(l.initMessageHeaders,e,n),l.encodeInitMessageHeaders=!0;const f=i.join("");C(St,`Creating RPC '${t}' stream ${s}: ${f}`,l);const g=a.createWebChannel(f,l);let I=!1,P=!1;const x=new Hm({Io:D=>{P?C(St,`Not sending because RPC '${t}' stream ${s} is closed:`,D):(I||(C(St,`Opening RPC '${t}' stream ${s} transport.`),g.open(),I=!0),C(St,`RPC '${t}' stream ${s} sending:`,D),g.send(D))},To:()=>g.close()}),N=(D,U,K)=>{D.listen(U,q=>{try{K(q)}catch(Y){setTimeout(()=>{throw Y},0)}})};return N(g,lr.EventType.OPEN,()=>{P||(C(St,`RPC '${t}' stream ${s} transport opened.`),x.yo())}),N(g,lr.EventType.CLOSE,()=>{P||(P=!0,C(St,`RPC '${t}' stream ${s} transport closed`),x.So())}),N(g,lr.EventType.ERROR,D=>{P||(P=!0,Ht(St,`RPC '${t}' stream ${s} transport errored:`,D),x.So(new b(V.UNAVAILABLE,"The operation could not be completed")))}),N(g,lr.EventType.MESSAGE,D=>{var U;if(!P){const K=D.data[0];L(!!K);const q=K,Y=q.error||((U=q[0])===null||U===void 0?void 0:U.error);if(Y){C(St,`RPC '${t}' stream ${s} received error:`,Y);const et=Y.status;let W=function(y){const E=gt[y];if(E!==void 0)return Pl(E)}(et),T=Y.message;W===void 0&&(W=V.INTERNAL,T="Unknown error status: "+et+" with message "+Y.message),P=!0,x.So(new b(W,T)),g.close()}else C(St,`RPC '${t}' stream ${s} received:`,K),x.bo(K)}}),N(u,Mc.STAT_EVENT,D=>{D.stat===qi.PROXY?C(St,`RPC '${t}' stream ${s} detected buffering proxy`):D.stat===qi.NOPROXY&&C(St,`RPC '${t}' stream ${s} detected no buffering proxy`)}),setTimeout(()=>{x.wo()},0),x}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function uh(){return typeof window<"u"?window:null}function Ps(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Gr(r){return new nm(r,!0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ko{constructor(t,e,n=1e3,s=1.5,i=6e4){this.ui=t,this.timerId=e,this.ko=n,this.qo=s,this.Qo=i,this.Ko=0,this.$o=null,this.Uo=Date.now(),this.reset()}reset(){this.Ko=0}Wo(){this.Ko=this.Qo}Go(t){this.cancel();const e=Math.floor(this.Ko+this.zo()),n=Math.max(0,Date.now()-this.Uo),s=Math.max(0,e-n);s>0&&C("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.Ko} ms, delay with jitter: ${e} ms, last attempt: ${n} ms ago)`),this.$o=this.ui.enqueueAfterDelay(this.timerId,s,()=>(this.Uo=Date.now(),t())),this.Ko*=this.qo,this.Ko<this.ko&&(this.Ko=this.ko),this.Ko>this.Qo&&(this.Ko=this.Qo)}jo(){this.$o!==null&&(this.$o.skipDelay(),this.$o=null)}cancel(){this.$o!==null&&(this.$o.cancel(),this.$o=null)}zo(){return(Math.random()-.5)*this.Ko}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ch{constructor(t,e,n,s,i,a,u,l){this.ui=t,this.Ho=n,this.Jo=s,this.connection=i,this.authCredentialsProvider=a,this.appCheckCredentialsProvider=u,this.listener=l,this.state=0,this.Yo=0,this.Zo=null,this.Xo=null,this.stream=null,this.e_=0,this.t_=new ko(t,e)}n_(){return this.state===1||this.state===5||this.r_()}r_(){return this.state===2||this.state===3}start(){this.e_=0,this.state!==4?this.auth():this.i_()}async stop(){this.n_()&&await this.close(0)}s_(){this.state=0,this.t_.reset()}o_(){this.r_()&&this.Zo===null&&(this.Zo=this.ui.enqueueAfterDelay(this.Ho,6e4,()=>this.__()))}a_(t){this.u_(),this.stream.send(t)}async __(){if(this.r_())return this.close(0)}u_(){this.Zo&&(this.Zo.cancel(),this.Zo=null)}c_(){this.Xo&&(this.Xo.cancel(),this.Xo=null)}async close(t,e){this.u_(),this.c_(),this.t_.cancel(),this.Yo++,t!==4?this.t_.reset():e&&e.code===V.RESOURCE_EXHAUSTED?(dt(e.toString()),dt("Using maximum backoff delay to prevent overloading the backend."),this.t_.Wo()):e&&e.code===V.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.l_(),this.stream.close(),this.stream=null),this.state=t,await this.listener.mo(e)}l_(){}auth(){this.state=1;const t=this.h_(this.Yo),e=this.Yo;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([n,s])=>{this.Yo===e&&this.P_(n,s)},n=>{t(()=>{const s=new b(V.UNKNOWN,"Fetching auth token failed: "+n.message);return this.I_(s)})})}P_(t,e){const n=this.h_(this.Yo);this.stream=this.T_(t,e),this.stream.Eo(()=>{n(()=>this.listener.Eo())}),this.stream.Ro(()=>{n(()=>(this.state=2,this.Xo=this.ui.enqueueAfterDelay(this.Jo,1e4,()=>(this.r_()&&(this.state=3),Promise.resolve())),this.listener.Ro()))}),this.stream.mo(s=>{n(()=>this.I_(s))}),this.stream.onMessage(s=>{n(()=>++this.e_==1?this.E_(s):this.onNext(s))})}i_(){this.state=5,this.t_.Go(async()=>{this.state=0,this.start()})}I_(t){return C("PersistentStream",`close with error: ${t}`),this.stream=null,this.close(4,t)}h_(t){return e=>{this.ui.enqueueAndForget(()=>this.Yo===t?e():(C("PersistentStream","stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class Ym extends ch{constructor(t,e,n,s,i,a){super(t,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",e,n,s,a),this.serializer=i}T_(t,e){return this.connection.Bo("Listen",t,e)}E_(t){return this.onNext(t)}onNext(t){this.t_.reset();const e=im(this.serializer,t),n=function(i){if(!("targetChange"in i))return B.min();const a=i.targetChange;return a.targetIds&&a.targetIds.length?B.min():a.readTime?ft(a.readTime):B.min()}(t);return this.listener.d_(e,n)}A_(t){const e={};e.database=Yi(this.serializer),e.addTarget=function(i,a){let u;const l=a.target;if(u=bs(l)?{documents:Ml(i,l)}:{query:Ol(i,l)._t},u.targetId=a.targetId,a.resumeToken.approximateByteSize()>0){u.resumeToken=Cl(i,a.resumeToken);const d=Hi(i,a.expectedCount);d!==null&&(u.expectedCount=d)}else if(a.snapshotVersion.compareTo(B.min())>0){u.readTime=Pn(i,a.snapshotVersion.toTimestamp());const d=Hi(i,a.expectedCount);d!==null&&(u.expectedCount=d)}return u}(this.serializer,t);const n=am(this.serializer,t);n&&(e.labels=n),this.a_(e)}R_(t){const e={};e.database=Yi(this.serializer),e.removeTarget=t,this.a_(e)}}class Xm extends ch{constructor(t,e,n,s,i,a){super(t,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",e,n,s,a),this.serializer=i}get V_(){return this.e_>0}start(){this.lastStreamToken=void 0,super.start()}l_(){this.V_&&this.m_([])}T_(t,e){return this.connection.Bo("Write",t,e)}E_(t){return L(!!t.streamToken),this.lastStreamToken=t.streamToken,L(!t.writeResults||t.writeResults.length===0),this.listener.f_()}onNext(t){L(!!t.streamToken),this.lastStreamToken=t.streamToken,this.t_.reset();const e=om(t.writeResults,t.commitTime),n=ft(t.commitTime);return this.listener.g_(n,e)}p_(){const t={};t.database=Yi(this.serializer),this.a_(t)}m_(t){const e={streamToken:this.lastStreamToken,writes:t.map(n=>Sr(this.serializer,n))};this.a_(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zm extends class{}{constructor(t,e,n,s){super(),this.authCredentials=t,this.appCheckCredentials=e,this.connection=n,this.serializer=s,this.y_=!1}w_(){if(this.y_)throw new b(V.FAILED_PRECONDITION,"The client has already been terminated.")}Mo(t,e,n,s){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([i,a])=>this.connection.Mo(t,Ji(e,n),s,i,a)).catch(i=>{throw i.name==="FirebaseError"?(i.code===V.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new b(V.UNKNOWN,i.toString())})}Lo(t,e,n,s,i){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([a,u])=>this.connection.Lo(t,Ji(e,n),s,a,u,i)).catch(a=>{throw a.name==="FirebaseError"?(a.code===V.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),a):new b(V.UNKNOWN,a.toString())})}terminate(){this.y_=!0,this.connection.terminate()}}class tg{constructor(t,e){this.asyncQueue=t,this.onlineStateHandler=e,this.state="Unknown",this.S_=0,this.b_=null,this.D_=!0}v_(){this.S_===0&&(this.C_("Unknown"),this.b_=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this.b_=null,this.F_("Backend didn't respond within 10 seconds."),this.C_("Offline"),Promise.resolve())))}M_(t){this.state==="Online"?this.C_("Unknown"):(this.S_++,this.S_>=1&&(this.x_(),this.F_(`Connection failed 1 times. Most recent error: ${t.toString()}`),this.C_("Offline")))}set(t){this.x_(),this.S_=0,t==="Online"&&(this.D_=!1),this.C_(t)}C_(t){t!==this.state&&(this.state=t,this.onlineStateHandler(t))}F_(t){const e=`Could not reach Cloud Firestore backend. ${t}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.D_?(dt(e),this.D_=!1):C("OnlineStateTracker",e)}x_(){this.b_!==null&&(this.b_.cancel(),this.b_=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class eg{constructor(t,e,n,s,i){this.localStore=t,this.datastore=e,this.asyncQueue=n,this.remoteSyncer={},this.O_=[],this.N_=new Map,this.L_=new Set,this.B_=[],this.k_=i,this.k_._o(a=>{n.enqueueAndForget(async()=>{Ce(this)&&(C("RemoteStore","Restarting streams for network reachability change."),await async function(l){const d=M(l);d.L_.add(4),await Ln(d),d.q_.set("Unknown"),d.L_.delete(4),await Kr(d)}(this))})}),this.q_=new tg(n,s)}}async function Kr(r){if(Ce(r))for(const t of r.B_)await t(!0)}async function Ln(r){for(const t of r.B_)await t(!1)}function Hs(r,t){const e=M(r);e.N_.has(t.targetId)||(e.N_.set(t.targetId,t),Oo(e)?Mo(e):qn(e).r_()&&Fo(e,t))}function bn(r,t){const e=M(r),n=qn(e);e.N_.delete(t),n.r_()&&lh(e,t),e.N_.size===0&&(n.r_()?n.o_():Ce(e)&&e.q_.set("Unknown"))}function Fo(r,t){if(r.Q_.xe(t.targetId),t.resumeToken.approximateByteSize()>0||t.snapshotVersion.compareTo(B.min())>0){const e=r.remoteSyncer.getRemoteKeysForTarget(t.targetId).size;t=t.withExpectedCount(e)}qn(r).A_(t)}function lh(r,t){r.Q_.xe(t),qn(r).R_(t)}function Mo(r){r.Q_=new Xf({getRemoteKeysForTarget:t=>r.remoteSyncer.getRemoteKeysForTarget(t),ot:t=>r.N_.get(t)||null,tt:()=>r.datastore.serializer.databaseId}),qn(r).start(),r.q_.v_()}function Oo(r){return Ce(r)&&!qn(r).n_()&&r.N_.size>0}function Ce(r){return M(r).L_.size===0}function hh(r){r.Q_=void 0}async function ng(r){r.q_.set("Online")}async function rg(r){r.N_.forEach((t,e)=>{Fo(r,t)})}async function sg(r,t){hh(r),Oo(r)?(r.q_.M_(t),Mo(r)):r.q_.set("Unknown")}async function ig(r,t,e){if(r.q_.set("Online"),t instanceof bl&&t.state===2&&t.cause)try{await async function(s,i){const a=i.cause;for(const u of i.targetIds)s.N_.has(u)&&(await s.remoteSyncer.rejectListen(u,a),s.N_.delete(u),s.Q_.removeTarget(u))}(r,t)}catch(n){C("RemoteStore","Failed to remove targets %s: %s ",t.targetIds.join(","),n),await Ls(r,n)}else if(t instanceof Rs?r.Q_.Ke(t):t instanceof Sl?r.Q_.He(t):r.Q_.We(t),!e.isEqual(B.min()))try{const n=await nh(r.localStore);e.compareTo(n)>=0&&await function(i,a){const u=i.Q_.rt(a);return u.targetChanges.forEach((l,d)=>{if(l.resumeToken.approximateByteSize()>0){const f=i.N_.get(d);f&&i.N_.set(d,f.withResumeToken(l.resumeToken,a))}}),u.targetMismatches.forEach((l,d)=>{const f=i.N_.get(l);if(!f)return;i.N_.set(l,f.withResumeToken(ht.EMPTY_BYTE_STRING,f.snapshotVersion)),lh(i,l);const g=new ne(f.target,l,d,f.sequenceNumber);Fo(i,g)}),i.remoteSyncer.applyRemoteEvent(u)}(r,e)}catch(n){C("RemoteStore","Failed to raise snapshot:",n),await Ls(r,n)}}async function Ls(r,t,e){if(!Se(t))throw t;r.L_.add(1),await Ln(r),r.q_.set("Offline"),e||(e=()=>nh(r.localStore)),r.asyncQueue.enqueueRetryable(async()=>{C("RemoteStore","Retrying IndexedDB access"),await e(),r.L_.delete(1),await Kr(r)})}function dh(r,t){return t().catch(e=>Ls(r,e,t))}async function Bn(r){const t=M(r),e=Ae(t);let n=t.O_.length>0?t.O_[t.O_.length-1].batchId:-1;for(;og(t);)try{const s=await jm(t.localStore,n);if(s===null){t.O_.length===0&&e.o_();break}n=s.batchId,ag(t,s)}catch(s){await Ls(t,s)}fh(t)&&mh(t)}function og(r){return Ce(r)&&r.O_.length<10}function ag(r,t){r.O_.push(t);const e=Ae(r);e.r_()&&e.V_&&e.m_(t.mutations)}function fh(r){return Ce(r)&&!Ae(r).n_()&&r.O_.length>0}function mh(r){Ae(r).start()}async function ug(r){Ae(r).p_()}async function cg(r){const t=Ae(r);for(const e of r.O_)t.m_(e.mutations)}async function lg(r,t,e){const n=r.O_.shift(),s=wo.from(n,t,e);await dh(r,()=>r.remoteSyncer.applySuccessfulWrite(s)),await Bn(r)}async function hg(r,t){t&&Ae(r).V_&&await async function(n,s){if(function(a){return Rl(a)&&a!==V.ABORTED}(s.code)){const i=n.O_.shift();Ae(n).s_(),await dh(n,()=>n.remoteSyncer.rejectFailedWrite(i.batchId,s)),await Bn(n)}}(r,t),fh(r)&&mh(r)}async function lc(r,t){const e=M(r);e.asyncQueue.verifyOperationInProgress(),C("RemoteStore","RemoteStore received new credentials");const n=Ce(e);e.L_.add(3),await Ln(e),n&&e.q_.set("Unknown"),await e.remoteSyncer.handleCredentialChange(t),e.L_.delete(3),await Kr(e)}async function ro(r,t){const e=M(r);t?(e.L_.delete(2),await Kr(e)):t||(e.L_.add(2),await Ln(e),e.q_.set("Unknown"))}function qn(r){return r.K_||(r.K_=function(e,n,s){const i=M(e);return i.w_(),new Ym(n,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)}(r.datastore,r.asyncQueue,{Eo:ng.bind(null,r),Ro:rg.bind(null,r),mo:sg.bind(null,r),d_:ig.bind(null,r)}),r.B_.push(async t=>{t?(r.K_.s_(),Oo(r)?Mo(r):r.q_.set("Unknown")):(await r.K_.stop(),hh(r))})),r.K_}function Ae(r){return r.U_||(r.U_=function(e,n,s){const i=M(e);return i.w_(),new Xm(n,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)}(r.datastore,r.asyncQueue,{Eo:()=>Promise.resolve(),Ro:ug.bind(null,r),mo:hg.bind(null,r),f_:cg.bind(null,r),g_:lg.bind(null,r)}),r.B_.push(async t=>{t?(r.U_.s_(),await Bn(r)):(await r.U_.stop(),r.O_.length>0&&(C("RemoteStore",`Stopping write stream with ${r.O_.length} pending writes`),r.O_=[]))})),r.U_}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Lo{constructor(t,e,n,s,i){this.asyncQueue=t,this.timerId=e,this.targetTimeMs=n,this.op=s,this.removalCallback=i,this.deferred=new vt,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(a=>{})}get promise(){return this.deferred.promise}static createAndSchedule(t,e,n,s,i){const a=Date.now()+n,u=new Lo(t,e,a,s,i);return u.start(n),u}start(t){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),t)}skipDelay(){return this.handleDelayElapsed()}cancel(t){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new b(V.CANCELLED,"Operation cancelled"+(t?": "+t:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(t=>this.deferred.resolve(t))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function Un(r,t){if(dt("AsyncQueue",`${t}: ${r}`),Se(r))return new b(V.UNAVAILABLE,`${t}: ${r}`);throw r}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Tn{constructor(t){this.comparator=t?(e,n)=>t(e,n)||F.comparator(e.key,n.key):(e,n)=>F.comparator(e.key,n.key),this.keyedMap=hr(),this.sortedSet=new nt(this.comparator)}static emptySet(t){return new Tn(t.comparator)}has(t){return this.keyedMap.get(t)!=null}get(t){return this.keyedMap.get(t)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(t){const e=this.keyedMap.get(t);return e?this.sortedSet.indexOf(e):-1}get size(){return this.sortedSet.size}forEach(t){this.sortedSet.inorderTraversal((e,n)=>(t(e),!1))}add(t){const e=this.delete(t.key);return e.copy(e.keyedMap.insert(t.key,t),e.sortedSet.insert(t,null))}delete(t){const e=this.get(t);return e?this.copy(this.keyedMap.remove(t),this.sortedSet.remove(e)):this}isEqual(t){if(!(t instanceof Tn)||this.size!==t.size)return!1;const e=this.sortedSet.getIterator(),n=t.sortedSet.getIterator();for(;e.hasNext();){const s=e.getNext().key,i=n.getNext().key;if(!s.isEqual(i))return!1}return!0}toString(){const t=[];return this.forEach(e=>{t.push(e.toString())}),t.length===0?"DocumentSet ()":`DocumentSet (
  `+t.join(`  
`)+`
)`}copy(t,e){const n=new Tn;return n.comparator=this.comparator,n.keyedMap=t,n.sortedSet=e,n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hc{constructor(){this.W_=new nt(F.comparator)}track(t){const e=t.doc.key,n=this.W_.get(e);n?t.type!==0&&n.type===3?this.W_=this.W_.insert(e,t):t.type===3&&n.type!==1?this.W_=this.W_.insert(e,{type:n.type,doc:t.doc}):t.type===2&&n.type===2?this.W_=this.W_.insert(e,{type:2,doc:t.doc}):t.type===2&&n.type===0?this.W_=this.W_.insert(e,{type:0,doc:t.doc}):t.type===1&&n.type===0?this.W_=this.W_.remove(e):t.type===1&&n.type===2?this.W_=this.W_.insert(e,{type:1,doc:n.doc}):t.type===0&&n.type===1?this.W_=this.W_.insert(e,{type:2,doc:t.doc}):O():this.W_=this.W_.insert(e,t)}G_(){const t=[];return this.W_.inorderTraversal((e,n)=>{t.push(n)}),t}}class Cn{constructor(t,e,n,s,i,a,u,l,d){this.query=t,this.docs=e,this.oldDocs=n,this.docChanges=s,this.mutatedKeys=i,this.fromCache=a,this.syncStateChanged=u,this.excludesMetadataChanges=l,this.hasCachedResults=d}static fromInitialDocuments(t,e,n,s,i){const a=[];return e.forEach(u=>{a.push({type:0,doc:u})}),new Cn(t,e,Tn.emptySet(e),a,n,s,!0,!1,i)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(t){if(!(this.fromCache===t.fromCache&&this.hasCachedResults===t.hasCachedResults&&this.syncStateChanged===t.syncStateChanged&&this.mutatedKeys.isEqual(t.mutatedKeys)&&Or(this.query,t.query)&&this.docs.isEqual(t.docs)&&this.oldDocs.isEqual(t.oldDocs)))return!1;const e=this.docChanges,n=t.docChanges;if(e.length!==n.length)return!1;for(let s=0;s<e.length;s++)if(e[s].type!==n[s].type||!e[s].doc.isEqual(n[s].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dg{constructor(){this.z_=void 0,this.j_=[]}H_(){return this.j_.some(t=>t.J_())}}class fg{constructor(){this.queries=dc(),this.onlineState="Unknown",this.Y_=new Set}terminate(){(function(e,n){const s=M(e),i=s.queries;s.queries=dc(),i.forEach((a,u)=>{for(const l of u.j_)l.onError(n)})})(this,new b(V.ABORTED,"Firestore shutting down"))}}function dc(){return new be(r=>hl(r),Or)}async function Bo(r,t){const e=M(r);let n=3;const s=t.query;let i=e.queries.get(s);i?!i.H_()&&t.J_()&&(n=2):(i=new dg,n=t.J_()?0:1);try{switch(n){case 0:i.z_=await e.onListen(s,!0);break;case 1:i.z_=await e.onListen(s,!1);break;case 2:await e.onFirstRemoteStoreListen(s)}}catch(a){const u=Un(a,`Initialization of query '${gn(t.query)}' failed`);return void t.onError(u)}e.queries.set(s,i),i.j_.push(t),t.Z_(e.onlineState),i.z_&&t.X_(i.z_)&&Uo(e)}async function qo(r,t){const e=M(r),n=t.query;let s=3;const i=e.queries.get(n);if(i){const a=i.j_.indexOf(t);a>=0&&(i.j_.splice(a,1),i.j_.length===0?s=t.J_()?0:1:!i.H_()&&t.J_()&&(s=2))}switch(s){case 0:return e.queries.delete(n),e.onUnlisten(n,!0);case 1:return e.queries.delete(n),e.onUnlisten(n,!1);case 2:return e.onLastRemoteStoreUnlisten(n);default:return}}function mg(r,t){const e=M(r);let n=!1;for(const s of t){const i=s.query,a=e.queries.get(i);if(a){for(const u of a.j_)u.X_(s)&&(n=!0);a.z_=s}}n&&Uo(e)}function gg(r,t,e){const n=M(r),s=n.queries.get(t);if(s)for(const i of s.j_)i.onError(e);n.queries.delete(t)}function Uo(r){r.Y_.forEach(t=>{t.next()})}var so,fc;(fc=so||(so={})).ea="default",fc.Cache="cache";class Go{constructor(t,e,n){this.query=t,this.ta=e,this.na=!1,this.ra=null,this.onlineState="Unknown",this.options=n||{}}X_(t){if(!this.options.includeMetadataChanges){const n=[];for(const s of t.docChanges)s.type!==3&&n.push(s);t=new Cn(t.query,t.docs,t.oldDocs,n,t.mutatedKeys,t.fromCache,t.syncStateChanged,!0,t.hasCachedResults)}let e=!1;return this.na?this.ia(t)&&(this.ta.next(t),e=!0):this.sa(t,this.onlineState)&&(this.oa(t),e=!0),this.ra=t,e}onError(t){this.ta.error(t)}Z_(t){this.onlineState=t;let e=!1;return this.ra&&!this.na&&this.sa(this.ra,t)&&(this.oa(this.ra),e=!0),e}sa(t,e){if(!t.fromCache||!this.J_())return!0;const n=e!=="Offline";return(!this.options._a||!n)&&(!t.docs.isEmpty()||t.hasCachedResults||e==="Offline")}ia(t){if(t.docChanges.length>0)return!0;const e=this.ra&&this.ra.hasPendingWrites!==t.hasPendingWrites;return!(!t.syncStateChanged&&!e)&&this.options.includeMetadataChanges===!0}oa(t){t=Cn.fromInitialDocuments(t.query,t.docs,t.mutatedKeys,t.fromCache,t.hasCachedResults),this.na=!0,this.ta.next(t)}J_(){return this.options.source!==so.Cache}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _g{constructor(t,e){this.aa=t,this.byteLength=e}ua(){return"metadata"in this.aa}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mc{constructor(t){this.serializer=t}Es(t){return Wt(this.serializer,t)}ds(t){return t.metadata.exists?Fl(this.serializer,t.document,!1):st.newNoDocument(this.Es(t.metadata.name),this.As(t.metadata.readTime))}As(t){return ft(t)}}class pg{constructor(t,e,n){this.ca=t,this.localStore=e,this.serializer=n,this.queries=[],this.documents=[],this.collectionGroups=new Set,this.progress=gh(t)}la(t){this.progress.bytesLoaded+=t.byteLength;let e=this.progress.documentsLoaded;if(t.aa.namedQuery)this.queries.push(t.aa.namedQuery);else if(t.aa.documentMetadata){this.documents.push({metadata:t.aa.documentMetadata}),t.aa.documentMetadata.exists||++e;const n=z.fromString(t.aa.documentMetadata.name);this.collectionGroups.add(n.get(n.length-2))}else t.aa.document&&(this.documents[this.documents.length-1].document=t.aa.document,++e);return e!==this.progress.documentsLoaded?(this.progress.documentsLoaded=e,Object.assign({},this.progress)):null}ha(t){const e=new Map,n=new mc(this.serializer);for(const s of t)if(s.metadata.queries){const i=n.Es(s.metadata.name);for(const a of s.metadata.queries){const u=(e.get(a)||j()).add(i);e.set(a,u)}}return e}async complete(){const t=await zm(this.localStore,new mc(this.serializer),this.documents,this.ca.id),e=this.ha(this.documents);for(const n of this.queries)await Qm(this.localStore,n,e.get(n.name));return this.progress.taskState="Success",{progress:this.progress,Pa:this.collectionGroups,Ia:t}}}function gh(r){return{taskState:"Running",documentsLoaded:0,bytesLoaded:0,totalDocuments:r.totalDocuments,totalBytes:r.totalBytes}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _h{constructor(t){this.key=t}}class ph{constructor(t){this.key=t}}class yh{constructor(t,e){this.query=t,this.Ta=e,this.Ea=null,this.hasCachedResults=!1,this.current=!1,this.da=j(),this.mutatedKeys=j(),this.Aa=fl(t),this.Ra=new Tn(this.Aa)}get Va(){return this.Ta}ma(t,e){const n=e?e.fa:new hc,s=e?e.Ra:this.Ra;let i=e?e.mutatedKeys:this.mutatedKeys,a=s,u=!1;const l=this.query.limitType==="F"&&s.size===this.query.limit?s.last():null,d=this.query.limitType==="L"&&s.size===this.query.limit?s.first():null;if(t.inorderTraversal((f,g)=>{const I=s.get(f),P=Lr(this.query,g)?g:null,x=!!I&&this.mutatedKeys.has(I.key),N=!!P&&(P.hasLocalMutations||this.mutatedKeys.has(P.key)&&P.hasCommittedMutations);let D=!1;I&&P?I.data.isEqual(P.data)?x!==N&&(n.track({type:3,doc:P}),D=!0):this.ga(I,P)||(n.track({type:2,doc:P}),D=!0,(l&&this.Aa(P,l)>0||d&&this.Aa(P,d)<0)&&(u=!0)):!I&&P?(n.track({type:0,doc:P}),D=!0):I&&!P&&(n.track({type:1,doc:I}),D=!0,(l||d)&&(u=!0)),D&&(P?(a=a.add(P),i=N?i.add(f):i.delete(f)):(a=a.delete(f),i=i.delete(f)))}),this.query.limit!==null)for(;a.size>this.query.limit;){const f=this.query.limitType==="F"?a.last():a.first();a=a.delete(f.key),i=i.delete(f.key),n.track({type:1,doc:f})}return{Ra:a,fa:n,ns:u,mutatedKeys:i}}ga(t,e){return t.hasLocalMutations&&e.hasCommittedMutations&&!e.hasLocalMutations}applyChanges(t,e,n,s){const i=this.Ra;this.Ra=t.Ra,this.mutatedKeys=t.mutatedKeys;const a=t.fa.G_();a.sort((f,g)=>function(P,x){const N=D=>{switch(D){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return O()}};return N(P)-N(x)}(f.type,g.type)||this.Aa(f.doc,g.doc)),this.pa(n),s=s!=null&&s;const u=e&&!s?this.ya():[],l=this.da.size===0&&this.current&&!s?1:0,d=l!==this.Ea;return this.Ea=l,a.length!==0||d?{snapshot:new Cn(this.query,t.Ra,i,a,t.mutatedKeys,l===0,d,!1,!!n&&n.resumeToken.approximateByteSize()>0),wa:u}:{wa:u}}Z_(t){return this.current&&t==="Offline"?(this.current=!1,this.applyChanges({Ra:this.Ra,fa:new hc,mutatedKeys:this.mutatedKeys,ns:!1},!1)):{wa:[]}}Sa(t){return!this.Ta.has(t)&&!!this.Ra.has(t)&&!this.Ra.get(t).hasLocalMutations}pa(t){t&&(t.addedDocuments.forEach(e=>this.Ta=this.Ta.add(e)),t.modifiedDocuments.forEach(e=>{}),t.removedDocuments.forEach(e=>this.Ta=this.Ta.delete(e)),this.current=t.current)}ya(){if(!this.current)return[];const t=this.da;this.da=j(),this.Ra.forEach(n=>{this.Sa(n.key)&&(this.da=this.da.add(n.key))});const e=[];return t.forEach(n=>{this.da.has(n)||e.push(new ph(n))}),this.da.forEach(n=>{t.has(n)||e.push(new _h(n))}),e}ba(t){this.Ta=t.Ts,this.da=j();const e=this.ma(t.documents);return this.applyChanges(e,!0)}Da(){return Cn.fromInitialDocuments(this.query,this.Ra,this.mutatedKeys,this.Ea===0,this.hasCachedResults)}}class yg{constructor(t,e,n){this.query=t,this.targetId=e,this.view=n}}class Ig{constructor(t){this.key=t,this.va=!1}}class Tg{constructor(t,e,n,s,i,a){this.localStore=t,this.remoteStore=e,this.eventManager=n,this.sharedClientState=s,this.currentUser=i,this.maxConcurrentLimboResolutions=a,this.Ca={},this.Fa=new be(u=>hl(u),Or),this.Ma=new Map,this.xa=new Set,this.Oa=new nt(F.comparator),this.Na=new Map,this.La=new bo,this.Ba={},this.ka=new Map,this.qa=Xe.kn(),this.onlineState="Unknown",this.Qa=void 0}get isPrimaryClient(){return this.Qa===!0}}async function Eg(r,t,e=!0){const n=Js(r);let s;const i=n.Fa.get(t);return i?(n.sharedClientState.addLocalQueryTarget(i.targetId),s=i.view.Da()):s=await Ih(n,t,e,!0),s}async function wg(r,t){const e=Js(r);await Ih(e,t,!0,!1)}async function Ih(r,t,e,n){const s=await Vn(r.localStore,Ft(t)),i=s.targetId,a=r.sharedClientState.addLocalQueryTarget(i,e);let u;return n&&(u=await Ko(r,t,i,a==="current",s.resumeToken)),r.isPrimaryClient&&e&&Hs(r.remoteStore,s),u}async function Ko(r,t,e,n,s){r.Ka=(g,I,P)=>async function(N,D,U,K){let q=D.view.ma(U);q.ns&&(q=await Fs(N.localStore,D.query,!1).then(({documents:T})=>D.view.ma(T,q)));const Y=K&&K.targetChanges.get(D.targetId),et=K&&K.targetMismatches.get(D.targetId)!=null,W=D.view.applyChanges(q,N.isPrimaryClient,Y,et);return io(N,D.targetId,W.wa),W.snapshot}(r,g,I,P);const i=await Fs(r.localStore,t,!0),a=new yh(t,i.Ts),u=a.ma(i.documents),l=Ur.createSynthesizedTargetChangeForCurrentChange(e,n&&r.onlineState!=="Offline",s),d=a.applyChanges(u,r.isPrimaryClient,l);io(r,e,d.wa);const f=new yg(t,e,a);return r.Fa.set(t,f),r.Ma.has(e)?r.Ma.get(e).push(t):r.Ma.set(e,[t]),d.snapshot}async function vg(r,t,e){const n=M(r),s=n.Fa.get(t),i=n.Ma.get(s.targetId);if(i.length>1)return n.Ma.set(s.targetId,i.filter(a=>!Or(a,t))),void n.Fa.delete(t);n.isPrimaryClient?(n.sharedClientState.removeLocalQueryTarget(s.targetId),n.sharedClientState.isActiveQueryTarget(s.targetId)||await Sn(n.localStore,s.targetId,!1).then(()=>{n.sharedClientState.clearQueryState(s.targetId),e&&bn(n.remoteStore,s.targetId),xn(n,s.targetId)}).catch(Ve)):(xn(n,s.targetId),await Sn(n.localStore,s.targetId,!0))}async function Ag(r,t){const e=M(r),n=e.Fa.get(t),s=e.Ma.get(n.targetId);e.isPrimaryClient&&s.length===1&&(e.sharedClientState.removeLocalQueryTarget(n.targetId),bn(e.remoteStore,n.targetId))}async function Rg(r,t,e){const n=$o(r);try{const s=await function(a,u){const l=M(a),d=ut.now(),f=u.reduce((P,x)=>P.add(x.key),j());let g,I;return l.persistence.runTransaction("Locally write mutations","readwrite",P=>{let x=qt(),N=j();return l.cs.getEntries(P,f).next(D=>{x=D,x.forEach((U,K)=>{K.isValidDocument()||(N=N.add(U))})}).next(()=>l.localDocuments.getOverlayedDocuments(P,x)).next(D=>{g=D;const U=[];for(const K of u){const q=Hf(K,g.get(K.key).overlayedDocument);q!=null&&U.push(new oe(K.key,q,nl(q.value.mapValue),at.exists(!0)))}return l.mutationQueue.addMutationBatch(P,d,U,u)}).next(D=>{I=D;const U=D.applyToLocalDocumentSet(g,N);return l.documentOverlayCache.saveOverlays(P,D.batchId,U)})}).then(()=>({batchId:I.batchId,changes:gl(g)}))}(n.localStore,t);n.sharedClientState.addPendingMutation(s.batchId),function(a,u,l){let d=a.Ba[a.currentUser.toKey()];d||(d=new nt(G)),d=d.insert(u,l),a.Ba[a.currentUser.toKey()]=d}(n,s.batchId,e),await ae(n,s.changes),await Bn(n.remoteStore)}catch(s){const i=Un(s,"Failed to persist write");e.reject(i)}}async function Th(r,t){const e=M(r);try{const n=await Km(e.localStore,t);t.targetChanges.forEach((s,i)=>{const a=e.Na.get(i);a&&(L(s.addedDocuments.size+s.modifiedDocuments.size+s.removedDocuments.size<=1),s.addedDocuments.size>0?a.va=!0:s.modifiedDocuments.size>0?L(a.va):s.removedDocuments.size>0&&(L(a.va),a.va=!1))}),await ae(e,n,t)}catch(n){await Ve(n)}}function gc(r,t,e){const n=M(r);if(n.isPrimaryClient&&e===0||!n.isPrimaryClient&&e===1){const s=[];n.Fa.forEach((i,a)=>{const u=a.view.Z_(t);u.snapshot&&s.push(u.snapshot)}),function(a,u){const l=M(a);l.onlineState=u;let d=!1;l.queries.forEach((f,g)=>{for(const I of g.j_)I.Z_(u)&&(d=!0)}),d&&Uo(l)}(n.eventManager,t),s.length&&n.Ca.d_(s),n.onlineState=t,n.isPrimaryClient&&n.sharedClientState.setOnlineState(t)}}async function Pg(r,t,e){const n=M(r);n.sharedClientState.updateQueryState(t,"rejected",e);const s=n.Na.get(t),i=s&&s.key;if(i){let a=new nt(F.comparator);a=a.insert(i,st.newNoDocument(i,B.min()));const u=j().add(i),l=new qr(B.min(),new Map,new nt(G),a,u);await Th(n,l),n.Oa=n.Oa.remove(i),n.Na.delete(t),Qo(n)}else await Sn(n.localStore,t,!1).then(()=>xn(n,t,e)).catch(Ve)}async function Vg(r,t){const e=M(r),n=t.batch.batchId;try{const s=await Gm(e.localStore,t);zo(e,n,null),jo(e,n),e.sharedClientState.updateMutationState(n,"acknowledged"),await ae(e,s)}catch(s){await Ve(s)}}async function Sg(r,t,e){const n=M(r);try{const s=await function(a,u){const l=M(a);return l.persistence.runTransaction("Reject batch","readwrite-primary",d=>{let f;return l.mutationQueue.lookupMutationBatch(d,u).next(g=>(L(g!==null),f=g.keys(),l.mutationQueue.removeMutationBatch(d,g))).next(()=>l.mutationQueue.performConsistencyCheck(d)).next(()=>l.documentOverlayCache.removeOverlaysForBatchId(d,f,u)).next(()=>l.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(d,f)).next(()=>l.localDocuments.getDocuments(d,f))})}(n.localStore,t);zo(n,t,e),jo(n,t),n.sharedClientState.updateMutationState(t,"rejected",e),await ae(n,s)}catch(s){await Ve(s)}}async function bg(r,t){const e=M(r);Ce(e.remoteStore)||C("SyncEngine","The network is disabled. The task returned by 'awaitPendingWrites()' will not complete until the network is enabled.");try{const n=await function(a){const u=M(a);return u.persistence.runTransaction("Get highest unacknowledged batch id","readonly",l=>u.mutationQueue.getHighestUnacknowledgedBatchId(l))}(e.localStore);if(n===-1)return void t.resolve();const s=e.ka.get(n)||[];s.push(t),e.ka.set(n,s)}catch(n){const s=Un(n,"Initialization of waitForPendingWrites() operation failed");t.reject(s)}}function jo(r,t){(r.ka.get(t)||[]).forEach(e=>{e.resolve()}),r.ka.delete(t)}function zo(r,t,e){const n=M(r);let s=n.Ba[n.currentUser.toKey()];if(s){const i=s.get(t);i&&(e?i.reject(e):i.resolve(),s=s.remove(t)),n.Ba[n.currentUser.toKey()]=s}}function xn(r,t,e=null){r.sharedClientState.removeLocalQueryTarget(t);for(const n of r.Ma.get(t))r.Fa.delete(n),e&&r.Ca.$a(n,e);r.Ma.delete(t),r.isPrimaryClient&&r.La.gr(t).forEach(n=>{r.La.containsKey(n)||Eh(r,n)})}function Eh(r,t){r.xa.delete(t.path.canonicalString());const e=r.Oa.get(t);e!==null&&(bn(r.remoteStore,e),r.Oa=r.Oa.remove(t),r.Na.delete(e),Qo(r))}function io(r,t,e){for(const n of e)n instanceof _h?(r.La.addReference(n.key,t),Cg(r,n)):n instanceof ph?(C("SyncEngine","Document no longer in limbo: "+n.key),r.La.removeReference(n.key,t),r.La.containsKey(n.key)||Eh(r,n.key)):O()}function Cg(r,t){const e=t.key,n=e.path.canonicalString();r.Oa.get(e)||r.xa.has(n)||(C("SyncEngine","New document in limbo: "+e),r.xa.add(n),Qo(r))}function Qo(r){for(;r.xa.size>0&&r.Oa.size<r.maxConcurrentLimboResolutions;){const t=r.xa.values().next().value;r.xa.delete(t);const e=new F(z.fromString(t)),n=r.qa.next();r.Na.set(n,new Ig(e)),r.Oa=r.Oa.insert(e,n),Hs(r.remoteStore,new ne(Ft(Fn(e.path)),n,"TargetPurposeLimboResolution",Lt.oe))}}async function ae(r,t,e){const n=M(r),s=[],i=[],a=[];n.Fa.isEmpty()||(n.Fa.forEach((u,l)=>{a.push(n.Ka(l,t,e).then(d=>{var f;if((d||e)&&n.isPrimaryClient){const g=d?!d.fromCache:(f=e==null?void 0:e.targetChanges.get(l.targetId))===null||f===void 0?void 0:f.current;n.sharedClientState.updateQueryState(l.targetId,g?"current":"not-current")}if(d){s.push(d);const g=Do.Wi(l.targetId,d);i.push(g)}}))}),await Promise.all(a),n.Ca.d_(s),await async function(l,d){const f=M(l);try{await f.persistence.runTransaction("notifyLocalViewChanges","readwrite",g=>A.forEach(d,I=>A.forEach(I.$i,P=>f.persistence.referenceDelegate.addReference(g,I.targetId,P)).next(()=>A.forEach(I.Ui,P=>f.persistence.referenceDelegate.removeReference(g,I.targetId,P)))))}catch(g){if(!Se(g))throw g;C("LocalStore","Failed to update sequence numbers: "+g)}for(const g of d){const I=g.targetId;if(!g.fromCache){const P=f.os.get(I),x=P.snapshotVersion,N=P.withLastLimboFreeSnapshotVersion(x);f.os=f.os.insert(I,N)}}}(n.localStore,i))}async function xg(r,t){const e=M(r);if(!e.currentUser.isEqual(t)){C("SyncEngine","User change. New user:",t.toKey());const n=await eh(e.localStore,t);e.currentUser=t,function(i,a){i.ka.forEach(u=>{u.forEach(l=>{l.reject(new b(V.CANCELLED,a))})}),i.ka.clear()}(e,"'waitForPendingWrites' promise is rejected due to a user change."),e.sharedClientState.handleUserChange(t,n.removedBatchIds,n.addedBatchIds),await ae(e,n.hs)}}function Dg(r,t){const e=M(r),n=e.Na.get(t);if(n&&n.va)return j().add(n.key);{let s=j();const i=e.Ma.get(t);if(!i)return s;for(const a of i){const u=e.Fa.get(a);s=s.unionWith(u.view.Va)}return s}}async function Ng(r,t){const e=M(r),n=await Fs(e.localStore,t.query,!0),s=t.view.ba(n);return e.isPrimaryClient&&io(e,t.targetId,s.wa),s}async function kg(r,t){const e=M(r);return ih(e.localStore,t).then(n=>ae(e,n))}async function Fg(r,t,e,n){const s=M(r),i=await function(u,l){const d=M(u),f=M(d.mutationQueue);return d.persistence.runTransaction("Lookup mutation documents","readonly",g=>f.Mn(g,l).next(I=>I?d.localDocuments.getDocuments(g,I):A.resolve(null)))}(s.localStore,t);i!==null?(e==="pending"?await Bn(s.remoteStore):e==="acknowledged"||e==="rejected"?(zo(s,t,n||null),jo(s,t),function(u,l){M(M(u).mutationQueue).On(l)}(s.localStore,t)):O(),await ae(s,i)):C("SyncEngine","Cannot apply mutation batch with id: "+t)}async function Mg(r,t){const e=M(r);if(Js(e),$o(e),t===!0&&e.Qa!==!0){const n=e.sharedClientState.getAllActiveQueryTargets(),s=await _c(e,n.toArray());e.Qa=!0,await ro(e.remoteStore,!0);for(const i of s)Hs(e.remoteStore,i)}else if(t===!1&&e.Qa!==!1){const n=[];let s=Promise.resolve();e.Ma.forEach((i,a)=>{e.sharedClientState.isLocalQueryTarget(a)?n.push(a):s=s.then(()=>(xn(e,a),Sn(e.localStore,a,!0))),bn(e.remoteStore,a)}),await s,await _c(e,n),function(a){const u=M(a);u.Na.forEach((l,d)=>{bn(u.remoteStore,d)}),u.La.pr(),u.Na=new Map,u.Oa=new nt(F.comparator)}(e),e.Qa=!1,await ro(e.remoteStore,!1)}}async function _c(r,t,e){const n=M(r),s=[],i=[];for(const a of t){let u;const l=n.Ma.get(a);if(l&&l.length!==0){u=await Vn(n.localStore,Ft(l[0]));for(const d of l){const f=n.Fa.get(d),g=await Ng(n,f);g.snapshot&&i.push(g.snapshot)}}else{const d=await sh(n.localStore,a);u=await Vn(n.localStore,d),await Ko(n,wh(d),a,!1,u.resumeToken)}s.push(u)}return n.Ca.d_(i),s}function wh(r){return ll(r.path,r.collectionGroup,r.orderBy,r.filters,r.limit,"F",r.startAt,r.endAt)}function Og(r){return function(e){return M(M(e).persistence).Qi()}(M(r).localStore)}async function Lg(r,t,e,n){const s=M(r);if(s.Qa)return void C("SyncEngine","Ignoring unexpected query state notification.");const i=s.Ma.get(t);if(i&&i.length>0)switch(e){case"current":case"not-current":{const a=await ih(s.localStore,dl(i[0])),u=qr.createSynthesizedRemoteEventForCurrentChange(t,e==="current",ht.EMPTY_BYTE_STRING);await ae(s,a,u);break}case"rejected":await Sn(s.localStore,t,!0),xn(s,t,n);break;default:O()}}async function Bg(r,t,e){const n=Js(r);if(n.Qa){for(const s of t){if(n.Ma.has(s)&&n.sharedClientState.isActiveQueryTarget(s)){C("SyncEngine","Adding an already active target "+s);continue}const i=await sh(n.localStore,s),a=await Vn(n.localStore,i);await Ko(n,wh(i),a.targetId,!1,a.resumeToken),Hs(n.remoteStore,a)}for(const s of e)n.Ma.has(s)&&await Sn(n.localStore,s,!1).then(()=>{bn(n.remoteStore,s),xn(n,s)}).catch(Ve)}}function Js(r){const t=M(r);return t.remoteStore.remoteSyncer.applyRemoteEvent=Th.bind(null,t),t.remoteStore.remoteSyncer.getRemoteKeysForTarget=Dg.bind(null,t),t.remoteStore.remoteSyncer.rejectListen=Pg.bind(null,t),t.Ca.d_=mg.bind(null,t.eventManager),t.Ca.$a=gg.bind(null,t.eventManager),t}function $o(r){const t=M(r);return t.remoteStore.remoteSyncer.applySuccessfulWrite=Vg.bind(null,t),t.remoteStore.remoteSyncer.rejectFailedWrite=Sg.bind(null,t),t}function qg(r,t,e){const n=M(r);(async function(i,a,u){try{const l=await a.getMetadata();if(await function(P,x){const N=M(P),D=ft(x.createTime);return N.persistence.runTransaction("hasNewerBundle","readonly",U=>N.Gr.getBundleMetadata(U,x.id)).then(U=>!!U&&U.createTime.compareTo(D)>=0)}(i.localStore,l))return await a.close(),u._completeWith(function(P){return{taskState:"Success",documentsLoaded:P.totalDocuments,bytesLoaded:P.totalBytes,totalDocuments:P.totalDocuments,totalBytes:P.totalBytes}}(l)),Promise.resolve(new Set);u._updateProgress(gh(l));const d=new pg(l,i.localStore,a.serializer);let f=await a.Ua();for(;f;){const I=await d.la(f);I&&u._updateProgress(I),f=await a.Ua()}const g=await d.complete();return await ae(i,g.Ia,void 0),await function(P,x){const N=M(P);return N.persistence.runTransaction("Save bundle","readwrite",D=>N.Gr.saveBundleMetadata(D,x))}(i.localStore,l),u._completeWith(g.progress),Promise.resolve(g.Pa)}catch(l){return Ht("SyncEngine",`Loading bundle failed with ${l}`),u._failWith(l),Promise.resolve(new Set)}})(n,t,e).then(s=>{n.sharedClientState.notifyBundleLoaded(s)})}class br{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(t){this.serializer=Gr(t.databaseInfo.databaseId),this.sharedClientState=this.Wa(t),this.persistence=this.Ga(t),await this.persistence.start(),this.localStore=this.za(t),this.gcScheduler=this.ja(t,this.localStore),this.indexBackfillerScheduler=this.Ha(t,this.localStore)}ja(t,e){return null}Ha(t,e){return null}za(t){return th(this.persistence,new Zl,t.initialUser,this.serializer)}Ga(t){return new Xl(Ws.Zr,this.serializer)}Wa(t){return new ah}async terminate(){var t,e;(t=this.gcScheduler)===null||t===void 0||t.stop(),(e=this.indexBackfillerScheduler)===null||e===void 0||e.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}br.provider={build:()=>new br};class vh extends br{constructor(t,e,n){super(),this.Ja=t,this.cacheSizeBytes=e,this.forceOwnership=n,this.kind="persistent",this.synchronizeTabs=!1}async initialize(t){await super.initialize(t),await this.Ja.initialize(this,t),await $o(this.Ja.syncEngine),await Bn(this.Ja.remoteStore),await this.persistence.yi(()=>(this.gcScheduler&&!this.gcScheduler.started&&this.gcScheduler.start(),this.indexBackfillerScheduler&&!this.indexBackfillerScheduler.started&&this.indexBackfillerScheduler.start(),Promise.resolve()))}za(t){return th(this.persistence,new Zl,t.initialUser,this.serializer)}ja(t,e){const n=this.persistence.referenceDelegate.garbageCollector;return new Am(n,t.asyncQueue,e)}Ha(t,e){const n=new sf(e,this.persistence);return new rf(t.asyncQueue,n)}Ga(t){const e=xo(t.databaseInfo.databaseId,t.databaseInfo.persistenceKey),n=this.cacheSizeBytes!==void 0?Ot.withCacheSize(this.cacheSizeBytes):Ot.DEFAULT;return new Co(this.synchronizeTabs,e,t.clientId,n,t.asyncQueue,uh(),Ps(),this.serializer,this.sharedClientState,!!this.forceOwnership)}Wa(t){return new ah}}class Ug extends vh{constructor(t,e){super(t,e,!1),this.Ja=t,this.cacheSizeBytes=e,this.synchronizeTabs=!0}async initialize(t){await super.initialize(t);const e=this.Ja.syncEngine;this.sharedClientState instanceof Oi&&(this.sharedClientState.syncEngine={no:Fg.bind(null,e),ro:Lg.bind(null,e),io:Bg.bind(null,e),Qi:Og.bind(null,e),eo:kg.bind(null,e)},await this.sharedClientState.start()),await this.persistence.yi(async n=>{await Mg(this.Ja.syncEngine,n),this.gcScheduler&&(n&&!this.gcScheduler.started?this.gcScheduler.start():n||this.gcScheduler.stop()),this.indexBackfillerScheduler&&(n&&!this.indexBackfillerScheduler.started?this.indexBackfillerScheduler.start():n||this.indexBackfillerScheduler.stop())})}Wa(t){const e=uh();if(!Oi.D(e))throw new b(V.UNIMPLEMENTED,"IndexedDB persistence is only available on platforms that support LocalStorage.");const n=xo(t.databaseInfo.databaseId,t.databaseInfo.persistenceKey);return new Oi(e,t.asyncQueue,n,t.clientId,t.initialUser)}}class Cr{async initialize(t,e){this.localStore||(this.localStore=t.localStore,this.sharedClientState=t.sharedClientState,this.datastore=this.createDatastore(e),this.remoteStore=this.createRemoteStore(e),this.eventManager=this.createEventManager(e),this.syncEngine=this.createSyncEngine(e,!t.synchronizeTabs),this.sharedClientState.onlineStateHandler=n=>gc(this.syncEngine,n,1),this.remoteStore.remoteSyncer.handleCredentialChange=xg.bind(null,this.syncEngine),await ro(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(t){return function(){return new fg}()}createDatastore(t){const e=Gr(t.databaseInfo.databaseId),n=function(i){return new Jm(i)}(t.databaseInfo);return function(i,a,u,l){return new Zm(i,a,u,l)}(t.authCredentials,t.appCheckCredentials,n,e)}createRemoteStore(t){return function(n,s,i,a,u){return new eg(n,s,i,a,u)}(this.localStore,this.datastore,t.asyncQueue,e=>gc(this.syncEngine,e,0),function(){return cc.D()?new cc:new $m}())}createSyncEngine(t,e){return function(s,i,a,u,l,d,f){const g=new Tg(s,i,a,u,l,d);return f&&(g.Qa=!0),g}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,t.initialUser,t.maxConcurrentLimboResolutions,e)}async terminate(){var t,e;await async function(s){const i=M(s);C("RemoteStore","RemoteStore shutting down."),i.L_.add(5),await Ln(i),i.k_.shutdown(),i.q_.set("Unknown")}(this.remoteStore),(t=this.datastore)===null||t===void 0||t.terminate(),(e=this.eventManager)===null||e===void 0||e.terminate()}}Cr.provider={build:()=>new Cr};function pc(r,t=10240){let e=0;return{async read(){if(e<r.byteLength){const n={value:r.slice(e,e+t),done:!1};return e+=t,n}return{done:!0}},async cancel(){},releaseLock(){},closed:Promise.resolve()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ys{constructor(t){this.observer=t,this.muted=!1}next(t){this.muted||this.observer.next&&this.Ya(this.observer.next,t)}error(t){this.muted||(this.observer.error?this.Ya(this.observer.error,t):dt("Uncaught Error in snapshot listener:",t.toString()))}Za(){this.muted=!0}Ya(t,e){setTimeout(()=>{this.muted||t(e)},0)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gg{constructor(t,e){this.Xa=t,this.serializer=e,this.metadata=new vt,this.buffer=new Uint8Array,this.eu=function(){return new TextDecoder("utf-8")}(),this.tu().then(n=>{n&&n.ua()?this.metadata.resolve(n.aa.metadata):this.metadata.reject(new Error(`The first element of the bundle is not a metadata, it is
             ${JSON.stringify(n==null?void 0:n.aa)}`))},n=>this.metadata.reject(n))}close(){return this.Xa.cancel()}async getMetadata(){return this.metadata.promise}async Ua(){return await this.getMetadata(),this.tu()}async tu(){const t=await this.nu();if(t===null)return null;const e=this.eu.decode(t),n=Number(e);isNaN(n)&&this.ru(`length string (${e}) is not valid number`);const s=await this.iu(n);return new _g(JSON.parse(s),t.length+n)}su(){return this.buffer.findIndex(t=>t===123)}async nu(){for(;this.su()<0&&!await this.ou(););if(this.buffer.length===0)return null;const t=this.su();t<0&&this.ru("Reached the end of bundle when a length string is expected.");const e=this.buffer.slice(0,t);return this.buffer=this.buffer.slice(t),e}async iu(t){for(;this.buffer.length<t;)await this.ou()&&this.ru("Reached the end of bundle when more is expected.");const e=this.eu.decode(this.buffer.slice(0,t));return this.buffer=this.buffer.slice(t),e}ru(t){throw this.Xa.cancel(),new Error(`Invalid bundle format: ${t}`)}async ou(){const t=await this.Xa.read();if(!t.done){const e=new Uint8Array(this.buffer.length+t.value.length);e.set(this.buffer),e.set(t.value,this.buffer.length),this.buffer=e}return t.done}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Kg{constructor(t){this.datastore=t,this.readVersions=new Map,this.mutations=[],this.committed=!1,this.lastTransactionError=null,this.writtenDocs=new Set}async lookup(t){if(this.ensureCommitNotCalled(),this.mutations.length>0)throw this.lastTransactionError=new b(V.INVALID_ARGUMENT,"Firestore transactions require all reads to be executed before all writes."),this.lastTransactionError;const e=await async function(s,i){const a=M(s),u={documents:i.map(g=>Vr(a.serializer,g))},l=await a.Lo("BatchGetDocuments",a.serializer.databaseId,z.emptyPath(),u,i.length),d=new Map;l.forEach(g=>{const I=sm(a.serializer,g);d.set(I.key.toString(),I)});const f=[];return i.forEach(g=>{const I=d.get(g.toString());L(!!I),f.push(I)}),f}(this.datastore,t);return e.forEach(n=>this.recordVersion(n)),e}set(t,e){this.write(e.toMutation(t,this.precondition(t))),this.writtenDocs.add(t.toString())}update(t,e){try{this.write(e.toMutation(t,this.preconditionForUpdate(t)))}catch(n){this.lastTransactionError=n}this.writtenDocs.add(t.toString())}delete(t){this.write(new On(t,this.precondition(t))),this.writtenDocs.add(t.toString())}async commit(){if(this.ensureCommitNotCalled(),this.lastTransactionError)throw this.lastTransactionError;const t=this.readVersions;this.mutations.forEach(e=>{t.delete(e.key.toString())}),t.forEach((e,n)=>{const s=F.fromPath(n);this.mutations.push(new To(s,this.precondition(s)))}),await async function(n,s){const i=M(n),a={writes:s.map(u=>Sr(i.serializer,u))};await i.Mo("Commit",i.serializer.databaseId,z.emptyPath(),a)}(this.datastore,this.mutations),this.committed=!0}recordVersion(t){let e;if(t.isFoundDocument())e=t.version;else{if(!t.isNoDocument())throw O();e=B.min()}const n=this.readVersions.get(t.key.toString());if(n){if(!e.isEqual(n))throw new b(V.ABORTED,"Document version changed between two reads.")}else this.readVersions.set(t.key.toString(),e)}precondition(t){const e=this.readVersions.get(t.toString());return!this.writtenDocs.has(t.toString())&&e?e.isEqual(B.min())?at.exists(!1):at.updateTime(e):at.none()}preconditionForUpdate(t){const e=this.readVersions.get(t.toString());if(!this.writtenDocs.has(t.toString())&&e){if(e.isEqual(B.min()))throw new b(V.INVALID_ARGUMENT,"Can't update a document that doesn't exist.");return at.updateTime(e)}return at.exists(!0)}write(t){this.ensureCommitNotCalled(),this.mutations.push(t)}ensureCommitNotCalled(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jg{constructor(t,e,n,s,i){this.asyncQueue=t,this.datastore=e,this.options=n,this.updateFunction=s,this.deferred=i,this._u=n.maxAttempts,this.t_=new ko(this.asyncQueue,"transaction_retry")}au(){this._u-=1,this.uu()}uu(){this.t_.Go(async()=>{const t=new Kg(this.datastore),e=this.cu(t);e&&e.then(n=>{this.asyncQueue.enqueueAndForget(()=>t.commit().then(()=>{this.deferred.resolve(n)}).catch(s=>{this.lu(s)}))}).catch(n=>{this.lu(n)})})}cu(t){try{const e=this.updateFunction(t);return!Fr(e)&&e.catch&&e.then?e:(this.deferred.reject(Error("Transaction callback must return a Promise")),null)}catch(e){return this.deferred.reject(e),null}}lu(t){this._u>0&&this.hu(t)?(this._u-=1,this.asyncQueue.enqueueAndForget(()=>(this.uu(),Promise.resolve()))):this.deferred.reject(t)}hu(t){if(t.name==="FirebaseError"){const e=t.code;return e==="aborted"||e==="failed-precondition"||e==="already-exists"||!Rl(e)}return!1}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zg{constructor(t,e,n,s,i){this.authCredentials=t,this.appCheckCredentials=e,this.asyncQueue=n,this.databaseInfo=s,this.user=It.UNAUTHENTICATED,this.clientId=qc.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=i,this.authCredentials.start(n,async a=>{C("FirestoreClient","Received user=",a.uid),await this.authCredentialListener(a),this.user=a}),this.appCheckCredentials.start(n,a=>(C("FirestoreClient","Received new app check token=",a),this.appCheckCredentialListener(a,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(t){this.authCredentialListener=t}setAppCheckTokenChangeListener(t){this.appCheckCredentialListener=t}terminate(){this.asyncQueue.enterRestrictedMode();const t=new vt;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),t.resolve()}catch(e){const n=Un(e,"Failed to shutdown persistence");t.reject(n)}}),t.promise}}async function Bi(r,t){r.asyncQueue.verifyOperationInProgress(),C("FirestoreClient","Initializing OfflineComponentProvider");const e=r.configuration;await t.initialize(e);let n=e.initialUser;r.setCredentialChangeListener(async s=>{n.isEqual(s)||(await eh(t.localStore,s),n=s)}),t.persistence.setDatabaseDeletedListener(()=>r.terminate()),r._offlineComponents=t}async function yc(r,t){r.asyncQueue.verifyOperationInProgress();const e=await Wo(r);C("FirestoreClient","Initializing OnlineComponentProvider"),await t.initialize(e,r.configuration),r.setCredentialChangeListener(n=>lc(t.remoteStore,n)),r.setAppCheckTokenChangeListener((n,s)=>lc(t.remoteStore,s)),r._onlineComponents=t}async function Wo(r){if(!r._offlineComponents)if(r._uninitializedComponentsProvider){C("FirestoreClient","Using user provided OfflineComponentProvider");try{await Bi(r,r._uninitializedComponentsProvider._offline)}catch(t){const e=t;if(!function(s){return s.name==="FirebaseError"?s.code===V.FAILED_PRECONDITION||s.code===V.UNIMPLEMENTED:!(typeof DOMException<"u"&&s instanceof DOMException)||s.code===22||s.code===20||s.code===11}(e))throw e;Ht("Error using user provided cache. Falling back to memory cache: "+e),await Bi(r,new br)}}else C("FirestoreClient","Using default OfflineComponentProvider"),await Bi(r,new br);return r._offlineComponents}async function Xs(r){return r._onlineComponents||(r._uninitializedComponentsProvider?(C("FirestoreClient","Using user provided OnlineComponentProvider"),await yc(r,r._uninitializedComponentsProvider._online)):(C("FirestoreClient","Using default OnlineComponentProvider"),await yc(r,new Cr))),r._onlineComponents}function Ah(r){return Wo(r).then(t=>t.persistence)}function Ho(r){return Wo(r).then(t=>t.localStore)}function Rh(r){return Xs(r).then(t=>t.remoteStore)}function Jo(r){return Xs(r).then(t=>t.syncEngine)}function Qg(r){return Xs(r).then(t=>t.datastore)}async function Dn(r){const t=await Xs(r),e=t.eventManager;return e.onListen=Eg.bind(null,t.syncEngine),e.onUnlisten=vg.bind(null,t.syncEngine),e.onFirstRemoteStoreListen=wg.bind(null,t.syncEngine),e.onLastRemoteStoreUnlisten=Ag.bind(null,t.syncEngine),e}function $g(r){return r.asyncQueue.enqueue(async()=>{const t=await Ah(r),e=await Rh(r);return t.setNetworkEnabled(!0),function(s){const i=M(s);return i.L_.delete(0),Kr(i)}(e)})}function Wg(r){return r.asyncQueue.enqueue(async()=>{const t=await Ah(r),e=await Rh(r);return t.setNetworkEnabled(!1),async function(s){const i=M(s);i.L_.add(0),await Ln(i),i.q_.set("Offline")}(e)})}function Hg(r,t){const e=new vt;return r.asyncQueue.enqueueAndForget(async()=>async function(s,i,a){try{const u=await function(d,f){const g=M(d);return g.persistence.runTransaction("read document","readonly",I=>g.localDocuments.getDocument(I,f))}(s,i);u.isFoundDocument()?a.resolve(u):u.isNoDocument()?a.resolve(null):a.reject(new b(V.UNAVAILABLE,"Failed to get document from cache. (However, this document may exist on the server. Run again without setting 'source' in the GetOptions to attempt to retrieve the document from the server.)"))}catch(u){const l=Un(u,`Failed to get document '${i} from cache`);a.reject(l)}}(await Ho(r),t,e)),e.promise}function Ph(r,t,e={}){const n=new vt;return r.asyncQueue.enqueueAndForget(async()=>function(i,a,u,l,d){const f=new Ys({next:I=>{f.Za(),a.enqueueAndForget(()=>qo(i,g));const P=I.docs.has(u);!P&&I.fromCache?d.reject(new b(V.UNAVAILABLE,"Failed to get document because the client is offline.")):P&&I.fromCache&&l&&l.source==="server"?d.reject(new b(V.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):d.resolve(I)},error:I=>d.reject(I)}),g=new Go(Fn(u.path),f,{includeMetadataChanges:!0,_a:!0});return Bo(i,g)}(await Dn(r),r.asyncQueue,t,e,n)),n.promise}function Jg(r,t){const e=new vt;return r.asyncQueue.enqueueAndForget(async()=>async function(s,i,a){try{const u=await Fs(s,i,!0),l=new yh(i,u.Ts),d=l.ma(u.documents),f=l.applyChanges(d,!1);a.resolve(f.snapshot)}catch(u){const l=Un(u,`Failed to execute query '${i} against cache`);a.reject(l)}}(await Ho(r),t,e)),e.promise}function Vh(r,t,e={}){const n=new vt;return r.asyncQueue.enqueueAndForget(async()=>function(i,a,u,l,d){const f=new Ys({next:I=>{f.Za(),a.enqueueAndForget(()=>qo(i,g)),I.fromCache&&l.source==="server"?d.reject(new b(V.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):d.resolve(I)},error:I=>d.reject(I)}),g=new Go(u,f,{includeMetadataChanges:!0,_a:!0});return Bo(i,g)}(await Dn(r),r.asyncQueue,t,e,n)),n.promise}function Yg(r,t){const e=new Ys(t);return r.asyncQueue.enqueueAndForget(async()=>function(s,i){M(s).Y_.add(i),i.next()}(await Dn(r),e)),()=>{e.Za(),r.asyncQueue.enqueueAndForget(async()=>function(s,i){M(s).Y_.delete(i)}(await Dn(r),e))}}function Xg(r,t,e,n){const s=function(a,u){let l;return l=typeof a=="string"?Vl().encode(a):a,function(f,g){return new Gg(f,g)}(function(f,g){if(f instanceof Uint8Array)return pc(f,g);if(f instanceof ArrayBuffer)return pc(new Uint8Array(f),g);if(f instanceof ReadableStream)return f.getReader();throw new Error("Source of `toByteStreamReader` has to be a ArrayBuffer or ReadableStream")}(l),u)}(e,Gr(t));r.asyncQueue.enqueueAndForget(async()=>{qg(await Jo(r),s,n)})}function Zg(r,t){return r.asyncQueue.enqueue(async()=>function(n,s){const i=M(n);return i.persistence.runTransaction("Get named query","readonly",a=>i.Gr.getNamedQuery(a,s))}(await Ho(r),t))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Sh(r){const t={};return r.timeoutSeconds!==void 0&&(t.timeoutSeconds=r.timeoutSeconds),t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ic=new Map;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Yo(r,t,e){if(!e)throw new b(V.INVALID_ARGUMENT,`Function ${r}() cannot be called with an empty ${t}.`)}function bh(r,t,e,n){if(t===!0&&n===!0)throw new b(V.INVALID_ARGUMENT,`${r} and ${e} cannot be used together.`)}function Tc(r){if(!F.isDocumentKey(r))throw new b(V.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${r} has ${r.length}.`)}function Ec(r){if(F.isDocumentKey(r))throw new b(V.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${r} has ${r.length}.`)}function Zs(r){if(r===void 0)return"undefined";if(r===null)return"null";if(typeof r=="string")return r.length>20&&(r=`${r.substring(0,20)}...`),JSON.stringify(r);if(typeof r=="number"||typeof r=="boolean")return""+r;if(typeof r=="object"){if(r instanceof Array)return"an array";{const t=function(n){return n.constructor?n.constructor.name:null}(r);return t?`a custom ${t} object`:"an object"}}return typeof r=="function"?"a function":O()}function J(r,t){if("_delegate"in r&&(r=r._delegate),!(r instanceof t)){if(t.name===r.constructor.name)throw new b(V.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const e=Zs(r);throw new b(V.INVALID_ARGUMENT,`Expected type '${t.name}', but it was: ${e}`)}}return r}function Ch(r,t){if(t<=0)throw new b(V.INVALID_ARGUMENT,`Function ${r}() requires a positive number, but it was: ${t}.`)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wc{constructor(t){var e,n;if(t.host===void 0){if(t.ssl!==void 0)throw new b(V.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host="firestore.googleapis.com",this.ssl=!0}else this.host=t.host,this.ssl=(e=t.ssl)===null||e===void 0||e;if(this.credentials=t.credentials,this.ignoreUndefinedProperties=!!t.ignoreUndefinedProperties,this.localCache=t.localCache,t.cacheSizeBytes===void 0)this.cacheSizeBytes=41943040;else{if(t.cacheSizeBytes!==-1&&t.cacheSizeBytes<1048576)throw new b(V.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=t.cacheSizeBytes}bh("experimentalForceLongPolling",t.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",t.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!t.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:t.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!t.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=Sh((n=t.experimentalLongPollingOptions)!==null&&n!==void 0?n:{}),function(i){if(i.timeoutSeconds!==void 0){if(isNaN(i.timeoutSeconds))throw new b(V.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (must not be NaN)`);if(i.timeoutSeconds<5)throw new b(V.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (minimum allowed value is 5)`);if(i.timeoutSeconds>30)throw new b(V.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!t.useFetchStreams}isEqual(t){return this.host===t.host&&this.ssl===t.ssl&&this.credentials===t.credentials&&this.cacheSizeBytes===t.cacheSizeBytes&&this.experimentalForceLongPolling===t.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===t.experimentalAutoDetectLongPolling&&function(n,s){return n.timeoutSeconds===s.timeoutSeconds}(this.experimentalLongPollingOptions,t.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===t.ignoreUndefinedProperties&&this.useFetchStreams===t.useFetchStreams}}class jr{constructor(t,e,n,s){this._authCredentials=t,this._appCheckCredentials=e,this._databaseId=n,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new wc({}),this._settingsFrozen=!1,this._terminateTask="notTerminated"}get app(){if(!this._app)throw new b(V.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(t){if(this._settingsFrozen)throw new b(V.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new wc(t),t.credentials!==void 0&&(this._authCredentials=function(n){if(!n)return new Qd;switch(n.type){case"firstParty":return new Jd(n.sessionIndex||"0",n.iamToken||null,n.authTokenFactory||null);case"provider":return n.client;default:throw new b(V.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(t.credentials))}_getSettings(){return this._settings}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(e){const n=Ic.get(e);n&&(C("ComponentProvider","Removing Datastore"),Ic.delete(e),n.terminate())}(this),Promise.resolve()}}function t_(r,t,e,n={}){var s;const i=(r=J(r,jr))._getSettings(),a=`${t}:${e}`;if(i.host!=="firestore.googleapis.com"&&i.host!==a&&Ht("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used."),r._setSettings(Object.assign(Object.assign({},i),{host:a,ssl:!1})),n.mockUserToken){let u,l;if(typeof n.mockUserToken=="string")u=n.mockUserToken,l=It.MOCK_USER;else{u=qd(n.mockUserToken,(s=r._app)===null||s===void 0?void 0:s.options.projectId);const d=n.mockUserToken.sub||n.mockUserToken.user_id;if(!d)throw new b(V.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");l=new It(d)}r._authCredentials=new $d(new Bc(u,l))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Mt=class xh{constructor(t,e,n){this.converter=e,this._query=n,this.type="query",this.firestore=t}withConverter(t){return new xh(this.firestore,t,this._query)}},ct=class Dh{constructor(t,e,n){this.converter=e,this._key=n,this.type="document",this.firestore=t}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new ye(this.firestore,this.converter,this._key.path.popLast())}withConverter(t){return new Dh(this.firestore,t,this._key)}},ye=class Nh extends Mt{constructor(t,e,n){super(t,e,Fn(n)),this._path=n,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const t=this._path.popLast();return t.isEmpty()?null:new ct(this.firestore,null,new F(t))}withConverter(t){return new Nh(this.firestore,t,this._path)}};function kh(r,t,...e){if(r=_t(r),Yo("collection","path",t),r instanceof jr){const n=z.fromString(t,...e);return Ec(n),new ye(r,null,n)}{if(!(r instanceof ct||r instanceof ye))throw new b(V.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const n=r._path.child(z.fromString(t,...e));return Ec(n),new ye(r.firestore,null,n)}}function e_(r,t){if(r=J(r,jr),Yo("collectionGroup","collection id",t),t.indexOf("/")>=0)throw new b(V.INVALID_ARGUMENT,`Invalid collection ID '${t}' passed to function collectionGroup(). Collection IDs must not contain '/'.`);return new Mt(r,null,function(n){return new ie(z.emptyPath(),n)}(t))}function Bs(r,t,...e){if(r=_t(r),arguments.length===1&&(t=qc.newId()),Yo("doc","path",t),r instanceof jr){const n=z.fromString(t,...e);return Tc(n),new ct(r,null,new F(n))}{if(!(r instanceof ct||r instanceof ye))throw new b(V.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const n=r._path.child(z.fromString(t,...e));return Tc(n),new ct(r.firestore,r instanceof ye?r.converter:null,new F(n))}}function Fh(r,t){return r=_t(r),t=_t(t),(r instanceof ct||r instanceof ye)&&(t instanceof ct||t instanceof ye)&&r.firestore===t.firestore&&r.path===t.path&&r.converter===t.converter}function Mh(r,t){return r=_t(r),t=_t(t),r instanceof Mt&&t instanceof Mt&&r.firestore===t.firestore&&Or(r._query,t._query)&&r.converter===t.converter}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vc{constructor(t=Promise.resolve()){this.Pu=[],this.Iu=!1,this.Tu=[],this.Eu=null,this.du=!1,this.Au=!1,this.Ru=[],this.t_=new ko(this,"async_queue_retry"),this.Vu=()=>{const n=Ps();n&&C("AsyncQueue","Visibility state changed to "+n.visibilityState),this.t_.jo()},this.mu=t;const e=Ps();e&&typeof e.addEventListener=="function"&&e.addEventListener("visibilitychange",this.Vu)}get isShuttingDown(){return this.Iu}enqueueAndForget(t){this.enqueue(t)}enqueueAndForgetEvenWhileRestricted(t){this.fu(),this.gu(t)}enterRestrictedMode(t){if(!this.Iu){this.Iu=!0,this.Au=t||!1;const e=Ps();e&&typeof e.removeEventListener=="function"&&e.removeEventListener("visibilitychange",this.Vu)}}enqueue(t){if(this.fu(),this.Iu)return new Promise(()=>{});const e=new vt;return this.gu(()=>this.Iu&&this.Au?Promise.resolve():(t().then(e.resolve,e.reject),e.promise)).then(()=>e.promise)}enqueueRetryable(t){this.enqueueAndForget(()=>(this.Pu.push(t),this.pu()))}async pu(){if(this.Pu.length!==0){try{await this.Pu[0](),this.Pu.shift(),this.t_.reset()}catch(t){if(!Se(t))throw t;C("AsyncQueue","Operation failed with retryable error: "+t)}this.Pu.length>0&&this.t_.Go(()=>this.pu())}}gu(t){const e=this.mu.then(()=>(this.du=!0,t().catch(n=>{this.Eu=n,this.du=!1;const s=function(a){let u=a.message||"";return a.stack&&(u=a.stack.includes(a.message)?a.stack:a.message+`
`+a.stack),u}(n);throw dt("INTERNAL UNHANDLED ERROR: ",s),n}).then(n=>(this.du=!1,n))));return this.mu=e,e}enqueueAfterDelay(t,e,n){this.fu(),this.Ru.indexOf(t)>-1&&(e=0);const s=Lo.createAndSchedule(this,t,e,n,i=>this.yu(i));return this.Tu.push(s),s}fu(){this.Eu&&O()}verifyOperationInProgress(){}async wu(){let t;do t=this.mu,await t;while(t!==this.mu)}Su(t){for(const e of this.Tu)if(e.timerId===t)return!0;return!1}bu(t){return this.wu().then(()=>{this.Tu.sort((e,n)=>e.targetTimeMs-n.targetTimeMs);for(const e of this.Tu)if(e.skipDelay(),t!=="all"&&e.timerId===t)break;return this.wu()})}Du(t){this.Ru.push(t)}yu(t){const e=this.Tu.indexOf(t);this.Tu.splice(e,1)}}function oo(r){return function(e,n){if(typeof e!="object"||e===null)return!1;const s=e;for(const i of n)if(i in s&&typeof s[i]=="function")return!0;return!1}(r,["next","error","complete"])}class n_{constructor(){this._progressObserver={},this._taskCompletionResolver=new vt,this._lastProgress={taskState:"Running",totalBytes:0,totalDocuments:0,bytesLoaded:0,documentsLoaded:0}}onProgress(t,e,n){this._progressObserver={next:t,error:e,complete:n}}catch(t){return this._taskCompletionResolver.promise.catch(t)}then(t,e){return this._taskCompletionResolver.promise.then(t,e)}_completeWith(t){this._updateProgress(t),this._progressObserver.complete&&this._progressObserver.complete(),this._taskCompletionResolver.resolve(t)}_failWith(t){this._lastProgress.taskState="Error",this._progressObserver.next&&this._progressObserver.next(this._lastProgress),this._progressObserver.error&&this._progressObserver.error(t),this._taskCompletionResolver.reject(t)}_updateProgress(t){this._lastProgress=t,this._progressObserver.next&&this._progressObserver.next(t)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const r_=-1;let mt=class extends jr{constructor(t,e,n,s){super(t,e,n,s),this.type="firestore",this._queue=new vc,this._persistenceKey=(s==null?void 0:s.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const t=this._firestoreClient.terminate();this._queue=new vc(t),this._firestoreClient=void 0,await t}}};function bt(r){if(r._terminated)throw new b(V.FAILED_PRECONDITION,"The client has already been terminated.");return r._firestoreClient||Oh(r),r._firestoreClient}function Oh(r){var t,e,n;const s=r._freezeSettings(),i=function(u,l,d,f){return new Vf(u,l,d,f.host,f.ssl,f.experimentalForceLongPolling,f.experimentalAutoDetectLongPolling,Sh(f.experimentalLongPollingOptions),f.useFetchStreams)}(r._databaseId,((t=r._app)===null||t===void 0?void 0:t.options.appId)||"",r._persistenceKey,s);r._componentsProvider||!((e=s.localCache)===null||e===void 0)&&e._offlineComponentProvider&&(!((n=s.localCache)===null||n===void 0)&&n._onlineComponentProvider)&&(r._componentsProvider={_offline:s.localCache._offlineComponentProvider,_online:s.localCache._onlineComponentProvider}),r._firestoreClient=new zg(r._authCredentials,r._appCheckCredentials,r._queue,i,r._componentsProvider&&function(u){const l=u==null?void 0:u._online.build();return{_offline:u==null?void 0:u._offline.build(l),_online:l}}(r._componentsProvider))}function s_(r,t){Ht("enableIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead.");const e=r._freezeSettings();return Lh(r,Cr.provider,{build:n=>new vh(n,e.cacheSizeBytes,t==null?void 0:t.forceOwnership)}),Promise.resolve()}async function i_(r){Ht("enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead.");const t=r._freezeSettings();Lh(r,Cr.provider,{build:e=>new Ug(e,t.cacheSizeBytes)})}function Lh(r,t,e){if((r=J(r,mt))._firestoreClient||r._terminated)throw new b(V.FAILED_PRECONDITION,"Firestore has already been started and persistence can no longer be enabled. You can only enable persistence before calling any other methods on a Firestore object.");if(r._componentsProvider||r._getSettings().localCache)throw new b(V.FAILED_PRECONDITION,"SDK cache is already specified.");r._componentsProvider={_online:t,_offline:e},Oh(r)}function o_(r){if(r._initialized&&!r._terminated)throw new b(V.FAILED_PRECONDITION,"Persistence can only be cleared before a Firestore instance is initialized or after it is terminated.");const t=new vt;return r._queue.enqueueAndForgetEvenWhileRestricted(async()=>{try{await async function(n){if(!$t.D())return Promise.resolve();const s=n+"main";await $t.delete(s)}(xo(r._databaseId,r._persistenceKey)),t.resolve()}catch(e){t.reject(e)}}),t.promise}function a_(r){return function(e){const n=new vt;return e.asyncQueue.enqueueAndForget(async()=>bg(await Jo(e),n)),n.promise}(bt(r=J(r,mt)))}function u_(r){return $g(bt(r=J(r,mt)))}function c_(r){return Wg(bt(r=J(r,mt)))}function l_(r,t){const e=bt(r=J(r,mt)),n=new n_;return Xg(e,r._databaseId,t,n),n}function h_(r,t){return Zg(bt(r=J(r,mt)),t).then(e=>e?new Mt(r,null,e.query):null)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yt{constructor(t){this._byteString=t}static fromBase64String(t){try{return new Yt(ht.fromBase64String(t))}catch(e){throw new b(V.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+e)}}static fromUint8Array(t){return new Yt(ht.fromUint8Array(t))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(t){return this._byteString.isEqual(t._byteString)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Re=class{constructor(...t){for(let e=0;e<t.length;++e)if(t[e].length===0)throw new b(V.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new ot(t)}isEqual(t){return this._internalPath.isEqual(t._internalPath)}};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let en=class{constructor(t){this._methodName=t}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ti{constructor(t,e){if(!isFinite(t)||t<-90||t>90)throw new b(V.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+t);if(!isFinite(e)||e<-180||e>180)throw new b(V.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+e);this._lat=t,this._long=e}get latitude(){return this._lat}get longitude(){return this._long}isEqual(t){return this._lat===t._lat&&this._long===t._long}toJSON(){return{latitude:this._lat,longitude:this._long}}_compareTo(t){return G(this._lat,t._lat)||G(this._long,t._long)}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xo{constructor(t){this._values=(t||[]).map(e=>e)}toArray(){return this._values.map(t=>t)}isEqual(t){return function(n,s){if(n.length!==s.length)return!1;for(let i=0;i<n.length;++i)if(n[i]!==s[i])return!1;return!0}(this._values,t._values)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const d_=/^__.*__$/;class f_{constructor(t,e,n){this.data=t,this.fieldMask=e,this.fieldTransforms=n}toMutation(t,e){return this.fieldMask!==null?new oe(t,this.data,this.fieldMask,e,this.fieldTransforms):new Mn(t,this.data,e,this.fieldTransforms)}}class Bh{constructor(t,e,n){this.data=t,this.fieldMask=e,this.fieldTransforms=n}toMutation(t,e){return new oe(t,this.data,this.fieldMask,e,this.fieldTransforms)}}function qh(r){switch(r){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw O()}}class ei{constructor(t,e,n,s,i,a){this.settings=t,this.databaseId=e,this.serializer=n,this.ignoreUndefinedProperties=s,i===void 0&&this.vu(),this.fieldTransforms=i||[],this.fieldMask=a||[]}get path(){return this.settings.path}get Cu(){return this.settings.Cu}Fu(t){return new ei(Object.assign(Object.assign({},this.settings),t),this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}Mu(t){var e;const n=(e=this.path)===null||e===void 0?void 0:e.child(t),s=this.Fu({path:n,xu:!1});return s.Ou(t),s}Nu(t){var e;const n=(e=this.path)===null||e===void 0?void 0:e.child(t),s=this.Fu({path:n,xu:!1});return s.vu(),s}Lu(t){return this.Fu({path:void 0,xu:!0})}Bu(t){return qs(t,this.settings.methodName,this.settings.ku||!1,this.path,this.settings.qu)}contains(t){return this.fieldMask.find(e=>t.isPrefixOf(e))!==void 0||this.fieldTransforms.find(e=>t.isPrefixOf(e.field))!==void 0}vu(){if(this.path)for(let t=0;t<this.path.length;t++)this.Ou(this.path.get(t))}Ou(t){if(t.length===0)throw this.Bu("Document fields must not be empty");if(qh(this.Cu)&&d_.test(t))throw this.Bu('Document fields cannot begin and end with "__"')}}class m_{constructor(t,e,n){this.databaseId=t,this.ignoreUndefinedProperties=e,this.serializer=n||Gr(t)}Qu(t,e,n,s=!1){return new ei({Cu:t,methodName:e,qu:n,path:ot.emptyPath(),xu:!1,ku:s},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function nn(r){const t=r._freezeSettings(),e=Gr(r._databaseId);return new m_(r._databaseId,!!t.ignoreUndefinedProperties,e)}function ni(r,t,e,n,s,i={}){const a=r.Qu(i.merge||i.mergeFields?2:0,t,e,s);ia("Data must be an object, but it was:",a,n);const u=Kh(n,a);let l,d;if(i.merge)l=new Bt(a.fieldMask),d=a.fieldTransforms;else if(i.mergeFields){const f=[];for(const g of i.mergeFields){const I=ao(t,g,e);if(!a.contains(I))throw new b(V.INVALID_ARGUMENT,`Field '${I}' is specified in your field mask but missing from your input data.`);zh(f,I)||f.push(I)}l=new Bt(f),d=a.fieldTransforms.filter(g=>l.covers(g.field))}else l=null,d=a.fieldTransforms;return new f_(new wt(u),l,d)}class zr extends en{_toFieldTransform(t){if(t.Cu!==2)throw t.Cu===1?t.Bu(`${this._methodName}() can only appear at the top level of your update data`):t.Bu(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return t.fieldMask.push(t.path),null}isEqual(t){return t instanceof zr}}function Uh(r,t,e){return new ei({Cu:3,qu:t.settings.qu,methodName:r._methodName,xu:e},t.databaseId,t.serializer,t.ignoreUndefinedProperties)}class Zo extends en{_toFieldTransform(t){return new Br(t.path,new An)}isEqual(t){return t instanceof Zo}}class ta extends en{constructor(t,e){super(t),this.Ku=e}_toFieldTransform(t){const e=Uh(this,t,!0),n=this.Ku.map(i=>rn(i,e)),s=new We(n);return new Br(t.path,s)}isEqual(t){return t instanceof ta&&xc(this.Ku,t.Ku)}}class ea extends en{constructor(t,e){super(t),this.Ku=e}_toFieldTransform(t){const e=Uh(this,t,!0),n=this.Ku.map(i=>rn(i,e)),s=new He(n);return new Br(t.path,s)}isEqual(t){return t instanceof ea&&xc(this.Ku,t.Ku)}}class na extends en{constructor(t,e){super(t),this.$u=e}_toFieldTransform(t){const e=new Rn(t.serializer,yl(t.serializer,this.$u));return new Br(t.path,e)}isEqual(t){return t instanceof na&&this.$u===t.$u}}function ra(r,t,e,n){const s=r.Qu(1,t,e);ia("Data must be an object, but it was:",s,n);const i=[],a=wt.empty();tn(n,(l,d)=>{const f=oa(t,l,e);d=_t(d);const g=s.Nu(f);if(d instanceof zr)i.push(f);else{const I=rn(d,g);I!=null&&(i.push(f),a.set(f,I))}});const u=new Bt(i);return new Bh(a,u,s.fieldTransforms)}function sa(r,t,e,n,s,i){const a=r.Qu(1,t,e),u=[ao(t,n,e)],l=[s];if(i.length%2!=0)throw new b(V.INVALID_ARGUMENT,`Function ${t}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let I=0;I<i.length;I+=2)u.push(ao(t,i[I])),l.push(i[I+1]);const d=[],f=wt.empty();for(let I=u.length-1;I>=0;--I)if(!zh(d,u[I])){const P=u[I];let x=l[I];x=_t(x);const N=a.Nu(P);if(x instanceof zr)d.push(P);else{const D=rn(x,N);D!=null&&(d.push(P),f.set(P,D))}}const g=new Bt(d);return new Bh(f,g,a.fieldTransforms)}function Gh(r,t,e,n=!1){return rn(e,r.Qu(n?4:3,t))}function rn(r,t){if(jh(r=_t(r)))return ia("Unsupported field value:",t,r),Kh(r,t);if(r instanceof en)return function(n,s){if(!qh(s.Cu))throw s.Bu(`${n._methodName}() can only be used with update() and set()`);if(!s.path)throw s.Bu(`${n._methodName}() is not currently supported inside arrays`);const i=n._toFieldTransform(s);i&&s.fieldTransforms.push(i)}(r,t),null;if(r===void 0&&t.ignoreUndefinedProperties)return null;if(t.path&&t.fieldMask.push(t.path),r instanceof Array){if(t.settings.xu&&t.Cu!==4)throw t.Bu("Nested arrays are not supported");return function(n,s){const i=[];let a=0;for(const u of n){let l=rn(u,s.Lu(a));l==null&&(l={nullValue:"NULL_VALUE"}),i.push(l),a++}return{arrayValue:{values:i}}}(r,t)}return function(n,s){if((n=_t(n))===null)return{nullValue:"NULL_VALUE"};if(typeof n=="number")return yl(s.serializer,n);if(typeof n=="boolean")return{booleanValue:n};if(typeof n=="string")return{stringValue:n};if(n instanceof Date){const i=ut.fromDate(n);return{timestampValue:Pn(s.serializer,i)}}if(n instanceof ut){const i=new ut(n.seconds,1e3*Math.floor(n.nanoseconds/1e3));return{timestampValue:Pn(s.serializer,i)}}if(n instanceof ti)return{geoPointValue:{latitude:n.latitude,longitude:n.longitude}};if(n instanceof Yt)return{bytesValue:Cl(s.serializer,n._byteString)};if(n instanceof ct){const i=s.databaseId,a=n.firestore._databaseId;if(!a.isEqual(i))throw s.Bu(`Document reference is for database ${a.projectId}/${a.database} but should be for database ${i.projectId}/${i.database}`);return{referenceValue:Ro(n.firestore._databaseId||s.databaseId,n._key.path)}}if(n instanceof Xo)return function(a,u){return{mapValue:{fields:{__type__:{stringValue:"__vector__"},value:{arrayValue:{values:a.toArray().map(l=>{if(typeof l!="number")throw u.Bu("VectorValues must only contain numeric values.");return Io(u.serializer,l)})}}}}}}(n,s);throw s.Bu(`Unsupported field value: ${Zs(n)}`)}(r,t)}function Kh(r,t){const e={};return Xc(r)?t.path&&t.path.length>0&&t.fieldMask.push(t.path):tn(r,(n,s)=>{const i=rn(s,t.Mu(n));i!=null&&(e[n]=i)}),{mapValue:{fields:e}}}function jh(r){return!(typeof r!="object"||r===null||r instanceof Array||r instanceof Date||r instanceof ut||r instanceof ti||r instanceof Yt||r instanceof ct||r instanceof en||r instanceof Xo)}function ia(r,t,e){if(!jh(e)||!function(s){return typeof s=="object"&&s!==null&&(Object.getPrototypeOf(s)===Object.prototype||Object.getPrototypeOf(s)===null)}(e)){const n=Zs(e);throw n==="an object"?t.Bu(r+" a custom object"):t.Bu(r+" "+n)}}function ao(r,t,e){if((t=_t(t))instanceof Re)return t._internalPath;if(typeof t=="string")return oa(r,t);throw qs("Field path arguments must be of type string or ",r,!1,void 0,e)}const g_=new RegExp("[~\\*/\\[\\]]");function oa(r,t,e){if(t.search(g_)>=0)throw qs(`Invalid field path (${t}). Paths must not contain '~', '*', '/', '[', or ']'`,r,!1,void 0,e);try{return new Re(...t.split("."))._internalPath}catch{throw qs(`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,r,!1,void 0,e)}}function qs(r,t,e,n,s){const i=n&&!n.isEmpty(),a=s!==void 0;let u=`Function ${t}() called with invalid data`;e&&(u+=" (via `toFirestore()`)"),u+=". ";let l="";return(i||a)&&(l+=" (found",i&&(l+=` in field ${n}`),a&&(l+=` in document ${s}`),l+=")"),new b(V.INVALID_ARGUMENT,u+r+l)}function zh(r,t){return r.some(e=>e.isEqual(t))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xr{constructor(t,e,n,s,i){this._firestore=t,this._userDataWriter=e,this._key=n,this._document=s,this._converter=i}get id(){return this._key.path.lastSegment()}get ref(){return new ct(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const t=new __(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(t)}return this._userDataWriter.convertValue(this._document.data.value)}}get(t){if(this._document){const e=this._document.data.field(ri("DocumentSnapshot.get",t));if(e!==null)return this._userDataWriter.convertValue(e)}}}class __ extends xr{data(){return super.data()}}function ri(r,t){return typeof t=="string"?oa(r,t):t instanceof Re?t._internalPath:t._delegate._internalPath}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Qh(r){if(r.limitType==="L"&&r.explicitOrderBy.length===0)throw new b(V.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class aa{}class Qr extends aa{}function me(r,t,...e){let n=[];t instanceof aa&&n.push(t),n=n.concat(e),function(i){const a=i.filter(l=>l instanceof ua).length,u=i.filter(l=>l instanceof si).length;if(a>1||a>0&&u>0)throw new b(V.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(n);for(const s of n)r=s._apply(r);return r}class si extends Qr{constructor(t,e,n){super(),this._field=t,this._op=e,this._value=n,this.type="where"}static _create(t,e,n){return new si(t,e,n)}_apply(t){const e=this._parse(t);return Wh(t._query,e),new Mt(t.firestore,t.converter,Wi(t._query,e))}_parse(t){const e=nn(t.firestore);return function(i,a,u,l,d,f,g){let I;if(d.isKeyField()){if(f==="array-contains"||f==="array-contains-any")throw new b(V.INVALID_ARGUMENT,`Invalid Query. You can't perform '${f}' queries on documentId().`);if(f==="in"||f==="not-in"){Rc(g,f);const P=[];for(const x of g)P.push(Ac(l,i,x));I={arrayValue:{values:P}}}else I=Ac(l,i,g)}else f!=="in"&&f!=="not-in"&&f!=="array-contains-any"||Rc(g,f),I=Gh(u,a,g,f==="in"||f==="not-in");return Q.create(d,f,I)}(t._query,"where",e,t.firestore._databaseId,this._field,this._op,this._value)}}function p_(r,t,e){const n=t,s=ri("where",r);return si._create(s,n,e)}class ua extends aa{constructor(t,e){super(),this.type=t,this._queryConstraints=e}static _create(t,e){return new ua(t,e)}_parse(t){const e=this._queryConstraints.map(n=>n._parse(t)).filter(n=>n.getFilters().length>0);return e.length===1?e[0]:X.create(e,this._getOperator())}_apply(t){const e=this._parse(t);return e.getFilters().length===0?t:(function(s,i){let a=s;const u=i.getFlattenedFilters();for(const l of u)Wh(a,l),a=Wi(a,l)}(t._query,e),new Mt(t.firestore,t.converter,Wi(t._query,e)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}class ca extends Qr{constructor(t,e){super(),this._field=t,this._direction=e,this.type="orderBy"}static _create(t,e){return new ca(t,e)}_apply(t){const e=function(s,i,a){if(s.startAt!==null)throw new b(V.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(s.endAt!==null)throw new b(V.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new Pr(i,a)}(t._query,this._field,this._direction);return new Mt(t.firestore,t.converter,function(s,i){const a=s.explicitOrderBy.concat([i]);return new ie(s.path,s.collectionGroup,a,s.filters.slice(),s.limit,s.limitType,s.startAt,s.endAt)}(t._query,e))}}function y_(r,t="asc"){const e=t,n=ri("orderBy",r);return ca._create(n,e)}class ii extends Qr{constructor(t,e,n){super(),this.type=t,this._limit=e,this._limitType=n}static _create(t,e,n){return new ii(t,e,n)}_apply(t){return new Mt(t.firestore,t.converter,xs(t._query,this._limit,this._limitType))}}function I_(r){return Ch("limit",r),ii._create("limit",r,"F")}function T_(r){return Ch("limitToLast",r),ii._create("limitToLast",r,"L")}class oi extends Qr{constructor(t,e,n){super(),this.type=t,this._docOrFields=e,this._inclusive=n}static _create(t,e,n){return new oi(t,e,n)}_apply(t){const e=$h(t,this.type,this._docOrFields,this._inclusive);return new Mt(t.firestore,t.converter,function(s,i){return new ie(s.path,s.collectionGroup,s.explicitOrderBy.slice(),s.filters.slice(),s.limit,s.limitType,i,s.endAt)}(t._query,e))}}function E_(...r){return oi._create("startAt",r,!0)}function w_(...r){return oi._create("startAfter",r,!1)}class ai extends Qr{constructor(t,e,n){super(),this.type=t,this._docOrFields=e,this._inclusive=n}static _create(t,e,n){return new ai(t,e,n)}_apply(t){const e=$h(t,this.type,this._docOrFields,this._inclusive);return new Mt(t.firestore,t.converter,function(s,i){return new ie(s.path,s.collectionGroup,s.explicitOrderBy.slice(),s.filters.slice(),s.limit,s.limitType,s.startAt,i)}(t._query,e))}}function v_(...r){return ai._create("endBefore",r,!1)}function A_(...r){return ai._create("endAt",r,!0)}function $h(r,t,e,n){if(e[0]=_t(e[0]),e[0]instanceof xr)return function(i,a,u,l,d){if(!l)throw new b(V.NOT_FOUND,`Can't use a DocumentSnapshot that doesn't exist for ${u}().`);const f=[];for(const g of In(i))if(g.field.isKeyField())f.push(Qe(a,l.key));else{const I=l.data.field(g.field);if(Gs(I))throw new b(V.INVALID_ARGUMENT,'Invalid query. You are trying to start or end a query using a document for which the field "'+g.field+'" is an uncommitted server timestamp. (Since the value of this field is unknown, you cannot start/end a query with it.)');if(I===null){const P=g.field.canonicalString();throw new b(V.INVALID_ARGUMENT,`Invalid query. You are trying to start or end a query using a document for which the field '${P}' (used as the orderBy) does not exist.`)}f.push(I)}return new ve(f,d)}(r._query,r.firestore._databaseId,t,e[0]._document,n);{const s=nn(r.firestore);return function(a,u,l,d,f,g){const I=a.explicitOrderBy;if(f.length>I.length)throw new b(V.INVALID_ARGUMENT,`Too many arguments provided to ${d}(). The number of arguments must be less than or equal to the number of orderBy() clauses`);const P=[];for(let x=0;x<f.length;x++){const N=f[x];if(I[x].field.isKeyField()){if(typeof N!="string")throw new b(V.INVALID_ARGUMENT,`Invalid query. Expected a string for document ID in ${d}(), but got a ${typeof N}`);if(!po(a)&&N.indexOf("/")!==-1)throw new b(V.INVALID_ARGUMENT,`Invalid query. When querying a collection and ordering by documentId(), the value passed to ${d}() must be a plain document ID, but '${N}' contains a slash.`);const D=a.path.child(z.fromString(N));if(!F.isDocumentKey(D))throw new b(V.INVALID_ARGUMENT,`Invalid query. When querying a collection group and ordering by documentId(), the value passed to ${d}() must result in a valid document path, but '${D}' is not because it contains an odd number of segments.`);const U=new F(D);P.push(Qe(u,U))}else{const D=Gh(l,d,N);P.push(D)}}return new ve(P,g)}(r._query,r.firestore._databaseId,s,t,e,n)}}function Ac(r,t,e){if(typeof(e=_t(e))=="string"){if(e==="")throw new b(V.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!po(t)&&e.indexOf("/")!==-1)throw new b(V.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${e}' contains a '/' character.`);const n=t.path.child(z.fromString(e));if(!F.isDocumentKey(n))throw new b(V.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${n}' is not because it has an odd number of segments (${n.length}).`);return Qe(r,new F(n))}if(e instanceof ct)return Qe(r,e._key);throw new b(V.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${Zs(e)}.`)}function Rc(r,t){if(!Array.isArray(r)||r.length===0)throw new b(V.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${t.toString()}' filters.`)}function Wh(r,t){const e=function(s,i){for(const a of s)for(const u of a.getFlattenedFilters())if(i.indexOf(u.op)>=0)return u.op;return null}(r.filters,function(s){switch(s){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(t.op));if(e!==null)throw e===t.op?new b(V.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${t.op.toString()}' filter.`):new b(V.INVALID_ARGUMENT,`Invalid query. You cannot use '${t.op.toString()}' filters with '${e.toString()}' filters.`)}class la{convertValue(t,e="none"){switch(ze(t)){case 0:return null;case 1:return t.booleanValue;case 2:return it(t.integerValue||t.doubleValue);case 3:return this.convertTimestamp(t.timestampValue);case 4:return this.convertServerTimestamp(t,e);case 5:return t.stringValue;case 6:return this.convertBytes(Te(t.bytesValue));case 7:return this.convertReference(t.referenceValue);case 8:return this.convertGeoPoint(t.geoPointValue);case 9:return this.convertArray(t.arrayValue,e);case 11:return this.convertObject(t.mapValue,e);case 10:return this.convertVectorValue(t.mapValue);default:throw O()}}convertObject(t,e){return this.convertObjectMap(t.fields,e)}convertObjectMap(t,e="none"){const n={};return tn(t,(s,i)=>{n[s]=this.convertValue(i,e)}),n}convertVectorValue(t){var e,n,s;const i=(s=(n=(e=t.fields)===null||e===void 0?void 0:e.value.arrayValue)===null||n===void 0?void 0:n.values)===null||s===void 0?void 0:s.map(a=>it(a.doubleValue));return new Xo(i)}convertGeoPoint(t){return new ti(it(t.latitude),it(t.longitude))}convertArray(t,e){return(t.values||[]).map(n=>this.convertValue(n,e))}convertServerTimestamp(t,e){switch(e){case"previous":const n=go(t);return n==null?null:this.convertValue(n,e);case"estimate":return this.convertTimestamp(vr(t));default:return null}}convertTimestamp(t){const e=re(t);return new ut(e.seconds,e.nanos)}convertDocumentKey(t,e){const n=z.fromString(t);L(Ul(n));const s=new Ee(n.get(1),n.get(3)),i=new F(n.popFirst(5));return s.isEqual(e)||dt(`Document ${i} contains a document reference within a different database (${s.projectId}/${s.database}) which is not supported. It will be treated as a reference in the current database (${e.projectId}/${e.database}) instead.`),i}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ui(r,t,e){let n;return n=r?e&&(e.merge||e.mergeFields)?r.toFirestore(t,e):r.toFirestore(t):t,n}class R_ extends la{constructor(t){super(),this.firestore=t}convertBytes(t){return new Yt(t)}convertReference(t){const e=this.convertDocumentKey(t,this.firestore._databaseId);return new ct(this.firestore,null,e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ge{constructor(t,e){this.hasPendingWrites=t,this.fromCache=e}isEqual(t){return this.hasPendingWrites===t.hasPendingWrites&&this.fromCache===t.fromCache}}let se=class extends xr{constructor(t,e,n,s,i,a){super(t,e,n,s,a),this._firestore=t,this._firestoreImpl=t,this.metadata=i}exists(){return super.exists()}data(t={}){if(this._document){if(this._converter){const e=new Ir(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(e,t)}return this._userDataWriter.convertValue(this._document.data.value,t.serverTimestamps)}}get(t,e={}){if(this._document){const n=this._document.data.field(ri("DocumentSnapshot.get",t));if(n!==null)return this._userDataWriter.convertValue(n,e.serverTimestamps)}}},Ir=class extends se{data(t={}){return super.data(t)}},Pe=class{constructor(t,e,n,s){this._firestore=t,this._userDataWriter=e,this._snapshot=s,this.metadata=new Ge(s.hasPendingWrites,s.fromCache),this.query=n}get docs(){const t=[];return this.forEach(e=>t.push(e)),t}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(t,e){this._snapshot.docs.forEach(n=>{t.call(e,new Ir(this._firestore,this._userDataWriter,n.key,n,new Ge(this._snapshot.mutatedKeys.has(n.key),this._snapshot.fromCache),this.query.converter))})}docChanges(t={}){const e=!!t.includeMetadataChanges;if(e&&this._snapshot.excludesMetadataChanges)throw new b(V.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===e||(this._cachedChanges=function(s,i){if(s._snapshot.oldDocs.isEmpty()){let a=0;return s._snapshot.docChanges.map(u=>{const l=new Ir(s._firestore,s._userDataWriter,u.doc.key,u.doc,new Ge(s._snapshot.mutatedKeys.has(u.doc.key),s._snapshot.fromCache),s.query.converter);return u.doc,{type:"added",doc:l,oldIndex:-1,newIndex:a++}})}{let a=s._snapshot.oldDocs;return s._snapshot.docChanges.filter(u=>i||u.type!==3).map(u=>{const l=new Ir(s._firestore,s._userDataWriter,u.doc.key,u.doc,new Ge(s._snapshot.mutatedKeys.has(u.doc.key),s._snapshot.fromCache),s.query.converter);let d=-1,f=-1;return u.type!==0&&(d=a.indexOf(u.doc.key),a=a.delete(u.doc.key)),u.type!==1&&(a=a.add(u.doc),f=a.indexOf(u.doc.key)),{type:P_(u.type),doc:l,oldIndex:d,newIndex:f}})}}(this,e),this._cachedChangesIncludeMetadataChanges=e),this._cachedChanges}};function P_(r){switch(r){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return O()}}function Hh(r,t){return r instanceof se&&t instanceof se?r._firestore===t._firestore&&r._key.isEqual(t._key)&&(r._document===null?t._document===null:r._document.isEqual(t._document))&&r._converter===t._converter:r instanceof Pe&&t instanceof Pe&&r._firestore===t._firestore&&Mh(r.query,t.query)&&r.metadata.isEqual(t.metadata)&&r._snapshot.isEqual(t._snapshot)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function V_(r){r=J(r,ct);const t=J(r.firestore,mt);return Ph(bt(t),r._key).then(e=>ha(t,r,e))}class sn extends la{constructor(t){super(),this.firestore=t}convertBytes(t){return new Yt(t)}convertReference(t){const e=this.convertDocumentKey(t,this.firestore._databaseId);return new ct(this.firestore,null,e)}}function S_(r){r=J(r,ct);const t=J(r.firestore,mt),e=bt(t),n=new sn(t);return Hg(e,r._key).then(s=>new se(t,n,r._key,s,new Ge(s!==null&&s.hasLocalMutations,!0),r.converter))}function b_(r){r=J(r,ct);const t=J(r.firestore,mt);return Ph(bt(t),r._key,{source:"server"}).then(e=>ha(t,r,e))}function C_(r){r=J(r,Mt);const t=J(r.firestore,mt),e=bt(t),n=new sn(t);return Qh(r._query),Vh(e,r._query).then(s=>new Pe(t,n,r,s))}function x_(r){r=J(r,Mt);const t=J(r.firestore,mt),e=bt(t),n=new sn(t);return Jg(e,r._query).then(s=>new Pe(t,n,r,s))}function D_(r){r=J(r,Mt);const t=J(r.firestore,mt),e=bt(t),n=new sn(t);return Vh(e,r._query,{source:"server"}).then(s=>new Pe(t,n,r,s))}function Pc(r,t,e){r=J(r,ct);const n=J(r.firestore,mt),s=ui(r.converter,t,e);return $r(n,[ni(nn(n),"setDoc",r._key,s,r.converter!==null,e).toMutation(r._key,at.none())])}function Vc(r,t,e,...n){r=J(r,ct);const s=J(r.firestore,mt),i=nn(s);let a;return a=typeof(t=_t(t))=="string"||t instanceof Re?sa(i,"updateDoc",r._key,t,e,n):ra(i,"updateDoc",r._key,t),$r(s,[a.toMutation(r._key,at.exists(!0))])}function N_(r){return $r(J(r.firestore,mt),[new On(r._key,at.none())])}function k_(r,t){const e=J(r.firestore,mt),n=Bs(r),s=ui(r.converter,t);return $r(e,[ni(nn(r.firestore),"addDoc",n._key,s,r.converter!==null,{}).toMutation(n._key,at.exists(!1))]).then(()=>n)}function Jh(r,...t){var e,n,s;r=_t(r);let i={includeMetadataChanges:!1,source:"default"},a=0;typeof t[a]!="object"||oo(t[a])||(i=t[a],a++);const u={includeMetadataChanges:i.includeMetadataChanges,source:i.source};if(oo(t[a])){const g=t[a];t[a]=(e=g.next)===null||e===void 0?void 0:e.bind(g),t[a+1]=(n=g.error)===null||n===void 0?void 0:n.bind(g),t[a+2]=(s=g.complete)===null||s===void 0?void 0:s.bind(g)}let l,d,f;if(r instanceof ct)d=J(r.firestore,mt),f=Fn(r._key.path),l={next:g=>{t[a]&&t[a](ha(d,r,g))},error:t[a+1],complete:t[a+2]};else{const g=J(r,Mt);d=J(g.firestore,mt),f=g._query;const I=new sn(d);l={next:P=>{t[a]&&t[a](new Pe(d,I,g,P))},error:t[a+1],complete:t[a+2]},Qh(r._query)}return function(I,P,x,N){const D=new Ys(N),U=new Go(P,D,x);return I.asyncQueue.enqueueAndForget(async()=>Bo(await Dn(I),U)),()=>{D.Za(),I.asyncQueue.enqueueAndForget(async()=>qo(await Dn(I),U))}}(bt(d),f,u,l)}function F_(r,t){return Yg(bt(r=J(r,mt)),oo(t)?t:{next:t})}function $r(r,t){return function(n,s){const i=new vt;return n.asyncQueue.enqueueAndForget(async()=>Rg(await Jo(n),s,i)),i.promise}(bt(r),t)}function ha(r,t,e){const n=e.docs.get(t._key),s=new sn(r);return new se(r,s,t._key,n,new Ge(e.hasPendingWrites,e.fromCache),t.converter)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const M_={maxAttempts:5};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let O_=class{constructor(t,e){this._firestore=t,this._commitHandler=e,this._mutations=[],this._committed=!1,this._dataReader=nn(t)}set(t,e,n){this._verifyNotCommitted();const s=_e(t,this._firestore),i=ui(s.converter,e,n),a=ni(this._dataReader,"WriteBatch.set",s._key,i,s.converter!==null,n);return this._mutations.push(a.toMutation(s._key,at.none())),this}update(t,e,n,...s){this._verifyNotCommitted();const i=_e(t,this._firestore);let a;return a=typeof(e=_t(e))=="string"||e instanceof Re?sa(this._dataReader,"WriteBatch.update",i._key,e,n,s):ra(this._dataReader,"WriteBatch.update",i._key,e),this._mutations.push(a.toMutation(i._key,at.exists(!0))),this}delete(t){this._verifyNotCommitted();const e=_e(t,this._firestore);return this._mutations=this._mutations.concat(new On(e._key,at.none())),this}commit(){return this._verifyNotCommitted(),this._committed=!0,this._mutations.length>0?this._commitHandler(this._mutations):Promise.resolve()}_verifyNotCommitted(){if(this._committed)throw new b(V.FAILED_PRECONDITION,"A write batch can no longer be used after commit() has been called.")}};function _e(r,t){if((r=_t(r)).firestore!==t)throw new b(V.INVALID_ARGUMENT,"Provided document reference is from a different Firestore instance.");return r}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let L_=class extends class{constructor(e,n){this._firestore=e,this._transaction=n,this._dataReader=nn(e)}get(e){const n=_e(e,this._firestore),s=new R_(this._firestore);return this._transaction.lookup([n._key]).then(i=>{if(!i||i.length!==1)return O();const a=i[0];if(a.isFoundDocument())return new xr(this._firestore,s,a.key,a,n.converter);if(a.isNoDocument())return new xr(this._firestore,s,n._key,null,n.converter);throw O()})}set(e,n,s){const i=_e(e,this._firestore),a=ui(i.converter,n,s),u=ni(this._dataReader,"Transaction.set",i._key,a,i.converter!==null,s);return this._transaction.set(i._key,u),this}update(e,n,s,...i){const a=_e(e,this._firestore);let u;return u=typeof(n=_t(n))=="string"||n instanceof Re?sa(this._dataReader,"Transaction.update",a._key,n,s,i):ra(this._dataReader,"Transaction.update",a._key,n),this._transaction.update(a._key,u),this}delete(e){const n=_e(e,this._firestore);return this._transaction.delete(n._key),this}}{constructor(t,e){super(t,e),this._firestore=t}get(t){const e=_e(t,this._firestore),n=new sn(this._firestore);return super.get(t).then(s=>new se(this._firestore,n,e._key,s._document,new Ge(!1,!1),e.converter))}};function B_(r,t,e){r=J(r,mt);const n=Object.assign(Object.assign({},M_),e);return function(i){if(i.maxAttempts<1)throw new b(V.INVALID_ARGUMENT,"Max attempts must be at least 1")}(n),function(i,a,u){const l=new vt;return i.asyncQueue.enqueueAndForget(async()=>{const d=await Qg(i);new jg(i.asyncQueue,d,u,a,l).au()}),l.promise}(bt(r),s=>t(new L_(r,s)),n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function q_(){return new zr("deleteField")}function U_(){return new Zo("serverTimestamp")}function G_(...r){return new ta("arrayUnion",r)}function K_(...r){return new ea("arrayRemove",r)}function j_(r){return new na("increment",r)}(function(t,e=!0){(function(s){kn=s})(Ud),Ld(new Cc("firestore",(n,{instanceIdentifier:s,options:i})=>{const a=n.getProvider("app").getImmediate(),u=new mt(new Wd(n.getProvider("auth-internal")),new Xd(n.getProvider("app-check-internal")),function(d,f){if(!Object.prototype.hasOwnProperty.apply(d.options,["projectId"]))throw new b(V.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Ee(d.options.projectId,f)}(a,s),a);return i=Object.assign({useFetchStreams:e},i),u._setSettings(i),u},"PUBLIC").setMultipleInstances(!0)),mu(_u,"4.7.3",t),mu(_u,"4.7.3","esm2017")})();const z_="@firebase/firestore-compat",Q_="0.3.38";/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function da(r,t){if(t===void 0)return{merge:!1};if(t.mergeFields!==void 0&&t.merge!==void 0)throw new b("invalid-argument",`Invalid options passed to function ${r}(): You cannot specify both "merge" and "mergeFields".`);return t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Sc(){if(typeof Uint8Array>"u")throw new b("unimplemented","Uint8Arrays are not available in this environment.")}function bc(){if(!Rf())throw new b("unimplemented","Blobs are unavailable in Firestore in this environment.")}class Dr{constructor(t){this._delegate=t}static fromBase64String(t){return bc(),new Dr(Yt.fromBase64String(t))}static fromUint8Array(t){return Sc(),new Dr(Yt.fromUint8Array(t))}toBase64(){return bc(),this._delegate.toBase64()}toUint8Array(){return Sc(),this._delegate.toUint8Array()}isEqual(t){return this._delegate.isEqual(t._delegate)}toString(){return"Blob(base64: "+this.toBase64()+")"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function uo(r){return $_(r,["next","error","complete"])}function $_(r,t){if(typeof r!="object"||r===null)return!1;const e=r;for(const n of t)if(n in e&&typeof e[n]=="function")return!0;return!1}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class W_{enableIndexedDbPersistence(t,e){return s_(t._delegate,{forceOwnership:e})}enableMultiTabIndexedDbPersistence(t){return i_(t._delegate)}clearIndexedDbPersistence(t){return o_(t._delegate)}}class Yh{constructor(t,e,n){this._delegate=e,this._persistenceProvider=n,this.INTERNAL={delete:()=>this.terminate()},t instanceof Ee||(this._appCompat=t)}get _databaseId(){return this._delegate._databaseId}settings(t){const e=this._delegate._getSettings();!t.merge&&e.host!==t.host&&Ht("You are overriding the original host. If you did not intend to override your settings, use {merge: true}."),t.merge&&(t=Object.assign(Object.assign({},e),t),delete t.merge),this._delegate._setSettings(t)}useEmulator(t,e,n={}){t_(this._delegate,t,e,n)}enableNetwork(){return u_(this._delegate)}disableNetwork(){return c_(this._delegate)}enablePersistence(t){let e=!1,n=!1;return t&&(e=!!t.synchronizeTabs,n=!!t.experimentalForceOwningTab,bh("synchronizeTabs",e,"experimentalForceOwningTab",n)),e?this._persistenceProvider.enableMultiTabIndexedDbPersistence(this):this._persistenceProvider.enableIndexedDbPersistence(this,n)}clearPersistence(){return this._persistenceProvider.clearIndexedDbPersistence(this)}terminate(){return this._appCompat&&(this._appCompat._removeServiceInstance("firestore-compat"),this._appCompat._removeServiceInstance("firestore")),this._delegate._delete()}waitForPendingWrites(){return a_(this._delegate)}onSnapshotsInSync(t){return F_(this._delegate,t)}get app(){if(!this._appCompat)throw new b("failed-precondition","Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._appCompat}collection(t){try{return new Nn(this,kh(this._delegate,t))}catch(e){throw Nt(e,"collection()","Firestore.collection()")}}doc(t){try{return new Kt(this,Bs(this._delegate,t))}catch(e){throw Nt(e,"doc()","Firestore.doc()")}}collectionGroup(t){try{return new Dt(this,e_(this._delegate,t))}catch(e){throw Nt(e,"collectionGroup()","Firestore.collectionGroup()")}}runTransaction(t){return B_(this._delegate,e=>t(new Xh(this,e)))}batch(){return bt(this._delegate),new Zh(new O_(this._delegate,t=>$r(this._delegate,t)))}loadBundle(t){return l_(this._delegate,t)}namedQuery(t){return h_(this._delegate,t).then(e=>e?new Dt(this,e):null)}}class ci extends la{constructor(t){super(),this.firestore=t}convertBytes(t){return new Dr(new Yt(t))}convertReference(t){const e=this.convertDocumentKey(t,this.firestore._databaseId);return Kt.forKey(e,this.firestore,null)}}function H_(r){jd(r)}class Xh{constructor(t,e){this._firestore=t,this._delegate=e,this._userDataWriter=new ci(t)}get(t){const e=Ke(t);return this._delegate.get(e).then(n=>new Nr(this._firestore,new se(this._firestore._delegate,this._userDataWriter,n._key,n._document,n.metadata,e.converter)))}set(t,e,n){const s=Ke(t);return n?(da("Transaction.set",n),this._delegate.set(s,e,n)):this._delegate.set(s,e),this}update(t,e,n,...s){const i=Ke(t);return arguments.length===2?this._delegate.update(i,e):this._delegate.update(i,e,n,...s),this}delete(t){const e=Ke(t);return this._delegate.delete(e),this}}class Zh{constructor(t){this._delegate=t}set(t,e,n){const s=Ke(t);return n?(da("WriteBatch.set",n),this._delegate.set(s,e,n)):this._delegate.set(s,e),this}update(t,e,n,...s){const i=Ke(t);return arguments.length===2?this._delegate.update(i,e):this._delegate.update(i,e,n,...s),this}delete(t){const e=Ke(t);return this._delegate.delete(e),this}commit(){return this._delegate.commit()}}class Ze{constructor(t,e,n){this._firestore=t,this._userDataWriter=e,this._delegate=n}fromFirestore(t,e){const n=new Ir(this._firestore._delegate,this._userDataWriter,t._key,t._document,t.metadata,null);return this._delegate.fromFirestore(new kr(this._firestore,n),e??{})}toFirestore(t,e){return e?this._delegate.toFirestore(t,e):this._delegate.toFirestore(t)}static getInstance(t,e){const n=Ze.INSTANCES;let s=n.get(t);s||(s=new WeakMap,n.set(t,s));let i=s.get(e);return i||(i=new Ze(t,new ci(t),e),s.set(e,i)),i}}Ze.INSTANCES=new WeakMap;class Kt{constructor(t,e){this.firestore=t,this._delegate=e,this._userDataWriter=new ci(t)}static forPath(t,e,n){if(t.length%2!==0)throw new b("invalid-argument",`Invalid document reference. Document references must have an even number of segments, but ${t.canonicalString()} has ${t.length}`);return new Kt(e,new ct(e._delegate,n,new F(t)))}static forKey(t,e,n){return new Kt(e,new ct(e._delegate,n,t))}get id(){return this._delegate.id}get parent(){return new Nn(this.firestore,this._delegate.parent)}get path(){return this._delegate.path}collection(t){try{return new Nn(this.firestore,kh(this._delegate,t))}catch(e){throw Nt(e,"collection()","DocumentReference.collection()")}}isEqual(t){return t=_t(t),t instanceof ct?Fh(this._delegate,t):!1}set(t,e){e=da("DocumentReference.set",e);try{return e?Pc(this._delegate,t,e):Pc(this._delegate,t)}catch(n){throw Nt(n,"setDoc()","DocumentReference.set()")}}update(t,e,...n){try{return arguments.length===1?Vc(this._delegate,t):Vc(this._delegate,t,e,...n)}catch(s){throw Nt(s,"updateDoc()","DocumentReference.update()")}}delete(){return N_(this._delegate)}onSnapshot(...t){const e=td(t),n=ed(t,s=>new Nr(this.firestore,new se(this.firestore._delegate,this._userDataWriter,s._key,s._document,s.metadata,this._delegate.converter)));return Jh(this._delegate,e,n)}get(t){let e;return(t==null?void 0:t.source)==="cache"?e=S_(this._delegate):(t==null?void 0:t.source)==="server"?e=b_(this._delegate):e=V_(this._delegate),e.then(n=>new Nr(this.firestore,new se(this.firestore._delegate,this._userDataWriter,n._key,n._document,n.metadata,this._delegate.converter)))}withConverter(t){return new Kt(this.firestore,t?this._delegate.withConverter(Ze.getInstance(this.firestore,t)):this._delegate.withConverter(null))}}function Nt(r,t,e){return r.message=r.message.replace(t,e),r}function td(r){for(const t of r)if(typeof t=="object"&&!uo(t))return t;return{}}function ed(r,t){var e,n;let s;return uo(r[0])?s=r[0]:uo(r[1])?s=r[1]:typeof r[0]=="function"?s={next:r[0],error:r[1],complete:r[2]}:s={next:r[1],error:r[2],complete:r[3]},{next:i=>{s.next&&s.next(t(i))},error:(e=s.error)===null||e===void 0?void 0:e.bind(s),complete:(n=s.complete)===null||n===void 0?void 0:n.bind(s)}}class Nr{constructor(t,e){this._firestore=t,this._delegate=e}get ref(){return new Kt(this._firestore,this._delegate.ref)}get id(){return this._delegate.id}get metadata(){return this._delegate.metadata}get exists(){return this._delegate.exists()}data(t){return this._delegate.data(t)}get(t,e){return this._delegate.get(t,e)}isEqual(t){return Hh(this._delegate,t._delegate)}}class kr extends Nr{data(t){const e=this._delegate.data(t);return this._delegate._converter||zd(e!==void 0),e}}class Dt{constructor(t,e){this.firestore=t,this._delegate=e,this._userDataWriter=new ci(t)}where(t,e,n){try{return new Dt(this.firestore,me(this._delegate,p_(t,e,n)))}catch(s){throw Nt(s,/(orderBy|where)\(\)/,"Query.$1()")}}orderBy(t,e){try{return new Dt(this.firestore,me(this._delegate,y_(t,e)))}catch(n){throw Nt(n,/(orderBy|where)\(\)/,"Query.$1()")}}limit(t){try{return new Dt(this.firestore,me(this._delegate,I_(t)))}catch(e){throw Nt(e,"limit()","Query.limit()")}}limitToLast(t){try{return new Dt(this.firestore,me(this._delegate,T_(t)))}catch(e){throw Nt(e,"limitToLast()","Query.limitToLast()")}}startAt(...t){try{return new Dt(this.firestore,me(this._delegate,E_(...t)))}catch(e){throw Nt(e,"startAt()","Query.startAt()")}}startAfter(...t){try{return new Dt(this.firestore,me(this._delegate,w_(...t)))}catch(e){throw Nt(e,"startAfter()","Query.startAfter()")}}endBefore(...t){try{return new Dt(this.firestore,me(this._delegate,v_(...t)))}catch(e){throw Nt(e,"endBefore()","Query.endBefore()")}}endAt(...t){try{return new Dt(this.firestore,me(this._delegate,A_(...t)))}catch(e){throw Nt(e,"endAt()","Query.endAt()")}}isEqual(t){return Mh(this._delegate,t._delegate)}get(t){let e;return(t==null?void 0:t.source)==="cache"?e=x_(this._delegate):(t==null?void 0:t.source)==="server"?e=D_(this._delegate):e=C_(this._delegate),e.then(n=>new co(this.firestore,new Pe(this.firestore._delegate,this._userDataWriter,this._delegate,n._snapshot)))}onSnapshot(...t){const e=td(t),n=ed(t,s=>new co(this.firestore,new Pe(this.firestore._delegate,this._userDataWriter,this._delegate,s._snapshot)));return Jh(this._delegate,e,n)}withConverter(t){return new Dt(this.firestore,t?this._delegate.withConverter(Ze.getInstance(this.firestore,t)):this._delegate.withConverter(null))}}class J_{constructor(t,e){this._firestore=t,this._delegate=e}get type(){return this._delegate.type}get doc(){return new kr(this._firestore,this._delegate.doc)}get oldIndex(){return this._delegate.oldIndex}get newIndex(){return this._delegate.newIndex}}class co{constructor(t,e){this._firestore=t,this._delegate=e}get query(){return new Dt(this._firestore,this._delegate.query)}get metadata(){return this._delegate.metadata}get size(){return this._delegate.size}get empty(){return this._delegate.empty}get docs(){return this._delegate.docs.map(t=>new kr(this._firestore,t))}docChanges(t){return this._delegate.docChanges(t).map(e=>new J_(this._firestore,e))}forEach(t,e){this._delegate.forEach(n=>{t.call(e,new kr(this._firestore,n))})}isEqual(t){return Hh(this._delegate,t._delegate)}}class Nn extends Dt{constructor(t,e){super(t,e),this.firestore=t,this._delegate=e}get id(){return this._delegate.id}get path(){return this._delegate.path}get parent(){const t=this._delegate.parent;return t?new Kt(this.firestore,t):null}doc(t){try{return t===void 0?new Kt(this.firestore,Bs(this._delegate)):new Kt(this.firestore,Bs(this._delegate,t))}catch(e){throw Nt(e,"doc()","CollectionReference.doc()")}}add(t){return k_(this._delegate,t).then(e=>new Kt(this.firestore,e))}isEqual(t){return Fh(this._delegate,t._delegate)}withConverter(t){return new Nn(this.firestore,t?this._delegate.withConverter(Ze.getInstance(this.firestore,t)):this._delegate.withConverter(null))}}function Ke(r){return J(r,ct)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fa{constructor(...t){this._delegate=new Re(...t)}static documentId(){return new fa(ot.keyField().canonicalString())}isEqual(t){return t=_t(t),t instanceof Re?this._delegate._internalPath.isEqual(t._internalPath):!1}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ue{constructor(t){this._delegate=t}static serverTimestamp(){const t=U_();return t._methodName="FieldValue.serverTimestamp",new Ue(t)}static delete(){const t=q_();return t._methodName="FieldValue.delete",new Ue(t)}static arrayUnion(...t){const e=G_(...t);return e._methodName="FieldValue.arrayUnion",new Ue(e)}static arrayRemove(...t){const e=K_(...t);return e._methodName="FieldValue.arrayRemove",new Ue(e)}static increment(t){const e=j_(t);return e._methodName="FieldValue.increment",new Ue(e)}isEqual(t){return this._delegate.isEqual(t._delegate)}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Y_={Firestore:Yh,GeoPoint:ti,Timestamp:ut,Blob:Dr,Transaction:Xh,WriteBatch:Zh,DocumentReference:Kt,DocumentSnapshot:Nr,Query:Dt,QueryDocumentSnapshot:kr,QuerySnapshot:co,CollectionReference:Nn,FieldPath:fa,FieldValue:Ue,setLogLevel:H_,CACHE_SIZE_UNLIMITED:r_};function X_(r,t){r.INTERNAL.registerComponent(new Cc("firestore-compat",e=>{const n=e.getProvider("app-compat").getImmediate(),s=e.getProvider("firestore").getImmediate();return t(n,s)},"PUBLIC").setServiceProps(Object.assign({},Y_)))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Z_(r){X_(r,(t,e)=>new Yh(t,e,new W_)),r.registerVersion(z_,Q_)}Z_(Kd);
