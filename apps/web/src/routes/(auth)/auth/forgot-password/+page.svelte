<script lang="ts">
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Mail,
} from "lucide-svelte";
import { sendPasswordReset } from "$lib/auth-client";
import Button from "$lib/components/ui/button.svelte";
import Card from "$lib/components/ui/card.svelte";

let email = $state("");
let error = $state<string | null>(null);
let success = $state(false);
let isLoading = $state(false);

async function handleReset(e: SubmitEvent) {
  e.preventDefault();
  if (!email) {
    error = "Please enter your email address";
    return;
  }
  error = null;
  isLoading = true;
  try {
    await sendPasswordReset(email);
    success = true;
  } catch (err: any) {
    error = err.message || "Failed to send reset link";
  } finally {
    isLoading = false;
  }
}
</script>

<svelte:head>
  <title>Reset Password - Padelhive</title>
</svelte:head>

<div class="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
  <Card class="w-full max-w-md p-8">
    <a href="/auth/login" class="mb-6 inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors">
      <ArrowLeft class="h-3.5 w-3.5" />
      Back to Sign In
    </a>

    <div class="text-center mb-8">
      <h1 class="text-2xl font-extrabold text-[#F7F7F7]">Forgot Password?</h1>
      <p class="mt-2 text-xs text-white/60">Enter your email and we'll send you a password reset link.</p>
    </div>

    {#if success}
      <div class="mb-6 flex flex-col items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center text-emerald-400 space-y-2">
        <CheckCircle2 class="h-8 w-8" />
        <p class="text-sm font-semibold">Reset Link Sent!</p>
        <p class="text-xs text-emerald-400/80">Check your email inbox for instructions to reset your password.</p>
      </div>
    {:else}
      {#if error}
        <div class="mb-6 flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs font-medium text-red-400">
          <AlertCircle class="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      {/if}

      <form onsubmit={handleReset} class="space-y-4">
        <div>
          <label for="email" class="block mb-1.5 text-xs font-medium text-white/70">Email Address</label>
          <div class="relative">
            <Mail class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              id="email"
              type="email"
              bind:value={email}
              required
              placeholder="player@padelhive.com"
              class="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#E6FA50]/50 focus:outline-none"
            />
          </div>
        </div>

        <Button type="submit" variant="lime" size="lg" class="w-full mt-2" disabled={isLoading}>
          {#if isLoading}
            <Loader2 class="h-4 w-4 animate-spin" />
            Sending Link...
          {:else}
            Send Reset Link
          {/if}
        </Button>
      </form>
    {/if}
  </Card>
</div>
