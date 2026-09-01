<script lang="ts">
import {
  ArrowUpDown,
  MapPin,
  Search,
  SlidersHorizontal,
  Star,
} from "lucide-svelte";
import { onMount } from "svelte";
import { api } from "$lib/api/client";
import EmptyState from "$lib/components/ui/empty-state.svelte";
import FilterMultiSelect from "$lib/components/ui/filter-multi-select.svelte";
import FilterSelect from "$lib/components/ui/filter-select.svelte";
import { padelImg } from "$lib/images";

const CITIES = ["All", "Bali", "Jakarta", "Surabaya"];
const FACILITIES = [
  "Parking",
  "Shower",
  "Locker",
  "Pro Shop",
  "Cafe",
  "WiFi",
  "AC",
  "Coaching",
  "Equipment Rental",
];

const SORTS = [
  { value: "recommended", label: "Recommended" },
  { value: "rating", label: "Top rated" },
  { value: "price", label: "Price: low to high" },
];

const COURT_TYPES = [
  { value: "all", label: "All types" },
  { value: "INDOOR", label: "Indoor" },
  { value: "OUTDOOR", label: "Outdoor" },
];

const RATINGS = [
  { value: "all", label: "All ratings" },
  { value: "4", label: "4.0+" },
  { value: "4.5", label: "4.5+" },
];

const PRICES = [
  { value: "all", label: "All prices" },
  { value: "u100", label: "Under Rp100K" },
  { value: "100-200", label: "Rp100–200K" },
  { value: "200", label: "Above Rp200K" },
];

const IMG = {
  venue1: padelImg(600),
  venue2: padelImg(600),
  venue3: padelImg(600),
};

let search = $state("");
let city = $state("All");
let courtType = $state("all");
let ratingMin = $state("all");
let priceFilter = $state("all");
let facilities = $state<string[]>([]);
let sort = $state("recommended");
let showMobileFilters = $state(false);

let apiVenues = $state<any[]>([]);
let isLoading = $state(true);

async function loadVenues() {
  isLoading = true;
  try {
    let priceMinStr: string | undefined;
    let priceMaxStr: string | undefined;
    if (priceFilter === "u100") priceMaxStr = "100000";
    else if (priceFilter === "100-200") {
      priceMinStr = "100000";
      priceMaxStr = "200000";
    } else if (priceFilter === "200") priceMinStr = "200000";

    const res = await api.venues.get({
      query: {
        q: search || undefined,
        city: city !== "All" ? city : undefined,
        type: courtType !== "all" ? courtType : undefined,
        rating: ratingMin !== "all" ? ratingMin : undefined,
        priceMin: priceMinStr,
        priceMax: priceMaxStr,
      },
    });
    if (res.data) {
      apiVenues = res.data;
    }
  } catch (e) {
    console.warn("Error fetching venues:", e);
  } finally {
    isLoading = false;
  }
}

$effect(() => {
  loadVenues();
});

const filteredVenues = $derived.by(() => {
  let list = [...apiVenues];
  if (facilities.length > 0) {
    list = list.filter(
      (v) => v.facilities && facilities.every((f) => v.facilities.includes(f)),
    );
  }
  if (sort === "rating") {
    list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  } else if (sort === "price") {
    list.sort((a, b) => (a.priceFrom ?? 9999999) - (b.priceFrom ?? 9999999));
  }
  return list;
});

function toggleFacility(f: string) {
  if (facilities.includes(f)) {
    facilities = facilities.filter((x) => x !== f);
  } else {
    facilities = [...facilities, f];
  }
}

function handleClearFilters() {
  search = "";
  city = "All";
  courtType = "all";
  ratingMin = "all";
  priceFilter = "all";
  facilities = [];
  sort = "recommended";
}
</script>

<svelte:head>
  <title>Venues | PadelHive</title>
  <meta name="description" content="Browse and book padel courts across Indonesia." />
</svelte:head>

<!-- ─── PAGE HEADER ─── -->
<section class="border-b border-white/[0.06] pt-32 pb-10 md:pt-36 md:pb-12">
  <div class="container">
    <span class="section-label">All Venues</span>
    <h1 class="heading-1 mt-3 text-[#F7F7F7]">
      Find <span class="text-[#E6FA50]">Courts</span>
    </h1>
    <p class="body-lg mt-3 max-w-md text-[#F7F7F7]/60">
      Browse and book padel courts across Indonesia.
    </p>
  </div>
</section>

<!-- ─── FILTER BAR ─── -->
<section
  class="sticky top-20 z-30 border-b border-white/[0.06] bg-[#06121A]/90 backdrop-blur-xl"
>
  <div class="container flex flex-col gap-3 py-3 lg:py-5">
    <div
      class="flex flex-1 items-center gap-3 rounded-xl bg-white/[0.03] px-4 py-3"
    >
      <Search class="h-4 w-4 shrink-0 text-[#F7F7F7]/25" />
      <input
        type="text"
        bind:value={search}
        placeholder="Search venues..."
        class="body w-full bg-transparent text-[#F7F7F7] outline-none placeholder:text-[#F7F7F7]/25"
      />
    </div>

    <div class="flex flex-wrap gap-2 lg:gap-3 lg:items-center">
      <!-- Mobile toggle button -->
      <button
        type="button"
        onclick={() => (showMobileFilters = !showMobileFilters)}
        class="label flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-white/[0.03] px-4 text-[#F7F7F7]/60 hover:bg-white/[0.06] lg:hidden"
      >
        <SlidersHorizontal class="h-4 w-4" />
        {showMobileFilters ? "Hide Filters" : "Show Filters"}
      </button>

      <div
        class="w-full lg:w-auto flex-wrap gap-2 lg:gap-3 {showMobileFilters
          ? 'flex'
          : 'hidden lg:flex'}"
      >
        <!-- Cities -->
        <div class="flex w-full flex-wrap gap-2 pb-2 lg:w-auto lg:pb-0">
          {#each CITIES as c}
            <button
              type="button"
              onclick={() => (city = c)}
              class="label shrink-0 rounded-full px-4 py-2 uppercase transition-all duration-200 {city ===
              c
                ? 'bg-[#E6FA50] text-[#06121A]'
                : 'bg-white/[0.03] text-[#F7F7F7]/40 hover:bg-white/[0.06] hover:text-[#F7F7F7]/60'}"
            >
              {c}
            </button>
          {/each}
        </div>

        <div class="mx-1 h-6 w-px shrink-0 bg-white/10 hidden lg:block"></div>

        <!-- Custom Sort Select -->
        <FilterSelect
          icon={ArrowUpDown}
          value={sort}
          options={SORTS}
          onChange={(v) => (sort = v)}
        />

        <!-- Custom Type Select -->
        <FilterSelect
          value={courtType}
          options={COURT_TYPES}
          onChange={(v) => (courtType = v)}
          active={courtType !== "all"}
        />

        <!-- Custom Rating Select -->
        <FilterSelect
          value={ratingMin}
          options={RATINGS}
          onChange={(v) => (ratingMin = v)}
          active={ratingMin !== "all"}
        />

        <!-- Custom Price Select -->
        <FilterSelect
          alignRight
          value={priceFilter}
          options={PRICES}
          onChange={(v) => (priceFilter = v)}
          active={priceFilter !== "all"}
        />

        <!-- Custom Multi-Select Facilities -->
        <FilterMultiSelect
          alignRight
          label="Facilities"
          options={FACILITIES}
          selected={facilities}
          onToggle={toggleFacility}
          onClear={() => (facilities = [])}
        />

        {#if search || city !== "All" || courtType !== "all" || ratingMin !== "all" || priceFilter !== "all" || facilities.length > 0}
          <button
            type="button"
            onclick={handleClearFilters}
            class="caption shrink-0 text-[#E6FA50] hover:underline px-3 h-10 flex items-center"
          >
            Clear all filters
          </button>
        {/if}
      </div>
    </div>
  </div>
</section>

<!-- ─── VENUE LISTINGS ─── -->
<section class="py-section-sm">
  <div class="container">
    {#if isLoading}
      <div class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {#each Array.from({ length: 6 }) as _, i}
          <div
            class="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0C1B26]"
          >
            <div
              class="aspect-[16/10] w-full animate-pulse bg-white/[0.04]"
            ></div>
            <div class="p-6 space-y-3">
              <div
                class="h-3 w-24 animate-pulse rounded-full bg-white/[0.04]"
              ></div>
              <div
                class="h-4 w-3/4 animate-pulse rounded-full bg-white/[0.04]"
              ></div>
              <div
                class="h-3 w-1/2 animate-pulse rounded-full bg-white/[0.04]"
              ></div>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <p class="caption mb-6 text-[#F7F7F7]/40">
        {filteredVenues.length}{" "}
        {filteredVenues.length === 1 ? "venue" : "venues"}
        {city !== "All" ? ` in ${city}` : ""}
      </p>

      {#if filteredVenues.length === 0}
        <EmptyState
          icon={Search}
          title="No venues found"
          description="Try adjusting your search or filters."
          actionLabel="Browse all venues"
          onAction={handleClearFilters}
        />
      {:else}
        <div
          class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          {#each filteredVenues as venue, i (venue.id)}
            {@const price = venue.priceFrom ?? 0}
            {@const courtCount = venue.courtCount ?? 0}
            {@const images = [IMG.venue1, IMG.venue2, IMG.venue3]}

            <a href="/venues/{venue.id}" class="group block">
              <article
                class="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0C1B26] transition-all duration-200 group-hover:border-[#E6FA50]/15"
              >
                <div class="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={images[i % images.length]}
                    alt={venue.name}
                    class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  {#if venue.isVerified || venue.status === "APPROVED"}
                    <span
                      class="caption absolute left-3 top-3 rounded-full bg-[#E6FA50] px-2.5 py-0.5 uppercase text-[#06121A] font-bold"
                    >
                      Verified
                    </span>
                  {/if}
                </div>
                <div class="p-6">
                  <div class="flex items-center gap-2">
                    <Star class="h-3.5 w-3.5 fill-[#E6FA50] text-[#E6FA50]" />
                    <span class="label text-[#E6FA50]">
                      {venue.rating ?? 4.8}
                    </span>
                    <span class="caption text-[#F7F7F7]/25">
                      ({venue.reviewCount ?? 12})
                    </span>
                  </div>
                  <h3 class="heading-3 mt-3 text-[#F7F7F7]">
                    {venue.name}
                  </h3>
                  <p
                    class="mt-1 flex items-center gap-1.5 caption text-[#F7F7F7]/25"
                  >
                    <MapPin class="h-3 w-3" />
                    {venue.city}
                  </p>
                  <div
                    class="mt-4 flex items-center justify-between border-t border-white/[0.04] pt-3"
                  >
                    <span class="price text-[#50C8C8]">
                      {price > 0
                        ? `Rp ${(price / 1000).toFixed(0)}K/hr`
                        : "Pricing soon"}
                    </span>
                    <span class="caption text-[#F7F7F7]/25">
                      {courtCount} courts
                    </span>
                  </div>
                </div>
              </article>
            </a>
          {/each}
        </div>
      {/if}
    {/if}
  </div>
</section>