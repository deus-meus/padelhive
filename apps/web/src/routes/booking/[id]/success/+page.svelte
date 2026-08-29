<script lang="ts">
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  MapPin,
  XCircle,
} from "lucide-svelte";
import { onMount } from "svelte";
import { page } from "$app/state";
import { api } from "$lib/api/client";
import { authStore } from "$lib/auth/store.svelte";
import { formatBookingDate } from "$lib/format";

const bookingId = $derived((page.params.id as string) || "");

let booking = $state<any | null>(null);
let isLoading = $state(true);

async function loadBooking() {
  if (!bookingId) return;
  isLoading = true;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    const res = await api.bookings({ id: bookingId }).get({
      headers: { authorization: `Bearer ${token}` },
    });
    if (res.data) {
      booking = res.data;
    }
  } catch (e) {
    console.warn("Booking success fetch error:", e);
  } finally {
    isLoading = false;
  }
}

onMount(() => {
  loadBooking();
});

const isPaid = $derived(
  booking?.status === "CONFIRMED" || booking?.payment?.status === "PAID",
);
const isFailed = $derived(
  booking?.status === "CANCELLED" || booking?.payment?.status === "FAILED",
);
</script>

<svelte:head>
  <title>Booking Confirmed | PadelHive</title>
</svelte:head>

<div class="min-h-screen pt-20 pb-24 bg-[#06121A]">
  <div class="container max-w-2xl py-12">
    {#if isLoading}
      <div class="rounded-3xl border border-white/[0.06] bg-[#0C1B26] p-8 text-center space-y-4">
        <div class="mx-auto h-20 w-20 rounded-full bg-white/5 animate-pulse"></div>
        <div class="mx-auto h-4 w-32 rounded-full bg-white/5 animate-pulse"></div>
        <div class="mx-auto h-8 w-64 rounded-full bg-white/5 animate-pulse"></div>
      </div>
    {:else}
      <div class="rounded-3xl border border-white/[0.06] bg-[#0C1B26] p-6 text-center md:p-8">
        {#if isPaid}
          <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#E6FA50]/10">
            <CheckCircle2 class="h-10 w-10 text-[#E6FA50]" />
          </div>
          <p class="mt-6 section-label text-[#E6FA50]">Booking Confirmed</p>
          <h1 class="heading-1 mt-3 text-[#F7F7F7]">
            Court secured for your match
          </h1>
          <p class="body mx-auto mt-3 max-w-md text-[#F7F7F7]/40">
            Your payment was successful and the court is confirmed.
          </p>
        {:else if isFailed}
          <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10">
            <XCircle class="h-10 w-10 text-red-500" />
          </div>
          <p class="mt-6 section-label text-red-500">Payment Failed</p>
          <h1 class="heading-1 mt-3 text-[#F7F7F7]">
            Payment could not be processed
          </h1>
          <p class="body mx-auto mt-3 max-w-md text-[#F7F7F7]/40">
            We could not confirm your payment. Please try again.
          </p>
        {:else}
          <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-yellow-500/10">
            <Loader2 class="h-10 w-10 animate-spin text-yellow-500" />
          </div>
          <p class="mt-6 section-label text-yellow-500">Payment Pending</p>
          <h1 class="heading-1 mt-3 text-[#F7F7F7]">
            Waiting for confirmation
          </h1>
          <p class="body mx-auto mt-3 max-w-md text-[#F7F7F7]/40">
            We are waiting for confirmation of your payment.
          </p>
        {/if}

        {#if booking}
          <div class="mt-8 rounded-2xl border border-white/[0.06] bg-[#06121A] p-5 text-left">
            <div class="flex items-start justify-between gap-4 border-b border-white/[0.06] pb-4">
              <div>
                <p class="section-label text-[#F7F7F7]/40">Booking ID</p>
                <p class="body mt-1 text-[#F7F7F7]/80">{booking.id}</p>
              </div>
              <span
                class="caption rounded-full px-3 py-1 uppercase font-semibold {isPaid
                  ? 'bg-[#E6FA50]/10 text-[#E6FA50]'
                  : isFailed
                    ? 'bg-red-500/10 text-red-500'
                    : 'bg-yellow-500/10 text-yellow-500'}"
              >
                {booking.status}
              </span>
            </div>

            <div class="mt-5 grid gap-4 sm:grid-cols-2">
              <div class="rounded-xl bg-white/[0.03] p-4">
                <div class="section-label flex items-center gap-2 text-[#F7F7F7]/40">
                  <MapPin class="h-3.5 w-3.5" />
                  Venue
                </div>
                <p class="body mt-2 text-[#F7F7F7]/80">{booking.venue?.name}</p>
                <p class="body-sm mt-1 text-[#F7F7F7]/40">{booking.court?.name}</p>
              </div>

              <div class="rounded-xl bg-white/[0.03] p-4">
                <div class="section-label flex items-center gap-2 text-[#F7F7F7]/40">
                  <CalendarDays class="h-3.5 w-3.5" />
                  Date
                </div>
                <p class="body mt-2 text-[#F7F7F7]/80">
                  {formatBookingDate(new Date(booking.bookingDate))}
                </p>
              </div>

              <div class="rounded-xl bg-white/[0.03] p-4">
                <div class="section-label flex items-center gap-2 text-[#F7F7F7]/40">
                  <Clock class="h-3.5 w-3.5" />
                  Time
                </div>
                <p class="body mt-2 text-[#F7F7F7]/80">
                  {booking.startsAt} – {booking.endsAt}
                </p>
              </div>

              <div class="rounded-xl bg-white/[0.03] p-4">
                <div class="section-label flex items-center gap-2 text-[#F7F7F7]/40">
                  <CreditCard class="h-3.5 w-3.5" />
                  Payment
                </div>
                <p class="price mt-2 text-[#F7F7F7]/80">
                  Rp {((booking.finalAmount || 200000) / 1000).toFixed(0)}K
                </p>
              </div>
            </div>
          </div>
        {/if}

        <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {#if isFailed}
            <a
              href="/booking/{bookingId}/payment"
              class="label btn-lime flex h-12 items-center justify-center rounded-full px-6"
            >
              Try Payment Again
            </a>
          {:else}
            <a
              href="/bookings"
              class="label btn-lime flex h-12 items-center justify-center rounded-full px-6"
            >
              View My Bookings
            </a>
          {/if}
          <a
            href="/venues"
            class="label flex h-12 items-center justify-center rounded-full border border-white/[0.08] px-6 text-[#F7F7F7]/60 transition-colors hover:border-white/[0.15] hover:text-[#F7F7F7]/80"
          >
            Book Another Court
          </a>
        </div>
      </div>
    {/if}
  </div>
</div>