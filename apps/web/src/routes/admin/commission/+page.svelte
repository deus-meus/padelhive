<script lang="ts">
import { Coins } from "lucide-svelte";
import { onMount } from "svelte";
import { api } from "$lib/api/client";
import { authStore } from "$lib/auth/store.svelte";
import EmptyState from "$lib/components/ui/empty-state.svelte";
import FilterTabs, {
  type FilterTab,
} from "$lib/components/ui/filter-tabs.svelte";

type PeriodPreset = "This month" | "Last month" | "This year" | "All time";

const PERIOD_TABS: FilterTab<PeriodPreset>[] = [
  { label: "This month", value: "This month" },
  { label: "Last month", value: "Last month" },
  { label: "This year", value: "This year" },
  { label: "All time", value: "All time" },
];

function formatIDR(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

let preset = $state<PeriodPreset>("This month");
let data = $state<any | null>(null);
let isLoading = $state(true);

function getPeriodDates(presetName: PeriodPreset) {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();
  const pad = (n: number) => String(n).padStart(2, "0");
  const iso = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  switch (presetName) {
    case "This month":
      return { fromDate: iso(new Date(y, m, 1)), toDate: iso(today) };
    case "Last month":
      return {
        fromDate: iso(new Date(y, m - 1, 1)),
        toDate: iso(new Date(y, m, 0)),
      };
    case "This year":
      return { fromDate: `${y}-01-01`, toDate: iso(today) };
    case "All time":
      return { fromDate: undefined, toDate: undefined };
  }
}

async function loadCommissionReport() {
  isLoading = true;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    const { fromDate, toDate } = getPeriodDates(preset);

    const res = await api.admin.commission.get({
      query: { fromDate, toDate },
      headers: { authorization: `Bearer ${token}` },
    });
    if (res.data) {
      data = res.data;
    }
  } catch (e) {
    console.warn("Commission fetch error:", e);
  } finally {
    isLoading = false;
  }
}

function handlePresetChange(val: PeriodPreset) {
  preset = val;
  if (authStore.user) {
    loadCommissionReport();
  }
}

function exportCsv() {
  if (!data?.venues || data.venues.length === 0) return;
  const escapeCsv = (str: string | number) =>
    `"${String(str).replace(/"/g, '""')}"`;
  const header = [
    "Venue",
    "City",
    "Config Rate (%)",
    "Bookings",
    "GMV",
    "Commission",
    "Effective Rate (%)",
  ];
  const rows = data.venues.map((row: any) => [
    escapeCsv(row.venueName),
    escapeCsv(row.city),
    row.commissionRate,
    row.bookings,
    row.gmv,
    row.commission,
    row.effectiveRate,
  ]);
  const totalRow = [
    escapeCsv("Total"),
    escapeCsv(""),
    "",
    data.totalBookings,
    data.totalGmv,
    data.totalCommission,
    data.avgCommissionRate,
  ];
  const csvContent = [header, ...rows, totalRow]
    .map((r) => r.join(","))
    .join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    `commission-report-${preset.toLowerCase().replace(/\s+/g, "-")}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

$effect(() => {
  if (authStore.isInitialized && authStore.user) {
    loadCommissionReport();
  }
});
</script>

<svelte:head>
  <title>Commission Report | PadelHive Admin</title>
</svelte:head>

<div class="flex flex-1 flex-col px-6 pb-6 pt-element lg:px-8 lg:pb-8 pt-8">
  <!-- Header -->
  <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <p class="caption text-[#E6FA50]">Financial</p>
      <h1 class="heading-1 mt-2 text-[#F7F7F7]">
        Commission <span class="text-[#E6FA50]">Report</span>
      </h1>
    </div>
    {#if data && data.venues && data.venues.length > 0}
      <button
        type="button"
        onclick={exportCsv}
        class="label btn-lime inline-flex h-11 w-full items-center justify-center rounded-xl px-6 sm:h-10 sm:w-auto"
      >
        Export CSV
      </button>
    {/if}
  </div>

  <!-- Filter Tabs -->
  <FilterTabs
    tabs={PERIOD_TABS}
    activeValue={preset}
    onChange={(val) => handlePresetChange(val as PeriodPreset)}
  />

  {#if isLoading}
    <div class="space-y-6">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {#each Array.from({ length: 4 }) as _, i}
          <div
            class="h-24 animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]"
          ></div>
        {/each}
      </div>
      <div class="h-56 animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]"></div>
      <div class="h-64 animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]"></div>
    </div>
  {:else if data && data.venues && data.venues.length === 0}
    <EmptyState
      icon={Coins}
      title="No commission data"
      description="No completed bookings in this period."
      actionLabel="Refresh"
      onAction={loadCommissionReport}
    />
  {:else if data}
    <div class="space-y-6">
      <!-- 4 KPI Cards -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5">
          <p class="caption text-[#F7F7F7]/40">Total Commission</p>
          <p class="price mt-2 text-[#E6FA50]">
            {formatIDR(data.totalCommission || 0)}
          </p>
        </div>
        <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5">
          <p class="caption text-[#F7F7F7]/40">Total GMV</p>
          <p class="price mt-2 text-[#F7F7F7]">
            {formatIDR(data.totalGmv || 0)}
          </p>
        </div>
        <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5">
          <p class="caption text-[#F7F7F7]/40">Avg Commission Rate</p>
          <p class="price mt-2 text-[#F7F7F7]">
            {data.avgCommissionRate || 0}%
          </p>
        </div>
        <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5">
          <p class="caption text-[#F7F7F7]/40">Total Bookings</p>
          <p class="price mt-2 text-[#F7F7F7]">{data.totalBookings || 0}</p>
        </div>
      </div>

      <!-- Monthly Commission Chart Card -->
      {#if data.monthlySeries && data.monthlySeries.length > 0}
        <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5">
          <p class="body font-medium text-[#F7F7F7] mb-4">
            Monthly Commission
          </p>
          <div class="flex h-48 items-end gap-2 overflow-x-auto no-scrollbar pt-10 sm:gap-4">
            {#each data.monthlySeries as m (m.month)}
              {@const maxComm = Math.max(...data.monthlySeries.map((x: any) => x.commission), 1)}
              {@const heightPct = Math.max((m.commission / maxComm) * 100, 1)}
              {@const monthLabel = new Date(`${m.month}-01T00:00:00Z`).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" })}
              <div class="flex h-full w-12 flex-shrink-0 flex-col justify-end gap-2 sm:w-16">
                <div class="group relative flex w-full flex-1 flex-col justify-end">
                  <div class="absolute -top-10 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded border border-white/[0.06] bg-[#0C1B26] px-2 py-1 text-xs text-[#F7F7F7] opacity-0 transition-opacity group-hover:opacity-100">
                    {formatIDR(m.commission)}
                  </div>
                  <div
                    class="w-full rounded-t bg-[#E6FA50] transition-all"
                    style="height: {heightPct}%"
                  ></div>
                </div>
                <div class="text-center text-xs text-[#F7F7F7]/40">
                  {monthLabel}
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Venue Commission Breakdown Table -->
      <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] overflow-x-auto no-scrollbar">
        <div class="min-w-[800px] p-4">
          <div class="grid grid-cols-12 gap-4 px-4 py-3 caption uppercase text-[#F7F7F7]/40 font-medium">
            <div class="col-span-4">Venue</div>
            <div class="col-span-2 text-right">Config Rate</div>
            <div class="col-span-1 text-right">Bookings</div>
            <div class="col-span-2 text-right">GMV</div>
            <div class="col-span-2 text-right">Commission</div>
            <div class="col-span-1 text-right">Effective Rate</div>
          </div>
          <div class="space-y-2">
            {#each data.venues as row (row.venueId || row.venueName)}
              <div class="grid grid-cols-12 items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                <div class="col-span-4 min-w-0">
                  <p class="body-sm truncate text-[#F7F7F7] font-medium">
                    {row.venueName}
                  </p>
                  <p class="truncate caption text-[#F7F7F7]/40 mt-0.5">
                    {row.city}
                  </p>
                </div>
                <div class="col-span-2 text-right">
                  <p class="body-sm text-[#F7F7F7]/60">
                    {row.commissionRate}%
                  </p>
                </div>
                <div class="col-span-1 text-right">
                  <p class="body-sm text-[#F7F7F7]/60">
                    {row.bookings}
                  </p>
                </div>
                <div class="col-span-2 text-right">
                  <p class="price text-[#F7F7F7]">
                    {formatIDR(row.gmv)}
                  </p>
                </div>
                <div class="col-span-2 text-right">
                  <p class="price text-[#E6FA50]">
                    {formatIDR(row.commission)}
                  </p>
                </div>
                <div class="col-span-1 text-right">
                  <p class="body-sm text-[#F7F7F7]/60">
                    {row.effectiveRate}%
                  </p>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
