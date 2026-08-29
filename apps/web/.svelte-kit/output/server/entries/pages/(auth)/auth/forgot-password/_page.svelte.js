import { h as head, a as attr } from "../../../../../chunks/index.js";
import { a as authStore } from "../../../../../chunks/store.svelte.js";
import { M as Mail } from "../../../../../chunks/mail.js";
import { L as Loader_circle } from "../../../../../chunks/loader-circle.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let email = "";
    head("gt83j", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Forgot Password - Padelhive</title>`);
      });
    });
    $$renderer2.push(`<div class="min-h-screen flex items-center justify-center px-4 py-20"><div class="w-full max-w-md"><div class="text-center mb-10"><a href="/" class="inline-block"><span class="font-heading text-3xl font-bold tracking-[-0.02em] text-[#F7F7F7]">Padel<span class="text-[#E6FA50]">hive</span></span></a> <p class="body-lg mt-3 text-[#F7F7F7]/40">Reset your password</p></div> <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-8"><h1 class="heading-2 text-[#F7F7F7] text-center mb-6">Forgot Password</h1> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push(`<!--[-1--><form class="space-y-4 mb-6"><p class="body text-[#F7F7F7]/60 mb-4">Enter your email address and we've send you a link to reset your
            password.</p> <div class="relative">`);
      Mail($$renderer2, {
        class: "absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#F7F7F7]/25"
      });
      $$renderer2.push(`<!----> <input type="email" placeholder="you@example.com"${attr("value", email)}${attr("disabled", authStore.isLoading, true)} required="" class="body w-full rounded-xl border border-white/[0.06] bg-white/[0.02] py-3 pl-11 pr-4 text-[#F7F7F7] placeholder:text-[#F7F7F7]/25 focus:border-[#E6FA50]/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"/></div> <button type="submit"${attr("disabled", authStore.isLoading, true)} class="label btn-lime w-full flex items-center justify-center gap-2 rounded-xl py-3 disabled:cursor-not-allowed disabled:opacity-50 mt-2">`);
      if (authStore.isLoading) {
        $$renderer2.push("<!--[0-->");
        Loader_circle($$renderer2, { class: "h-4 w-4 animate-spin" });
      } else {
        $$renderer2.push(`<!--[-1-->Send Reset Link`);
      }
      $$renderer2.push(`<!--]--></button></form>`);
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push(`<!--[0--><div class="body mt-4 flex flex-col items-center gap-2"><div class="text-[#F7F7F7]/40">Remember your password?  <a href="/auth/login" class="text-[#F7F7F7]/80 hover:text-[#E6FA50] transition-colors">Sign in</a></div></div>`);
    }
    $$renderer2.push(`<!--]--></div></div></div>`);
  });
}
export {
  _page as default
};
