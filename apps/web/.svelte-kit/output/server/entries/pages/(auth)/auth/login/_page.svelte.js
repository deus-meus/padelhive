import { h as head, a as attr } from "../../../../../chunks/index.js";
import "@sveltejs/kit/internal";
import "../../../../../chunks/exports.js";
import "../../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../../chunks/root.js";
import "../../../../../chunks/state.svelte.js";
import { a as authStore } from "../../../../../chunks/store.svelte.js";
import { B as Button } from "../../../../../chunks/button.js";
import { C as Card } from "../../../../../chunks/card.js";
import { M as Mail } from "../../../../../chunks/mail.js";
import { L as Lock } from "../../../../../chunks/lock.js";
import { L as Loader_circle } from "../../../../../chunks/loader-circle.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let email = "";
    let password = "";
    head("1va3k2h", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Sign In - Padelhive</title>`);
      });
    });
    $$renderer2.push(`<div class="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">`);
    Card($$renderer2, {
      class: "w-full max-w-md p-8",
      children: ($$renderer3) => {
        $$renderer3.push(`<div class="text-center mb-8"><h1 class="text-2xl font-extrabold text-[#F7F7F7]">Welcome Back</h1> <p class="mt-2 text-xs text-white/60">Sign in to your Padelhive account</p></div> `);
        {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--> <button type="button"${attr("disabled", authStore.isLoading, true)} class="flex w-full items-center justify-center gap-3 rounded-xl border border-white/[0.1] bg-white/[0.03] py-3 text-sm font-semibold text-white hover:bg-white/[0.08] transition-all disabled:opacity-50"><svg class="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"></path><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"></path></svg> Continue with Google</button> <div class="my-6 flex items-center gap-3"><div class="h-px flex-1 bg-white/[0.08]"></div> <span class="text-[11px] uppercase font-medium text-white/40">or with email</span> <div class="h-px flex-1 bg-white/[0.08]"></div></div> <form class="space-y-4"><div><label for="email" class="block mb-1.5 text-xs font-medium text-white/70">Email Address</label> <div class="relative">`);
        Mail($$renderer3, {
          class: "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40"
        });
        $$renderer3.push(`<!----> <input id="email" type="email"${attr("value", email)} required="" placeholder="player@padelhive.com" class="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#E6FA50]/50 focus:outline-none"/></div></div> <div><div class="flex items-center justify-between mb-1.5"><label for="password" class="text-xs font-medium text-white/70">Password</label> <a href="/auth/forgot-password" class="text-xs text-[#E6FA50] hover:underline">Forgot password?</a></div> <div class="relative">`);
        Lock($$renderer3, {
          class: "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40"
        });
        $$renderer3.push(`<!----> <input id="password" type="password"${attr("value", password)} required="" placeholder="••••••••" class="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#E6FA50]/50 focus:outline-none"/></div></div> `);
        Button($$renderer3, {
          type: "submit",
          variant: "lime",
          size: "lg",
          class: "w-full mt-2",
          disabled: authStore.isLoading,
          children: ($$renderer4) => {
            if (authStore.isLoading) {
              $$renderer4.push("<!--[0-->");
              Loader_circle($$renderer4, { class: "h-4 w-4 animate-spin" });
              $$renderer4.push(`<!----> Signing in...`);
            } else {
              $$renderer4.push(`<!--[-1-->Sign In`);
            }
            $$renderer4.push(`<!--]-->`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----></form> <p class="mt-6 text-center text-xs text-white/60">Don't have an account? <a href="/auth/signup" class="font-semibold text-[#E6FA50] hover:underline">Sign up</a></p>`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></div>`);
  });
}
export {
  _page as default
};
