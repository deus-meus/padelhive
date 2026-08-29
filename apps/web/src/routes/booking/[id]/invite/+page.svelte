<script lang="ts">
import { ArrowLeft, Check, Copy, Loader2, Mail, Plus } from "lucide-svelte";
import { onMount } from "svelte";
import { page } from "$app/stores";
import { api } from "$lib/api/client";
import { authStore } from "$lib/auth/store.svelte";
import Badge from "$lib/components/ui/badge.svelte";
import Button from "$lib/components/ui/button.svelte";
import Card from "$lib/components/ui/card.svelte";
import Skeleton from "$lib/components/ui/skeleton.svelte";

const bookingId = $derived(($page.params.id as string) || "");

let inviteEmail = $state("");
let invites = $state<any[]>([]);
let splitData = $state<any | null>(null);

let isLoading = $state(true);
let isInviting = $state(false);
let error = $state<string | null>(null);
let copiedToken = $state<string | null>(null);

async function loadInvitesAndSplit() {
  isLoading = true;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    const [invRes, splitRes] = await Promise.all([
      api
        .bookings({ id: bookingId })
        .invites.get({ headers: { authorization: `Bearer ${token}` } }),
      api
        .bookings({ id: bookingId })
        .split.get({ headers: { authorization: `Bearer ${token}` } }),
    ]);

    if (invRes.data) invites = invRes.data;
    if (splitRes.data) splitData = splitRes.data;
  } catch (e) {
    console.warn("Invites load error:", e);
  } finally {
    isLoading = false;
  }
}

async function handleCreateInvite(e: SubmitEvent) {
  e.preventDefault();
  if (!inviteEmail) return;
  isInviting = true;
  error = null;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    const res = await api
      .bookings({ id: bookingId })
      .invites.post(
        { email: inviteEmail },
        { headers: { authorization: `Bearer ${token}` } },
      );
    if (res.data) {
      inviteEmail = "";
      await loadInvitesAndSplit();
    }
  } catch (err: any) {
    error = err.message || "Failed to send invite";
  } finally {
    isInviting = false;
  }
}

function copyInviteLink(tokenStr: string) {
  const url = `${window.location.origin}/invites/${tokenStr}`;
  navigator.clipboard.writeText(url);
  copiedToken = tokenStr;
  setTimeout(() => {
    copiedToken = null;
  }, 2000);
}

onMount(() => {
  loadInvitesAndSplit();
});
</script>

<svelte:head>
  <title>Invite Friends & Split Bill - Padelhive</title>
</svelte:head>

<div class="py-12 bg-[#06121A]">
  <div class="container max-w-2xl space-y-6">
    <a href="/bookings/{bookingId}" class="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors">
      <ArrowLeft class="h-3.5 w-3.5" />
      Back to Booking
    </a>

    <div class="space-y-2">
      <h1 class="text-3xl font-extrabold text-white">Invite Teammates & Split Bill</h1>
      <p class="text-xs text-white/60">Send invite links to your match partners and manage equal share splits</p>
    </div>

    <!-- Send Invite Form -->
    <Card class="p-6 space-y-4">
      <h3 class="text-sm font-bold text-white">Send Email Invite</h3>
      {#if error}
        <div class="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
          {error}
        </div>
      {/if}

      <form onsubmit={handleCreateInvite} class="flex gap-2">
        <div class="relative flex-1">
          <Mail class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="email"
            bind:value={inviteEmail}
            required
            placeholder="friend@example.com"
            class="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#E6FA50]/50 focus:outline-none"
          />
        </div>
        <Button type="submit" variant="lime" disabled={isInviting}>
          {#if isInviting}
            <Loader2 class="h-4 w-4 animate-spin" />
          {:else}
            <Plus class="h-4 w-4" />
            Invite
          {/if}
        </Button>
      </form>
    </Card>

    <!-- Invites List & Tokens -->
    <Card class="p-6 space-y-4">
      <h3 class="text-sm font-bold text-white">Invited Teammates ({invites.length})</h3>

      {#if isLoading}
        <Skeleton class="h-12 w-full" />
      {:else if invites.length === 0}
        <p class="py-4 text-center text-xs text-white/40">No invitations sent yet.</p>
      {:else}
        <div class="space-y-3">
          {#each invites as inv (inv.id)}
            <div class="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
              <div>
                <span class="text-sm font-semibold text-white">{inv.name}</span>
                <span class="ml-2 text-xs text-white/40">({inv.email})</span>
              </div>

              <div class="flex items-center gap-3">
                <Badge variant={inv.status === "ACCEPTED" ? "success" : inv.status === "DECLINED" ? "error" : "warning"}>
                  {inv.status}
                </Badge>
                <button
                  type="button"
                  onclick={() => copyInviteLink(inv.token)}
                  class="flex items-center gap-1 text-xs text-[#E6FA50] hover:underline"
                >
                  {#if copiedToken === inv.token}
                    <Check class="h-3.5 w-3.5 text-emerald-400" />
                  {:else}
                    <Copy class="h-3.5 w-3.5" />
                  {/if}
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </Card>

    <!-- Split Ledger Status -->
    {#if splitData}
      <Card class="p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold text-white">Split Ledger Summary</h3>
          <span class="text-xs font-semibold text-[#E6FA50]">
            Collected: Rp {splitData.paidAmount.toLocaleString("id-ID")} / Rp {splitData.totalAmount.toLocaleString("id-ID")}
          </span>
        </div>

        <div class="space-y-2">
          {#each splitData.shares as share}
            <div class="flex items-center justify-between border-b border-white/[0.04] pb-2 text-xs">
              <span class="text-white/80">{share.name}</span>
              <div class="flex items-center gap-2">
                <span class="font-semibold text-white">Rp {share.amount.toLocaleString("id-ID")}</span>
                <Badge variant={share.status === "PAID" ? "success" : "neutral"}>{share.status}</Badge>
              </div>
            </div>
          {/each}
        </div>
      </Card>
    {/if}
  </div>
</div>
