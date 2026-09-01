<script lang="ts">
import { Bell, Calendar, CreditCard, Ticket } from "lucide-svelte";
import { onMount } from "svelte";
import { api } from "$lib/api/client";
import { authStore } from "$lib/auth/store.svelte";
import { formatRelativeTime } from "$lib/format";

interface Props {
  enabled?: boolean;
}

let { enabled = true }: Props = $props();

let open = $state(false);
let bellRef = $state<HTMLDivElement | null>(null);
let unreadCount = $state(0);
let notifications = $state<any[]>([]);
let isLoading = $state(false);

async function fetchUnreadCount() {
  if (!enabled || !authStore.firebaseUser) return;
  try {
    const token = await authStore.firebaseUser.getIdToken();
    const res: any = await api.notifications["unread-count"].get({
      headers: { authorization: `Bearer ${token}` },
    });
    if (res.data !== null && res.data !== undefined) {
      unreadCount =
        typeof res.data === "number"
          ? res.data
          : ((res.data as any).count ?? 0);
    }
  } catch (_err) {}
}

async function fetchNotifications() {
  if (!enabled || !open || !authStore.firebaseUser) return;
  isLoading = true;
  try {
    const token = await authStore.firebaseUser.getIdToken();
    const res = await api.notifications.get({
      headers: { authorization: `Bearer ${token}` },
    });
    if (res.data) {
      notifications = res.data;
    }
  } catch (_err) {
  } finally {
    isLoading = false;
  }
}

$effect(() => {
  if (open) {
    fetchNotifications();
  }
});

onMount(() => {
  if (enabled) {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }
});

onMount(() => {
  function handleClickOutside(e: MouseEvent) {
    if (bellRef && !bellRef.contains(e.target as Node)) {
      open = false;
    }
  }
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
});

async function handleMarkAllRead() {
  if (unreadCount === 0 || !authStore.firebaseUser) return;
  try {
    const token = await authStore.firebaseUser.getIdToken();
    await api.notifications["read-all"].patch(undefined, {
      headers: { authorization: `Bearer ${token}` },
    });
    unreadCount = 0;
    await fetchNotifications();
  } catch (_err) {}
}

async function handleItemClick(
  id: string,
  isRead: boolean,
  linkUrl: string | null,
) {
  if (!isRead && authStore.firebaseUser) {
    try {
      const token = await authStore.firebaseUser.getIdToken();
      await api.notifications({ id }).read.patch(undefined, {
        headers: { authorization: `Bearer ${token}` },
      });
      unreadCount = Math.max(0, unreadCount - 1);
    } catch (_err) {}
  }
  if (linkUrl) {
    open = false;
    window.location.href = linkUrl;
  }
}
</script>

{#if enabled}
  <div bind:this={bellRef} class="relative">
    <button
      type="button"
      onclick={() => (open = !open)}
      class="relative flex h-9 w-9 items-center justify-center rounded-full text-[#F7F7F7]/60 transition-colors hover:bg-white/[0.05] hover:text-[#F7F7F7]"
      aria-label="Notifications"
    >
      <Bell class="h-[18px] w-[18px]" />
      {#if unreadCount > 0}
        <span class="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#E6FA50] px-1 caption text-[#06121A]">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      {/if}
    </button>

    {#if open}
      <div class="absolute right-0 top-12 w-80 rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-2 shadow-2xl z-50">
        <div class="flex items-center justify-between px-3 py-2">
          <h3 class="heading-3 text-[#F7F7F7]">Notifications</h3>
          <button
            type="button"
            onclick={handleMarkAllRead}
            disabled={unreadCount === 0}
            class="label text-[#F7F7F7]/60 hover:text-[#F7F7F7] disabled:opacity-50 disabled:hover:text-[#F7F7F7]/60 transition-colors"
          >
            Mark all read
          </button>
        </div>
        <div class="border-t border-white/[0.04] my-1"></div>

        <div class="max-h-96 overflow-y-auto">
          {#if isLoading}
            <div class="px-3 py-6 text-center body text-[#F7F7F7]/40">
              Loading…
            </div>
          {:else if notifications.length > 0}
            <div class="flex flex-col gap-1 py-1">
              {#each notifications as n (n.id)}
                <button
                  type="button"
                  onclick={() => handleItemClick(n.id, n.isRead, n.linkUrl)}
                  class="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/[0.03]"
                >
                  <div class="relative shrink-0 mt-0.5">
                    {#if n.type?.includes("BOOKING")}
                      <Calendar class="h-4 w-4 text-[#E6FA50]" />
                    {:else if n.type?.includes("PAYMENT")}
                      <CreditCard class="h-4 w-4 text-[#50C8C8]" />
                    {:else if n.type?.includes("VOUCHER")}
                      <Ticket class="h-4 w-4 text-[#BFEF2E]" />
                    {:else}
                      <Bell class="h-4 w-4 text-[#F7F7F7]/60" />
                    {/if}
                    {#if !n.isRead}
                      <span class="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#E6FA50]"></span>
                    {/if}
                  </div>
                  <div>
                    <p class="label text-[#F7F7F7]">{n.title}</p>
                    <p class="caption text-[#F7F7F7]/40 mt-0.5">
                      {n.body}
                    </p>
                    <p class="caption text-[#F7F7F7]/30 mt-1">
                      {formatRelativeTime(n.createdAt)}
                    </p>
                  </div>
                </button>
              {/each}
            </div>
          {:else}
            <div class="px-3 py-6 text-center body text-[#F7F7F7]/40">
              No notifications yet.
            </div>
          {/if}
        </div>
        <div class="border-t border-white/[0.04] mt-1"></div>
        <div class="px-3 py-2">
          <a
            href="/notifications"
            onclick={() => (open = false)}
            class="block w-full text-center label text-[#F7F7F7]/60 hover:text-[#F7F7F7] transition-colors py-1"
          >
            See all notifications
          </a>
        </div>
      </div>
    {/if}
  </div>
{/if}