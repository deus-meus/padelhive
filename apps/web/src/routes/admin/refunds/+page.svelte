<script lang="ts">
import { RotateCcw } from "lucide-react";
import { onMount } from "svelte";
import { api } from "$lib/api/client";
import { authStore } from "$lib/auth/store.svelte";
import EmptyState from "$lib/components/ui/empty-state.svelte";

let refunds = $state<any[]>([]);
let isLoading = $state(true);

async function loadRefunds() {
  isLoading = true;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    const res = await api.admin.overview.get({
      headers: { authorization: `Bearer ${token}` },
    });
    if (res.data && (res.data as any).refundRequestsList) {
      refunds = (res.data as any).refundRequestsList;
    }
  } catch (e) {
    console.warn("Admin refunds fetch error:", e);
  } finally {
    isLoading = false;
  }
}

onMount(() => {
  if (authStore.user) loadRefunds();
});
</script>

<svelte:head>
  <title>Refund Requests | PadelHive Admin</title>
</svelte:head>

<div class="flex flex-1 flex-col px-6 pb-6 pt-element lg:px-8 lg:pb-8 pt-8">
  <div class="mb-8">
    <p class="caption text-[#E6FA50]">Marketplace Admin</p>
    <h1 class="heading-1 mt-2 text-[#F7F7F7]">
      Refund <span class="text-[#E6FA50]">Requests</span>
    </h1>
    <p class="body-sm mt-1 text-[#F7F7F7]/40">
      Manage player booking cancellation and refund approvals
    </p>
  </div>

  <div class="flex flex-1 flex-col space-y-4">
    {#if isLoading}
      <div class="space-y-4">
        {#each Array.from({ length: 3 }) as _, i}
          <div class="h-24 animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]"></div>
        {/each}
      </div>
    {:else if refunds.length === 0}
      <EmptyState
        icon={RotateCcw}
        title="No pending refund requests"
        description="All cancellation refund requests have been processed."
      />
    {:else}
      <div class="space-y-3">
        {#each refunds as r (r.id)}
          <div class="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5">
            <div>
              <span class="caption uppercase font-semibold text-amber-400">
                {r.status || "PENDING"}
              </span>
              <h3 class="heading-3 mt-1 text-[#F7F7F7]">
                Refund #{r.id.slice(0, 8)}
              </h3>
              <p class="caption mt-0.5 text-[#F7F7F7]/40">
                Reason: {r.reason || "Court cancellation"}
              </p>
            </div>
            <div class="text-right">
              <p class="price text-[#E6FA50]">
                Rp {((r.amount || 150000) / 1000).toFixed(0)}K
              </p>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>