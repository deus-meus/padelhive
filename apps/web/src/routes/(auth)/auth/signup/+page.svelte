<script lang="ts">
import { Loader2, Mail, User as UserIcon } from "lucide-svelte";
import { goto } from "$app/navigation";
import { page } from "$app/state";
import { authStore } from "$lib/auth/store.svelte";

let name = $state("");
let email = $state("");
let password = $state("");
let error = $state<string | null>(null);

const nextPath = $derived(page.url.searchParams.get("next") || "/venues");

async function handleSignup(e: SubmitEvent) {
  e.preventDefault();
  if (authStore.isLoading) return;
  error = null;
  if (!name.trim() || !email.trim() || !password.trim()) {
    error = "Please fill in all fields";
    return;
  }
  try {
    await authStore.registerWithEmail(name, email, password);
    goto(nextPath);
  } catch (err: any) {
    error = err.message || "Failed to create account";
  }
}
</script>

<svelte:head>
  <title>Sign Up - Padelhive</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center px-4 py-20">
  <div class="w-full max-w-md">
    <div class="text-center mb-10">
      <a href="/" class="inline-block">
        <span
          class="font-heading text-3xl font-bold tracking-[-0.02em] text-[#F7F7F7]"
        >
          Padel<span class="text-[#E6FA50]">hive</span>
        </span>
      </a>
      <p class="body-lg mt-3 text-[#F7F7F7]/40">
        Create an account to start booking courts.
      </p>
    </div>

    <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-8">
      <h1 class="heading-2 text-[#F7F7F7] text-center mb-6">Sign Up</h1>

      {#if error}
        <div
          class="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3"
        >
          <p class="body text-red-100/80">{error}</p>
        </div>
      {/if}

      <form onsubmit={handleSignup} class="space-y-4 mb-6">
        <div class="relative">
          <UserIcon
            class="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#F7F7F7]/25"
          />
          <input
            type="text"
            placeholder="Full Name"
            bind:value={name}
            disabled={authStore.isLoading}
            required
            class="body w-full rounded-xl border border-white/[0.06] bg-white/[0.02] py-3 pl-11 pr-4 text-[#F7F7F7] placeholder:text-[#F7F7F7]/25 focus:border-[#E6FA50]/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div class="relative">
          <Mail
            class="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#F7F7F7]/25"
          />
          <input
            type="email"
            placeholder="you@example.com"
            bind:value={email}
            disabled={authStore.isLoading}
            required
            class="body w-full rounded-xl border border-white/[0.06] bg-white/[0.02] py-3 pl-11 pr-4 text-[#F7F7F7] placeholder:text-[#F7F7F7]/25 focus:border-[#E6FA50]/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div class="relative">
          <input
            type="password"
            placeholder="Password"
            bind:value={password}
            disabled={authStore.isLoading}
            required
            minlength={6}
            class="body w-full rounded-xl border border-white/[0.06] bg-white/[0.02] py-3 px-4 text-[#F7F7F7] placeholder:text-[#F7F7F7]/25 focus:border-[#E6FA50]/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={authStore.isLoading}
          class="label btn-lime w-full flex items-center justify-center gap-2 rounded-xl py-3 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
        >
          {#if authStore.isLoading}
            <Loader2 class="h-4 w-4 animate-spin" />
          {:else}
            Sign Up
          {/if}
        </button>
      </form>

      <div class="body mt-4 flex flex-col items-center gap-2">
        <div class="text-[#F7F7F7]/40">
          Already have an account?{" "}
          <a
            href="/auth/login{nextPath
              ? `?next=${encodeURIComponent(nextPath)}`
              : ''}"
            class="text-[#F7F7F7]/80 hover:text-[#E6FA50] transition-colors"
          >
            Sign in
          </a>
        </div>
      </div>
    </div>
  </div>
</div>