<script lang="ts">
import { BarChart3 } from "lucide-svelte";
import { onMount } from "svelte";
import { api } from "$lib/api/client";
import { authStore } from "$lib/auth/store.svelte";
import EmptyState from "$lib/components/ui/empty-state.svelte";

function formatIDR(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

let data = $state<any | null>(null);
let isLoading = $state(true);

async function loadMetrics() {
  isLoading = true;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    const res = await api.admin.metrics.get({
      headers: { authorization: `Bearer ${token}` },
    });
    if (res.data) {
      data = res.data;
    }
  } catch (e) {
    console.warn("Admin metrics fetch error:", e);
  } finally {
    isLoading = false;
  }
}

$effect(() => {
  if (authStore.isInitialized && authStore.user) {
    loadMetrics();
  }
});
</script>

<svelte:head>
  <title>Metrics Report | PadelHive Admin</title>
</svelte:head>

<div class="flex flex-1 flex-col px-6 pb-6 pt-element lg:px-8 lg:pb-8 pt-8">
  <!-- Header -->
  <div class="mb-8">
    <p class="caption text-[#E6FA50]">Platform</p>
    <h1 class="heading-1 mt-2 text-[#F7F7F7]">
      Metrics <span class="text-[#E6FA50]">Report</span>
    </h1>
  </div>

  {#if isLoading}
    <div class="space-y-6">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {#each Array.from({ length: 4 }) as _, i}
          <div
            class="h-24 animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]"
          ></div>
        {/each}
      </div>
      <div class="grid gap-6 lg:grid-cols-3">
        <div class="col-span-2 h-[400px] animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]"></div>
        <div class="h-[400px] animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]"></div>
      </div>
    </div>
  {:else if data && data.totalBookings === 0}
    <EmptyState
      icon={BarChart3}
      title="No metrics data"
      description="No bookings have been made yet."
      actionLabel="Refresh"
      onAction={loadMetrics}
    />
  {:else if data}
    {@const maxGmv = Math.max(...(data.monthlySeries || []).map((m: any) => m.gmv), 1)}
    {@const totalStatusCount = (data.statusBreakdown || []).reduce((sum: number, s: any) => sum + s.count, 0)}

    <div class="space-y-6">
      <!-- 4 Top KPI Cards -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5">
          <p class="caption text-[#F7F7F7]/40">Total GMV</p>
          <p class="price mt-2 text-[#F7F7F7]">
            {formatIDR(data.totalGmv || 0)}
          </p>
        </div>
        <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5">
          <p class="caption text-[#F7F7F7]/40">Total Commission</p>
          <p class="price mt-2 text-[#E6FA50]">
            {formatIDR(data.totalCommission || 0)}
          </p>
        </div>
        <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5">
          <p class="caption text-[#F7F7F7]/40">Total Bookings</p>
          <p class="price mt-2 text-[#F7F7F7]">{data.totalBookings || 0}</p>
        </div>
        <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5">
          <p class="caption text-[#F7F7F7]/40">Avg Monthly GMV</p>
          <p class="price mt-2 text-[#F7F7F7]">
            {formatIDR(data.avgMonthlyGmv || 0)}
          </p>
        </div>
      </div>

      <!-- 2 Column Chart & Breakdown -->
      <div class="grid gap-6 lg:grid-cols-3">
        <!-- 12-Month GMV Trend (2 cols) -->
        <div class="col-span-2 min-w-0 rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
          <p class="section-label mb-6">12-Month GMV Trend</p>
          <div class="overflow-x-auto pb-2">
            <div class="flex h-64 min-w-[500px] items-end justify-between gap-2 md:gap-4">
              {#each (data.monthlySeries || []) as m (m.month)}
                {@const heightPct = maxGmv > 0 ? (m.gmv / maxGmv) * 100 : 0}
                {@const monthName = new Date(`${m.month}-01T00:00:00Z`).toLocaleDateString("en-US", { month: "short", timeZone: "UTC" })}
                <div class="group relative flex w-full flex-col items-center justify-end h-full">
                  <div
                    class="w-full max-w-[40px] rounded-t-sm bg-[#E6FA50] transition-all hover:bg-[#E6FA50]/80"
                    style="height: {heightPct}%; min-height: {heightPct > 0 ? '4px' : '0'}"
                  ></div>
                  <p class="caption mt-3 text-[#F7F7F7]/40">
                    {monthName}
                  </p>
                  <!-- Tooltip -->
                  <div class="caption absolute -top-12 hidden whitespace-nowrap rounded-lg bg-white/[0.1] px-3 py-1.5 text-[#F7F7F7] backdrop-blur-md group-hover:block z-10">
                    {formatIDR(m.gmv)}
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>

        <!-- Status Breakdown (1 col) -->
        <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
          <p class="section-label mb-6">Status Breakdown</p>
          <div class="space-y-5">
            {#each (data.statusBreakdown || []) as s (s.status)}
              {@const pct = totalStatusCount > 0 ? (s.count / totalStatusCount) * 100 : 0}
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="caption text-[#F7F7F7]/60">
                    {s.status}
                  </span>
                  <span class="body-sm text-[#F7F7F7] font-medium">{s.count}</span>
                </div>
                <div class="h-2 w-full overflow-hidden rounded-full bg-white/[0.04]">
                  <div
                    class="h-full bg-[#E6FA50] transition-all"
                    style="width: {pct}%"
                  ></div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
