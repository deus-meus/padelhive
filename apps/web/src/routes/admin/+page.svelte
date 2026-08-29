<script lang="ts">
import {
  Building2,
  Calendar,
  DollarSign,
  Percent,
  RefreshCw,
  Shield,
} from "lucide-svelte";
import { onMount } from "svelte";
import { api } from "$lib/api/client";
import { authStore } from "$lib/auth/store.svelte";
import Card from "$lib/components/ui/card.svelte";
import Skeleton from "$lib/components/ui/skeleton.svelte";

let data = $state<any | null>(null);
let isLoading = $state(true);

async function loadAdminOverview() {
  isLoading = true;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
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

onMount(() => {
  loadAdminOverview();
});
</script>

<svelte:head>
  <title>Super Admin - Padelhive</title>
</svelte:head>

<div class="py-12 bg-[#06121A]">
  <div class="container space-y-8">
    <div class="flex items-center gap-3">
      <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6FA50] text-[#06121A]">
        <Shield class="h-6 w-6" />
      </div>
      <div>
        <h1 class="text-3xl font-extrabold text-white">Super Admin Dashboard</h1>
        <p class="text-xs text-white/60">Platform-wide marketplace analytics and operations</p>
      </div>
    </div>

    {#if isLoading}
      <div class="grid grid-cols-2 gap-4 md:grid-cols-3">
        {#each [1, 2, 3, 4, 5, 6] as _}
          <Card class="p-6 space-y-2">
            <Skeleton class="h-4 w-1/2" />
            <Skeleton class="h-8 w-3/4" />
          </Card>
        {/each}
      </div>
    {:else if data}
      <div class="grid grid-cols-2 gap-4 md:grid-cols-3">
        <Card class="p-5 space-y-1">
          <span class="text-xs font-semibold text-white/50 flex items-center gap-1.5">
            <DollarSign class="h-4 w-4 text-[#E6FA50]" />
            Gross Merchandise Value (GMV)
          </span>
          <p class="text-2xl font-extrabold text-white">
            Rp {(data.gmv).toLocaleString("id-ID")}
          </p>
        </Card>

        <Card class="p-5 space-y-1">
          <span class="text-xs font-semibold text-white/50 flex items-center gap-1.5">
            <Percent class="h-4 w-4 text-[#E6FA50]" />
            Commission Revenue
          </span>
          <p class="text-2xl font-extrabold text-[#E6FA50]">
            Rp {(data.commissionRevenue).toLocaleString("id-ID")}
          </p>
        </Card>

        <Card class="p-5 space-y-1">
          <span class="text-xs font-semibold text-white/50 flex items-center gap-1.5">
            <Calendar class="h-4 w-4 text-[#E6FA50]" />
            Total Bookings
          </span>
          <p class="text-2xl font-extrabold text-white">{data.totalBookings}</p>
        </Card>

        <Card class="p-5 space-y-1">
          <span class="text-xs font-semibold text-white/50 flex items-center gap-1.5">
            <Building2 class="h-4 w-4 text-[#E6FA50]" />
            Active Approved Venues
          </span>
          <p class="text-2xl font-extrabold text-white">{data.activeVenues}</p>
        </Card>

        <Card class="p-5 space-y-1">
          <span class="text-xs font-semibold text-white/50 flex items-center gap-1.5">
            <RefreshCw class="h-4 w-4 text-amber-400" />
            Pending Venue Approvals
          </span>
          <p class="text-2xl font-extrabold text-amber-400">{data.pendingApprovals}</p>
        </Card>

        <Card class="p-5 space-y-1">
          <span class="text-xs font-semibold text-white/50 flex items-center gap-1.5">
            <RefreshCw class="h-4 w-4 text-red-400" />
            Pending Refund Requests
          </span>
          <p class="text-2xl font-extrabold text-red-400">{data.refundRequests}</p>
        </Card>
      </div>

      <!-- Quick Admin Links -->
      <div class="grid grid-cols-2 gap-4 md:grid-cols-4 pt-4">
        <a href="/admin/venues" class="rounded-xl border border-white/[0.08] bg-[#0C1B26] p-4 text-center text-xs font-bold text-white hover:border-[#E6FA50]/30 hover:text-[#E6FA50] transition-all">
          Manage Venues & Approvals →
        </a>
        <a href="/admin/vouchers" class="rounded-xl border border-white/[0.08] bg-[#0C1B26] p-4 text-center text-xs font-bold text-white hover:border-[#E6FA50]/30 hover:text-[#E6FA50] transition-all">
          Manage Vouchers & Promos →
        </a>
        <a href="/admin/disputes" class="rounded-xl border border-white/[0.08] bg-[#0C1B26] p-4 text-center text-xs font-bold text-white hover:border-[#E6FA50]/30 hover:text-[#E6FA50] transition-all">
          Review Player Disputes →
        </a>
        <a href="/admin/commission" class="rounded-xl border border-white/[0.08] bg-[#0C1B26] p-4 text-center text-xs font-bold text-white hover:border-[#E6FA50]/30 hover:text-[#E6FA50] transition-all">
          Commission Reports →
        </a>
      </div>
    {/if}
  </div>
</div>
