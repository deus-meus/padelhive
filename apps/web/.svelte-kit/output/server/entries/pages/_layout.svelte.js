import "clsx";
import { s as sanitize_props, b as spread_props, c as slot, f as escape_html, e as attr_class, a as attr, d as derived, g as stringify } from "../../chunks/index.js";
import "../../chunks/client.js";
import { a as authStore } from "../../chunks/store.svelte.js";
import { B as Bell } from "../../chunks/bell.js";
import { I as Icon } from "../../chunks/Icon.js";
import { T as Ticket, M as Menu } from "../../chunks/ticket.js";
function Calendar_days($$renderer, $$props) {
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
    ["path", { "d": "M8 2v4" }],
    ["path", { "d": "M16 2v4" }],
    [
      "rect",
      { "width": "18", "height": "18", "x": "3", "y": "4", "rx": "2" }
    ],
    ["path", { "d": "M3 10h18" }],
    ["path", { "d": "M8 14h.01" }],
    ["path", { "d": "M12 14h.01" }],
    ["path", { "d": "M16 14h.01" }],
    ["path", { "d": "M8 18h.01" }],
    ["path", { "d": "M12 18h.01" }],
    ["path", { "d": "M16 18h.01" }]
  ];
  Icon($$renderer, spread_props([
    { name: "calendar-days" },
    $$sanitized_props,
    {
      /**
       * @component @name CalendarDays
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNOCAydjQiIC8+CiAgPHBhdGggZD0iTTE2IDJ2NCIgLz4KICA8cmVjdCB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHg9IjMiIHk9IjQiIHJ4PSIyIiAvPgogIDxwYXRoIGQ9Ik0zIDEwaDE4IiAvPgogIDxwYXRoIGQ9Ik04IDE0aC4wMSIgLz4KICA8cGF0aCBkPSJNMTIgMTRoLjAxIiAvPgogIDxwYXRoIGQ9Ik0xNiAxNGguMDEiIC8+CiAgPHBhdGggZD0iTTggMThoLjAxIiAvPgogIDxwYXRoIGQ9Ik0xMiAxOGguMDEiIC8+CiAgPHBhdGggZD0iTTE2IDE4aC4wMSIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/calendar-days
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
function Log_in($$renderer, $$props) {
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
    ["path", { "d": "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" }],
    ["polyline", { "points": "10 17 15 12 10 7" }],
    ["line", { "x1": "15", "x2": "3", "y1": "12", "y2": "12" }]
  ];
  Icon($$renderer, spread_props([
    { name: "log-in" },
    $$sanitized_props,
    {
      /**
       * @component @name LogIn
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTUgM2g0YTIgMiAwIDAgMSAyIDJ2MTRhMiAyIDAgMCAxLTIgMmgtNCIgLz4KICA8cG9seWxpbmUgcG9pbnRzPSIxMCAxNyAxNSAxMiAxMCA3IiAvPgogIDxsaW5lIHgxPSIxNSIgeDI9IjMiIHkxPSIxMiIgeTI9IjEyIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/log-in
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
function Footer($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let year = (/* @__PURE__ */ new Date()).getFullYear();
    $$renderer2.push(`<footer class="border-t border-white/[0.04] bg-[#06121A]"><div class="container"><div class="grid grid-cols-1 gap-10 py-16 md:grid-cols-2 md:py-20 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-20"><div class="max-w-[320px]"><a href="/" class="inline-block"><span class="heading-3 text-[#F7F7F7]">Padel<span class="text-[#E6FA50]">hive</span></span></a> <p class="mt-5 body text-[#F7F7F7]/25">Indonesia's padel community platform. Book courts, join matches, meet
          players.</p> <div class="mt-8"><p class="section-label">Stay in the loop</p> <div class="mt-3 flex max-w-[280px]"><input type="email" placeholder="Your email" class="h-10 flex-1 min-w-0 rounded-l-lg border border-white/[0.08] bg-white/[0.03] px-4 body text-[#F7F7F7] outline-none placeholder:text-[#F7F7F7]/25 focus:border-[#E6FA50]/30"/> <button type="button" class="h-10 shrink-0 rounded-r-lg bg-[#E6FA50] px-4 label text-[#06121A] transition-colors hover:bg-[#d4e845]">Join</button></div></div></div> <div><h4 class="section-label mb-5">Navigation</h4> <ul class="space-y-3.5"><li><a href="/" class="label text-[#F7F7F7]/25 transition-colors hover:text-[#F7F7F7]/60">Home</a></li> <li><a href="/venues" class="label text-[#F7F7F7]/25 transition-colors hover:text-[#F7F7F7]/60">Venues</a></li> <li><a href="/venues#matches" class="label text-[#F7F7F7]/25 transition-colors hover:text-[#F7F7F7]/60">Open Matches</a></li> <li><a href="/#community" class="label text-[#F7F7F7]/25 transition-colors hover:text-[#F7F7F7]/60">Community</a></li> <li><a href="/venues" class="label text-[#F7F7F7]/25 transition-colors hover:text-[#F7F7F7]/60">Book a Court</a></li></ul></div> <div><h4 class="section-label mb-5">Company</h4> <ul class="space-y-3.5"><li><a href="/venues" class="label text-[#F7F7F7]/25 transition-colors hover:text-[#F7F7F7]/60">About</a></li> <li><a href="/venues" class="label text-[#F7F7F7]/25 transition-colors hover:text-[#F7F7F7]/60">Careers</a></li> <li><a href="/venues" class="label text-[#F7F7F7]/25 transition-colors hover:text-[#F7F7F7]/60">Blog</a></li> <li><a href="/dashboard" class="label text-[#F7F7F7]/25 transition-colors hover:text-[#F7F7F7]/60">List Your Venue</a></li></ul></div> <div><h4 class="section-label mb-5">Social</h4> <ul class="space-y-3.5"><li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer" class="label text-[#F7F7F7]/25 transition-colors hover:text-[#F7F7F7]/60">Instagram</a></li> <li><a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" class="label text-[#F7F7F7]/25 transition-colors hover:text-[#F7F7F7]/60">TikTok</a></li> <li><a href="https://wa.me" target="_blank" rel="noopener noreferrer" class="label text-[#F7F7F7]/25 transition-colors hover:text-[#F7F7F7]/60">WhatsApp</a></li> <li><a href="https://t.me" target="_blank" rel="noopener noreferrer" class="label text-[#F7F7F7]/25 transition-colors hover:text-[#F7F7F7]/60">Telegram</a></li></ul></div></div></div> <div class="container"><div class="border-t border-white/[0.04]"></div></div> <div class="overflow-hidden pt-16 pb-12 md:pt-20 md:pb-14"><p class="wordmark select-none text-center uppercase text-[#F7F7F7]/[0.1]">PADELHIVE</p></div> <div class="container"><div class="flex flex-col items-center justify-between gap-4 border-t border-white/[0.04] py-6 md:flex-row"><p class="caption text-[#F7F7F7]/25">© ${escape_html(year)} Padelhive. All rights reserved.</p> <div class="flex gap-6"><span class="caption text-[#F7F7F7]/25 cursor-default">Privacy</span> <span class="caption text-[#F7F7F7]/25 cursor-default">Terms</span></div></div></div></footer>`);
  });
}
function Notification_bell($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { enabled = true } = $$props;
    if (enabled) {
      $$renderer2.push(`<!--[0--><div class="relative"><button type="button" class="relative flex h-9 w-9 items-center justify-center rounded-full text-[#F7F7F7]/60 transition-colors hover:bg-white/[0.05] hover:text-[#F7F7F7]" aria-label="Notifications">`);
      Bell($$renderer2, { class: "h-[18px] w-[18px]" });
      $$renderer2.push(`<!----> `);
      {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></button> `);
      {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function Navbar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let activeVoucherCount = 0;
    const user = derived(() => authStore.user);
    const showDashboard = derived(() => user()?.role === "venue_owner" || user()?.role === "venue_admin");
    const showAdmin = derived(() => user()?.role === "super_admin");
    const isPlayer = derived(() => !!user() && !showDashboard() && !showAdmin());
    $$renderer2.push(`<header${attr_class(`fixed top-0 z-50 w-full transition-all duration-300 ease-out ${"bg-transparent backdrop-blur-none border-b border-transparent shadow-none"}`)}><div class="container flex h-20 items-center justify-between"><a href="/" class="flex items-center gap-2"><span class="heading-3 text-[#F7F7F7]">Padel<span class="text-[#E6FA50]">hive</span></span></a> `);
    if (!user()) {
      $$renderer2.push(`<!--[0--><nav class="hidden items-center gap-8 md:flex"><a href="/venues" class="label text-[#F7F7F7]/60 transition-colors duration-200 hover:text-[#F7F7F7]">Venues</a> <a href="/#how-it-works" class="label text-[#F7F7F7]/60 transition-colors duration-200 hover:text-[#F7F7F7]">How It Works</a> <a href="/#community" class="label text-[#F7F7F7]/60 transition-colors duration-200 hover:text-[#F7F7F7]">Community</a></nav>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="flex items-center gap-4">`);
    if (isPlayer()) {
      $$renderer2.push(`<!--[0--><div class="flex items-center gap-1"><a href="/bookings" aria-label="Bookings"${attr("title", "No upcoming bookings")} class="relative flex h-9 w-9 items-center justify-center rounded-full text-[#F7F7F7]/60 transition-colors hover:bg-white/[0.05] hover:text-[#F7F7F7]">`);
      Calendar_days($$renderer2, { class: "h-[18px] w-[18px]" });
      $$renderer2.push(`<!----> `);
      {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></a> <a href="/vouchers" aria-label="Vouchers"${attr("title", `${stringify(activeVoucherCount)} active voucher${"s"}`)} class="relative flex h-9 w-9 items-center justify-center rounded-full text-[#F7F7F7]/60 transition-colors hover:bg-white/[0.05] hover:text-[#F7F7F7]">`);
      Ticket($$renderer2, { class: "h-[18px] w-[18px]" });
      $$renderer2.push(`<!----> `);
      {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></a></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (user()) {
      $$renderer2.push("<!--[0-->");
      Notification_bell($$renderer2, { enabled: !!user() });
      $$renderer2.push(`<!----> <div class="relative"><button type="button" class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-transparent transition-all hover:border-[#E6FA50]/30">`);
      if (user().avatarUrl) {
        $$renderer2.push(`<!--[0--><img${attr("src", user().avatarUrl)}${attr("alt", user().name)} class="h-full w-full rounded-full object-cover"/>`);
      } else {
        $$renderer2.push(`<!--[-1--><span class="flex h-full w-full items-center justify-center rounded-full bg-[#E6FA50]/10 label text-[#E6FA50]">${escape_html(user().name?.trim().charAt(0).toUpperCase() || "?")}</span>`);
      }
      $$renderer2.push(`<!--]--></button> `);
      {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push(`<!--[-1--><a href="/auth/login" class="btn-lime hidden h-10 items-center gap-2 rounded-full px-6 label md:inline-flex">`);
      Log_in($$renderer2, { class: "h-4 w-4" });
      $$renderer2.push(`<!----> Sign In</a>`);
    }
    $$renderer2.push(`<!--]--> `);
    if (!user()) {
      $$renderer2.push(`<!--[0--><button type="button" class="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-[#F7F7F7] md:hidden" aria-label="Toggle menu">`);
      {
        $$renderer2.push("<!--[-1-->");
        Menu($$renderer2, { class: "h-5 w-5" });
      }
      $$renderer2.push(`<!--]--></button>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></div> `);
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
  $$renderer.push(`<!----> <main class="flex-1">`);
  children?.($$renderer);
  $$renderer.push(`<!----></main> `);
  Footer($$renderer);
  $$renderer.push(`<!----></div>`);
}
export {
  _layout as default
};
