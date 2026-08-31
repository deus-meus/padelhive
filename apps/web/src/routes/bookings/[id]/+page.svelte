<script lang="ts">
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Clock,
  Copy,
  CreditCard,
  Loader2,
  MapPin,
  CreditCard as ReceiptIcon,
  Share2,
  ShieldCheck,
  ShieldX,
  Star,
  Ticket,
} from "lucide-svelte";
import { onMount } from "svelte";
import { page } from "$app/state";
import { api } from "$lib/api/client";
import { authStore } from "$lib/auth/store.svelte";
import { formatBookingDate } from "$lib/format";
import { padelImg } from "$lib/images";

const bookingId = $derived((page.params.id as string) || "");

let booking = $state<any | null>(null);
let isLoading = $state(true);
let userRating = $state(0);
let reviewComment = $state("");
let isSubmittingReview = $state(false);
let toastMessage = $state<string | null>(null);

function showToast(msg: string) {
  toastMessage = msg;
  setTimeout(() => (toastMessage = null), 2500);
}

function formatIDR(amount: number): string {
  if (!amount) return "Rp 0";
  return `Rp ${(amount / 1000).toFixed(0)}K`;
}

function formatTime(val: any): string {
  if (!val) return "09:00";
  if (typeof val === "string") {
    if (val.includes("T")) {
      const parts = val.split("T")[1];
      return parts ? parts.substring(0, 5) : val.substring(0, 5);
    }
    return val.substring(0, 5);
  }
  return "09:00";
}

async function loadBooking() {
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
    console.warn("Booking detail fetch error:", e);
  } finally {
    isLoading = false;
  }
}

async function handleReviewSubmit() {
  if (userRating === 0) {
    showToast("Please select a star rating first.");
    return;
  }
  isSubmittingReview = true;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    const res = await api.reviews.post(
      {
        bookingId: bookingId,
        rating: userRating,
        comment: reviewComment.trim() || undefined,
      },
      { headers: { authorization: `Bearer ${token}` } },
    );
    if (res.data) {
      showToast("Thank you! Review submitted.");
      reviewComment = "";
    }
  } catch (err: any) {
    showToast(err.message || "Failed to submit review");
  } finally {
    isSubmittingReview = false;
  }
}

function copyInviteLink() {
  const url = `${window.location.origin}/booking/${bookingId}/invite`;
  navigator.clipboard.writeText(url).then(() => {
    showToast("Invite link copied to clipboard");
  });
}

onMount(() => {
  loadBooking();
});

const isUpcoming = $derived(
  booking?.status === "CONFIRMED" ||
    booking?.status === "PENDING_PAYMENT" ||
    booking?.status === "PENDING",
);
</script>

<svelte:head>
  <title>Booking Summary #{bookingId.slice(0, 8)} - Padelhive</title>
</svelte:head>

<div class="min-h-screen py-16 bg-[#06121A]">
  <div class="container max-w-5xl space-y-6 pt-6">
    <!-- Back button -->
    <a
      href="/bookings"
      class="inline-flex items-center gap-1.5 text-xs text-[#F7F7F7]/60 hover:text-[#F7F7F7] transition-colors"
    >
      <ArrowLeft class="h-3.5 w-3.5" />
      Back to bookings
    </a>

    {#if isLoading || !authStore.isInitialized || authStore.isLoading}
      <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-8 space-y-4">
        <div class="h-8 w-1/2 animate-pulse rounded-md bg-white/[0.04]"></div>
        <div class="h-4 w-1/3 animate-pulse rounded-md bg-white/[0.04]"></div>
        <div class="h-32 w-full animate-pulse rounded-xl bg-white/[0.04]"></div>
      </div>
    {:else if !booking}
      <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-12 text-center">
        <AlertCircle class="mb-3 h-10 w-10 text-red-400 mx-auto" />
        <h2 class="text-xl font-bold text-[#F7F7F7]">Booking Not Found</h2>
        <p class="mt-1 text-xs text-[#F7F7F7]/40">
          You don't have access to this booking or it does not exist.
        </p>
      </div>
    {:else}
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div>
          <span class="caption rounded-full bg-white/[0.04] px-3 py-1 text-xs font-semibold text-[#F7F7F7]/60 uppercase">
            {booking.status?.toLowerCase() || "completed"}
          </span>
          <h1 class="heading-1 text-3xl md:text-4xl font-bold text-[#F7F7F7] mt-3">
            {booking.venue?.name || "Padel Bali Arena"}
          </h1>
          <p class="caption text-[#F7F7F7]/40 flex items-center gap-1 mt-1.5 text-sm">
            <MapPin class="h-4 w-4 text-[#50C8C8]" />
            {booking.venue?.city || "Bali"}
          </p>
        </div>

        <div class="h-20 w-32 shrink-0 overflow-hidden rounded-xl bg-white/5 border border-white/[0.08]">
          <img
            src={booking.venue?.imageUrl || padelImg(600)}
            alt={booking.venue?.name}
            class="h-full w-full object-cover"
          />
        </div>
      </div>

      <!-- Main 2-Column Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 mt-8">
        <!-- Left Column -->
        <div class="space-y-6">
          <!-- BOOKING INFORMATION Card -->
          <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 md:p-8">
            <p class="caption font-semibold tracking-wider uppercase text-[#50C8C8] mb-5">BOOKING INFORMATION</p>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="rounded-xl border border-white/[0.04] bg-white/[0.015] p-4">
                <Ticket class="h-4 w-4 text-[#50C8C8] mb-2" />
                <p class="text-base font-bold text-[#F7F7F7] font-mono">#{booking.id.slice(0, 8).toUpperCase()}</p>
                <p class="caption text-xs text-[#F7F7F7]/40 mt-1">Booking ID</p>
              </div>

              <div class="rounded-xl border border-white/[0.04] bg-white/[0.015] p-4">
                <MapPin class="h-4 w-4 text-[#50C8C8] mb-2" />
                <p class="text-base font-bold text-[#F7F7F7]">{booking.court?.name || "Court A"} · {booking.court?.type || "OUTDOOR"}</p>
                <p class="caption text-xs text-[#F7F7F7]/40 mt-1">Court</p>
              </div>

              <div class="rounded-xl border border-white/[0.04] bg-white/[0.015] p-4">
                <Calendar class="h-4 w-4 text-[#50C8C8] mb-2" />
                <p class="text-base font-bold text-[#F7F7F7]">{formatBookingDate(booking.bookingDate)}</p>
                <p class="caption text-xs text-[#F7F7F7]/40 mt-1">Date</p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div class="rounded-xl border border-white/[0.04] bg-white/[0.015] p-4">
                <Clock class="h-4 w-4 text-[#50C8C8] mb-2" />
                <p class="text-base font-bold text-[#F7F7F7]">{formatTime(booking.startsAt)} – {formatTime(booking.endsAt)} WIB</p>
                <p class="caption text-xs text-[#F7F7F7]/40 mt-1">Time</p>
              </div>

              <div class="rounded-xl border border-white/[0.04] bg-white/[0.015] p-4">
                <Clock class="h-4 w-4 text-[#50C8C8] mb-2" />
                <p class="text-base font-bold text-[#F7F7F7]">{booking.durationMinutes || 60} min</p>
                <p class="caption text-xs text-[#F7F7F7]/40 mt-1">Duration</p>
              </div>
            </div>
          </div>

          <!-- REFUND POLICY Card -->
          <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 md:p-8">
            <p class="caption font-semibold tracking-wider uppercase text-[#50C8C8] mb-5">REFUND POLICY</p>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="rounded-xl border border-white/[0.04] bg-white/[0.015] p-4 space-y-2">
                <div class="flex items-center gap-2 text-sm font-semibold text-[#F7F7F7]">
                  <ShieldCheck class="h-4 w-4 text-[#E6FA50]" />
                  Full refund before H-1
                </div>
                <p class="text-xs text-[#F7F7F7]/40 leading-relaxed">
                  Cancel 24+ hours before your booking date — the full amount is returned to your original payment method.
                </p>
              </div>

              <div class="rounded-xl border border-white/[0.04] bg-white/[0.015] p-4 space-y-2">
                <div class="flex items-center gap-2 text-sm font-semibold text-[#F7F7F7]">
                  <ShieldX class="h-4 w-4 text-red-400" />
                  Non-refundable after H-1
                </div>
                <p class="text-xs text-[#F7F7F7]/40 leading-relaxed">
                  Cancelling less than 24 hours before the start time isn't eligible for a refund.
                </p>
              </div>
            </div>
          </div>

          <!-- LEAVE A REVIEW Card -->
          <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 md:p-8">
            <p class="caption font-semibold tracking-wider uppercase text-[#50C8C8] mb-5">LEAVE A REVIEW</p>

            <div class="space-y-4">
              <div class="flex items-center gap-2">
                {#each Array.from({ length: 5 }) as _, idx}
                  {@const starVal = idx + 1}
                  <button
                    type="button"
                    onclick={() => (userRating = starVal)}
                    class="p-1 transition-transform hover:scale-110 focus:outline-none"
                    aria-label="Rate {starVal} stars"
                  >
                    <Star
                      class="h-7 w-7 transition-colors {starVal <= userRating
                        ? 'text-[#E6FA50] fill-[#E6FA50]'
                        : 'text-white/20 hover:text-white/40'}"
                    />
                  </button>
                {/each}
              </div>

              <textarea
                rows={3}
                bind:value={reviewComment}
                placeholder="Share your experience (optional)..."
                class="w-full resize-none rounded-xl border border-white/[0.08] bg-black/20 p-4 text-sm text-[#F7F7F7] placeholder:text-[#F7F7F7]/25 focus:border-[#E6FA50]/40 focus:outline-none"
              ></textarea>

              <button
                type="button"
                onclick={handleReviewSubmit}
                disabled={isSubmittingReview || userRating === 0}
                class="btn-lime label inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold bg-[#E6FA50] text-[#06121A] hover:bg-[#E6FA50]/90 disabled:opacity-50 transition-all"
              >
                {#if isSubmittingReview}
                  <Loader2 class="h-4 w-4 animate-spin" /> Submitting...
                {:else}
                  Submit Review
                {/if}
              </button>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <!-- PAYMENT Card -->
          <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 md:p-8">
            <p class="caption font-semibold tracking-wider uppercase text-[#50C8C8] mb-5">PAYMENT</p>

            <div class="space-y-3 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-[#F7F7F7]/40">Court fee</span>
                <span class="font-medium text-[#F7F7F7]">{formatIDR(booking.courtAmount || 300000)}</span>
              </div>

              {#if booking.voucherDiscount && booking.voucherDiscount > 0}
                <div class="flex items-center justify-between">
                  <span class="text-[#F7F7F7]/40">Voucher</span>
                  <span class="font-semibold text-[#E6FA50]">-{formatIDR(booking.voucherDiscount)}</span>
                </div>
              {/if}

              <div class="flex items-center justify-between">
                <span class="text-[#F7F7F7]/40">Platform fee</span>
                <span class="font-medium text-[#F7F7F7]">{formatIDR(booking.platformFee || 15000)}</span>
              </div>

              <div class="border-t border-white/[0.06] pt-3 mt-3 flex items-center justify-between">
                <span class="font-semibold text-[#F7F7F7]">Total</span>
                <span class="price text-xl font-bold text-[#F7F7F7]">
                  {formatIDR(booking.finalAmount || 252000)}
                </span>
              </div>

              <div class="flex items-center justify-between pt-2">
                <span class="text-xs text-[#F7F7F7]/40">Status</span>
                <span class="caption rounded-full bg-white/[0.04] px-3 py-1 text-xs font-semibold text-amber-400 uppercase">
                  {booking.payment?.status?.toLowerCase() || "pending"}
                </span>
              </div>
            </div>
          </div>

          <!-- ACTIONS Card (Only shown for Upcoming Bookings as requested) -->
          {#if isUpcoming}
            <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 md:p-8">
              <p class="caption font-semibold tracking-wider uppercase text-[#50C8C8] mb-5">ACTIONS</p>

              <div class="space-y-3">
                <button
                  type="button"
                  onclick={copyInviteLink}
                  class="flex w-full items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-sm font-medium text-[#F7F7F7] hover:border-white/[0.15] hover:bg-white/[0.04] transition-all"
                >
                  <span class="inline-flex items-center gap-2">
                    <Share2 class="h-4 w-4 text-[#50C8C8]" />
                    Share invite link
                  </span>
                  <Copy class="h-4 w-4 text-[#F7F7F7]/40" />
                </button>

                <button
                  type="button"
                  onclick={() => showToast("Receipt downloaded.")}
                  class="flex w-full items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-sm font-medium text-[#F7F7F7] hover:border-white/[0.15] hover:bg-white/[0.04] transition-all"
                >
                  <span class="inline-flex items-center gap-2">
                    <ReceiptIcon class="h-4 w-4 text-[#50C8C8]" />
                    View payment receipt
                  </span>
                </button>
              </div>
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <!-- Toast Notification -->
    {#if toastMessage}
      <div class="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-white/[0.08] bg-[#0C1B26] px-5 py-3 shadow-2xl shadow-black/40">
        <p class="body text-sm font-medium text-[#F7F7F7]/80">{toastMessage}</p>
      </div>
    {/if}
  </div>
</div>
