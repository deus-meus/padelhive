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
import { onMount } from "svelte";
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
let selectedSlot = $state<any | null>(null);

let availability = $state<any | null>(null);
let isLoadingVenue = $state(true);
let isLoadingAvailability = $state(false);
let isSubmitting = $state(false);

// Voucher states
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
      selectedCourtId = courts[0].id;
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

async function handleApplyVoucher() {
  if (!voucherCode.trim()) return;
  isValidatingVoucher = true;
  voucherError = null;
  try {
    const amount = selectedSlot ? selectedSlot.price : 200000;
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
  if (!selectedCourtId || !selectedDate || !selectedSlot) {
    error = "Please select a court, date, and time slot.";
    return;
  }

  isSubmitting = true;
  error = null;

  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    const startsAt = selectedSlot.startsAt;
    // Assume 1 hour slot
    const [h, m] = startsAt.split(":").map(Number);
    const endsAt = `${String(h + 1).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

    const res = await api.bookings.post(
      {
        venueId,
        courtId: selectedCourtId,
        bookingDate: selectedDate,
        startsAt,
        endsAt,
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

onMount(() => {
  loadData();
});
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
      <!-- Back link -->
      <a
        href="/venues/{venue.id}"
        class="inline-flex items-center gap-1.5 label text-[#F7F7F7]/40 transition-colors hover:text-[#F7F7F7]"
      >
        <ArrowLeft class="h-4 w-4" />
        Back to {venue.name}
      </a>

      <!-- Page title -->
      <div class="mt-4 mb-8">
        <h1 class="heading-1 text-[#F7F7F7]">
          Book Court at <span class="text-[#E6FA50]">{venue.name}</span>
        </h1>
        <p class="body mt-1 text-[#F7F7F7]/40">
          Select date, court, and time slot to reserve.
        </p>
      </div>

      {#if error}
        <div class="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <p class="body text-red-100/80">{error}</p>
        </div>
      {/if}

      <form onsubmit={handleCreateBooking} class="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
        <!-- Left — Selection Steps -->
        <div class="space-y-10">
          <!-- Step 1: Select Date -->
          <div>
            <h2 class="heading-2 text-[#F7F7F7] mb-4">1. Select Date</h2>
            <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {#each dateOptions as item}
                <button
                  type="button"
                  onclick={() => {
                    selectedDate = item.iso;
                    selectedSlot = null;
                  }}
                  class="flex min-w-[72px] flex-col items-center justify-center rounded-xl border p-3 transition-all {selectedDate ===
                  item.iso
                    ? 'border-[#E6FA50] bg-[#E6FA50]/15 text-[#E6FA50]'
                    : 'border-white/[0.08] bg-[#0C1B26] text-[#F7F7F7]/60 hover:border-[#50C8C8]/40'}"
                >
                  <span class="caption uppercase">{item.day}</span>
                  <span class="metric mt-1 text-lg">{item.dateNum}</span>
                </button>
              {/each}
            </div>
          </div>

          <!-- Step 2: Select Court -->
          <div>
            <h2 class="heading-2 text-[#F7F7F7] mb-4">2. Select Court</h2>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {#each courts as c}
                <button
                  type="button"
                  onclick={() => {
                    selectedCourtId = c.id;
                    selectedSlot = null;
                  }}
                  class="flex flex-col items-start rounded-xl border p-4 transition-all {selectedCourtId ===
                  c.id
                    ? 'border-[#E6FA50] bg-[#E6FA50]/15 text-[#E6FA50]'
                    : 'border-white/[0.08] bg-[#0C1B26] text-[#F7F7F7]/80 hover:border-[#50C8C8]/40'}"
                >
                  <span class="label font-semibold text-[#F7F7F7]">{c.name}</span>
                  <span class="caption mt-1 text-[#F7F7F7]/40">
                    {c.type} court · From Rp {((c.weekdayOffPeak ?? 200000) / 1000).toFixed(0)}K/hr
                  </span>
                </button>
              {/each}
            </div>
          </div>

          <!-- Step 3: Select Time Slot -->
          <div>
            <h2 class="heading-2 text-[#F7F7F7] mb-4">3. Select Time Slot</h2>

            {#if isLoadingAvailability}
              <div class="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {#each Array.from({ length: 12 }) as _, i}
                  <div class="h-14 animate-pulse rounded-xl bg-white/[0.04]"></div>
                {/each}
              </div>
            {:else if activeCourtSlots.length === 0}
              <p class="body text-[#F7F7F7]/40">
                No slots available on this date. Please pick another date or court.
              </p>
            {:else}
              <div class="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
                {#each activeCourtSlots as slot}
                  <button
                    type="button"
                    disabled={!slot.available}
                    onclick={() => (selectedSlot = slot)}
                    class="flex flex-col items-center justify-center rounded-xl border p-3 transition-all {!slot.available
                      ? 'border-transparent bg-white/[0.02] text-[#F7F7F7]/25 line-through cursor-not-allowed'
                      : selectedSlot?.startsAt === slot.startsAt
                        ? 'border-[#E6FA50] bg-[#E6FA50]/20 text-[#E6FA50]'
                        : slot.isPeak
                          ? 'border-[#E6FA50]/20 bg-[#E6FA50]/5 text-[#E6FA50]/80 hover:border-[#E6FA50]/40'
                          : 'border-white/[0.08] bg-[#0C1B26] text-[#F7F7F7]/70 hover:border-[#50C8C8]/40'}"
                  >
                    <span class="label font-bold">{slot.startsAt}</span>
                    <span class="caption mt-0.5">
                      Rp {(slot.price / 1000).toFixed(0)}K
                    </span>
                  </button>
                {/each}
              </div>
              <div class="mt-4 flex items-center gap-4">
                <div class="flex items-center gap-1.5">
                  <div class="h-2.5 w-2.5 rounded-sm border border-white/[0.08] bg-[#0C1B26]"></div>
                  <span class="caption text-[#F7F7F7]/25">Off-peak</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <div class="h-2.5 w-2.5 rounded-sm border border-[#E6FA50]/20 bg-[#E6FA50]/5"></div>
                  <span class="caption text-[#F7F7F7]/25">Peak hour</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <div class="h-2.5 w-2.5 rounded-sm bg-white/[0.02]"></div>
                  <span class="caption text-[#F7F7F7]/25">Booked</span>
                </div>
              </div>
            {/if}
          </div>

          <!-- Step 4: Voucher Code -->
          <div>
            <h2 class="heading-2 text-[#F7F7F7] mb-4">4. Apply Voucher (Optional)</h2>
            <div class="flex gap-2 max-w-md">
              <div class="relative flex-1">
                <Ticket class="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#F7F7F7]/25" />
                <input
                  type="text"
                  bind:value={voucherCode}
                  placeholder="Voucher code (e.g. WELCOME20)"
                  class="body w-full rounded-xl border border-white/[0.06] bg-white/[0.02] py-2.5 pl-11 pr-4 uppercase text-[#F7F7F7] placeholder:text-[#F7F7F7]/25 focus:border-[#E6FA50]/30 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onclick={handleApplyVoucher}
                disabled={isValidatingVoucher}
                class="label btn-outline-white h-10 px-5 rounded-xl"
              >
                {isValidatingVoucher ? "Validating..." : "Apply"}
              </button>
            </div>
            {#if voucherError}
              <p class="caption mt-2 text-red-400">{voucherError}</p>
            {:else if voucherDiscount > 0}
              <p class="caption mt-2 text-emerald-400">
                Discount applied: Rp {(voucherDiscount / 1000).toFixed(0)}K
              </p>
            {/if}
          </div>
        </div>

        <!-- Right — Booking Summary (Sticky) -->
        <div class="lg:relative">
          <div class="lg:sticky lg:top-28">
            <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 shadow-2xl space-y-5">
              <h3 class="heading-2 text-[#F7F7F7]">Booking Summary</h3>

              <div class="space-y-3 border-y border-white/[0.06] py-4">
                <div class="flex justify-between">
                  <span class="caption text-[#F7F7F7]/40">Venue</span>
                  <span class="label text-[#F7F7F7]">{venue.name}</span>
                </div>
                <div class="flex justify-between">
                  <span class="caption text-[#F7F7F7]/40">Court</span>
                  <span class="label text-[#F7F7F7]">{selectedCourt?.name ?? "Court 1"}</span>
                </div>
                <div class="flex justify-between">
                  <span class="caption text-[#F7F7F7]/40">Date</span>
                  <span class="label text-[#F7F7F7]">{selectedDate}</span>
                </div>
                <div class="flex justify-between">
                  <span class="caption text-[#F7F7F7]/40">Time</span>
                  <span class="label text-[#E6FA50]">
                    {selectedSlot ? selectedSlot.startsAt : "Select time slot"}
                  </span>
                </div>
              </div>

              {#if selectedSlot}
                <div class="space-y-2">
                  <div class="flex justify-between text-xs">
                    <span class="text-[#F7F7F7]/40">Court Rental (1 hr)</span>
                    <span class="text-[#F7F7F7]">
                      Rp {(selectedSlot.price / 1000).toFixed(0)}K
                    </span>
                  </div>
                  {#if voucherDiscount > 0}
                    <div class="flex justify-between text-xs text-emerald-400">
                      <span>Voucher Discount</span>
                      <span>-Rp {(voucherDiscount / 1000).toFixed(0)}K</span>
                    </div>
                  {/if}
                  <div class="flex justify-between pt-2 border-t border-white/[0.06]">
                    <span class="heading-3 text-[#F7F7F7]">Total Due</span>
                    <span class="price text-[#E6FA50]">
                      Rp {((Math.max(0, selectedSlot.price - voucherDiscount)) / 1000).toFixed(0)}K
                    </span>
                  </div>
                </div>
              {/if}

              <button
                type="submit"
                disabled={!selectedSlot || isSubmitting}
                class="label btn-lime w-full flex h-12 items-center justify-center gap-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {#if isSubmitting}
                  <Loader2 class="h-4 w-4 animate-spin" />
                  Creating Reservation...
                {:else}
                  Proceed to Checkout
                {/if}
              </button>

              <div class="flex items-center justify-center gap-2 caption text-[#F7F7F7]/25 text-center">
                <Users class="h-3.5 w-3.5 shrink-0" />
                <span>Split costs and invite squad after reservation</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  {/if}
</div>