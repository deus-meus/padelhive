import { h as head, i as ensure_array_like } from "../../../chunks/index.js";
import "../../../chunks/client.js";
import "../../../chunks/store.svelte.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    head("1jef3w8", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Operations Overview | PadelHive Admin</title>`);
      });
    });
    $$renderer2.push(`<div class="px-6 pb-6 pt-element lg:px-8 lg:pb-8 pt-8"><div class="mb-8"><p class="caption text-[#F7F7F7]/25">Marketplace Admin</p> <h1 class="heading-1 mt-2 text-2xl text-[#F7F7F7] md:text-3xl">Operations <span class="text-[#E6FA50]">Overview</span></h1></div> `);
    {
      $$renderer2.push(`<!--[0--><div class="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6"><!--[-->`);
      const each_array = ensure_array_like(Array.from({ length: 4 }));
      for (let i = 0, $$length = each_array.length; i < $$length; i++) {
        each_array[i];
        $$renderer2.push(`<div class="h-[120px] animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]"></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
export {
  _page as default
};
