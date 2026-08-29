import { h as head } from "../../../../chunks/index.js";
import "../../../../chunks/client.js";
import "../../../../chunks/store.svelte.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    head("h2enai", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Commission Reports | PadelHive Admin</title>`);
      });
    });
    $$renderer2.push(`<div class="flex flex-1 flex-col px-6 pb-6 pt-element lg:px-8 lg:pb-8 pt-8"><div class="mb-8"><p class="caption text-[#E6FA50]">Marketplace Admin</p> <h1 class="heading-1 mt-2 text-[#F7F7F7]">Commission <span class="text-[#E6FA50]">Reports</span></h1> <p class="body-sm mt-1 text-[#F7F7F7]/40">Venue revenue share and platform commission breakdown</p></div> `);
    {
      $$renderer2.push(`<!--[0--><div class="space-y-4"><div class="h-32 animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]"></div></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
export {
  _page as default
};
