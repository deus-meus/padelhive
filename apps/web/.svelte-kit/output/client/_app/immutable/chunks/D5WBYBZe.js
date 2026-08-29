import{c as w,a as n,d as B,s as c,f as v,b as C}from"./KG8wk5Dx.js";import{f as I,d as A,r as E,s as p,o as d,t as f}from"./DGn0PapR.js";import{l as M,s as P,p as q,i as h}from"./DXWOU0CT.js";import{c as D}from"./BL3b4gsM.js";import{I as G,c as J,b as K}from"./B8z-fa9t.js";function O(m,t){const b=M(t,["children","$$slots","$$events","$$legacy"]);/**
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
 */const i=[["polyline",{points:"22 12 16 12 14 15 10 15 8 12 2 12"}],["path",{d:"M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"}]];G(m,P({name:"inbox"},()=>b,{get iconNode(){return i},children:(s,g)=>{var l=w(),u=I(l);J(u,t,"default",{}),n(s,l)},$$slots:{default:!0}}))}var Q=v('<p class="mt-1.5 max-w-sm body text-[#F7F7F7]/40"> </p>'),R=v('<a class="mt-6 inline-flex h-10 items-center gap-2 rounded-full bg-[#E6FA50] px-6 font-semibold label text-[#0A1628] hover:bg-[#E6FA50]/90 transition-colors"> </a>'),S=v('<button type="button" class="mt-6 inline-flex h-10 items-center gap-2 rounded-full bg-[#E6FA50] px-6 font-semibold label text-[#0A1628] hover:bg-[#E6FA50]/90 transition-colors"> </button>'),T=v('<div class="flex min-h-[360px] w-full flex-1 flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-[#0C1B26] px-6 py-16 text-center"><div class="flex h-14 w-14 items-center justify-center rounded-full bg-[#E6FA50]/10"><!></div> <p class="mt-5 heading-3 text-[#F7F7F7]"> </p> <!> <!></div>');function Z(m,t){let b=q(t,"icon",3,O);var i=T(),s=A(i),g=A(s);D(g,b,(e,a)=>{a(e,{class:"h-6 w-6 text-[#E6FA50]"})}),E(s);var l=p(s,2),u=d(l,!0),F=p(l,2);{var k=e=>{var a=Q(),x=d(a,!0);f(()=>c(x,t.description)),n(e,a)};h(F,e=>{t.description&&e(k)})}var H=p(F,2);{var L=e=>{var a=w(),x=I(a);{var j=r=>{var o=R(),_=d(o,!0);f(()=>{K(o,"href",t.actionHref),c(_,t.actionLabel)}),n(r,o)},z=r=>{var o=S(),_=d(o,!0);f(()=>c(_,t.actionLabel)),C("click",o,function(...N){var y;(y=t.onAction)==null||y.apply(this,N)}),n(r,o)};h(x,r=>{t.actionHref?r(j):r(z,-1)})}n(e,a)};h(H,e=>{t.actionLabel&&e(L)})}E(i),f(()=>c(u,t.title)),n(m,i)}B(["click"]);export{Z as E};
