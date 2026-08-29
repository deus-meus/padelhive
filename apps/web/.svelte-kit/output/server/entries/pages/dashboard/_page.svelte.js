import { h as head, f as escape_html, i as ensure_array_like, d as derived } from "../../../chunks/index.js";
import "../../../chunks/client.js";
import { a as authStore } from "../../../chunks/store.svelte.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const user = derived(() => authStore.user);
    const firstName = derived(() => user()?.name?.split(" ")[0] ?? "there");
    head("x1i5gj", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Owner Dashboard - Padelhive</title>`);
      });
    });
    $$renderer2.push(`<div class="pt-element pb-component"><section class="container pb-component pt-8"><p class="caption text-[#F7F7F7]/25">Good morning</p> <h1 class="heading-1 mt-2 text-[#F7F7F7]">Welcome back, <span class="text-[#E6FA50]">${escape_html(firstName())}</span></h1> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></section> `);
    {
      $$renderer2.push(`<!--[0--><section class="container pb-component"><div class="grid grid-cols-2 gap-4 lg:grid-cols-5"><!--[-->`);
      const each_array = ensure_array_like(Array.from({ length: 5 }));
      for (let i = 0, $$length = each_array.length; i < $$length; i++) {
        each_array[i];
        $$renderer2.push(`<div class="h-[120px] animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]"></div>`);
      }
      $$renderer2.push(`<!--]--></div></section>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
export {
  _page as default
};
