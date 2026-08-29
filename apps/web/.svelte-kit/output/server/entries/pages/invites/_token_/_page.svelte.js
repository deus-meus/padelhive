import { h as head } from "../../../../chunks/index.js";
import "../../../../chunks/state.svelte.js";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/root.js";
import "../../../../chunks/client.js";
import { C as Card, S as Skeleton } from "../../../../chunks/skeleton.js";
import { U as Users } from "../../../../chunks/users.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    head("1inph2v", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Match Invitation - Padelhive</title>`);
      });
    });
    $$renderer2.push(`<div class="py-12 bg-[#06121A]"><div class="container max-w-md space-y-6">`);
    Card($$renderer2, {
      class: "p-8 space-y-6 text-center",
      children: ($$renderer3) => {
        $$renderer3.push(`<div class="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E6FA50]/10 text-[#E6FA50] mx-auto">`);
        Users($$renderer3, { class: "h-6 w-6" });
        $$renderer3.push(`<!----></div> <div class="space-y-1"><h1 class="text-2xl font-extrabold text-white">Match Invitation</h1> <p class="text-xs text-white/60">You've been invited to join a padel match!</p></div> `);
        {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--> `);
        {
          $$renderer3.push(`<!--[0--><div class="space-y-3 py-4">`);
          Skeleton($$renderer3, { class: "h-6 w-3/4 mx-auto" });
          $$renderer3.push(`<!----> `);
          Skeleton($$renderer3, { class: "h-4 w-1/2 mx-auto" });
          $$renderer3.push(`<!----></div>`);
        }
        $$renderer3.push(`<!--]-->`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></div></div>`);
  });
}
export {
  _page as default
};
