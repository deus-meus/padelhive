import { h as head, f as escape_html, d as derived } from "../../../../chunks/index.js";
import { p as page } from "../../../../chunks/index2.js";
import "../../../../chunks/client.js";
import "../../../../chunks/store.svelte.js";
import { C as Card, S as Skeleton } from "../../../../chunks/skeleton.js";
import { A as Arrow_left } from "../../../../chunks/arrow-left.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const bookingId = derived(() => page.params.id || "");
    head("1gulp2d", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Booking Summary #${escape_html(bookingId().slice(0, 8))} - Padelhive</title>`);
      });
    });
    $$renderer2.push(`<div class="min-h-screen pt-24 pb-12 bg-[#06121A]"><div class="container max-w-3xl space-y-6"><a href="/bookings" class="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors">`);
    Arrow_left($$renderer2, { class: "h-3.5 w-3.5" });
    $$renderer2.push(`<!----> Back to Bookings</a> `);
    {
      $$renderer2.push("<!--[0-->");
      Card($$renderer2, {
        class: "p-8 space-y-4",
        children: ($$renderer3) => {
          Skeleton($$renderer3, { class: "h-8 w-1/2" });
          $$renderer3.push(`<!----> `);
          Skeleton($$renderer3, { class: "h-4 w-1/3" });
          $$renderer3.push(`<!----> `);
          Skeleton($$renderer3, { class: "h-20 w-full" });
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      });
    }
    $$renderer2.push(`<!--]--></div></div>`);
  });
}
export {
  _page as default
};
