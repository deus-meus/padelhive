import { s as sanitize_props, b as spread_props, c as slot, l as attributes, g as stringify, h as head, i as ensure_array_like, e as attr_class, f as escape_html, a as attr } from "../../../chunks/index.js";
import { a as api } from "../../../chunks/client.js";
import { a as authStore } from "../../../chunks/store.svelte.js";
import { C as Card, S as Skeleton } from "../../../chunks/skeleton.js";
import { I as Icon } from "../../../chunks/Icon.js";
import { L as Loader_circle } from "../../../chunks/loader-circle.js";
import { B as Bell } from "../../../chunks/bell.js";
function Check_check($$renderer, $$props) {
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
    ["path", { "d": "M18 6 7 17l-5-5" }],
    ["path", { "d": "m22 10-7.5 7.5L13 16" }]
  ];
  Icon($$renderer, spread_props([
    { name: "check-check" },
    $$sanitized_props,
    {
      /**
       * @component @name CheckCheck
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTggNiA3IDE3bC01LTUiIC8+CiAgPHBhdGggZD0ibTIyIDEwLTcuNSA3LjVMMTMgMTYiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/check-check
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
function Button($$renderer, $$props) {
  let {
    variant = "lime",
    size = "md",
    children,
    class: className = "",
    type = "button",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  const variantClasses = {
    lime: "bg-[#E6FA50] text-[#06121A] hover:bg-[#d4e845] active:bg-[#c8d63e] shadow-[0_0_24px_rgba(230,250,80,0.25)] font-semibold",
    "outline-white": "border border-white/20 text-white font-medium bg-transparent hover:border-white/40 hover:bg-white/5 active:border-white/50 active:bg-white/10",
    ghost: "text-white/70 hover:text-white hover:bg-white/5",
    danger: "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20",
    secondary: "bg-white/[0.06] text-white hover:bg-white/[0.1] border border-white/[0.08]"
  };
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
    md: "px-5 py-2.5 text-sm rounded-xl gap-2",
    lg: "px-7 py-3.5 text-base rounded-2xl gap-2.5"
  };
  $$renderer.push(`<button${attributes({
    type,
    class: `inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E6FA50]/50 disabled:pointer-events-none disabled:opacity-50 ${stringify(variantClasses[variant])} ${stringify(sizeClasses[size])} ${stringify(className)}`,
    ...restProps
  })}>`);
  children?.($$renderer);
  $$renderer.push(`<!----></button>`);
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let notifications = [];
    let isLoading = true;
    let isMarkingAll = false;
    async function loadNotifications() {
      isLoading = true;
      try {
        const token = await authStore.firebaseUser?.getIdToken();
        if (!token) return;
        const res = await api.notifications.get({ headers: { authorization: `Bearer ${token}` } });
        if (res.data) {
          notifications = res.data;
        }
      } catch (e) {
        console.warn("Notifications load error:", e);
      } finally {
        isLoading = false;
      }
    }
    async function markAllRead() {
      isMarkingAll = true;
      try {
        const token = await authStore.firebaseUser?.getIdToken();
        if (!token) return;
        await api.notifications["read-all"].patch(void 0, { headers: { authorization: `Bearer ${token}` } });
        await loadNotifications();
      } catch (e) {
        console.warn("Mark all read error:", e);
      } finally {
        isMarkingAll = false;
      }
    }
    head("1ce0uvz", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Notifications - Padelhive</title>`);
      });
    });
    $$renderer2.push(`<div class="py-12 bg-[#06121A]"><div class="container max-w-2xl space-y-6"><div class="flex items-center justify-between"><div><h1 class="text-3xl font-extrabold text-white">Notifications</h1> <p class="mt-1 text-xs text-white/60">Updates on your bookings, payments, and invites</p></div> `);
    Button($$renderer2, {
      variant: "secondary",
      size: "sm",
      disabled: isMarkingAll || notifications.length === 0,
      onclick: markAllRead,
      children: ($$renderer3) => {
        if (isMarkingAll) {
          $$renderer3.push("<!--[0-->");
          Loader_circle($$renderer3, { class: "h-3.5 w-3.5 animate-spin" });
        } else {
          $$renderer3.push("<!--[-1-->");
          Check_check($$renderer3, { class: "h-3.5 w-3.5" });
        }
        $$renderer3.push(`<!--]--> Mark All Read`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></div> `);
    if (isLoading) {
      $$renderer2.push(`<!--[0--><div class="space-y-3"><!--[-->`);
      const each_array = ensure_array_like([1, 2, 3]);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        each_array[$$index];
        Card($$renderer2, {
          class: "p-4 space-y-2",
          children: ($$renderer3) => {
            Skeleton($$renderer3, { class: "h-5 w-1/3" });
            $$renderer3.push(`<!----> `);
            Skeleton($$renderer3, { class: "h-4 w-2/3" });
            $$renderer3.push(`<!---->`);
          },
          $$slots: { default: true }
        });
      }
      $$renderer2.push(`<!--]--></div>`);
    } else if (notifications.length === 0) {
      $$renderer2.push("<!--[1-->");
      Card($$renderer2, {
        class: "flex flex-col items-center justify-center p-12 text-center",
        children: ($$renderer3) => {
          Bell($$renderer3, { class: "mb-3 h-10 w-10 text-white/30" });
          $$renderer3.push(`<!----> <h3 class="text-lg font-semibold text-white">No Notifications</h3> <p class="mt-1 text-xs text-white/50">You're all caught up! Updates will appear here.</p>`);
        },
        $$slots: { default: true }
      });
    } else {
      $$renderer2.push(`<!--[-1--><div class="space-y-3"><!--[-->`);
      const each_array_1 = ensure_array_like(notifications);
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let n = each_array_1[$$index_1];
        $$renderer2.push(`<div${attr_class(`flex items-start justify-between rounded-xl border p-4 transition-colors ${n.isRead ? "border-white/[0.04] bg-[#0C1B26]" : "border-[#E6FA50]/20 bg-[#0F2432]"}`)}><div class="space-y-1"><h4 class="text-sm font-bold text-white">${escape_html(n.title)}</h4> <p class="text-xs text-white/70">${escape_html(n.body)}</p> `);
        if (n.linkUrl) {
          $$renderer2.push(`<!--[0--><a${attr("href", n.linkUrl)} class="mt-2 inline-block text-xs font-semibold text-[#E6FA50] hover:underline">View Details →</a>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--></div> `);
        if (!n.isRead) {
          $$renderer2.push(`<!--[0--><button type="button" class="text-[10px] font-semibold text-[#E6FA50] hover:underline">Mark Read</button>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
  });
}
export {
  _page as default
};
