import { s as sanitize_props, b as spread_props, c as slot, h as head, a as attr, f as stringify, d as escape_html, g as derived, i as store_get, u as unsubscribe_stores } from "../../../../../chunks/index.js";
import { p as page } from "../../../../../chunks/stores.js";
import "../../../../../chunks/client.js";
import "../../../../../chunks/store.svelte.js";
import { B as Button } from "../../../../../chunks/button.js";
import { C as Card } from "../../../../../chunks/card.js";
import { S as Skeleton } from "../../../../../chunks/skeleton.js";
import { A as Arrow_left } from "../../../../../chunks/arrow-left.js";
import { M as Mail } from "../../../../../chunks/mail.js";
import { I as Icon } from "../../../../../chunks/Icon.js";
function Plus($$renderer, $$props) {
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
  const iconNode = [["path", { "d": "M5 12h14" }], ["path", { "d": "M12 5v14" }]];
  Icon($$renderer, spread_props([
    { name: "plus" },
    $$sanitized_props,
    {
      /**
       * @component @name Plus
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNNSAxMmgxNCIgLz4KICA8cGF0aCBkPSJNMTIgNXYxNCIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/plus
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
    let inviteEmail = "";
    let invites = [];
    let isInviting = false;
    head("13oos0m", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Invite Friends &amp; Split Bill - Padelhive</title>`);
      });
    });
    $$renderer2.push(`<div class="py-12 bg-[#06121A]"><div class="container max-w-2xl space-y-6"><a${attr("href", `/bookings/${stringify(bookingId())}`)} class="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors">`);
    Arrow_left($$renderer2, { class: "h-3.5 w-3.5" });
    $$renderer2.push(`<!----> Back to Booking</a> <div class="space-y-2"><h1 class="text-3xl font-extrabold text-white">Invite Teammates &amp; Split Bill</h1> <p class="text-xs text-white/60">Send invite links to your match partners and manage equal share splits</p></div> `);
    Card($$renderer2, {
      class: "p-6 space-y-4",
      children: ($$renderer3) => {
        $$renderer3.push(`<h3 class="text-sm font-bold text-white">Send Email Invite</h3> `);
        {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--> <form class="flex gap-2"><div class="relative flex-1">`);
        Mail($$renderer3, {
          class: "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40"
        });
        $$renderer3.push(`<!----> <input type="email"${attr("value", inviteEmail)} required="" placeholder="friend@example.com" class="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#E6FA50]/50 focus:outline-none"/></div> `);
        Button($$renderer3, {
          type: "submit",
          variant: "lime",
          disabled: isInviting,
          children: ($$renderer4) => {
            {
              $$renderer4.push("<!--[-1-->");
              Plus($$renderer4, { class: "h-4 w-4" });
              $$renderer4.push(`<!----> Invite`);
            }
            $$renderer4.push(`<!--]-->`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----></form>`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Card($$renderer2, {
      class: "p-6 space-y-4",
      children: ($$renderer3) => {
        $$renderer3.push(`<h3 class="text-sm font-bold text-white">Invited Teammates (${escape_html(invites.length)})</h3> `);
        {
          $$renderer3.push("<!--[0-->");
          Skeleton($$renderer3, { class: "h-12 w-full" });
        }
        $$renderer3.push(`<!--]-->`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
