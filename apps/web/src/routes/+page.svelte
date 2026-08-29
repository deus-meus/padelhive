<script lang="ts">
import {
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Star,
  Trophy,
  Users,
} from "lucide-svelte";
import { onMount } from "svelte";
import { api } from "$lib/api/client";
import Card from "$lib/components/ui/card.svelte";
import Skeleton from "$lib/components/ui/skeleton.svelte";

let homeStats = $state<{
  players: number;
  venues: number;
  matchesThisMonth: number;
  hoursPlayed: number;
} | null>(null);

let featuredVenues = $state<any[]>([]);
let isLoadingStats = $state(true);
let isLoadingVenues = $state(true);

onMount(async () => {
  try {
    const statsRes = await api.stats.home.get();
    if (statsRes.data) {
      homeStats = statsRes.data;
    }
  } catch (e) {
    console.warn("Stats fetch error:", e);
  } finally {
    isLoadingStats = false;
  }

  try {
    const venuesRes = await api.venues.get();
    if (venuesRes.data) {
      featuredVenues = venuesRes.data.slice(0, 3);
    }
  } catch (e) {
    console.warn("Venues fetch error:", e);
  } finally {
    isLoadingVenues = false;
  }
});
</script>

<svelte:head>
  <title>Padelhive - Book Premium Padel Courts Instantly</title>
  <meta name="description" content="Padel court booking platform. Discover venues, check availability, book instantly, and play with friends." />
</svelte:head>

<!-- Hero Section -->
<section class="relative overflow-hidden py-20 md:py-28 border-b border-white/[0.06] bg-gradient-to-b from-[#0C1B26] to-[#06121A]">
  <div class="absolute -top-40 left-1/2 -translate-x-1/2 h-[400px] w-[600px] rounded-full bg-[#E6FA50]/10 blur-[120px] pointer-events-none"></div>

  <div class="container relative z-10 text-center">
    <div class="inline-flex items-center gap-2 rounded-full border border-[#E6FA50]/20 bg-[#E6FA50]/10 px-4 py-1.5 text-xs font-semibold text-[#E6FA50] mb-6">
      <Sparkles class="h-3.5 w-3.5" />
      <span>Indonesia's Premier Padel Marketplace</span>
    </div>

    <h1 class="font-heading text-4xl font-extrabold uppercase tracking-tight text-[#F7F7F7] sm:text-6xl lg:text-7xl leading-[1.1]">
      Book Your Court.<br />
      <span class="text-[#E6FA50]">Play The Game.</span>
    </h1>

    <p class="mx-auto mt-6 max-w-2xl text-base text-white/70 sm:text-lg">
      Discover top padel venues, view real-time court availability, split payments with teammates, and book instantly in seconds.
    </p>

    <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
      <a href="/venues" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#E6FA50] px-6 py-3.5 text-base font-semibold text-[#06121A] shadow-[0_0_24px_rgba(230,250,80,0.3)] hover:bg-[#d4e845] transition-all">
        Browse Venues
        <ArrowRight class="h-5 w-5" />
      </a>
      <a href="/vouchers" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-3.5 text-base font-medium text-white hover:bg-white/5 transition-all">
        View Promos & Vouchers
      </a>
    </div>
  </div>
</section>

<!-- Live Stats Section -->
<section class="py-12 border-b border-white/[0.06] bg-[#06121A]">
  <div class="container">
    <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
      <Card class="flex flex-col items-center justify-center p-6 text-center">
        <Users class="mb-2 h-6 w-6 text-[#E6FA50]" />
        {#if isLoadingStats}
          <Skeleton class="h-8 w-16 my-1" />
        {:else}
          <span class="text-3xl font-extrabold text-[#F7F7F7]">{homeStats?.players ?? 1250}+</span>
        {/if}
        <span class="text-xs font-medium text-white/50">Active Players</span>
      </Card>

      <Card class="flex flex-col items-center justify-center p-6 text-center">
        <Trophy class="mb-2 h-6 w-6 text-[#E6FA50]" />
        {#if isLoadingStats}
          <Skeleton class="h-8 w-16 my-1" />
        {:else}
          <span class="text-3xl font-extrabold text-[#F7F7F7]">{homeStats?.venues ?? 18}+</span>
        {/if}
        <span class="text-xs font-medium text-white/50">Partner Venues</span>
      </Card>

      <Card class="flex flex-col items-center justify-center p-6 text-center">
        <Calendar class="mb-2 h-6 w-6 text-[#E6FA50]" />
        {#if isLoadingStats}
          <Skeleton class="h-8 w-16 my-1" />
        {:else}
          <span class="text-3xl font-extrabold text-[#F7F7F7]">{homeStats?.matchesThisMonth ?? 480}+</span>
        {/if}
        <span class="text-xs font-medium text-white/50">Matches This Month</span>
      </Card>

      <Card class="flex flex-col items-center justify-center p-6 text-center">
        <Clock class="mb-2 h-6 w-6 text-[#E6FA50]" />
        {#if isLoadingStats}
          <Skeleton class="h-8 w-16 my-1" />
        {:else}
          <span class="text-3xl font-extrabold text-[#F7F7F7]">{homeStats?.hoursPlayed ?? 960}+</span>
        {/if}
        <span class="text-xs font-medium text-white/50">Hours Played</span>
      </Card>
    </div>
  </div>
</section>

<!-- Featured Venues Section -->
<section class="py-16 bg-[#06121A]">
  <div class="container">
    <div class="flex items-end justify-between mb-10">
      <div>
        <h2 class="text-2xl font-extrabold tracking-tight text-[#F7F7F7] sm:text-3xl">
          Featured Padel Venues
        </h2>
        <p class="mt-2 text-sm text-white/60">
          Handpicked top-rated padel clubs across Indonesia
        </p>
      </div>
      <a href="/venues" class="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[#E6FA50] hover:underline">
        See All Venues <ArrowRight class="h-4 w-4" />
      </a>
    </div>

    {#if isLoadingVenues}
      <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
        {#each [1, 2, 3] as _}
          <Card class="p-0 overflow-hidden space-y-4">
            <Skeleton class="h-48 w-full rounded-none" />
            <div class="p-5 space-y-3">
              <Skeleton class="h-6 w-3/4" />
              <Skeleton class="h-4 w-1/2" />
            </div>
          </Card>
        {/each}
      </div>
    {:else}
      <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
        {#each featuredVenues as venue (venue.id)}
          <a href="/venues/{venue.id}" class="group block overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0C1B26] transition-all duration-300 hover:border-[#E6FA50]/30 hover:shadow-xl">
            <div class="relative h-48 w-full overflow-hidden bg-white/5">
              {#if venue.imageUrl}
                <img src={venue.imageUrl} alt={venue.name} class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              {:else}
                <div class="flex h-full w-full items-center justify-center text-white/30">No Image</div>
              {/if}
              <div class="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-[#06121A]/80 backdrop-blur-md px-2.5 py-1 text-xs font-semibold text-[#E6FA50] border border-white/10">
                <Star class="h-3.5 w-3.5 fill-[#E6FA50]" />
                <span>{venue.rating ?? 4.8}</span>
              </div>
            </div>

            <div class="p-5 space-y-2">
              <h3 class="text-lg font-bold text-[#F7F7F7] group-hover:text-[#E6FA50] transition-colors">
                {venue.name}
              </h3>
              <div class="flex items-center gap-1.5 text-xs text-white/60">
                <MapPin class="h-3.5 w-3.5 text-[#E6FA50]" />
                <span>{venue.location}, {venue.city}</span>
              </div>
              <div class="pt-3 border-t border-white/[0.04] flex items-center justify-between">
                <span class="text-xs text-white/50">{venue.courtCount ?? 2} Courts</span>
                <span class="text-sm font-semibold text-[#E6FA50]">
                  From Rp {((venue.priceFrom ?? 200000)).toLocaleString("id-ID")}/hr
                </span>
              </div>
            </div>
          </a>
        {/each}
      </div>
    {/if}

    <div class="mt-8 text-center sm:hidden">
      <a href="/venues" class="inline-flex items-center gap-2 text-sm font-semibold text-[#E6FA50]">
        See All Venues <ArrowRight class="h-4 w-4" />
      </a>
    </div>
  </div>
</section>
