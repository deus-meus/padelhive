<script lang="ts">
import {
  ArrowRight,
  Calendar,
  Check,
  Clock,
  MapPin,
  Star,
} from "lucide-svelte";
import { onMount } from "svelte";
import { page } from "$app/stores";
import { api } from "$lib/api/client";
import Badge from "$lib/components/ui/badge.svelte";
import Card from "$lib/components/ui/card.svelte";
import Skeleton from "$lib/components/ui/skeleton.svelte";

const venueId = $derived(($page.params.id as string) || "");

let venue = $state<any | null>(null);
let courts = $state<any[]>([]);
let reviews = $state<any[]>([]);
let availability = $state<any | null>(null);
let selectedDate = $state(new Date().toISOString().split("T")[0]);

let isLoading = $state(true);
let isLoadingAvailability = $state(false);

async function loadVenueData() {
  if (!venueId) return;
  isLoading = true;
  try {
    const [vRes, cRes, rRes] = await Promise.all([
      api.venues({ id: venueId }).get(),
      api.venues({ id: venueId }).courts.get(),
      api.reviews.get({ query: { venueId } }),
    ]);

    if (vRes.data) venue = vRes.data;
    if (cRes.data) courts = cRes.data;
    if (rRes.data) reviews = rRes.data;
  } catch (e) {
    console.warn("Venue detail fetch error:", e);
  } finally {
    isLoading = false;
  }
}

async function loadAvailability() {
  if (!venueId || !selectedDate) return;
  isLoadingAvailability = true;
  try {
    const res = await api.venues({ id: venueId }).availability.get({
      query: { date: selectedDate },
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

onMount(() => {
  loadVenueData();
  loadAvailability();
});

function handleDateChange(e: Event) {
  const input = e.target as HTMLInputElement;
  if (input.value) {
    selectedDate = input.value;
    loadAvailability();
  }
}
</script>

<svelte:head>
  <title>{venue ? `${venue.name} - Padelhive` : "Venue Details - Padelhive"}</title>
</svelte:head>

<div class="py-10 bg-[#06121A]">
  <div class="container space-y-8">
    {#if isLoading}
      <div class="space-y-6">
        <Skeleton class="h-64 w-full rounded-2xl" />
        <Skeleton class="h-10 w-1/3" />
        <Skeleton class="h-20 w-full" />
      </div>
    {:else if !venue}
      <Card class="p-12 text-center">
        <h2 class="text-xl font-bold text-white">Venue Not Found</h2>
        <p class="mt-2 text-xs text-white/50">The requested venue could not be found.</p>
        <a href="/venues" class="mt-6 inline-block text-xs font-semibold text-[#E6FA50]">Back to Venues</a>
      </Card>
    {:else}
      <!-- Banner / Header -->
      <div class="relative h-72 md:h-96 w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0C1B26]">
        {#if venue.imageUrl}
          <img src={venue.imageUrl} alt={venue.name} class="h-full w-full object-cover" />
        {:else}
          <div class="flex h-full w-full items-center justify-center text-white/30">No Image Available</div>
        {/if}
        <div class="absolute inset-0 bg-gradient-to-t from-[#06121A] via-[#06121A]/40 to-transparent"></div>
        <div class="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <span class="rounded-full bg-[#E6FA50] px-3 py-1 text-xs font-bold text-[#06121A]">APPROVED</span>
              <div class="flex items-center gap-1 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-[#E6FA50] backdrop-blur-md">
                <Star class="h-3.5 w-3.5 fill-[#E6FA50]" />
                <span>{venue.rating ?? 4.8} ({venue.reviewCount ?? 0} reviews)</span>
              </div>
            </div>
            <h1 class="text-3xl font-extrabold text-[#F7F7F7] sm:text-4xl">{venue.name}</h1>
            <p class="flex items-center gap-1.5 text-xs text-white/70">
              <MapPin class="h-4 w-4 text-[#E6FA50]" />
              {venue.location}, {venue.city}
            </p>
          </div>

          <a href="/venues/{venue.id}/book" class="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E6FA50] px-6 py-3.5 text-sm font-bold text-[#06121A] shadow-[0_0_24px_rgba(230,250,80,0.3)] hover:bg-[#d4e845] transition-all">
            Book Court Now
            <ArrowRight class="h-4 w-4" />
          </a>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <!-- Main Info & Availability -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Description & Facilities -->
          <Card class="space-y-6">
            <div>
              <h3 class="text-base font-bold text-white mb-2">About Venue</h3>
              <p class="text-xs text-white/70 leading-relaxed">{venue.description}</p>
            </div>

            {#if venue.facilities && venue.facilities.length > 0}
              <div>
                <h4 class="text-xs font-bold uppercase tracking-wider text-white/50 mb-3">Facilities</h4>
                <div class="flex flex-wrap gap-2">
                  {#each venue.facilities as facility}
                    <div class="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-white/80">
                      <Check class="h-3.5 w-3.5 text-[#E6FA50]" />
                      {facility}
                    </div>
                  {/each}
                </div>
              </div>
            {/if}
          </Card>

          <!-- Real-Time Availability Grid -->
          <Card class="space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 class="text-base font-bold text-white">Court Availability</h3>
                <p class="text-xs text-white/60">Select a date to check live court schedules</p>
              </div>

              <div class="flex items-center gap-2">
                <Calendar class="h-4 w-4 text-[#E6FA50]" />
                <input
                  type="date"
                  value={selectedDate}
                  onchange={handleDateChange}
                  class="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-white focus:border-[#E6FA50]/50 focus:outline-none"
                />
              </div>
            </div>

            {#if isLoadingAvailability}
              <div class="space-y-4">
                <Skeleton class="h-12 w-full" />
                <Skeleton class="h-12 w-full" />
              </div>
            {:else if !availability || availability.courts.length === 0}
              <div class="py-8 text-center text-xs text-white/50">
                No active courts or closed on this date.
              </div>
            {:else}
              <div class="space-y-6">
                {#each availability.courts as court}
                  <div class="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
                    <div class="flex items-center justify-between">
                      <span class="text-sm font-semibold text-white">{court.name}</span>
                      <Badge variant="lime">{court.type}</Badge>
                    </div>

                    <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                      {#each court.slots as slot}
                        <div
                          class="flex flex-col items-center justify-center rounded-lg border p-2 text-center text-[10px] transition-all {slot.available ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-white/[0.04] bg-white/[0.02] text-white/30 cursor-not-allowed'}"
                        >
                          <span class="font-bold">{slot.startsAt}</span>
                          <span>Rp {(slot.price / 1000)}k</span>
                        </div>
                      {/each}
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </Card>
        </div>

        <!-- Sidebar Info -->
        <div class="space-y-6">
          <Card class="space-y-4">
            <h3 class="text-sm font-bold text-white uppercase tracking-wider text-white/60">Operating Hours</h3>
            <div class="flex items-center gap-3 text-xs text-white/80">
              <Clock class="h-4 w-4 text-[#E6FA50]" />
              <span>{venue.openTime} – {venue.closeTime} WIB</span>
            </div>
          </Card>

          <Card class="space-y-4">
            <h3 class="text-sm font-bold text-white uppercase tracking-wider text-white/60">Active Courts ({courts.length})</h3>
            <div class="space-y-3">
              {#each courts as c}
                <div class="flex items-center justify-between border-b border-white/[0.04] pb-2 text-xs">
                  <div>
                    <span class="font-medium text-white">{c.name}</span>
                    <span class="ml-2 text-[10px] text-white/40">({c.type})</span>
                  </div>
                  <span class="font-semibold text-[#E6FA50]">Rp {(c.weekdayOffPeak).toLocaleString("id-ID")}/hr</span>
                </div>
              {/each}
            </div>
          </Card>
        </div>
      </div>
    {/if}
  </div>
</div>
