import { h as head, e as attr_class, f as escape_html, i as ensure_array_like, d as derived } from "../../../../chunks/index.js";
import "../../../../chunks/client.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let vouchers = [];
    const active = derived(() => vouchers.filter((v) => v.isActive));
    const expired = derived(() => vouchers.filter((v) => !v.isActive));
    head("ad8jzs", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Vouchers &amp; Promos | PadelHive</title>`);
      });
    });
    $$renderer2.push(`<div class="min-h-screen py-16 space-y-12 bg-[#06121A]"><section class="container pt-8"><span class="section-label block mb-4">Rewards</span> <h1 class="heading-1 text-[#F7F7F7]">Promo &amp; <span class="text-[#E6FA50]">Vouchers</span></h1> <p class="body mt-2 text-[#F7F7F7]/40">Use voucher codes to get discounts on your bookings.</p></section> <section class="container max-w-[1200px]"><div class="flex gap-2 border-b border-white/[0.06] pb-3 mb-8"><button type="button"${attr_class(`label rounded-full px-5 py-2 transition-all ${"bg-[#E6FA50] text-[#06121A]"}`)}>Active (${escape_html(active().length)})</button> <button type="button"${attr_class(`label rounded-full px-5 py-2 transition-all ${"bg-white/[0.03] text-[#F7F7F7]/40 hover:text-[#F7F7F7]/60"}`)}>Expired (${escape_html(expired().length)})</button></div></section> <section class="container">`);
    {
      $$renderer2.push(`<!--[0--><div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"><!--[-->`);
      const each_array = ensure_array_like(Array.from({ length: 6 }));
      for (let i = 0, $$length = each_array.length; i < $$length; i++) {
        each_array[i];
        $$renderer2.push(`<div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 space-y-4"><div class="h-6 w-20 animate-pulse rounded-full bg-white/[0.04]"></div> <div class="h-6 w-32 animate-pulse rounded-md bg-white/[0.04]"></div> <div class="h-4 w-48 animate-pulse rounded-md bg-white/[0.04]"></div></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></section> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
export {
  _page as default
};
