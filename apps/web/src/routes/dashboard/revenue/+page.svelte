<script lang="ts">
import { CalendarDays, DollarSign, TrendingUp, Users } from "lucide-svelte";
import { onMount } from "svelte";
import { api } from "$lib/api/client";
import { authStore } from "$lib/auth/store.svelte";
import EmptyState from "$lib/components/ui/empty-state.svelte";

type Period = "weekly" | "monthly";

let period = $state<Period>("monthly");
let data = $state<any | null>(null);
let isLoading = $state(true);

function formatIDR(amount: number): string {
  return `Rp ${(amount / 1000000).toFixed(1)}M`;
}

async function loadRevenueData() {
  if (!authStore.firebaseUser) return;
  isLoading = true;
  try {
    const token = await authStore.firebaseUser.getIdToken();
    if (!token) return;

    const res = await api.bookings["owner-dashboard"].get({
      headers: { authorization: `Bearer ${token}` },
    });
    if (res.data) {
      data = res.data;
    }
  } catch (e) {
    console.warn("Owner revenue fetch error:", e);
  } finally {
    isLoading = false;
  }
}

$effect(() => {
  if (authStore.isInitialized && authStore.user && authStore.firebaseUser) {
    loadRevenueData();
  }
});
</script>

<svelte:head>
  <title>Revenue | Padelhive Owner</title>
</svelte:head>

<div class="py-8">
  <section class="container">
    <!-- Header -->
    <div>
      <h1 class="heading-1 text-[#F7F7F7]">Revenue</h1>
      <p class="body mt-1 text-[#F7F7F7]/40">
        Financial overview and booking statistics
      </p>
    </div>

    {#if isLoading || !authStore.isInitialized || authStore.isLoading}
      <div class="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {#each Array.from({ length: 4 }) as _, i}
          <div class="h-[120px] animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]"></div>
        {/each}
      </div>
      <div class="mt-8 h-[360px] animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]"></div>
    {:else if !data}
      <div class="mt-8">
        <EmptyState
          icon={TrendingUp}
          title="No revenue data yet"
          description="Once your venues start taking bookings, revenue analytics will show up here."
          actionLabel="Refresh"
          onAction={loadRevenueData}
        />
      </div>
    {:else}
      {@const chartData = data.revenueSeries || []}
      {@const maxValue = Math.max(...chartData.map((d: any) => d.value), 1)}
      {@const totalRevenue = data.kpis?.weeklyRevenue || 0}

      <!-- Revenue Cards -->
      <div class="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5">
          <div class="flex items-center justify-between">
            <DollarSign class="h-4 w-4 text-[#50C8C8]" />
          </div>
          <p class="metric mt-3 text-[#F7F7F7]">{formatIDR(totalRevenue)}</p>
          <p class="caption mt-1 text-[#F7F7F7]/25">Total Revenue</p>
        </div>

        <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5">
          <div class="flex items-center justify-between">
            <TrendingUp class="h-4 w-4 text-[#50C8C8]" />
          </div>
          <p class="metric mt-3 text-[#F7F7F7]">{data.kpis?.occupancyRate || 0}%</p>
          <p class="caption mt-1 text-[#F7F7F7]/25">Occupancy Rate</p>
        </div>

        <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5">
          <div class="flex items-center justify-between">
            <CalendarDays class="h-4 w-4 text-[#50C8C8]" />
          </div>
          <p class="metric mt-3 text-[#F7F7F7]">{data.kpis?.weeklyBookings || 0}</p>
          <p class="caption mt-1 text-[#F7F7F7]/25">Total Bookings</p>
        </div>

        <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5">
          <div class="flex items-center justify-between">
            <Users class="h-4 w-4 text-[#50C8C8]" />
          </div>
          <p class="metric mt-3 text-[#F7F7F7]">{data.kpis?.activeCourts || 0}</p>
          <p class="caption mt-1 text-[#F7F7F7]/25">Active Courts</p>
        </div>
      </div>

      <!-- Revenue Chart Card -->
      <div class="mt-8 rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 md:p-8">
        <div class="flex items-start justify-between">
          <div>
            <p class="section-label">Revenue Overview</p>
            <p class="metric mt-3 text-[#F7F7F7]">
              {formatIDR(totalRevenue)}
            </p>
            <p class="body-sm mt-1 text-[#F7F7F7]/25">
              {period === "monthly" ? "This year" : "This week"}
            </p>
          </div>
          <div class="flex gap-1">
            <button
              type="button"
              onclick={() => (period = "weekly")}
              class="label rounded-lg px-3 py-1.5 transition-all {period === 'weekly'
                ? 'bg-[#E6FA50]/10 text-[#E6FA50]'
                : 'bg-white/[0.03] text-[#F7F7F7]/25 hover:text-[#F7F7F7]/60'}"
            >
              Weekly
            </button>
            <button
              type="button"
              onclick={() => (period = "monthly")}
              class="label rounded-lg px-3 py-1.5 transition-all {period === 'monthly'
                ? 'bg-[#E6FA50]/10 text-[#E6FA50]'
                : 'bg-white/[0.03] text-[#F7F7F7]/25 hover:text-[#F7F7F7]/60'}"
            >
              Monthly
            </button>
          </div>
        </div>

        <!-- Bar chart -->
        <div class="mt-10 flex h-48 items-end gap-2">
          {#each chartData as d (d.label)}
            <div class="flex flex-1 flex-col items-center gap-2">
              <div class="relative w-full group">
                <div
                  class="w-full rounded-md bg-[#E6FA50]/15 transition-all duration-200 hover:bg-[#E6FA50]/30"
                  style="height: {(d.value / maxValue) * 180}px"
                ></div>
                <div class="caption absolute -top-8 left-1/2 -translate-x-1/2 rounded-md bg-[#0C1B26] border border-white/[0.08] px-2 py-1 text-[#E6FA50] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {formatIDR(d.value)}
                </div>
              </div>
              <span class="caption text-[#F7F7F7]/25">{d.label}</span>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </section>
</div>
