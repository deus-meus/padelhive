<script lang="ts">
import {
  Calendar,
  CheckCircle2,
  Copy,
  DollarSign,
  Percent,
  Ticket,
  X,
} from "lucide-svelte";
import { onMount } from "svelte";
import { api } from "$lib/api/client";
import EmptyState from "$lib/components/ui/empty-state.svelte";

let vouchers = $state<any[]>([]);
let isLoading = $state(true);
let filter = $state<"active" | "expired">("active");
let selectedVoucher = $state<any | null>(null);
let toast = $state<string | null>(null);

onMount(async () => {
  try {
    const res = await api.vouchers.get();
    if (res.data) {
      vouchers = res.data;
    }
  } catch (e) {
    console.warn("Vouchers fetch error:", e);
  } finally {
    isLoading = false;
  }
});

const active = $derived(vouchers.filter((v) => v.isActive));
const expired = $derived(vouchers.filter((v) => !v.isActive));
const filtered = $derived(filter === "active" ? active : expired);

function showToast(msg: string) {
  toast = msg;
  setTimeout(() => {
    toast = null;
  }, 2500);
}

function copyCode(code: string) {
  navigator.clipboard
    .writeText(code)
    .then(() => {
      showToast(`Copied "${code}" to clipboard`);
    })
    .catch(() => {
      showToast(`Code: ${code}`);
    });
}

function formatDiscount(voucher: any): string {
  if (voucher.type === "percentage" || voucher.type === "PERCENTAGE")
    return `${voucher.value}% OFF`;
  return `Rp ${(voucher.value / 1000).toFixed(0)}K OFF`;
}
</script>

<svelte:head>
  <title>Vouchers & Promos | PadelHive</title>
</svelte:head>

<div class="min-h-screen py-16 space-y-12 bg-[#06121A]">
  <!-- Header -->
  <section class="container pt-8">
    <span class="section-label block mb-4">Rewards</span>
    <h1 class="heading-1 text-[#F7F7F7]">
      Promo & <span class="text-[#E6FA50]">Vouchers</span>
    </h1>
    <p class="body mt-2 text-[#F7F7F7]/40">
      Use voucher codes to get discounts on your bookings.
    </p>
  </section>

  <!-- Tabs -->
  <section class="container max-w-[1200px]">
    <div class="flex gap-2 border-b border-white/[0.06] pb-3 mb-8">
      <button
        type="button"
        onclick={() => (filter = "active")}
        class="label rounded-full px-5 py-2 transition-all {filter === 'active'
          ? 'bg-[#E6FA50] text-[#06121A]'
          : 'bg-white/[0.03] text-[#F7F7F7]/40 hover:text-[#F7F7F7]/60'}"
      >
        Active ({active.length})
      </button>
      <button
        type="button"
        onclick={() => (filter = "expired")}
        class="label rounded-full px-5 py-2 transition-all {filter === 'expired'
          ? 'bg-[#E6FA50] text-[#06121A]'
          : 'bg-white/[0.03] text-[#F7F7F7]/40 hover:text-[#F7F7F7]/60'}"
      >
        Expired ({expired.length})
      </button>
    </div>
  </section>

  <!-- Voucher Grid -->
  <section class="container">
    {#if isLoading}
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each Array.from({ length: 6 }) as _, i}
          <div
            class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 space-y-4"
          >
            <div class="h-6 w-20 animate-pulse rounded-full bg-white/[0.04]"></div>
            <div class="h-6 w-32 animate-pulse rounded-md bg-white/[0.04]"></div>
            <div class="h-4 w-48 animate-pulse rounded-md bg-white/[0.04]"></div>
          </div>
        {/each}
      </div>
    {:else if filtered.length === 0}
      <div class="py-16 text-center">
        <EmptyState
          icon={Ticket}
          title="No {filter} vouchers found"
          description="There are no {filter} vouchers available."
          actionLabel="Browse venues"
          actionHref="/venues"
        />
      </div>
    {:else}
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each filtered as voucher (voucher.id)}
          <div
            class="group relative overflow-hidden rounded-2xl border p-6 transition-all duration-200 {voucher.isActive
              ? 'border-white/[0.06] bg-[#0C1B26] hover:border-[#E6FA50]/15'
              : 'border-white/[0.03] bg-[#0C1B26]/50 opacity-60'}"
          >
            <!-- Discount badge -->
            <div class="flex items-center justify-between mb-4">
              <div
                class="flex items-center gap-2 rounded-full px-3 py-1 {voucher.type ===
                  'percentage' || voucher.type === 'PERCENTAGE'
                  ? 'bg-[#E6FA50]/10 text-[#E6FA50]'
                  : 'bg-[#50C8C8]/10 text-[#50C8C8]'}"
              >
                {#if voucher.type === "percentage" || voucher.type === "PERCENTAGE"}
                  <Percent class="h-3.5 w-3.5" />
                {:else}
                  <DollarSign class="h-3.5 w-3.5" />
                {/if}
                <span class="label">{formatDiscount(voucher)}</span>
              </div>
              {#if voucher.isActive}
                <span
                  class="h-2 w-2 rounded-full bg-[#E6FA50] animate-pulse"
                ></span>
              {/if}
            </div>

            <!-- Code -->
            <div class="flex items-center gap-2 mb-3">
              <code class="heading-3 text-[#F7F7F7]">
                {voucher.code}
              </code>
              {#if voucher.isActive}
                <button
                  type="button"
                  onclick={() => copyCode(voucher.code)}
                  class="flex h-6 w-6 items-center justify-center rounded-md bg-white/[0.04] text-[#F7F7F7]/25 transition-colors hover:bg-white/[0.08] hover:text-[#F7F7F7]/60"
                >
                  <Copy class="h-3 w-3" />
                </button>
              {/if}
            </div>

            <!-- Details -->
            <div class="space-y-1.5">
              {#if voucher.minPurchase}
                <p class="caption text-[#F7F7F7]/25">
                  Min. spend Rp {(voucher.minPurchase / 1000).toFixed(0)}K
                </p>
              {/if}
              {#if voucher.maxDiscount}
                <p class="caption text-[#F7F7F7]/25">
                  Max discount Rp {(voucher.maxDiscount / 1000).toFixed(0)}K
                </p>
              {/if}
              <p class="caption flex items-center gap-1 text-[#F7F7F7]/25">
                <Calendar class="h-3 w-3" />
                Valid until {voucher.validUntil || "Dec 31, 2026"}
              </p>
            </div>

            <!-- Usage bar -->
            <div class="mt-4">
              <div class="flex items-center justify-between mb-1">
                <span class="caption text-[#F7F7F7]/25">Usage</span>
                <span class="caption text-[#F7F7F7]/25">
                  {voucher.usedCount}/{voucher.usageLimit}
                </span>
              </div>
              <div class="h-1.5 w-full rounded-full bg-white/[0.04]">
                <div
                  class="h-full rounded-full bg-[#E6FA50]/40 transition-all"
                  style="width: {(voucher.usedCount / voucher.usageLimit) * 100}%"
                ></div>
              </div>
            </div>

            <!-- View details -->
            <button
              type="button"
              onclick={() => (selectedVoucher = voucher)}
              class="label mt-4 w-full rounded-xl border border-white/[0.06] py-2 text-[#F7F7F7]/40 transition-colors hover:border-white/[0.12] hover:text-[#F7F7F7]/60"
            >
              View Details
            </button>
          </div>
        {/each}
      </div>
    {/if}
  </section>

  <!-- Detail Modal -->
  {#if selectedVoucher}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        class="absolute inset-0 bg-[#06121A]/80 backdrop-blur-sm border-0 w-full h-full cursor-default"
        onclick={() => (selectedVoucher = null)}
        aria-label="Close backdrop"
      ></button>
      <div
        class="relative w-full max-w-md rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 shadow-2xl z-10"
      >
        <button
          type="button"
          onclick={() => (selectedVoucher = null)}
          class="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-[#F7F7F7]/25 transition-colors hover:bg-white/[0.04] hover:text-[#F7F7F7]/60"
        >
          <X class="h-4 w-4" />
        </button>

        <div
          class="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4 {selectedVoucher.type ===
            'percentage' || selectedVoucher.type === 'PERCENTAGE'
            ? 'bg-[#E6FA50]/10 text-[#E6FA50]'
            : 'bg-[#50C8C8]/10 text-[#50C8C8]'}"
        >
          {#if selectedVoucher.type === "percentage" || selectedVoucher.type === "PERCENTAGE"}
            <Percent class="h-3.5 w-3.5" />
          {:else}
            <DollarSign class="h-3.5 w-3.5" />
          {/if}
          <span class="label">{formatDiscount(selectedVoucher)}</span>
        </div>

        <h2 class="heading-2 text-[#F7F7F7] mb-1">
          {selectedVoucher.code}
        </h2>
        <p class="caption text-[#F7F7F7]/25 mb-5">
          {selectedVoucher.type === "percentage" || selectedVoucher.type === "PERCENTAGE"
            ? "Percentage discount"
            : "Fixed amount discount"}
        </p>

        <div class="space-y-3 mb-6">
          <div class="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2.5">
            <span class="caption text-[#F7F7F7]/25">Discount</span>
            <span class="label text-[#F7F7F7]/60">{formatDiscount(selectedVoucher)}</span>
          </div>
          {#if selectedVoucher.minPurchase}
            <div class="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2.5">
              <span class="caption text-[#F7F7F7]/25">Min. Spend</span>
              <span class="label text-[#F7F7F7]/60">Rp {(selectedVoucher.minPurchase / 1000).toFixed(0)}K</span>
            </div>
          {/if}
          {#if selectedVoucher.maxDiscount}
            <div class="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2.5">
              <span class="caption text-[#F7F7F7]/25">Max Discount</span>
              <span class="label text-[#F7F7F7]/60">Rp {(selectedVoucher.maxDiscount / 1000).toFixed(0)}K</span>
            </div>
          {/if}
          <div class="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2.5">
            <span class="caption text-[#F7F7F7]/25">Valid Until</span>
            <span class="label text-[#F7F7F7]/60">{selectedVoucher.validUntil || "Dec 31, 2026"}</span>
          </div>
          <div class="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2.5">
            <span class="caption text-[#F7F7F7]/25">Usage</span>
            <span class="label text-[#F7F7F7]/60">{selectedVoucher.usedCount} / {selectedVoucher.usageLimit}</span>
          </div>
          <div class="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2.5">
            <span class="caption text-[#F7F7F7]/25">Status</span>
            <span class="label text-[#F7F7F7]/60">{selectedVoucher.isActive ? "Active" : "Expired"}</span>
          </div>
        </div>

        {#if selectedVoucher.isActive}
          <button
            type="button"
            onclick={() => {
              copyCode(selectedVoucher.code);
              selectedVoucher = null;
            }}
            class="label btn-lime w-full flex items-center justify-center gap-2 rounded-xl py-3"
          >
            <Copy class="h-4 w-4" /> Copy Code
          </button>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Toast -->
  {#if toast}
    <div
      class="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-white/[0.06] bg-[#0C1B26] px-5 py-3 shadow-2xl"
    >
      <p class="caption flex items-center gap-2 text-[#F7F7F7]/60">
        <CheckCircle2 class="h-3.5 w-3.5 text-[#E6FA50]" />
        {toast}
      </p>
    </div>
  {/if}
</div>