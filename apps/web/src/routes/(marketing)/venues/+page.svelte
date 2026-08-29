<script lang="ts">
import { MapPin, Search, Star } from "lucide-svelte";
import { onMount } from "svelte";
import { api } from "$lib/api/client";
import Card from "$lib/components/ui/card.svelte";
import Skeleton from "$lib/components/ui/skeleton.svelte";

let searchQuery = $state("");
let selectedCity = $state("All");
let selectedType = $state("All");

let venues = $state<any[]>([]);
let isLoading = $state(true);

const CITIES = ["All", "Bali", "Jakarta", "Surabaya"];
const TYPES = ["All", "INDOOR", "OUTDOOR"];

async function loadVenues() {
  isLoading = true;
  try {
    const res = await api.venues.get({
      query: {
        q: searchQuery || undefined,
        city: selectedCity !== "All" ? selectedCity : undefined,
        type: selectedType !== "All" ? selectedType : undefined,
      },
    });
    if (res.data) {
      venues = res.data;
    }
  } catch (e) {
    console.warn("Error fetching venues:", e);
  } finally {
    isLoading = false;
  }
}

onMount(() => {
  loadVenues();
});

function handleFilterChange() {
  loadVenues();
}
</script>

<svelte:head>
  <title>Padel Venues & Clubs - Padelhive</title>
</svelte:head>

<div class="py-12 bg-[#06121A]">
  <div class="container space-y-8">
    <!-- Header -->
    <div class="space-y-2">
      <h1 class="text-3xl font-extrabold tracking-tight text-[#F7F7F7] sm:text-4xl">
        Padel Venues
      </h1>
      <p class="text-sm text-white/60">
        Explore approved courts, check pricing, and book your match
      </p>
    </div>

    <!-- Search & Filter Controls -->
    <Card class="p-4 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
      <div class="relative flex-1">
        <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
        <input
          type="text"
          bind:value={searchQuery}
          oninput={handleFilterChange}
          placeholder="Search venues by name..."
          class="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] pl-10 pr-4 py-2 text-sm text-white placeholder-white/30 focus:border-[#E6FA50]/50 focus:outline-none"
        />
      </div>

      <div class="flex items-center gap-3">
        <select
          bind:value={selectedCity}
          onchange={handleFilterChange}
          class="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-sm text-white focus:border-[#E6FA50]/50 focus:outline-none"
        >
          {#each CITIES as city}
            <option value={city} class="bg-[#0C1B26] text-white">{city === "All" ? "All Cities" : city}</option>
          {/each}
        </select>

        <select
          bind:value={selectedType}
          onchange={handleFilterChange}
          class="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-sm text-white focus:border-[#E6FA50]/50 focus:outline-none"
        >
          {#each TYPES as type}
            <option value={type} class="bg-[#0C1B26] text-white">{type === "All" ? "All Court Types" : type}</option>
          {/each}
        </select>
      </div>
    </Card>

    <!-- Venues Grid -->
    {#if isLoading}
      <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
        {#each [1, 2, 3, 4, 5, 6] as _}
          <Card class="p-0 overflow-hidden space-y-4">
            <Skeleton class="h-48 w-full rounded-none" />
            <div class="p-5 space-y-3">
              <Skeleton class="h-6 w-3/4" />
              <Skeleton class="h-4 w-1/2" />
            </div>
          </Card>
        {/each}
      </div>
    {:else if venues.length === 0}
      <Card class="flex flex-col items-center justify-center p-12 text-center">
        <MapPin class="mb-3 h-10 w-10 text-white/30" />
        <h3 class="text-lg font-semibold text-white">No Venues Found</h3>
        <p class="mt-1 text-xs text-white/50">Try adjusting your search terms or filters.</p>
      </Card>
    {:else}
      <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
        {#each venues as venue (venue.id)}
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
  </div>
</div>
