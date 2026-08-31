<script lang="ts">
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  Shield,
  Users,
  Wallet,
} from "lucide-svelte";
import { onMount } from "svelte";
import { page } from "$app/state";
import { api } from "$lib/api/client";
import { authStore } from "$lib/auth/store.svelte";
import EmptyState from "$lib/components/ui/empty-state.svelte";
import { formatBookingDate } from "$lib/format";

const bookingId = $derived((page.params.id as string) || "");

let booking = $state<any | null>(null);
let selectedMethod = $state("va");
let paymentIntent = $state<any | null>(null);

let isLoading = $state(true);
let isPaying = $state(false);
let error = $state<string | null>(null);

const PAYMENT_METHODS = [
  {
    id: "va",
    label: "Virtual Account",
    description: "BCA, Mandiri, BNI, BRI",
    icon: Building2,
  },
  {
    id: "ewallet",
    label: "E-Wallet",
    description: "GoPay, OVO, DANA, ShopeePay",
    icon: Wallet,
  },
  {
    id: "card",
    label: "Credit / Debit Card",
    description: "Visa, Mastercard",
    icon: CreditCard,
  },
];

async function loadData() {
  if (!bookingId) return;
  isLoading = true;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    const [bRes, pRes] = await Promise.all([
      api.bookings({ id: bookingId }).get({
        headers: { authorization: `Bearer ${token}` },
      }),
      api.payments.intents.post(
        {
          bookingId,
          provider: "internal",
          method: selectedMethod as "va" | "ewallet" | "card",
        },
        { headers: { authorization: `Bearer ${token}` } },
      ),
    ]);

    if (bRes.data) booking = bRes.data;
    if (pRes.data) paymentIntent = pRes.data;
  } catch (e: any) {
    console.warn("Payment load error:", e);
    error = e.message || "Failed to load payment details";
  } finally {
    isLoading = false;
  }
}

async function handlePay() {
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
      window.location.href = `/booking/${bookingId}/success`;
    }
  } catch (err: any) {
    error = err.message || "Payment processing failed";
  } finally {
    isPaying = false;
  }
}

onMount(() => {
  loadData();
});
</script>

<svelte:head>
  <title>Payment Checkout | PadelHive</title>
</svelte:head>

<div class="min-h-screen pt-20 pb-24 bg-[#06121A]">
  <div class="container max-w-3xl py-8">
    <!-- Back -->
    <a
      href="/bookings/{bookingId}"
      class="group inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs font-semibold text-[#F7F7F7]/60 transition-all duration-200 hover:border-[#E6FA50]/30 hover:bg-[#E6FA50]/10 hover:text-[#E6FA50]"
    >
      <ArrowLeft class="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-1 text-[#F7F7F7]/40 group-hover:text-[#E6FA50]" />
      <span>Back to booking summary</span>
    </a>

    <!-- Header -->
    <div class="mt-6 mb-8">
      <h1 class="heading-1 text-[#F7F7F7]">
        Payment <span class="text-[#E6FA50]">Checkout</span>
      </h1>
      <p class="body-sm mt-2 text-[#F7F7F7]/40">
        Complete your payment to confirm court reservation
      </p>
    </div>

    {#if error}
      <div class="mb-6 flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
        <AlertCircle class="h-4 w-4 shrink-0 text-red-400" />
        <p class="body text-red-100/80">{error}</p>
      </div>
    {/if}

    {#if isLoading}
      <div class="space-y-4">
        <div class="h-48 animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]"></div>
        <div class="h-64 animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]"></div>
      </div>
    {:else if !booking}
      <EmptyState
        icon={CreditCard}
        title="Booking not found"
        description="This booking reservation could not be found."
        actionLabel="Back to bookings"
        actionHref="/bookings"
      />
    {:else}
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
        <!-- Left — Payment Steps -->
        <div class="space-y-8">
          <!-- Reservation summary card -->
          <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 space-y-4">
            <h2 class="heading-3 text-[#F7F7F7]">Reservation Overview</h2>
            <div class="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span class="caption text-[#F7F7F7]/40 block mb-1">Venue</span>
                <span class="label text-[#F7F7F7]">{booking.venue?.name}</span>
              </div>
              <div>
                <span class="caption text-[#F7F7F7]/40 block mb-1">Court</span>
                <span class="label text-[#F7F7F7]">{booking.court?.name} ({booking.court?.type})</span>
              </div>
              <div>
                <span class="caption text-[#F7F7F7]/40 block mb-1">Date</span>
                <span class="label text-[#F7F7F7]">{booking.bookingDate}</span>
              </div>
              <div>
                <span class="caption text-[#F7F7F7]/40 block mb-1">Time</span>
                <span class="label text-[#E6FA50]">{booking.startsAt} – {booking.endsAt}</span>
              </div>
            </div>
          </div>

          <!-- Select Payment Method -->
          <div class="space-y-4">
            <h2 class="heading-2 text-[#F7F7F7]">Select Payment Method</h2>
            <div class="space-y-3">
              {#each PAYMENT_METHODS as method}
                {@const MethodIcon = method.icon}
                <button
                  type="button"
                  onclick={() => (selectedMethod = method.id)}
                  class="flex w-full items-center justify-between rounded-2xl border p-5 text-left transition-all {selectedMethod ===
                  method.id
                    ? 'border-[#E6FA50] bg-[#E6FA50]/10'
                    : 'border-white/[0.06] bg-[#0C1B26] hover:border-white/[0.12]'}"
                >
                  <div class="flex items-center gap-4">
                    <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04]">
                      <MethodIcon class="h-5 w-5 text-[#50C8C8]" />
                    </div>
                    <div>
                      <p class="label font-semibold text-[#F7F7F7]">{method.label}</p>
                      <p class="caption text-[#F7F7F7]/40">{method.description}</p>
                    </div>
                  </div>
                  <div class="h-4 w-4 rounded-full border border-white/20 flex items-center justify-center {selectedMethod === method.id ? 'border-[#E6FA50] bg-[#E6FA50]' : ''}">
                    {#if selectedMethod === method.id}
                      <div class="h-1.5 w-1.5 rounded-full bg-[#06121A]"></div>
                    {/if}
                  </div>
                </button>
              {/each}
            </div>
          </div>
        </div>

        <!-- Right — Order Breakdown (Sticky) -->
        <div class="lg:relative">
          <div class="lg:sticky lg:top-28">
            <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 space-y-6 shadow-2xl">
              <h3 class="heading-2 text-[#F7F7F7]">Payment Breakdown</h3>

              <div class="space-y-3 border-y border-white/[0.06] py-4 text-xs">
                <div class="flex justify-between">
                  <span class="text-[#F7F7F7]/40">Court Rental</span>
                  <span class="text-[#F7F7F7]">Rp {((booking.finalAmount || 200000) / 1000).toFixed(0)}K</span>
                </div>
                <div class="flex justify-between text-emerald-400">
                  <span>Voucher Discount</span>
                  <span>-Rp 0K</span>
                </div>
                <div class="flex justify-between pt-3 border-t border-white/[0.04]">
                  <span class="heading-3 text-[#F7F7F7]">Total Amount</span>
                  <span class="price text-[#E6FA50]">
                    Rp {((booking.finalAmount || 200000) / 1000).toFixed(0)}K
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={isPaying}
                onclick={handlePay}
                class="label btn-lime w-full flex h-12 items-center justify-center gap-2 rounded-full disabled:opacity-50"
              >
                {#if isPaying}
                  <Loader2 class="h-4 w-4 animate-spin" />
                  Processing Payment...
                {:else}
                  Pay Now · Rp {((booking.finalAmount || 200000) / 1000).toFixed(0)}K
                {/if}
              </button>

              <div class="flex items-center justify-center gap-2 caption text-[#F7F7F7]/25 text-center">
                <Shield class="h-3.5 w-3.5 text-[#50C8C8]" />
                <span>256-bit encrypted secure checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>