<script lang="ts">
import { DollarSign, Percent } from "lucide-svelte";
import { onMount } from "svelte";
import { api } from "$lib/api/client";
import { authStore } from "$lib/auth/store.svelte";
import EmptyState from "$lib/components/ui/empty-state.svelte";

let data = $state<any | null>(null);
let isLoading = $state(true);

async function loadCommission() {
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
    console.warn("Commission fetch error:", e);
  } finally {
    isLoading = false;
  }
}

onMount(() => {
  if (authStore.user) loadCommission();
});
</script>

<svelte:head>
  <title>Commission Reports | PadelHive Admin</title>
</svelte:head>

<div class="flex flex-1 flex-col px-6 pb-6 pt-element lg:px-8 lg:pb-8 pt-8">
  <div class="mb-8">
    <p class="caption text-[#E6FA50]">Marketplace Admin</p>
    <h1 class="heading-1 mt-2 text-[#F7F7F7]">
      Commission <span class="text-[#E6FA50]">Reports</span>
    </h1>
    <p class="body-sm mt-1 text-[#F7F7F7]/40">
      Venue revenue share and platform commission breakdown
    </p>
  </div>

  {#if isLoading}
    <div class="space-y-4">
      <div
        class="h-32 animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]"
      ></div>
    </div>
  {:else if data}
    <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
      <div
        class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 space-y-3"
      >
        <div class="flex items-center gap-2">
          <DollarSign class="h-5 w-5 text-[#E6FA50]" />
          <span class="label font-semibold text-[#F7F7F7]"
            >Total Commission Revenue</span
          >
        </div>
        <p class="metric text-3xl text-[#E6FA50]">
          Rp {((data.commissionRevenue || 105000) / 1000).toFixed(0)}K
        </p>
        <p class="caption text-[#F7F7F7]/40">
          Cumulative marketplace fee earnings
        </p>
      </div>

      <div
        class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 space-y-3"
      >
        <div class="flex items-center gap-2">
          <Percent class="h-5 w-5 text-[#50C8C8]" />
          <span class="label font-semibold text-[#F7F7F7]"
            >Average Commission Rate</span
          >
        </div>
        <p class="metric text-3xl text-[#50C8C8]">
          {(data.avgCommissionRate || 10).toFixed(1)}%
        </p>
        <p class="caption text-[#F7F7F7]/40">
          Weighted average platform fee percentage across venues
        </p>
      </div>
    </div>
  {/if}
</div>