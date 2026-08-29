import { s as sanitize_props, b as spread_props, c as slot, h as head, a as attr, d as derived } from "../../../../../chunks/index.js";
import "@sveltejs/kit/internal";
import "../../../../../chunks/exports.js";
import "../../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../../chunks/root.js";
import "../../../../../chunks/state.svelte.js";
import { p as page } from "../../../../../chunks/index2.js";
import { a as authStore } from "../../../../../chunks/store.svelte.js";
import { L as Loader_circle } from "../../../../../chunks/loader-circle.js";
import { M as Mail } from "../../../../../chunks/mail.js";
import { I as Icon } from "../../../../../chunks/Icon.js";
function Lock($$renderer, $$props) {
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
      {
        "width": "18",
        "height": "11",
        "x": "3",
        "y": "11",
        "rx": "2",
        "ry": "2"
      }
    ],
    ["path", { "d": "M7 11V7a5 5 0 0 1 10 0v4" }]
  ];
  Icon($$renderer, spread_props([
    { name: "lock" },
    $$sanitized_props,
    {
      /**
       * @component @name Lock
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cmVjdCB3aWR0aD0iMTgiIGhlaWdodD0iMTEiIHg9IjMiIHk9IjExIiByeD0iMiIgcnk9IjIiIC8+CiAgPHBhdGggZD0iTTcgMTFWN2E1IDUgMCAwIDEgMTAgMHY0IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/lock
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
    let email = "";
    let password = "";
    const nextParam = derived(() => page.url.searchParams.get("next"));
    head("1va3k2h", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Sign In - Padelhive</title>`);
      });
    });
    $$renderer2.push(`<div class="min-h-screen flex items-center justify-center px-4 py-20"><div class="w-full max-w-md"><div class="text-center mb-10"><a href="/" class="inline-block"><span class="font-heading text-3xl font-bold tracking-[-0.02em] text-[#F7F7F7]">Padel<span class="text-[#E6FA50]">hive</span></span></a> <p class="body-lg mt-3 text-[#F7F7F7]/40">Book padel courts in seconds. Play more, wait less.</p></div> <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-8"><h1 class="heading-2 text-[#F7F7F7] text-center mb-6">Sign In</h1> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <button type="button"${attr("disabled", authStore.isLoading, true)} class="label w-full flex items-center justify-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] py-3.5 text-[#F7F7F7] transition-all hover:border-white/[0.15] hover:bg-white/[0.04] disabled:opacity-50">`);
    if (authStore.isLoading) {
      $$renderer2.push("<!--[0-->");
      Loader_circle($$renderer2, { class: "h-4 w-4 animate-spin" });
    } else {
      $$renderer2.push(`<!--[-1--><svg class="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path></svg>`);
    }
    $$renderer2.push(`<!--]--> Continue with Google</button> <div class="my-6 flex items-center gap-4"><div class="flex-1 border-t border-white/[0.06]"></div> <span class="caption text-[#F7F7F7]/25">or</span> <div class="flex-1 border-t border-white/[0.06]"></div></div> <form class="space-y-4 mb-4"><div class="relative">`);
    Mail($$renderer2, {
      class: "absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#F7F7F7]/25"
    });
    $$renderer2.push(`<!----> <input type="email" placeholder="you@example.com"${attr("value", email)}${attr("disabled", authStore.isLoading, true)} required="" class="body w-full rounded-xl border border-white/[0.06] bg-white/[0.02] py-3 pl-11 pr-4 text-[#F7F7F7] placeholder:text-[#F7F7F7]/25 focus:border-[#E6FA50]/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"/></div> <div class="relative">`);
    Lock($$renderer2, {
      class: "absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#F7F7F7]/25"
    });
    $$renderer2.push(`<!----> <input type="password" placeholder="Password"${attr("value", password)}${attr("disabled", authStore.isLoading, true)} required="" class="body w-full rounded-xl border border-white/[0.06] bg-white/[0.02] py-3 pl-11 pr-4 text-[#F7F7F7] placeholder:text-[#F7F7F7]/25 focus:border-[#E6FA50]/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"/></div> <button type="submit"${attr("disabled", authStore.isLoading, true)} class="label btn-lime w-full flex items-center justify-center gap-2 rounded-xl py-3 disabled:cursor-not-allowed disabled:opacity-50">`);
    if (authStore.isLoading) {
      $$renderer2.push("<!--[0-->");
      Loader_circle($$renderer2, { class: "h-4 w-4 animate-spin" });
    } else {
      $$renderer2.push(`<!--[-1-->Sign In`);
    }
    $$renderer2.push(`<!--]--></button></form> <div class="body mt-4 flex flex-col items-center gap-2"><a href="/auth/forgot-password" class="text-[#F7F7F7]/60 hover:text-[#E6FA50] transition-colors">Forgot password?</a> <div class="text-[#F7F7F7]/40">Don't have an account?  <a${attr("href", `/auth/signup${nextParam() ? `?next=${encodeURIComponent(nextParam())}` : ""}`)} class="text-[#F7F7F7]/80 hover:text-[#E6FA50] transition-colors">Sign up</a></div></div></div> <p class="mt-6 text-center caption text-[#F7F7F7]/25">By signing in, you agree to our Terms of Service and Privacy Policy.</p></div></div>`);
  });
}
export {
  _page as default
};
