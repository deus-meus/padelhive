import { h as head, a as attr, g as stringify, d as derived } from "../../../../../chunks/index.js";
import { p as page } from "../../../../../chunks/index2.js";
import "../../../../../chunks/client.js";
import "../../../../../chunks/store.svelte.js";
import { A as Arrow_left } from "../../../../../chunks/arrow-left.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const bookingId = derived(() => page.params.id || "");
    head("wf2e1v", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Payment Checkout | PadelHive</title>`);
      });
    });
    $$renderer2.push(`<div class="min-h-screen pt-20 pb-24 bg-[#06121A]"><div class="container max-w-3xl py-8"><a${attr("href", `/bookings/${stringify(bookingId())}`)} class="label inline-flex items-center gap-2 text-[#F7F7F7]/40 hover:text-[#F7F7F7]/60 transition-colors">`);
    Arrow_left($$renderer2, { class: "h-4 w-4" });
    $$renderer2.push(`<!----> Back to booking summary</a> <div class="mt-6 mb-8"><h1 class="heading-1 text-[#F7F7F7]">Payment <span class="text-[#E6FA50]">Checkout</span></h1> <p class="body-sm mt-2 text-[#F7F7F7]/40">Complete your payment to confirm court reservation</p></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push(`<!--[0--><div class="space-y-4"><div class="h-48 animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]"></div> <div class="h-64 animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]"></div></div>`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
  });
}
export {
  _page as default
};
