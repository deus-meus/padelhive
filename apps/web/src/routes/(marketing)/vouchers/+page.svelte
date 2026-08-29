<script lang="ts">
import { Check, Copy, Ticket } from "lucide-svelte";
import { onMount } from "svelte";
import { api } from "$lib/api/client";
import Badge from "$lib/components/ui/badge.svelte";
import Card from "$lib/components/ui/card.svelte";
import Skeleton from "$lib/components/ui/skeleton.svelte";

let vouchers = $state<any[]>([]);
let isLoading = $state(true);
let copiedCode = $state<string | null>(null);

onMount(async () => {
  try {
    const res = await api.vouchers.get();
    if (res.data) {
      vouchers = res.data;
    }
  } catch (e) {
    console.warn("Vouchers fetch error:", e);
  } finally {
    isLoading = false;
  }
});

function copyToClipboard(code: string) {
  navigator.clipboard.writeText(code);
  copiedCode = code;
  setTimeout(() => {
    copiedCode = null;
  }, 2000);
}
</script>

<svelte:head>
  <title>Vouchers & Promos - Padelhive</title>
</svelte:head>

<div class="py-12 bg-[#06121A]">
  <div class="container space-y-8">
    <div class="space-y-2">
      <h1 class="text-3xl font-extrabold tracking-tight text-[#F7F7F7] sm:text-4xl">
        Promos & Vouchers
      </h1>
      <p class="text-sm text-white/60">
        Claim discount vouchers to save on your next court booking
      </p>
    </div>

    {#if isLoading}
      <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
        {#each [1, 2, 3] as _}
          <Card class="p-6 space-y-4">
            <Skeleton class="h-6 w-1/2" />
            <Skeleton class="h-10 w-full" />
            <Skeleton class="h-4 w-2/3" />
          </Card>
        {/each}
      </div>
    {:else if vouchers.length === 0}
      <Card class="flex flex-col items-center justify-center p-12 text-center">
        <Ticket class="mb-3 h-10 w-10 text-white/30" />
        <h3 class="text-lg font-semibold text-white">No Active Vouchers</h3>
        <p class="mt-1 text-xs text-white/50">Check back later for new promotional codes.</p>
      </Card>
    {:else}
      <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
        {#each vouchers as v (v.id)}
          <Card class="relative overflow-hidden border-[#E6FA50]/20 bg-gradient-to-br from-[#0C1B26] to-[#0F2432] p-6 space-y-5">
            <div class="flex items-center justify-between">
              <Badge variant="lime">{v.type}</Badge>
              <span class="text-[11px] font-medium text-white/40">
                Limit: {v.usedCount}/{v.usageLimit}
              </span>
            </div>

            <div>
              <div class="flex items-baseline gap-1 text-2xl font-extrabold text-[#E6FA50]">
                {#if v.type === "PERCENTAGE"}
                  <span>{v.value}% OFF</span>
                {:else}
                  <span>Rp {v.value.toLocaleString("id-ID")} OFF</span>
                {/if}
              </div>
              {#if v.minPurchase}
                <p class="mt-1 text-xs text-white/60">Min. purchase: Rp {v.minPurchase.toLocaleString("id-ID")}</p>
              {/if}
            </div>

            <div class="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 px-4 py-2.5">
              <span class="font-mono text-sm font-bold tracking-wider text-white">{v.code}</span>
              <button
                type="button"
                onclick={() => copyToClipboard(v.code)}
                class="flex items-center gap-1 text-xs font-semibold text-[#E6FA50] hover:underline"
              >
                {#if copiedCode === v.code}
                  <Check class="h-3.5 w-3.5 text-emerald-400" />
                  <span class="text-emerald-400">Copied!</span>
                {:else}
                  <Copy class="h-3.5 w-3.5" />
                  <span>Copy</span>
                {/if}
              </button>
            </div>
          </Card>
        {/each}
      </div>
    {/if}
  </div>
</div>
