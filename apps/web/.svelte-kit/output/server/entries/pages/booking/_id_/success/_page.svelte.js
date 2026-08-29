import { s as sanitize_props, b as spread_props, c as slot, h as head, d as escape_html, a as attr, f as stringify, g as derived, i as store_get, u as unsubscribe_stores } from "../../../../../chunks/index.js";
import { p as page } from "../../../../../chunks/stores.js";
import { C as Card } from "../../../../../chunks/card.js";
import { I as Icon } from "../../../../../chunks/Icon.js";
import { U as Users } from "../../../../../chunks/users.js";
import { A as Arrow_right } from "../../../../../chunks/arrow-right.js";
function Circle_check($$renderer, $$props) {
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
    ["circle", { "cx": "12", "cy": "12", "r": "10" }],
    ["path", { "d": "m9 12 2 2 4-4" }]
  ];
  Icon($$renderer, spread_props([
    { name: "circle-check" },
    $$sanitized_props,
    {
      /**
       * @component @name CircleCheck
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgLz4KICA8cGF0aCBkPSJtOSAxMiAyIDIgNC00IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/circle-check
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
    var $$store_subs;
    const bookingId = derived(() => store_get($$store_subs ??= {}, "$page", page).params.id || "");
    head("nz72sg", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Booking Confirmed! - Padelhive</title>`);
      });
    });
    $$renderer2.push(`<div class="py-16 bg-[#06121A]"><div class="container max-w-md space-y-6 text-center">`);
    Card($$renderer2, {
      class: "p-8 space-y-6",
      children: ($$renderer3) => {
        $$renderer3.push(`<div class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mx-auto">`);
        Circle_check($$renderer3, { class: "h-10 w-10" });
        $$renderer3.push(`<!----></div> <div class="space-y-2"><h1 class="text-2xl font-extrabold text-white">Booking Confirmed!</h1> <p class="text-xs text-white/60">Your court reservation has been locked and confirmed. Get ready to play!</p></div> <div class="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-xs font-mono text-white/70">Booking Reference: <span class="font-bold text-[#E6FA50]">#${escape_html(bookingId().slice(0, 8))}</span></div> <div class="flex flex-col gap-3 pt-2"><a${attr("href", `/booking/${stringify(bookingId())}/invite`)} class="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E6FA50] px-5 py-3 text-sm font-bold text-[#06121A] shadow-[0_0_20px_rgba(230,250,80,0.3)]">`);
        Users($$renderer3, { class: "h-4 w-4" });
        $$renderer3.push(`<!----> Invite Friends &amp; Split Bill</a> <a${attr("href", `/bookings/${stringify(bookingId())}`)} class="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:bg-white/5">View Reservation Details `);
        Arrow_right($$renderer3, { class: "h-4 w-4" });
        $$renderer3.push(`<!----></a></div>`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
