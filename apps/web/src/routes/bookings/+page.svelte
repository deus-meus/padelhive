<script lang="ts">
import {
  ArrowRight,
  CalendarDays,
  Clock,
  MapPin,
  RotateCcw,
  Share2,
  Star,
  Ticket,
} from "lucide-svelte";
import { onMount } from "svelte";
import { api } from "$lib/api/client";
import { authStore } from "$lib/auth/store.svelte";
import EmptyState from "$lib/components/ui/empty-state.svelte";
import { formatBookingDate } from "$lib/format";
import { padelImg } from "$lib/images";

const IMG = {
  venue1: padelImg(600),
  venue2: padelImg(600),
  venue3: padelImg(600),
};

const TABS = [
  { label: "Upcoming", value: "upcoming" },
  { label: "Past Matches", value: "past" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Refunds", value: "refunds" },
  { label: "Disputes", value: "disputes" },
];

let activeTab = $state("upcoming");
let bookings = $state<any[]>([]);
let refunds = $state<any[]>([]);
let disputes = $state<any[]>([]);
let isLoading = $state(true);

async function loadData() {
  if (!authStore.user) return;
  isLoading = true;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    if (activeTab === "refunds") {
      const res = await api.refunds.me.get({
        headers: { authorization: `Bearer ${token}` },
      });
      if (res.data) refunds = res.data;
    } else if (activeTab === "disputes") {
      const res = await api.disputes.me.get({
        headers: { authorization: `Bearer ${token}` },
      });
      if (res.data) disputes = res.data;
    } else {
      const res = await api.bookings.me.get({
        query: { filter: activeTab },
        headers: { authorization: `Bearer ${token}` },
      });
      if (res.data) bookings = res.data;
    }
  } catch (e) {
    console.warn("Bookings fetch error:", e);
  } finally {
    isLoading = false;
  }
}

$effect(() => {
  if (authStore.user) {
    loadData();
  }
});

function getStatusStyle(status: string) {
  switch (status) {
    case "CONFIRMED":
      return "bg-[#E6FA50]/10 text-[#E6FA50]";
    case "COMPLETED":
      return "bg-[#50C8C8]/10 text-[#50C8C8]";
    case "PENDING_PAYMENT":
      return "bg-amber-500/10 text-amber-400";
    case "CANCELLED":
      return "bg-red-500/10 text-red-400";
    default:
      return "bg-white/5 text-white/50";
  }
}
</script>

<svelte:head>
  <title>My Bookings | PadelHive</title>
</svelte:head>

<div class="min-h-screen py-16 space-y-10 bg-[#06121A]">
  <!-- Header -->
  <section class="container pt-8">
    <span class="section-label block mb-4">My Activity</span>
    <h1 class="heading-1 text-[#F7F7F7]">
      My <span class="text-[#E6FA50]">Bookings</span>
    </h1>
    <p class="body mt-2 text-[#F7F7F7]/40">
      Track your court reservations, past matches, and refunds.
    </p>
  </section>

  <!-- Filter Tabs -->
  <section class="container">
    <div class="flex flex-wrap gap-2 border-b border-white/[0.06] pb-3">
      {#each TABS as tab}
        <button
          type="button"
          onclick={() => (activeTab = tab.value)}
          class="label rounded-full px-5 py-2 transition-all {activeTab ===
          tab.value
            ? 'bg-[#E6FA50] text-[#06121A]'
            : 'bg-white/[0.03] text-[#F7F7F7]/40 hover:text-[#F7F7F7]/60'}"
        >
          {tab.label}
        </button>
      {/each}
    </div>
  </section>

  <!-- Listings -->
  <section class="container">
    {#if isLoading}
      <div class="space-y-4">
        {#each Array.from({ length: 3 }) as _, i}
          <div
            class="h-32 animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]"
          ></div>
        {/each}
      </div>
    {:else if activeTab === "refunds"}
      {#if refunds.length === 0}
        <EmptyState
          icon={RotateCcw}
          title="No refund requests"
          description="You don't have any pending or processed refund requests."
          actionLabel="Browse venues"
          actionHref="/venues"
        />
      {:else}
        <div class="space-y-4">
          {#each refunds as refund (refund.id)}
            <div
              class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <span class="caption uppercase text-[#50C8C8]">{refund.status}</span>
                <h3 class="heading-3 mt-1 text-[#F7F7F7]">
                  Refund #{refund.id.slice(0, 8)}
                </h3>
                <p class="caption mt-1 text-[#F7F7F7]/40">
                  Reason: {refund.reason || "Booking cancellation"}
                </p>
              </div>
              <p class="price text-[#E6FA50]">
                Rp {(refund.amount / 1000).toFixed(0)}K
              </p>
            </div>
          {/each}
        </div>
      {/if}
    {:else if activeTab === "disputes"}
      {#if disputes.length === 0}
        <EmptyState
          icon={Star}
          title="No dispute tickets"
          description="You haven't filed any player disputes or issues."
          actionLabel="Browse venues"
          actionHref="/venues"
        />
      {:else}
        <div class="space-y-4">
          {#each disputes as dispute (dispute.id)}
            <div
              class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <span class="caption uppercase text-amber-400">{dispute.status}</span>
                <h3 class="heading-3 mt-1 text-[#F7F7F7]">
                  {dispute.title || dispute.issueType}
                </h3>
                <p class="caption mt-1 text-[#F7F7F7]/40">
                  {dispute.description}
                </p>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    {:else if bookings.length === 0}
      <EmptyState
        icon={CalendarDays}
        title="No {activeTab} bookings"
        description="Ready to play? Book a court at your favorite venue."
        actionLabel="Explore Venues"
        actionHref="/venues"
      />
    {:else}
      <div class="space-y-4">
        {#each bookings as b, i (b.id)}
          {@const images = [IMG.venue1, IMG.venue2, IMG.venue3]}
          <div
            class="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 transition-all duration-200 hover:border-[#E6FA50]/15"
          >
            <div
              class="flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div class="flex items-center gap-5">
                <div
                  class="h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-white/5 hidden sm:block"
                >
                  <img
                    src={b.venue?.imageUrl || images[i % images.length]}
                    alt={b.venue?.name}
                    class="h-full w-full object-cover"
                  />
                </div>

                <div class="space-y-1.5">
                  <div class="flex items-center gap-2">
                    <span
                      class="caption rounded-full px-2.5 py-0.5 uppercase font-semibold {getStatusStyle(
                        b.status
                      )}"
                    >
                      {b.status.replace(/_/g, " ")}
                    </span>
                    <span class="caption text-[#F7F7F7]/25">
                      #{b.id.slice(0, 8)}
                    </span>
                  </div>

                  <h3
                    class="heading-3 text-[#F7F7F7] group-hover:text-[#E6FA50] transition-colors"
                  >
                    {b.venue?.name || "Padel Court"} — {b.court?.name || "Court A"}
                  </h3>

                  <div
                    class="flex flex-wrap items-center gap-4 caption text-[#F7F7F7]/40"
                  >
                    <span class="flex items-center gap-1">
                      <MapPin class="h-3 w-3 text-[#50C8C8]" />
                      {b.venue?.city || "Indonesia"}
                    </span>
                    <span class="flex items-center gap-1">
                      <CalendarDays class="h-3 w-3 text-[#50C8C8]" />
                      {b.bookingDate}
                    </span>
                    <span class="flex items-center gap-1">
                      <Clock class="h-3 w-3 text-[#50C8C8]" />
                      {b.startsAt} – {b.endsAt}
                    </span>
                  </div>
                </div>
              </div>

              <div
                class="flex items-center justify-between md:flex-col md:items-end gap-3 border-t border-white/[0.04] pt-4 md:border-none md:pt-0"
              >
                <span class="price text-[#E6FA50]">
                  Rp {((b.finalAmount || 200000) / 1000).toFixed(0)}K
                </span>

                <div class="flex items-center gap-2">
                  <a
                    href="/booking/{b.id}/invite"
                    class="caption flex h-9 items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 text-[#F7F7F7]/60 hover:bg-white/[0.08] hover:text-[#F7F7F7]"
                  >
                    <Share2 class="h-3 w-3" /> Invite Squad
                  </a>
                  <a
                    href="/bookings/{b.id}"
                    class="caption flex h-9 items-center gap-1.5 rounded-full bg-[#E6FA50] px-4 font-semibold text-[#06121A] hover:bg-[#d4e845]"
                  >
                    Details <ArrowRight class="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </section>
</div>