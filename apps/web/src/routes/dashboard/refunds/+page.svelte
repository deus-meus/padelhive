<script lang="ts">
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  RotateCcw,
  ShieldCheck,
  ShieldX,
  XCircle,
} from "lucide-svelte";
import { api } from "$lib/api/client";
import { authStore } from "$lib/auth/store.svelte";
import EmptyState from "$lib/components/ui/empty-state.svelte";
import FilterTabs, {
  type FilterTab,
} from "$lib/components/ui/filter-tabs.svelte";
import { formatBookingDate, formatShortDate } from "$lib/format";

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
let toast = $state<string | null>(null);

function showToast(msg: string) {
  toast = msg;
  setTimeout(() => (toast = null), 2500);
}

async function loadOwnerRefunds() {
  if (!authStore.firebaseUser) return;
  isLoading = true;
  try {
    const token = await authStore.firebaseUser.getIdToken();
    if (!token) return;

    const res = await api.refunds.get({
      query: { status: filter === "ALL" ? undefined : filter },
      headers: { authorization: `Bearer ${token}` },
    });
    if (res.data && Array.isArray(res.data)) {
      refunds = res.data;
    }
  } catch (e) {
    console.warn("Owner refunds fetch error:", e);
  } finally {
    isLoading = false;
  }
}

function handleFilterChange(val: FilterValue) {
  filter = val;
  if (authStore.user) {
    loadOwnerRefunds();
  }
}

$effect(() => {
  if (authStore.isInitialized && authStore.user && authStore.firebaseUser) {
    loadOwnerRefunds();
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
  <title>Refunds Management | Padelhive Owner</title>
</svelte:head>

<div class="py-8">
  <section class="container">
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
      {#if isLoading || !authStore.isInitialized || authStore.isLoading}
        <div class="space-y-4">
          {#each Array.from({ length: 3 }) as _}
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
          onAction={loadOwnerRefunds}
        />
      {:else}
        {#each refunds as refund (refund.id)}
          {@const status = refund.status || "PENDING"}
          {@const badgeStyle = BADGE_STYLES[status] || "bg-white/[0.04] text-[#F7F7F7]/40"}

          <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5">
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
                  </div>

                  <p class="caption text-[#F7F7F7]/40 mt-1">
                    {refund.booking?.court?.name ?? "Court"} · #{refund.bookingId ? refund.bookingId.slice(0, 8) : refund.id.slice(0, 8)}
                  </p>
                  <p class="body-sm mt-1 text-[#F7F7F7]/60">
                    {refund.booking?.host?.name || refund.booking?.host?.email || "Unknown User"}
                  </p>
                  {#if refund.reason}
                    <p class="caption text-[#F7F7F7]/40 mt-2 italic">
                      "{refund.reason}"
                    </p>
                  {/if}

                  <div class="mt-2 flex flex-wrap items-center gap-3">
                    <span class="caption flex items-center gap-1 text-[#F7F7F7]/25">
                      <Clock class="h-3 w-3" /> Booking: {formatBookingDate(refund.booking?.bookingDate || refund.createdAt)}
                    </span>
                    <span class="caption flex items-center gap-1 text-[#F7F7F7]/25">
                      Requested: {formatShortDate(refund.createdAt)}
                    </span>
                  </div>
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
              </div>
            </div>
          </div>
        {/each}
      {/if}
    </div>

    <!-- Toast -->
    {#if toast}
      <div class="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-white/[0.06] bg-[#0C1B26] px-5 py-3 shadow-2xl">
        <p class="caption text-[#F7F7F7]/60">{toast}</p>
      </div>
    {/if}
  </section>
</div>
