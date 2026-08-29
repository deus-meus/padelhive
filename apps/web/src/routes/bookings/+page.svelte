<script lang="ts">
import { ArrowRight, Calendar, Clock, MapPin } from "lucide-svelte";
import { onMount } from "svelte";
import { api } from "$lib/api/client";
import { authStore } from "$lib/auth/store.svelte";
import Badge from "$lib/components/ui/badge.svelte";
import Card from "$lib/components/ui/card.svelte";
import FilterTabs from "$lib/components/ui/filter-tabs.svelte";
import Skeleton from "$lib/components/ui/skeleton.svelte";

let activeTab = $state("upcoming");
let bookings = $state<any[]>([]);
let isLoading = $state(true);

const TABS = [
  { label: "Upcoming", value: "upcoming" },
  { label: "Past Matches", value: "past" },
  { label: "Cancelled", value: "cancelled" },
];

async function loadBookings() {
  if (!authStore.user) return;
  isLoading = true;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    const res = await api.bookings.me.get({
      query: { filter: activeTab },
      headers: { authorization: `Bearer ${token}` },
    });
    if (res.data) {
      bookings = res.data;
    }
  } catch (e) {
    console.warn("Bookings fetch error:", e);
  } finally {
    isLoading = false;
  }
}

onMount(() => {
  loadBookings();
});

function handleTabChange(tab: string) {
  activeTab = tab;
  loadBookings();
}

function getBadgeVariant(status: string) {
  switch (status) {
    case "CONFIRMED":
      return "success";
    case "COMPLETED":
      return "lime";
    case "PENDING_PAYMENT":
      return "warning";
    case "CANCELLED":
      return "error";
    default:
      return "neutral";
  }
}
</script>

<svelte:head>
  <title>My Bookings - Padelhive</title>
</svelte:head>

<div class="py-12 bg-[#06121A]">
  <div class="container space-y-8">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-[#F7F7F7]">My Bookings</h1>
        <p class="mt-1 text-xs text-white/60">Manage your court reservations and match history</p>
      </div>

      <FilterTabs tabs={TABS} selected={activeTab} onSelect={handleTabChange} />
    </div>

    {#if isLoading}
      <div class="space-y-4">
        {#each [1, 2, 3] as _}
          <Card class="p-6 space-y-3">
            <Skeleton class="h-6 w-1/3" />
            <Skeleton class="h-4 w-1/4" />
          </Card>
        {/each}
      </div>
    {:else if bookings.length === 0}
      <Card class="flex flex-col items-center justify-center p-12 text-center">
        <Calendar class="mb-3 h-10 w-10 text-white/30" />
        <h3 class="text-lg font-semibold text-white">No {activeTab} bookings found</h3>
        <p class="mt-1 text-xs text-white/50">Ready to play? Book a court at your favorite venue.</p>
        <a href="/venues" class="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#E6FA50] px-5 py-2.5 text-xs font-bold text-[#06121A]">
          Explore Venues <ArrowRight class="h-4 w-4" />
        </a>
      </Card>
    {:else}
      <div class="space-y-4">
        {#each bookings as b (b.id)}
          <a href="/bookings/{b.id}" class="group block">
            <Card class="p-6 transition-all duration-200 hover:border-[#E6FA50]/30 hover:bg-[#0E202E]">
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <Badge variant={getBadgeVariant(b.status)}>{b.status}</Badge>
                    <span class="text-xs font-mono text-white/40">#{b.id.slice(0, 8)}</span>
                  </div>

                  <h3 class="text-lg font-bold text-white group-hover:text-[#E6FA50] transition-colors">
                    {b.venue.name} — {b.court.name}
                  </h3>

                  <div class="flex flex-wrap items-center gap-4 text-xs text-white/60">
                    <span class="flex items-center gap-1">
                      <MapPin class="h-3.5 w-3.5 text-[#E6FA50]" />
                      {b.venue.city}
                    </span>
                    <span class="flex items-center gap-1">
                      <Calendar class="h-3.5 w-3.5 text-[#E6FA50]" />
                      {b.bookingDate}
                    </span>
                    <span class="flex items-center gap-1">
                      <Clock class="h-3.5 w-3.5 text-[#E6FA50]" />
                      {b.durationMinutes} mins
                    </span>
                  </div>
                </div>

                <div class="flex items-center justify-between md:flex-col md:items-end gap-2 border-t border-white/[0.04] pt-3 md:border-none md:pt-0">
                  <span class="text-base font-extrabold text-[#E6FA50]">
                    Rp {b.finalAmount.toLocaleString("id-ID")}
                  </span>
                  <span class="inline-flex items-center gap-1 text-xs font-semibold text-white/70 group-hover:text-white">
                    Details <ArrowRight class="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </Card>
          </a>
        {/each}
      </div>
    {/if}
  </div>
</div>
