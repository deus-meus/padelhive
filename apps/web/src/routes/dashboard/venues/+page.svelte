<script lang="ts">
import {
  Building2,
  CheckCircle2,
  Clock,
  Edit3,
  Eye,
  Loader2,
  MapPin,
  MoreVertical,
  Plus,
  Star,
  XCircle,
} from "lucide-svelte";
import { onMount } from "svelte";
import { api } from "$lib/api/client";
import { authStore } from "$lib/auth/store.svelte";
import EmptyState from "$lib/components/ui/empty-state.svelte";

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: any; color: string; bg: string }
> = {
  APPROVED: {
    label: "Approved",
    icon: CheckCircle2,
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
  PENDING: {
    label: "Pending Review",
    icon: Clock,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-400/10",
  },
  SUSPENDED: {
    label: "Suspended",
    icon: XCircle,
    color: "text-orange-400",
    bg: "bg-orange-400/10",
  },
};

let venues = $state<any[]>([]);
let isLoading = $state(true);
let toast = $state<string | null>(null);

function showToast(msg: string) {
  toast = msg;
  setTimeout(() => (toast = null), 3000);
}

async function loadOwnerVenues() {
  isLoading = true;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    const res = await api.venues.manage.get({
      headers: { authorization: `Bearer ${token}` },
    });
    if (res.data && Array.isArray(res.data)) {
      venues = res.data;
    }
  } catch (e) {
    console.warn("Error fetching owner venues:", e);
  } finally {
    isLoading = false;
  }
}

$effect(() => {
  if (authStore.isInitialized && authStore.user) {
    loadOwnerVenues();
  }
});

onMount(() => {
  if (authStore.user) loadOwnerVenues();
});
</script>

<svelte:head>
  <title>Venues Management | Padelhive Owner</title>
</svelte:head>

<div class="py-8">
  <section class="container">
    <!-- Header -->
    <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 class="heading-1 text-[#F7F7F7]">Venues</h1>
        <p class="body mt-1 text-[#F7F7F7]/40">
          Manage your padel venues
        </p>
      </div>
      <button
        type="button"
        onclick={() => showToast("Add venue modal feature ready.")}
        class="label btn-lime flex h-11 w-full items-center justify-center gap-2 rounded-full px-5 sm:h-10 sm:w-auto"
      >
        <Plus class="h-4 w-4" />
        Add Venue
      </button>
    </div>

    <!-- Venue List -->
    <div class="mt-8 space-y-4">
      {#if isLoading}
        {#each Array.from({ length: 2 }) as _, i}
          <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-3">
                  <div class="h-6 w-48 animate-pulse rounded-md bg-white/[0.04]"></div>
                </div>
                <div class="mt-2 h-4 w-64 animate-pulse rounded-md bg-white/[0.04]"></div>
                <div class="mt-4 flex flex-wrap items-center gap-4">
                  <div class="h-4 w-16 animate-pulse rounded-md bg-white/[0.04]"></div>
                  <div class="h-4 w-20 animate-pulse rounded-md bg-white/[0.04]"></div>
                  <div class="h-4 w-32 animate-pulse rounded-md bg-white/[0.04]"></div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <div class="h-8 w-24 animate-pulse rounded-full bg-white/[0.04]"></div>
                {#each Array.from({ length: 3 }) as _, j}
                  <div class="h-9 w-9 animate-pulse rounded-lg bg-white/[0.04]"></div>
                {/each}
              </div>
            </div>
            <div class="mt-4 flex flex-wrap gap-2 border-t border-white/[0.04] pt-4">
              {#each Array.from({ length: 4 }) as _, j}
                <div class="h-6 w-16 animate-pulse rounded-full bg-white/[0.04]"></div>
              {/each}
            </div>
          </div>
        {/each}
      {:else if venues.length === 0}
        <EmptyState
          icon={Building2}
          title="No venues yet"
          description="Add your first venue to start managing courts and bookings."
          actionLabel="Add Venue"
          onAction={() => showToast("Add venue feature coming soon.")}
        />
      {:else}
        {#each venues as venue (venue.id)}
          {@const status = venue.status ?? "PENDING"}
          {@const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING}
          {@const StatusIcon = config.icon}

          <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 transition-all hover:border-white/[0.1]">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-3">
                  <h3 class="heading-3 truncate text-[#F7F7F7]">{venue.name}</h3>
                  {#if venue.isVerified}
                    <span class="caption shrink-0 rounded-full bg-[#E6FA50] px-2 py-0.5 uppercase text-[#06121A]">
                      Verified
                    </span>
                  {/if}
                </div>
                <p class="body-sm mt-1 flex items-center gap-1.5 text-[#F7F7F7]/40">
                  <MapPin class="h-3.5 w-3.5" />
                  {venue.location} · {venue.city}
                </p>
                <div class="mt-3 flex flex-wrap items-center gap-4">
                  <span class="body-sm flex items-center gap-1.5 text-[#F7F7F7]/25">
                    <Star class="h-3 w-3 fill-[#E6FA50] text-[#E6FA50]" />
                    {venue.rating || "5.0"} ({venue.reviewCount || 0})
                  </span>
                  <span class="body-sm text-[#F7F7F7]/25">
                    {venue.courtCount ?? 0} courts
                  </span>
                  <span class="body-sm text-[#F7F7F7]/25">
                    {venue.operatingHours?.open || "06:00"} – {venue.operatingHours?.close || "23:00"}
                  </span>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <div class="flex items-center gap-1.5 rounded-full px-3 py-1.5 {config.bg}">
                  <StatusIcon class="h-3.5 w-3.5 {config.color}" />
                  <span class="caption {config.color}">{config.label}</span>
                </div>
                <a
                  href={`/venues/${venue.id}`}
                  class="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] text-[#F7F7F7]/25 transition-colors hover:border-white/[0.12] hover:text-[#F7F7F7]/60"
                  title="View venue"
                >
                  <Eye class="h-3.5 w-3.5" />
                </a>
                <button
                  type="button"
                  onclick={() => showToast("Edit venue feature coming soon.")}
                  class="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] text-[#F7F7F7]/25 transition-colors hover:border-white/[0.12] hover:text-[#F7F7F7]/60"
                  title="Edit venue"
                >
                  <Edit3 class="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {#if venue.facilities && venue.facilities.length > 0}
              <div class="mt-4 flex flex-wrap gap-2 border-t border-white/[0.04] pt-4">
                {#each venue.facilities as f}
                  <span class="caption rounded-full bg-white/[0.03] px-3 py-1 text-[#F7F7F7]/25">
                    {f}
                  </span>
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      {/if}
    </div>

    <!-- Toast -->
    {#if toast}
      <div class="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-white/[0.08] bg-[#0C1B26] px-5 py-3 shadow-2xl shadow-black/40">
        <p class="body text-[#F7F7F7]/60">{toast}</p>
      </div>
    {/if}
  </section>
</div>
