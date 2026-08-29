<script lang="ts">
import { AlertCircle, ArrowLeft, CreditCard, Loader2 } from "lucide-svelte";
import { onMount } from "svelte";
import { goto } from "$app/navigation";
import { page } from "$app/stores";
import { api } from "$lib/api/client";
import { authStore } from "$lib/auth/store.svelte";
import Button from "$lib/components/ui/button.svelte";
import Card from "$lib/components/ui/card.svelte";

const bookingId = $derived(($page.params.id as string) || "");

let paymentIntent = $state<any | null>(null);
let isLoading = $state(true);
let isPaying = $state(false);
let error = $state<string | null>(null);

async function loadOrCreateIntent() {
  isLoading = true;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    const res = await api.payments.intents.post(
      { bookingId, provider: "internal", method: "va" },
      { headers: { authorization: `Bearer ${token}` } },
    );
    if (res.data) {
      paymentIntent = res.data;
    }
  } catch (err: any) {
    error = err.message || "Failed to create payment intent";
  } finally {
    isLoading = false;
  }
}

async function handleDemoPay() {
  if (!paymentIntent) return;
  isPaying = true;
  error = null;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    const res = await api
      .payments({ id: paymentIntent.id })
      ["mark-paid"].patch(undefined, {
        headers: { authorization: `Bearer ${token}` },
      });
    if (res.data) {
      goto(`/booking/${bookingId}/success`);
    }
  } catch (err: any) {
    error = err.message || "Payment processing failed";
  } finally {
    isPaying = false;
  }
}

onMount(() => {
  loadOrCreateIntent();
});
</script>

<svelte:head>
  <title>Payment - Booking #{bookingId.slice(0, 8)}</title>
</svelte:head>

<div class="py-12 bg-[#06121A]">
  <div class="container max-w-md space-y-6">
    <a href="/bookings/{bookingId}" class="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors">
      <ArrowLeft class="h-3.5 w-3.5" />
      Back to Booking Summary
    </a>

    <Card class="p-8 space-y-6">
      <div class="text-center space-y-2">
        <div class="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E6FA50]/10 text-[#E6FA50]">
          <CreditCard class="h-6 w-6" />
        </div>
        <h1 class="text-2xl font-extrabold text-white">Payment Checkout</h1>
        <p class="text-xs text-white/60">Complete your court reservation payment</p>
      </div>

      {#if error}
        <div class="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs font-medium text-red-400">
          <AlertCircle class="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      {/if}

      {#if isLoading}
        <div class="py-8 text-center space-y-3">
          <Loader2 class="h-6 w-6 animate-spin text-[#E6FA50] mx-auto" />
          <p class="text-xs text-white/50">Preparing payment intent...</p>
        </div>
      {:else if paymentIntent}
        <div class="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-3">
          <div class="flex items-center justify-between text-xs">
            <span class="text-white/50">Booking Reference</span>
            <span class="font-mono text-white font-semibold">#{bookingId.slice(0, 8)}</span>
          </div>
          <div class="flex items-center justify-between text-xs">
            <span class="text-white/50">Payment Mode</span>
            <span class="font-medium text-[#E6FA50]">Internal Instant Demo</span>
          </div>
          <div class="pt-2 border-t border-white/[0.04] flex items-center justify-between">
            <span class="text-sm font-semibold text-white">Amount Due</span>
            <span class="text-xl font-extrabold text-[#E6FA50]">
              Rp {paymentIntent.amount.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        <Button
          variant="lime"
          size="lg"
          class="w-full"
          disabled={isPaying}
          onclick={handleDemoPay}
        >
          {#if isPaying}
            <Loader2 class="h-4 w-4 animate-spin" />
            Processing Payment...
          {:else}
            Complete Demo Payment
          {/if}
        </Button>

        <p class="text-center text-[11px] text-white/40">
          🔒 Secure 256-bit encrypted checkout. Demo payments automatically confirm court reservations.
        </p>
      {/if}
    </Card>
  </div>
</div>
