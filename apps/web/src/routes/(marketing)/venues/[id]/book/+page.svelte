<script lang="ts">
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Info,
  Loader2,
  MapPin,
  ShieldCheck,
  Tag,
  Ticket,
  Users,
  X,
} from "lucide-svelte";
import { goto } from "$app/navigation";
import { page } from "$app/state";
import { api } from "$lib/api/client";
import { authStore } from "$lib/auth/store.svelte";
import EmptyState from "$lib/components/ui/empty-state.svelte";
import { formatBookingDate } from "$lib/format";

const venueId = $derived((page.params.id as string) || "");

let venue = $state<any | null>(null);
let courts = $state<any[]>([]);

// Selection states
let selectedDate = $state(new Date().toISOString().split("T")[0]);
let selectedCourtId = $state("");
let selectedSlots = $state<any[]>([]);

let availability = $state<any | null>(null);
let isLoadingVenue = $state(true);
let isLoadingAvailability = $state(false);
let isSubmitting = $state(false);

// Date pagination state (7 days per page, no scrollbar)
let datePage = $state(0);

// Protection & Voucher states
let isRefundProtection = $state(true);
let voucherCode = $state("");
let voucherDiscount = $state(0);
let voucherError = $state<string | null>(null);
let isValidatingVoucher = $state(false);
let error = $state<string | null>(null);

// 14 days ahead
const dateOptions = $derived.by(() => {
  const list: { iso: string; day: string; dateNum: number; full: string }[] =
    [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const iso = d.toISOString().split("T")[0];
    const day = d.toLocaleDateString("en-US", { weekday: "short" });
    const dateNum = d.getDate();
    list.push({ iso, day, dateNum, full: formatBookingDate(d) });
  }
  return list;
});

// Currently visible 7 dates for the active page
const visibleDateOptions = $derived.by(() => {
  const start = datePage * 7;
  return dateOptions.slice(start, start + 7);
});

function prevDatePage() {
  if (datePage > 0) datePage--;
}

function nextDatePage() {
  if ((datePage + 1) * 7 < dateOptions.length) datePage++;
}

async function loadData() {
  if (!venueId) return;
  isLoadingVenue = true;
  try {
    const [vRes, cRes] = await Promise.all([
      api.venues({ id: venueId }).get(),
      api.venues({ id: venueId }).courts.get(),
    ]);

    if (vRes.data) venue = vRes.data;
    if (cRes.data && cRes.data.length > 0) {
      courts = cRes.data;
      if (!selectedCourtId) {
        selectedCourtId = courts[0].id;
      }
    }
  } catch (e) {
    console.warn("Load error:", e);
  } finally {
    isLoadingVenue = false;
  }
}

async function loadAvailability() {
  if (!venueId || !selectedDate) return;
  isLoadingAvailability = true;
  try {
    const res = await api.venues({ id: venueId }).availability.get({
      query: { date: selectedDate, courtId: selectedCourtId || undefined },
    });
    if (res.data) {
      availability = res.data;
    }
  } catch (e) {
    console.warn("Availability fetch error:", e);
  } finally {
    isLoadingAvailability = false;
  }
}

// Reactive auth tracking to support hard reload
$effect(() => {
  if (authStore.isInitialized) {
    loadData();
  }
});

$effect(() => {
  if (venueId && selectedDate) {
    loadAvailability();
  }
});

const activeCourtSlots = $derived.by(() => {
  if (!availability?.courts) return [];
  const matched = availability.courts.find(
    (c: any) => c.id === selectedCourtId,
  );
  return matched ? matched.slots : (availability.courts[0]?.slots ?? []);
});

const selectedCourt = $derived(
  courts.find((c) => c.id === selectedCourtId) ?? courts[0],
);

// Multi-Hour & Unselect Slot Handler
function handleSlotClick(slot: any) {
  const isBooked = !slot.available || slot.booked || slot.isBooked;
  if (isBooked) return;

  // Single slot already selected -> unselect on second click
  if (
    selectedSlots.length === 1 &&
    selectedSlots[0].startsAt === slot.startsAt
  ) {
    selectedSlots = [];
    return;
  }

  // No slots selected -> select this single slot
  if (selectedSlots.length === 0) {
    selectedSlots = [slot];
    return;
  }

  // 1 slot currently selected -> select range to clicked slot (multi-hour 2+ hrs)
  if (selectedSlots.length === 1) {
    const firstIdx = activeCourtSlots.findIndex(
      (s: any) => s.startsAt === selectedSlots[0].startsAt,
    );
    const targetIdx = activeCourtSlots.findIndex(
      (s: any) => s.startsAt === slot.startsAt,
    );

    if (firstIdx !== -1 && targetIdx !== -1) {
      const minIdx = Math.min(firstIdx, targetIdx);
      const maxIdx = Math.max(firstIdx, targetIdx);
      const range = activeCourtSlots.slice(minIdx, maxIdx + 1);

      // Verify no booked slots inside range
      const hasBooked = range.some(
        (s: any) => !s.available || s.booked || s.isBooked,
      );
      if (!hasBooked) {
        selectedSlots = range;
        return;
      }
    }
  }

  // If multi-slots selected or range invalid -> reset to clicked slot
  selectedSlots = [slot];
}

function isSlotSelected(slot: any): boolean {
  return selectedSlots.some((s) => s.startsAt === slot.startsAt);
}

// Calculations derived from selectedSlots
const hasSelectedSlots = $derived(selectedSlots.length > 0);
const firstSelectedSlot = $derived(selectedSlots[0] || null);
const lastSelectedSlot = $derived(
  selectedSlots[selectedSlots.length - 1] || null,
);

function calculateEndsAt(startsAtStr: string): string {
  if (!startsAtStr) return "";
  const [h, m] = startsAtStr.split(":").map(Number);
  return `${String((h + 1) % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const formattedStartsAt = $derived(
  firstSelectedSlot ? firstSelectedSlot.startsAt : "",
);
const formattedEndsAt = $derived(
  lastSelectedSlot ? calculateEndsAt(lastSelectedSlot.startsAt) : "",
);
const durationMinutes = $derived(selectedSlots.length * 60);

const courtRentalPrice = $derived(
  selectedSlots.reduce((acc, s) => acc + (s.price || 200000), 0),
);
const platformFee = $derived(
  hasSelectedSlots ? Math.round(courtRentalPrice * 0.05) : 0,
);
const refundProtectionFee = $derived(
  isRefundProtection && hasSelectedSlots ? 15000 : 0,
);
const totalDue = $derived(
  Math.max(
    0,
    courtRentalPrice + platformFee + refundProtectionFee - voucherDiscount,
  ),
);

async function handleApplyVoucher() {
  if (!voucherCode.trim()) return;
  isValidatingVoucher = true;
  voucherError = null;
  try {
    const amount = hasSelectedSlots ? courtRentalPrice : 200000;
    const res = await api.vouchers.validate.post({
      code: voucherCode.trim(),
      amount,
    });
    if (res.data) {
      voucherDiscount = res.data.discount;
    }
  } catch (err: any) {
    voucherError = err.message || "Invalid voucher code";
    voucherDiscount = 0;
  } finally {
    isValidatingVoucher = false;
  }
}

async function handleCreateBooking(e: SubmitEvent) {
  e.preventDefault();
  if (!authStore.user) {
    goto(`/auth/login?next=/venues/${venueId}/book`);
    return;
  }
  if (!selectedCourtId || !selectedDate || !hasSelectedSlots) {
    error = "Please select a court, date, and at least one time slot.";
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
        bookingDate: selectedDate,
        startsAt: formattedStartsAt,
        endsAt: formattedEndsAt,
        voucherCode: voucherCode || undefined,
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
</script>

<svelte:head>
  <title>Book Court | {venue?.name ?? "PadelHive"}</title>
</svelte:head>

<div class="min-h-screen pt-20 pb-24 bg-[#06121A]">
  {#if isLoadingVenue}
    <div class="container py-12 space-y-6">
      <div class="h-8 w-48 animate-pulse rounded-md bg-white/[0.04]"></div>
      <div class="h-[400px] animate-pulse rounded-2xl bg-white/[0.04]"></div>
    </div>
  {:else if !venue}
    <div class="container py-16 text-center">
      <EmptyState
        icon={MapPin}
        title="Venue not found"
        description="This venue is unavailable or no longer listed."
        actionLabel="Back to venues"
        actionHref="/venues"
      />
    </div>
  {:else}
    <div class="container pt-6">
      <!-- Back Navigation Link (Linear Icon Box Style) -->
      <a
        href="/venues/{venue.id}"
        class="group inline-flex items-center gap-3 text-xs font-medium text-[#F7F7F7]/60 transition-colors hover:text-[#F7F7F7]"
      >
        <div
          class="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-[#F7F7F7]/40 transition-all duration-200 group-hover:border-[#E6FA50]/40 group-hover:bg-[#E6FA50]/10 group-hover:text-[#E6FA50]"
        >
          <ArrowLeft class="h-3.5 w-3.5" />
        </div>
        <span>Back to {venue.name}</span>
      </a>

      <!-- Page Title & Subhead -->
      <div class="mt-4 mb-8">
        <h1 class="heading-1 text-[#F7F7F7]">
          Book a <span class="text-[#E6FA50]">Court</span>
        </h1>
        <p class="body mt-1 flex items-center gap-2 text-[#F7F7F7]/40">
          <MapPin class="h-3.5 w-3.5 text-[#50C8C8]" />
          <span>{venue.name} · {venue.city || "Bali"}</span>
        </p>
      </div>

      {#if error}
        <div class="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 flex items-center gap-3">
          <AlertCircle class="h-5 w-5 shrink-0 text-red-400" />
          <p class="body text-red-100/90">{error}</p>
        </div>
      {/if}

      <form onsubmit={handleCreateBooking} class="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <!-- Left Column: Selection Steps 1, 2, 3 -->
        <div class="space-y-8 min-w-0">
          <!-- Step 1: SELECT COURT -->
          <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 space-y-4 shadow-xl">
            <div class="flex items-center gap-3">
              <div class="flex h-6 w-6 items-center justify-center rounded-full bg-[#50C8C8]/15 text-xs font-bold text-[#50C8C8]">
                1
              </div>
              <h2 class="text-xs font-semibold tracking-wider text-[#50C8C8] uppercase">
                SELECT COURT
              </h2>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {#each courts as c}
                <button
                  type="button"
                  onclick={() => {
                    if (selectedCourtId !== c.id) {
                      selectedCourtId = c.id;
                      selectedSlots = [];
                    }
                  }}
                  class="flex flex-col items-start rounded-xl border p-4 transition-all text-left {selectedCourtId ===
                  c.id
                    ? 'border-[#E6FA50] bg-[#E6FA50]/10 shadow-sm'
                    : 'border-white/[0.06] bg-white/[0.015] hover:border-white/[0.12]'}"
                >
                  <div class="flex items-center justify-between w-full">
                    <span class="heading-3 text-[#F7F7F7]">{c.name}</span>
                    <span class="caption rounded px-2 py-0.5 uppercase font-medium bg-white/[0.06] text-[#F7F7F7]/60">
                      {c.type}
                    </span>
                  </div>
                  <span class="caption mt-2 text-[#50C8C8] font-semibold">
                    From Rp {((c.weekdayOffPeak ?? 200000) / 1000).toFixed(0)}K/hr
                  </span>
                </button>
              {/each}
            </div>
          </div>

          <!-- Step 2: SELECT DATE (1:1 Pager Grid from Image #108 & Image #110 - No Scrollbar) -->
          <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 space-y-4 shadow-xl">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="flex h-6 w-6 items-center justify-center rounded-full bg-[#50C8C8]/15 text-xs font-bold text-[#50C8C8]">
                  2
                </div>
                <h2 class="text-xs font-semibold tracking-wider text-[#50C8C8] uppercase flex items-center gap-2">
                  <Calendar class="h-4 w-4" />
                  SELECT DATE
                </h2>
              </div>

              <!-- Pager Navigation Buttons (< >) -->
              <div class="flex items-center gap-1.5">
                <button
                  type="button"
                  onclick={prevDatePage}
                  disabled={datePage === 0}
                  aria-label="Previous dates"
                  class="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-[#F7F7F7]/60 transition-colors hover:border-white/[0.2] hover:text-[#F7F7F7] disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  <ChevronLeft class="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onclick={nextDatePage}
                  disabled={(datePage + 1) * 7 >= dateOptions.length}
                  aria-label="Next dates"
                  class="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-[#F7F7F7]/60 transition-colors hover:border-white/[0.2] hover:text-[#F7F7F7] disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  <ChevronRight class="h-4 w-4" />
                </button>
              </div>
            </div>

            <!-- 7-Column Date Grid (No Scrollbar) -->
            <div class="grid grid-cols-7 gap-2 pt-1">
              {#each visibleDateOptions as item}
                <button
                  type="button"
                  onclick={() => {
                    selectedDate = item.iso;
                    selectedSlots = [];
                  }}
                  class="flex flex-col items-center justify-center rounded-xl border py-3 px-1 transition-all {selectedDate ===
                  item.iso
                    ? 'border-[#E6FA50] bg-[#E6FA50]/15 text-[#E6FA50] shadow-sm'
                    : 'border-white/[0.06] bg-white/[0.015] text-[#F7F7F7]/60 hover:border-white/[0.12] hover:text-[#F7F7F7]'}"
                >
                  <span class="metric text-lg sm:text-xl font-bold">{item.dateNum}</span>
                  <div class="flex items-center gap-1 caption uppercase font-medium mt-1 text-[11px]">
                    <span>{item.day}</span>
                    {#if item.iso === new Date().toISOString().split("T")[0]}
                      <span class="text-[#50C8C8] font-bold">Today</span>
                    {/if}
                  </div>
                </button>
              {/each}
            </div>
          </div>

          <!-- Step 3: SELECT TIME (Multi-Hour & Unselect Support) -->
          <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 space-y-4 shadow-xl">
            <div class="flex items-center gap-3">
              <div class="flex h-6 w-6 items-center justify-center rounded-full bg-[#50C8C8]/15 text-xs font-bold text-[#50C8C8]">
                3
              </div>
              <h2 class="text-xs font-semibold tracking-wider text-[#50C8C8] uppercase flex items-center gap-2">
                <Clock class="h-4 w-4" />
                SELECT TIME
              </h2>
            </div>
            <p class="body-sm text-[#F7F7F7]/40">
              Each slot is 1 hour. Tap a slot to select that hour, or tap a start and end slot to select a longer range (2+ hours). Tap again to unselect.
            </p>

            {#if isLoadingAvailability}
              <div class="grid grid-cols-3 gap-2.5 sm:grid-cols-6 pt-1">
                {#each Array.from({ length: 12 }) as _}
                  <div class="h-16 animate-pulse rounded-xl bg-white/[0.04]"></div>
                {/each}
              </div>
            {:else if activeCourtSlots.length === 0}
              <p class="body-sm text-[#F7F7F7]/40 py-4">
                No slots available on this date. Please pick another date or court.
              </p>
            {:else}
              <div class="grid grid-cols-3 gap-2.5 sm:grid-cols-6 pt-1">
                {#each activeCourtSlots as slot}
                  {@const isBooked = !slot.available || slot.booked || slot.isBooked}
                  {@const selected = isSlotSelected(slot)}
                  <button
                    type="button"
                    disabled={isBooked}
                    onclick={() => handleSlotClick(slot)}
                    class="flex flex-col items-center justify-center rounded-xl border p-3 transition-all {isBooked
                      ? 'border-transparent bg-white/[0.02] text-[#F7F7F7]/20 line-through cursor-not-allowed opacity-40 pointer-events-none'
                      : selected
                        ? 'border-[#E6FA50] bg-[#E6FA50]/20 text-[#E6FA50] font-bold shadow-sm'
                        : slot.isPeak
                          ? 'border-[#E6FA50]/20 bg-[#E6FA50]/5 text-[#E6FA50]/80 hover:border-[#E6FA50]/40'
                          : 'border-white/[0.06] bg-white/[0.015] text-[#F7F7F7]/80 hover:border-[#50C8C8]/40 hover:text-[#50C8C8]'}"
                  >
                    <span class="label font-bold">{slot.startsAt}</span>
                    <span class="caption mt-0.5 text-[#F7F7F7]/40">
                      Rp {(slot.price / 1000).toFixed(0)}K
                    </span>
                  </button>
                {/each}
              </div>

              <!-- Legend -->
              <div class="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/[0.04]">
                <div class="flex items-center gap-5">
                  <div class="flex items-center gap-2">
                    <div class="h-2.5 w-2.5 rounded-sm border border-white/[0.08] bg-[#0C1B26]"></div>
                    <span class="caption text-[#F7F7F7]/40">Available</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="h-2.5 w-2.5 rounded-sm border border-[#E6FA50]/30 bg-[#E6FA50]/10"></div>
                    <span class="caption text-[#F7F7F7]/40">Peak Hour</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="h-2.5 w-2.5 rounded-sm bg-white/[0.02]"></div>
                    <span class="caption text-[#F7F7F7]/40">Booked</span>
                  </div>
                </div>
              </div>
            {/if}
          </div>
        </div>

        <!-- Right Column: Booking Summary (Sticky) -->
        <div class="lg:relative">
          <div class="lg:sticky lg:top-24 space-y-4">
            <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 space-y-5 shadow-2xl">
              <p class="section-label">BOOKING SUMMARY</p>

              <div class="space-y-3 border-y border-white/[0.06] py-4 text-xs">
                <div class="flex justify-between items-center">
                  <span class="text-[#F7F7F7]/40">Venue</span>
                  <span class="heading-3 text-[#F7F7F7]">{venue.name}</span>
                </div>

                <div class="flex justify-between items-center">
                  <span class="text-[#F7F7F7]/40">Court</span>
                  <span class="heading-3 text-[#F7F7F7]">{selectedCourt?.name ?? "Court A"}</span>
                </div>

                <div class="flex justify-between items-center">
                  <span class="text-[#F7F7F7]/40">Date</span>
                  <span class="heading-3 text-[#F7F7F7]">
                    {selectedDate ? formatBookingDate(new Date(selectedDate)) : "Mon, Aug 31, 2026"}
                  </span>
                </div>

                <div class="flex justify-between items-center">
                  <span class="text-[#F7F7F7]/40">Time (WIB)</span>
                  <span class="heading-3 {hasSelectedSlots ? 'text-[#E6FA50]' : 'text-[#F7F7F7]/40'}">
                    {hasSelectedSlots ? `${formattedStartsAt} – ${formattedEndsAt} WIB` : "Not selected"}
                  </span>
                </div>

                <div class="flex justify-between items-center">
                  <span class="text-[#F7F7F7]/40">Duration</span>
                  <span class="heading-3 text-[#F7F7F7]">
                    {hasSelectedSlots ? `${durationMinutes} min (${durationMinutes / 60} hr)` : "—"}
                  </span>
                </div>

                <div class="space-y-2 pt-3 border-t border-white/[0.04]">
                  <div class="flex justify-between items-center">
                    <span class="text-[#F7F7F7]/40">Court rental</span>
                    <span class="heading-3 text-[#F7F7F7]">
                      {hasSelectedSlots ? `Rp ${(courtRentalPrice / 1000).toFixed(0)}K` : "—"}
                    </span>
                  </div>

                  <div class="flex justify-between items-center">
                    <span class="text-[#F7F7F7]/40">Platform fee (5%)</span>
                    <span class="heading-3 text-[#F7F7F7]">
                      {hasSelectedSlots ? `Rp ${(platformFee / 1000).toFixed(0)}K` : "—"}
                    </span>
                  </div>

                  {#if isRefundProtection}
                    <div class="flex justify-between items-center">
                      <span class="text-[#F7F7F7]/40">Refund Protection</span>
                      <span class="heading-3 text-[#F7F7F7]">Rp 15K</span>
                    </div>
                  {/if}

                  {#if voucherDiscount > 0}
                    <div class="flex justify-between items-center text-emerald-400">
                      <span>Voucher discount</span>
                      <span class="heading-3">-Rp {(voucherDiscount / 1000).toFixed(0)}K</span>
                    </div>
                  {/if}
                </div>

                <div class="flex justify-between items-baseline pt-3 border-t border-white/[0.06]">
                  <span class="heading-2 text-[#F7F7F7]">Total</span>
                  <span class="metric text-[#E6FA50]">
                    {hasSelectedSlots ? `Rp ${(totalDue / 1000).toFixed(0)}K` : "—"}
                  </span>
                </div>
              </div>

              <!-- Add Refund Protection Checkbox Box -->
              <label class="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.015] p-3.5 cursor-pointer hover:border-white/[0.12] transition-colors">
                <input
                  type="checkbox"
                  bind:checked={isRefundProtection}
                  class="mt-0.5 h-4 w-4 rounded border-white/20 accent-[#E6FA50]"
                />
                <div>
                  <p class="body-sm font-semibold text-[#F7F7F7]">Add Refund Protection</p>
                  <p class="caption text-[#F7F7F7]/40 mt-0.5 leading-relaxed">
                    Get 100% refund eligibility up to 2 hours before playing for Rp 15.000 flat.
                  </p>
                </div>
              </label>

              <!-- Voucher Code Section -->
              <div class="space-y-2">
                <p class="section-label">VOUCHER</p>
                <div class="flex gap-2">
                  <input
                    type="text"
                    bind:value={voucherCode}
                    placeholder="ENTER CODE"
                    class="body-sm flex-1 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-2 uppercase text-[#F7F7F7] placeholder:text-[#F7F7F7]/25 focus:border-[#50C8C8]/40 focus:outline-none"
                  />
                  <button
                    type="button"
                    onclick={handleApplyVoucher}
                    disabled={isValidatingVoucher || !voucherCode.trim()}
                    class="btn-outline-white label h-9 px-4 rounded-xl text-xs font-semibold disabled:opacity-40"
                  >
                    {isValidatingVoucher ? "..." : "Apply"}
                  </button>
                </div>
                {#if voucherError}
                  <p class="caption text-red-400 mt-1">{voucherError}</p>
                {:else if voucherDiscount > 0}
                  <p class="caption text-emerald-400 mt-1">
                    Voucher applied! -Rp {(voucherDiscount / 1000).toFixed(0)}K
                  </p>
                {/if}
              </div>

              {#if !hasSelectedSlots}
                <div class="rounded-xl border border-white/[0.06] bg-white/[0.015] p-3 text-center">
                  <p class="caption text-[#F7F7F7]/40">
                    Select at least one available time slot to continue.
                  </p>
                </div>
              {/if}

              <!-- Submit CTA Button -->
              <button
                type="submit"
                disabled={!hasSelectedSlots || isSubmitting}
                class="btn-lime label flex h-12 w-full items-center justify-center gap-2 rounded-full font-bold text-[#06121A] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {#if isSubmitting}
                  <Loader2 class="h-4 w-4 animate-spin" />
                  <span>Creating Reservation...</span>
                {:else}
                  <span>Continue to Invite & Pay</span>
                {/if}
              </button>

              <div class="space-y-2 caption text-[#F7F7F7]/40 text-center pt-1">
                <div class="flex items-center justify-center gap-2">
                  <Info class="h-3.5 w-3.5 text-[#50C8C8]" />
                  <span>Free cancellation up to 24 hours before booking</span>
                </div>
                <div class="flex items-center justify-center gap-2 text-[#F7F7F7]/30">
                  <Users class="h-3.5 w-3.5" />
                  <span>You can invite friends after booking</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  {/if}
</div>
