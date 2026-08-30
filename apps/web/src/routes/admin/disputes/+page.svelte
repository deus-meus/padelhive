<script lang="ts">
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Flag,
  Loader2,
  UserCircle,
  UserPlus,
  XCircle,
} from "lucide-svelte";
import { onMount } from "svelte";
import { api } from "$lib/api/client";
import { authStore } from "$lib/auth/store.svelte";
import EmptyState from "$lib/components/ui/empty-state.svelte";
import FilterTabs, {
  type FilterTab,
} from "$lib/components/ui/filter-tabs.svelte";
import { formatShortDate } from "$lib/format";

type DisputeStatus = "OPEN" | "INVESTIGATING" | "RESOLVED" | "CLOSED";
type FilterValue = DisputeStatus | "ALL";

const FILTER_TABS: FilterTab<FilterValue>[] = [
  { label: "All", value: "ALL" },
  { label: "Open", value: "OPEN" },
  { label: "Investigating", value: "INVESTIGATING" },
  { label: "Resolved", value: "RESOLVED" },
  { label: "Closed", value: "CLOSED" },
];

const ISSUE_LABELS: Record<string, string> = {
  COURT_UNAVAILABLE: "Court Unavailable",
  FACILITY_MISMATCH: "Facility Mismatch",
  PAYMENT_ISSUE: "Payment Issue",
  SAFETY_CONCERN: "Safety Concern",
  STAFF_BEHAVIOR: "Staff Behavior",
};

const PRIORITY_STYLES: Record<string, string> = {
  LOW: "bg-[#F7F7F7]/5 text-[#F7F7F7]/40",
  MEDIUM: "bg-amber-500/10 text-amber-400",
  HIGH: "bg-orange-500/10 text-orange-400",
  CRITICAL: "bg-red-500/10 text-red-400",
};

const STATUS_STYLES: Record<string, string> = {
  OPEN: "bg-red-500/10 text-red-400",
  INVESTIGATING: "bg-[#50C8C8]/10 text-[#50C8C8]",
  RESOLVED: "bg-[#E6FA50]/10 text-[#E6FA50]",
  CLOSED: "bg-[#F7F7F7]/5 text-[#F7F7F7]/25",
};

let filter = $state<FilterValue>("ALL");
let disputes = $state<any[]>([]);
let isLoading = $state(true);
let actingId = $state<string | null>(null);
let resolveTarget = $state<string | null>(null);
let resolveNotes = $state("");
let toast = $state<string | null>(null);

function showToast(msg: string) {
  toast = msg;
  setTimeout(() => (toast = null), 2500);
}

async function loadDisputes() {
  isLoading = true;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    const res = await api.admin.disputes.get({
      query: { status: filter === "ALL" ? undefined : filter },
      headers: { authorization: `Bearer ${token}` },
    });
    if (res.data && Array.isArray(res.data)) {
      disputes = res.data;
    }
  } catch (e) {
    console.warn("Admin disputes fetch error:", e);
  } finally {
    isLoading = false;
  }
}

function handleFilterChange(val: FilterValue) {
  filter = val;
  if (authStore.user) {
    loadDisputes();
  }
}

async function handleAssign(id: string) {
  actingId = id;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    const res = await api.admin
      .disputes({ id })
      .assign.patch({}, { headers: { authorization: `Bearer ${token}` } });
    if (res.data) {
      showToast("Dispute assigned to you");
      await loadDisputes();
    }
  } catch (e: any) {
    showToast(e.message || "Failed to assign dispute");
  } finally {
    actingId = null;
  }
}

async function handleResolve() {
  if (!resolveTarget || actingId) return;
  const id = resolveTarget;
  actingId = id;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    const res = await api.admin
      .disputes({ id })
      .resolve.patch(
        { resolutionNotes: resolveNotes.trim() || undefined },
        { headers: { authorization: `Bearer ${token}` } },
      );
    if (res.data) {
      showToast("Dispute marked as resolved");
      resolveTarget = null;
      resolveNotes = "";
      await loadDisputes();
    }
  } catch (e: any) {
    showToast(e.message || "Failed to resolve dispute");
  } finally {
    actingId = null;
  }
}

async function handleClose(id: string) {
  actingId = id;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    const res = await api.admin
      .disputes({ id })
      .close.patch({}, { headers: { authorization: `Bearer ${token}` } });
    if (res.data) {
      showToast("Dispute closed");
      await loadDisputes();
    }
  } catch (e: any) {
    showToast(e.message || "Failed to close dispute");
  } finally {
    actingId = null;
  }
}

onMount(() => {
  if (authStore.user) loadDisputes();
});
</script>

<svelte:head>
  <title>Dispute Handling | PadelHive Admin</title>
</svelte:head>

<div class="flex flex-1 flex-col px-6 pb-6 pt-element lg:px-8 lg:pb-8 pt-8 relative">
  <!-- Header -->
  <div class="mb-8">
    <p class="caption text-[#E6FA50]">Support</p>
    <h1 class="heading-1 mt-2 text-[#F7F7F7]">
      Dispute <span class="text-[#E6FA50]">Handling</span>
    </h1>
  </div>

  <!-- Filter Tabs -->
  <FilterTabs
    tabs={FILTER_TABS}
    activeValue={filter}
    onChange={(val) => handleFilterChange(val as FilterValue)}
  />

  <!-- Dispute List / States -->
  <div class="flex flex-1 flex-col space-y-3">
    {#if isLoading}
      <div class="space-y-4">
        {#each Array.from({ length: 4 }) as _, i}
          <div
            class="h-32 w-full animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]"
          ></div>
        {/each}
      </div>
    {:else if disputes.length === 0}
      <EmptyState
        icon={AlertTriangle}
        title="No disputes"
        description={filter === "ALL"
          ? "There are no disputes right now."
          : `No ${filter.toLowerCase()} disputes in this category.`}
        actionLabel="Refresh"
        onAction={loadDisputes}
      />
    {:else}
      {#each disputes as dispute (dispute.id)}
        {@const isActing = actingId === dispute.id}
        {@const statusStyle = STATUS_STYLES[dispute.status] || "bg-white/[0.04] text-[#F7F7F7]/40"}
        {@const priorityStyle = PRIORITY_STYLES[dispute.priority] || "bg-white/[0.04] text-[#F7F7F7]/40"}
        {@const issueLabel = ISSUE_LABELS[dispute.issueType] || dispute.issueType}

        <div
          class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5"
        >
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div class="flex items-start gap-4">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                <AlertTriangle class="h-4 w-4 text-red-400" />
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span
                    class="caption rounded-full px-2.5 py-0.5 uppercase tracking-wider font-semibold {statusStyle}"
                  >
                    {dispute.status}
                  </span>
                  <span
                    class="caption rounded-full px-2.5 py-0.5 uppercase tracking-wider font-semibold {priorityStyle}"
                  >
                    {dispute.priority}
                  </span>
                  <span class="caption rounded-full bg-white/[0.04] px-2.5 py-0.5 text-[#F7F7F7]/40">
                    {issueLabel}
                  </span>
                </div>

                <p class="body-sm mt-2 text-[#F7F7F7]/80">
                  {dispute.description}
                </p>

                <div class="mt-3 flex flex-wrap items-center gap-4">
                  <span class="caption flex items-center gap-1.5 text-[#F7F7F7]/25">
                    <UserCircle class="h-3.5 w-3.5" />
                    {dispute.user?.name || dispute.user?.email || "Unknown User"}
                  </span>
                  <span class="caption flex items-center gap-1.5 text-[#F7F7F7]/25">
                    <Building2 class="h-3.5 w-3.5" />
                    {dispute.venue?.name || "Unknown Venue"}
                  </span>
                  <span class="caption flex items-center gap-1.5 text-[#F7F7F7]/25">
                    <Flag class="h-3.5 w-3.5" />
                    {formatShortDate(dispute.createdAt)}
                  </span>
                </div>

                {#if dispute.assignedTo}
                  <p class="caption mt-2 text-[#50C8C8]">
                    Assigned to: {dispute.assignedTo?.name || dispute.assignedTo?.email}
                  </p>
                {/if}
              </div>
            </div>

            <div class="mt-4 flex flex-wrap gap-2 border-t border-white/[0.06] pt-4 sm:mt-0 sm:shrink-0 sm:border-0 sm:pt-0">
              {#if (dispute.status === "OPEN" || dispute.status === "INVESTIGATING") && !dispute.assignedTo}
                <button
                  type="button"
                  onclick={() => handleAssign(dispute.id)}
                  disabled={isActing}
                  class="label flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#50C8C8]/10 px-3 text-[#50C8C8] transition-colors hover:bg-[#50C8C8]/20 disabled:opacity-50 sm:h-8 sm:flex-none"
                >
                  {#if isActing}
                    <Loader2 class="h-3.5 w-3.5 animate-spin" />
                  {:else}
                    <UserPlus class="h-3.5 w-3.5" />
                  {/if}
                  Assign
                </button>
              {/if}

              {#if dispute.status === "OPEN" || dispute.status === "INVESTIGATING"}
                <button
                  type="button"
                  onclick={() => {
                    resolveNotes = "";
                    resolveTarget = dispute.id;
                  }}
                  disabled={isActing}
                  class="label flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#E6FA50]/10 px-3 text-[#E6FA50] transition-colors hover:bg-[#E6FA50]/20 disabled:opacity-50 sm:h-8 sm:flex-none"
                >
                  {#if isActing}
                    <Loader2 class="h-3.5 w-3.5 animate-spin" />
                  {:else}
                    <CheckCircle2 class="h-3.5 w-3.5" />
                  {/if}
                  Resolve
                </button>
              {/if}

              {#if dispute.status !== "CLOSED"}
                <button
                  type="button"
                  onclick={() => handleClose(dispute.id)}
                  disabled={isActing}
                  class="label flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/[0.04] px-3 text-[#F7F7F7]/60 transition-colors hover:bg-white/[0.08] hover:text-[#F7F7F7] disabled:opacity-50 sm:h-8 sm:flex-none"
                >
                  {#if isActing}
                    <Loader2 class="h-3.5 w-3.5 animate-spin" />
                  {:else}
                    <XCircle class="h-3.5 w-3.5" />
                  {/if}
                  Close
                </button>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    {/if}
  </div>

  <!-- Resolve Modal -->
  {#if resolveTarget !== null}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        class="absolute inset-0 bg-[#06121A]/80 backdrop-blur-sm w-full h-full border-0 cursor-default"
        onclick={() => (resolveTarget = null)}
        aria-label="Close modal"
      ></button>
      <div class="relative w-full max-w-md rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 shadow-2xl z-10">
        <h2 class="heading-2 text-xl text-[#F7F7F7]">Resolve dispute</h2>
        <div class="mt-4">
          <textarea
            rows={4}
            placeholder="Resolution notes (optional)..."
            bind:value={resolveNotes}
            class="body w-full resize-none rounded-xl border border-white/[0.06] bg-black/20 p-4 text-[#F7F7F7] placeholder:text-[#F7F7F7]/25 focus:border-[#E6FA50]/50 focus:outline-none"
          ></textarea>
        </div>
        <div class="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onclick={() => (resolveTarget = null)}
            disabled={actingId !== null}
            class="label rounded-lg px-4 py-2 text-[#F7F7F7]/60 hover:bg-white/[0.04] hover:text-[#F7F7F7] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onclick={handleResolve}
            disabled={actingId !== null}
            class="label flex items-center gap-2 rounded-lg bg-[#E6FA50]/10 px-4 py-2 text-[#E6FA50] hover:bg-[#E6FA50]/20 disabled:opacity-50"
          >
            {#if actingId !== null}
              <Loader2 class="h-4 w-4 animate-spin" />
            {/if}
            Confirm Resolve
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Toast -->
  {#if toast}
    <div
      class="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-white/[0.06] bg-[#0C1B26] px-5 py-3 shadow-2xl"
    >
      <p class="caption text-[#F7F7F7]/60">{toast}</p>
    </div>
  {/if}
</div>
