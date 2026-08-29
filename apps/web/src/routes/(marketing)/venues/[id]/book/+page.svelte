<script lang="ts">
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Clock,
  Loader2,
  ShieldCheck,
  Ticket,
} from "lucide-svelte";
import { onMount } from "svelte";
import { goto } from "$app/navigation";
import { page } from "$app/stores";
import { api } from "$lib/api/client";
import { authStore } from "$lib/auth/store.svelte";
import Button from "$lib/components/ui/button.svelte";
import Card from "$lib/components/ui/card.svelte";
import Skeleton from "$lib/components/ui/skeleton.svelte";

const venueId = $derived(($page.params.id as string) || "");

let venue = $state<any | null>(null);
let courts = $state<any[]>([]);

let selectedCourtId = $state("");
let bookingDate = $state(new Date().toISOString().split("T")[0]);
let startsAt = $state("09:00");
let endsAt = $state("11:00");
let voucherCode = $state("");
let hasInsurance = $state(false);

let isLoading = $state(true);
let isSubmitting = $state(false);
let voucherDiscount = $state(0);
let voucherError = $state<string | null>(null);
let error = $state<string | null>(null);

const HOURS = Array.from({ length: 17 }, (_, i) => {
  const h = i + 6;
  return `${String(h).padStart(2, "0")}:00`;
});

async function loadData() {
  if (!venueId) return;
  isLoading = true;
  try {
    const [vRes, cRes] = await Promise.all([
      api.venues({ id: venueId }).get(),
      api.venues({ id: venueId }).courts.get(),
    ]);

    if (vRes.data) venue = vRes.data;
    if (cRes.data && cRes.data.length > 0) {
      courts = cRes.data;
      selectedCourtId = courts[0].id;
    }
  } catch (e) {
    console.warn("Load error:", e);
  } finally {
    isLoading = false;
  }
}

async function validateVoucher() {
  if (!voucherCode.trim()) return;
  voucherError = null;
  try {
    const res = await api.vouchers.validate.post({
      code: voucherCode.trim(),
      amount: 300000,
    });
    if (res.data) {
      voucherDiscount = res.data.discount;
    }
  } catch (err: any) {
    voucherError = err.message || "Invalid voucher code";
    voucherDiscount = 0;
  }
}

async function handleCreateBooking(e: SubmitEvent) {
  e.preventDefault();
  if (!authStore.user) {
    goto(`/auth/login?next=/venues/${venueId}/book`);
    return;
  }
  if (!selectedCourtId || !bookingDate || !startsAt || !endsAt) {
    error = "Please fill in all booking details";
    return;
  }

  isSubmitting = true;
  error = null;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    const res = await api.bookings.post(
      {
        venueId,
        courtId: selectedCourtId,
        bookingDate,
        startsAt,
        endsAt,
        voucherCode: voucherCode || undefined,
        hasInsurance,
      },
      { headers: { authorization: `Bearer ${token}` } },
    );

    if (res.data) {
      goto(`/booking/${res.data.id}/payment`);
    }
  } catch (err: any) {
    error = err.message || "Booking creation failed";
  } finally {
    isSubmitting = false;
  }
}

onMount(() => {
  loadData();
});
</script>

<svelte:head>
  <title>Book Court - Padelhive</title>
</svelte:head>

<div class="py-12 bg-[#06121A]">
  <div class="container max-w-2xl space-y-6">
    <a href="/venues/{venueId}" class="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors">
      <ArrowLeft class="h-3.5 w-3.5" />
      Back to Venue Details
    </a>

    {#if isLoading}
      <Card class="p-8 space-y-4">
        <Skeleton class="h-8 w-1/2" />
        <Skeleton class="h-10 w-full" />
      </Card>
    {:else if !venue}
      <Card class="p-12 text-center">
        <h2 class="text-xl font-bold text-white">Venue Not Found</h2>
      </Card>
    {:else}
      <Card class="p-8 space-y-6">
        <div class="border-b border-white/[0.06] pb-6">
          <h1 class="text-2xl font-extrabold text-white">Book Court at {venue.name}</h1>
          <p class="mt-1 text-xs text-white/60">Choose your court, schedule, and optional insurance</p>
        </div>

        {#if error}
          <div class="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs font-medium text-red-400">
            <AlertCircle class="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        {/if}

        <form onsubmit={handleCreateBooking} class="space-y-6">
          <!-- Court Selection -->
          <div>
            <span class="block mb-2 text-xs font-bold uppercase tracking-wider text-white/60">Select Court</span>
            <div class="grid grid-cols-2 gap-3">
              {#each courts as c}
                <button
                  type="button"
                  onclick={() => { selectedCourtId = c.id; }}
                  class="flex flex-col rounded-xl border p-3.5 text-left transition-all {selectedCourtId === c.id ? 'border-[#E6FA50] bg-[#E6FA50]/10 text-white' : 'border-white/[0.08] bg-white/[0.02] text-white/70 hover:bg-white/[0.04]'}"
                >
                  <span class="text-sm font-bold text-white">{c.name}</span>
                  <span class="text-xs text-white/50">{c.type}</span>
                </button>
              {/each}
            </div>
          </div>

          <!-- Date & Time Selection -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label for="bdate" class="block mb-1.5 text-xs font-medium text-white/70">Date</label>
              <input
                id="bdate"
                type="date"
                bind:value={bookingDate}
                required
                class="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white focus:border-[#E6FA50]/50 focus:outline-none"
              />
            </div>

            <div>
              <label for="starts" class="block mb-1.5 text-xs font-medium text-white/70">Start Time</label>
              <select
                id="starts"
                bind:value={startsAt}
                class="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white focus:border-[#E6FA50]/50 focus:outline-none"
              >
                {#each HOURS.slice(0, -1) as h}
                  <option value={h} class="bg-[#0C1B26] text-white">{h}</option>
                {/each}
              </select>
            </div>

            <div>
              <label for="ends" class="block mb-1.5 text-xs font-medium text-white/70">End Time</label>
              <select
                id="ends"
                bind:value={endsAt}
                class="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white focus:border-[#E6FA50]/50 focus:outline-none"
              >
                {#each HOURS.slice(1) as h}
                  <option value={h} class="bg-[#0C1B26] text-white">{h}</option>
                {/each}
              </select>
            </div>
          </div>

          <!-- Voucher Code -->
          <div>
            <label for="voucher" class="block mb-1.5 text-xs font-medium text-white/70">Voucher Code (Optional)</label>
            <div class="flex gap-2">
              <input
                id="voucher"
                type="text"
                bind:value={voucherCode}
                placeholder="WELCOME20"
                class="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder-white/30 uppercase focus:border-[#E6FA50]/50 focus:outline-none"
              />
              <Button type="button" variant="secondary" onclick={validateVoucher}>Apply</Button>
            </div>
            {#if voucherError}
              <p class="mt-1 text-xs text-red-400">{voucherError}</p>
            {:else if voucherDiscount > 0}
              <p class="mt-1 text-xs text-emerald-400">Discount Applied: Rp {voucherDiscount.toLocaleString("id-ID")}</p>
            {/if}
          </div>

          <!-- Refund Protection Insurance -->
          <div class="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 flex items-center justify-between">
            <div class="space-y-0.5">
              <span class="text-xs font-bold text-white flex items-center gap-1.5">
                <ShieldCheck class="h-4 w-4 text-[#E6FA50]" />
                Refund Protection Insurance
              </span>
              <p class="text-[11px] text-white/50">Cancel anytime up to 2 hours before match for 100% refund (+Rp 25,000)</p>
            </div>
            <input type="checkbox" bind:checked={hasInsurance} class="h-5 w-5 accent-[#E6FA50]" />
          </div>

          <Button type="submit" variant="lime" size="lg" class="w-full" disabled={isSubmitting}>
            {#if isSubmitting}
              <Loader2 class="h-4 w-4 animate-spin" />
              Creating Reservation...
            {:else}
              Proceed to Payment Checkout
            {/if}
          </Button>
        </form>
      </Card>
    {/if}
  </div>
</div>
