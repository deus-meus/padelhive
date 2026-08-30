<script lang="ts">
import { ChevronLeft, ChevronRight, Receipt } from "lucide-svelte";
import { onMount } from "svelte";
import { api } from "$lib/api/client";
import { authStore } from "$lib/auth/store.svelte";
import EmptyState from "$lib/components/ui/empty-state.svelte";
import FilterTabs, {
  type FilterTab,
} from "$lib/components/ui/filter-tabs.svelte";
import { formatBookingDate, formatBookingTimeRange } from "$lib/format";

type BookingStatus =
  | "ALL"
  | "PENDING"
  | "PENDING_PAYMENT"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "EXPIRED";

const TABS: FilterTab<BookingStatus>[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Awaiting Payment", value: "PENDING_PAYMENT" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Expired", value: "EXPIRED" },
];

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  COMPLETED: {
    label: "Completed",
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "text-[#50C8C8]",
    bg: "bg-[#50C8C8]/10",
  },
  PENDING: {
    label: "Pending",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
  PENDING_PAYMENT: {
    label: "Awaiting Payment",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  CANCELLED: { label: "Cancelled", color: "text-red-400", bg: "bg-red-400/10" },
  EXPIRED: {
    label: "Expired",
    color: "text-[#F7F7F7]/40",
    bg: "bg-white/[0.04]",
  },
};

const PAYMENT_CONFIG: Record<string, { color: string }> = {
  PAID: { color: "text-green-400" },
  PENDING: { color: "text-yellow-400" },
  FAILED: { color: "text-red-400" },
  REFUNDED: { color: "text-[#F7F7F7]/40" },
};

function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

let activeStatus = $state<BookingStatus>("ALL");
let currentPage = $state(1);
const pageSize = 20;

let items = $state<any[]>([]);
let total = $state(0);
let isLoading = $state(true);

const totalPages = $derived(Math.max(1, Math.ceil(total / pageSize)));

async function loadTransactions() {
  isLoading = true;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    const res = await api.admin.bookings.get({
      query: {
        status: activeStatus === "ALL" ? undefined : activeStatus,
        page: String(currentPage),
        pageSize: String(pageSize),
      },
      headers: { authorization: `Bearer ${token}` },
    });
    if (res.data) {
      const data = res.data as any;
      items = data.items || [];
      total = data.total || 0;
    }
  } catch (e) {
    console.warn("Admin transactions fetch error:", e);
  } finally {
    isLoading = false;
  }
}

function handleTabChange(status: BookingStatus) {
  activeStatus = status;
  currentPage = 1;
  if (authStore.user) {
    loadTransactions();
  }
}

function handlePageChange(newPage: number) {
  currentPage = newPage;
  if (authStore.user) {
    loadTransactions();
  }
}

onMount(() => {
  if (authStore.user) loadTransactions();
});
</script>

<svelte:head>
  <title>Transactions Log | PadelHive Admin</title>
</svelte:head>

<div class="flex flex-1 flex-col px-6 pb-6 pt-element lg:px-8 lg:pb-8 pt-8">
  <!-- Header -->
  <div class="mb-8">
    <p class="caption text-[#E6FA50]">Marketplace Admin</p>
    <h1 class="heading-1 mt-2 text-[#F7F7F7]">
      Platform <span class="text-[#E6FA50]">Transactions</span>
    </h1>
    <p class="body-sm mt-1 text-[#F7F7F7]/40">
      Real-time financial transactions and booking payment logs
    </p>
  </div>

  <!-- Tabs -->
  <FilterTabs
    tabs={TABS}
    activeValue={activeStatus}
    onChange={(val) => handleTabChange(val as BookingStatus)}
  />

  <!-- Transactions Table / States -->
  <div class="flex flex-1 flex-col space-y-4">
    {#if isLoading}
      <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 space-y-4">
        {#each Array.from({ length: 6 }) as _, i}
          <div
            class="h-12 w-full animate-pulse rounded-lg bg-white/[0.04]"
          ></div>
        {/each}
      </div>
    {:else if items.length === 0}
      <EmptyState
        icon={Receipt}
        title="No transactions found"
        description="No bookings or financial transactions match the selected status."
        actionLabel="Refresh"
        onAction={loadTransactions}
      />
    {:else}
      <div class="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0C1B26]">
        <div class="overflow-x-auto">
          <table class="body-sm w-full text-left">
            <thead>
              <tr class="border-b border-white/[0.06]">
                <th class="caption px-4 py-3 uppercase whitespace-nowrap text-[#F7F7F7]/40">
                  Date
                </th>
                <th class="caption px-4 py-3 uppercase whitespace-nowrap text-[#F7F7F7]/40">
                  Venue / Court
                </th>
                <th class="caption px-4 py-3 uppercase whitespace-nowrap text-[#F7F7F7]/40">
                  Customer
                </th>
                <th class="caption px-4 py-3 uppercase whitespace-nowrap text-[#F7F7F7]/40">
                  Schedule
                </th>
                <th class="caption px-4 py-3 uppercase whitespace-nowrap text-[#F7F7F7]/40">
                  Amount
                </th>
                <th class="caption px-4 py-3 uppercase whitespace-nowrap text-[#F7F7F7]/40">
                  Payment
                </th>
                <th class="caption px-4 py-3 uppercase whitespace-nowrap text-[#F7F7F7]/40">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {#each items as item (item.id)}
                {@const cfg = STATUS_CONFIG[item.status] ?? {
                  label: item.status,
                  color: "text-[#F7F7F7]/40",
                  bg: "bg-white/[0.04]",
                }}
                <tr class="border-t border-white/[0.06] hover:bg-white/[0.02]">
                  <td class="px-4 py-3 align-middle whitespace-nowrap text-[#F7F7F7]/80">
                    {formatBookingDate(item.bookingDate)}
                  </td>
                  <td class="px-4 py-3 align-middle whitespace-nowrap text-[#F7F7F7]/80">
                    <div class="text-[#F7F7F7] font-medium">
                      {item.venue?.name || "—"}
                    </div>
                    <div class="caption text-[#F7F7F7]/40">
                      {item.court?.name || "Court"} · {item.venue?.city || ""}
                    </div>
                  </td>
                  <td class="px-4 py-3 align-middle whitespace-nowrap text-[#F7F7F7]/80">
                    <div class="text-[#F7F7F7]">{item.host?.name ?? "—"}</div>
                    <div class="caption text-[#F7F7F7]/40">
                      {item.host?.email || ""}
                    </div>
                  </td>
                  <td class="px-4 py-3 align-middle whitespace-nowrap text-[#F7F7F7]/80">
                    <div>
                      {formatBookingTimeRange(item.startsAt, item.endsAt)}
                    </div>
                    <div class="caption text-[#F7F7F7]/40">
                      {item.durationMinutes || 60} min
                    </div>
                  </td>
                  <td class="px-4 py-3 align-middle whitespace-nowrap text-[#F7F7F7]/80">
                    <div class="text-[#F7F7F7] font-semibold">
                      {formatIDR(item.finalAmount || item.totalPrice || 0)}
                    </div>
                    {#if item.voucherDiscount && item.voucherDiscount > 0}
                      <div class="caption text-green-400">
                        -{formatIDR(item.voucherDiscount)} voucher
                      </div>
                    {/if}
                  </td>
                  <td class="px-4 py-3 align-middle whitespace-nowrap text-[#F7F7F7]/80">
                    {#if item.payment}
                      <div class={PAYMENT_CONFIG[item.payment.status]?.color ?? "text-[#F7F7F7]/40"}>
                        {item.payment.status}
                      </div>
                      <div class="caption text-[#F7F7F7]/40">
                        {item.payment.provider || "Internal"} · {item.payment.method || "Virtual Account"}
                      </div>
                    {:else}
                      <div class="text-[#F7F7F7]/40">—</div>
                    {/if}
                  </td>
                  <td class="px-4 py-3 align-middle whitespace-nowrap text-[#F7F7F7]/80">
                    <span class="caption rounded-full px-2.5 py-1 uppercase tracking-wider font-semibold {cfg.color} {cfg.bg}">
                      {cfg.label}
                    </span>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span class="body-sm text-[#F7F7F7]/40">
          Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, total)} of {total}
        </span>
        <div class="flex gap-2">
          <button
            type="button"
            onclick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            class="label flex items-center gap-1 rounded-full border border-white/[0.08] px-4 py-2 text-[#F7F7F7]/60 transition-colors hover:border-white/[0.15] hover:text-[#F7F7F7]/80 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft class="h-3.5 w-3.5" />
            Prev
          </button>
          <button
            type="button"
            onclick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            class="label flex items-center gap-1 rounded-full border border-white/[0.08] px-4 py-2 text-[#F7F7F7]/60 transition-colors hover:border-white/[0.15] hover:text-[#F7F7F7]/80 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ChevronRight class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>
