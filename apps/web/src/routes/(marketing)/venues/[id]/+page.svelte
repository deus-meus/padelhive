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

<div class="min-h-screen pt-20 pb-24 lg:pb-0">
  {#if isLoadingVenue}
    <div class="container py-8">
      <div class="grid grid-cols-2 gap-2 md:grid-cols-4 md:grid-rows-2">
        <div
          class="col-span-2 md:row-span-2 h-[240px] md:h-full rounded-2xl animate-pulse bg-white/[0.04]"
        ></div>
        <div
          class="h-[116px] md:h-[200px] rounded-2xl animate-pulse bg-white/[0.04]"
        ></div>
        <div
          class="h-[116px] md:h-[200px] rounded-2xl animate-pulse bg-white/[0.04]"
        ></div>
        <div
          class="h-[116px] md:h-[200px] rounded-2xl animate-pulse bg-white/[0.04]"
        ></div>
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
          <div class="h-[240px] overflow-hidden rounded-2xl md:h-full">
            <img
              src={IMG.gallery[0]}
              alt={venue.name}
              class="h-full w-full object-cover"
            />
          </div>
          <div
            class="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur-sm"
          >
            <span class="caption text-white/90"> 1 / 4 </span>
          </div>
        </div>
        {#each IMG.gallery.slice(1) as src, i}
          <div class={i === 0 ? "block" : "hidden md:block"}>
            <div
              class="h-[116px] overflow-hidden rounded-2xl md:h-[200px]"
            >
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
          <div
            class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
          >
            <div>
              <div class="flex flex-wrap items-center gap-3">
                <h1 class="heading-1 text-[#F7F7F7]">{venue.name}</h1>
                {#if venue.isVerified || venue.status === "APPROVED"}
                  <span
                    class="caption flex items-center gap-1 rounded-full bg-[#E6FA50] px-2.5 py-0.5 uppercase text-[#06121A] font-bold"
                  >
                    <Shield class="h-2.5 w-2.5" />
                    Verified
                  </span>
                {/if}
              </div>
              <p
                class="mt-2 flex items-center gap-2 caption text-[#F7F7F7]/40"
              >
                <MapPin class="h-3.5 w-3.5 shrink-0" />
                <span class="truncate">
                  {venue.location} · {venue.city}
                </span>
              </p>
            </div>
            <div class="flex items-center gap-2 sm:shrink-0">
              <Star class="h-4 w-4 fill-[#E6FA50] text-[#E6FA50]" />
              <span class="label text-[#E6FA50]">{venue.rating ?? 4.8}</span>
              <span class="caption text-[#F7F7F7]/25">
                ({venue.reviewCount ?? 12} reviews)
              </span>
            </div>
          </div>

          <!-- Description -->
          <p class="body mt-6 text-[#F7F7F7]/60">{venue.description}</p>

          <!-- Operating hours -->
          <div class="mt-10">
            <h2 class="heading-2 flex items-center gap-2 text-[#F7F7F7]">
              <Clock class="h-5 w-5" />
              Operating Hours
            </h2>
            <div
              class="mt-4 rounded-xl border border-white/[0.06] bg-[#0C1B26] p-5"
            >
              <div class="divide-y divide-white/[0.04]">
                {#each weekDays as { key, label }}
                  {@const day = venue.weeklyHours?.[key] || {
                    open: venue.openTime || "06:00",
                    close: venue.closeTime || "22:00",
                  }}
                  {@const isToday = key === wibShort}
                  <div
                    class="flex items-center justify-between py-2 first:pt-0 last:pb-0"
                  >
                    <span class="caption text-[#F7F7F7]/60">{label}</span>
                    <span
                      class="caption {isToday
                        ? 'text-[#E6FA50]'
                        : day.closed
                          ? 'text-[#F7F7F7]/25'
                          : 'text-[#F7F7F7]/60'}"
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

          <!-- Facilities -->
          {#if venue.facilities && venue.facilities.length > 0}
            <div class="mt-10">
              <h2 class="heading-2 text-[#F7F7F7]">Facilities</h2>
              <div
                class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3"
              >
                {#each venue.facilities as facility}
                  <div
                    class="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#0C1B26] px-4 py-3"
                  >
                    <span class="text-[#50C8C8]">
                      {#if facility === "Parking"}
                        <Car class="h-3.5 w-3.5" />
                      {:else if facility === "Shower"}
                        <ShowerHead class="h-3.5 w-3.5" />
                      {:else if facility === "Locker"}
                        <Lock class="h-3.5 w-3.5" />
                      {:else if facility === "Cafe"}
                        <Coffee class="h-3.5 w-3.5" />
                      {:else if facility === "WiFi"}
                        <Wifi class="h-3.5 w-3.5" />
                      {:else if facility === "AC"}
                        <Wind class="h-3.5 w-3.5" />
                      {:else if facility === "Coaching"}
                        <Users class="h-3.5 w-3.5" />
                      {:else}
                        <Dumbbell class="h-3.5 w-3.5" />
                      {/if}
                    </span>
                    <span class="caption text-[#F7F7F7]/60">
                      {facility}
                    </span>
                  </div>
                {/each}
              </div>
            </div>
          {/if}

          <!-- Courts & Pricing -->
          <div class="mt-10">
            <h2 class="heading-2 text-[#F7F7F7]">Courts & Pricing</h2>
            <div class="mt-4 space-y-3">
              {#each courts as court (court.id)}
                <div
                  class="rounded-xl border border-white/[0.06] bg-[#0C1B26] p-5"
                >
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="heading-3 text-[#F7F7F7]">{court.name}</p>
                      <p class="caption mt-0.5 text-[#F7F7F7]/25">
                        {court.type} court
                      </p>
                    </div>
                    <div class="rounded-lg bg-[#50C8C8]/10 px-3 py-1">
                      <p class="caption text-[#50C8C8]">
                        From Rp{" "}
                        {((court.weekdayOffPeak ?? 200000) / 1000).toFixed(0)}K/hr
                      </p>
                    </div>
                  </div>
                  <div class="mt-4 grid grid-cols-2 gap-2.5">
                    <div
                      class="flex flex-col justify-center rounded-lg bg-white/[0.02] px-4 py-3 text-center"
                    >
                      <p class="caption whitespace-nowrap text-[#F7F7F7]/40">
                        Weekday Off-Peak
                      </p>
                      <p class="label mt-1 text-[#F7F7F7]/70">
                        Rp {((court.weekdayOffPeak ?? 200000) / 1000).toFixed(0)}K
                      </p>
                    </div>
                    <div
                      class="flex flex-col justify-center rounded-lg bg-white/[0.02] px-4 py-3 text-center"
                    >
                      <p class="caption whitespace-nowrap text-[#F7F7F7]/40">
                        Weekday Peak
                      </p>
                      <p class="label mt-1 text-[#F7F7F7]/70">
                        Rp {((court.weekdayPeak ?? 300000) / 1000).toFixed(0)}K
                      </p>
                    </div>
                    <div
                      class="flex flex-col justify-center rounded-lg bg-white/[0.02] px-4 py-3 text-center"
                    >
                      <p class="caption whitespace-nowrap text-[#F7F7F7]/40">
                        Weekend Off-Peak
                      </p>
                      <p class="label mt-1 text-[#F7F7F7]/70">
                        Rp {((court.weekendOffPeak ?? 250000) / 1000).toFixed(0)}K
                      </p>
                    </div>
                    <div
                      class="flex flex-col justify-center rounded-lg bg-[#E6FA50]/5 px-4 py-3 text-center"
                    >
                      <p class="caption whitespace-nowrap text-[#E6FA50]/60">
                        Weekend Peak
                      </p>
                      <p class="label mt-1 text-[#E6FA50]/80">
                        Rp {((court.weekendPeak ?? 400000) / 1000).toFixed(0)}K
                      </p>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
            <p class="caption mt-3 text-[#F7F7F7]/25">
              Peak hours: 09:00–11:00 & 16:00–21:00. Prices include court rental only.
            </p>
          </div>

          <!-- Availability -->
          <div class="mt-10">
            <h2 class="heading-2 text-[#F7F7F7]">
              Today's Availability
            </h2>
            <p class="caption mt-1 text-[#F7F7F7]/25">
              {courts[0]?.name ?? "Court 1"} · {formatBookingDate(new Date())}
            </p>
            <div class="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-8">
              {#each TIME_SLOTS as slot}
                <button
                  type="button"
                  disabled={!slot.available}
                  class="caption rounded-lg py-2.5 text-center transition-all {!slot.available
                    ? 'bg-white/[0.02] text-[#F7F7F7]/15 cursor-not-allowed'
                    : slot.peak
                      ? 'border border-[#E6FA50]/20 bg-[#E6FA50]/5 text-[#E6FA50]/70 hover:border-[#E6FA50]/40 hover:text-[#E6FA50]'
                      : 'border border-white/[0.08] bg-[#0C1B26] text-[#F7F7F7]/60 hover:border-[#50C8C8]/30 hover:text-[#50C8C8]'}"
                >
                  {slot.time}
                </button>
              {/each}
            </div>
            <div class="mt-3 flex items-center gap-4">
              <div class="flex items-center gap-1.5">
                <div
                  class="h-2.5 w-2.5 rounded-sm border border-white/[0.08] bg-[#0C1B26]"
                ></div>
                <span class="caption text-[#F7F7F7]/25">Available</span>
              </div>
              <div class="flex items-center gap-1.5">
                <div
                  class="h-2.5 w-2.5 rounded-sm border border-[#E6FA50]/20 bg-[#E6FA50]/5"
                ></div>
                <span class="caption text-[#F7F7F7]/25">Peak Hour</span>
              </div>
              <div class="flex items-center gap-1.5">
                <div class="h-2.5 w-2.5 rounded-sm bg-white/[0.02]"></div>
                <span class="caption text-[#F7F7F7]/25">Booked</span>
              </div>
            </div>
          </div>

          <!-- Location -->
          <div class="mt-10">
            <h2 class="heading-2 text-[#F7F7F7]">Location</h2>
            <div
              class="mt-4 overflow-hidden rounded-xl border border-white/[0.06]"
            >
              <div class="flex h-[200px] items-center justify-center bg-[#0C1B26]">
                <div class="text-center">
                  <Navigation class="mx-auto h-8 w-8 text-[#50C8C8]/40" />
                  <p class="body-sm mt-3 text-[#F7F7F7]/40">
                    {venue.location}
                  </p>
                  <p class="caption mt-1 text-[#F7F7F7]/25">
                    {venue.city}, Indonesia
                  </p>
                </div>
              </div>
            </div>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(`${venue.location}, ${venue.city}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              class="label mt-3 inline-flex items-center gap-1.5 text-[#50C8C8] hover:text-[#50C8C8]/80"
            >
              <MapPin class="h-3 w-3" />
              Open in Google Maps
            </a>
          </div>

          <!-- Refund Policy -->
          <div class="mt-10">
            <h2 class="heading-2 text-[#F7F7F7]">Refund Policy</h2>
            <div
              class="mt-4 rounded-xl border border-white/[0.06] bg-[#0C1B26] p-5"
            >
              <div class="space-y-3">
                <div class="flex items-start gap-3">
                  <div class="mt-0.5 h-2 w-2 rounded-full bg-green-400"></div>
                  <div>
                    <p class="body-sm text-[#F7F7F7]/60">
                      Full refund if cancelled more than 24 hours before booking
                    </p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <div class="mt-0.5 h-2 w-2 rounded-full bg-yellow-400"></div>
                  <div>
                    <p class="body-sm text-[#F7F7F7]/60">
                      50% refund if cancelled 12–24 hours before booking
                    </p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <div class="mt-0.5 h-2 w-2 rounded-full bg-red-400"></div>
                  <div>
                    <p class="body-sm text-[#F7F7F7]/60">
                      Non-refundable if cancelled less than 12 hours before
                      booking
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Reviews -->
          <div class="mt-10">
            <h2 class="heading-2 text-[#F7F7F7]">Reviews</h2>
            {#if reviews.length === 0}
              <div class="mt-4">
                <EmptyState
                  icon={Star}
                  title="No reviews yet"
                  description="Be the first to review this venue after your visit."
                  actionLabel="Book a court"
                  actionHref={`/venues/${venue.id}/book`}
                />
              </div>
            {:else}
              <div class="mt-4 space-y-3">
                {#each reviews as review (review.id)}
                  <div
                    class="rounded-xl border border-white/[0.06] bg-[#0C1B26] p-5"
                  >
                    <div class="flex items-center justify-between">
                      <p class="heading-3 text-[#F7F7F7]">
                        {review.authorName || "Padel Player"}
                      </p>
                      <div class="flex items-center gap-1">
                        {#each [1, 2, 3, 4, 5] as n}
                          <Star
                            class="h-3.5 w-3.5 {n <= review.rating
                              ? 'fill-[#E6FA50] text-[#E6FA50]'
                              : 'text-[#F7F7F7]/15'}"
                          />
                        {/each}
                      </div>
                    </div>
                    {#if review.comment}
                      <p class="body mt-2 text-[#F7F7F7]/60">
                        {review.comment}
                      </p>
                    {/if}
                    <p class="caption mt-2 text-[#F7F7F7]/25">
                      {formatBookingDate(new Date(review.createdAt))}
                    </p>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </div>

        <!-- Right — booking sidebar (sticky) -->
        <div class="lg:relative">
          <div class="lg:sticky lg:top-28">
            <div
              class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6"
            >
              <div class="flex items-baseline justify-between">
                <div>
                  <p class="price text-[#F7F7F7]">
                    {minPrice > 0
                      ? `Rp ${(minPrice / 1000).toFixed(0)}K`
                      : "Pricing soon"}
                  </p>
                  <p class="caption mt-0.5 text-[#F7F7F7]/25">
                    per hour, starting from
                  </p>
                </div>
              </div>

              <div class="mt-6 space-y-3">
                <div
                  class="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
                >
                  <p class="caption text-[#F7F7F7]/25">Date</p>
                  <p class="heading-3 mt-1 text-[#F7F7F7]">Today</p>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div
                    class="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
                  >
                    <p class="caption text-[#F7F7F7]/25">Start</p>
                    <p class="heading-3 mt-1 text-[#F7F7F7]">10:00</p>
                  </div>
                  <div
                    class="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
                  >
                    <p class="caption text-[#F7F7F7]/25">End</p>
                    <p class="heading-3 mt-1 text-[#F7F7F7]">11:00</p>
                  </div>
                </div>
                <div
                  class="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
                >
                  <p class="caption text-[#F7F7F7]/25">Court</p>
                  <p class="heading-3 mt-1 text-[#F7F7F7]">
                    {courts[0]?.name ?? "Court 1"}
                  </p>
                </div>
              </div>

              <div
                class="mt-6 flex items-center justify-between border-t border-white/[0.06] pt-4"
              >
                <p class="caption text-[#F7F7F7]/40">Total</p>
                <p class="price text-[#F7F7F7]">
                  {minPrice > 0
                    ? `Rp ${(minPrice / 1000).toFixed(0)}K`
                    : "Pricing soon"}
                </p>
              </div>

              <a
                href="/venues/{venue.id}/book"
                class="label btn-lime mt-6 hidden h-12 w-full items-center justify-center rounded-full lg:flex"
              >
                Book Court
              </a>

              <div
                class="mt-4 flex items-center justify-center gap-2 caption text-[#F7F7F7]/25"
              >
                <Users class="h-3 w-3" />
                <span>Invite friends & split payment after booking</span>
              </div>
            </div>

            <!-- Quick info -->
            <div
              class="mt-4 rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5"
            >
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="caption text-[#F7F7F7]/25">Courts</span>
                  <span class="label text-[#F7F7F7]/60">
                    {courts.length}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="caption text-[#F7F7F7]/25">
                    Price range
                  </span>
                  <span class="label text-[#F7F7F7]/60">
                    {minPrice > 0 && maxPrice > 0
                      ? `Rp ${(minPrice / 1000).toFixed(0)}K – ${(maxPrice / 1000).toFixed(0)}K`
                      : "Pricing soon"}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="caption text-[#F7F7F7]/25">Hours</span>
                  <span class="label text-[#F7F7F7]/60">
                    {venue.openTime || "06:00"} – {venue.closeTime || "22:00"}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="caption text-[#F7F7F7]/25">Rating</span>
                  <span class="label text-[#E6FA50]">
                    {venue.rating ?? 4.8}/5
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="caption text-[#F7F7F7]/25">Refund</span>
                  <span class="label text-[#F7F7F7]/60">
                    Free cancel &gt;24h
                  </span>
                </div>
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
          class="label btn-lime flex h-12 w-32 items-center justify-center rounded-full"
        >
          Book Now
        </a>
      </div>
    </div>
  {/if}
</div>