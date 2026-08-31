<script lang="ts">
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Clock,
  Copy,
  CreditCard,
  Loader2,
  MapPin,
  Share2,
  ShieldCheck,
  ShieldX,
  Star,
  Ticket,
  Timer,
  X,
  XCircle,
} from "lucide-svelte";
import { onMount } from "svelte";
import { goto } from "$app/navigation";
import { page } from "$app/state";
import { api } from "$lib/api/client";
import { authStore } from "$lib/auth/store.svelte";
import { formatBookingDate, formatBookingTimeRange } from "$lib/format";
import { padelImg } from "$lib/images";

const bookingId = $derived((page.params.id as string) || "");

let booking = $state<any | null>(null);
let isLoading = $state(true);
let reviewRating = $state(0);
let reviewComment = $state("");
let isSubmittingReview = $state(false);
let reviewError = $state<string | null>(null);
let reviewSubmitted = $state(false);

// Cancel modal states
let showCancelModal = $state(false);
let isCancellingBooking = $state(false);
let toast = $state<string | null>(null);

function showToast(msg: string) {
  toast = msg;
  setTimeout(() => (toast = null), 2500);
}

function formatIDR(amount: number): string {
  if (!amount) return "Rp 0";
  return `Rp ${(amount / 1000).toFixed(0)}K`;
}

async function loadBooking() {
  if (!authStore.firebaseUser) return;
  isLoading = true;
  try {
    const token = await authStore.firebaseUser.getIdToken();
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

async function submitReview() {
  if (isSubmittingReview || reviewRating < 1) return;
  isSubmittingReview = true;
  reviewError = null;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    const res = await api.reviews.post(
      {
        bookingId: bookingId,
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      },
      { headers: { authorization: `Bearer ${token}` } },
    );
    if (res.data) {
      reviewSubmitted = true;
      showToast("Thanks for your review!");
    }
  } catch (err: any) {
    reviewError = err.message || "Failed to submit review";
  } finally {
    isSubmittingReview = false;
  }
}

async function confirmCancelBooking() {
  isCancellingBooking = true;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    await api.bookings({ id: bookingId }).cancel.patch(undefined, {
      headers: { authorization: `Bearer ${token}` },
    });

    showCancelModal = false;
    showToast("Booking cancelled successfully");
    loadBooking();
  } catch (err: any) {
    showToast(err.message || "Failed to cancel booking");
  } finally {
    isCancellingBooking = false;
  }
}

function handleShareInvite() {
  const url = `${window.location.origin}/booking/${bookingId}/invite`;
  navigator.clipboard
    .writeText(url)
    .then(() => {
      showToast("Invite link copied to clipboard");
    })
    .catch(() => {
      showToast(`Share this invite link: ${url}`);
    });
}

$effect(() => {
  if (authStore.isInitialized && authStore.user && authStore.firebaseUser) {
    loadBooking();
  }
});

function getStatusStyle(status: string) {
  switch (status?.toLowerCase()) {
    case "confirmed":
      return "bg-[#E6FA50]/10 text-[#E6FA50]";
    case "pending":
      return "bg-[#50C8C8]/10 text-[#50C8C8]";
    case "completed":
      return "bg-white/[0.04] text-[#F7F7F7]/25";
    case "cancelled":
      return "bg-red-500/10 text-red-400/70";
    default:
      return "bg-white/5 text-[#F7F7F7]/25";
  }
}

function getPaymentStyle(status: string) {
  switch (status?.toLowerCase()) {
    case "paid":
      return "bg-[#E6FA50]/10 text-[#E6FA50]";
    case "pending":
      return "bg-amber-500/10 text-amber-400";
    case "failed":
      return "bg-red-500/10 text-red-400";
    case "refunded":
      return "bg-[#50C8C8]/10 text-[#50C8C8]";
    default:
      return "";
  }
}
</script>

<svelte:head>
  <title>Booking Summary #{bookingId.slice(0, 8)} - Padelhive</title>
</svelte:head>

<div class="min-h-screen pt-28 pb-16 bg-[#06121A]">
  <!-- Back nav -->
  <section class="container pb-6">
    <a
      href="/bookings"
      class="group inline-flex items-center gap-3 text-xs font-medium text-[#F7F7F7]/60 transition-colors hover:text-[#F7F7F7]"
    >
      <div class="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-[#F7F7F7]/40 transition-all duration-200 group-hover:border-[#E6FA50]/40 group-hover:bg-[#E6FA50]/10 group-hover:text-[#E6FA50]">
        <ArrowLeft class="h-3.5 w-3.5" />
      </div>
      <span>Back to bookings</span>
    </a>
  </section>

  {#if isLoading || !authStore.isInitialized || authStore.isLoading}
    <div class="container pb-8">
      <div class="h-8 w-48 animate-pulse rounded-md bg-white/[0.04]"></div>
      <div class="mt-4 h-4 w-32 animate-pulse rounded-md bg-white/[0.04]"></div>
    </div>
    <div class="container">
      <div class="h-64 animate-pulse rounded-2xl bg-white/[0.02]"></div>
    </div>
  {:else if !booking}
    <div class="container">
      <div class="mx-auto max-w-xl rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-12 text-center md:p-16">
        <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.03] text-[#F7F7F7]/25">
          <CalendarDays class="h-8 w-8" />
        </div>
        <h2 class="heading-2 mt-6 text-[#F7F7F7]">Booking not found</h2>
        <p class="body mt-2 text-[#F7F7F7]/40">
          The booking you are looking for does not exist or you don't have access to view it.
        </p>
        <a
          href="/bookings"
          class="btn-lime label inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 font-semibold text-sm bg-[#E6FA50] text-[#06121A] hover:bg-[#E6FA50]/90 transition-all mt-6"
        >
          <ArrowLeft class="h-4 w-4" />
          Back to bookings
        </a>
      </div>
    </div>
  {:else}
    {@const venue = booking.venue}
    {@const court = booking.court}
    {@const currentBooking = booking}
    {@const isCancellable = currentBooking.status !== "CANCELLED" && currentBooking.status !== "cancelled" && currentBooking.status !== "COMPLETED" && currentBooking.status !== "completed"}

    <!-- Header -->
    <section class="container pb-8">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <span class="caption rounded-full px-2.5 py-0.5 uppercase font-semibold {getStatusStyle(currentBooking.status)}">
              {currentBooking.status?.toLowerCase() || "completed"}
            </span>
            {#if currentBooking.payment}
              <span class="caption rounded-full px-2.5 py-0.5 uppercase font-semibold {getPaymentStyle(currentBooking.payment.status)}">
                {currentBooking.payment.status?.toLowerCase() || "paid"}
              </span>
            {/if}
          </div>
          <h1 class="heading-1 text-[#F7F7F7]">
            {venue?.name ?? "Unknown Venue"}
          </h1>
          <p class="body mt-1 flex items-center gap-2 text-[#F7F7F7]/40">
            <MapPin class="h-3.5 w-3.5" />
            {venue?.city}
          </p>
        </div>
        <div class="relative hidden h-20 w-32 overflow-hidden rounded-xl sm:block border border-white/[0.08]">
          <img
            src={venue?.imageUrl || padelImg(400)}
            alt={venue?.name ?? "Venue image"}
            class="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>

    <!-- Main Content & Sticky Sidebar Grid -->
    <section class="container">
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
        <!-- Main content (left column) -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Booking Details -->
          <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
            <p class="section-label mb-4">Booking Information</p>
            <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div class="rounded-xl bg-white/[0.02] p-3">
                <Ticket class="h-3.5 w-3.5 text-[#50C8C8]" />
                <p class="heading-3 mt-1.5 text-[#F7F7F7] break-all">#{currentBooking.id.slice(-6).toUpperCase()}</p>
                <p class="caption mt-0.5 text-[#F7F7F7]/25">Booking ID</p>
              </div>
              <div class="rounded-xl bg-white/[0.02] p-3">
                <MapPin class="h-3.5 w-3.5 text-[#50C8C8]" />
                <p class="heading-3 mt-1.5 text-[#F7F7F7] break-all">{court?.name ?? "Court A"} · {court?.type ?? "OUTDOOR"}</p>
                <p class="caption mt-0.5 text-[#F7F7F7]/25">Court</p>
              </div>
              <div class="rounded-xl bg-white/[0.02] p-3">
                <CalendarDays class="h-3.5 w-3.5 text-[#50C8C8]" />
                <p class="heading-3 mt-1.5 text-[#F7F7F7] break-all">{formatBookingDate(currentBooking.bookingDate)}</p>
                <p class="caption mt-0.5 text-[#F7F7F7]/25">Date</p>
              </div>
              <div class="rounded-xl bg-white/[0.02] p-3">
                <Clock class="h-3.5 w-3.5 text-[#50C8C8]" />
                <p class="heading-3 mt-1.5 text-[#F7F7F7] break-all">{formatBookingTimeRange(currentBooking.startsAt, currentBooking.endsAt)}</p>
                <p class="caption mt-0.5 text-[#F7F7F7]/25">Time</p>
              </div>
              <div class="rounded-xl bg-white/[0.02] p-3">
                <Timer class="h-3.5 w-3.5 text-[#50C8C8]" />
                <p class="heading-3 mt-1.5 text-[#F7F7F7] break-all">{currentBooking.durationMinutes || 60} min</p>
                <p class="caption mt-0.5 text-[#F7F7F7]/25">Duration</p>
              </div>
            </div>
          </div>

          <!-- Refund Policy -->
          <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
            <p class="section-label mb-4">Refund Policy</p>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div class="rounded-xl bg-white/[0.02] p-4">
                <ShieldCheck class="h-4 w-4 text-[#E6FA50]" />
                <p class="heading-3 mt-1.5 text-[#F7F7F7]">Full refund before H-1</p>
                <p class="caption mt-1 text-[#F7F7F7]/25">Cancel 24+ hours before your booking date — the full amount is returned to your original payment method.</p>
              </div>
              <div class="rounded-xl bg-white/[0.02] p-4">
                <ShieldX class="h-4 w-4 text-red-400" />
                <p class="heading-3 mt-1.5 text-[#F7F7F7]">Non-refundable after H-1</p>
                <p class="caption mt-1 text-[#F7F7F7]/25">Cancelling less than 24 hours before the start time isn't eligible for a refund.</p>
              </div>
            </div>
          </div>

          <!-- Leave a Review -->
          {#if currentBooking.status === "COMPLETED" || currentBooking.status === "completed"}
            <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
              <p class="section-label mb-4">Leave a Review</p>
              {#if reviewSubmitted}
                <div class="rounded-xl border border-[#E6FA50]/15 bg-[#E6FA50]/10 p-4">
                  <p class="body text-[#E6FA50]">{reviewError ?? "Thanks! Your review has been submitted."}</p>
                </div>
              {:else}
                <div class="space-y-4">
                  <div class="flex items-center gap-1.5">
                    {#each [1, 2, 3, 4, 5] as n}
                      <button type="button" onclick={() => (reviewRating = n)} class="transition-transform hover:scale-110">
                        <Star class="h-6 w-6 {n <= reviewRating ? 'fill-[#E6FA50] text-[#E6FA50]' : 'text-[#F7F7F7]/20'}" />
                      </button>
                    {/each}
                  </div>
                  <textarea
                    bind:value={reviewComment}
                    maxLength={1000}
                    rows={4}
                    placeholder="Share your experience (optional)"
                    class="body w-full resize-none rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[#F7F7F7] placeholder:text-[#F7F7F7]/25 focus:border-[#50C8C8]/40 focus:outline-none"
                  ></textarea>
                  {#if reviewError}
                    <div class="rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3">
                      <p class="caption text-amber-300/80">{reviewError}</p>
                    </div>
                  {/if}
                  <button
                    type="button"
                    onclick={submitReview}
                    disabled={isSubmittingReview || reviewRating < 1}
                    class="label rounded-full bg-[#E6FA50] px-5 py-2.5 text-[#06121A] transition-colors hover:bg-[#E6FA50]/90 disabled:opacity-40"
                  >
                    {isSubmittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              {/if}
            </div>
          {/if}
        </div>

        <!-- Summary sidebar (sticky) -->
        <div class="space-y-6 lg:sticky lg:top-24">
          <!-- Payment -->
          <div id="payment" class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
            <p class="section-label mb-4">Payment</p>
            <div class="space-y-3 mb-4">
              <div class="flex items-center justify-between">
                <span class="caption text-[#F7F7F7]/40">Court fee</span>
                <span class="price text-[#F7F7F7]/60">Rp {((currentBooking.courtAmount || 300000) / 1000).toFixed(0)}K</span>
              </div>
              {#if currentBooking.voucherDiscount > 0}
                <div class="flex items-center justify-between">
                  <span class="caption text-[#F7F7F7]/40">Voucher</span>
                  <span class="price text-[#E6FA50]">-Rp {(currentBooking.voucherDiscount / 1000).toFixed(0)}K</span>
                </div>
              {/if}
              <div class="flex items-center justify-between">
                <span class="caption text-[#F7F7F7]/40">Platform fee</span>
                <span class="price text-[#F7F7F7]/60">Rp {((currentBooking.platformFee || 15000) / 1000).toFixed(0)}K</span>
              </div>
              <div class="flex items-center justify-between border-t border-white/[0.04] pt-3">
                <span class="body text-[#F7F7F7]/60 font-semibold">Total</span>
                <span class="price text-[#F7F7F7] text-xl font-bold">Rp {((currentBooking.finalAmount || 252000) / 1000).toFixed(0)}K</span>
              </div>
            </div>

            <div class="space-y-2 rounded-xl bg-white/[0.02] p-3">
              <div class="flex items-center justify-between">
                <span class="caption text-[#F7F7F7]/25">Status</span>
                <span class="caption rounded-full px-2.5 py-0.5 {getPaymentStyle(currentBooking.payment?.status || 'pending')}">
                  {currentBooking.payment?.status?.toLowerCase() || "pending"}
                </span>
              </div>
            </div>
          </div>

          <!-- Actions Card -->
          <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 space-y-4">
            <p class="section-label">Actions</p>
            <div class="space-y-2">
              <button
                type="button"
                onclick={handleShareInvite}
                class="heading-3 w-full flex items-center gap-3 rounded-xl bg-white/[0.02] px-4 py-3 text-[#F7F7F7]/60 transition-colors hover:bg-white/[0.04] hover:text-[#F7F7F7]"
              >
                <Share2 class="h-4 w-4 text-[#50C8C8]" />
                Share invite link
                <Copy class="ml-auto h-3.5 w-3.5 text-[#F7F7F7]/25" />
              </button>

              <a
                href="/booking/{currentBooking.id}/payment"
                class="heading-3 w-full flex items-center gap-3 rounded-xl bg-white/[0.02] px-4 py-3 text-[#F7F7F7]/60 transition-colors hover:bg-white/[0.04] hover:text-[#F7F7F7]"
              >
                <CreditCard class="h-4 w-4 text-[#50C8C8]" />
                View payment receipt
              </a>

              {#if isCancellable}
                <button
                  type="button"
                  onclick={() => (showCancelModal = true)}
                  class="heading-3 w-full flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-400 transition-colors hover:bg-red-500/15"
                >
                  <AlertTriangle class="h-4 w-4 text-red-400" />
                  Cancel Booking & Refund
                </button>
              {/if}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Cancel Booking Confirmation Modal -->
    {#if showCancelModal}
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
        <div class="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0C1B26] p-6 space-y-5 shadow-2xl">
          <div class="flex items-center justify-between">
            <h3 class="heading-2 text-[#F7F7F7] flex items-center gap-2">
              <AlertTriangle class="h-5 w-5 text-red-400" />
              Cancel Booking
            </h3>
            <button
              type="button"
              onclick={() => (showCancelModal = false)}
              class="rounded-lg p-1 text-[#F7F7F7]/40 hover:text-[#F7F7F7]"
            >
              <X class="h-4 w-4" />
            </button>
          </div>

          <p class="body-sm text-[#F7F7F7]/70">
            Are you sure you want to cancel this booking? This action cannot be undone.
          </p>

          <div class="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-2 text-xs">
            <p class="font-semibold text-[#F7F7F7]">Refund Policy:</p>
            <p class="text-[#F7F7F7]/60">• 100% refund if cancelled 24+ hours before start time.</p>
            <p class="text-[#F7F7F7]/60">• 50% refund if cancelled 12-24 hours before start time.</p>
            <p class="text-[#F7F7F7]/60">• Non-refundable if cancelled less than 12 hours before start time.</p>
          </div>

          <div class="flex items-center gap-3 pt-2">
            <button
              type="button"
              onclick={() => (showCancelModal = false)}
              class="flex-1 rounded-full border border-white/[0.1] py-2.5 text-xs font-semibold text-[#F7F7F7]/70 hover:bg-white/[0.04]"
            >
              Keep Booking
            </button>
            <button
              type="button"
              disabled={isCancellingBooking}
              onclick={confirmCancelBooking}
              class="flex-1 rounded-full bg-red-500 py-2.5 text-xs font-bold text-white hover:bg-red-600 disabled:opacity-50"
            >
              {isCancellingBooking ? "Cancelling..." : "Confirm Cancel"}
            </button>
          </div>
        </div>
      </div>
    {/if}
  {/if}

  <!-- Toast -->
  {#if toast}
    <div class="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-white/[0.06] bg-[#0C1B26] px-5 py-3 shadow-2xl">
      <p class="caption text-[#F7F7F7]/60">{toast}</p>
    </div>
  {/if}
</div>
