import "clsx";
import { s as sanitize_props, b as spread_props, c as slot, d as escape_html } from "../../chunks/index.js";
import { a as authStore } from "../../chunks/store.svelte.js";
import { I as Icon } from "../../chunks/Icon.js";
import { S as Shield } from "../../chunks/shield.js";
import { B as Bell } from "../../chunks/bell.js";
function Layout_dashboard($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
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
   */
  const iconNode = [
    [
      "rect",
      { "width": "7", "height": "9", "x": "3", "y": "3", "rx": "1" }
    ],
    [
      "rect",
      { "width": "7", "height": "5", "x": "14", "y": "3", "rx": "1" }
    ],
    [
      "rect",
      { "width": "7", "height": "9", "x": "14", "y": "12", "rx": "1" }
    ],
    [
      "rect",
      { "width": "7", "height": "5", "x": "3", "y": "16", "rx": "1" }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "layout-dashboard" },
    $$sanitized_props,
    {
      /**
       * @component @name LayoutDashboard
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cmVjdCB3aWR0aD0iNyIgaGVpZ2h0PSI5IiB4PSIzIiB5PSIzIiByeD0iMSIgLz4KICA8cmVjdCB3aWR0aD0iNyIgaGVpZ2h0PSI1IiB4PSIxNCIgeT0iMyIgcng9IjEiIC8+CiAgPHJlY3Qgd2lkdGg9IjciIGhlaWdodD0iOSIgeD0iMTQiIHk9IjEyIiByeD0iMSIgLz4KICA8cmVjdCB3aWR0aD0iNyIgaGVpZ2h0PSI1IiB4PSIzIiB5PSIxNiIgcng9IjEiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/layout-dashboard
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Log_out($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
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
   */
  const iconNode = [
    ["path", { "d": "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }],
    ["polyline", { "points": "16 17 21 12 16 7" }],
    ["line", { "x1": "21", "x2": "9", "y1": "12", "y2": "12" }]
  ];
  Icon($$renderer, spread_props([
    { name: "log-out" },
    $$sanitized_props,
    {
      /**
       * @component @name LogOut
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNOSAyMUg1YTIgMiAwIDAgMS0yLTJWNWEyIDIgMCAwIDEgMi0yaDQiIC8+CiAgPHBvbHlsaW5lIHBvaW50cz0iMTYgMTcgMjEgMTIgMTYgNyIgLz4KICA8bGluZSB4MT0iMjEiIHgyPSI5IiB5MT0iMTIiIHkyPSIxMiIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/log-out
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Menu($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
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
   */
  const iconNode = [
    ["line", { "x1": "4", "x2": "20", "y1": "12", "y2": "12" }],
    ["line", { "x1": "4", "x2": "20", "y1": "6", "y2": "6" }],
    ["line", { "x1": "4", "x2": "20", "y1": "18", "y2": "18" }]
  ];
  Icon($$renderer, spread_props([
    { name: "menu" },
    $$sanitized_props,
    {
      /**
       * @component @name Menu
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8bGluZSB4MT0iNCIgeDI9IjIwIiB5MT0iMTIiIHkyPSIxMiIgLz4KICA8bGluZSB4MT0iNCIgeDI9IjIwIiB5MT0iNiIgeTI9IjYiIC8+CiAgPGxpbmUgeDE9IjQiIHgyPSIyMCIgeTE9IjE4IiB5Mj0iMTgiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/menu
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Footer($$renderer) {
  $$renderer.push(`<footer class="border-t border-white/[0.06] bg-[#06121A] py-12 text-[#F7F7F7]"><div class="container grid grid-cols-1 gap-8 md:grid-cols-4"><div class="space-y-3"><div class="flex items-center gap-2"><div class="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E6FA50] font-bold text-[#06121A]">P</div> <span class="font-heading text-lg font-bold tracking-tight text-[#F7F7F7]">PADELHIVE</span></div> <p class="text-xs text-white/50 leading-relaxed max-w-xs">The premium marketplace for padel court bookings. Discover venues, book instantly, and play with friends.</p></div> <div><h4 class="text-sm font-semibold text-white">Platform</h4> <ul class="mt-3 space-y-2 text-xs text-white/60"><li><a href="/venues" class="hover:text-[#E6FA50] transition-colors">Browse Venues</a></li> <li><a href="/vouchers" class="hover:text-[#E6FA50] transition-colors">Vouchers &amp; Promos</a></li> <li><a href="/bookings" class="hover:text-[#E6FA50] transition-colors">My Bookings</a></li></ul></div> <div><h4 class="text-sm font-semibold text-white">Partners &amp; Owners</h4> <ul class="mt-3 space-y-2 text-xs text-white/60"><li><a href="/dashboard" class="hover:text-[#E6FA50] transition-colors">Venue Dashboard</a></li> <li><a href="/auth/signup" class="hover:text-[#E6FA50] transition-colors">List Your Venue</a></li></ul></div> <div><h4 class="text-sm font-semibold text-white">Support &amp; Legal</h4> <ul class="mt-3 space-y-2 text-xs text-white/60"><li><a href="/notifications" class="hover:text-[#E6FA50] transition-colors">Notifications</a></li> <li><span class="text-white/40">Terms &amp; Policy</span></li></ul></div></div> <div class="container mt-8 border-t border-white/[0.04] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-white/40"><p>© 2026 Padelhive. All rights reserved.</p> <p class="mt-2 sm:mt-0">Powered by Bun, ElysiaJS &amp; SvelteKit 2</p></div></footer>`);
}
function Navbar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    $$renderer2.push(`<header class="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#06121A]/80 backdrop-blur-xl"><div class="container flex h-16 items-center justify-between"><a href="/" class="flex items-center gap-2.5 transition-opacity hover:opacity-90"><div class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E6FA50] text-[#06121A] shadow-[0_0_20px_rgba(230,250,80,0.3)] font-bold">P</div> <span class="font-heading text-lg font-bold tracking-tight text-[#F7F7F7]">PADELHIVE</span></a> <nav class="hidden items-center gap-6 md:flex"><a href="/venues" class="text-sm font-medium text-white/70 hover:text-[#E6FA50] transition-colors">Venues</a> <a href="/vouchers" class="text-sm font-medium text-white/70 hover:text-[#E6FA50] transition-colors">Vouchers</a> `);
    if (authStore.user) {
      $$renderer2.push(`<!--[0--><a href="/bookings" class="text-sm font-medium text-white/70 hover:text-[#E6FA50] transition-colors">My Bookings</a> `);
      if (authStore.user.role === "venue_owner" || authStore.user.role === "venue_admin" || authStore.user.role === "super_admin") {
        $$renderer2.push(`<!--[0--><a href="/dashboard" class="flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-[#E6FA50] transition-colors">`);
        Layout_dashboard($$renderer2, { class: "h-4 w-4" });
        $$renderer2.push(`<!----> Dashboard</a>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (authStore.user.role === "super_admin") {
        $$renderer2.push(`<!--[0--><a href="/admin" class="flex items-center gap-1.5 text-sm font-medium text-[#E6FA50] hover:text-[#E6FA50]/80 transition-colors">`);
        Shield($$renderer2, { class: "h-4 w-4" });
        $$renderer2.push(`<!----> Super Admin</a>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></nav> <div class="hidden items-center gap-3 md:flex">`);
    if (authStore.user) {
      $$renderer2.push(`<!--[0--><a href="/notifications" aria-label="Notifications" class="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/80 hover:bg-white/[0.08] hover:text-white transition-all">`);
      Bell($$renderer2, { class: "h-4 w-4" });
      $$renderer2.push(`<!----></a> <div class="flex items-center gap-3 pl-2"><div class="flex flex-col text-right"><span class="text-sm font-semibold text-[#F7F7F7]">${escape_html(authStore.user.name)}</span> <span class="text-[10px] font-medium text-white/40 uppercase tracking-wider">${escape_html(authStore.user.role)}</span></div> <button type="button" aria-label="Log out" class="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/60 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 transition-all" title="Log Out">`);
      Log_out($$renderer2, { class: "h-4 w-4" });
      $$renderer2.push(`<!----></button></div>`);
    } else {
      $$renderer2.push(`<!--[-1--><a href="/auth/login" class="text-sm font-medium text-white/80 hover:text-white transition-colors px-3 py-2">Sign In</a> <a href="/auth/signup" class="inline-flex items-center justify-center rounded-xl bg-[#E6FA50] px-4 py-2 text-sm font-semibold text-[#06121A] shadow-[0_0_20px_rgba(230,250,80,0.25)] hover:bg-[#d4e845] transition-all">Book Court</a>`);
    }
    $$renderer2.push(`<!--]--></div> <button type="button" aria-label="Toggle Menu" class="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/80 md:hidden">`);
    {
      $$renderer2.push("<!--[-1-->");
      Menu($$renderer2, { class: "h-5 w-5" });
    }
    $$renderer2.push(`<!--]--></button></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></header>`);
  });
}
function _layout($$renderer, $$props) {
  let { children } = $$props;
  $$renderer.push(`<div class="flex min-h-screen flex-col bg-[#06121A] text-[#F7F7F7]">`);
  Navbar($$renderer);
  $$renderer.push(`<!----> <main class="flex-1 pt-16">`);
  children?.($$renderer);
  $$renderer.push(`<!----></main> `);
  Footer($$renderer);
  $$renderer.push(`<!----></div>`);
}
export {
  _layout as default
};
