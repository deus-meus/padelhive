<script lang="ts">
import {
  ArrowRight,
  Calendar,
  CalendarDays,
  Clock,
  MapPin,
  RotateCcw,
  Share2,
  Star,
  Ticket,
  Trophy,
  Users,
} from "lucide-svelte";
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

type TabKey = "upcoming" | "past" | "cancelled" | "refunds" | "disputes";

let activeTab = $state<TabKey>("upcoming");
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

const upcomingCount = $derived(activeTab === "upcoming" ? bookings.length : 0);
const pastCount = $derived(activeTab === "past" ? bookings.length : 0);
const cancelledCount = $derived(
  activeTab === "cancelled" ? bookings.length : 0,
);
const refundCount = $derived(refunds.length);
const disputeCount = $derived(disputes.length);

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

function handleTabChange(tab: TabKey) {
  activeTab = tab;
  loadData();
}
</script>

<svelte:head>
  <title>My Bookings | PadelHive</title>
</svelte:head>

<div class="min-h-screen py-16 bg-[#06121A]">
  <!-- Header -->
  <section class="container pt-8 pb-4">
    <h1 class="heading-1 text-3xl md:text-4xl font-bold text-[#E6FA50]">
      Bookings
    </h1>
    <p class="body mt-1 text-[#F7F7F7]/40">
      Manage your upcoming matches and booking history.
    </p>
  </section>

  <!-- Top 4 Summary Cards Grid (1:1 Image #81) -->
  <section class="container mt-6">
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
        <Calendar class="h-4 w-4 text-[#50C8C8]" />
        <p class="price mt-3 text-2xl font-bold text-[#E6FA50]">
          {bookings.length}
        </p>
        <p class="caption mt-1 text-[#F7F7F7]/40">Total Bookings</p>
      </div>

      <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
        <Clock class="h-4 w-4 text-[#50C8C8]" />
        <p class="price mt-3 text-2xl font-bold text-[#E6FA50]">0h</p>
        <p class="caption mt-1 text-[#F7F7F7]/40">Hours Played</p>
      </div>

      <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
        <Trophy class="h-4 w-4 text-[#50C8C8]" />
        <p class="price mt-3 text-2xl font-bold text-[#E6FA50]">12</p>
        <p class="caption mt-1 text-[#F7F7F7]/40">Matches Joined</p>
      </div>

      <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
        <Users class="h-4 w-4 text-[#50C8C8]" />
        <p class="price mt-3 text-2xl font-bold text-[#E6FA50]">8</p>
        <p class="caption mt-1 text-[#F7F7F7]/40">Friends Invited</p>
      </div>
    </div>
  </section>

  <!-- 5 Filter Tabs (1:1 Image #81) -->
  <section class="container mt-8">
    <div class="flex items-center gap-3 overflow-x-auto no-scrollbar">
      <button
        type="button"
        onclick={() => handleTabChange("upcoming")}
        class="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all select-none {activeTab === 'upcoming'
          ? 'border border-[#E6FA50]/30 bg-[#E6FA50]/10 text-[#E6FA50]'
          : 'border border-transparent text-[#F7F7F7]/40 hover:text-[#F7F7F7]/60'}"
      >
        <span>Upcoming ({upcomingCount})</span>
      </button>

      <button
        type="button"
        onclick={() => handleTabChange("past")}
        class="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all select-none {activeTab === 'past'
          ? 'border border-[#E6FA50]/30 bg-[#E6FA50]/10 text-[#E6FA50]'
          : 'border border-transparent text-[#F7F7F7]/40 hover:text-[#F7F7F7]/60'}"
      >
        <span>Past ({pastCount})</span>
      </button>

      <button
        type="button"
        onclick={() => handleTabChange("cancelled")}
        class="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all select-none {activeTab === 'cancelled'
          ? 'border border-[#E6FA50]/30 bg-[#E6FA50]/10 text-[#E6FA50]'
          : 'border border-transparent text-[#F7F7F7]/40 hover:text-[#F7F7F7]/60'}"
      >
        <span>Cancelled ({cancelledCount})</span>
      </button>

      <button
        type="button"
        onclick={() => handleTabChange("refunds")}
        class="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all select-none {activeTab === 'refunds'
          ? 'border border-[#E6FA50]/30 bg-[#E6FA50]/10 text-[#E6FA50]'
          : 'border border-transparent text-[#F7F7F7]/40 hover:text-[#F7F7F7]/60'}"
      >
        <span>Refunds ({refundCount})</span>
      </button>

      <button
        type="button"
        onclick={() => handleTabChange("disputes")}
        class="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all select-none {activeTab === 'disputes'
          ? 'border border-[#E6FA50]/30 bg-[#E6FA50]/10 text-[#E6FA50]'
          : 'border border-transparent text-[#F7F7F7]/40 hover:text-[#F7F7F7]/60'}"
      >
        <span>Disputes ({disputeCount})</span>
      </button>
    </div>
  </section>

  <!-- Content Section -->
  <section class="container mt-8">
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
        <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-12 md:p-16 text-center w-full my-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] text-[#E6FA50] mx-auto mb-4">
            <RotateCcw class="h-6 w-6" />
          </div>
          <h2 class="heading-2 text-xl font-bold text-[#F7F7F7]">No refund requests</h2>
          <p class="body mt-2 text-[#F7F7F7]/40">
            You don't have any pending or processed refund requests.
          </p>
          <a
            href="/venues"
            class="btn-lime label inline-flex items-center justify-center rounded-full px-6 py-2.5 font-semibold text-sm bg-[#E6FA50] text-[#06121A] hover:bg-[#E6FA50]/90 transition-all mt-6"
          >
            Browse venues
          </a>
        </div>
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
        <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-12 md:p-16 text-center w-full my-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] text-[#E6FA50] mx-auto mb-4">
            <Star class="h-6 w-6" />
          </div>
          <h2 class="heading-2 text-xl font-bold text-[#F7F7F7]">No dispute tickets</h2>
          <p class="body mt-2 text-[#F7F7F7]/40">
            You haven't filed any player disputes or issues.
          </p>
          <a
            href="/venues"
            class="btn-lime label inline-flex items-center justify-center rounded-full px-6 py-2.5 font-semibold text-sm bg-[#E6FA50] text-[#06121A] hover:bg-[#E6FA50]/90 transition-all mt-6"
          >
            Browse venues
          </a>
        </div>
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
      <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-12 md:p-16 text-center w-full my-4">
        <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] text-[#E6FA50] mx-auto mb-4">
          <CalendarDays class="h-6 w-6" />
        </div>
        <h2 class="heading-2 text-xl font-bold text-[#F7F7F7]">No {activeTab} bookings</h2>
        <p class="body mt-2 text-[#F7F7F7]/40">
          When you book a court it'll show up here.
        </p>
        <a
          href="/venues"
          class="btn-lime label inline-flex items-center justify-center rounded-full px-6 py-2.5 font-semibold text-sm bg-[#E6FA50] text-[#06121A] hover:bg-[#E6FA50]/90 transition-all mt-6"
        >
          Browse venues
        </a>
      </div>
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
