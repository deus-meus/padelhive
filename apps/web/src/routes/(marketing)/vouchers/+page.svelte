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

function formatVoucherDate(dateVal: any): string {
  if (!dateVal) return "Dec 31, 2026";
  try {
    const d = new Date(dateVal);
    if (Number.isNaN(d.getTime())) return String(dateVal);
    return d.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch (e) {
    return "Dec 31, 2026";
  }
}
</script>

<svelte:head>
  <title>Vouchers & Promos | PadelHive</title>
</svelte:head>

<div class="min-h-screen py-16 bg-[#06121A]">
  <!-- Header -->
  <section class="container pt-8 pb-4">
    <span class="caption font-semibold tracking-wider uppercase text-[#E6FA50] block mb-3">REWARDS</span>
    <h1 class="heading-1 text-3xl md:text-4xl font-bold text-[#F7F7F7]">
      Promo & <span class="text-[#E6FA50]">Vouchers</span>
    </h1>
    <p class="body mt-2 text-[#F7F7F7]/40">
      Use voucher codes to get discounts on your bookings.
    </p>
  </section>

  <!-- Independent Pill Filter Tabs (1:1 Image #78) -->
  <section class="container mt-6 mb-8">
    <div class="flex items-center gap-3 overflow-x-auto no-scrollbar">
      <button
        type="button"
        onclick={() => (filter = "active")}
        class="flex cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-2 text-sm font-semibold transition-all select-none {filter === 'active'
          ? 'border-[#E6FA50]/30 bg-[#E6FA50]/10 text-[#E6FA50]'
          : 'border-white/[0.08] bg-white/[0.02] text-[#F7F7F7]/40 hover:bg-white/[0.05] hover:text-[#F7F7F7]/60'}"
      >
        <span>Active</span>
        <span class="flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full px-1.5 pt-[2px] text-xs font-bold leading-none text-center transition-all {filter === 'active'
          ? 'bg-[#E6FA50] text-[#06121A]'
          : 'bg-white/[0.08] text-[#F7F7F7]/60'}">
          {active.length}
        </span>
      </button>

      <button
        type="button"
        onclick={() => (filter = "expired")}
        class="flex cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-2 text-sm font-semibold transition-all select-none {filter === 'expired'
          ? 'border-[#E6FA50]/30 bg-[#E6FA50]/10 text-[#E6FA50]'
          : 'border-white/[0.08] bg-white/[0.02] text-[#F7F7F7]/40 hover:bg-white/[0.05] hover:text-[#F7F7F7]/60'}"
      >
        <span>Expired</span>
        <span class="flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full px-1.5 pt-[2px] text-xs font-bold leading-none text-center transition-all {filter === 'expired'
          ? 'bg-[#E6FA50] text-[#06121A]'
          : 'bg-white/[0.08] text-[#F7F7F7]/60'}">
          {expired.length}
        </span>
      </button>
    </div>
  </section>

  <!-- Voucher Grid -->
  <section class="container">
    {#if isLoading}
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {#each Array.from({ length: 6 }) as _}
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
      <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-12 md:p-16 text-center w-full my-4">
        <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] text-[#E6FA50] mx-auto mb-4">
          <Ticket class="h-6 w-6" />
        </div>
        <h2 class="heading-2 text-xl font-bold text-[#F7F7F7]">No {filter} vouchers found</h2>
        <p class="body mt-2 text-[#F7F7F7]/40">
          There are no {filter} vouchers available.
        </p>
        <a
          href="/venues"
          class="btn-lime label inline-flex items-center justify-center rounded-full px-6 py-2.5 font-semibold text-sm bg-[#E6FA50] text-[#06121A] hover:bg-[#E6FA50]/90 transition-all mt-6"
        >
          Browse venues
        </a>
      </div>
    {:else}
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {#each filtered as voucher (voucher.id)}
          <div
            class="group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-6 transition-all duration-200 {voucher.isActive
              ? 'border-white/[0.06] bg-[#0C1B26] hover:border-white/[0.12]'
              : 'border-white/[0.03] bg-[#0C1B26]/50 opacity-60'}"
          >
            <div>
              <!-- Discount badge -->
              <div class="flex items-center justify-between mb-4">
                <div
                  class="flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold {voucher.type ===
                    'percentage' || voucher.type === 'PERCENTAGE'
                    ? 'bg-[#E6FA50]/10 text-[#E6FA50]'
                    : 'bg-[#50C8C8]/10 text-[#50C8C8]'}"
                >
                  {#if voucher.type === "percentage" || voucher.type === "PERCENTAGE"}
                    <Percent class="h-3.5 w-3.5" />
                  {:else}
                    <DollarSign class="h-3.5 w-3.5" />
                  {/if}
                  <span>{formatDiscount(voucher)}</span>
                </div>
                {#if voucher.isActive}
                  <span
                    class="h-2.5 w-2.5 rounded-full bg-[#E6FA50] shadow-sm shadow-[#E6FA50]/40 animate-pulse"
                  ></span>
                {/if}
              </div>

              <!-- Code -->
              <div class="flex items-center gap-2 mb-4 mt-2">
                <code class="text-xl font-bold font-mono tracking-wider text-[#F7F7F7]">
                  {voucher.code}
                </code>
                {#if voucher.isActive}
                  <button
                    type="button"
                    onclick={() => copyCode(voucher.code)}
                    class="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-[#F7F7F7]/40 transition-colors hover:bg-white/[0.08] hover:text-[#F7F7F7]"
                    aria-label="Copy voucher code"
                  >
                    <Copy class="h-3.5 w-3.5" />
                  </button>
                {/if}
              </div>

              <!-- Inner Details Box -->
              <div class="rounded-xl border border-white/[0.04] bg-white/[0.015] p-3.5 space-y-2">
                {#if voucher.minPurchase}
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-[#F7F7F7]/40">Min. spend</span>
                    <span class="font-semibold text-[#F7F7F7]/80">Rp {(voucher.minPurchase / 1000).toFixed(0)}K</span>
                  </div>
                {/if}
                {#if voucher.maxDiscount}
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-[#F7F7F7]/40">Max discount</span>
                    <span class="font-semibold text-[#F7F7F7]/80">Rp {(voucher.maxDiscount / 1000).toFixed(0)}K</span>
                  </div>
                {/if}
                <div class="flex items-center justify-between text-xs {voucher.minPurchase || voucher.maxDiscount ? 'border-t border-white/[0.04] pt-2 mt-1' : ''}">
                  <span class="inline-flex items-center gap-1.5 text-[#F7F7F7]/40">
                    <Calendar class="h-3.5 w-3.5 text-[#F7F7F7]/40" />
                    Valid until
                  </span>
                  <span class="font-semibold text-[#F7F7F7]/80">{formatVoucherDate(voucher.validUntil)}</span>
                </div>
              </div>

              <!-- Usage bar -->
              <div class="mt-4">
                <div class="flex items-center justify-between mb-1.5">
                  <span class="caption text-[#F7F7F7]/40 text-xs font-medium">Usage</span>
                  <span class="caption text-[#F7F7F7]/60 text-xs font-mono font-semibold">
                    {voucher.usedCount}/{voucher.usageLimit}
                  </span>
                </div>
                <div class="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    class="h-full rounded-full bg-[#E6FA50] transition-all duration-300"
                    style="width: {voucher.usageLimit > 0 ? (voucher.usedCount / voucher.usageLimit) * 100 : 0}%"
                  ></div>
                </div>
              </div>
            </div>

            <!-- View details -->
            <button
              type="button"
              onclick={() => (selectedVoucher = voucher)}
              class="label mt-5 flex h-10 w-full items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.02] text-xs font-semibold text-[#F7F7F7]/70 transition-all hover:border-[#E6FA50]/30 hover:bg-[#E6FA50]/5 hover:text-[#E6FA50]"
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
        class="relative w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0C1B26] p-6 shadow-2xl z-10"
      >
        <button
          type="button"
          onclick={() => (selectedVoucher = null)}
          class="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-[#F7F7F7]/40 transition-colors hover:bg-white/[0.04] hover:text-[#F7F7F7]"
        >
          <X class="h-4 w-4" />
        </button>

        <div
          class="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4 text-xs font-semibold {selectedVoucher.type ===
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

        <h2 class="heading-2 text-[#F7F7F7] text-xl font-bold mb-1">
          {selectedVoucher.code}
        </h2>
        <p class="caption text-[#F7F7F7]/40 text-xs mb-5">
          {selectedVoucher.type === "percentage" || selectedVoucher.type === "PERCENTAGE"
            ? "Percentage discount"
            : "Fixed amount discount"}
        </p>

        <div class="space-y-3 mb-6">
          <div class="flex items-center justify-between rounded-xl bg-white/[0.02] p-3 border border-white/[0.04]">
            <span class="caption text-[#F7F7F7]/40">Discount</span>
            <span class="label text-[#F7F7F7] font-semibold">{formatDiscount(selectedVoucher)}</span>
          </div>
          {#if selectedVoucher.minPurchase}
            <div class="flex items-center justify-between rounded-xl bg-white/[0.02] p-3 border border-white/[0.04]">
              <span class="caption text-[#F7F7F7]/40">Min. Spend</span>
              <span class="label text-[#F7F7F7] font-semibold">Rp {(selectedVoucher.minPurchase / 1000).toFixed(0)}K</span>
            </div>
          {/if}
          {#if selectedVoucher.maxDiscount}
            <div class="flex items-center justify-between rounded-xl bg-white/[0.02] p-3 border border-white/[0.04]">
              <span class="caption text-[#F7F7F7]/40">Max Discount</span>
              <span class="label text-[#F7F7F7] font-semibold">Rp {(selectedVoucher.maxDiscount / 1000).toFixed(0)}K</span>
            </div>
          {/if}
          <div class="flex items-center justify-between rounded-xl bg-white/[0.02] p-3 border border-white/[0.04]">
            <span class="caption text-[#F7F7F7]/40">Valid Until</span>
            <span class="label text-[#F7F7F7] font-semibold">{formatVoucherDate(selectedVoucher.validUntil)}</span>
          </div>
          <div class="flex items-center justify-between rounded-xl bg-white/[0.02] p-3 border border-white/[0.04]">
            <span class="caption text-[#F7F7F7]/40">Usage</span>
            <span class="label text-[#F7F7F7] font-semibold">{selectedVoucher.usedCount} / {selectedVoucher.usageLimit}</span>
          </div>
          <div class="flex items-center justify-between rounded-xl bg-white/[0.02] p-3 border border-white/[0.04]">
            <span class="caption text-[#F7F7F7]/40">Status</span>
            <span class="label font-semibold {selectedVoucher.isActive ? 'text-green-400' : 'text-red-400'}">{selectedVoucher.isActive ? "Active" : "Expired"}</span>
          </div>
        </div>

        {#if selectedVoucher.isActive}
          <button
            type="button"
            onclick={() => {
              copyCode(selectedVoucher.code);
              selectedVoucher = null;
            }}
            class="label btn-lime w-full flex items-center justify-center gap-2 rounded-full py-3 font-semibold text-[#06121A] bg-[#E6FA50] hover:bg-[#E6FA50]/90 transition-all"
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
      class="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-white/[0.08] bg-[#0C1B26] px-5 py-3 shadow-2xl shadow-black/40"
    >
      <p class="caption flex items-center gap-2 text-[#F7F7F7]/80 font-medium">
        <CheckCircle2 class="h-4 w-4 text-[#E6FA50]" />
        {toast}
      </p>
    </div>
  {/if}
</div>
