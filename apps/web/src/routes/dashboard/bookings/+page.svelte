<script lang="ts">
import { Calendar, CheckCircle2, Clock, Search, XCircle } from "lucide-svelte";
import { api } from "$lib/api/client";
import { authStore } from "$lib/auth/store.svelte";
import { formatBookingDate } from "$lib/format";

type TabKey = "upcoming" | "completed" | "cancelled";

let activeTab = $state<TabKey>("upcoming");
let search = $state("");
let allBookings = $state<any[]>([]);
let isLoading = $state(true);

function handleTabClick(tab: TabKey) {
  activeTab = tab;
}

function formatIDR(amount: number): string {
  if (!amount) return "Rp 0";
  return `Rp ${(amount / 1000).toFixed(0)}K`;
}

async function loadOwnerBookings() {
  if (!authStore.firebaseUser) return;
  isLoading = true;
  try {
    const token = await authStore.firebaseUser.getIdToken();
    if (!token) return;

    const res = await api.admin.bookings.get({
      query: { pageSize: "100" },
      headers: { authorization: `Bearer ${token}` },
    });
    if (res.data?.items) {
      allBookings = res.data.items;
    }
  } catch (e) {
    console.warn("Owner bookings error:", e);
  } finally {
    isLoading = false;
  }
}

const upcomingCount = $derived(
  allBookings.filter((b) => {
    const s = (b.status || "").toLowerCase();
    return s === "pending_payment" || s === "pending";
  }).length,
);

const completedCount = $derived(
  allBookings.filter((b) => {
    const s = (b.status || "").toLowerCase();
    return s === "completed" || s === "confirmed" || s === "paid";
  }).length,
);

const cancelledCount = $derived(
  allBookings.filter((b) => {
    const s = (b.status || "").toLowerCase();
    return (
      s === "cancelled" ||
      s === "refunded" ||
      s === "pending_refund" ||
      s === "expired"
    );
  }).length,
);

const filteredBookings = $derived(
  allBookings
    .filter((b) => {
      const s = (b.status || "").toLowerCase();
      if (activeTab === "upcoming")
        return s === "pending_payment" || s === "pending";
      if (activeTab === "completed")
        return s === "completed" || s === "confirmed" || s === "paid";
      if (activeTab === "cancelled")
        return (
          s === "cancelled" ||
          s === "refunded" ||
          s === "pending_refund" ||
          s === "expired"
        );
      return true;
    })
    .filter((b) => {
      if (!search.trim()) return true;
      const courtName = (b.court?.name || "").toLowerCase();
      const venueName = (b.venue?.name || "").toLowerCase();
      const playerName = (b.host?.name || b.host?.email || "").toLowerCase();
      const q = search.toLowerCase();
      return (
        courtName.includes(q) || venueName.includes(q) || playerName.includes(q)
      );
    }),
);

$effect(() => {
  if (authStore.isInitialized && authStore.user && authStore.firebaseUser) {
    loadOwnerBookings();
  }
});
</script>

<svelte:head>
  <title>Bookings Management | Padelhive Owner</title>
</svelte:head>

<div class="py-8">
  <section class="container">
    <!-- Header -->
    <div>
      <h1 class="heading-1 text-[#F7F7F7]">Bookings</h1>
      <p class="body mt-1 text-[#F7F7F7]/40">
        Manage all court reservations
      </p>
    </div>

    <!-- Independent Pill Filter Tabs with Count Badges -->
    <div class="mt-6 flex items-center gap-3 overflow-x-auto no-scrollbar">
      <button
        type="button"
        onclick={() => handleTabClick("upcoming")}
        class="relative z-10 flex cursor-pointer items-center gap-2.5 rounded-full border px-4 py-2 text-sm font-semibold transition-all select-none {activeTab === 'upcoming' ? 'border-[#E6FA50]/30 bg-[#E6FA50]/10 text-[#E6FA50]' : 'border-white/[0.08] bg-white/[0.02] text-[#F7F7F7]/40 hover:bg-white/[0.05] hover:text-[#F7F7F7]/60'}"
      >
        <span class="pointer-events-none">Upcoming</span>
        <span class="pointer-events-none flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full px-1.5 pt-[3px] text-xs font-bold leading-none text-center transition-all {activeTab === 'upcoming' ? 'bg-[#E6FA50] text-[#06121A]' : 'bg-white/[0.08] text-[#F7F7F7]/60'}">
          {upcomingCount}
        </span>
      </button>

      <button
        type="button"
        onclick={() => handleTabClick("completed")}
        class="relative z-10 flex cursor-pointer items-center gap-2.5 rounded-full border px-4 py-2 text-sm font-semibold transition-all select-none {activeTab === 'completed' ? 'border-[#E6FA50]/30 bg-[#E6FA50]/10 text-[#E6FA50]' : 'border-white/[0.08] bg-white/[0.02] text-[#F7F7F7]/40 hover:bg-white/[0.05] hover:text-[#F7F7F7]/60'}"
      >
        <span class="pointer-events-none">Completed</span>
        <span class="pointer-events-none flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full px-1.5 pt-[3px] text-xs font-bold leading-none text-center transition-all {activeTab === 'completed' ? 'bg-[#E6FA50] text-[#06121A]' : 'bg-white/[0.08] text-[#F7F7F7]/60'}">
          {completedCount}
        </span>
      </button>

      <button
        type="button"
        onclick={() => handleTabClick("cancelled")}
        class="relative z-10 flex cursor-pointer items-center gap-2.5 rounded-full border px-4 py-2 text-sm font-semibold transition-all select-none {activeTab === 'cancelled' ? 'border-[#E6FA50]/30 bg-[#E6FA50]/10 text-[#E6FA50]' : 'border-white/[0.08] bg-white/[0.02] text-[#F7F7F7]/40 hover:bg-white/[0.05] hover:text-[#F7F7F7]/60'}"
      >
        <span class="pointer-events-none">Cancelled</span>
        <span class="pointer-events-none flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full px-1.5 pt-[3px] text-xs font-bold leading-none text-center transition-all {activeTab === 'cancelled' ? 'bg-[#E6FA50] text-[#06121A]' : 'bg-white/[0.08] text-[#F7F7F7]/60'}">
          {cancelledCount}
        </span>
      </button>
    </div>

    <!-- Search input -->
    <div class="mt-5 flex items-center gap-3 rounded-2xl bg-[#0C1B26] px-5 py-3.5 border border-white/[0.06]">
      <Search class="h-4 w-4 shrink-0 text-[#F7F7F7]/40" />
      <input
        type="text"
        bind:value={search}
        placeholder="Search by player, court, or venue..."
        class="body w-full bg-transparent text-[#F7F7F7] outline-none placeholder:text-[#F7F7F7]/25"
      />
    </div>

    <!-- Bookings list -->
    <div class="mt-6 space-y-4">
      {#if isLoading || !authStore.isInitialized || authStore.isLoading}
        {#each Array.from({ length: 4 }) as _, i}
          <div class="h-28 w-full animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]"></div>
        {/each}
      {:else if filteredBookings.length === 0}
        <div class="rounded-2xl border border-dashed border-white/[0.08] p-12 text-center">
          <p class="body text-[#F7F7F7]/40">
            No {activeTab} bookings found.
          </p>
        </div>
      {:else}
        {#each filteredBookings as booking (booking.id)}
          {@const player = booking.host?.name || booking.host?.email || "Unknown Player"}
          {@const statusKey = (booking.status || "PENDING").toLowerCase()}
          {@const isPaid = booking.payment?.status === "PAID" || statusKey === "completed" || statusKey === "confirmed"}
          {@const isCompleted = statusKey === "completed"}
          {@const isCancelled = statusKey === "cancelled" || statusKey === "refunded"}

          <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 transition-all hover:border-white/[0.12]">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center gap-3">
                  <h3 class="text-lg font-bold text-[#F7F7F7]">{player}</h3>
                  {#if isCompleted}
                    <span class="caption inline-flex items-center gap-1 rounded-full bg-[#50C8C8]/10 px-3 py-1 text-xs font-semibold text-[#50C8C8]">
                      <CheckCircle2 class="h-3 w-3" /> Completed
                    </span>
                  {:else if isCancelled}
                    <span class="caption inline-flex items-center gap-1 rounded-full bg-red-400/10 px-3 py-1 text-xs font-semibold text-red-400">
                      <XCircle class="h-3 w-3" /> Cancelled
                    </span>
                  {:else}
                    <span class="caption inline-flex items-center gap-1 rounded-full bg-yellow-400/10 px-3 py-1 text-xs font-semibold text-yellow-400">
                      <Clock class="h-3 w-3" /> Confirmed
                    </span>
                  {/if}

                  {#if isPaid}
                    <span class="caption rounded-full bg-green-400/10 px-3 py-1 text-xs font-semibold text-green-400">
                      Paid
                    </span>
                  {/if}
                </div>

                <div class="mt-2.5 flex flex-wrap items-center gap-2 text-sm text-[#F7F7F7]/40">
                  <span>{booking.venue?.name || "Venue"}</span>
                  <span>·</span>
                  <span>{booking.court?.name || "Court"}</span>
                  <span>·</span>
                  <span class="inline-flex items-center gap-1">
                    <Calendar class="h-3.5 w-3.5 text-[#F7F7F7]/40" />
                    {formatBookingDate(booking.bookingDate)}
                  </span>
                  <span>·</span>
                  <span>
                    {booking.startsAt?.substring(0, 5) || "09:00"} – {booking.endsAt?.substring(0, 5) || "10:00"}
                  </span>
                </div>
              </div>

              <p class="price shrink-0 text-lg font-bold text-[#F7F7F7]">
                {formatIDR(booking.finalAmount || booking.totalPrice || 0)}
              </p>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </section>
</div>
