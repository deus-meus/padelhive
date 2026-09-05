<script lang="ts">
import {
  Building2,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  XCircle,
} from "lucide-svelte";
import { api } from "$lib/api/client";
import { authStore } from "$lib/auth/store.svelte";
import EmptyState from "$lib/components/ui/empty-state.svelte";
import FilterTabs from "$lib/components/ui/filter-tabs.svelte";

type TabValue = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED" | "ALL";

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

const TABS: { label: string; value: TabValue }[] = [
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Suspended", value: "SUSPENDED" },
  { label: "All", value: "ALL" },
];

let activeTab = $state<TabValue>("PENDING");
let venues = $state<any[]>([]);
let isLoading = $state(true);
let inFlightId = $state<string | null>(null);
let toast = $state<string | null>(null);

const filteredVenues = $derived(
  activeTab === "ALL"
    ? venues
    : venues.filter((v) => (v.status ?? "PENDING") === activeTab),
);

function showToast(msg: string) {
  toast = msg;
  setTimeout(() => (toast = null), 3000);
}

async function loadVenues() {
  if (!authStore.firebaseUser) return;
  isLoading = true;
  try {
    const token = await authStore.firebaseUser.getIdToken();
    if (!token) return;

    const res = await api.admin.venues.get({
      query: { status: activeTab === "ALL" ? undefined : activeTab },
      headers: { authorization: `Bearer ${token}` },
    });
    if (res.data && Array.isArray(res.data)) {
      venues = res.data;
    }
  } catch (e) {
    console.warn("Error fetching admin venues:", e);
  } finally {
    isLoading = false;
  }
}

function handleTabChange(val: TabValue) {
  activeTab = val;
  if (authStore.user) {
    loadVenues();
  }
}

async function updateStatus(id: string, status: string) {
  inFlightId = id;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    const res = await api.admin
      .venues({ id })
      .status.patch(
        { status: status as any },
        { headers: { authorization: `Bearer ${token}` } },
      );
    if (res.data) {
      showToast(`Venue status updated to ${status}.`);
      await loadVenues();
    }
  } catch (err: any) {
    showToast(err.message || "Failed to update venue status");
  } finally {
    inFlightId = null;
  }
}

$effect(() => {
  if (authStore.isInitialized && authStore.user && authStore.firebaseUser) {
    loadVenues();
  }
});
</script>

<svelte:head>
  <title>Venue Approvals | PadelHive Admin</title>
</svelte:head>

<div class="flex flex-1 flex-col px-6 pb-6 pt-element lg:px-8 lg:pb-8 pt-8">
  <!-- Header -->
  <div class="mb-8">
    <p class="caption text-[#E6FA50]">Marketplace Admin</p>
    <h1 class="heading-1 mt-2 text-[#F7F7F7]">
      Venue <span class="text-[#E6FA50]">Approvals</span>
    </h1>
  </div>

  <!-- Tabs -->
  <FilterTabs
    tabs={TABS}
    activeValue={activeTab}
    onChange={(val) => handleTabChange(val as TabValue)}
  />

  <!-- Venue List -->
  <div class="flex flex-1 flex-col space-y-4">
    {#if isLoading || !authStore.isInitialized || authStore.isLoading}
      <div class="space-y-4">
        {#each Array.from({ length: 3 }) as _}
          <div
            class="h-32 animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]"
          ></div>
        {/each}
      </div>
    {:else if filteredVenues.length === 0}
      <EmptyState
        icon={Building2}
        title="No venues found"
        description={activeTab === "PENDING"
          ? "There are no venues waiting for approval."
          : "No venues match the selected status."}
        actionLabel="Refresh"
        onAction={loadVenues}
      />
    {:else}
      {#each filteredVenues as venue (venue.id)}
        {@const isUpdating = inFlightId === venue.id}
        {@const status = venue.status ?? "PENDING"}
        {@const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING}
        {@const StatusIcon = config.icon}

        <div
          class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 transition-all"
        >
          <div
            class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
          >
            <div class="flex-1 min-w-0">
              <div
                class="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3"
              >
                <div
                  class="flex items-center gap-1.5 rounded-full px-2 py-0.5 sm:order-last {config.bg}"
                >
                  <StatusIcon class="h-3 w-3 {config.color}" />
                  <span
                    class="caption rounded-full px-2.5 py-0.5 uppercase tracking-[0.1em] {config.color}"
                  >
                    {config.label}
                  </span>
                </div>
                <h3
                  class="heading-2 text-lg text-[#F7F7F7] break-words w-full sm:w-auto"
                >
                  {venue.name}
                </h3>
              </div>
              <p
                class="mt-2 flex items-start gap-1.5 text-sm text-[#F7F7F7]/40 sm:mt-1 sm:items-center"
              >
                <MapPin class="h-3.5 w-3.5 shrink-0 mt-0.5 sm:mt-0" />
                <span class="break-words">
                  {venue.location} · {venue.city}
                </span>
              </p>
            </div>

            <div
              class="mt-4 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-4 sm:mt-0 sm:shrink-0 sm:border-0 sm:pt-0"
            >
              {#if status === "PENDING"}
                <button
                  type="button"
                  onclick={() => updateStatus(venue.id, "REJECTED")}
                  disabled={isUpdating}
                  class="label flex h-9 items-center justify-center rounded-lg border border-red-500/50 px-5 text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                >
                  {#if isUpdating}
                    <Loader2 class="h-3.5 w-3.5 animate-spin" />
                  {:else}
                    Reject
                  {/if}
                </button>
                <button
                  type="button"
                  onclick={() => updateStatus(venue.id, "APPROVED")}
                  disabled={isUpdating}
                  class="label btn-lime flex h-9 items-center justify-center rounded-lg px-5 disabled:opacity-50"
                >
                  {#if isUpdating}
                    <Loader2 class="h-3.5 w-3.5 animate-spin" />
                  {:else}
                    Approve
                  {/if}
                </button>
              {:else if status === "APPROVED"}
                <button
                  type="button"
                  onclick={() => updateStatus(venue.id, "SUSPENDED")}
                  disabled={isUpdating}
                  class="flex h-9 items-center justify-center rounded-full border border-orange-500/50 px-5 text-[11px] font-semibold text-orange-400 transition-colors hover:bg-orange-500/10 disabled:opacity-50"
                >
                  {#if isUpdating}
                    <Loader2 class="h-3.5 w-3.5 animate-spin" />
                  {:else}
                    Suspend
                  {/if}
                </button>
              {:else if status === "REJECTED" || status === "SUSPENDED"}
                <button
                  type="button"
                  onclick={() => updateStatus(venue.id, "APPROVED")}
                  disabled={isUpdating}
                  class="btn-lime flex h-9 items-center justify-center rounded-full px-5 text-[11px] font-semibold tracking-[0.08em] disabled:opacity-50"
                >
                  {#if isUpdating}
                    <Loader2 class="h-3.5 w-3.5 animate-spin" />
                  {:else}
                    Approve
                  {/if}
                </button>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    {/if}
  </div>

  <!-- Toast -->
  {#if toast}
    <div
      class="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-white/[0.08] bg-[#0C1B26] px-5 py-3 shadow-2xl shadow-black/40"
    >
      <p class="text-sm text-[#F7F7F7]/60">{toast}</p>
    </div>
  {/if}
</div>
