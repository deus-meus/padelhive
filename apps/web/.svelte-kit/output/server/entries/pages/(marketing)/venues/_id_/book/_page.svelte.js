import { h as head, f as escape_html } from "../../../../../../chunks/index.js";
import "@sveltejs/kit/internal";
import "../../../../../../chunks/exports.js";
import "../../../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../../../chunks/root.js";
import "../../../../../../chunks/state.svelte.js";
import "../../../../../../chunks/client.js";
import "../../../../../../chunks/store.svelte.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    head("souq0j", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Book Court | ${escape_html("PadelHive")}</title>`);
      });
    });
    $$renderer2.push(`<div class="min-h-screen pt-20 pb-24 bg-[#06121A]">`);
    {
      $$renderer2.push(`<!--[0--><div class="container py-12 space-y-6"><div class="h-8 w-48 animate-pulse rounded-md bg-white/[0.04]"></div> <div class="h-[400px] animate-pulse rounded-2xl bg-white/[0.04]"></div></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
export {
  _page as default
};
