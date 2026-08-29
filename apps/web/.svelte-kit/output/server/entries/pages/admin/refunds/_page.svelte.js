import { h as head, i as ensure_array_like } from "../../../../chunks/index.js";
import "../../../../chunks/client.js";
import "../../../../chunks/store.svelte.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    head("7i5y5o", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Refund Requests | PadelHive Admin</title>`);
      });
    });
    $$renderer2.push(`<div class="flex flex-1 flex-col px-6 pb-6 pt-element lg:px-8 lg:pb-8 pt-8"><div class="mb-8"><p class="caption text-[#E6FA50]">Marketplace Admin</p> <h1 class="heading-1 mt-2 text-[#F7F7F7]">Refund <span class="text-[#E6FA50]">Requests</span></h1> <p class="body-sm mt-1 text-[#F7F7F7]/40">Manage player booking cancellation and refund approvals</p></div> <div class="flex flex-1 flex-col space-y-4">`);
    {
      $$renderer2.push(`<!--[0--><div class="space-y-4"><!--[-->`);
      const each_array = ensure_array_like(Array.from({ length: 3 }));
      for (let i = 0, $$length = each_array.length; i < $$length; i++) {
        each_array[i];
        $$renderer2.push(`<div class="h-24 animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]"></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
  });
}
export {
  _page as default
};
