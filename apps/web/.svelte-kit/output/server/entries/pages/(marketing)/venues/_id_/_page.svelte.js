import { h as head, f as escape_html } from "../../../../../chunks/index.js";
import "../../../../../chunks/state.svelte.js";
import "@sveltejs/kit/internal";
import "../../../../../chunks/exports.js";
import "../../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../../chunks/root.js";
import "../../../../../chunks/client.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "Asia/Jakarta" }).format(/* @__PURE__ */ new Date()).toLowerCase();
    head("okq53t", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>${escape_html("Venue Details | PadelHive")}</title>`);
      });
    });
    $$renderer2.push(`<div class="min-h-screen pt-20 pb-24 lg:pb-0">`);
    {
      $$renderer2.push(`<!--[0--><div class="container py-8"><div class="grid grid-cols-2 gap-2 md:grid-cols-4 md:grid-rows-2"><div class="col-span-2 md:row-span-2 h-[240px] md:h-full rounded-2xl animate-pulse bg-white/[0.04]"></div> <div class="h-[116px] md:h-[200px] rounded-2xl animate-pulse bg-white/[0.04]"></div> <div class="h-[116px] md:h-[200px] rounded-2xl animate-pulse bg-white/[0.04]"></div> <div class="h-[116px] md:h-[200px] rounded-2xl animate-pulse bg-white/[0.04]"></div></div></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
export {
  _page as default
};
