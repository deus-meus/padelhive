import { h as head, i as ensure_array_like, e as attr_class, f as escape_html } from "../../../chunks/index.js";
import "../../../chunks/client.js";
import "../../../chunks/store.svelte.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const TABS = [
      { label: "Upcoming", value: "upcoming" },
      { label: "Past Matches", value: "past" },
      { label: "Cancelled", value: "cancelled" },
      { label: "Refunds", value: "refunds" },
      { label: "Disputes", value: "disputes" }
    ];
    let activeTab = "upcoming";
    head("uq5w8t", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>My Bookings | PadelHive</title>`);
      });
    });
    $$renderer2.push(`<div class="min-h-screen py-16 space-y-10 bg-[#06121A]"><section class="container pt-8"><span class="section-label block mb-4">My Activity</span> <h1 class="heading-1 text-[#F7F7F7]">My <span class="text-[#E6FA50]">Bookings</span></h1> <p class="body mt-2 text-[#F7F7F7]/40">Track your court reservations, past matches, and refunds.</p></section> <section class="container"><div class="flex flex-wrap gap-2 border-b border-white/[0.06] pb-3"><!--[-->`);
    const each_array = ensure_array_like(TABS);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let tab = each_array[$$index];
      $$renderer2.push(`<button type="button"${attr_class(`label rounded-full px-5 py-2 transition-all ${activeTab === tab.value ? "bg-[#E6FA50] text-[#06121A]" : "bg-white/[0.03] text-[#F7F7F7]/40 hover:text-[#F7F7F7]/60"}`)}>${escape_html(tab.label)}</button>`);
    }
    $$renderer2.push(`<!--]--></div></section> <section class="container">`);
    {
      $$renderer2.push(`<!--[0--><div class="space-y-4"><!--[-->`);
      const each_array_1 = ensure_array_like(Array.from({ length: 3 }));
      for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
        each_array_1[i];
        $$renderer2.push(`<div class="h-32 animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]"></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></section></div>`);
  });
}
export {
  _page as default
};
