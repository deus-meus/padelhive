<script lang="ts">
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Clock,
  CreditCard,
  Loader2,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-svelte";
import { onMount } from "svelte";
import { page } from "$app/state";
import { api } from "$lib/api/client";
import { authStore } from "$lib/auth/store.svelte";
import Badge from "$lib/components/ui/badge.svelte";
import Button from "$lib/components/ui/button.svelte";
import Card from "$lib/components/ui/card.svelte";
import Skeleton from "$lib/components/ui/skeleton.svelte";

const bookingId = $derived((page.params.id as string) || "");

let booking = $state<any | null>(null);
let isLoading = $state(true);
let isCancelling = $state(false);
let cancelMessage = $state<string | null>(null);

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
    console.warn("Booking detail error:", e);
  } finally {
    isLoading = false;
  }
}

async function handleCancel() {
  if (!confirm("Are you sure you want to cancel this booking?")) return;
  isCancelling = true;
  cancelMessage = null;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    const res = await api.bookings({ id: bookingId }).cancel.patch(undefined, {
      headers: { authorization: `Bearer ${token}` },
    });
    if (res.data) {
      booking = res.data;
      cancelMessage = "Booking cancelled successfully.";
    }
  } catch (err: any) {
    cancelMessage = err.message || "Failed to cancel booking";
  } finally {
    isCancelling = false;
  }
}

onMount(() => {
  loadBooking();
});
</script>

<svelte:head>
  <title>Booking Summary #{bookingId.slice(0, 8)} - Padelhive</title>
</svelte:head>

<div class="min-h-screen pt-24 pb-12 bg-[#06121A]">
  <div class="container max-w-3xl space-y-6">
    <a href="/bookings" class="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors">
      <ArrowLeft class="h-3.5 w-3.5" />
      Back to Bookings
    </a>

    {#if isLoading}
      <Card class="p-8 space-y-4">
        <Skeleton class="h-8 w-1/2" />
        <Skeleton class="h-4 w-1/3" />
        <Skeleton class="h-20 w-full" />
      </Card>
    {:else if !booking}
      <Card class="p-12 text-center">
        <AlertCircle class="mb-3 h-10 w-10 text-red-400 mx-auto" />
        <h2 class="text-xl font-bold text-white">Booking Not Found</h2>
        <p class="mt-1 text-xs text-white/50">You don't have access to this booking or it does not exist.</p>
      </Card>
    {:else}
      <Card class="p-8 space-y-6">
        {#if cancelMessage}
          <div class="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-xs font-medium text-white">
            {cancelMessage}
          </div>
        {/if}

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <Badge variant={booking.status === "CONFIRMED" ? "success" : booking.status === "CANCELLED" ? "error" : "warning"}>
                {booking.status}
              </Badge>
              <span class="text-xs font-mono text-white/40">#{booking.id}</span>
            </div>
            <h1 class="text-2xl font-extrabold text-white">{booking.venue.name}</h1>
            <p class="text-xs text-white/60">{booking.court.name} ({booking.court.type})</p>
          </div>

          <div class="text-left sm:text-right">
            <span class="text-xs text-white/50 block">Total Amount</span>
            <span class="text-2xl font-extrabold text-[#E6FA50]">Rp {booking.finalAmount.toLocaleString("id-ID")}</span>
          </div>
        </div>

        <!-- Schedule & Location -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div class="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-white/40">City & Venue</span>
            <p class="text-xs font-semibold text-white flex items-center gap-1">
              <MapPin class="h-3.5 w-3.5 text-[#E6FA50]" />
              {booking.venue.city}
            </p>
          </div>

          <div class="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-white/40">Date</span>
            <p class="text-xs font-semibold text-white flex items-center gap-1">
              <Calendar class="h-3.5 w-3.5 text-[#E6FA50]" />
              {booking.bookingDate}
            </p>
          </div>

          <div class="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-white/40">Duration</span>
            <p class="text-xs font-semibold text-white flex items-center gap-1">
              <Clock class="h-3.5 w-3.5 text-[#E6FA50]" />
              {booking.durationMinutes} Minutes
            </p>
          </div>
        </div>

        <!-- Refund Policy Check -->
        {#if booking.status !== "CANCELLED"}
          <div class="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-2">
            <div class="flex items-center gap-2 text-xs font-bold text-white">
              <ShieldCheck class="h-4 w-4 text-[#E6FA50]" />
              Cancellation & Refund Policy
            </div>
            <p class="text-xs text-white/60">
              {booking.refundPolicyReason ?? "Full refund eligible if cancelled 24 hours prior to match start."}
            </p>
          </div>
        {/if}

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-white/[0.06]">
          {#if booking.status === "PENDING_PAYMENT"}
            <a href="/booking/{booking.id}/payment" class="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#E6FA50] px-5 py-3 text-sm font-bold text-[#06121A] shadow-[0_0_20px_rgba(230,250,80,0.3)]">
              <CreditCard class="h-4 w-4" />
              Pay Now
            </a>
          {/if}

          {#if booking.status === "CONFIRMED" || booking.status === "PENDING_PAYMENT"}
            <a href="/booking/{booking.id}/invite" class="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:bg-white/5">
              <Users class="h-4 w-4 text-[#E6FA50]" />
              Invite & Split Payment
            </a>

            <Button
              variant="danger"
              class="w-full sm:w-auto px-5 py-3 text-sm"
              disabled={isCancelling}
              onclick={handleCancel}
            >
              {#if isCancelling}
                <Loader2 class="h-4 w-4 animate-spin" />
                Cancelling...
              {:else}
                Cancel Booking
              {/if}
            </Button>
          {/if}
        </div>
      </Card>
    {/if}
  </div>
</div>
