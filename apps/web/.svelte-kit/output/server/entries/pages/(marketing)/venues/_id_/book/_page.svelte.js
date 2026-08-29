import { h as head, a as attr, f as stringify, g as derived, i as store_get, u as unsubscribe_stores } from "../../../../../../chunks/index.js";
import "@sveltejs/kit/internal";
import "../../../../../../chunks/exports.js";
import "../../../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../../../chunks/root.js";
import "../../../../../../chunks/state.svelte.js";
import { p as page } from "../../../../../../chunks/stores.js";
import "../../../../../../chunks/client.js";
import "../../../../../../chunks/store.svelte.js";
import { C as Card } from "../../../../../../chunks/card.js";
import { S as Skeleton } from "../../../../../../chunks/skeleton.js";
import { A as Arrow_left } from "../../../../../../chunks/arrow-left.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const venueId = derived(() => store_get($$store_subs ??= {}, "$page", page).params.id || "");
    (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    Array.from({ length: 17 }, (_, i) => {
      const h = i + 6;
      return `${String(h).padStart(2, "0")}:00`;
    });
    head("souq0j", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Book Court - Padelhive</title>`);
      });
    });
    $$renderer2.push(`<div class="py-12 bg-[#06121A]"><div class="container max-w-2xl space-y-6"><a${attr("href", `/venues/${stringify(venueId())}`)} class="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors">`);
    Arrow_left($$renderer2, { class: "h-3.5 w-3.5" });
    $$renderer2.push(`<!----> Back to Venue Details</a> `);
    {
      $$renderer2.push("<!--[0-->");
      Card($$renderer2, {
        class: "p-8 space-y-4",
        children: ($$renderer3) => {
          Skeleton($$renderer3, { class: "h-8 w-1/2" });
          $$renderer3.push(`<!----> `);
          Skeleton($$renderer3, { class: "h-10 w-full" });
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      });
    }
    $$renderer2.push(`<!--]--></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
