<script lang="ts">
import { Calendar, CheckCircle2, Clock, Search, XCircle } from "lucide-svelte";
import { onMount } from "svelte";
import { api } from "$lib/api/client";
import { authStore } from "$lib/auth/store.svelte";
import FilterTabs, {
  type FilterTab,
} from "$lib/components/ui/filter-tabs.svelte";
import { formatBookingDate } from "$lib/format";

type TabKey = "upcoming" | "completed" | "cancelled";

const TABS: FilterTab<TabKey>[] = [
  { label: "Upcoming", value: "upcoming" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: any; color: string; bg: string }
> = {
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle2,
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    color: "text-[#50C8C8]",
    bg: "bg-[#50C8C8]/10",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-400/10",
  },
};

let activeTab = $state<TabKey>("upcoming");
let search = $state("");
let allBookings = $state<any[]>([]);
let isLoading = $state(true);

function formatIDR(amount: number): string {
  return `Rp ${(amount / 1000).toFixed(0)}K`;
}

async function loadOwnerBookings() {
  if (!authStore.firebaseUser) return;
  isLoading = true;
  try {
    const token = await authStore.firebaseUser.getIdToken();
    if (!token) return;

    const res = await api.admin.bookings.get({
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

const filteredBookings = $derived(
  allBookings
    .filter((b) => {
      const s = (b.status || "").toLowerCase();
      if (activeTab === "upcoming")
        return s === "confirmed" || s === "pending_payment" || s === "pending";
      if (activeTab === "completed") return s === "completed";
      if (activeTab === "cancelled")
        return s === "cancelled" || s === "refunded" || s === "pending_refund";
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

    <!-- Tabs -->
    <FilterTabs
      tabs={TABS}
      activeValue={activeTab}
      onChange={(val) => (activeTab = val as TabKey)}
      className="mt-6"
    />

    <!-- Search input -->
    <div class="mt-5 flex items-center gap-3 rounded-xl bg-white/[0.03] px-4 py-3 border border-white/[0.06]">
      <Search class="h-4 w-4 shrink-0 text-[#F7F7F7]/25" />
      <input
        type="text"
        bind:value={search}
        placeholder="Search by player, court, or venue..."
        class="body w-full bg-transparent text-[#F7F7F7] outline-none placeholder:text-[#F7F7F7]/25"
      />
    </div>

    <!-- Bookings list -->
    <div class="mt-6 space-y-3">
      {#if isLoading || !authStore.isInitialized || authStore.isLoading}
        {#each Array.from({ length: 4 }) as _, i}
          <div class="h-24 w-full animate-pulse rounded-xl border border-white/[0.06] bg-[#0C1B26]"></div>
        {/each}
      {:else if filteredBookings.length === 0}
        <div class="rounded-xl border border-dashed border-white/[0.08] p-12 text-center">
          <p class="body text-[#F7F7F7]/25">
            No {activeTab} bookings found.
          </p>
        </div>
      {:else}
        {#each filteredBookings as booking (booking.id)}
          {@const player = booking.host?.name || booking.host?.email || "Unknown Player"}
          {@const statusKey = (booking.status || "PENDING").toLowerCase()}
          {@const config = STATUS_CONFIG[statusKey] || STATUS_CONFIG.pending}
          {@const StatusIcon = config.icon}

          <div class="rounded-xl border border-white/[0.06] bg-[#0C1B26] p-5 transition-all hover:border-white/[0.1]">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <p class="heading-3 text-[#F7F7F7] font-medium">{player}</p>
                  <div class="flex items-center gap-1 rounded-full px-2.5 py-0.5 {config.bg}">
                    <StatusIcon class="h-3 w-3 {config.color}" />
                    <span class="caption {config.color}">
                      {config.label}
                    </span>
                  </div>
                </div>
                <div class="caption mt-2 flex flex-wrap items-center gap-3 text-[#F7F7F7]/25">
                  <span>{booking.venue?.name || "Venue"}</span>
                  <span class="text-[#F7F7F7]/10">·</span>
                  <span>{booking.court?.name || "Court"}</span>
                  <span class="text-[#F7F7F7]/10">·</span>
                  <span class="flex items-center gap-1">
                    <Calendar class="h-3 w-3" />
                    {formatBookingDate(booking.bookingDate)}
                  </span>
                  <span class="text-[#F7F7F7]/10">·</span>
                  <span>
                    {booking.startsAt?.substring(0, 5) || "09:00"} – {booking.endsAt?.substring(0, 5) || "10:00"}
                  </span>
                </div>
              </div>
              <p class="price shrink-0 text-[#F7F7F7]/60">
                {formatIDR(booking.finalAmount || booking.totalPrice || 0)}
              </p>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </section>
</div>
