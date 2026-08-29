<script lang="ts">
import { ArrowRight, CheckCircle2, Users } from "lucide-svelte";
import { page } from "$app/stores";
import Card from "$lib/components/ui/card.svelte";

const bookingId = $derived(($page.params.id as string) || "");
</script>

<svelte:head>
  <title>Booking Confirmed! - Padelhive</title>
</svelte:head>

<div class="py-16 bg-[#06121A]">
  <div class="container max-w-md space-y-6 text-center">
    <Card class="p-8 space-y-6">
      <div class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mx-auto">
        <CheckCircle2 class="h-10 w-10" />
      </div>

      <div class="space-y-2">
        <h1 class="text-2xl font-extrabold text-white">Booking Confirmed!</h1>
        <p class="text-xs text-white/60">
          Your court reservation has been locked and confirmed. Get ready to play!
        </p>
      </div>

      <div class="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-xs font-mono text-white/70">
        Booking Reference: <span class="font-bold text-[#E6FA50]">#{bookingId.slice(0, 8)}</span>
      </div>

      <div class="flex flex-col gap-3 pt-2">
        <a
          href="/booking/{bookingId}/invite"
          class="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E6FA50] px-5 py-3 text-sm font-bold text-[#06121A] shadow-[0_0_20px_rgba(230,250,80,0.3)]"
        >
          <Users class="h-4 w-4" />
          Invite Friends & Split Bill
        </a>

        <a
          href="/bookings/{bookingId}"
          class="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:bg-white/5"
        >
          View Reservation Details
          <ArrowRight class="h-4 w-4" />
        </a>
      </div>
    </Card>
  </div>
</div>
