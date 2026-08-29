import{c as W,a as s,f as v,s as w}from"../chunks/DwSE8PD_.js";import{o as tt}from"../chunks/DkKgBDKw.js";import{f as h,p as et,a as at,s as S,h as st,b as B,$ as rt,c as x,e as a,g as p,r as d,n as O,o as g,t as E}from"../chunks/DEmgJoGz.js";import{i as ot}from"../chunks/CzDZh6pr.js";import{I as M,s as q,e as L,i as U,j as it}from"../chunks/DOLNROuf.js";import{h as nt,C as y}from"../chunks/CxJ9-2wH.js";import{a as lt}from"../chunks/B0YbMC-O.js";import{a as dt}from"../chunks/B9a2DNUd.js";import{S as T}from"../chunks/Bztf074v.js";import{D as ct}from"../chunks/CjyEKBRK.js";import{C as pt}from"../chunks/DrFpKN-e.js";import{l as G,s as H}from"../chunks/DpVMer4V.js";function vt(b,m){const r=G(m,["children","$$slots","$$events","$$legacy"]);/**
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
 */const $=[["rect",{width:"7",height:"7",x:"3",y:"3",rx:"1"}],["rect",{width:"7",height:"7",x:"14",y:"3",rx:"1"}],["rect",{width:"7",height:"7",x:"14",y:"14",rx:"1"}],["rect",{width:"7",height:"7",x:"3",y:"14",rx:"1"}]];M(b,H({name:"layout-grid"},()=>r,{get iconNode(){return $},children:(k,A)=>{var _=W(),P=h(_);q(P,m,"default",{}),s(k,_)},$$slots:{default:!0}}))}function ft(b,m){const r=G(m,["children","$$slots","$$events","$$legacy"]);/**
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
 */const $=[["polyline",{points:"22 7 13.5 15.5 8.5 10.5 2 17"}],["polyline",{points:"16 7 22 7 22 13"}]];M(b,H({name:"trending-up"},()=>r,{get iconNode(){return $},children:(k,A)=>{var _=W(),P=h(_);q(P,m,"default",{}),s(k,_)},$$slots:{default:!0}}))}var xt=v("<!> <!>",1),ht=v('<div class="grid grid-cols-2 gap-4 md:grid-cols-4"></div>'),_t=v('<span class="text-xs font-semibold text-white/50 flex items-center gap-1.5"><!> Weekly Revenue</span> <p class="text-2xl font-extrabold text-white"> </p>',1),ut=v('<span class="text-xs font-semibold text-white/50 flex items-center gap-1.5"><!> Weekly Bookings</span> <p class="text-2xl font-extrabold text-white"> </p>',1),mt=v('<span class="text-xs font-semibold text-white/50 flex items-center gap-1.5"><!> Occupancy Rate</span> <p class="text-2xl font-extrabold text-[#E6FA50]"> </p>',1),$t=v('<span class="text-xs font-semibold text-white/50 flex items-center gap-1.5"><!> Active Courts</span> <p class="text-2xl font-extrabold text-white"> </p>',1),gt=v('<div class="space-y-1"><div class="flex justify-between text-xs"><span class="font-medium text-white/80"> </span> <span class="font-semibold text-[#E6FA50]"> </span></div> <div class="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]"><div class="h-full bg-[#E6FA50] transition-all"></div></div></div>'),wt=v('<h3 class="text-base font-bold text-white">Court Utilization</h3> <div class="space-y-3"></div>',1),yt=v('<div class="grid grid-cols-2 gap-4 md:grid-cols-4"><!> <!> <!> <!></div> <!>',1),bt=v('<div class="py-12 bg-[#06121A]"><div class="container space-y-8"><div><h1 class="text-3xl font-extrabold text-white">Owner Dashboard</h1> <p class="mt-1 text-xs text-white/60">Overview of venue performance, occupancy, and revenue</p></div> <!></div></div>');function St(b,m){et(m,!0);let r=B(null),$=B(!0);async function k(){var c;S($,!0);try{const o=await((c=dt.firebaseUser)==null?void 0:c.getIdToken());if(!o)return;const u=await lt.bookings["owner-dashboard"].get({headers:{authorization:`Bearer ${o}`}});u.data&&S(r,u.data,!0)}catch(o){console.warn("Owner dashboard error:",o)}finally{S($,!1)}}tt(()=>{k()});var A=bt();nt("x1i5gj",c=>{st(()=>{rt.title="Owner Dashboard - Padelhive"})});var _=x(A),P=a(x(_),2);{var J=c=>{var o=ht();L(o,20,()=>[1,2,3,4],U,(u,I)=>{y(u,{class:"p-6 space-y-2",children:(F,N)=>{var R=xt(),D=h(R);T(D,{class:"h-4 w-1/2"});var i=a(D,2);T(i,{class:"h-8 w-3/4"}),s(F,R)},$$slots:{default:!0}})}),d(o),s(c,o)},K=c=>{var o=yt(),u=h(o),I=x(u);y(I,{class:"p-5 space-y-1",children:(i,z)=>{var e=_t(),t=h(e),f=x(t);ct(f,{class:"h-4 w-4 text-[#E6FA50]"}),O(),d(t);var n=a(t,2),l=g(n);E(C=>w(l,`Rp ${C??""}`),[()=>p(r).kpis.weeklyRevenue.toLocaleString("id-ID")]),s(i,e)},$$slots:{default:!0}});var F=a(I,2);y(F,{class:"p-5 space-y-1",children:(i,z)=>{var e=ut(),t=h(e),f=x(t);pt(f,{class:"h-4 w-4 text-[#E6FA50]"}),O(),d(t);var n=a(t,2),l=g(n,!0);E(()=>w(l,p(r).kpis.weeklyBookings)),s(i,e)},$$slots:{default:!0}});var N=a(F,2);y(N,{class:"p-5 space-y-1",children:(i,z)=>{var e=mt(),t=h(e),f=x(t);ft(f,{class:"h-4 w-4 text-[#E6FA50]"}),O(),d(t);var n=a(t,2),l=g(n);E(()=>w(l,`${p(r).kpis.occupancyRate??""}%`)),s(i,e)},$$slots:{default:!0}});var R=a(N,2);y(R,{class:"p-5 space-y-1",children:(i,z)=>{var e=$t(),t=h(e),f=x(t);vt(f,{class:"h-[#4] w-4 text-[#E6FA50]"}),O(),d(t);var n=a(t,2),l=g(n,!0);E(()=>w(l,p(r).kpis.activeCourts)),s(i,e)},$$slots:{default:!0}}),d(u);var D=a(u,2);y(D,{class:"p-6 space-y-4",children:(i,z)=>{var e=wt(),t=a(h(e),2);L(t,21,()=>p(r).courtUtilization,U,(f,n)=>{var l=gt(),C=x(l),j=x(C),Q=g(j,!0),V=a(j,2),X=g(V);d(C);var Y=a(C,2),Z=g(Y);d(l),E(()=>{w(Q,p(n).name),w(X,`${p(n).occupancyRate??""}%`),it(Z,`width: ${p(n).occupancyRate??""}%`)}),s(f,l)}),d(t),s(i,e)},$$slots:{default:!0}}),s(c,o)};ot(P,c=>{p($)?c(J):p(r)&&c(K,1)})}d(_),d(A),s(b,A),at()}export{St as component};
