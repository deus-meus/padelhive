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
import { onMount } from "svelte";
import { api } from "$lib/api/client";
import { authStore } from "$lib/auth/store.svelte";

let data = $state<any | null>(null);
let isLoading = $state(true);
let isError = $state(false);

const user = $derived(authStore.user);
const firstName = $derived(user?.name?.split(" ")[0] ?? "there");

async function loadDashboard() {
  isLoading = true;
  isError = false;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
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

onMount(() => {
  loadDashboard();
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
    {#if data}
      <p class="body mt-3 text-[#F7F7F7]/40">
        Your venues generated{" "}
        <span class="price text-[#50C8C8]">
          Rp {(data.kpis.weeklyRevenue / 1000).toFixed(0)}K
        </span>{" "}
        this week.
      </p>
    {/if}
  </section>

  {#if isLoading}
    <section class="container pb-component">
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {#each Array.from({ length: 5 }) as _, i}
          <div
            class="h-[120px] animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]"
          ></div>
        {/each}
      </div>
    </section>
  {:else if data}
    <!-- KPIs -->
    <section class="container pb-component">
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <div
          class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6"
        >
          <div class="flex items-center justify-between">
            <DollarSign class="h-4 w-4 text-[#50C8C8]" />
          </div>
          <p class="metric mt-3 text-[#F7F7F7]">
            Rp {(data.kpis.weeklyRevenue / 1000).toFixed(0)}K
          </p>
          <p class="caption mt-1 text-[#F7F7F7]/25">Revenue</p>
        </div>

        <div
          class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6"
        >
          <div class="flex items-center justify-between">
            <CalendarDays class="h-4 w-4 text-[#50C8C8]" />
          </div>
          <p class="metric mt-3 text-[#F7F7F7]">{data.kpis.weeklyBookings}</p>
          <p class="caption mt-1 text-[#F7F7F7]/25">Bookings</p>
        </div>

        <div
          class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6"
        >
          <div class="flex items-center justify-between">
            <TrendingUp class="h-4 w-4 text-[#50C8C8]" />
          </div>
          <p class="metric mt-3 text-[#F7F7F7]">{data.kpis.occupancyRate}%</p>
          <p class="caption mt-1 text-[#F7F7F7]/25">Occupancy</p>
        </div>

        <div
          class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6"
        >
          <div class="flex items-center justify-between">
            <Building2 class="h-4 w-4 text-[#50C8C8]" />
          </div>
          <p class="metric mt-3 text-[#F7F7F7]">{data.kpis.activeCourts}</p>
          <p class="caption mt-1 text-[#F7F7F7]/25">Active Courts</p>
        </div>

        <div
          class="rounded-2xl border border-[#50C8C8]/20 bg-[#50C8C8]/5 p-6"
        >
          <div class="flex items-center justify-between">
            <Clock class="h-4 w-4 text-[#50C8C8]" />
          </div>
          <p class="metric mt-3 text-[#F7F7F7]">{data.kpis.pendingPayments}</p>
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
              <p class="section-label">Revenue This Week</p>
              <p class="metric mt-3 text-[#F7F7F7]">
                Rp {(data.kpis.weeklyRevenue / 1000).toFixed(0)}K
              </p>
            </div>
            <div class="flex gap-1">
              <button
                type="button"
                class="label rounded-lg bg-[#E6FA50]/10 px-3 py-1.5 text-[#E6FA50]"
              >
                Weekly
              </button>
              <button
                type="button"
                class="label rounded-lg bg-white/[0.03] px-3 py-1.5 text-[#F7F7F7]/25"
              >
                Monthly
              </button>
            </div>
          </div>

          <div class="mt-10 flex h-40 items-end gap-2">
            {#each data.revenueSeries as d, i}
              <div class="flex flex-1 flex-col items-center gap-2">
                <div
                  class="w-full rounded-md bg-[#E6FA50]/15 transition-colors duration-200 hover:bg-[#E6FA50]/30"
                  style="height: {(d.value / maxRevenue) * 140}px"
                ></div>
                <span class="caption text-[#F7F7F7]/25">{d.label}</span>
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
            {#each data.courtUtilization.slice(0, 5) as court}
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
            {#if data.courtUtilization.length === 0}
              <p class="body text-[#F7F7F7]/40">No active courts.</p>
            {/if}
          </div>

          <div class="mt-8 border-t border-white/[0.04] pt-5">
            <p class="caption text-[#F7F7F7]/25">Average occupancy</p>
            <p class="metric mt-1 text-[#E6FA50]">
              {data.kpis.occupancyRate}%
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
            {data.todaysSchedule.length} bookings
          </span>
        </div>

        <div class="space-y-0">
          {#if data.todaysSchedule.length === 0}
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
                  {slot.status.replace(/_/g, " ")}
                </span>
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
          href="/dashboard"
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
          href="/dashboard"
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
          href="/dashboard"
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
          href="/venues"
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