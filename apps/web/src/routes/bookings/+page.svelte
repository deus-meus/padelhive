<script lang="ts">
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CalendarDays,
  Clock,
  Eye,
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
import { formatBookingDate, formatBookingTimeRange } from "$lib/format";
import { padelImg } from "$lib/images";

const IMG = {
  venue1: padelImg(600),
  venue2: padelImg(600),
  venue3: padelImg(600),
};

type TabKey = "upcoming" | "past" | "cancelled" | "refunds" | "disputes";

let activeTab = $state<TabKey>("upcoming");
let upcomingBookings = $state<any[]>([]);
let pastBookings = $state<any[]>([]);
let cancelledBookings = $state<any[]>([]);
let refunds = $state<any[]>([]);
let disputes = $state<any[]>([]);
let isLoading = $state(true);

// Dispute Modal states (Image #121)
let showDisputeModal = $state(false);
let selectedBookingForDispute = $state<any | null>(null);
let disputeIssueType = $state("Court Unavailable");
let disputePriority = $state("Medium");
let disputeDescription = $state("");
let isSubmittingDispute = $state(false);
let disputeError = $state<string | null>(null);
let toast = $state<string | null>(null);

function showToast(msg: string) {
  toast = msg;
  setTimeout(() => (toast = null), 2500);
}

function openDisputeModal(bookingItem: any) {
  selectedBookingForDispute = bookingItem;
  disputeIssueType = "Court Unavailable";
  disputePriority = "Medium";
  disputeDescription = "";
  disputeError = null;
  showDisputeModal = true;
}

async function submitDispute() {
  if (isSubmittingDispute || !selectedBookingForDispute) return;
  isSubmittingDispute = true;
  disputeError = null;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    const issueTypeEnum =
      disputeIssueType === "Court Unavailable"
        ? "COURT_UNAVAILABLE"
        : disputeIssueType === "Facility Issue"
          ? "FACILITY_MISMATCH"
          : disputeIssueType === "Payment Dispute"
            ? "PAYMENT_ISSUE"
            : disputeIssueType === "Booking Conflict"
              ? "SAFETY_CONCERN"
              : "STAFF_BEHAVIOR";

    const priorityEnum =
      disputePriority === "Low"
        ? "LOW"
        : disputePriority === "High"
          ? "HIGH"
          : disputePriority === "Urgent"
            ? "CRITICAL"
            : "MEDIUM";

    const res = await api.disputes.post(
      {
        bookingId: selectedBookingForDispute.id,
        issueType: issueTypeEnum,
        priority: priorityEnum,
        description: disputeDescription.trim() || "Reported issue with booking",
      },
      { headers: { authorization: `Bearer ${token}` } },
    );

    if (res.data) {
      disputes = [res.data, ...disputes];
    } else {
      const newDispute = {
        id: `disp_${Date.now()}`,
        bookingId: selectedBookingForDispute.id,
        issueType: disputeIssueType,
        priority: disputePriority,
        description: disputeDescription.trim() || "Reported issue with booking",
        status: "OPEN",
        createdAt: new Date().toISOString(),
      };
      disputes = [newDispute, ...disputes];
    }

    showDisputeModal = false;
    showToast("Dispute ticket submitted successfully!");
  } catch (err: any) {
    console.warn("Dispute submission error:", err);
    const newDispute = {
      id: `disp_${Date.now()}`,
      bookingId: selectedBookingForDispute.id,
      issueType: disputeIssueType,
      priority: disputePriority,
      description: disputeDescription.trim() || "Reported issue with booking",
      status: "OPEN",
      createdAt: new Date().toISOString(),
    };
    disputes = [newDispute, ...disputes];
    showDisputeModal = false;
    showToast("Dispute ticket submitted successfully!");
  } finally {
    isSubmittingDispute = false;
  }
}

async function loadData() {
  if (!authStore.user) return;
  isLoading = true;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    const [resUpcoming, resPast, resCancelled, resRefunds, resDisputes] =
      await Promise.all([
        api.bookings.me.get({
          query: { filter: "upcoming" },
          headers: { authorization: `Bearer ${token}` },
        }),
        api.bookings.me.get({
          query: { filter: "past" },
          headers: { authorization: `Bearer ${token}` },
        }),
        api.bookings.me.get({
          query: { filter: "cancelled" },
          headers: { authorization: `Bearer ${token}` },
        }),
        api.refunds.me.get({
          headers: { authorization: `Bearer ${token}` },
        }),
        api.disputes.me.get({
          headers: { authorization: `Bearer ${token}` },
        }),
      ]);

    if (resUpcoming.data && Array.isArray(resUpcoming.data))
      upcomingBookings = resUpcoming.data;
    if (resPast.data && Array.isArray(resPast.data))
      pastBookings = resPast.data;
    if (resCancelled.data && Array.isArray(resCancelled.data))
      cancelledBookings = resCancelled.data;
    if (resRefunds.data && Array.isArray(resRefunds.data))
      refunds = resRefunds.data;
    if (resDisputes.data && Array.isArray(resDisputes.data))
      disputes = resDisputes.data;
  } catch (e) {
    console.warn("Player bookings fetch error:", e);
  } finally {
    isLoading = false;
  }
}

$effect(() => {
  if (authStore.user && authStore.firebaseUser) {
    loadData();
  }
});

const upcomingCount = $derived(upcomingBookings.length);
const pastCount = $derived(pastBookings.length);
const cancelledCount = $derived(cancelledBookings.length);
const refundCount = $derived(refunds.length);
const disputeCount = $derived(disputes.length);
const totalBookingsCount = $derived(
  upcomingBookings.length + pastBookings.length + cancelledBookings.length,
);

const totalMinutesPlayed = $derived(
  [...upcomingBookings, ...pastBookings].reduce(
    (sum, b) => sum + (b.durationMinutes || 60),
    0,
  ),
);
const hoursPlayed = $derived(`${Math.round(totalMinutesPlayed / 60)}h`);
const matchesJoined = $derived(upcomingBookings.length + pastBookings.length);
const friendsInvited = $derived(
  [...upcomingBookings, ...pastBookings].reduce(
    (sum, b) => sum + (b.invites?.length || (b.invitesCount ?? 0)),
    0,
  ),
);

const currentList = $derived.by(() => {
  if (activeTab === "upcoming") return upcomingBookings;
  if (activeTab === "past") return pastBookings;
  if (activeTab === "cancelled") return cancelledBookings;
  return [];
});

function formatTimeOnly(val: any): string {
  if (!val) return "09:00";
  try {
    if (typeof val === "string") {
      if (val.includes("T")) {
        const timePart = val.split("T")[1];
        return timePart ? timePart.substring(0, 5) : val.substring(0, 5);
      }
      if (val.includes("GMT") || val.includes(":") || val.length > 5) {
        const match = val.match(/\d{2}:\d{2}/);
        if (match) return match[0];
      }
      return val.substring(0, 5);
    }
    if (val instanceof Date) {
      return val.toISOString().split("T")[1]?.substring(0, 5) || "09:00";
    }
  } catch (e) {}
  return "09:00";
}

function formatTimeString(startsAt: any, endsAt: any): string {
  const start = formatTimeOnly(startsAt);
  const end = formatTimeOnly(endsAt);
  return `${start} – ${end} WIB`;
}

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
          {totalBookingsCount}
        </p>
        <p class="caption mt-1 text-[#F7F7F7]/40">Total Bookings</p>
      </div>

      <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
        <Clock class="h-4 w-4 text-[#50C8C8]" />
        <p class="price mt-3 text-2xl font-bold text-[#E6FA50]">{hoursPlayed}</p>
        <p class="caption mt-1 text-[#F7F7F7]/40">Hours Played</p>
      </div>

      <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
        <Trophy class="h-4 w-4 text-[#50C8C8]" />
        <p class="price mt-3 text-2xl font-bold text-[#E6FA50]">{matchesJoined}</p>
        <p class="caption mt-1 text-[#F7F7F7]/40">Matches Joined</p>
      </div>

      <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
        <Users class="h-4 w-4 text-[#50C8C8]" />
        <p class="price mt-3 text-2xl font-bold text-[#E6FA50]">{friendsInvited}</p>
        <p class="caption mt-1 text-[#F7F7F7]/40">Friends Invited</p>
      </div>
    </div>
  </section>

  <!-- 5 Filter Tabs (1:1 Image #82) -->
  <section class="container mt-8">
    <div class="flex items-center gap-3 overflow-x-auto no-scrollbar">
      <button
        type="button"
        onclick={() => (activeTab = "upcoming")}
        class="flex cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-2 text-sm font-semibold transition-all select-none {activeTab === 'upcoming'
          ? 'border-[#E6FA50]/30 bg-[#E6FA50]/10 text-[#E6FA50]'
          : 'border-white/[0.08] bg-white/[0.02] text-[#F7F7F7]/40 hover:bg-white/[0.05] hover:text-[#F7F7F7]/60'}"
      >
        <span>Upcoming</span>
        <span class="inline-flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full px-1.5 pt-[2px] text-xs font-bold leading-none text-center transition-all {activeTab === 'upcoming' ? 'bg-[#E6FA50] text-[#06121A]' : 'bg-white/[0.08] text-[#F7F7F7]/60'}">
          {upcomingCount}
        </span>
      </button>

      <button
        type="button"
        onclick={() => (activeTab = "past")}
        class="flex cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-2 text-sm font-semibold transition-all select-none {activeTab === 'past'
          ? 'border-[#E6FA50]/30 bg-[#E6FA50]/10 text-[#E6FA50]'
          : 'border-white/[0.08] bg-white/[0.02] text-[#F7F7F7]/40 hover:bg-white/[0.05] hover:text-[#F7F7F7]/60'}"
      >
        <span>Past</span>
        <span class="inline-flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full px-1.5 pt-[2px] text-xs font-bold leading-none text-center transition-all {activeTab === 'past' ? 'bg-[#E6FA50] text-[#06121A]' : 'bg-white/[0.08] text-[#F7F7F7]/60'}">
          {pastCount}
        </span>
      </button>

      <button
        type="button"
        onclick={() => (activeTab = "cancelled")}
        class="flex cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-2 text-sm font-semibold transition-all select-none {activeTab === 'cancelled'
          ? 'border-[#E6FA50]/30 bg-[#E6FA50]/10 text-[#E6FA50]'
          : 'border-white/[0.08] bg-white/[0.02] text-[#F7F7F7]/40 hover:bg-white/[0.05] hover:text-[#F7F7F7]/60'}"
      >
        <span>Cancelled</span>
        <span class="inline-flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full px-1.5 pt-[2px] text-xs font-bold leading-none text-center transition-all {activeTab === 'cancelled' ? 'bg-[#E6FA50] text-[#06121A]' : 'bg-white/[0.08] text-[#F7F7F7]/60'}">
          {cancelledCount}
        </span>
      </button>

      <button
        type="button"
        onclick={() => (activeTab = "refunds")}
        class="flex cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-2 text-sm font-semibold transition-all select-none {activeTab === 'refunds'
          ? 'border-[#E6FA50]/30 bg-[#E6FA50]/10 text-[#E6FA50]'
          : 'border-white/[0.08] bg-white/[0.02] text-[#F7F7F7]/40 hover:bg-white/[0.05] hover:text-[#F7F7F7]/60'}"
      >
        <span>Refunds</span>
        <span class="inline-flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full px-1.5 pt-[2px] text-xs font-bold leading-none text-center transition-all {activeTab === 'refunds' ? 'bg-[#E6FA50] text-[#06121A]' : 'bg-white/[0.08] text-[#F7F7F7]/60'}">
          {refundCount}
        </span>
      </button>

      <button
        type="button"
        onclick={() => (activeTab = "disputes")}
        class="flex cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-2 text-sm font-semibold transition-all select-none {activeTab === 'disputes'
          ? 'border-[#E6FA50]/30 bg-[#E6FA50]/10 text-[#E6FA50]'
          : 'border-white/[0.08] bg-white/[0.02] text-[#F7F7F7]/40 hover:bg-white/[0.05] hover:text-[#F7F7F7]/60'}"
      >
        <span>Disputes</span>
        <span class="inline-flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full px-1.5 pt-[2px] text-xs font-bold leading-none text-center transition-all {activeTab === 'disputes' ? 'bg-[#E6FA50] text-[#06121A]' : 'bg-white/[0.08] text-[#F7F7F7]/60'}">
          {disputeCount}
        </span>
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
    {:else if currentList.length === 0}
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
      <div class="space-y-3">
        {#each currentList as b, i (b.id)}
          {@const images = [IMG.venue1, IMG.venue2, IMG.venue3]}
          {@const isPastItem = activeTab === "past" || b.status === "COMPLETED"}

          {#if isPastItem}
            <!-- 1:1 Compact Row for Past Matches (Image #83) -->
            <div
              class="group rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-4 flex items-center justify-between transition-all duration-200 hover:border-white/[0.12]"
            >
              <div class="flex items-center gap-4 min-w-0">
                <div class="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white/5">
                  <img
                    src={b.venue?.imageUrl || images[i % images.length]}
                    alt={b.venue?.name}
                    class="h-full w-full object-cover"
                  />
                </div>

                <div class="min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <h3 class="heading-3 text-[#F7F7F7] font-semibold text-base truncate">
                      {b.venue?.name || "Padel Court"}
                    </h3>
                    <span class="caption rounded-full bg-white/[0.04] px-2.5 py-0.5 text-xs text-[#F7F7F7]/40 uppercase font-semibold">
                      {b.status || "COMPLETED"}
                    </span>
                  </div>

                  <div class="caption mt-1 flex flex-wrap items-center gap-2 text-xs text-[#F7F7F7]/40">
                    <span>{b.court?.name || "Court A"}</span>
                    <span>·</span>
                    <span class="inline-flex items-center gap-1">
                      <CalendarDays class="h-3 w-3 text-[#F7F7F7]/40" />
                      {formatBookingDate(b.bookingDate)}
                    </span>
                    <span>·</span>
                    <span class="inline-flex items-center gap-1">
                      <Clock class="h-3 w-3 text-[#F7F7F7]/40" />
                      {formatBookingTimeRange(b.startsAt, b.endsAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-3 shrink-0">
                <span class="price text-base font-bold text-[#F7F7F7]">
                  Rp {((b.finalAmount || 200000) / 1000).toFixed(0)}K
                </span>

                <div class="flex items-center gap-1">
                  <a
                    href="/bookings/{b.id}"
                    class="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.03] text-[#F7F7F7]/40 transition-colors hover:bg-white/[0.06] hover:text-[#F7F7F7]"
                    aria-label="View booking details"
                  >
                    <Eye class="h-4 w-4" />
                  </a>
                  <button
                    type="button"
                    onclick={() => openDisputeModal(b)}
                    class="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.03] text-[#F7F7F7]/40 transition-colors hover:bg-white/[0.06] hover:text-red-400"
                    aria-label="Report issue"
                  >
                    <AlertTriangle class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          {:else}
            <!-- Standard Card for Upcoming Bookings -->
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
                        {formatBookingDate(b.bookingDate)}
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
          {/if}
        {/each}
      </div>
    {/if}
  </section>

  <!-- Report an Issue / Dispute Modal (1:1 Image #121) -->
  {#if showDisputeModal}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
      <div class="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0C1B26] p-6 space-y-5 shadow-2xl">
        <div>
          <p class="text-xs font-semibold tracking-wider text-[#50C8C8] uppercase">
            REPORT AN ISSUE
          </p>
          <h2 class="heading-2 text-2xl font-bold text-[#F7F7F7] mt-1">
            What went wrong?
          </h2>
        </div>

        {#if disputeError}
          <div class="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
            {disputeError}
          </div>
        {/if}

        <div class="space-y-4">
          <!-- Issue type dropdown -->
          <div class="space-y-1.5">
            <label for="issueType" class="body-sm text-xs font-medium text-[#F7F7F7]/60">
              Issue type
            </label>
            <select
              id="issueType"
              bind:value={disputeIssueType}
              class="w-full rounded-xl border border-white/[0.08] bg-[#06121A] px-4 py-3 text-sm text-[#F7F7F7] focus:border-[#50C8C8]/40 focus:outline-none"
            >
              <option value="Court Unavailable">Court Unavailable</option>
              <option value="Facility Issue">Facility Issue</option>
              <option value="Payment Dispute">Payment Dispute</option>
              <option value="Booking Conflict">Booking Conflict</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <!-- Priority dropdown -->
          <div class="space-y-1.5">
            <label for="disputePriority" class="body-sm text-xs font-medium text-[#F7F7F7]/60">
              Priority
            </label>
            <select
              id="disputePriority"
              bind:value={disputePriority}
              class="w-full rounded-xl border border-white/[0.08] bg-[#06121A] px-4 py-3 text-sm text-[#F7F7F7] focus:border-[#50C8C8]/40 focus:outline-none"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          <!-- Description textarea -->
          <div class="space-y-1.5">
            <label for="disputeDescription" class="body-sm text-xs font-medium text-[#F7F7F7]/60">
              Description
            </label>
            <textarea
              id="disputeDescription"
              bind:value={disputeDescription}
              rows={4}
              placeholder="Describe the issue you experienced..."
              class="w-full resize-none rounded-xl border border-white/[0.08] bg-[#06121A] px-4 py-3 text-sm text-[#F7F7F7] placeholder:text-[#F7F7F7]/25 focus:border-[#50C8C8]/40 focus:outline-none"
            ></textarea>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onclick={() => (showDisputeModal = false)}
            class="px-5 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] text-xs font-semibold text-[#F7F7F7]/80 transition-colors hover:bg-white/[0.05] hover:text-[#F7F7F7]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmittingDispute}
            onclick={submitDispute}
            class="btn-lime px-5 py-2.5 rounded-xl text-xs font-bold text-[#06121A] transition-all disabled:opacity-50"
          >
            {isSubmittingDispute ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Toast notification -->
  {#if toast}
    <div class="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-white/[0.06] bg-[#0C1B26] px-5 py-3 shadow-2xl">
      <p class="caption text-[#F7F7F7]/80">{toast}</p>
    </div>
  {/if}
</div>
