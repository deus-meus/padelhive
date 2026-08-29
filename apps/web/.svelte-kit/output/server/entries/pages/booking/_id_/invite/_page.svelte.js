import { s as sanitize_props, b as spread_props, c as slot, h as head, a as attr, f as escape_html, e as attr_class, i as ensure_array_like, g as stringify, d as derived } from "../../../../../chunks/index.js";
import { p as page } from "../../../../../chunks/index2.js";
import "../../../../../chunks/client.js";
import "../../../../../chunks/store.svelte.js";
import { A as Arrow_left } from "../../../../../chunks/arrow-left.js";
import { I as Icon } from "../../../../../chunks/Icon.js";
import { U as Users } from "../../../../../chunks/users.js";
function Check($$renderer, $$props) {
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
  const iconNode = [["path", { "d": "M20 6 9 17l-5-5" }]];
  Icon($$renderer, spread_props([
    { name: "check" },
    $$sanitized_props,
    {
      /**
       * @component @name Check
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMjAgNiA5IDE3bC01LTUiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/check
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
function Copy($$renderer, $$props) {
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
        "width": "14",
        "height": "14",
        "x": "8",
        "y": "8",
        "rx": "2",
        "ry": "2"
      }
    ],
    [
      "path",
      {
        "d": "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
      }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "copy" },
    $$sanitized_props,
    {
      /**
       * @component @name Copy
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cmVjdCB3aWR0aD0iMTQiIGhlaWdodD0iMTQiIHg9IjgiIHk9IjgiIHJ4PSIyIiByeT0iMiIgLz4KICA8cGF0aCBkPSJNNCAxNmMtMS4xIDAtMi0uOS0yLTJWNGMwLTEuMS45LTIgMi0yaDEwYzEuMSAwIDIgLjkgMiAyIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/copy
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
function Share_2($$renderer, $$props) {
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
    ["circle", { "cx": "18", "cy": "5", "r": "3" }],
    ["circle", { "cx": "6", "cy": "12", "r": "3" }],
    ["circle", { "cx": "18", "cy": "19", "r": "3" }],
    [
      "line",
      { "x1": "8.59", "x2": "15.42", "y1": "13.51", "y2": "17.49" }
    ],
    [
      "line",
      { "x1": "15.41", "x2": "8.59", "y1": "6.51", "y2": "10.49" }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "share-2" },
    $$sanitized_props,
    {
      /**
       * @component @name Share2
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8Y2lyY2xlIGN4PSIxOCIgY3k9IjUiIHI9IjMiIC8+CiAgPGNpcmNsZSBjeD0iNiIgY3k9IjEyIiByPSIzIiAvPgogIDxjaXJjbGUgY3g9IjE4IiBjeT0iMTkiIHI9IjMiIC8+CiAgPGxpbmUgeDE9IjguNTkiIHgyPSIxNS40MiIgeTE9IjEzLjUxIiB5Mj0iMTcuNDkiIC8+CiAgPGxpbmUgeDE9IjE1LjQxIiB4Mj0iOC41OSIgeTE9IjYuNTEiIHkyPSIxMC40OSIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/share-2
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
function User_plus($$renderer, $$props) {
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
    ["path", { "d": "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }],
    ["circle", { "cx": "9", "cy": "7", "r": "4" }],
    ["line", { "x1": "19", "x2": "19", "y1": "8", "y2": "14" }],
    ["line", { "x1": "22", "x2": "16", "y1": "11", "y2": "11" }]
  ];
  Icon($$renderer, spread_props([
    { name: "user-plus" },
    $$sanitized_props,
    {
      /**
       * @component @name UserPlus
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTYgMjF2LTJhNCA0IDAgMCAwLTQtNEg2YTQgNCAwIDAgMC00IDR2MiIgLz4KICA8Y2lyY2xlIGN4PSI5IiBjeT0iNyIgcj0iNCIgLz4KICA8bGluZSB4MT0iMTkiIHgyPSIxOSIgeTE9IjgiIHkyPSIxNCIgLz4KICA8bGluZSB4MT0iMjIiIHgyPSIxNiIgeTE9IjExIiB5Mj0iMTEiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/user-plus
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
    const bookingId = derived(() => page.params.id || "");
    let invites = [];
    let emailInput = "";
    let copiedToken = null;
    let isInviting = false;
    function buildInviteLink(token) {
      if (typeof window === "undefined") return `/invites/${token}`;
      return `${window.location.origin}/invites/${token}`;
    }
    const acceptedCount = derived(() => invites.filter((invite) => invite.status === "ACCEPTED").length);
    const firstInviteLink = derived(() => invites[0] ? buildInviteLink(invites[0].token) : "Add a friend to generate an invite link");
    head("13oos0m", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Invite Friends | PadelHive</title>`);
      });
    });
    $$renderer2.push(`<div class="min-h-screen pt-20 pb-24 bg-[#06121A]"><div class="container max-w-2xl py-8"><a${attr("href", "/venues")} class="label inline-flex items-center gap-2 text-[#F7F7F7]/40 hover:text-[#F7F7F7]/60 transition-colors">`);
    Arrow_left($$renderer2, { class: "h-4 w-4" });
    $$renderer2.push(`<!----> Back to booking</a> <div class="mt-6"><h1 class="heading-1 text-[#F7F7F7]">Invite Friends</h1> <p class="body-sm mt-2 text-[#F7F7F7]/40">Share your booking and play together</p></div> <div class="mt-6 rounded-xl border border-white/[0.06] bg-[#0C1B26] p-4"><div class="body-sm flex flex-wrap items-center gap-x-4 gap-y-1 text-[#F7F7F7]/60"><span>${escape_html("Padel Arena")}</span> <span class="text-[#F7F7F7]/15">·</span> <span>${escape_html("Court A")}</span> <span class="text-[#F7F7F7]/15">·</span> <span>${escape_html("Today")}</span> <span class="text-[#F7F7F7]/15">·</span> <span>${escape_html("10:00")} – ${escape_html("11:00")}</span></div></div> <div class="mt-8"><h2 class="heading-3 uppercase text-[#F7F7F7]/60 flex items-center">`);
    Share_2($$renderer2, { class: "mr-2 h-3.5 w-3.5" });
    $$renderer2.push(`<!----> Share Invite Link</h2> <div class="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center"><div class="flex min-w-0 flex-1 items-center rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"><span class="body-sm flex-1 truncate text-[#F7F7F7]/60">${escape_html(firstInviteLink())}</span></div> <button type="button"${attr("disabled", !invites[0], true)}${attr_class(`label flex h-[46px] items-center justify-center gap-2 rounded-xl border px-5 transition-all disabled:cursor-not-allowed disabled:opacity-30 ${copiedToken === invites[0]?.token ? "border-green-400/30 bg-green-400/10 text-green-400" : "border-white/[0.06] bg-[#0C1B26] text-[#F7F7F7]/60 hover:border-white/[0.12] hover:text-[#F7F7F7]"}`)}>`);
    if (copiedToken === invites[0]?.token) {
      $$renderer2.push("<!--[0-->");
      Check($$renderer2, { class: "h-4 w-4" });
      $$renderer2.push(`<!----> <span>Copied</span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      Copy($$renderer2, { class: "h-4 w-4" });
      $$renderer2.push(`<!----> <span>Copy</span>`);
    }
    $$renderer2.push(`<!--]--></button></div> <p class="caption mt-2 text-[#F7F7F7]/25">Invite links are generated after adding a friend. Each friend gets a unique RSVP token.</p></div> <div class="mt-8"><h2 class="heading-3 uppercase text-[#F7F7F7]/60 flex items-center">`);
    User_plus($$renderer2, { class: "mr-2 h-3.5 w-3.5" });
    $$renderer2.push(`<!----> Add by Email</h2> <div class="mt-3 flex items-center gap-3"><input type="email"${attr("value", emailInput)}${attr("disabled", isInviting, true)} placeholder="friend@email.com" class="body flex-1 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[#F7F7F7] placeholder:text-[#F7F7F7]/25 focus:border-[#E6FA50]/30 focus:outline-none focus:ring-1 focus:ring-[#E6FA50]/20 disabled:cursor-not-allowed disabled:opacity-50"/> <button type="button"${attr("disabled", !emailInput.trim() || isInviting, true)} class="btn-lime label flex h-[46px] items-center gap-2 rounded-xl px-5 disabled:opacity-30 disabled:cursor-not-allowed">${escape_html("Invite")}</button></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> <div class="mt-8"><div class="flex items-center justify-between"><h2 class="heading-3 uppercase text-[#F7F7F7]/60 flex items-center">`);
    Users($$renderer2, { class: "mr-2 h-3.5 w-3.5" });
    $$renderer2.push(`<!----> Invited Players (${escape_html(invites.length)})</h2> <span class="caption text-green-400/70">${escape_html(acceptedCount())} accepted</span></div> <div class="mt-4 space-y-3">`);
    {
      $$renderer2.push(`<!--[0--><div class="space-y-3"><!--[-->`);
      const each_array = ensure_array_like(Array.from({ length: 2 }));
      for (let i = 0, $$length = each_array.length; i < $$length; i++) {
        each_array[i];
        $$renderer2.push(`<div class="flex flex-col gap-4 rounded-xl border border-white/[0.06] bg-[#0C1B26] p-4 sm:flex-row sm:items-center sm:justify-between"><div class="flex min-w-0 items-center gap-3"><div class="h-10 w-10 shrink-0 rounded-full bg-white/5 animate-pulse"></div> <div class="min-w-0 space-y-1.5"><div class="h-4 w-32 rounded-full bg-white/5 animate-pulse"></div></div></div></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div></div> <div class="mt-10"><a${attr("href", `/booking/${stringify(bookingId())}/payment`)} class="btn-lime label flex h-12 w-full items-center justify-center rounded-full">Continue to Payment</a></div> <p class="caption mt-4 text-center text-[#F7F7F7]/25">Friends can RSVP from their invite link. Split the bill on the payment page after booking.</p></div></div>`);
  });
}
export {
  _page as default
};
