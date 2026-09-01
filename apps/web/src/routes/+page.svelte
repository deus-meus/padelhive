<script lang="ts">
import { ArrowRight, MapPin, Star } from "lucide-svelte";
import { onMount } from "svelte";
import { api } from "$lib/api/client";
import HomeSearchBar from "$lib/components/home/home-search-bar.svelte";
import EmptyState from "$lib/components/ui/empty-state.svelte";
import { padelImg } from "$lib/images";

const IMG = {
  hero: padelImg(1920, 85),
  featured: padelImg(1400, 85),
  bali: padelImg(900),
  jakarta: padelImg(900),
  surabaya: padelImg(900),
  community: padelImg(1000),
  venue1: padelImg(600),
  venue2: padelImg(600),
  venue3: padelImg(600),
};

let venues = $state<any[]>([]);
let stats = $state<any | null>(null);
let isLoading = $state(true);

onMount(async () => {
  try {
    const [fetchedVenues, fetchedStats] = await Promise.all([
      api.venues.get(),
      api.stats.home.get(),
    ]);
    if (fetchedVenues.data) venues = fetchedVenues.data;
    if (fetchedStats.data) stats = fetchedStats.data;
  } catch (error) {
    console.warn("Home page fetch error:", error);
  } finally {
    isLoading = false;
  }
});

function formatStat(n: number): string {
  if (!n) return "0";
  if (n >= 1000) {
    return `${Math.floor(n / 1000)}K+`;
  }
  return n.toLocaleString("en-US");
}

function getCityCount(cityName: string) {
  if (!stats?.cityCounts) return 0;
  const match = stats.cityCounts.find(
    (c: any) => c.city.toLowerCase() === cityName.toLowerCase(),
  );
  return match ? match.count : 0;
}

const featuredVenue = $derived(venues.length > 0 ? venues[0] : null);
</script>

<svelte:head>
  <title>PadelHive - Play. Compete. Connect.</title>
  <meta
    name="description"
    content="Indonesia's premier padel community. Book courts, join matches, meet players."
  />
</svelte:head>

<!-- ─── HERO ─── -->
<section class="relative flex min-h-[100svh] flex-col overflow-hidden">
  <div class="absolute inset-0">
    <img
      src={IMG.hero}
      alt="Padel doubles match in action"
      class="h-full w-full object-cover object-center"
    />
    <div class="absolute inset-0 bg-[#06121A]/50"></div>
    <div
      class="absolute inset-0 bg-gradient-to-t from-[#06121A] via-[#06121A]/40 to-transparent"
    ></div>
  </div>

  <div
    class="container relative z-10 flex flex-1 flex-col justify-center pt-24 pb-16 md:pt-28 md:pb-20"
  >
    <h1 class="display-hero text-[#F7F7F7]">
      BOOK.<br />
      <span class="text-[#E6FA50]">PLAY.</span><br />
      CONNECT.
    </h1>

    <div
      class="mt-10 flex flex-col gap-6 md:mt-12 md:flex-row md:items-end md:justify-between"
    >
      <p class="body-lg max-w-md text-[#F7F7F7]/60">
        Indonesia's padel community. Book courts, join matches, meet players.
      </p>

      <div class="flex flex-wrap gap-3">
        <a
          href="/venues"
          class="label btn-lime inline-flex h-12 items-center justify-center rounded-full px-8"
        >
          Book a Court
        </a>
        <a
          href="#community"
          class="label btn-outline-white inline-flex h-12 items-center justify-center rounded-full px-8"
        >
          Join a Match
        </a>
      </div>
    </div>
  </div>
</section>

<!-- ─── STATS ─── -->
<section class="border-y border-white/[0.06] bg-[#06121A]">
  <div class="container flex items-center justify-between py-5">
    <div class="flex items-baseline gap-2">
      <span class="metric text-[#E6FA50]">{formatStat(stats?.players ?? 0)}</span>
      <span class="caption uppercase text-[#F7F7F7]/25">Players</span>
    </div>
    <div class="h-4 w-px bg-white/[0.08]"></div>

    <div class="flex items-baseline gap-2">
      <span class="metric text-[#E6FA50]">{formatStat(stats?.venues ?? 0)}</span>
      <span class="caption uppercase text-[#F7F7F7]/25">Venues</span>
    </div>
    <div class="h-4 w-px bg-white/[0.08]"></div>

    <div class="flex items-baseline gap-2">
      <span class="metric text-[#E6FA50]">{formatStat(stats?.matchesThisMonth ?? 0)}</span>
      <span class="caption uppercase text-[#F7F7F7]/25">Matches/mo</span>
    </div>
    <div class="hidden h-4 w-px bg-white/[0.08] md:block"></div>

    <div class="hidden md:flex items-baseline gap-2">
      <span class="metric text-[#E6FA50]">{formatStat(stats?.hoursPlayed ?? 0)}</span>
      <span class="caption uppercase text-[#F7F7F7]/25">Hours Played</span>
    </div>
  </div>
</section>

<!-- ─── SEARCH ─── -->
<section class="pt-10 pb-12 md:pt-12 md:pb-16 border-b border-white/[0.04]">
  <div class="container">
    <HomeSearchBar />
  </div>
</section>

<!-- ─── FEATURED VENUE ─── -->
<section class="py-section">
  <div class="container">
    <div class="mb-subsection max-w-xl">
      <span class="section-label">Featured</span>
      <h2 class="heading-2 mt-4 text-[#F7F7F7]">
        This Week's<br />
        <span class="text-[#E6FA50]">Top Venue</span>
      </h2>
    </div>

    {#if !featuredVenue}
      <EmptyState
        icon={Star}
        title="Featured venues coming soon"
        description="We're curating the best courts in Indonesia. Check back soon or explore everything available now."
        actionLabel="Browse All Venues"
        actionHref="/venues"
      />
    {:else}
      <a href="/venues/{featuredVenue.id}" class="group block">
        <div class="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          <!-- Image -->
          <div
            class="relative aspect-[4/3] overflow-hidden rounded-2xl lg:aspect-[16/10]"
          >
            <img
              src={IMG.featured}
              alt={featuredVenue.name}
              class="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
            />
          </div>

          <!-- Info -->
          <div class="flex flex-col justify-center">
            <div class="flex items-center gap-2">
              <Star class="h-4 w-4 fill-[#E6FA50] text-[#E6FA50]" />
              <span class="label text-[#E6FA50]">{featuredVenue.rating}</span>
              <span class="caption text-[#F7F7F7]/25"
                >· {featuredVenue.reviewCount} reviews</span
              >
            </div>

            <h3 class="heading-2 mt-4 text-[#F7F7F7]">
              {featuredVenue.name}
            </h3>

            <p class="mt-2 flex items-center gap-2 caption text-[#F7F7F7]/40">
              <MapPin class="h-3.5 w-3.5" />
              {featuredVenue.location} · {featuredVenue.city}
            </p>

            <p class="body mt-5 text-[#F7F7F7]/25">
              {featuredVenue.description}
            </p>

            <div class="mt-8">
              <p class="body-sm text-[#50C8C8]">
                See availability for pricing
              </p>
            </div>

            <div
              class="label mt-8 inline-flex items-center gap-2 text-[#E6FA50] transition-all group-hover:gap-3"
            >
              View Availability
              <ArrowRight class="h-4 w-4" />
            </div>
          </div>
        </div>
      </a>
    {/if}
  </div>
</section>

<!-- ─── CITIES ─── -->
<section class="py-section">
  <div class="container">
    <div class="mb-subsection">
      <h2 class="display-lg text-[#F7F7F7]">
        WHERE<br />
        WILL YOU<br />
        <span class="text-[#E6FA50]">PLAY?</span>
      </h2>
    </div>

    <div class="space-y-4">
      <a href="/venues?city=Bali" class="group block">
        <div
          class="relative overflow-hidden rounded-2xl h-[50vh] min-h-[400px]"
        >
          <img
            src={IMG.bali}
            alt="Padel courts in Bali"
            class="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
          />
          <div
            class="absolute inset-0 bg-gradient-to-t from-[#06121A]/80 via-[#06121A]/20 to-transparent"
          ></div>
          <div class="absolute bottom-0 left-0 p-8 md:p-10">
            <p class="section-label">{getCityCount("Bali")} venues</p>
            <h3 class="display-lg mt-2 text-[#F7F7F7]">BALI</h3>
            <p class="body mt-2 max-w-xs text-[#F7F7F7]/40">
              Island courts. Ocean breeze. Sunset sessions.
            </p>
          </div>
          <div
            class="absolute bottom-8 right-8 flex h-11 w-11 items-center justify-center rounded-full bg-[#E6FA50] opacity-0 transition-all duration-300 group-hover:opacity-100 md:bottom-10 md:right-10"
          >
            <ArrowRight class="h-4 w-4 text-[#06121A]" />
          </div>
        </div>
      </a>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <a href="/venues?city=Jakarta" class="group block">
          <div
            class="relative overflow-hidden rounded-2xl h-[40vh] min-h-[340px]"
          >
            <img
              src={IMG.jakarta}
              alt="Padel courts in Jakarta"
              class="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-[#06121A]/80 via-[#06121A]/20 to-transparent"
            ></div>
            <div class="absolute bottom-0 left-0 p-8 md:p-10">
              <p class="section-label">{getCityCount("Jakarta")} venues</p>
              <h3 class="display-lg mt-2 text-[#F7F7F7]">JAKARTA</h3>
              <p class="body mt-2 max-w-xs text-[#F7F7F7]/40">
                Premium indoor facilities in the city center.
              </p>
            </div>
            <div
              class="absolute bottom-8 right-8 flex h-11 w-11 items-center justify-center rounded-full bg-[#E6FA50] opacity-0 transition-all duration-300 group-hover:opacity-100 md:bottom-10 md:right-10"
            >
              <ArrowRight class="h-4 w-4 text-[#06121A]" />
            </div>
          </div>
        </a>

        <a href="/venues?city=Surabaya" class="group block">
          <div
            class="relative overflow-hidden rounded-2xl h-[40vh] min-h-[340px]"
          >
            <img
              src={IMG.surabaya}
              alt="Padel courts in Surabaya"
              class="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-[#06121A]/80 via-[#06121A]/20 to-transparent"
            ></div>
            <div class="absolute bottom-0 left-0 p-8 md:p-10">
              <p class="section-label">{getCityCount("Surabaya")} venues</p>
              <h3 class="display-lg mt-2 text-[#F7F7F7]">SURABAYA</h3>
              <p class="body mt-2 max-w-xs text-[#F7F7F7]/40">
                East Java's emerging padel scene.
              </p>
            </div>
            <div
              class="absolute bottom-8 right-8 flex h-11 w-11 items-center justify-center rounded-full bg-[#E6FA50] opacity-0 transition-all duration-300 group-hover:opacity-100 md:bottom-10 md:right-10"
            >
              <ArrowRight class="h-4 w-4 text-[#06121A]" />
            </div>
          </div>
        </a>
      </div>
    </div>
  </div>
</section>

<!-- ─── COMMUNITY ─── -->
<section id="community" class="py-section">
  <div class="container">
    <div class="mb-subsection text-center">
      <h2 class="display-xl text-[#F7F7F7]">
        FIND PLAYERS.<br />
        <span class="text-[#E6FA50]">NOT JUST COURTS.</span>
      </h2>
    </div>

    <div class="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-20">
      <div class="relative">
        <div class="aspect-[3/4] overflow-hidden rounded-2xl">
          <img
            src={IMG.community}
            alt="Padel players after a doubles match"
            class="h-full w-full object-cover"
          />
        </div>
      </div>

      <div class="flex flex-col justify-center">
        <p class="body-lg max-w-md text-[#F7F7F7]/60">
          Padelhive is where Indonesia's padel community lives. Join open
          matches, find partners at your level, split costs, and grow your
          network.
        </p>

        <div class="mt-8 flex flex-col gap-2">
          <div class="flex -space-x-2">
            {#each Array.from({ length: 5 }) as _, i}
              {@const user = (stats?.recentUsers ?? [])[i]}
              {@const colors = [
                "#E6FA50",
                "#50C8C8",
                "#BFEF2E",
                "#2EADAD",
                "#7BCE3A",
              ]}
              {#if user?.avatarUrl}
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  class="h-8 w-8 rounded-full border-2 border-[#06121A] object-cover"
                />
              {:else}
                <div
                  class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#06121A] text-[10px] font-semibold text-[#06121A]"
                  style="background-color: {colors[i % colors.length]}"
                >
                  {user ? user.name.charAt(0).toUpperCase() : ""}
                </div>
              {/if}
            {/each}
          </div>
          <p class="caption text-[#F7F7F7]/40">
            +{formatStat(stats?.newUsersThisMonth ?? 0)} joined this month
          </p>
        </div>

        <div class="mt-10 grid w-full max-w-md grid-cols-3">
          <div>
            <p class="metric text-[#E6FA50]">
              {formatStat(stats?.players ?? 0)}
            </p>
            <p class="caption mt-2 text-[#F7F7F7]/25">Players</p>
          </div>
          <div class="text-center">
            <p class="metric text-[#F7F7F7]">
              {formatStat(stats?.matchesThisMonth ?? 0)}
            </p>
            <p class="caption mt-2 text-[#F7F7F7]/25">Matches/mo</p>
          </div>
          <div class="text-right">
            <p class="metric text-[#F7F7F7]">{stats?.matchRate ?? 0}%</p>
            <p class="caption mt-2 text-[#F7F7F7]/25">Match rate</p>
          </div>
        </div>

        <a
          href="/venues"
          class="label btn-lime mt-10 inline-flex h-12 w-fit items-center gap-2 rounded-full px-8"
        >
          Join the Community
          <ArrowRight class="h-4 w-4" />
        </a>
      </div>
    </div>
  </div>
</section>

<!-- ─── HOW IT WORKS ─── -->
<section id="how-it-works" class="py-section border-t border-white/[0.04]">
  <div class="container">
    <div class="mb-subsection text-center">
      <h2 class="display-xl text-[#F7F7F7]">
        BOOK. SPLIT.<br />
        <span class="text-[#E6FA50]">PLAY.</span>
      </h2>
    </div>

    <div
      class="mx-auto grid max-w-5xl grid-cols-1 gap-x-12 gap-y-2 md:grid-cols-2"
    >
      <div class="group flex gap-8 py-8 md:gap-12 md:py-10">
        <span
          class="display-lg w-16 md:w-24 flex shrink-0 items-center justify-center text-white/25 transition-colors duration-300 group-hover:text-[#E6FA50]"
          >01</span
        >
        <div class="flex flex-col justify-center">
          <h3
            class="heading-3 text-[#F7F7F7] transition-colors duration-300 group-hover:text-[#E6FA50]"
          >
            Book a Court
          </h3>
          <p class="body mt-2 max-w-md text-[#F7F7F7]/40">
            Browse premium venues. Check real-time availability. Reserve your
            court in seconds.
          </p>
        </div>
      </div>

      <div class="group flex gap-8 py-8 md:gap-12 md:py-10">
        <span
          class="display-lg w-16 md:w-24 flex shrink-0 items-center justify-center text-white/25 transition-colors duration-300 group-hover:text-[#E6FA50]"
          >02</span
        >
        <div class="flex flex-col justify-center">
          <h3
            class="heading-3 text-[#F7F7F7] transition-colors duration-300 group-hover:text-[#E6FA50]"
          >
            Invite Your Crew
          </h3>
          <p class="body mt-2 max-w-md text-[#F7F7F7]/40">
            Share your booking link. Friends RSVP instantly. Build your squad for
            every session.
          </p>
        </div>
      </div>

      <div class="group flex gap-8 py-8 md:gap-12 md:py-10">
        <span
          class="display-lg w-16 md:w-24 flex shrink-0 items-center justify-center text-white/25 transition-colors duration-300 group-hover:text-[#E6FA50]"
          >03</span
        >
        <div class="flex flex-col justify-center">
          <h3
            class="heading-3 text-[#F7F7F7] transition-colors duration-300 group-hover:text-[#E6FA50]"
          >
            Split the Cost
          </h3>
          <p class="body mt-2 max-w-md text-[#F7F7F7]/40">
            Everyone pays their share automatically. No awkward conversations.
          </p>
        </div>
      </div>

      <div class="group flex gap-8 py-8 md:gap-12 md:py-10">
        <span
          class="display-lg w-16 md:w-24 flex shrink-0 items-center justify-center text-white/25 transition-colors duration-300 group-hover:text-[#E6FA50]"
          >04</span
        >
        <div class="flex flex-col justify-center">
          <h3
            class="heading-3 text-[#F7F7F7] transition-colors duration-300 group-hover:text-[#E6FA50]"
          >
            Play
          </h3>
          <p class="body mt-2 max-w-md text-[#F7F7F7]/40">
            Show up. Compete. Connect. Build your padel story.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ─── ALL VENUES ─── -->
<section id="venues" class="py-section border-t border-white/[0.04]">
  <div class="container">
    <div
      class="mb-subsection flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
    >
      <h2 class="heading-2 text-[#F7F7F7]">
        All <span class="text-[#E6FA50]">Venues</span>
      </h2>
      <a
        href="/venues"
        class="group flex items-center gap-2 label text-[#F7F7F7]/40 transition-colors hover:text-[#E6FA50]"
      >
        Browse all
        <ArrowRight
          class="h-4 w-4 transition-transform group-hover:translate-x-1"
        />
      </a>
    </div>

    <div class="space-y-5">
      {#if venues.length === 0}
        <EmptyState
          icon={MapPin}
          title="No venues yet"
          description="New courts are being added across Indonesia. Browse the full directory to see what's live."
          actionLabel="Browse All Venues"
          actionHref="/venues"
        />
      {:else}
        {#each venues as venue, i (venue.id)}
          {@const images = [IMG.venue1, IMG.venue2, IMG.venue3]}
          <a href="/venues/{venue.id}" class="group block">
            <article
              class="grid grid-cols-1 overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0C1B26] transition-all duration-300 group-hover:border-[#E6FA50]/15 md:grid-cols-[1fr_1fr]"
            >
              <div
                class="relative aspect-[4/3] overflow-hidden md:aspect-[16/10]"
              >
                <img
                  src={images[i % images.length]}
                  alt={venue.name}
                  class="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
                />
                {#if venue.isVerified || venue.status === "APPROVED"}
                  <span
                    class="caption absolute left-4 top-4 rounded-full bg-[#E6FA50] px-3 py-1 uppercase text-[#06121A] font-bold"
                  >
                    Verified
                  </span>
                {/if}
              </div>
              <div class="flex flex-col justify-center p-8 md:p-10">
                <div class="flex items-center gap-2">
                  <Star class="h-3.5 w-3.5 fill-[#E6FA50] text-[#E6FA50]" />
                  <span class="label text-[#E6FA50]">{venue.rating}</span>
                  <span class="caption text-[#F7F7F7]/25"
                    >· {venue.reviewCount} reviews</span
                  >
                </div>
                <h3 class="heading-3 mt-3 text-[#F7F7F7]">
                  {venue.name}
                </h3>
                <p
                  class="mt-2 flex items-center gap-2 caption text-[#F7F7F7]/25"
                >
                  <MapPin class="h-3.5 w-3.5" />
                  {venue.location} · {venue.city}
                </p>
                <div class="mt-6">
                  <p class="body-sm text-[#50C8C8]">
                    See availability for pricing
                  </p>
                </div>
                <span
                  class="label mt-6 inline-flex items-center gap-2 text-[#E6FA50] opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:gap-3"
                >
                  View Availability <ArrowRight class="h-4 w-4" />
                </span>
              </div>
            </article>
          </a>
        {/each}
      {/if}
    </div>
  </div>
</section>