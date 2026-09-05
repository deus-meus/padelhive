<script lang="ts">
import { Loader2, Lock, Mail, User as UserIcon } from "lucide-svelte";
import { goto } from "$app/navigation";
import { page } from "$app/state";
import { authStore } from "$lib/auth/store.svelte";
import FormInput from "$lib/components/ui/form-input.svelte";

let name = $state("");
let email = $state("");
let password = $state("");
let error = $state<string | null>(null);

const nextParam = $derived(page.url.searchParams.get("next"));

function getRoleRedirect(role?: string): string {
  if (role === "super_admin") return "/admin";
  if (role === "venue_owner" || role === "venue_admin") return "/dashboard";
  return "/venues";
}

async function handleSignup(e: SubmitEvent) {
  e.preventDefault();
  if (authStore.isLoading) return;
  error = null;
  if (!name.trim() || !email.trim() || !password.trim()) {
    error = "Please fill in all fields";
    return;
  }
  try {
    const u = await authStore.registerWithEmail(name, email, password);
    const targetPath = nextParam || getRoleRedirect(u?.role);
    goto(targetPath);
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
        <FormInput
          type="text"
          icon={UserIcon}
          bind:value={name}
          placeholder="Full Name"
          disabled={authStore.isLoading}
          required
        />
        <FormInput
          type="email"
          icon={Mail}
          bind:value={email}
          placeholder="you@example.com"
          disabled={authStore.isLoading}
          required
        />
        <FormInput
          type="password"
          icon={Lock}
          bind:value={password}
          placeholder="Password"
          disabled={authStore.isLoading}
          required
        />

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
            href="/auth/login{nextParam
              ? `?next=${encodeURIComponent(nextParam)}`
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