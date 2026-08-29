<script lang="ts">
import { AlertTriangle } from "lucide-svelte";
import { onMount } from "svelte";
import { api } from "$lib/api/client";
import { authStore } from "$lib/auth/store.svelte";
import EmptyState from "$lib/components/ui/empty-state.svelte";

let disputes = $state<any[]>([]);
let isLoading = $state(true);

async function loadDisputes() {
  isLoading = true;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    const res = await api.admin.overview.get({
      headers: { authorization: `Bearer ${token}` },
    });
    if (res.data && (res.data as any).disputes) {
      disputes = (res.data as any).disputes;
    }
  } catch (e) {
    console.warn("Admin disputes fetch error:", e);
  } finally {
    isLoading = false;
  }
}

onMount(() => {
  if (authStore.user) loadDisputes();
});
</script>

<svelte:head>
  <title>Disputes & Issues | PadelHive Admin</title>
</svelte:head>

<div class="flex flex-1 flex-col px-6 pb-6 pt-element lg:px-8 lg:pb-8 pt-8">
  <div class="mb-8">
    <p class="caption text-[#E6FA50]">Marketplace Admin</p>
    <h1 class="heading-1 mt-2 text-[#F7F7F7]">
      Player <span class="text-[#E6FA50]">Disputes</span>
    </h1>
    <p class="body-sm mt-1 text-[#F7F7F7]/40">
      Track and resolve court, facility, and payment issues reported by players
    </p>
  </div>

  <div class="flex flex-1 flex-col space-y-4">
    {#if isLoading}
      <div class="space-y-4">
        {#each Array.from({ length: 3 }) as _, i}
          <div class="h-24 animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]"></div>
        {/each}
      </div>
    {:else if disputes.length === 0}
      <EmptyState
        icon={AlertTriangle}
        title="No active disputes"
        description="There are no unresolved player disputes at this time."
      />
    {:else}
      <div class="space-y-3">
        {#each disputes as d (d.id)}
          <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5 space-y-2">
            <div class="flex items-center justify-between">
              <span class="caption uppercase font-semibold text-red-400">
                {d.status || "OPEN"}
              </span>
              <span class="caption text-[#F7F7F7]/25">#{d.id.slice(0, 8)}</span>
            </div>
            <h3 class="heading-3 text-[#F7F7F7]">{d.title || d.issueType}</h3>
            <p class="body-sm text-[#F7F7F7]/60">{d.description}</p>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>