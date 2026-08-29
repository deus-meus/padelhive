<script lang="ts">
import { BarChart3, TrendingUp } from "lucide-react";
import { onMount } from "svelte";
import { api } from "$lib/api/client";
import { authStore } from "$lib/auth/store.svelte";

let data = $state<any | null>(null);
let isLoading = $state(true);

async function loadMetrics() {
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
    console.warn("Admin metrics fetch error:", e);
  } finally {
    isLoading = false;
  }
}

onMount(() => {
  if (authStore.user) loadMetrics();
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
  <title>Platform Metrics | PadelHive Admin</title>
</svelte:head>

<div class="flex flex-1 flex-col px-6 pb-6 pt-element lg:px-8 lg:pb-8 pt-8">
  <div class="mb-8">
    <p class="caption text-[#E6FA50]">Marketplace Admin</p>
    <h1 class="heading-1 mt-2 text-[#F7F7F7]">
      Platform <span class="text-[#E6FA50]">Metrics</span>
    </h1>
    <p class="body-sm mt-1 text-[#F7F7F7]/40">
      Key performance indicators and marketplace growth analytics
    </p>
  </div>

  {#if isLoading}
    <div class="space-y-4">
      <div class="h-36 animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]"></div>
    </div>
  {:else if data}
    <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
      <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 text-center">
        <p class="metric text-[#E6FA50]">{formatCurrency(data.avgBookingValue)}</p>
        <p class="heading-3 mt-2 text-[#F7F7F7]">Avg. Booking Value</p>
        <p class="caption mt-1 text-[#F7F7F7]/25">Per transaction average this month</p>
      </div>

      <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 text-center">
        <p class="metric text-[#E6FA50]">{data.paymentSuccessRate}%</p>
        <p class="heading-3 mt-2 text-[#F7F7F7]">Payment Success Rate</p>
        <p class="caption mt-1 text-[#F7F7F7]/25">Successful vs failed transactions</p>
      </div>
    </div>
  {/if}
</div>