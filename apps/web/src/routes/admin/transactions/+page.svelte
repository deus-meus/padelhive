<script lang="ts">
import { CreditCard, Receipt } from "lucide-svelte";
import { onMount } from "svelte";
import { api } from "$lib/api/client";
import { authStore } from "$lib/auth/store.svelte";
import EmptyState from "$lib/components/ui/empty-state.svelte";

let transactions = $state<any[]>([]);
let isLoading = $state(true);

async function loadTransactions() {
  isLoading = true;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    const res = await api.admin.overview.get({
      headers: { authorization: `Bearer ${token}` },
    });
    if (res.data && (res.data as any).transactions) {
      transactions = (res.data as any).transactions;
    }
  } catch (e) {
    console.warn("Admin transactions fetch error:", e);
  } finally {
    isLoading = false;
  }
}

onMount(() => {
  if (authStore.user) loadTransactions();
});
</script>

<svelte:head>
  <title>Transactions Log | PadelHive Admin</title>
</svelte:head>

<div class="flex flex-1 flex-col px-6 pb-6 pt-element lg:px-8 lg:pb-8 pt-8">
  <div class="mb-8">
    <p class="caption text-[#E6FA50]">Marketplace Admin</p>
    <h1 class="heading-1 mt-2 text-[#F7F7F7]">
      Platform <span class="text-[#E6FA50]">Transactions</span>
    </h1>
    <p class="body-sm mt-1 text-[#F7F7F7]/40">
      Real-time financial transactions and payment gateway logs
    </p>
  </div>

  <div class="flex flex-1 flex-col space-y-4">
    {#if isLoading}
      <div class="space-y-4">
        {#each Array.from({ length: 4 }) as _, i}
          <div
            class="h-20 animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]"
          ></div>
        {/each}
      </div>
    {:else if transactions.length === 0}
      <EmptyState
        icon={Receipt}
        title="No transactions yet"
        description="Transactions will appear here when players pay for court bookings."
      />
    {:else}
      <div class="space-y-3">
        {#each transactions as t (t.id)}
          <div
            class="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5"
          >
            <div class="flex items-center gap-4">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04]"
              >
                <CreditCard class="h-5 w-5 text-[#50C8C8]" />
              </div>
              <div>
                <p class="label font-semibold text-[#F7F7F7]">
                  Transaction #{t.id.slice(0, 8)}
                </p>
                <p class="caption text-[#F7F7F7]/40">
                  {t.provider || "Internal"} · {t.method || "Virtual Account"}
                </p>
              </div>
            </div>
            <div class="text-right">
              <p class="price text-[#E6FA50]">
                Rp {((t.amount || 200000) / 1000).toFixed(0)}K
              </p>
              <span class="caption uppercase font-semibold text-green-400">
                {t.status || "PAID"}
              </span>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>