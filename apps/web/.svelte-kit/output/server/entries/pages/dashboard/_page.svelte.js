import { h as head, e as ensure_array_like } from "../../../chunks/index.js";
import "../../../chunks/client.js";
import "../../../chunks/store.svelte.js";
import { C as Card } from "../../../chunks/card.js";
import { S as Skeleton } from "../../../chunks/skeleton.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    head("x1i5gj", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Owner Dashboard - Padelhive</title>`);
      });
    });
    $$renderer2.push(`<div class="py-12 bg-[#06121A]"><div class="container space-y-8"><div><h1 class="text-3xl font-extrabold text-white">Owner Dashboard</h1> <p class="mt-1 text-xs text-white/60">Overview of venue performance, occupancy, and revenue</p></div> `);
    {
      $$renderer2.push(`<!--[0--><div class="grid grid-cols-2 gap-4 md:grid-cols-4"><!--[-->`);
      const each_array = ensure_array_like([1, 2, 3, 4]);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        each_array[$$index];
        Card($$renderer2, {
          class: "p-6 space-y-2",
          children: ($$renderer3) => {
            Skeleton($$renderer3, { class: "h-4 w-1/2" });
            $$renderer3.push(`<!----> `);
            Skeleton($$renderer3, { class: "h-8 w-3/4" });
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
