import { h as head, d as escape_html } from "../../../../../chunks/index.js";
import "@sveltejs/kit/internal";
import "../../../../../chunks/exports.js";
import "../../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../../chunks/root.js";
import "../../../../../chunks/state.svelte.js";
import "../../../../../chunks/client.js";
import { S as Skeleton } from "../../../../../chunks/skeleton.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    head("okq53t", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html("Venue Details - Padelhive")}</title>`);
      });
    });
    $$renderer2.push(`<div class="py-10 bg-[#06121A]"><div class="container space-y-8">`);
    {
      $$renderer2.push(`<!--[0--><div class="space-y-6">`);
      Skeleton($$renderer2, { class: "h-64 w-full rounded-2xl" });
      $$renderer2.push(`<!----> `);
      Skeleton($$renderer2, { class: "h-10 w-1/3" });
      $$renderer2.push(`<!----> `);
      Skeleton($$renderer2, { class: "h-20 w-full" });
      $$renderer2.push(`<!----></div>`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
  });
}
export {
  _page as default
};
