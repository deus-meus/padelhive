<script lang="ts">
import {
  Building2,
  CheckCircle2,
  Edit3,
  Loader2,
  Plus,
  Sun,
  XCircle,
  Zap,
} from "lucide-svelte";
import { onMount } from "svelte";
import { api } from "$lib/api/client";
import { authStore } from "$lib/auth/store.svelte";
import EmptyState from "$lib/components/ui/empty-state.svelte";

let venues = $state<any[]>([]);
let selectedVenueId = $state<string | null>(null);
let courts = $state<any[]>([]);
let isLoading = $state(true);
let toast = $state<string | null>(null);

const activeVenueId = $derived(
  selectedVenueId || (venues.length > 0 ? venues[0].id : null),
);
const activeVenue = $derived(venues.find((v) => v.id === activeVenueId));

function showToast(msg: string) {
  toast = msg;
  setTimeout(() => (toast = null), 3000);
}

async function loadOwnerCourtsData() {
  if (!authStore.firebaseUser) return;
  isLoading = true;
  try {
    const token = await authStore.firebaseUser.getIdToken();
    if (!token) return;

    const resVenues = await api.venues.manage.get({
      headers: { authorization: `Bearer ${token}` },
    });
    if (resVenues.data && Array.isArray(resVenues.data)) {
      venues = resVenues.data;
      const vId = selectedVenueId || (venues.length > 0 ? venues[0].id : null);
      if (vId) {
        const resCourts = await api.venues({ id: vId }).courts.manage.get({
          headers: { authorization: `Bearer ${token}` },
        });
        if (resCourts.data && Array.isArray(resCourts.data)) {
          courts = resCourts.data;
        }
      }
    }
  } catch (e) {
    console.warn("Error fetching owner courts:", e);
  } finally {
    isLoading = false;
  }
}

async function handleVenueChange(vId: string) {
  selectedVenueId = vId;
  isLoading = true;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    const resCourts = await api.venues({ id: vId }).courts.manage.get({
      headers: { authorization: `Bearer ${token}` },
    });
    if (resCourts.data && Array.isArray(resCourts.data)) {
      courts = resCourts.data;
    }
  } catch (e) {
    console.warn("Error changing venue:", e);
  } finally {
    isLoading = false;
  }
}

$effect(() => {
  if (authStore.isInitialized && authStore.user && authStore.firebaseUser) {
    loadOwnerCourtsData();
  }
});
</script>

<svelte:head>
  <title>Courts & Pricing | Padelhive Owner</title>
</svelte:head>

<div class="py-8">
  <section class="container">
    <!-- Header -->
    <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 class="heading-1 text-[#F7F7F7]">Courts & Pricing</h1>
        <p class="body mt-1 text-[#F7F7F7]/40">
          Manage courts and dynamic pricing
        </p>
      </div>
      <button
        type="button"
        onclick={() => showToast("Add court feature coming soon.")}
        disabled={!activeVenueId}
        class="label btn-lime flex h-11 w-full items-center justify-center gap-2 rounded-full px-5 disabled:opacity-50 disabled:cursor-not-allowed sm:h-10 sm:w-auto"
      >
        <Plus class="h-4 w-4" />
        Add Court
      </button>
    </div>

    {#if isLoading || !authStore.isInitialized || authStore.isLoading}
      <!-- 1:1 Precision Skeleton for Courts & Pricing -->
      <div class="mt-6 flex gap-2">
        {#each Array.from({ length: 3 }) as _, i}
          <div class="h-9 w-28 animate-pulse rounded-full bg-white/[0.04]"></div>
        {/each}
      </div>

      <div class="mt-8 space-y-4">
        {#each Array.from({ length: 2 }) as _, i}
          <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
            <div class="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div class="flex flex-wrap items-center gap-3">
                <div class="h-6 w-36 animate-pulse rounded-md bg-white/[0.04]"></div>
                <div class="h-5 w-20 animate-pulse rounded-full bg-white/[0.04]"></div>
                <div class="h-5 w-16 animate-pulse rounded-full bg-white/[0.04]"></div>
              </div>
              <div class="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                <div class="h-9 w-24 animate-pulse rounded-lg bg-white/[0.04]"></div>
                <div class="h-9 w-28 animate-pulse rounded-lg bg-white/[0.04]"></div>
              </div>
            </div>

            <div class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {#each Array.from({ length: 4 }) as _, j}
                <div class="h-[96px] animate-pulse rounded-xl border border-white/[0.04] bg-white/[0.02] p-4">
                  <div class="h-3 w-24 animate-pulse rounded bg-white/[0.04]"></div>
                  <div class="mt-3 h-6 w-20 animate-pulse rounded bg-white/[0.04]"></div>
                </div>
              {/each}
            </div>

            <div class="mt-4 flex items-center gap-4 border-t border-white/[0.04] pt-4">
              <div class="h-3 w-48 animate-pulse rounded bg-white/[0.04]"></div>
              <div class="h-3 w-32 animate-pulse rounded bg-white/[0.04]"></div>
            </div>
          </div>
        {/each}
      </div>
    {:else if venues.length === 0}
      <div class="mt-8">
        <EmptyState
          icon={Building2}
          title="No venues yet"
          description="Add a venue first to manage its courts and pricing."
          actionLabel="Go to Venues"
          onAction={() => showToast("Please add a venue first.")}
        />
      </div>
    {:else}
      <!-- Venue selector tabs -->
      <div class="mt-6 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {#each venues as v (v.id)}
          <button
            type="button"
            onclick={() => handleVenueChange(v.id)}
            class="label whitespace-nowrap rounded-full px-4 py-2 transition-all {activeVenueId === v.id
              ? 'bg-[#E6FA50] text-[#06121A]'
              : 'bg-white/[0.03] text-[#F7F7F7]/40 hover:bg-white/[0.06] hover:text-[#F7F7F7]/60'}"
          >
            {v.name}
          </button>
        {/each}
      </div>

      <!-- Courts List -->
      <div class="mt-8 space-y-4">
        {#each courts as court (court.id)}
          <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
            <div class="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div class="flex flex-wrap items-center gap-3">
                <h3 class="heading-2 text-[#F7F7F7]">{court.name}</h3>
                <span class="caption rounded-full bg-white/[0.04] px-3 py-1 text-[#F7F7F7]/40">
                  {court.type || "INDOOR"}
                </span>
                {#if court.isActive}
                  <span class="caption flex items-center gap-1 text-green-400">
                    <CheckCircle2 class="h-3 w-3" /> Active
                  </span>
                {:else}
                  <span class="caption flex items-center gap-1 text-red-400">
                    <XCircle class="h-3 w-3" /> Inactive
                  </span>
                {/if}
              </div>
              <button
                type="button"
                onclick={() => showToast("Edit pricing feature coming soon.")}
                class="label flex h-9 items-center gap-2 rounded-lg border border-white/[0.06] px-4 text-[#F7F7F7]/40 transition-all hover:border-white/[0.12] hover:text-[#F7F7F7]/60"
              >
                <Edit3 class="h-3 w-3" />
                Edit Pricing
              </button>
            </div>

            <!-- Pricing Grid -->
            <div class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div class="rounded-xl border border-white/[0.04] bg-white/[0.02] p-4">
                <div class="flex items-center gap-1.5">
                  <Sun class="h-3 w-3 text-[#F7F7F7]/25" />
                  <span class="caption text-[#F7F7F7]/25">Weekday Off-Peak</span>
                </div>
                <p class="price mt-2 text-[#F7F7F7]/60">
                  Rp {((court.pricing?.weekdayOffPeak || 150000) / 1000).toFixed(0)}K
                </p>
              </div>

              <div class="rounded-xl border border-[#E6FA50]/10 bg-[#E6FA50]/[0.03] p-4">
                <div class="flex items-center gap-1.5">
                  <Zap class="h-3 w-3 text-[#E6FA50]/60" />
                  <span class="caption text-[#F7F7F7]/25">Weekday Peak</span>
                </div>
                <p class="price mt-2 text-[#E6FA50]/80">
                  Rp {((court.pricing?.weekdayPeak || 200000) / 1000).toFixed(0)}K
                </p>
              </div>

              <div class="rounded-xl border border-white/[0.04] bg-white/[0.02] p-4">
                <div class="flex items-center gap-1.5">
                  <Sun class="h-3 w-3 text-[#F7F7F7]/25" />
                  <span class="caption text-[#F7F7F7]/25">Weekend Off-Peak</span>
                </div>
                <p class="price mt-2 text-[#F7F7F7]/60">
                  Rp {((court.pricing?.weekendOffPeak || 200000) / 1000).toFixed(0)}K
                </p>
              </div>

              <div class="rounded-xl border border-[#E6FA50]/10 bg-[#E6FA50]/[0.03] p-4">
                <div class="flex items-center gap-1.5">
                  <Zap class="h-3 w-3 text-[#E6FA50]/60" />
                  <span class="caption text-[#F7F7F7]/25">Weekend Peak</span>
                </div>
                <p class="price mt-2 text-[#E6FA50]/80">
                  Rp {((court.pricing?.weekendPeak || 250000) / 1000).toFixed(0)}K
                </p>
              </div>
            </div>

            <!-- Peak hours info -->
            <div class="mt-4 flex items-center gap-4 border-t border-white/[0.04] pt-4">
              <span class="caption text-[#F7F7F7]/25">
                Peak hours: 09:00–11:00 & 16:00–21:00
              </span>
              <span class="caption text-[#F7F7F7]/25">
                Venue: {activeVenue?.name || "—"}
              </span>
            </div>
          </div>
        {/each}

        {#if courts.length === 0 && activeVenueId}
          <div class="mt-8 rounded-2xl border border-dashed border-white/[0.08] p-12 text-center">
            <p class="body text-[#F7F7F7]/25">
              No courts for this venue yet.
            </p>
            <button
              type="button"
              onclick={() => showToast("Add court feature coming soon.")}
              class="label btn-lime mt-4 rounded-full px-6 py-2.5"
            >
              Add First Court
            </button>
          </div>
        {/if}
      </div>
    {/if}

    <!-- Toast -->
    {#if toast}
      <div class="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-white/[0.08] bg-[#0C1B26] px-5 py-3 shadow-2xl shadow-black/40">
        <p class="body text-[#F7F7F7]/60">{toast}</p>
      </div>
    {/if}
  </section>
</div>
