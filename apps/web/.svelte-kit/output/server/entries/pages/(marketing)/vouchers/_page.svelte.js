import { h as head, e as ensure_array_like } from "../../../../chunks/index.js";
import "../../../../chunks/client.js";
import { C as Card } from "../../../../chunks/card.js";
import { S as Skeleton } from "../../../../chunks/skeleton.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    head("ad8jzs", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Vouchers &amp; Promos - Padelhive</title>`);
      });
    });
    $$renderer2.push(`<div class="py-12 bg-[#06121A]"><div class="container space-y-8"><div class="space-y-2"><h1 class="text-3xl font-extrabold tracking-tight text-[#F7F7F7] sm:text-4xl">Promos &amp; Vouchers</h1> <p class="text-sm text-white/60">Claim discount vouchers to save on your next court booking</p></div> `);
    {
      $$renderer2.push(`<!--[0--><div class="grid grid-cols-1 gap-6 md:grid-cols-3"><!--[-->`);
      const each_array = ensure_array_like([1, 2, 3]);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        each_array[$$index];
        Card($$renderer2, {
          class: "p-6 space-y-4",
          children: ($$renderer3) => {
            Skeleton($$renderer3, { class: "h-6 w-1/2" });
            $$renderer3.push(`<!----> `);
            Skeleton($$renderer3, { class: "h-10 w-full" });
            $$renderer3.push(`<!----> `);
            Skeleton($$renderer3, { class: "h-4 w-2/3" });
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
