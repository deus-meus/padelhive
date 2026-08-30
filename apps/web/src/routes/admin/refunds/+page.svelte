<script lang="ts">
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  History,
  Loader2,
  RotateCcw,
  ShieldCheck,
  ShieldX,
  XCircle,
} from "lucide-svelte";
import { onMount } from "svelte";
import { api } from "$lib/api/client";
import { authStore } from "$lib/auth/store.svelte";
import EmptyState from "$lib/components/ui/empty-state.svelte";
import FilterTabs, {
  type FilterTab,
} from "$lib/components/ui/filter-tabs.svelte";
import {
  formatBookingDate,
  formatBookingDateTime,
  formatShortDate,
} from "$lib/format";

type RefundStatus = "PENDING" | "APPROVED" | "REJECTED" | "PROCESSED";
type FilterValue = RefundStatus | "ALL";

const FILTER_TABS: FilterTab<FilterValue>[] = [
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Processed", value: "PROCESSED" },
  { label: "All", value: "ALL" },
];

function formatIDR(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

let filter = $state<FilterValue>("PENDING");
let refunds = $state<any[]>([]);
let isLoading = $state(true);
let actingId = $state<string | null>(null);
let rejectTarget = $state<string | null>(null);
let rejectReason = $state("");
let expandedId = $state<string | null>(null);
let historyMap = $state<Record<string, any[]>>({});
let isLoadingHistoryMap = $state<Record<string, boolean>>({});
let toast = $state<string | null>(null);

function showToast(msg: string) {
  toast = msg;
  setTimeout(() => (toast = null), 2500);
}

async function loadRefunds() {
  isLoading = true;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    const res = await api.refunds.get({
      query: { status: filter === "ALL" ? undefined : filter },
      headers: { authorization: `Bearer ${token}` },
    });
    if (res.data && Array.isArray(res.data)) {
      refunds = res.data;
    }
  } catch (e) {
    console.warn("Admin refunds fetch error:", e);
  } finally {
    isLoading = false;
  }
}

function handleFilterChange(val: FilterValue) {
  filter = val;
  if (authStore.user) {
    loadRefunds();
  }
}

async function handleApprove(id: string) {
  actingId = id;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    const res = await api
      .refunds({ id })
      .approve.patch({}, { headers: { authorization: `Bearer ${token}` } });
    if (res.data) {
      showToast("Refund approved — now process it to issue the payout");
      await loadRefunds();
    }
  } catch (e: any) {
    showToast(e.message || "Failed to approve refund");
  } finally {
    actingId = null;
  }
}

async function handleProcess(id: string) {
  actingId = id;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    const res = await api
      .refunds({ id })
      .process.patch({}, { headers: { authorization: `Bearer ${token}` } });
    if (res.data) {
      showToast("Refund processed — payout issued to customer");
      await loadRefunds();
    }
  } catch (e: any) {
    showToast(e.message || "Failed to process refund");
  } finally {
    actingId = null;
  }
}

async function handleReject() {
  if (!rejectTarget || !rejectReason.trim() || actingId) return;
  const id = rejectTarget;
  actingId = id;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    const res = await api
      .refunds({ id })
      .reject.patch(
        { adminNotes: rejectReason.trim() },
        { headers: { authorization: `Bearer ${token}` } },
      );
    if (res.data) {
      showToast("Refund rejected");
      rejectTarget = null;
      rejectReason = "";
      await loadRefunds();
    }
  } catch (e: any) {
    showToast(e.message || "Failed to reject refund");
  } finally {
    actingId = null;
  }
}

async function toggleHistory(id: string) {
  if (expandedId === id) {
    expandedId = null;
    return;
  }
  expandedId = id;
  if (!historyMap[id]) {
    isLoadingHistoryMap[id] = true;
    try {
      const token = await authStore.firebaseUser?.getIdToken();
      if (!token) return;

      const res = await api
        .refunds({ id })
        .history.get({ headers: { authorization: `Bearer ${token}` } });
      if (res.data && Array.isArray(res.data)) {
        historyMap[id] = res.data;
      }
    } catch (e) {
      console.warn("Refund history error:", e);
    } finally {
      isLoadingHistoryMap[id] = false;
    }
  }
}

$effect(() => {
  if (authStore.isInitialized && authStore.user) {
    loadRefunds();
  }
});

const BADGE_STYLES: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-400",
  APPROVED: "bg-[#E6FA50]/10 text-[#E6FA50]",
  REJECTED: "bg-red-500/10 text-red-400",
  PROCESSED: "bg-blue-500/10 text-blue-400",
};
</script>

<svelte:head>
  <title>Refund Management | PadelHive Admin</title>
</svelte:head>

<div class="flex flex-1 flex-col px-6 pb-6 pt-element lg:px-8 lg:pb-8 pt-8">
  <!-- Header -->
  <div class="mb-8">
    <p class="caption text-[#E6FA50]">Financial</p>
    <h1 class="heading-1 mt-2 text-[#F7F7F7]">
      Refund <span class="text-[#E6FA50]">Management</span>
    </h1>
  </div>

  <!-- Eligibility Info Banner -->
  <div class="mb-6 rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-4">
    <p class="section-label mb-3">Refund Policy</p>
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div class="flex items-center gap-3 rounded-xl bg-white/[0.02] p-3">
        <ShieldCheck class="h-4 w-4 shrink-0 text-[#E6FA50]" />
        <div>
          <p class="body-sm text-[#F7F7F7]/60">
            Full refund before H-1
          </p>
          <p class="caption text-[#F7F7F7]/25">
            Cancellation 24+ hours before booking
          </p>
        </div>
      </div>
      <div class="flex items-center gap-3 rounded-xl bg-white/[0.02] p-3">
        <ShieldX class="h-4 w-4 shrink-0 text-red-400" />
        <div>
          <p class="body-sm text-[#F7F7F7]/60">
            Non-refundable after H-1
          </p>
          <p class="caption text-[#F7F7F7]/25">
            Less than 24 hours before booking
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Filter Tabs -->
  <FilterTabs
    tabs={FILTER_TABS}
    activeValue={filter}
    onChange={(val) => handleFilterChange(val as FilterValue)}
  />

  <!-- Refund List -->
  <div class="flex flex-1 flex-col space-y-3">
    {#if isLoading}
      <div class="space-y-4">
        {#each Array.from({ length: 3 }) as _, i}
          <div
            class="h-32 w-full animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]"
          ></div>
        {/each}
      </div>
    {:else if refunds.length === 0}
      <EmptyState
        icon={RotateCcw}
        title="No refunds found"
        description={filter === "PENDING"
          ? "There are no refund requests waiting for review."
          : "No refunds match the selected filter."}
        actionLabel="Refresh"
        onAction={loadRefunds}
      />
    {:else}
      {#each refunds as refund (refund.id)}
        {@const isActing = actingId === refund.id}
        {@const status = refund.status || "PENDING"}
        {@const badgeStyle = BADGE_STYLES[status] || "bg-white/[0.04] text-[#F7F7F7]/40"}

        <div
          class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5"
        >
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div class="flex items-start gap-4">
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg {status === 'PENDING'
                  ? 'bg-amber-500/10'
                  : 'bg-[#E6FA50]/10'}"
              >
                {#if status === "PENDING"}
                  <AlertCircle class="h-4 w-4 text-amber-400" />
                {:else}
                  <RotateCcw class="h-4 w-4 text-[#E6FA50]" />
                {/if}
              </div>

              <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="body-sm text-[#F7F7F7] font-medium">
                    {refund.booking?.venue?.name ?? "Unknown venue"}
                  </span>
                  <span
                    class="caption rounded-full px-2.5 py-0.5 uppercase tracking-wider font-semibold {badgeStyle}"
                  >
                    {status}
                  </span>
                  {#if refund.type === "RESCHEDULE_DIFF"}
                    <span class="caption rounded-full bg-blue-500/10 px-2 py-0.5 text-blue-400">
                      Selisih reschedule
                    </span>
                  {/if}
                </div>

                <p class="caption text-[#F7F7F7]/40 mt-1">
                  {refund.booking?.court?.name ?? "Court"} · #{refund.bookingId ? refund.bookingId.slice(0, 8) : refund.id.slice(0, 8)}
                </p>
                <p class="body-sm mt-1 text-[#F7F7F7]/60">
                  {refund.booking?.host?.name ||
                    refund.booking?.host?.email ||
                    "Unknown User"}
                </p>
                {#if refund.reason}
                  <p class="caption text-[#F7F7F7]/40 mt-2 italic">
                    "{refund.reason}"
                  </p>
                {/if}

                <div class="mt-2 flex flex-wrap items-center gap-3">
                  <span class="caption flex items-center gap-1 text-[#F7F7F7]/25">
                    <Clock class="h-3 w-3" /> Booking:{" "}
                    {formatBookingDate(refund.booking?.bookingDate || refund.createdAt)}
                  </span>
                  <span class="caption flex items-center gap-1 text-[#F7F7F7]/25">
                    Requested: {formatShortDate(refund.createdAt)}
                  </span>
                </div>

                <div class="mt-3">
                  <button
                    type="button"
                    onclick={() => toggleHistory(refund.id)}
                    class="flex items-center gap-1.5 caption text-[#F7F7F7]/40 hover:text-[#F7F7F7]/60 transition-colors"
                  >
                    <History class="h-3 w-3" />
                    View history
                    {#if expandedId === refund.id}
                      <ChevronUp class="h-3 w-3" />
                    {:else}
                      <ChevronDown class="h-3 w-3" />
                    {/if}
                  </button>
                </div>

                {#if expandedId === refund.id}
                  <div class="mt-4 border-t border-white/[0.06] pt-4">
                    {#if isLoadingHistoryMap[refund.id]}
                      <div class="space-y-2">
                        <div class="h-4 w-full animate-pulse rounded bg-white/[0.04]"></div>
                        <div class="h-4 w-full animate-pulse rounded bg-white/[0.04]"></div>
                      </div>
                    {:else if historyMap[refund.id] && historyMap[refund.id].length > 0}
                      <div class="space-y-4">
                        {#each historyMap[refund.id] as event (event.id)}
                          {@const actorName = event.actor?.name || event.actor?.email || "System"}
                          {@const formattedTime = formatBookingDateTime(event.createdAt)}
                          <div class="border-l-2 border-white/[0.06] pl-4 relative">
                            <div class="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-[#E6FA50]"></div>
                            <div class="flex items-center gap-2 flex-wrap mb-1">
                              {#if event.fromStatus}
                                <span class="caption rounded-full px-2 py-0.5 uppercase {BADGE_STYLES[event.fromStatus] || 'text-[#F7F7F7]/40'}">
                                  {event.fromStatus}
                                </span>
                              {:else}
                                <span class="caption text-[#F7F7F7]/40 uppercase tracking-[0.1em]">
                                  Requested
                                </span>
                              {/if}
                              <span class="body-sm text-[#F7F7F7]/40">→</span>
                              <span class="caption rounded-full px-2 py-0.5 uppercase {BADGE_STYLES[event.toStatus] || 'text-[#F7F7F7]/40'}">
                                {event.toStatus}
                              </span>
                            </div>
                            <p class="caption text-[#F7F7F7]/40">
                              {actorName} · {formattedTime}
                            </p>
                            {#if event.notes}
                              <p class="caption italic text-[#F7F7F7]/60 mt-1">
                                "{event.notes}"
                              </p>
                            {/if}
                          </div>
                        {/each}
                      </div>
                    {:else}
                      <p class="caption text-[#F7F7F7]/40">No history recorded yet.</p>
                    {/if}
                  </div>
                {/if}
              </div>
            </div>

            <div class="mt-4 flex flex-col gap-4 border-t border-white/[0.06] pt-4 sm:mt-0 sm:shrink-0 sm:items-end sm:justify-start sm:border-0 sm:pt-0">
              <div class="flex items-center justify-between sm:flex-col sm:items-end sm:justify-start sm:gap-1 w-full sm:w-auto">
                <span class="caption text-[#F7F7F7]/60 sm:hidden">
                  Refund Amount
                </span>
                <p class="price text-[#F7F7F7]">
                  {formatIDR(Number(refund.amount || 0))}
                </p>
              </div>

              {#if status === "PENDING"}
                <div class="flex w-full gap-2 sm:w-auto">
                  <button
                    type="button"
                    onclick={() => handleApprove(refund.id)}
                    disabled={isActing}
                    class="label flex h-9 flex-1 min-w-[80px] items-center justify-center gap-1.5 rounded-lg bg-[#E6FA50]/10 px-3 text-[#E6FA50] transition-colors hover:bg-[#E6FA50]/20 disabled:opacity-50 sm:h-8 sm:flex-none"
                  >
                    {#if isActing}
                      <Loader2 class="h-3.5 w-3.5 animate-spin" />
                    {:else}
                      <CheckCircle2 class="h-3.5 w-3.5" /> Approve
                    {/if}
                  </button>
                  <button
                    type="button"
                    onclick={() => {
                      rejectReason = "";
                      rejectTarget = refund.id;
                    }}
                    disabled={isActing}
                    class="label flex h-9 flex-1 min-w-[80px] items-center justify-center gap-1.5 rounded-lg bg-red-500/10 px-3 text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50 sm:h-8 sm:flex-none"
                  >
                    {#if isActing}
                      <Loader2 class="h-3.5 w-3.5 animate-spin" />
                    {:else}
                      <XCircle class="h-3.5 w-3.5" /> Reject
                    {/if}
                  </button>
                </div>
              {:else if status === "APPROVED"}
                <div class="flex w-full gap-2 sm:w-auto">
                  <button
                    type="button"
                    onclick={() => handleProcess(refund.id)}
                    disabled={isActing}
                    class="label flex h-9 flex-1 min-w-[120px] items-center justify-center gap-1.5 rounded-lg bg-[#50C8C8]/10 px-3 text-[#50C8C8] transition-colors hover:bg-[#50C8C8]/20 disabled:opacity-50 sm:h-8 sm:flex-none"
                  >
                    {#if isActing}
                      <Loader2 class="h-3.5 w-3.5 animate-spin" />
                    {:else}
                      <RotateCcw class="h-3.5 w-3.5" /> Process refund
                    {/if}
                  </button>
                </div>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    {/if}
  </div>

  <!-- Reject Modal -->
  {#if rejectTarget}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        class="absolute inset-0 bg-[#06121A]/80 backdrop-blur-sm w-full h-full border-0 cursor-default"
        onclick={() => (rejectTarget = null)}
        aria-label="Close modal"
      ></button>
      <div class="relative w-full max-w-md rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 shadow-2xl z-10">
        <h2 class="heading-2 text-xl text-[#F7F7F7]">Reject refund</h2>
        <div class="mt-4">
          <textarea
            rows={4}
            placeholder="Reason for rejection (required)..."
            bind:value={rejectReason}
            class="body w-full resize-none rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[#F7F7F7] placeholder:text-[#F7F7F7]/25 focus:border-[#E6FA50]/30 focus:outline-none"
          ></textarea>
        </div>
        <div class="mt-6 flex gap-3">
          <button
            type="button"
            onclick={() => (rejectTarget = null)}
            disabled={actingId !== null}
            class="label flex-1 rounded-xl border border-white/[0.08] py-2.5 text-[#F7F7F7]/60 transition-colors hover:border-white/[0.15] hover:text-[#F7F7F7]/80 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onclick={handleReject}
            disabled={!rejectReason.trim() || actingId !== null}
            class="label flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500/10 py-2.5 text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
          >
            {#if actingId !== null}
              <Loader2 class="h-3.5 w-3.5 animate-spin" />
            {/if}
            Confirm Reject
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
