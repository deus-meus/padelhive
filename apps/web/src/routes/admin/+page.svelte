<script lang="ts">
import {
  Building2,
  CalendarCheck,
  CheckCircle2,
  Clock,
  DollarSign,
  RotateCcw,
  TrendingUp,
} from "lucide-svelte";
import { api } from "$lib/api/client";
import { authStore } from "$lib/auth/store.svelte";

let data = $state<any | null>(null);
let isLoading = $state(true);

async function loadAdminOverview() {
  if (!authStore.firebaseUser) return;
  isLoading = true;
  try {
    const token = await authStore.firebaseUser.getIdToken();
    if (!token) return;

    const res = await api.admin.overview.get({
      headers: { authorization: `Bearer ${token}` },
    });
    if (res.data) {
      data = res.data;
    }
  } catch (e) {
    console.warn("Admin overview fetch error:", e);
  } finally {
    isLoading = false;
  }
}

$effect(() => {
  if (authStore.isInitialized && authStore.user && authStore.firebaseUser) {
    loadAdminOverview();
  }
});

function formatCurrency(amount: number): string {
  if (!amount) return "Rp 0";
  if (amount >= 1_000_000_000)
    return `Rp ${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `Rp ${(amount / 1_000).toFixed(0)}K`;
  return `Rp ${amount}`;
}
</script>

<svelte:head>
  <title>Operations Overview | PadelHive Admin</title>
</svelte:head>

<div class="px-6 pb-6 pt-element lg:px-8 lg:pb-8 pt-8">
  <div class="mb-8">
    <p class="caption text-[#F7F7F7]/25">Marketplace Admin</p>
    <h1 class="heading-1 mt-2 text-2xl text-[#F7F7F7] md:text-3xl">
      Operations <span class="text-[#E6FA50]">Overview</span>
    </h1>
  </div>

  {#if isLoading || !authStore.isInitialized || authStore.isLoading}
    <!-- Primary KPIs skeleton -->
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
      {#each Array.from({ length: 4 }) as _, i}
        <div
          class="h-[120px] animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]"
        ></div>
      {/each}
    </div>

    <!-- Secondary KPIs skeleton -->
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-3 mb-8">
      {#each Array.from({ length: 3 }) as _, i}
        <div
          class="h-[120px] animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]"
        ></div>
      {/each}
    </div>

    <!-- Quick Stats skeleton -->
    <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
      {#each Array.from({ length: 2 }) as _, i}
        <div
          class="h-[140px] animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]"
        ></div>
      {/each}
    </div>
  {:else if data}
    <!-- Primary KPIs -->
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
      <div
        class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5"
      >
        <div class="flex items-center justify-between">
          <TrendingUp class="h-4 w-4 text-[#50C8C8]" />
        </div>
        <p class="metric mt-3 text-[#F7F7F7]">{formatCurrency(data.gmv)}</p>
        <p class="caption mt-1 text-[#F7F7F7]/25">GMV This Month</p>
      </div>

      <div
        class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5"
      >
        <div class="flex items-center justify-between">
          <DollarSign class="h-4 w-4 text-[#50C8C8]" />
        </div>
        <p class="metric mt-3 text-[#F7F7F7]">
          {formatCurrency(data.commissionRevenue)}
        </p>
        <p class="caption mt-1 text-[#F7F7F7]/25">Commission Revenue</p>
      </div>

      <div
        class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5"
      >
        <div class="flex items-center justify-between">
          <CalendarCheck class="h-4 w-4 text-[#50C8C8]" />
        </div>
        <p class="metric mt-3 text-[#F7F7F7]">
          {data.totalBookings.toLocaleString()}
        </p>
        <p class="caption mt-1 text-[#F7F7F7]/25">Total Bookings</p>
      </div>

      <div
        class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5"
      >
        <div class="flex items-center justify-between">
          <Building2 class="h-4 w-4 text-[#50C8C8]" />
        </div>
        <p class="metric mt-3 text-[#F7F7F7]">{data.activeVenues}</p>
        <p class="caption mt-1 text-[#F7F7F7]/25">Active Venues</p>
      </div>
    </div>

    <!-- Secondary KPIs -->
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-3 mb-8">
      <div
        class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5"
      >
        <div class="flex items-center justify-between">
          <Clock class="h-4 w-4 text-amber-400" />
        </div>
        <p class="metric mt-3 text-[#F7F7F7]">{data.pendingApprovals}</p>
        <p class="caption mt-1 text-[#F7F7F7]/25">Pending Approvals</p>
      </div>

      <div
        class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5"
      >
        <div class="flex items-center justify-between">
          <RotateCcw class="h-4 w-4 text-amber-400" />
        </div>
        <p class="metric mt-3 text-[#F7F7F7]">{data.refundRequests}</p>
        <p class="caption mt-1 text-[#F7F7F7]/25">Refund Requests</p>
      </div>

      <div
        class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5"
      >
        <div class="flex items-center justify-between">
          <CheckCircle2 class="h-4 w-4 text-[#E6FA50]" />
        </div>
        <p class="metric mt-3 text-[#F7F7F7]">{data.paymentSuccessRate}%</p>
        <p class="caption mt-1 text-[#F7F7F7]/25">Payment Success</p>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
      <div
        class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 text-center"
      >
        <p class="metric text-[#E6FA50]">
          {formatCurrency(data.avgBookingValue)}
        </p>
        <p class="heading-3 mt-2 text-[#F7F7F7]">Avg. Booking Value</p>
        <p class="caption mt-1 text-[#F7F7F7]/25">
          Per transaction average, this month
        </p>
      </div>

      <div
        class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 text-center"
      >
        <p class="metric text-[#E6FA50]">
          {data.avgCommissionRate.toFixed(1)}%
        </p>
        <p class="heading-3 mt-2 text-[#F7F7F7]">Avg. Commission</p>
        <p class="caption mt-1 text-[#F7F7F7]/25">Weighted platform fee</p>
      </div>
    </div>
  {/if}
</div>
