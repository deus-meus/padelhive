<script lang="ts">
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Info,
  Loader2,
  ShieldCheck,
  UserPlus,
  Users,
  Wallet,
  X,
  XCircle,
} from "lucide-svelte";
import { goto } from "$app/navigation";
import { page } from "$app/state";
import { api } from "$lib/api/client";
import { authStore } from "$lib/auth/store.svelte";
import EmptyState from "$lib/components/ui/empty-state.svelte";
import { formatBookingDate, formatBookingTimeRange } from "$lib/format";

const bookingId = $derived((page.params.id as string) || "");

let booking = $state<any | null>(null);
let invites = $state<any[]>([]);
let selectedMethod = $state("va");
let paymentIntent = $state<any | null>(null);

// Split payment states
let isSplitEnabled = $state(true);
let splitMode = $state<"equal" | "custom">("equal");
let customShares = $state<Record<string, number>>({});

let isLoading = $state(true);
let isPaying = $state(false);
let showCancelModal = $state(false);
let isCancelling = $state(false);
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
  error = null;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) {
      isLoading = false;
      return;
    }

    const [bRes, iRes, pRes] = await Promise.all([
      api.bookings({ id: bookingId }).get({
        headers: { authorization: `Bearer ${token}` },
      }),
      api.bookings({ id: bookingId }).invites.get({
        headers: { authorization: `Bearer ${token}` },
      }),
      api.payments.intents
        .post(
          {
            bookingId,
            provider: "internal",
            method: selectedMethod as "va" | "ewallet" | "card",
          },
          { headers: { authorization: `Bearer ${token}` } },
        )
        .catch(() => ({ data: null })),
    ]);

    if (bRes.data) booking = bRes.data;
    if (iRes.data) invites = iRes.data;
    if (pRes.data) paymentIntent = pRes.data;
  } catch (e: any) {
    console.warn("Payment load error:", e);
    error = e.message || "Failed to load payment details";
  } finally {
    isLoading = false;
  }
}

// Reactive auth tracking to support hard reload
$effect(() => {
  if (authStore.isInitialized) {
    if (authStore.firebaseUser) {
      loadData();
    } else {
      isLoading = false;
    }
  }
});

// Exclude current logged-in host user from invites list to prevent duplicate row
const filteredInvites = $derived.by(() => {
  if (!invites) return [];
  const userEmail = (
    authStore.user?.email ||
    authStore.firebaseUser?.email ||
    ""
  ).toLowerCase();
  const userName = (authStore.user?.name || "").toLowerCase();

  return invites.filter((inv) => {
    const invEmail = (inv.email || "").toLowerCase();
    const invName = (inv.name || "").toLowerCase();

    if (userEmail && invEmail && invEmail === userEmail) return false;
    if (userName && invName && invName === userName) return false;
    return true;
  });
});

// Accurate Data Calculations from Database
const courtRentalAmount = $derived(booking?.courtAmount || 300000);
const platformFeeAmount = $derived(booking?.platformFee || 15000);
const voucherDiscountAmount = $derived(booking?.voucherDiscount || 0);
const grandTotal = $derived(
  booking?.finalAmount ||
    courtRentalAmount + platformFeeAmount - voucherDiscountAmount,
);

// Total active players (User + filtered invited friends)
const totalPlayersCount = $derived(
  Math.max(1, 1 + (filteredInvites ? filteredInvites.length : 0)),
);

const pricePerPlayer = $derived(
  isSplitEnabled ? Math.round(grandTotal / totalPlayersCount) : grandTotal,
);

// Initialize default customShares when invites or pricePerPlayer changes
$effect(() => {
  const nextShares = { ...customShares };
  let changed = false;
  if (!("host" in nextShares)) {
    nextShares.host = pricePerPlayer;
    changed = true;
  }
  for (const inv of filteredInvites) {
    if (!(inv.id in nextShares)) {
      nextShares[inv.id] = pricePerPlayer;
      changed = true;
    }
  }
  if (changed) customShares = nextShares;
});

// Host assigned share
const hostAssignedShare = $derived.by(() => {
  if (!isSplitEnabled) return grandTotal;
  if (splitMode === "equal") return pricePerPlayer;
  return customShares.host ?? pricePerPlayer;
});

// Total assigned share for friends (equal or custom)
const totalFriendsAssignedShare = $derived.by(() => {
  if (!isSplitEnabled) return 0;
  if (splitMode === "equal") {
    return (totalPlayersCount - 1) * pricePerPlayer;
  }
  let sum = 0;
  for (const inv of filteredInvites) {
    sum += customShares[inv.id] ?? pricePerPlayer;
  }
  return sum;
});

// Host share in custom mode (Remaining balance)
const hostShareAmount = $derived.by(() => {
  if (!isSplitEnabled) return grandTotal;
  return Math.max(0, grandTotal - totalFriendsAssignedShare);
});

// Final host amount due right now
const userFinalPayAmount = $derived(hostShareAmount);

async function handlePay() {
  isPaying = true;
  error = null;

  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    // Ensure payment intent exists
    let intentId = paymentIntent?.id;
    if (!intentId) {
      const pRes = await api.payments.intents.post(
        {
          bookingId,
          provider: "internal",
          method: selectedMethod as "va" | "ewallet" | "card",
        },
        { headers: { authorization: `Bearer ${token}` } },
      );
      if (pRes.data) intentId = pRes.data.id;
    }

    if (!intentId) {
      throw new Error("Could not initialize payment transaction.");
    }

    const res = await api
      .payments({ id: intentId })
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

async function confirmCancelBooking() {
  isCancelling = true;
  error = null;

  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    await api.bookings({ id: bookingId }).cancel.patch(undefined, {
      headers: { authorization: `Bearer ${token}` },
    });

    showCancelModal = false;
    goto("/bookings");
  } catch (err: any) {
    error = err.message || "Failed to cancel booking";
  } finally {
    isCancelling = false;
  }
}
</script>

<svelte:head>
  <title>Payment Checkout | PadelHive</title>
</svelte:head>

<div class="min-h-screen pt-20 pb-24 bg-[#06121A]">
  <div class="container max-w-5xl pt-6">
    <!-- Back Navigation Link (Linear Icon Box Style) -->
    <a
      href={bookingId ? `/bookings/${bookingId}` : "/bookings"}
      class="group inline-flex items-center gap-3 text-xs font-medium text-[#F7F7F7]/60 transition-colors hover:text-[#F7F7F7]"
    >
      <div
        class="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-[#F7F7F7]/40 transition-all duration-200 group-hover:border-[#E6FA50]/40 group-hover:bg-[#E6FA50]/10 group-hover:text-[#E6FA50]"
      >
        <ArrowLeft class="h-3.5 w-3.5" />
      </div>
      <span>Back to booking summary</span>
    </a>

    <!-- Page Header (Unified Design System) -->
    <div class="mt-4 mb-8">
      <h1 class="heading-1 text-[#F7F7F7]">
        Payment Checkout
      </h1>
      <p class="body mt-1 text-[#F7F7F7]/40">
        Review your reservation details, manage split payments, and complete checkout.
      </p>
    </div>

    {#if error}
      <div
        class="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4"
      >
        <AlertCircle class="h-5 w-5 shrink-0 text-red-400" />
        <p class="body text-red-100/90">{error}</p>
      </div>
    {/if}

    {#if isLoading || !authStore.isInitialized || authStore.isLoading}
      <!-- Loading Skeleton -->
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div class="space-y-6">
          <div class="h-44 animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]"></div>
          <div class="h-64 animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]"></div>
          <div class="h-48 animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]"></div>
        </div>
        <div class="h-96 animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]"></div>
      </div>
    {:else if !booking}
      <!-- Empty Not Found -->
      <div class="mx-auto max-w-xl py-12 text-center">
        <EmptyState
          icon={CreditCard}
          title="Booking not found"
          description="This booking reservation could not be found or you don't have access to pay."
          actionLabel="Back to bookings"
          actionHref="/bookings"
        />
      </div>
    {:else}
      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <!-- Left Column: Details, Split Payment & Payment Method -->
        <div class="space-y-8 min-w-0">
          <!-- 1. BOOKING DETAILS CARD -->
          <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 space-y-4">
            <p class="section-label">BOOKING DETAILS</p>
            <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div class="rounded-xl bg-white/[0.02] p-3 border border-white/[0.04]">
                <p class="heading-3 text-[#F7F7F7]">{booking.venue?.name || "Padel Arena"}</p>
                <p class="caption mt-0.5 text-[#F7F7F7]/25">Venue</p>
              </div>

              <div class="rounded-xl bg-white/[0.02] p-3 border border-white/[0.04]">
                <p class="heading-3 text-[#F7F7F7]">
                  {booking.court?.name || "Court A"}
                  {#if booking.court?.type}
                    <span class="ml-1 text-xs text-[#F7F7F7]/40 uppercase font-normal">
                      ({booking.court.type})
                    </span>
                  {/if}
                </p>
                <p class="caption mt-0.5 text-[#F7F7F7]/25">Court</p>
              </div>

              <div class="rounded-xl bg-white/[0.02] p-3 border border-white/[0.04]">
                <p class="heading-3 text-[#F7F7F7]">
                  {booking.bookingDate ? formatBookingDate(new Date(booking.bookingDate)) : "Sat, Aug 15, 2026"}
                </p>
                <p class="caption mt-0.5 text-[#F7F7F7]/25">Date</p>
              </div>

              <div class="rounded-xl bg-white/[0.02] p-3 border border-white/[0.04]">
                <p class="heading-3 text-[#F7F7F7]">
                  {formatBookingTimeRange(booking.startsAt, booking.endsAt)}
                </p>
                <p class="caption mt-0.5 text-[#F7F7F7]/25">Time (WIB)</p>
              </div>
            </div>
          </div>

          <!-- 2. SPLIT PAYMENT SECTION -->
          <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 space-y-5">
            <!-- Header with Toggle -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <Users class="h-4 w-4 text-[#50C8C8]" />
                <div>
                  <p class="section-label">SPLIT PAYMENT</p>
                  <p class="body-sm text-[#F7F7F7]/40 mt-0.5">
                    Split the cost equally or enter custom amounts
                  </p>
                </div>
              </div>

              <!-- Toggle Switch -->
              <button
                type="button"
                role="switch"
                aria-checked={isSplitEnabled}
                aria-label="Toggle split payment"
                onclick={() => (isSplitEnabled = !isSplitEnabled)}
                class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none {isSplitEnabled ? 'bg-[#50C8C8]' : 'bg-white/[0.15]'}"
              >
                <span
                  class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out {isSplitEnabled ? 'translate-x-5' : 'translate-x-0'}"
                ></span>
              </button>
            </div>

            {#if isSplitEnabled}
              <!-- Mode selector: Equal vs Custom -->
              <div class="flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.02] p-1">
                <button
                  type="button"
                  onclick={() => (splitMode = "equal")}
                  class="flex-1 rounded-lg text-xs font-semibold transition-all {splitMode === 'equal' ? 'bg-white/10 text-[#F7F7F7] shadow-sm border border-white/10' : 'text-[#F7F7F7]/40 hover:text-[#F7F7F7]'}"
                >
                  Equal
                </button>
                <button
                  type="button"
                  onclick={() => (splitMode = "custom")}
                  class="flex-1 rounded-lg text-xs font-semibold transition-all {splitMode === 'custom' ? 'bg-white/10 text-[#F7F7F7] shadow-sm border border-white/10' : 'text-[#F7F7F7]/40 hover:text-[#F7F7F7]'}"
                >
                  Custom
                </button>
              </div>

              <!-- Mode Info/Notice box -->
              {#if splitMode === "equal"}
                <div class="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3.5 flex items-center gap-3">
                  <Info class="h-4 w-4 shrink-0 text-amber-400" />
                  <p class="body-sm text-amber-200/90 leading-relaxed">
                    Equal split active. Each player pays their equal share. Friends who haven't paid will be charged separately.
                  </p>
                </div>
              {:else}
                <div class="rounded-xl border border-[#50C8C8]/20 bg-[#50C8C8]/10 p-3.5 flex items-center gap-3">
                  <Info class="h-4 w-4 shrink-0 text-[#50C8C8]" />
                  <p class="body-sm text-[#50C8C8]/90 leading-relaxed">
                    Custom split active: Enter specific custom amounts for each friend. Remaining balance is assigned to You (Host).
                  </p>
                </div>
              {/if}

              <!-- Price Per Player / Custom Summary Bar -->
              <div class="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div>
                  <p class="heading-3 text-[#F7F7F7]">
                    {splitMode === "equal" ? "Price per player" : "Custom Split Summary"}
                  </p>
                  <p class="body-sm text-[#F7F7F7]/40 mt-0.5">
                    {#if splitMode === "equal"}
                      Total Rp {(grandTotal / 1000).toFixed(0)}K ÷ {totalPlayersCount} players
                    {:else}
                      Friends allocated: Rp {(totalFriendsAssignedShare / 1000).toFixed(0)}K · Host share: Rp {(hostShareAmount / 1000).toFixed(0)}K
                    {/if}
                  </p>
                </div>
                <span class="heading-2 text-[#F7F7F7]">
                  Rp {(hostShareAmount / 1000).toFixed(0)}K
                </span>
              </div>

              <!-- Players List -->
              <div class="space-y-3 pt-1">
                <!-- Host Row (Clean & Spacious) -->
                <div class="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.015] p-3.5">
                  <div class="flex items-center gap-3 min-w-0">
                    <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#50C8C8]/15 text-sm font-bold text-[#50C8C8]">
                      {(authStore.user?.name || authStore.user?.email || "U")[0].toUpperCase()}
                    </div>
                    <div class="min-w-0">
                      <p class="body-sm font-semibold text-[#F7F7F7] truncate">
                        {authStore.user?.name || "You (Host)"}
                      </p>
                      <p class="caption text-[#F7F7F7]/40">
                        Host Share · Rp {(hostShareAmount / 1000).toFixed(0)}K
                      </p>
                    </div>
                  </div>

                  <span class="label px-3.5 py-1.5 rounded-full font-semibold text-xs shrink-0 bg-[#50C8C8]/10 border border-[#50C8C8]/20 text-[#50C8C8]">
                    Pay Rp {(userFinalPayAmount / 1000).toFixed(0)}K
                  </span>
                </div>

                <!-- Invited Friends -->
                {#each filteredInvites as invite}
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.015] p-3.5">
                    <div class="flex items-center gap-3 min-w-0">
                      <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#50C8C8]/15 text-sm font-bold text-[#50C8C8]">
                        {(invite.name || invite.email || "F")[0].toUpperCase()}
                      </div>
                      <div class="min-w-0">
                        <p class="body-sm font-semibold text-[#F7F7F7] truncate">
                          {invite.name || invite.email}
                        </p>
                        <p class="caption text-[#F7F7F7]/40">
                          {invite.status === "ACCEPTED" ? "Paid" : "Pending RSVP"}
                        </p>
                      </div>
                    </div>

                    <div class="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t border-white/[0.04] sm:border-t-0">
                      {#if splitMode === "equal"}
                        <span class="body-sm font-medium text-[#F7F7F7]/80">
                          Rp {(pricePerPlayer / 1000).toFixed(0)}K
                        </span>
                      {:else}
                        <!-- Clean Neutral Custom Share Input (No Lime Text) -->
                        <div class="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 transition-colors focus-within:border-[#50C8C8]/50">
                          <span class="text-xs text-[#F7F7F7]/40">Rp</span>
                          <input
                            type="number"
                            step="5000"
                            min="0"
                            value={customShares[invite.id] ?? pricePerPlayer}
                            oninput={(e) => {
                              const val = Number((e.target as HTMLInputElement).value) || 0;
                              customShares[invite.id] = val;
                            }}
                            class="w-24 bg-transparent text-sm font-medium text-[#F7F7F7] focus:outline-none"
                          />
                        </div>
                      {/if}

                      {#if invite.status === "ACCEPTED"}
                        <div class="flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-400 shrink-0">
                          <CheckCircle2 class="h-3.5 w-3.5" />
                          <span>Paid</span>
                        </div>
                      {:else}
                        <div class="flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1 text-xs font-medium text-[#F7F7F7]/60 shrink-0">
                          <Clock class="h-3.5 w-3.5 text-[#50C8C8]" />
                          <span>Pending</span>
                        </div>
                      {/if}
                    </div>
                  </div>
                {/each}
              </div>

              <!-- Invite Friends Button Shortcut -->
              <a
                href="/booking/{bookingId}/invite"
                class="flex items-center justify-center gap-2.5 rounded-xl border border-dashed border-white/[0.12] bg-white/[0.01] p-3.5 body-sm font-medium text-[#F7F7F7]/70 transition-all hover:border-[#E6FA50]/40 hover:bg-[#E6FA50]/5 hover:text-[#E6FA50]"
              >
                <UserPlus class="h-4 w-4" />
                <span>Invite more friends to split cost</span>
              </a>
            {/if}
          </div>

          <!-- 3. PAYMENT METHOD SECTION -->
          <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 space-y-4">
            <p class="section-label">PAYMENT METHOD</p>
            <div class="space-y-3">
              {#each PAYMENT_METHODS as method}
                {@const MethodIcon = method.icon}
                <button
                  type="button"
                  onclick={() => (selectedMethod = method.id)}
                  class="flex w-full items-center justify-between rounded-xl border p-4 text-left transition-all {selectedMethod ===
                  method.id
                    ? 'border-[#50C8C8]/50 bg-white/[0.03] shadow-sm'
                    : 'border-white/[0.06] bg-white/[0.015] hover:border-white/[0.12]'}"
                >
                  <div class="flex items-center gap-3.5">
                    <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04]">
                      <MethodIcon class="h-5 w-5 text-[#50C8C8]" />
                    </div>
                    <div>
                      <p class="heading-3 text-[#F7F7F7]">{method.label}</p>
                      <p class="body-sm text-[#F7F7F7]/40">{method.description}</p>
                    </div>
                  </div>
                  <!-- Radio Button Circle Indicator with Dark Inner Knob -->
                  <div class="flex h-5 w-5 items-center justify-center rounded-full border transition-colors {selectedMethod === method.id ? 'border-[#50C8C8] bg-[#50C8C8]' : 'border-white/20'}">
                    {#if selectedMethod === method.id}
                      <div class="h-2 w-2 rounded-full bg-[#06121A] -translate-x-[0.5px] -translate-y-[0.5px]"></div>
                    {/if}
                  </div>
                </button>
              {/each}
            </div>
          </div>
        </div>

        <!-- Right Column: Order Summary (Sticky) -->
        <div class="lg:relative">
          <div class="lg:sticky lg:top-24">
            <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 space-y-6 shadow-2xl">
              <p class="section-label">ORDER SUMMARY</p>

              <div class="space-y-3 border-y border-white/[0.06] py-4">
                <div class="flex justify-between items-center">
                  <span class="body-sm text-[#F7F7F7]/60">Court rental</span>
                  <span class="heading-3 text-[#F7F7F7]">Rp {(courtRentalAmount / 1000).toFixed(0)}K</span>
                </div>

                <div class="flex justify-between items-center">
                  <span class="body-sm text-[#F7F7F7]/60">Platform fee (5%)</span>
                  <span class="heading-3 text-[#F7F7F7]">Rp {(platformFeeAmount / 1000).toFixed(0)}K</span>
                </div>

                {#if voucherDiscountAmount > 0}
                  <div class="flex justify-between items-center text-emerald-400">
                    <span class="body-sm">Voucher discount</span>
                    <span class="heading-3">-Rp {(voucherDiscountAmount / 1000).toFixed(0)}K</span>
                  </div>
                {/if}

                {#if isSplitEnabled && totalFriendsAssignedShare > 0}
                  <div class="flex justify-between items-center text-emerald-400">
                    <span class="body-sm">Friends share (Pending)</span>
                    <span class="heading-3">-Rp {(totalFriendsAssignedShare / 1000).toFixed(0)}K</span>
                  </div>
                {/if}

                <div class="flex justify-between items-baseline pt-3 border-t border-white/[0.06]">
                  <span class="heading-2 text-[#F7F7F7]">You pay</span>
                  <span class="metric text-[#F7F7F7]">
                    Rp {(userFinalPayAmount / 1000).toFixed(0)}K
                  </span>
                </div>
              </div>

              <!-- Pay CTA Button -->
              <button
                type="button"
                disabled={isPaying || isCancelling}
                onclick={handlePay}
                class="btn-lime label flex h-12 w-full items-center justify-center gap-2 rounded-full font-bold text-[#06121A] disabled:opacity-50"
              >
                {#if isPaying}
                  <Loader2 class="h-4 w-4 animate-spin" />
                  <span>Processing Payment...</span>
                {:else}
                  <span>Pay Now · Rp {(userFinalPayAmount / 1000).toFixed(0)}K</span>
                {/if}
              </button>

              <!-- Sleek Cancel Reservation Link -->
              <button
                type="button"
                disabled={isPaying || isCancelling}
                onclick={() => (showCancelModal = true)}
                class="w-full text-center text-xs font-medium text-[#F7F7F7]/40 transition-colors hover:text-red-400 hover:underline pt-1"
              >
                Cancel reservation
              </button>

              <!-- Security guarantee -->
              <div class="flex items-center justify-center gap-2 caption text-[#F7F7F7]/40 text-center">
                <ShieldCheck class="h-4 w-4 text-[#50C8C8]" />
                <span>Secure payment provided by Midtrans</span>
              </div>

              <!-- Cancellation policy note box -->
              <div class="rounded-xl border border-white/[0.04] bg-white/[0.015] p-3 caption text-[#F7F7F7]/40 leading-relaxed">
                Free cancellation up to 24h before booking. After that, standard refund policy applies.
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>

  <!-- Cancel Reservation Confirmation Modal -->
  {#if showCancelModal}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
      <div class="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0C1B26] p-6 space-y-5 shadow-2xl">
        <div class="flex items-start justify-between">
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
            <AlertTriangle class="h-6 w-6 translate-x-[1px] -translate-y-[1px]" />
          </div>
          <button
            type="button"
            onclick={() => (showCancelModal = false)}
            class="rounded-lg p-1.5 text-[#F7F7F7]/40 transition-colors hover:bg-white/[0.04] hover:text-[#F7F7F7]"
          >
            <X class="h-4 w-4" />
          </button>
        </div>

        <div>
          <h3 class="heading-3 font-semibold text-[#F7F7F7]">Cancel Reservation</h3>
          <p class="body-sm text-[#F7F7F7]/60 mt-1.5 leading-relaxed">
            Are you sure you want to cancel this booking reservation? Your selected court slot will be released back to the venue.
          </p>
        </div>

        {#if booking}
          <div class="rounded-xl border border-white/[0.06] bg-white/[0.015] p-3.5 space-y-2 text-xs">
            <div class="flex justify-between items-center">
              <span class="caption text-[#F7F7F7]/40">Venue</span>
              <span class="body-sm font-semibold text-[#F7F7F7]">{booking.venue?.name || "Padel Arena"}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="caption text-[#F7F7F7]/40">Court</span>
              <span class="body-sm font-semibold text-[#F7F7F7]">{booking.court?.name || "Court A"}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="caption text-[#F7F7F7]/40">Time</span>
              <span class="body-sm font-semibold text-[#F7F7F7]">{formatBookingTimeRange(booking.startsAt, booking.endsAt)}</span>
            </div>
          </div>
        {/if}

        <div class="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onclick={() => (showCancelModal = false)}
            class="label flex h-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.02] text-[#F7F7F7]/80 transition-colors hover:bg-white/[0.05] hover:text-[#F7F7F7]"
          >
            Keep Reservation
          </button>
          <button
            type="button"
            disabled={isCancelling}
            onclick={confirmCancelBooking}
            class="label flex h-11 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/15 text-red-400 font-bold transition-all hover:bg-red-500/25 disabled:opacity-50"
          >
            {isCancelling ? "Cancelling..." : "Confirm Cancel"}
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
