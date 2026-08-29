import { j as attr_class, e as ensure_array_like, d as escape_html, f as stringify, h as head } from "../../../chunks/index.js";
import "../../../chunks/client.js";
import "../../../chunks/store.svelte.js";
import { C as Card } from "../../../chunks/card.js";
import { S as Skeleton } from "../../../chunks/skeleton.js";
function Filter_tabs($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { tabs, selected, class: className = "" } = $$props;
    $$renderer2.push(`<div${attr_class(`inline-flex rounded-xl bg-white/[0.04] p-1 border border-white/[0.06] ${stringify(className)}`)}><!--[-->`);
    const each_array = ensure_array_like(tabs);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let tab = each_array[$$index];
      $$renderer2.push(`<button type="button"${attr_class(`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${selected === tab.value ? "bg-[#0C1B26] text-[#E6FA50] shadow-sm border border-white/[0.08]" : "text-white/60 hover:text-white hover:bg-white/[0.02]"}`)}>${escape_html(tab.label)} `);
      if (tab.badge !== void 0) {
        $$renderer2.push(`<!--[0--><span class="rounded-full bg-white/[0.1] px-2 py-0.5 text-xs text-white/80">${escape_html(tab.badge)}</span>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></button>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let activeTab = "upcoming";
    const TABS = [
      { label: "Upcoming", value: "upcoming" },
      { label: "Past Matches", value: "past" },
      { label: "Cancelled", value: "cancelled" }
    ];
    head("uq5w8t", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>My Bookings - Padelhive</title>`);
      });
    });
    $$renderer2.push(`<div class="py-12 bg-[#06121A]"><div class="container space-y-8"><div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><h1 class="text-3xl font-extrabold tracking-tight text-[#F7F7F7]">My Bookings</h1> <p class="mt-1 text-xs text-white/60">Manage your court reservations and match history</p></div> `);
    Filter_tabs($$renderer2, { tabs: TABS, selected: activeTab });
    $$renderer2.push(`<!----></div> `);
    {
      $$renderer2.push(`<!--[0--><div class="space-y-4"><!--[-->`);
      const each_array = ensure_array_like([1, 2, 3]);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        each_array[$$index];
        Card($$renderer2, {
          class: "p-6 space-y-3",
          children: ($$renderer3) => {
            Skeleton($$renderer3, { class: "h-6 w-1/3" });
            $$renderer3.push(`<!----> `);
            Skeleton($$renderer3, { class: "h-4 w-1/4" });
            $$renderer3.push(`<!---->`);
          },
          $$slots: { default: true }
        });
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
  });
}
export {
  _page as default
};
