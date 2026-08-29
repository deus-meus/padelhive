import { s as sanitize_props, b as spread_props, c as slot, h as head, a as attr, d as derived } from "../../../../../chunks/index.js";
import "@sveltejs/kit/internal";
import "../../../../../chunks/exports.js";
import "../../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../../chunks/root.js";
import "../../../../../chunks/state.svelte.js";
import { p as page } from "../../../../../chunks/index2.js";
import { a as authStore } from "../../../../../chunks/store.svelte.js";
import { I as Icon } from "../../../../../chunks/Icon.js";
import { M as Mail } from "../../../../../chunks/mail.js";
import { L as Loader_circle } from "../../../../../chunks/loader-circle.js";
function User($$renderer, $$props) {
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
    ["path", { "d": "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" }],
    ["circle", { "cx": "12", "cy": "7", "r": "4" }]
  ];
  Icon($$renderer, spread_props([
    { name: "user" },
    $$sanitized_props,
    {
      /**
       * @component @name User
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTkgMjF2LTJhNCA0IDAgMCAwLTQtNEg5YTQgNCAwIDAgMC00IDR2MiIgLz4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjciIHI9IjQiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/user
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
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let name = "";
    let email = "";
    let password = "";
    const nextPath = derived(() => page.url.searchParams.get("next") || "/venues");
    head("nf1v16", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Sign Up - Padelhive</title>`);
      });
    });
    $$renderer2.push(`<div class="min-h-screen flex items-center justify-center px-4 py-20"><div class="w-full max-w-md"><div class="text-center mb-10"><a href="/" class="inline-block"><span class="font-heading text-3xl font-bold tracking-[-0.02em] text-[#F7F7F7]">Padel<span class="text-[#E6FA50]">hive</span></span></a> <p class="body-lg mt-3 text-[#F7F7F7]/40">Create an account to start booking courts.</p></div> <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-8"><h1 class="heading-2 text-[#F7F7F7] text-center mb-6">Sign Up</h1> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <form class="space-y-4 mb-6"><div class="relative">`);
    User($$renderer2, {
      class: "absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#F7F7F7]/25"
    });
    $$renderer2.push(`<!----> <input type="text" placeholder="Full Name"${attr("value", name)}${attr("disabled", authStore.isLoading, true)} required="" class="body w-full rounded-xl border border-white/[0.06] bg-white/[0.02] py-3 pl-11 pr-4 text-[#F7F7F7] placeholder:text-[#F7F7F7]/25 focus:border-[#E6FA50]/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"/></div> <div class="relative">`);
    Mail($$renderer2, {
      class: "absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#F7F7F7]/25"
    });
    $$renderer2.push(`<!----> <input type="email" placeholder="you@example.com"${attr("value", email)}${attr("disabled", authStore.isLoading, true)} required="" class="body w-full rounded-xl border border-white/[0.06] bg-white/[0.02] py-3 pl-11 pr-4 text-[#F7F7F7] placeholder:text-[#F7F7F7]/25 focus:border-[#E6FA50]/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"/></div> <div class="relative"><input type="password" placeholder="Password"${attr("value", password)}${attr("disabled", authStore.isLoading, true)} required=""${attr("minlength", 6)} class="body w-full rounded-xl border border-white/[0.06] bg-white/[0.02] py-3 px-4 text-[#F7F7F7] placeholder:text-[#F7F7F7]/25 focus:border-[#E6FA50]/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"/></div> <button type="submit"${attr("disabled", authStore.isLoading, true)} class="label btn-lime w-full flex items-center justify-center gap-2 rounded-xl py-3 disabled:cursor-not-allowed disabled:opacity-50 mt-2">`);
    if (authStore.isLoading) {
      $$renderer2.push("<!--[0-->");
      Loader_circle($$renderer2, { class: "h-4 w-4 animate-spin" });
    } else {
      $$renderer2.push(`<!--[-1-->Sign Up`);
    }
    $$renderer2.push(`<!--]--></button></form> <div class="body mt-4 flex flex-col items-center gap-2"><div class="text-[#F7F7F7]/40">Already have an account?  <a${attr("href", `/auth/login${nextPath() ? `?next=${encodeURIComponent(nextPath())}` : ""}`)} class="text-[#F7F7F7]/80 hover:text-[#E6FA50] transition-colors">Sign in</a></div></div></div></div></div>`);
  });
}
export {
  _page as default
};
