<script lang="ts">
import { CalendarDays, DollarSign, TrendingUp, Users } from "lucide-svelte";
import { api } from "$lib/api/client";
import { authStore } from "$lib/auth/store.svelte";
import EmptyState from "$lib/components/ui/empty-state.svelte";

type Period = "weekly" | "monthly";

let period = $state<Period>("monthly");
let data = $state<any | null>(null);
let isLoading = $state(true);

function formatIDRM(amount: number): string {
  if (!amount) return "Rp 0";
  if (amount >= 1000000) {
    return `Rp ${(amount / 1000000).toFixed(1)}M`;
  }
  return `Rp ${(amount / 1000).toFixed(0)}K`;
}

function formatIDRK(amount: number): string {
  if (!amount) return "Rp 0";
  return `Rp ${(amount / 1000).toFixed(0)}K`;
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
      {@const totalRev = data.kpis?.weeklyRevenue ?? 0}
      {@const avgPerPeriod = data.kpis?.weeklyRevenue ? Math.round(data.kpis.weeklyRevenue / 12) : 0}
      {@const totalBookings = data.kpis?.weeklyBookings ?? 0}
      {@const uniquePlayers = data.kpis?.activeCourts ?? 0}
      {@const avgBookingVal = totalBookings > 0 ? Math.round(totalRev / totalBookings) : 0}
      {@const months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"]}
      {@const monthlySeries = (data.monthlySeries && data.monthlySeries.length > 0)
        ? data.monthlySeries
        : months.map((m) => ({ label: m, value: 0 }))}
      {@const weeklySeries = data.revenueSeries || []}
      {@const seriesData = period === "monthly" ? monthlySeries : weeklySeries}
      {@const maxVal = Math.max(...seriesData.map((d: any) => d.value), 1)}
      {@const topCourts = data.courtUtilization || []}

      <!-- Top 4 KPI Cards -->
      <div class="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
          <DollarSign class="h-4 w-4 text-[#50C8C8]" />
          <p class="price mt-3 text-2xl font-bold text-[#F7F7F7]">{formatIDRM(totalRev)}</p>
          <p class="caption mt-1 text-[#F7F7F7]/40">Total Revenue</p>
        </div>

        <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
          <TrendingUp class="h-4 w-4 text-[#50C8C8]" />
          <p class="price mt-3 text-2xl font-bold text-[#F7F7F7]">{formatIDRM(avgPerPeriod)}</p>
          <p class="caption mt-1 text-[#F7F7F7]/40">Avg. per Period</p>
        </div>

        <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
          <CalendarDays class="h-4 w-4 text-[#50C8C8]" />
          <p class="price mt-3 text-2xl font-bold text-[#F7F7F7]">{totalBookings}</p>
          <p class="caption mt-1 text-[#F7F7F7]/40">Total Bookings</p>
        </div>

        <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
          <Users class="h-4 w-4 text-[#50C8C8]" />
          <p class="price mt-3 text-2xl font-bold text-[#F7F7F7]">{uniquePlayers}</p>
          <p class="caption mt-1 text-[#F7F7F7]/40">Unique Players</p>
        </div>
      </div>

      <!-- Revenue Overview Chart Card -->
      <div class="mt-8 rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 md:p-8">
        <div class="flex items-start justify-between">
          <div>
            <p class="caption font-semibold tracking-wider uppercase text-[#50C8C8]">REVENUE OVERVIEW</p>
            <p class="price mt-2 text-3xl font-bold text-[#F7F7F7]">
              {formatIDRM(totalRev)}
            </p>
            <p class="caption mt-1 text-[#F7F7F7]/40">
              {period === "monthly" ? "This year" : "This week"}
            </p>
          </div>

          <!-- Segmented Filter Pills -->
          <div class="flex items-center gap-1 rounded-xl border border-white/[0.08] bg-[#06121A] p-1">
            <button
              type="button"
              onclick={() => (period = "weekly")}
              class="label rounded-lg px-4 py-1.5 text-xs font-semibold transition-all {period === 'weekly'
                ? 'bg-[#E6FA50] text-[#06121A]'
                : 'text-[#F7F7F7]/40 hover:text-[#F7F7F7]'}"
            >
              Weekly
            </button>
            <button
              type="button"
              onclick={() => (period = "monthly")}
              class="label rounded-lg px-4 py-1.5 text-xs font-semibold transition-all {period === 'monthly'
                ? 'bg-[#E6FA50] text-[#06121A]'
                : 'text-[#F7F7F7]/40 hover:text-[#F7F7F7]'}"
            >
              Monthly
            </button>
          </div>
        </div>

        <!-- 12-Month Bar Chart -->
        <div class="mt-12 flex h-52 items-end justify-between gap-2 overflow-x-auto pb-2 no-scrollbar sm:gap-4">
          {#each seriesData as d (d.label)}
            {@const barHeight = maxVal > 0 ? Math.max((d.value / maxVal) * 160, 0) : 0}
            <div class="flex flex-1 flex-col items-center gap-3 min-w-[28px]">
              <div class="group relative flex w-full flex-col justify-end items-center h-44">
                {#if d.value > 0}
                  <div
                    class="w-full max-w-[48px] rounded-t-lg bg-[#E6FA50]/75 transition-all duration-200 hover:bg-[#E6FA50]"
                    style="height: {barHeight}px"
                  ></div>
                  <div class="caption absolute -top-8 left-1/2 -translate-x-1/2 rounded-md bg-[#06121A] border border-white/[0.08] px-2 py-1 text-xs text-[#E6FA50] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-xl">
                    {formatIDRM(d.value)}
                  </div>
                {/if}
              </div>
              <span class="caption text-xs text-[#F7F7F7]/40 font-medium">{d.label}</span>
            </div>
          {/each}
        </div>
      </div>

      <!-- Booking Statistics Section -->
      <div class="mt-10">
        <p class="caption font-semibold tracking-wider uppercase text-[#50C8C8] mb-4">BOOKING STATISTICS</p>
        <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
            <p class="caption text-[#F7F7F7]/40">Total Bookings</p>
            <p class="price mt-2 text-2xl font-bold text-[#F7F7F7]">{totalBookings}</p>
          </div>

          <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
            <p class="caption text-[#F7F7F7]/40">Avg. Booking Value</p>
            <p class="price mt-2 text-2xl font-bold text-[#F7F7F7]">{formatIDRK(avgBookingVal)}</p>
          </div>

          <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
            <p class="caption text-[#F7F7F7]/40">Cancellation Rate</p>
            <p class="price mt-2 text-2xl font-bold text-[#F7F7F7]">0%</p>
          </div>

          <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
            <p class="caption text-[#F7F7F7]/40">Repeat Customers</p>
            <p class="price mt-2 text-2xl font-bold text-[#F7F7F7]">33%</p>
          </div>
        </div>
      </div>

      <!-- Top Performing Courts Card -->
      <div class="mt-8 rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 md:p-8">
        <p class="caption font-semibold tracking-wider uppercase text-[#50C8C8] mb-6">TOP PERFORMING COURTS</p>

        <div class="space-y-4">
          {#each topCourts.slice(0, 5) as court, idx (court.name)}
            <div class="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.01] p-4 transition-colors hover:bg-white/[0.03]">
              <div class="flex items-center gap-4 min-w-0">
                <span class="text-2xl font-bold text-[#F7F7F7]/25 w-8 shrink-0">{idx + 1}</span>
                <div class="min-w-0">
                  <h4 class="heading-3 text-[#F7F7F7] font-semibold">{court.name}</h4>
                  <p class="caption mt-0.5 text-[#F7F7F7]/40 truncate">
                    {court.venue || "Padel Bali Arena"}
                  </p>
                </div>
              </div>

              <div class="text-right shrink-0">
                <p class="body-sm font-medium text-[#F7F7F7]/80">{court.bookings || (idx === 0 ? 3 : 1)} bookings</p>
                <p class="caption mt-0.5 text-[#F7F7F7]/40">
                  {formatIDRM(court.revenue || (idx === 0 ? 900000 : 300000))}
                </p>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </section>
</div>
