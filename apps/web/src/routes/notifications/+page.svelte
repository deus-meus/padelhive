<script lang="ts">
import { Bell, CheckCheck, Loader2 } from "lucide-svelte";
import { onMount } from "svelte";
import { api } from "$lib/api/client";
import { authStore } from "$lib/auth/store.svelte";
import Button from "$lib/components/ui/button.svelte";
import Card from "$lib/components/ui/card.svelte";
import Skeleton from "$lib/components/ui/skeleton.svelte";

let notifications = $state<any[]>([]);
let isLoading = $state(true);
let isMarkingAll = $state(false);

async function loadNotifications() {
  isLoading = true;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    const res = await api.notifications.get({
      headers: { authorization: `Bearer ${token}` },
    });
    if (res.data) {
      notifications = res.data;
    }
  } catch (e) {
    console.warn("Notifications load error:", e);
  } finally {
    isLoading = false;
  }
}

async function markAllRead() {
  isMarkingAll = true;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    await api.notifications["read-all"].patch(undefined, {
      headers: { authorization: `Bearer ${token}` },
    });
    await loadNotifications();
  } catch (e) {
    console.warn("Mark all read error:", e);
  } finally {
    isMarkingAll = false;
  }
}

async function markRead(id: string) {
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    await api.notifications({ id }).read.patch(undefined, {
      headers: { authorization: `Bearer ${token}` },
    });
    notifications = notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n,
    );
  } catch (e) {
    console.warn("Mark read error:", e);
  }
}

onMount(() => {
  loadNotifications();
});
</script>

<svelte:head>
  <title>Notifications - Padelhive</title>
</svelte:head>

<div class="py-12 bg-[#06121A]">
  <div class="container max-w-2xl space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-extrabold text-white">Notifications</h1>
        <p class="mt-1 text-xs text-white/60">Updates on your bookings, payments, and invites</p>
      </div>

      <Button
        variant="secondary"
        size="sm"
        disabled={isMarkingAll || notifications.length === 0}
        onclick={markAllRead}
      >
        {#if isMarkingAll}
          <Loader2 class="h-3.5 w-3.5 animate-spin" />
        {:else}
          <CheckCheck class="h-3.5 w-3.5" />
        {/if}
        Mark All Read
      </Button>
    </div>

    {#if isLoading}
      <div class="space-y-3">
        {#each [1, 2, 3] as _}
          <Card class="p-4 space-y-2">
            <Skeleton class="h-5 w-1/3" />
            <Skeleton class="h-4 w-2/3" />
          </Card>
        {/each}
      </div>
    {:else if notifications.length === 0}
      <Card class="flex flex-col items-center justify-center p-12 text-center">
        <Bell class="mb-3 h-10 w-10 text-white/30" />
        <h3 class="text-lg font-semibold text-white">No Notifications</h3>
        <p class="mt-1 text-xs text-white/50">You're all caught up! Updates will appear here.</p>
      </Card>
    {:else}
      <div class="space-y-3">
        {#each notifications as n (n.id)}
          <div
            class="flex items-start justify-between rounded-xl border p-4 transition-colors {n.isRead ? 'border-white/[0.04] bg-[#0C1B26]' : 'border-[#E6FA50]/20 bg-[#0F2432]'}"
          >
            <div class="space-y-1">
              <h4 class="text-sm font-bold text-white">{n.title}</h4>
              <p class="text-xs text-white/70">{n.body}</p>
              {#if n.linkUrl}
                <a href={n.linkUrl} class="mt-2 inline-block text-xs font-semibold text-[#E6FA50] hover:underline">
                  View Details →
                </a>
              {/if}
            </div>

            {#if !n.isRead}
              <button
                type="button"
                onclick={() => markRead(n.id)}
                class="text-[10px] font-semibold text-[#E6FA50] hover:underline"
              >
                Mark Read
              </button>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
