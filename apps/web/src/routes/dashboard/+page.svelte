<script lang="ts">
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Clock,
  DollarSign,
  Plus,
  Tag,
  TrendingUp,
} from "lucide-svelte";
import { api } from "$lib/api/client";
import { authStore } from "$lib/auth/store.svelte";

let period = $state<"weekly" | "monthly">("weekly");
let data = $state<any | null>(null);
let isLoading = $state(true);
let isError = $state(false);

const user = $derived(authStore.user);
const firstName = $derived(user?.name?.split(" ")[0] ?? "there");

async function loadDashboard() {
  if (!authStore.firebaseUser) return;
  isLoading = true;
  isError = false;
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
    console.warn("Owner dashboard error:", e);
    isError = true;
  } finally {
    isLoading = false;
  }
}

$effect(() => {
  if (authStore.isInitialized && authStore.user && authStore.firebaseUser) {
    loadDashboard();
  }
});

const maxRevenue = $derived(
  data?.revenueSeries
    ? Math.max(...data.revenueSeries.map((d: any) => d.value), 1)
    : 1,
);
</script>

<svelte:head>
  <title>Owner Dashboard - Padelhive</title>
</svelte:head>

<div class="pt-element pb-component">
  <!-- WELCOME -->
  <section class="container pb-component pt-8">
    <p class="caption text-[#F7F7F7]/25">Good morning</p>
    <h1 class="heading-1 mt-2 text-[#F7F7F7]">
      Welcome back, <span class="text-[#E6FA50]">{firstName}</span>
    </h1>
    {#if data && data.kpis}
      <p class="body mt-3 text-[#F7F7F7]/40">
        Your venues generated{" "}
        <span class="price text-[#50C8C8]">
          Rp {((data.kpis.weeklyRevenue || 0) / 1000).toFixed(0)}K
        </span>{" "}
        this week.
      </p>
    {/if}
  </section>

  {#if isLoading || !authStore.isInitialized || authStore.isLoading}
    <!-- Full 1:1 Owner Skeleton UI -->
    <!-- KPIs Skeleton -->
    <section class="container pb-component">
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {#each Array.from({ length: 5 }) as _, i}
          <div
            class="h-[120px] animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]"
          ></div>
        {/each}
      </div>
    </section>

    <!-- Revenue + Utilization Skeleton -->
    <section class="container pb-component">
      <div class="grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr]">
        <div class="h-[300px] animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]"></div>
        <div class="h-[300px] animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]"></div>
      </div>
    </section>

    <!-- Today's Schedule Skeleton -->
    <section class="container pb-component">
      <div class="h-[200px] animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]"></div>
    </section>

    <!-- Recent Bookings Skeleton -->
    <section class="container pb-component">
      <div class="h-[250px] animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]"></div>
    </section>

    <!-- Quick Actions Skeleton -->
    <section class="container pb-component">
      <div class="mb-5 h-5 w-24 animate-pulse rounded-md bg-white/[0.04]"></div>
      <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
        {#each Array.from({ length: 4 }) as _, i}
          <div
            class="h-[104px] animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]"
          ></div>
        {/each}
      </div>
    </section>
  {:else if data}
    {@const totalRev = data.kpis?.weeklyRevenue ?? 0}
    {@const months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"]}
    {@const monthlySeries = (data.monthlySeries && data.monthlySeries.length > 0)
      ? data.monthlySeries
      : months.map((m) => ({ label: m, value: 0 }))}
    {@const weeklySeries = data.revenueSeries || []}
    {@const chartData = period === "monthly" ? monthlySeries : weeklySeries}
    {@const maxVal = Math.max(...chartData.map((d: any) => d.value), 1)}

    <!-- KPIs -->
    <section class="container pb-component">
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <div
          class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6"
        >
          <div class="flex items-center justify-between">
            <DollarSign class="h-4 w-4 text-[#E6FA50]" />
          </div>
          <p class="metric mt-3 text-[#F7F7F7]">
            Rp {((data.kpis?.weeklyRevenue || 0) / 1000).toFixed(0)}K
          </p>
          <p class="caption mt-1 text-[#F7F7F7]/25">Revenue</p>
        </div>

        <div
          class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6"
        >
          <div class="flex items-center justify-between">
            <CalendarDays class="h-4 w-4 text-[#E6FA50]" />
          </div>
          <p class="metric mt-3 text-[#F7F7F7]">{data.kpis?.weeklyBookings || 0}</p>
          <p class="caption mt-1 text-[#F7F7F7]/25">Bookings</p>
        </div>

        <div
          class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6"
        >
          <div class="flex items-center justify-between">
            <TrendingUp class="h-4 w-4 text-[#E6FA50]" />
          </div>
          <p class="metric mt-3 text-[#F7F7F7]">{data.kpis?.occupancyRate || 0}%</p>
          <p class="caption mt-1 text-[#F7F7F7]/25">Occupancy</p>
        </div>

        <div
          class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6"
        >
          <div class="flex items-center justify-between">
            <Building2 class="h-4 w-4 text-[#E6FA50]" />
          </div>
          <p class="metric mt-3 text-[#F7F7F7]">{data.kpis?.activeCourts || 0}</p>
          <p class="caption mt-1 text-[#F7F7F7]/25">Active Courts</p>
        </div>

        <div
          class="rounded-2xl border border-[#E6FA50]/20 bg-[#E6FA50]/5 p-6"
        >
          <div class="flex items-center justify-between">
            <Clock class="h-4 w-4 text-[#50C8C8]" />
          </div>
          <p class="metric mt-3 text-[#F7F7F7]">{data.kpis?.pendingPayments || 0}</p>
          <p class="caption mt-1 text-[#F7F7F7]/25">Pending Payments</p>
        </div>
      </div>
    </section>

    <!-- REVENUE + UTILIZATION -->
    <section class="container pb-component">
      <div class="grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr]">
        <!-- Revenue chart -->
        <div
          class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-8"
        >
          <div class="flex items-start justify-between">
            <div>
              <p class="section-label">{period === "monthly" ? "Revenue Overview" : "Revenue This Week"}</p>
              <p class="metric mt-3 text-[#F7F7F7]">
                Rp {((data.kpis?.weeklyRevenue || 0) / 1000).toFixed(0)}K
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

          <div class="mt-10 flex h-44 items-end justify-between gap-2 overflow-x-auto pb-2 no-scrollbar sm:gap-3">
            {#each chartData as d (d.label)}
              {@const barHeight = maxVal > 0 ? Math.max((d.value / maxVal) * 140, 0) : 0}
              <div class="flex flex-1 flex-col items-center gap-2 min-w-[24px]">
                <div class="group relative flex w-full flex-col justify-end items-center h-36">
                  {#if d.value > 0}
                    <div
                      class="w-full max-w-[40px] rounded-t-lg bg-[#E6FA50]/75 transition-all duration-200 hover:bg-[#E6FA50]"
                      style="height: {barHeight}px"
                    ></div>
                    <div class="caption absolute -top-8 left-1/2 -translate-x-1/2 rounded-md bg-[#06121A] border border-white/[0.08] px-2 py-1 text-xs text-[#E6FA50] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-xl">
                      Rp {(d.value / 1000).toFixed(0)}K
                    </div>
                  {/if}
                </div>
                <span class="caption text-xs text-[#F7F7F7]/40 font-medium">{d.label}</span>
              </div>
            {/each}
          </div>
        </div>

        <!-- Court utilization -->
        <div
          class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-8"
        >
          <p class="section-label">Court Utilization</p>

          <div class="mt-8 space-y-5">
            {#each (data.courtUtilization || []).slice(0, 5) as court}
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <span class="label text-[#F7F7F7]/40">{court.name}</span>
                  <span class="metric text-[#E6FA50]"
                    >{court.occupancyRate}%</span
                  >
                </div>
                <div
                  class="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.04]"
                >
                  <div
                    class="h-full rounded-full bg-[#E6FA50]/70"
                    style="width: {court.occupancyRate}%"
                  ></div>
                </div>
              </div>
            {/each}
            {#if !data.courtUtilization || data.courtUtilization.length === 0}
              <p class="body text-[#F7F7F7]/40">No active courts.</p>
            {/if}
          </div>

          <div class="mt-8 border-t border-white/[0.04] pt-5">
            <p class="caption text-[#F7F7F7]/25">Average occupancy</p>
            <p class="metric mt-1 text-[#E6FA50]">
              {data.kpis?.occupancyRate || 0}%
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- TODAY'S SCHEDULE -->
    <section class="container pb-component">
      <div
        class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-8"
      >
        <div class="flex items-center justify-between mb-6">
          <p class="section-label">Today's Schedule</p>
          <span class="caption text-[#F7F7F7]/25">
            {data.todaysSchedule?.length || 0} bookings
          </span>
        </div>

        <div class="space-y-0">
          {#if !data.todaysSchedule || data.todaysSchedule.length === 0}
            <p class="body text-[#F7F7F7]/40">No bookings today.</p>
          {:else}
            {#each data.todaysSchedule as slot}
              {@const isConfirmed = slot.status === "CONFIRMED"}
              <div
                class="flex items-center gap-5 border-b border-white/[0.03] py-3.5 last:border-0"
              >
                <span class="metric w-12 shrink-0 text-[#F7F7F7]/40">
                  {slot.time}
                </span>
                <div
                  class="h-2.5 w-2.5 shrink-0 rounded-full {isConfirmed
                    ? 'bg-[#E6FA50]'
                    : 'border-2 border-[#50C8C8] bg-transparent'}"
                ></div>
                <div class="flex-1">
                  <p class="heading-3 text-[#F7F7F7]">{slot.player}</p>
                  <p class="caption text-[#F7F7F7]/25">{slot.court}</p>
                </div>
                <span
                  class="caption rounded-full px-2 py-0.5 uppercase {isConfirmed
                    ? 'bg-[#E6FA50]/10 text-[#E6FA50]'
                    : 'bg-[#50C8C8]/10 text-[#50C8C8]'}"
                >
                  {slot.status ? slot.status.replace(/_/g, " ") : "CONFIRMED"}
                </span>
              </div>
            {/each}
          {/if}
        </div>
      </div>
    </section>

    <!-- RECENT BOOKINGS -->
    <section class="container pb-component">
      <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-8">
        <div class="flex items-center justify-between mb-6">
          <p class="section-label">Recent Bookings</p>
          <a
            href="/dashboard/bookings"
            class="group flex items-center gap-1 caption text-[#F7F7F7]/25 transition-colors hover:text-[#E6FA50]"
          >
            View all
            <ArrowRight class="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>

        <div class="space-y-2">
          {#if !data.recentBookings || data.recentBookings.length === 0}
            <p class="body text-[#F7F7F7]/40">No recent bookings.</p>
          {:else}
            {#each data.recentBookings as booking (booking.id)}
              {@const isConfirmed = booking.status === "CONFIRMED"}
              {@const isPending = booking.status === "PENDING_PAYMENT"}
              <div
                class="flex items-center gap-4 rounded-lg bg-white/[0.02] p-3.5 transition-colors hover:bg-white/[0.04]"
              >
                <div class="flex-1 min-w-0">
                  <p class="heading-3 truncate text-[#F7F7F7]">
                    {booking.venueName}
                  </p>
                  <p class="caption mt-0.5 text-[#F7F7F7]/25">
                    {booking.courtName} · {booking.bookingDate} · {booking.time}
                  </p>
                </div>
                <p class="price shrink-0 text-[#F7F7F7]/60">
                  Rp {((booking.finalAmount || 0) / 1000).toFixed(0)}K
                </p>
                <div
                  class="h-2 w-2 shrink-0 rounded-full {isConfirmed
                    ? 'bg-[#E6FA50]'
                    : isPending
                      ? 'bg-[#50C8C8]'
                      : 'bg-[#F7F7F7]/25'}"
                ></div>
              </div>
            {/each}
          {/if}
        </div>
      </div>
    </section>

    <!-- QUICK ACTIONS -->
    <section class="container pb-component">
      <p class="section-label mb-5">Quick Actions</p>
      <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
        <a
          href="/dashboard/courts"
          class="flex flex-col items-center gap-3 rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 transition-all duration-200 hover:border-[#E6FA50]/20 hover:bg-[#E6FA50]/5"
        >
          <div
            class="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E6FA50]/10"
          >
            <Plus class="h-4 w-4 text-[#E6FA50]" />
          </div>
          <span class="caption text-[#F7F7F7]/40">Add Court</span>
        </a>

        <a
          href="/dashboard/revenue"
          class="flex flex-col items-center gap-3 rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 transition-all duration-200 hover:border-[#E6FA50]/20 hover:bg-[#E6FA50]/5"
        >
          <div
            class="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E6FA50]/10"
          >
            <Tag class="h-4 w-4 text-[#E6FA50]" />
          </div>
          <span class="caption text-[#F7F7F7]/40">Create Promo</span>
        </a>

        <a
          href="/dashboard/hours"
          class="flex flex-col items-center gap-3 rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 transition-all duration-200 hover:border-[#E6FA50]/20 hover:bg-[#E6FA50]/5"
        >
          <div
            class="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E6FA50]/10"
          >
            <CalendarDays class="h-4 w-4 text-[#E6FA50]" />
          </div>
          <span class="caption text-[#F7F7F7]/40">Manage Schedule</span>
        </a>

        <a
          href="/dashboard/venues"
          class="flex flex-col items-center gap-3 rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 transition-all duration-200 hover:border-[#E6FA50]/20 hover:bg-[#E6FA50]/5"
        >
          <div
            class="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E6FA50]/10"
          >
            <Building2 class="h-4 w-4 text-[#E6FA50]" />
          </div>
          <span class="caption text-[#F7F7F7]/40">View Venues</span>
        </a>
      </div>
    </section>
  {/if}
</div>
