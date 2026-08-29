<script lang="ts">
import { Calendar, DollarSign, LayoutGrid, TrendingUp } from "lucide-svelte";
import { onMount } from "svelte";
import { api } from "$lib/api/client";
import { authStore } from "$lib/auth/store.svelte";
import Card from "$lib/components/ui/card.svelte";
import Skeleton from "$lib/components/ui/skeleton.svelte";

let data = $state<any | null>(null);
let isLoading = $state(true);

async function loadDashboard() {
  isLoading = true;
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
  } finally {
    isLoading = false;
  }
}

onMount(() => {
  loadDashboard();
});
</script>

<svelte:head>
  <title>Owner Dashboard - Padelhive</title>
</svelte:head>

<div class="py-12 bg-[#06121A]">
  <div class="container space-y-8">
    <div>
      <h1 class="text-3xl font-extrabold text-white">Owner Dashboard</h1>
      <p class="mt-1 text-xs text-white/60">Overview of venue performance, occupancy, and revenue</p>
    </div>

    {#if isLoading}
      <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
        {#each [1, 2, 3, 4] as _}
          <Card class="p-6 space-y-2">
            <Skeleton class="h-4 w-1/2" />
            <Skeleton class="h-8 w-3/4" />
          </Card>
        {/each}
      </div>
    {:else if data}
      <!-- KPIs -->
      <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card class="p-5 space-y-1">
          <span class="text-xs font-semibold text-white/50 flex items-center gap-1.5">
            <DollarSign class="h-4 w-4 text-[#E6FA50]" />
            Weekly Revenue
          </span>
          <p class="text-2xl font-extrabold text-white">
            Rp {(data.kpis.weeklyRevenue).toLocaleString("id-ID")}
          </p>
        </Card>

        <Card class="p-5 space-y-1">
          <span class="text-xs font-semibold text-white/50 flex items-center gap-1.5">
            <Calendar class="h-4 w-4 text-[#E6FA50]" />
            Weekly Bookings
          </span>
          <p class="text-2xl font-extrabold text-white">{data.kpis.weeklyBookings}</p>
        </Card>

        <Card class="p-5 space-y-1">
          <span class="text-xs font-semibold text-white/50 flex items-center gap-1.5">
            <TrendingUp class="h-4 w-4 text-[#E6FA50]" />
            Occupancy Rate
          </span>
          <p class="text-2xl font-extrabold text-[#E6FA50]">{data.kpis.occupancyRate}%</p>
        </Card>

        <Card class="p-5 space-y-1">
          <span class="text-xs font-semibold text-white/50 flex items-center gap-1.5">
            <LayoutGrid class="h-[#4] w-4 text-[#E6FA50]" />
            Active Courts
          </span>
          <p class="text-2xl font-extrabold text-white">{data.kpis.activeCourts}</p>
        </Card>
      </div>

      <!-- Court Utilization -->
      <Card class="p-6 space-y-4">
        <h3 class="text-base font-bold text-white">Court Utilization</h3>
        <div class="space-y-3">
          {#each data.courtUtilization as court}
            <div class="space-y-1">
              <div class="flex justify-between text-xs">
                <span class="font-medium text-white/80">{court.name}</span>
                <span class="font-semibold text-[#E6FA50]">{court.occupancyRate}%</span>
              </div>
              <div class="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div class="h-full bg-[#E6FA50] transition-all" style="width: {court.occupancyRate}%"></div>
              </div>
            </div>
          {/each}
        </div>
      </Card>
    {/if}
  </div>
</div>
