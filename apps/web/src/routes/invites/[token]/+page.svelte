<script lang="ts">
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Users,
  XCircle,
} from "lucide-svelte";
import { onMount } from "svelte";
import { page } from "$app/stores";
import { api } from "$lib/api/client";
import Badge from "$lib/components/ui/badge.svelte";
import Button from "$lib/components/ui/button.svelte";
import Card from "$lib/components/ui/card.svelte";
import Skeleton from "$lib/components/ui/skeleton.svelte";

const inviteToken = $derived(($page.params.token as string) || "");

let invite = $state<any | null>(null);
let isLoading = $state(true);
let isRsvping = $state(false);
let rsvpStatus = $state<"ACCEPTED" | "DECLINED" | null>(null);
let error = $state<string | null>(null);

async function loadInvite() {
  isLoading = true;
  try {
    const res = await api.invites({ token: inviteToken }).get();
    if (res.data) {
      invite = res.data;
      if (invite.status === "ACCEPTED" || invite.status === "DECLINED") {
        rsvpStatus = invite.status;
      }
    }
  } catch (e) {
    console.warn("Invite fetch error:", e);
  } finally {
    isLoading = false;
  }
}

async function handleRsvp(status: "ACCEPTED" | "DECLINED") {
  isRsvping = true;
  error = null;
  try {
    const res = await api
      .invites({ token: inviteToken })
      .rsvp.patch({ status });
    if (res.data) {
      invite = res.data;
      rsvpStatus = status;
    }
  } catch (err: any) {
    error = err.message || "Failed to submit RSVP";
  } finally {
    isRsvping = false;
  }
}

onMount(() => {
  loadInvite();
});
</script>

<svelte:head>
  <title>Match Invitation - Padelhive</title>
</svelte:head>

<div class="py-12 bg-[#06121A]">
  <div class="container max-w-md space-y-6">
    <Card class="p-8 space-y-6 text-center">
      <div class="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E6FA50]/10 text-[#E6FA50] mx-auto">
        <Users class="h-6 w-6" />
      </div>

      <div class="space-y-1">
        <h1 class="text-2xl font-extrabold text-white">Match Invitation</h1>
        <p class="text-xs text-white/60">You've been invited to join a padel match!</p>
      </div>

      {#if error}
        <div class="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs font-medium text-red-400">
          <AlertCircle class="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      {/if}

      {#if isLoading}
        <div class="space-y-3 py-4">
          <Skeleton class="h-6 w-3/4 mx-auto" />
          <Skeleton class="h-4 w-1/2 mx-auto" />
        </div>
      {:else if !invite}
        <div class="py-6 text-center space-y-2">
          <AlertCircle class="h-8 w-8 text-red-400 mx-auto" />
          <p class="text-sm font-semibold text-white">Invalid or Expired Invite</p>
          <p class="text-xs text-white/50">This invitation token could not be found.</p>
        </div>
      {:else}
        <div class="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 text-left space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs text-white/50">Host Player</span>
            <span class="text-xs font-semibold text-white">{invite.booking?.host?.name ?? invite.booking?.host?.email}</span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-xs text-white/50">Venue</span>
            <span class="text-xs font-semibold text-[#E6FA50]">{invite.booking?.venue?.name}</span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-xs text-white/50">Court</span>
            <span class="text-xs font-semibold text-white">{invite.booking?.court?.name}</span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-xs text-white/50">Date</span>
            <span class="text-xs font-semibold text-white">{invite.booking?.bookingDate}</span>
          </div>
        </div>

        {#if rsvpStatus}
          <div class="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-center space-y-2">
            <Badge variant={rsvpStatus === "ACCEPTED" ? "success" : "error"} class="text-sm px-3 py-1">
              RSVP: {rsvpStatus}
            </Badge>
            <p class="text-xs text-white/60">
              {rsvpStatus === "ACCEPTED" ? "Great! See you on the court." : "Thank you for letting us know."}
            </p>
          </div>
        {:else}
          <div class="flex items-center gap-3 pt-2">
            <Button
              variant="lime"
              class="flex-1 py-3"
              disabled={isRsvping}
              onclick={() => handleRsvp("ACCEPTED")}
            >
              {#if isRsvping}
                <Loader2 class="h-4 w-4 animate-spin" />
              {:else}
                <CheckCircle2 class="h-4 w-4" />
                Accept & Join
              {/if}
            </Button>

            <Button
              variant="danger"
              class="flex-1 py-3"
              disabled={isRsvping}
              onclick={() => handleRsvp("DECLINED")}
            >
              <XCircle class="h-4 w-4" />
              Decline
            </Button>
          </div>
        {/if}
      {/if}
    </Card>
  </div>
</div>
