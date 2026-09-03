<script lang="ts">
import {
  Car,
  Clock,
  Coffee,
  Dumbbell,
  Lock,
  MapPin,
  Navigation,
  Shield,
  ShowerHead,
  Star,
  Users,
  Wifi,
  Wind,
} from "lucide-svelte";
import { onMount } from "svelte";
import { page } from "$app/state";
import { api } from "$lib/api/client";
import DarkMap from "$lib/components/ui/dark-map.svelte";
import EmptyState from "$lib/components/ui/empty-state.svelte";
import { formatBookingDate } from "$lib/format";
import { padelImg } from "$lib/images";

const venueId = $derived((page.params.id as string) || "");

let venue = $state<any | null>(null);
let courts = $state<any[]>([]);
let reviews = $state<any[]>([]);

let isLoadingVenue = $state(true);
let isLoadingCourts = $state(true);
let isLoadingReviews = $state(true);

const IMG = {
  gallery: [padelImg(1200, 85), padelImg(600), padelImg(600), padelImg(600)],
};

const TIME_SLOTS = [
  { time: "06:00", available: true, peak: false },
  { time: "07:00", available: true, peak: false },
  { time: "08:00", available: false, peak: false },
  { time: "09:00", available: false, peak: true },
  { time: "10:00", available: true, peak: true },
  { time: "11:00", available: true, peak: true },
  { time: "12:00", available: true, peak: false },
  { time: "13:00", available: false, peak: false },
  { time: "14:00", available: true, peak: false },
  { time: "15:00", available: true, peak: false },
  { time: "16:00", available: false, peak: true },
  { time: "17:00", available: false, peak: true },
  { time: "18:00", available: true, peak: true },
  { time: "19:00", available: true, peak: true },
  { time: "20:00", available: true, peak: true },
  { time: "21:00", available: false, peak: true },
];

async function loadData() {
  if (!venueId) return;
  isLoadingVenue = true;
  isLoadingCourts = true;
  isLoadingReviews = true;

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
    isLoadingVenue = false;
    isLoadingCourts = false;
    isLoadingReviews = false;
  }
}

onMount(() => {
  loadData();
});

const minPrice = $derived(
  courts.length
    ? Math.min(...courts.map((c) => c.weekdayOffPeak ?? 200000))
    : 0,
);
const maxPrice = $derived(
  courts.length ? Math.max(...courts.map((c) => c.weekendPeak ?? 300000)) : 0,
);

const wibShort = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  timeZone: "Asia/Jakarta",
})
  .format(new Date())
  .toLowerCase();

const weekDays = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];
</script>

<svelte:head>
  <title>{venue ? `${venue.name} | PadelHive` : "Venue Details | PadelHive"}</title>
</svelte:head>

<div class="min-h-screen pt-20 pb-24 lg:pb-0 bg-[#06121A]">
  {#if isLoadingVenue}
    <div class="container py-8 space-y-6">
      <div class="grid grid-cols-2 gap-2 md:grid-cols-4 md:grid-rows-2">
        <div class="col-span-2 md:row-span-2 h-[240px] md:h-full rounded-2xl animate-pulse bg-white/[0.04]"></div>
        <div class="h-[116px] md:h-[200px] rounded-2xl animate-pulse bg-white/[0.04]"></div>
        <div class="h-[116px] md:h-[200px] rounded-2xl animate-pulse bg-white/[0.04]"></div>
        <div class="h-[116px] md:h-[200px] rounded-2xl animate-pulse bg-white/[0.04]"></div>
      </div>
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
    <!-- ─── IMAGE GALLERY ─── -->
    <section class="container pt-8 pb-10">
      <div class="grid grid-cols-2 gap-2 md:grid-cols-4 md:grid-rows-2">
        <div class="relative col-span-2 md:row-span-2">
          <div class="h-[240px] overflow-hidden rounded-2xl md:h-full border border-white/[0.06]">
            <img
              src={IMG.gallery[0]}
              alt={venue.name}
              class="h-full w-full object-cover"
            />
          </div>
          <div
            class="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur-sm border border-white/10"
          >
            <span class="caption text-white/90 font-medium"> 1 / 4 </span>
          </div>
        </div>
        {#each IMG.gallery.slice(1) as src, i}
          <div class={i === 0 ? "block" : "hidden md:block"}>
            <div class="h-[116px] overflow-hidden rounded-2xl md:h-[200px] border border-white/[0.06]">
              <img
                src={src}
                alt={`${venue.name} ${i + 2}`}
                class="h-full w-full object-cover"
              />
            </div>
          </div>
        {/each}
      </div>
    </section>

    <!-- ─── MAIN CONTENT ─── -->
    <section class="container pb-24">
      <div class="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_380px]">
        <!-- Left — venue info -->
        <div>
          <!-- Header -->
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div class="flex flex-wrap items-center gap-3">
                <h1 class="heading-1 text-[#F7F7F7]">{venue.name}</h1>
                {#if venue.isVerified || venue.status === "APPROVED"}
                  <span
                    class="caption flex items-center gap-1 rounded-full bg-[#E6FA50] px-2.5 py-0.5 uppercase text-[#06121A] font-bold"
                  >
                    <Shield class="h-2.5 w-2.5" />
                    VERIFIED
                  </span>
                {/if}
              </div>
              <p class="mt-2 flex items-center gap-2 body-sm text-[#F7F7F7]/40">
                <MapPin class="h-3.5 w-3.5 shrink-0 text-[#50C8C8]" />
                <span class="truncate">
                  {venue.location} · {venue.city}
                </span>
              </p>
            </div>
            <div class="flex items-center gap-2 sm:shrink-0">
              <Star class="h-4 w-4 fill-[#E6FA50] text-[#E6FA50]" />
              <span class="label font-bold text-[#E6FA50]">{venue.rating ?? 4.8}</span>
              <span class="caption text-[#F7F7F7]/40">
                ({venue.reviewCount ?? 124} reviews)
              </span>
            </div>
          </div>

          <!-- Description -->
          <p class="body mt-4 text-[#F7F7F7]/60 leading-relaxed">{venue.description}</p>

          <!-- 1. OPERATING HOURS (Clean 1:1 Table Card with Row Dividers) -->
          <div class="mt-10">
            <h2 class="heading-2 flex items-center gap-2.5 text-[#F7F7F7]">
              <Clock class="h-5 w-5 text-[#50C8C8]" />
              Operating Hours
            </h2>
            <div class="mt-4 rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 shadow-xl">
              <div class="space-y-1">
                {#each weekDays as { key, label }}
                  {@const day = venue.weeklyHours?.[key] || {
                    open: venue.openTime || "06:00",
                    close: venue.closeTime || "22:00",
                  }}
                  {@const isToday = key === wibShort}
                  <div
                    class="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-b-0 px-2 rounded-lg transition-colors {isToday ? 'bg-white/[0.02]' : ''}"
                  >
                    <div class="flex items-center gap-2.5">
                      <span class="body-sm font-medium {isToday ? 'text-[#F7F7F7] font-semibold' : 'text-[#F7F7F7]/60'}">
                        {label}
                      </span>
                      {#if isToday}
                        <span class="rounded bg-[#E6FA50]/20 px-2 py-0.5 text-[10px] font-bold text-[#E6FA50] uppercase tracking-wide">
                          Today
                        </span>
                      {/if}
                    </div>
                    <span
                      class="body-sm font-semibold tracking-tight {isToday
                        ? 'text-[#E6FA50]'
                        : day.closed
                          ? 'text-[#F7F7F7]/25'
                          : 'text-[#F7F7F7]/70'}"
                    >
                      {day.closed
                        ? "Closed"
                        : `${day.open || "06:00"} – ${day.close || "22:00"}`}
                    </span>
                  </div>
                {/each}
              </div>
            </div>
          </div>

          <!-- 2. FACILITIES SECTION -->
          {#if venue.facilities && venue.facilities.length > 0}
            <div class="mt-10">
              <h2 class="heading-2 text-[#F7F7F7]">Facilities</h2>
              <div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {#each venue.facilities as facility}
                  <div class="flex items-center gap-3.5 rounded-xl border border-white/[0.06] bg-[#0C1B26] px-4 py-3.5 shadow-sm">
                    <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-[#50C8C8]/10 text-[#50C8C8]">
                      {#if facility === "Parking"}
                        <Car class="h-4 w-4" />
                      {:else if facility === "Shower"}
                        <ShowerHead class="h-4 w-4" />
                      {:else if facility === "Locker"}
                        <Lock class="h-4 w-4" />
                      {:else if facility === "Cafe"}
                        <Coffee class="h-4 w-4" />
                      {:else if facility === "WiFi"}
                        <Wifi class="h-4 w-4" />
                      {:else if facility === "AC"}
                        <Wind class="h-4 w-4" />
                      {:else if facility === "Coaching"}
                        <Users class="h-4 w-4" />
                      {:else}
                        <Dumbbell class="h-4 w-4" />
                      {/if}
                    </div>
                    <span class="body-sm font-medium text-[#F7F7F7]/80">
                      {facility}
                    </span>
                  </div>
                {/each}
              </div>
            </div>
          {/if}

          <!-- 3. COURTS & PRICING SECTION -->
          <div class="mt-10">
            <h2 class="heading-2 text-[#F7F7F7]">Courts & Pricing</h2>
            <div class="mt-4 space-y-4">
              {#each courts as court (court.id)}
                <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 shadow-xl">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="heading-3 text-[#F7F7F7]">{court.name}</p>
                      <p class="caption mt-0.5 text-[#F7F7F7]/40 uppercase font-medium">
                        {court.type} court
                      </p>
                    </div>
                    <div class="rounded-lg bg-[#50C8C8]/10 px-3.5 py-1.5 border border-[#50C8C8]/20">
                      <p class="caption font-semibold text-[#50C8C8]">
                        From Rp {((court.weekdayOffPeak ?? 200000) / 1000).toFixed(0)}K/hr
                      </p>
                    </div>
                  </div>
                  <div class="mt-4 grid grid-cols-2 gap-3">
                    <div class="flex flex-col justify-center rounded-xl bg-white/[0.02] border border-white/[0.04] px-4 py-3 text-center">
                      <p class="caption whitespace-nowrap text-[#F7F7F7]/40">Weekday Off-Peak</p>
                      <p class="label mt-1 text-[#F7F7F7] font-bold">
                        Rp {((court.weekdayOffPeak ?? 200000) / 1000).toFixed(0)}K
                      </p>
                    </div>
                    <div class="flex flex-col justify-center rounded-xl bg-white/[0.02] border border-white/[0.04] px-4 py-3 text-center">
                      <p class="caption whitespace-nowrap text-[#F7F7F7]/40">Weekday Peak</p>
                      <p class="label mt-1 text-[#F7F7F7] font-bold">
                        Rp {((court.weekdayPeak ?? 300000) / 1000).toFixed(0)}K
                      </p>
                    </div>
                    <div class="flex flex-col justify-center rounded-xl bg-white/[0.02] border border-white/[0.04] px-4 py-3 text-center">
                      <p class="caption whitespace-nowrap text-[#F7F7F7]/40">Weekend Off-Peak</p>
                      <p class="label mt-1 text-[#F7F7F7] font-bold">
                        Rp {((court.weekendOffPeak ?? 250000) / 1000).toFixed(0)}K
                      </p>
                    </div>
                    <div class="flex flex-col justify-center rounded-xl bg-[#E6FA50]/5 border border-[#E6FA50]/20 px-4 py-3 text-center">
                      <p class="caption whitespace-nowrap text-[#E6FA50]/70">Weekend Peak</p>
                      <p class="label mt-1 text-[#E6FA50] font-bold">
                        Rp {((court.weekendPeak ?? 400000) / 1000).toFixed(0)}K
                      </p>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
            <p class="caption mt-3 text-[#F7F7F7]/30">
              Peak hours: 09:00–11:00 & 16:00–21:00. Prices include court rental only.
            </p>
          </div>

          <!-- 4. TODAY'S AVAILABILITY SECTION -->
          <div class="mt-10">
            <h2 class="heading-2 text-[#F7F7F7]">
              Today's Availability
            </h2>
            <p class="caption mt-1 text-[#F7F7F7]/40">
              {courts[0]?.name ?? "Court A"} · {formatBookingDate(new Date())}
            </p>
            <div class="mt-4 grid grid-cols-4 gap-2.5 sm:grid-cols-7">
              {#each TIME_SLOTS as slot}
                <button
                  type="button"
                  disabled={!slot.available}
                  class="caption rounded-xl py-2.5 text-center transition-all {!slot.available
                    ? 'bg-white/[0.02] text-[#F7F7F7]/20 line-through cursor-not-allowed border border-transparent'
                    : slot.peak
                      ? 'border border-[#E6FA50]/30 bg-[#E6FA50]/10 text-[#E6FA50] font-semibold hover:border-[#E6FA50]/60'
                      : 'border border-white/[0.08] bg-[#0C1B26] text-[#F7F7F7]/70 hover:border-[#50C8C8]/40 hover:text-[#50C8C8]'}"
                >
                  {slot.time}
                </button>
              {/each}
            </div>
            <div class="mt-3 flex items-center gap-4">
              <div class="flex items-center gap-1.5">
                <div class="h-2.5 w-2.5 rounded-sm border border-white/[0.08] bg-[#0C1B26]"></div>
                <span class="caption text-[#F7F7F7]/30">Available</span>
              </div>
              <div class="flex items-center gap-1.5">
                <div class="h-2.5 w-2.5 rounded-sm border border-[#E6FA50]/30 bg-[#E6FA50]/10"></div>
                <span class="caption text-[#F7F7F7]/30">Peak Hour</span>
              </div>
              <div class="flex items-center gap-1.5">
                <div class="h-2.5 w-2.5 rounded-sm bg-white/[0.02]"></div>
                <span class="caption text-[#F7F7F7]/30">Booked</span>
              </div>
            </div>
          </div>

          <!-- 5. LOCATION SECTION -->
          <div class="mt-10">
            <div class="flex items-center justify-between">
              <h2 class="heading-2 text-[#F7F7F7]">Location</h2>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(`${venue.location}, ${venue.city}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                class="label inline-flex items-center gap-1.5 text-xs text-[#50C8C8] hover:underline"
              >
                <MapPin class="h-3.5 w-3.5" />
                <span>Open in Google Maps</span>
              </a>
            </div>

            <div class="mt-4">
              <DarkMap
                location={venue.location}
                city={venue.city}
                venueName={venue.name}
                lat={venue.latitude}
                lng={venue.longitude}
              />
            </div>

            <div class="mt-3 flex items-start gap-2 text-xs sm:text-sm text-[#F7F7F7]/70">
              <MapPin class="h-4 w-4 text-[#50C8C8] shrink-0 mt-0.5" />
              <span>{venue.location}, {venue.city}, Indonesia</span>
            </div>
          </div>

          <!-- 6. REFUND POLICY SECTION -->
          <div class="mt-10">
            <h2 class="heading-2 text-[#F7F7F7]">Refund Policy</h2>
            <div class="mt-4 rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
              <div class="space-y-3.5">
                <div class="flex items-start gap-3">
                  <div class="mt-1.5 h-2 w-2 rounded-full bg-emerald-400 shrink-0"></div>
                  <p class="body-sm text-[#F7F7F7]/80">
                    Full refund if cancelled more than 24 hours before booking
                  </p>
                </div>
                <div class="flex items-start gap-3">
                  <div class="mt-1.5 h-2 w-2 rounded-full bg-amber-400 shrink-0"></div>
                  <p class="body-sm text-[#F7F7F7]/80">
                    50% refund if cancelled 12–24 hours before booking
                  </p>
                </div>
                <div class="flex items-start gap-3">
                  <div class="mt-1.5 h-2 w-2 rounded-full bg-red-400 shrink-0"></div>
                  <p class="body-sm text-[#F7F7F7]/80">
                    Non-refundable if cancelled less than 12 hours before booking
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- 7. REVIEWS SECTION -->
          <div class="mt-10">
            <h2 class="heading-2 text-[#F7F7F7]">Reviews</h2>
            {#if reviews.length === 0}
              <!-- 1:1 Sample Reviews from Image #104 -->
              <div class="mt-4 space-y-3">
                <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5">
                  <div class="flex items-center justify-between">
                    <p class="heading-3 text-[#F7F7F7]">Budi Rahmat</p>
                    <div class="flex items-center gap-1">
                      {#each [1, 2, 3, 4, 5] as n}
                        <Star class="h-3.5 w-3.5 fill-[#E6FA50] text-[#E6FA50]" />
                      {/each}
                    </div>
                  </div>
                  <p class="body mt-2 text-[#F7F7F7]/70">Kondisi lapangan sangat terawat. Top!</p>
                  <p class="caption mt-2 text-[#F7F7F7]/25">Sat, Aug 8, 2026</p>
                </div>

                <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5">
                  <div class="flex items-center justify-between">
                    <p class="heading-3 text-[#F7F7F7]">Sari Dewi</p>
                    <div class="flex items-center gap-1">
                      {#each [1, 2, 3, 4] as n}
                        <Star class="h-3.5 w-3.5 fill-[#E6FA50] text-[#E6FA50]" />
                      {/each}
                      <Star class="h-3.5 w-3.5 text-[#F7F7F7]/20" />
                    </div>
                  </div>
                  <p class="body mt-2 text-[#F7F7F7]/70">Asik buat main sore, tapi siang panas banget.</p>
                  <p class="caption mt-2 text-[#F7F7F7]/25">Mon, Aug 3, 2026</p>
                </div>

                <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5">
                  <div class="flex items-center justify-between">
                    <p class="heading-3 text-[#F7F7F7]">Andi Pratama</p>
                    <div class="flex items-center gap-1">
                      {#each [1, 2, 3, 4, 5] as n}
                        <Star class="h-3.5 w-3.5 fill-[#E6FA50] text-[#E6FA50]" />
                      {/each}
                    </div>
                  </div>
                  <p class="body mt-2 text-[#F7F7F7]/70">Fasilitas outdoor terbaik di Bali! View-nya mantap.</p>
                  <p class="caption mt-2 text-[#F7F7F7]/25">Sat, Aug 1, 2026</p>
                </div>
              </div>
            {:else}
              <div class="mt-4 space-y-3">
                {#each reviews as review (review.id)}
                  <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5">
                    <div class="flex items-center justify-between">
                      <p class="heading-3 text-[#F7F7F7]">{review.authorName || "Padel Player"}</p>
                      <div class="flex items-center gap-1">
                        {#each [1, 2, 3, 4, 5] as n}
                          <Star class="h-3.5 w-3.5 {n <= review.rating ? 'fill-[#E6FA50] text-[#E6FA50]' : 'text-[#F7F7F7]/15'}" />
                        {/each}
                      </div>
                    </div>
                    {#if review.comment}
                      <p class="body mt-2 text-[#F7F7F7]/70">{review.comment}</p>
                    {/if}
                    <p class="caption mt-2 text-[#F7F7F7]/25">{formatBookingDate(new Date(review.createdAt))}</p>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </div>

        <!-- Right — booking sidebar (sticky) -->
        <div class="lg:relative">
          <div class="lg:sticky lg:top-24 space-y-4">
            <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 shadow-2xl">
              <div class="flex items-baseline justify-between">
                <div>
                  <p class="metric text-[#F7F7F7]">
                    {minPrice > 0
                      ? `Rp ${(minPrice / 1000).toFixed(0)}K`
                      : "Pricing soon"}
                  </p>
                  <p class="caption mt-0.5 text-[#F7F7F7]/40">
                    per hour, starting from
                  </p>
                </div>
              </div>

              <div class="mt-6 space-y-3">
                <div class="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <p class="caption text-[#F7F7F7]/40">Date</p>
                  <p class="heading-3 mt-1 text-[#F7F7F7]">Today</p>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div class="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <p class="caption text-[#F7F7F7]/40">Start</p>
                    <p class="heading-3 mt-1 text-[#F7F7F7]">10:00</p>
                  </div>
                  <div class="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <p class="caption text-[#F7F7F7]/40">End</p>
                    <p class="heading-3 mt-1 text-[#F7F7F7]">11:00</p>
                  </div>
                </div>
                <div class="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <p class="caption text-[#F7F7F7]/40">Court</p>
                  <p class="heading-3 mt-1 text-[#F7F7F7]">
                    {courts[0]?.name ?? "Court A"}
                  </p>
                </div>
              </div>

              <div class="mt-6 flex items-center justify-between border-t border-white/[0.06] pt-4">
                <p class="body-sm text-[#F7F7F7]/40">Total</p>
                <p class="price text-[#E6FA50]">
                  {minPrice > 0
                    ? `Rp ${(minPrice / 1000).toFixed(0)}K`
                    : "Pricing soon"}
                </p>
              </div>

              <a
                href="/venues/{venue.id}/book"
                class="label btn-lime mt-6 flex h-12 w-full items-center justify-center rounded-full font-bold text-[#06121A]"
              >
                Book Court
              </a>

              <div class="mt-4 flex items-center justify-center gap-2 caption text-[#F7F7F7]/40 text-center">
                <Users class="h-3.5 w-3.5 text-[#50C8C8]" />
                <span>Invite friends & split payment after booking</span>
              </div>
            </div>

            <!-- Quick info summary table -->
            <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5 space-y-3 text-xs">
              <div class="flex items-center justify-between">
                <span class="text-[#F7F7F7]/40">Courts</span>
                <span class="font-semibold text-[#F7F7F7]">{courts.length}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-[#F7F7F7]/40">Price range</span>
                <span class="font-semibold text-[#F7F7F7]">
                  {minPrice > 0 && maxPrice > 0
                    ? `Rp ${(minPrice / 1000).toFixed(0)}K – ${(maxPrice / 1000).toFixed(0)}K`
                    : "Pricing soon"}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-[#F7F7F7]/40">Hours</span>
                <span class="font-semibold text-[#F7F7F7]">
                  {venue.openTime || "06:00"} – {venue.closeTime || "22:00"}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-[#F7F7F7]/40">Rating</span>
                <span class="font-bold text-[#E6FA50]">{venue.rating ?? 4.8}/5</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-[#F7F7F7]/40">Refund</span>
                <span class="font-semibold text-[#F7F7F7]">Free cancel &gt;24h</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Mobile Sticky Bottom Bar -->
    <div
      class="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.06] bg-[#0C1B26] px-6 py-4 lg:hidden shadow-[0_-8px_30px_rgba(0,0,0,0.4)]"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="caption text-[#F7F7F7]/60">Starting from</p>
          <p class="price text-[#E6FA50]">
            {minPrice > 0
              ? `Rp ${(minPrice / 1000).toFixed(0)}K`
              : "Pricing soon"}
          </p>
        </div>
        <a
          href="/venues/{venue.id}/book"
          class="label btn-lime flex h-12 w-36 items-center justify-center rounded-full font-bold text-[#06121A]"
        >
          Book Now
        </a>
      </div>
    </div>
  {/if}
</div>
