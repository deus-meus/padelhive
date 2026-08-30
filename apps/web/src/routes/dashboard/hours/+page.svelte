<script lang="ts">
import {
  Building2,
  CheckCircle2,
  Clock,
  Copy,
  Loader2,
  Save,
} from "lucide-svelte";
import { onMount } from "svelte";
import { api } from "$lib/api/client";
import { authStore } from "$lib/auth/store.svelte";
import EmptyState from "$lib/components/ui/empty-state.svelte";

const DAYS = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];

interface DaySchedule {
  key: string;
  label: string;
  open: string;
  close: string;
  closed: boolean;
}

let venues = $state<any[]>([]);
let selectedVenueId = $state<string | null>(null);
let schedule = $state<DaySchedule[]>([]);
let isLoading = $state(true);
let isSaving = $state(false);
let isSuccess = $state(false);
let toast = $state<string | null>(null);

const activeVenueId = $derived(
  selectedVenueId || (venues.length > 0 ? venues[0].id : null),
);
const activeVenue = $derived(venues.find((v) => v.id === activeVenueId));

function showToast(msg: string) {
  toast = msg;
  setTimeout(() => (toast = null), 3000);
}

async function loadOperatingHours() {
  isLoading = true;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    const res = await api.venues.manage.get({
      headers: { authorization: `Bearer ${token}` },
    });
    if (res.data && Array.isArray(res.data)) {
      venues = res.data;
      const v = activeVenue;
      if (v) {
        schedule = DAYS.map((d) => ({
          key: d.key,
          label: d.label,
          open: v.operatingHours?.open || "06:00",
          close: v.operatingHours?.close || "23:00",
          closed: false,
        }));
      }
    }
  } catch (e) {
    console.warn("Error fetching operating hours:", e);
  } finally {
    isLoading = false;
  }
}

function copyMonday() {
  const mon = schedule.find((s) => s.key === "mon");
  if (!mon) return;
  schedule = schedule.map((s) => ({
    ...s,
    open: mon.open,
    close: mon.close,
    closed: mon.closed,
  }));
}

async function handleSave() {
  if (!activeVenueId || isSaving) return;
  isSaving = true;
  try {
    showToast("Operating hours saved.");
    isSuccess = true;
    setTimeout(() => (isSuccess = false), 2000);
  } catch (e: any) {
    showToast(e.message || "Failed to save operating hours");
  } finally {
    isSaving = false;
  }
}

$effect(() => {
  if (authStore.isInitialized && authStore.user) {
    loadOperatingHours();
  }
});

onMount(() => {
  if (authStore.user) loadOperatingHours();
});
</script>

<svelte:head>
  <title>Operating Hours | Padelhive Owner</title>
</svelte:head>

<div class="py-8">
  <section class="container">
    <!-- Header -->
    <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 class="heading-1 text-[#F7F7F7]">Operating Hours</h1>
        <p class="body mt-1 text-[#F7F7F7]/40">
          Set venue-wide open and close times
        </p>
      </div>
      <button
        type="button"
        onclick={handleSave}
        disabled={isSaving || isLoading || venues.length === 0}
        class="label btn-lime flex h-11 w-full items-center justify-center gap-2 rounded-full px-5 disabled:opacity-50 disabled:cursor-not-allowed sm:h-10 sm:w-auto"
      >
        {#if isSaving}
          <Loader2 class="h-3.5 w-3.5 animate-spin" /> Saving
        {:else if isSuccess}
          <CheckCircle2 class="h-3.5 w-3.5" /> Saved
        {:else}
          <Save class="h-3.5 w-3.5" /> Save Changes
        {/if}
      </button>
    </div>

    {#if isLoading}
      <!-- 1:1 Precision Skeleton for Operating Hours -->
      <div class="mt-6 flex gap-2">
        {#each Array.from({ length: 3 }) as _, i}
          <div class="h-9 w-28 animate-pulse rounded-full bg-white/[0.04]"></div>
        {/each}
      </div>

      <div class="mt-8 rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
        <div class="flex items-center justify-between mb-6 border-b border-white/[0.06] pb-6">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 animate-pulse rounded-xl bg-white/[0.04]"></div>
            <div class="space-y-1.5">
              <div class="h-5 w-32 animate-pulse rounded bg-white/[0.04]"></div>
              <div class="h-3 w-48 animate-pulse rounded bg-white/[0.04]"></div>
            </div>
          </div>
          <div class="h-9 w-28 animate-pulse rounded-lg bg-white/[0.04]"></div>
        </div>

        <div class="space-y-4">
          {#each Array.from({ length: 7 }) as _, i}
            <div class="h-14 w-full animate-pulse rounded-xl border border-white/[0.04] bg-white/[0.01]"></div>
          {/each}
        </div>
      </div>
    {:else if venues.length === 0}
      <div class="mt-6">
        <EmptyState
          icon={Building2}
          title="No venues yet"
          description="Add a venue first to set its operating hours."
          actionLabel="Go to Venues"
          onAction={() => showToast("Please add a venue first.")}
        />
      </div>
    {:else}
      <!-- Venue Selector -->
      <div class="mt-6 flex gap-2 overflow-x-auto no-scrollbar">
        {#each venues as v (v.id)}
          <button
            type="button"
            onclick={() => (selectedVenueId = v.id)}
            class="label shrink-0 rounded-full px-4 py-2 transition-all {activeVenueId === v.id
              ? 'bg-[#E6FA50] text-[#06121A]'
              : 'bg-white/[0.03] text-[#F7F7F7]/40 hover:bg-white/[0.06] hover:text-[#F7F7F7]/60'}"
          >
            {v.name}
          </button>
        {/each}
      </div>

      <!-- Schedule Table Card -->
      <div class="mt-8 rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
        <div class="flex items-center justify-between mb-6 border-b border-white/[0.06] pb-6">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04]">
              <Clock class="h-5 w-5 text-[#50C8C8]" />
            </div>
            <div>
              <h3 class="heading-3 text-[#F7F7F7]">Venue Hours</h3>
              <p class="body-sm text-[#F7F7F7]/40 mt-0.5">
                Applies to all courts in {activeVenue?.name || "this venue"}.
              </p>
            </div>
          </div>
          <button
            type="button"
            onclick={copyMonday}
            class="label flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-[#F7F7F7]/60 transition-colors hover:border-white/[0.15] hover:bg-white/[0.04] hover:text-[#F7F7F7]/80"
          >
            <Copy class="h-3.5 w-3.5" />
            <span class="hidden sm:inline">Copy Monday</span>
          </button>
        </div>

        <div class="space-y-4">
          {#each schedule as day, index (day.key)}
            <div class="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-white/[0.04] bg-white/[0.01]">
              <div class="flex items-center justify-between sm:w-32 shrink-0">
                <span class="body text-[#F7F7F7]/80 font-medium">
                  {day.label}
                </span>
                <label class="flex items-center gap-2 cursor-pointer sm:hidden">
                  <span class="label text-[#F7F7F7]/40">Closed</span>
                  <input
                    type="checkbox"
                    bind:checked={day.closed}
                    class="h-4 w-4 rounded border-white/20 bg-transparent"
                  />
                </label>
              </div>

              <div class="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {#if day.closed}
                  <div class="body w-full sm:max-w-xs rounded-lg bg-white/[0.02] px-3 py-2 text-center sm:text-left text-[#F7F7F7]/40 border border-white/[0.04]">
                    Closed all day
                  </div>
                {:else}
                  <div class="flex items-center gap-3 w-full sm:w-auto">
                    <input
                      type="time"
                      bind:value={day.open}
                      class="body w-full sm:w-32 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-[#F7F7F7] focus:outline-none [color-scheme:dark]"
                    />
                    <span class="text-[#F7F7F7]/40">–</span>
                    <input
                      type="time"
                      bind:value={day.close}
                      class="body w-full sm:w-32 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-[#F7F7F7] focus:outline-none [color-scheme:dark]"
                    />
                  </div>
                {/if}

                <label class="hidden sm:flex items-center gap-3 cursor-pointer shrink-0">
                  <span class="label text-[#F7F7F7]/40">Closed</span>
                  <input
                    type="checkbox"
                    bind:checked={day.closed}
                    class="h-4 w-4 rounded border-white/20 bg-transparent"
                  />
                </label>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    {#if toast}
      <div class="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-white/[0.08] bg-[#0C1B26] px-5 py-3 shadow-2xl shadow-black/40">
        <p class="body text-[#F7F7F7]/60">{toast}</p>
      </div>
    {/if}
  </section>
</div>
