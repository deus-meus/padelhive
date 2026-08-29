<script lang="ts">
import { Loader2, Pencil, Plus, Ticket, Trash2, X } from "lucide-svelte";
import { onMount } from "svelte";
import { api } from "$lib/api/client";
import { authStore } from "$lib/auth/store.svelte";
import EmptyState from "$lib/components/ui/empty-state.svelte";

let vouchers = $state<any[]>([]);
let isLoading = $state(true);

let editingVoucher = $state<any | null>(null);
let isFormOpen = $state(false);
let deleteTarget = $state<any | null>(null);
let isSaving = $state(false);
let isDeleting = $state(false);
let toast = $state<string | null>(null);

// Form states
let formCode = $state("");
let formType = $state<"NOMINAL" | "PERCENTAGE">("NOMINAL");
let formValue = $state("");
let formUsageLimit = $state("");
let formMinPurchase = $state("");
let formMaxDiscount = $state("");
let formValidFrom = $state("");
let formValidUntil = $state("");
let formIsActive = $state(true);

function showToast(msg: string) {
  toast = msg;
  setTimeout(() => (toast = null), 3000);
}

async function loadVouchers() {
  isLoading = true;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    const res = await api.admin.vouchers.get({
      headers: { authorization: `Bearer ${token}` },
    });
    if (res.data) {
      vouchers = res.data;
    }
  } catch (e) {
    console.warn("Vouchers admin fetch error:", e);
  } finally {
    isLoading = false;
  }
}

function openCreate() {
  editingVoucher = null;
  formCode = "";
  formType = "NOMINAL";
  formValue = "";
  formUsageLimit = "100";
  formMinPurchase = "";
  formMaxDiscount = "";
  formValidFrom = new Date().toISOString().split("T")[0];
  formValidUntil = new Date(Date.now() + 30 * 86400000)
    .toISOString()
    .split("T")[0];
  formIsActive = true;
  isFormOpen = true;
}

function openEdit(v: any) {
  editingVoucher = v;
  formCode = v.code;
  formType = v.type;
  formValue = String(v.value);
  formUsageLimit = String(v.usageLimit);
  formMinPurchase = v.minPurchase != null ? String(v.minPurchase) : "";
  formMaxDiscount = v.maxDiscount != null ? String(v.maxDiscount) : "";
  formValidFrom = v.validFrom ? v.validFrom.slice(0, 10) : "";
  formValidUntil = v.validUntil ? v.validUntil.slice(0, 10) : "";
  formIsActive = v.isActive ?? true;
  isFormOpen = true;
}

async function handleSave() {
  if (!formCode.trim() || !formValue || !formUsageLimit) return;
  isSaving = true;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    const payload = {
      code: formCode.trim().toUpperCase(),
      type: formType,
      value: Number(formValue),
      usageLimit: Number(formUsageLimit),
      minPurchase: formMinPurchase === "" ? null : Number(formMinPurchase),
      maxDiscount: formMaxDiscount === "" ? null : Number(formMaxDiscount),
      validFrom: new Date(`${formValidFrom}T00:00:00`).toISOString(),
      validUntil: new Date(`${formValidUntil}T23:59:59`).toISOString(),
      isActive: formIsActive,
    };

    if (editingVoucher) {
      await api.admin.vouchers({ id: editingVoucher.id }).patch(payload, {
        headers: { authorization: `Bearer ${token}` },
      });
      showToast("Voucher updated.");
    } else {
      await api.admin.vouchers.post(payload, {
        headers: { authorization: `Bearer ${token}` },
      });
      showToast("Voucher created.");
    }

    isFormOpen = false;
    await loadVouchers();
  } catch (err: any) {
    showToast(err.message || "Failed to save voucher");
  } finally {
    isSaving = false;
  }
}

async function handleDelete() {
  if (!deleteTarget) return;
  isDeleting = true;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    await api.admin.vouchers({ id: deleteTarget.id }).delete(undefined, {
      headers: { authorization: `Bearer ${token}` },
    });
    showToast("Voucher deleted.");
    deleteTarget = null;
    await loadVouchers();
  } catch (err: any) {
    showToast(err.message || "Failed to delete voucher");
  } finally {
    isDeleting = false;
  }
}

onMount(() => {
  if (authStore.user) loadVouchers();
});

function formatIDR(amount: number): string {
  return `Rp ${(amount / 1000).toFixed(0)}K`;
}
</script>

<svelte:head>
  <title>Voucher Management | PadelHive Admin</title>
</svelte:head>

<div class="flex flex-1 flex-col px-6 pb-6 pt-element lg:px-8 lg:pb-8 pt-8">
  <div
    class="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"
  >
    <div>
      <p class="caption text-[#E6FA50]">Marketplace Admin</p>
      <h1 class="heading-1 mt-2 text-[#F7F7F7]">
        Voucher <span class="text-[#E6FA50]">Management</span>
      </h1>
    </div>
    <button
      type="button"
      onclick={openCreate}
      class="btn-lime label flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-full px-5 sm:h-10 sm:w-auto"
    >
      <Plus class="h-4 w-4" /> New Voucher
    </button>
  </div>

  <div class="flex flex-1 flex-col space-y-4">
    {#if isLoading}
      <div class="space-y-4">
        {#each Array.from({ length: 3 }) as _, i}
          <div
            class="h-28 animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]"
          ></div>
        {/each}
      </div>
    {:else if vouchers.length === 0}
      <EmptyState
        icon={Ticket}
        title="No vouchers yet"
        description="Create your first promo voucher to get started."
        actionLabel="New Voucher"
        onAction={openCreate}
      />
    {:else}
      {#each vouchers as v (v.id)}
        <div
          class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6"
        >
          <div
            class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2 sm:gap-3">
                <h3
                  class="heading-2 font-mono tracking-wide text-[#F7F7F7] break-all"
                >
                  {v.code}
                </h3>
                <span
                  class="caption shrink-0 uppercase px-2.5 py-0.5 rounded-full {v.isActive
                    ? 'bg-green-400/10 text-green-400'
                    : 'bg-white/[0.06] text-white/40'}"
                >
                  {v.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <p class="body-sm mt-2 text-[#F7F7F7]/60">
                {v.type === "PERCENTAGE"
                  ? `${v.value}% off`
                  : `${formatIDR(v.value)} off`}
                {v.minPurchase != null && ` · min ${formatIDR(v.minPurchase)}`}
                {v.type === "PERCENTAGE" &&
                  v.maxDiscount != null &&
                  ` · max ${formatIDR(v.maxDiscount)}`}
              </p>
              <p class="caption mt-1 text-[#F7F7F7]/25">
                Used {v.usedCount ?? 0}/{v.usageLimit}
              </p>
            </div>
            <div
              class="mt-4 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-4 sm:mt-0 sm:border-0 sm:pt-0"
            >
              <button
                type="button"
                onclick={() => openEdit(v)}
                class="label flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full border border-white/[0.1] px-4 text-[#F7F7F7]/70 transition-colors hover:border-white/[0.2] hover:text-[#F7F7F7] sm:flex-none"
              >
                <Pencil class="h-3.5 w-3.5" /> Edit
              </button>
              <button
                type="button"
                onclick={() => (deleteTarget = v)}
                class="label flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full border border-red-500/40 px-4 text-red-400 transition-colors hover:bg-red-500/10 sm:flex-none"
              >
                <Trash2 class="h-3.5 w-3.5" /> Delete
              </button>
            </div>
          </div>
        </div>
      {/each}
    {/if}
  </div>

  <!-- Voucher Form Modal -->
  {#if isFormOpen}
    <div
      class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 px-4 py-10"
    >
      <div
        class="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#0C1B26] p-6 shadow-2xl space-y-4"
      >
        <div class="flex items-center justify-between">
          <p class="section-label">
            {editingVoucher ? "Edit Voucher" : "New Voucher"}
          </p>
          <button
            type="button"
            onclick={() => (isFormOpen = false)}
            class="text-[#F7F7F7]/40 hover:text-[#F7F7F7]"
          >
            <X class="h-4 w-4" />
          </button>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label for="vcode" class="mb-1 block text-white/50">Code</label>
            <input
              id="vcode"
              type="text"
              bind:value={formCode}
              placeholder="WELCOME20"
              class="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 font-mono uppercase text-[#F7F7F7] focus:border-[#50C8C8]/40 focus:outline-none"
            />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="vtype" class="mb-1 block text-white/50">Type</label>
              <select
                id="vtype"
                bind:value={formType}
                class="w-full rounded-xl border border-white/[0.08] bg-[#0C1B26] px-4 py-2.5 text-[#F7F7F7] focus:outline-none"
              >
                <option value="NOMINAL">Nominal (IDR)</option>
                <option value="PERCENTAGE">Percentage (%)</option>
              </select>
            </div>
            <div>
              <label for="vval" class="mb-1 block text-white/50">Value</label>
              <input
                id="vval"
                type="number"
                bind:value={formValue}
                placeholder="20000"
                class="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-[#F7F7F7] focus:outline-none"
              />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="vmin" class="mb-1 block text-white/50">Min Purchase</label>
              <input
                id="vmin"
                type="number"
                bind:value={formMinPurchase}
                placeholder="100000"
                class="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-[#F7F7F7] focus:outline-none"
              />
            </div>
            <div>
              <label for="vlimit" class="mb-1 block text-white/50">Usage Limit</label>
              <input
                id="vlimit"
                type="number"
                bind:value={formUsageLimit}
                placeholder="100"
                class="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-[#F7F7F7] focus:outline-none"
              />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="vfrom" class="mb-1 block text-white/50">Valid From</label>
              <input
                id="vfrom"
                type="date"
                bind:value={formValidFrom}
                class="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-[#F7F7F7] [color-scheme:dark]"
              />
            </div>
            <div>
              <label for="vuntil" class="mb-1 block text-white/50">Valid Until</label>
              <input
                id="vuntil"
                type="date"
                bind:value={formValidUntil}
                class="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-[#F7F7F7] [color-scheme:dark]"
              />
            </div>
          </div>
          <label class="label flex items-center gap-2.5 text-[#F7F7F7]/60 cursor-pointer">
            <input
              type="checkbox"
              bind:checked={formIsActive}
              class="h-4 w-4 rounded border-white/20 bg-transparent accent-[#E6FA50]"
            />
            Active
          </label>
        </div>

        <div class="pt-4 flex justify-end gap-2">
          <button
            type="button"
            onclick={() => (isFormOpen = false)}
            class="label rounded-full border border-white/[0.08] px-5 py-2 text-white/60 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onclick={handleSave}
            disabled={isSaving}
            class="btn-lime label flex items-center gap-2 rounded-full px-6 py-2"
          >
            {#if isSaving}
              <Loader2 class="h-4 w-4 animate-spin" />
            {/if}
            Save Voucher
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Delete Modal -->
  {#if deleteTarget}
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
    >
      <div
        class="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0C1B26] p-6 shadow-2xl space-y-4"
      >
        <p class="section-label">Delete Voucher</p>
        <h2 class="heading-2 text-[#F7F7F7]">Delete {deleteTarget.code}?</h2>
        <p class="body-sm text-[#F7F7F7]/40">
          This permanently removes the voucher from the marketplace.
        </p>
        <div class="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onclick={() => (deleteTarget = null)}
            class="label rounded-full border border-white/[0.08] px-5 py-2 text-white/60 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onclick={handleDelete}
            disabled={isDeleting}
            class="label rounded-full bg-red-500/15 px-5 py-2 text-red-300 hover:bg-red-500/25"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Toast -->
  {#if toast}
    <div
      class="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-white/[0.08] bg-[#0C1B26] px-5 py-3 shadow-2xl shadow-black/40"
    >
      <p class="text-sm text-[#F7F7F7]/60">{toast}</p>
    </div>
  {/if}
</div>