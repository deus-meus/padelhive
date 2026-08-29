import { h as head, a as attr } from "../../../../../chunks/index.js";
import "firebase/auth";
import "../../../../../chunks/firebase.js";
import { B as Button } from "../../../../../chunks/button.js";
import { C as Card } from "../../../../../chunks/card.js";
import { A as Arrow_left } from "../../../../../chunks/arrow-left.js";
import { M as Mail } from "../../../../../chunks/mail.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let email = "";
    let isLoading = false;
    head("gt83j", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Reset Password - Padelhive</title>`);
      });
    });
    $$renderer2.push(`<div class="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">`);
    Card($$renderer2, {
      class: "w-full max-w-md p-8",
      children: ($$renderer3) => {
        $$renderer3.push(`<a href="/auth/login" class="mb-6 inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors">`);
        Arrow_left($$renderer3, { class: "h-3.5 w-3.5" });
        $$renderer3.push(`<!----> Back to Sign In</a> <div class="text-center mb-8"><h1 class="text-2xl font-extrabold text-[#F7F7F7]">Forgot Password?</h1> <p class="mt-2 text-xs text-white/60">Enter your email and we'll send you a password reset link.</p></div> `);
        {
          $$renderer3.push("<!--[-1-->");
          {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]--> <form class="space-y-4"><div><label for="email" class="block mb-1.5 text-xs font-medium text-white/70">Email Address</label> <div class="relative">`);
          Mail($$renderer3, {
            class: "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40"
          });
          $$renderer3.push(`<!----> <input id="email" type="email"${attr("value", email)} required="" placeholder="player@padelhive.com" class="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#E6FA50]/50 focus:outline-none"/></div></div> `);
          Button($$renderer3, {
            type: "submit",
            variant: "lime",
            size: "lg",
            class: "w-full mt-2",
            disabled: isLoading,
            children: ($$renderer4) => {
              {
                $$renderer4.push(`<!--[-1-->Send Reset Link`);
              }
              $$renderer4.push(`<!--]-->`);
            },
            $$slots: { default: true }
          });
          $$renderer3.push(`<!----></form>`);
        }
        $$renderer3.push(`<!--]-->`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></div>`);
  });
}
export {
  _page as default
};
