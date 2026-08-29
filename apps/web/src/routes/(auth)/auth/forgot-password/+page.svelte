<script lang="ts">
import { Loader2, Mail } from "lucide-svelte";
import { authStore } from "$lib/auth/store.svelte";

let email = $state("");
let error = $state<string | null>(null);
let success = $state(false);

async function handleReset(e: SubmitEvent) {
  e.preventDefault();
  if (authStore.isLoading) return;
  error = null;
  success = false;

  if (!email.trim()) {
    error = "Please enter your email";
    return;
  }

  try {
    await authStore.sendPasswordReset(email);
    success = true;
  } catch (err: any) {
    error = err.message || "Failed to send reset link";
  }
}
</script>

<svelte:head>
  <title>Forgot Password - Padelhive</title>
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
      <p class="body-lg mt-3 text-[#F7F7F7]/40">Reset your password</p>
    </div>

    <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-8">
      <h1 class="heading-2 text-[#F7F7F7] text-center mb-6">
        Forgot Password
      </h1>

      {#if error}
        <div
          class="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3"
        >
          <p class="body text-red-100/80">{error}</p>
        </div>
      {/if}

      {#if success}
        <div
          class="mb-6 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-4 text-center"
        >
          <p class="body text-green-100/80 mb-4">
            We've sent a password reset link to <strong>{email}</strong>. Check
            your email to continue.
          </p>
          <a
            href="/auth/login"
            class="label btn-outline-white w-full flex items-center justify-center gap-2 rounded-xl py-3"
          >
            Return to Sign In
          </a>
        </div>
      {:else}
        <form onsubmit={handleReset} class="space-y-4 mb-6">
          <p class="body text-[#F7F7F7]/60 mb-4">
            Enter your email address and we've send you a link to reset your
            password.
          </p>
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

          <button
            type="submit"
            disabled={authStore.isLoading}
            class="label btn-lime w-full flex items-center justify-center gap-2 rounded-xl py-3 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
          >
            {#if authStore.isLoading}
              <Loader2 class="h-4 w-4 animate-spin" />
            {:else}
              Send Reset Link
            {/if}
          </button>
        </form>
      {/if}

      {#if !success}
        <div class="body mt-4 flex flex-col items-center gap-2">
          <div class="text-[#F7F7F7]/40">
            Remember your password?{" "}
            <a
              href="/auth/login"
              class="text-[#F7F7F7]/80 hover:text-[#E6FA50] transition-colors"
            >
              Sign in
            </a>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>