import { h as head, i as ensure_array_like, e as attr_class, f as escape_html } from "../../../../chunks/index.js";
import "../../../../chunks/client.js";
import "../../../../chunks/store.svelte.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const TABS = [
      { label: "Pending", value: "PENDING" },
      { label: "Approved", value: "APPROVED" },
      { label: "Rejected", value: "REJECTED" },
      { label: "Suspended", value: "SUSPENDED" },
      { label: "All", value: "ALL" }
    ];
    let activeTab = "PENDING";
    head("1vd5g2t", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Venue Approvals | PadelHive Admin</title>`);
      });
    });
    $$renderer2.push(`<div class="flex flex-1 flex-col px-6 pb-6 pt-element lg:px-8 lg:pb-8 pt-8"><div class="mb-8"><p class="caption text-[#E6FA50]">Marketplace Admin</p> <h1 class="heading-1 mt-2 text-[#F7F7F7]">Venue <span class="text-[#E6FA50]">Approvals</span></h1></div> <div class="flex flex-wrap gap-2 border-b border-white/[0.06] pb-3 mb-6"><!--[-->`);
    const each_array = ensure_array_like(TABS);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let tab = each_array[$$index];
      $$renderer2.push(`<button type="button"${attr_class(`label rounded-full px-5 py-2 transition-all ${activeTab === tab.value ? "bg-[#E6FA50] text-[#06121A]" : "bg-white/[0.03] text-[#F7F7F7]/40 hover:text-[#F7F7F7]/60"}`)}>${escape_html(tab.label)}</button>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="flex flex-1 flex-col space-y-4">`);
    {
      $$renderer2.push(`<!--[0--><div class="space-y-4"><!--[-->`);
      const each_array_1 = ensure_array_like(Array.from({ length: 3 }));
      for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
        each_array_1[i];
        $$renderer2.push(`<div class="h-32 animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]"></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
export {
  _page as default
};
