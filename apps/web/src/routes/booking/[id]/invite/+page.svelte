<script lang="ts">
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Mail,
  Share2,
  UserPlus,
  Users,
  XCircle,
} from "lucide-svelte";
import { onMount } from "svelte";
import { page } from "$app/state";
import { api } from "$lib/api/client";
import { authStore } from "$lib/auth/store.svelte";
import EmptyState from "$lib/components/ui/empty-state.svelte";
import { formatBookingDate } from "$lib/format";

const bookingId = $derived((page.params.id as string) || "");

let invites = $state<any[]>([]);
let booking = $state<any | null>(null);
let emailInput = $state("");
let copiedToken = $state<string | null>(null);

let isLoading = $state(true);
let isInviting = $state(false);
let successMessage = $state<string | null>(null);
let errorMessage = $state<string | null>(null);

async function loadData() {
  if (!bookingId) return;
  isLoading = true;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    const [iRes, bRes] = await Promise.all([
      api.bookings({ id: bookingId }).invites.get({
        headers: { authorization: `Bearer ${token}` },
      }),
      api.bookings({ id: bookingId }).get({
        headers: { authorization: `Bearer ${token}` },
      }),
    ]);

    if (iRes.data) invites = iRes.data;
    if (bRes.data) booking = bRes.data;
  } catch (e) {
    console.warn("Invite load error:", e);
  } finally {
    isLoading = false;
  }
}

function buildInviteLink(token: string) {
  if (typeof window === "undefined") return `/invites/${token}`;
  return `${window.location.origin}/invites/${token}`;
}

async function handleCopy(token?: string) {
  if (!token) return;
  await navigator.clipboard.writeText(buildInviteLink(token));
  copiedToken = token;
  setTimeout(() => (copiedToken = null), 2000);
}

async function handleAddFriend() {
  const email = emailInput.trim();
  if (!email || isInviting) return;

  successMessage = null;
  errorMessage = null;
  isInviting = true;

  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    const res = await api
      .bookings({ id: bookingId })
      .invites.post(
        { email },
        { headers: { authorization: `Bearer ${token}` } },
      );

    if (res.data) {
      invites = [...invites, res.data];
      emailInput = "";
      successMessage = `Invite ready for ${email}.`;
    }
  } catch (err: any) {
    errorMessage = err.message || "Failed to send invite";
  } finally {
    isInviting = false;
  }
}

onMount(() => {
  loadData();
});

const acceptedCount = $derived(
  invites.filter((invite) => invite.status === "ACCEPTED").length,
);
const firstInviteLink = $derived(
  invites[0]
    ? buildInviteLink(invites[0].token)
    : "Add a friend to generate an invite link",
);
</script>

<svelte:head>
  <title>Invite Friends | PadelHive</title>
</svelte:head>

<div class="min-h-screen pt-20 pb-24 bg-[#06121A]">
  <div class="container max-w-2xl py-8">
    <!-- Back -->
    <a
      href={booking?.venueId ? `/venues/${booking.venueId}/book` : "/venues"}
      class="group inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs font-semibold text-[#F7F7F7]/60 transition-all duration-200 hover:border-[#E6FA50]/30 hover:bg-[#E6FA50]/10 hover:text-[#E6FA50]"
    >
      <ArrowLeft class="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-1 text-[#F7F7F7]/40 group-hover:text-[#E6FA50]" />
      <span>Back to booking</span>
    </a>

    <!-- Header -->
    <div class="mt-6">
      <h1 class="heading-1 text-[#F7F7F7]">Invite Friends</h1>
      <p class="body-sm mt-2 text-[#F7F7F7]/40">
        Share your booking and play together
      </p>
    </div>

    <!-- Booking context -->
    <div class="mt-6 rounded-xl border border-white/[0.06] bg-[#0C1B26] p-4">
      <div class="body-sm flex flex-wrap items-center gap-x-4 gap-y-1 text-[#F7F7F7]/60">
        <span>{booking?.venue?.name || "Padel Arena"}</span>
        <span class="text-[#F7F7F7]/15">·</span>
        <span>{booking?.court?.name || "Court A"}</span>
        <span class="text-[#F7F7F7]/15">·</span>
        <span>{booking?.bookingDate ? formatBookingDate(new Date(booking.bookingDate)) : "Today"}</span>
        <span class="text-[#F7F7F7]/15">·</span>
        <span>{booking?.startsAt || "10:00"} – {booking?.endsAt || "11:00"}</span>
      </div>
    </div>

    <!-- Invite Link -->
    <div class="mt-8">
      <h2 class="heading-3 uppercase text-[#F7F7F7]/60 flex items-center">
        <Share2 class="mr-2 h-3.5 w-3.5" />
        Share Invite Link
      </h2>
      <div class="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div
          class="flex min-w-0 flex-1 items-center rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
        >
          <span class="body-sm flex-1 truncate text-[#F7F7F7]/60">
            {firstInviteLink}
          </span>
        </div>
        <button
          type="button"
          onclick={() => handleCopy(invites[0]?.token)}
          disabled={!invites[0]}
          class="label flex h-[46px] items-center justify-center gap-2 rounded-xl border px-5 transition-all disabled:cursor-not-allowed disabled:opacity-30 {copiedToken ===
          invites[0]?.token
            ? 'border-green-400/30 bg-green-400/10 text-green-400'
            : 'border-white/[0.06] bg-[#0C1B26] text-[#F7F7F7]/60 hover:border-white/[0.12] hover:text-[#F7F7F7]'}"
        >
          {#if copiedToken === invites[0]?.token}
            <Check class="h-4 w-4" />
            <span>Copied</span>
          {:else}
            <Copy class="h-4 w-4" />
            <span>Copy</span>
          {/if}
        </button>
      </div>
      <p class="caption mt-2 text-[#F7F7F7]/25">
        Invite links are generated after adding a friend. Each friend gets a unique RSVP token.
      </p>
    </div>

    <!-- Add by email -->
    <div class="mt-8">
      <h2 class="heading-3 uppercase text-[#F7F7F7]/60 flex items-center">
        <UserPlus class="mr-2 h-3.5 w-3.5" />
        Add by Email
      </h2>
      <div class="mt-3 flex items-center gap-3">
        <input
          type="email"
          bind:value={emailInput}
          onkeydown={(e) => e.key === "Enter" && handleAddFriend()}
          disabled={isInviting}
          placeholder="friend@email.com"
          class="body flex-1 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[#F7F7F7] placeholder:text-[#F7F7F7]/25 focus:border-[#E6FA50]/30 focus:outline-none focus:ring-1 focus:ring-[#E6FA50]/20 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <button
          type="button"
          onclick={handleAddFriend}
          disabled={!emailInput.trim() || isInviting}
          class="btn-lime label flex h-[46px] items-center gap-2 rounded-xl px-5 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {isInviting ? "Inviting..." : "Invite"}
        </button>
      </div>

      {#if successMessage}
        <div class="mt-3 rounded-xl border border-green-400/20 bg-green-400/10 p-3">
          <p class="caption text-green-200/80">{successMessage}</p>
        </div>
      {/if}
      {#if errorMessage}
        <div
          class="mt-3 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3"
        >
          <AlertCircle class="h-4 w-4 shrink-0 text-red-300" />
          <p class="caption text-red-200/80">{errorMessage}</p>
        </div>
      {/if}
    </div>

    <!-- Friends List -->
    <div class="mt-8">
      <div class="flex items-center justify-between">
        <h2 class="heading-3 uppercase text-[#F7F7F7]/60 flex items-center">
          <Users class="mr-2 h-3.5 w-3.5" />
          Invited Players ({invites.length})
        </h2>
        <span class="caption text-green-400/70">
          {acceptedCount} accepted
        </span>
      </div>

      <div class="mt-4 space-y-3">
        {#if isLoading}
          <div class="space-y-3">
            {#each Array.from({ length: 2 }) as _, i}
              <div
                class="flex flex-col gap-4 rounded-xl border border-white/[0.06] bg-[#0C1B26] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div class="flex min-w-0 items-center gap-3">
                  <div
                    class="h-10 w-10 shrink-0 rounded-full bg-white/5 animate-pulse"
                  ></div>
                  <div class="min-w-0 space-y-1.5">
                    <div
                      class="h-4 w-32 rounded-full bg-white/5 animate-pulse"
                    ></div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {:else if invites.length === 0}
          <div
            class="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] p-6 text-center"
          >
            <Mail class="mx-auto h-8 w-8 text-[#50C8C8]/60" />
            <h3 class="heading-3 mt-3 text-[#F7F7F7]/60">
              No invites yet
            </h3>
            <p class="caption mt-1 text-[#F7F7F7]/25">
              Add a friend by email to generate RSVP link for this booking.
            </p>
          </div>
        {:else}
          {#each invites as invite (invite.id)}
            {@const isCopied = copiedToken === invite.token}
            {@const isAccepted = invite.status === "ACCEPTED"}
            {@const isDeclined = invite.status === "DECLINED"}
            <div
              class="flex flex-col gap-4 rounded-xl border border-white/[0.06] bg-[#0C1B26] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div class="flex min-w-0 items-center gap-3">
                <div
                  class="body flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#50C8C8]/10 font-semibold uppercase text-[#50C8C8]"
                >
                  {(invite.name || invite.email).slice(0, 1).toUpperCase()}
                </div>
                <div class="min-w-0">
                  <p class="body-sm truncate text-[#F7F7F7]/80">
                    {invite.name || invite.email}
                  </p>
                  <p class="caption truncate text-[#F7F7F7]/25">
                    {invite.email}
                  </p>
                </div>
              </div>
              <div class="flex items-center justify-between gap-3 sm:justify-end">
                <div
                  class="caption flex items-center gap-1.5 rounded-full px-3 py-1.5 {isAccepted
                    ? 'bg-green-400/10 text-green-400'
                    : isDeclined
                      ? 'bg-red-400/10 text-red-400'
                      : 'bg-[#50C8C8]/10 text-[#50C8C8]'}"
                >
                  {#if isAccepted}
                    <CheckCircle2 class="h-3.5 w-3.5 text-green-400" />
                    <span>Accepted</span>
                  {:else if isDeclined}
                    <XCircle class="h-3.5 w-3.5 text-red-400" />
                    <span>Declined</span>
                  {:else}
                    <Clock class="h-3.5 w-3.5 text-[#50C8C8]" />
                    <span>Pending</span>
                  {/if}
                </div>
                <button
                  type="button"
                  onclick={() => handleCopy(invite.token)}
                  class="label flex h-9 items-center gap-2 rounded-full border border-white/[0.06] px-3 text-[#F7F7F7]/60 transition-colors hover:border-white/[0.12] hover:text-[#F7F7F7]/80"
                >
                  {#if isCopied}
                    <Check class="h-3.5 w-3.5 text-green-400" />
                  {:else}
                    <Copy class="h-3.5 w-3.5" />
                  {/if}
                  {isCopied ? "Copied" : "Copy Link"}
                </button>
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>

    <!-- Continue -->
    <div class="mt-10">
      <a
        href="/booking/{bookingId}/payment"
        class="btn-lime label flex h-12 w-full items-center justify-center rounded-full"
      >
        Continue to Payment
      </a>
    </div>

    <p class="caption mt-4 text-center text-[#F7F7F7]/25">
      Friends can RSVP from their invite link. Split the bill on the payment page after booking.
    </p>
  </div>
</div>