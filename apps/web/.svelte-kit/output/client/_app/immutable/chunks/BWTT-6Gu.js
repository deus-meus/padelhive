import{c as L,a as u,d as X,b as I,f as z,s as O}from"./KG8wk5Dx.js";import{I as M,c as q,s as w,b as P,e as Y}from"./B8z-fa9t.js";import{f as R,p as Z,g as a,b as _,t as A,a as ee,c as B,s as F,d as x,r as c,u as C,o as te}from"./DGn0PapR.js";import{l as D,s as G,p as N,i as $}from"./DXWOU0CT.js";import{o as ae}from"./Co0xPbJ1.js";import{c as ne}from"./BL3b4gsM.js";import{b as oe}from"./DvpNY47O.js";import{C as se}from"./BC2vCuYt.js";function re(v,e){const f=D(e,["children","$$slots","$$events","$$legacy"]);/**
 * @license lucide-svelte v0.475.0 - ISC
 *
 * ISC License
 *
 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 */const m=[["path",{d:"m6 9 6 6 6-6"}]];M(v,G({name:"chevron-down"},()=>f,{get iconNode(){return m},children:(h,n)=>{var o=L(),i=R(o);q(i,e,"default",{}),u(h,o)},$$slots:{default:!0}}))}function ge(v,e){const f=D(e,["children","$$slots","$$events","$$legacy"]);/**
 * @license lucide-svelte v0.475.0 - ISC
 *
 * ISC License
 *
 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 */const m=[["circle",{cx:"11",cy:"11",r:"8"}],["path",{d:"m21 21-4.3-4.3"}]];M(v,G({name:"search"},()=>f,{get iconNode(){return m},children:(h,n)=>{var o=L(),i=R(o);q(i,e,"default",{}),u(h,o)},$$slots:{default:!0}}))}var ie=z('<button type="button" role="option"><span class="label block truncate pr-4"> </span> <!></button>'),le=z('<div role="listbox" tabindex="-1"><div class="max-h-60 overflow-y-auto p-1"></div></div>'),de=z('<div><button type="button" aria-haspopup="listbox"><span class="flex items-center gap-2"><!> </span> <!></button> <!></div>');function _e(v,e){Z(e,!0);let f=N(e,"active",3,!1),m=N(e,"alignRight",3,!1),h=N(e,"class",3,""),n=B(!1),o=B(null);const i=C(()=>e.options.find(t=>t.value===e.value));ae(()=>{function t(r){a(o)&&!a(o).contains(r.target)&&_(n,!1)}function s(r){r.key==="Escape"&&_(n,!1)}return document.addEventListener("mousedown",t),document.addEventListener("keydown",s),()=>{document.removeEventListener("mousedown",t),document.removeEventListener("keydown",s)}});var b=de(),l=x(b),y=x(l),S=x(y);{var H=t=>{var s=L(),r=R(s);ne(r,()=>e.icon,(p,g)=>{g(p,{class:"h-4 w-4 shrink-0 opacity-60 text-[#E6FA50]"})}),u(t,s)};$(S,t=>{e.icon&&t(H)})}var J=F(S);c(y);var K=F(y,2);{let t=C(()=>a(n)?"rotate-180 text-[#E6FA50]":"");re(K,{get class(){return`h-4 w-4 shrink-0 opacity-50 transition-transform duration-200 ${a(t)??""}`}})}c(l);var Q=F(l,2);{var T=t=>{var s=le(),r=x(s);Y(r,21,()=>e.options,p=>p.value,(p,g)=>{const k=C(()=>a(g).value===e.value);var d=ie(),j=x(d),U=te(j,!0),V=F(j,2);{var W=E=>{se(E,{class:"h-4 w-4 shrink-0 text-[#E6FA50]"})};$(V,E=>{a(k)&&E(W)})}c(d),A(()=>{P(d,"aria-selected",a(k)),w(d,1,`flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-left transition-colors ${a(k)?"bg-[#E6FA50]/10 text-[#E6FA50] font-semibold":"text-[#F7F7F7]/80 hover:bg-white/[0.06] hover:text-[#F7F7F7]"}`),O(U,a(g).label)}),I("click",d,()=>{e.onChange(a(g).value),_(n,!1)}),u(p,d)}),c(r),c(s),A(()=>w(s,1,`absolute top-full z-50 mt-2 w-max min-w-full overflow-hidden rounded-xl border border-white/[0.08] bg-[#0C1B26] shadow-2xl ${m()?"right-0 origin-top-right":"left-0 origin-top-left"}`)),u(t,s)};$(Q,t=>{a(n)&&t(T)})}c(b),oe(b,t=>_(o,t),()=>a(o)),A(()=>{w(b,1,`relative inline-block text-left shrink-0 ${h()??""}`),P(l,"aria-expanded",a(n)),w(l,1,`label flex w-full h-10 items-center justify-between gap-2 rounded-full px-4 transition-all duration-200 border ${f()?"border-[#E6FA50]/40 bg-[#E6FA50]/[0.06] text-[#E6FA50]":"border-transparent bg-white/[0.03] text-[#F7F7F7]/60 hover:bg-white/[0.06]"}`),O(J,` ${(a(i)?a(i).label:e.label)??""}`)}),I("click",l,()=>_(n,!a(n))),u(v,b),ee()}X(["click"]);export{re as C,_e as F,ge as S};
