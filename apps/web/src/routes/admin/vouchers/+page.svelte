<script lang="ts">
import { Loader2, Pencil, Plus, Ticket, Trash2, X } from "lucide-svelte";
import { onMount } from "svelte";
import { api } from "$lib/api/client";
import { authStore } from "$lib/auth/store.svelte";
import DatePicker from "$lib/components/ui/date-picker.svelte";
import EmptyState from "$lib/components/ui/empty-state.svelte";
import FilterSelect, {
  type FilterOption,
} from "$lib/components/ui/filter-select.svelte";
import NumberInput from "$lib/components/ui/number-input.svelte";

interface Voucher {
  id: string;
  code: string;
  type: "NOMINAL" | "PERCENTAGE";
  value: number;
  minPurchase?: number | null;
  maxDiscount?: number | null;
  usageLimit: number;
  usedCount: number;
  validFrom: string | Date;
  validUntil: string | Date;
  isActive: boolean;
}

const TYPE_OPTIONS: FilterOption[] = [
  { value: "NOMINAL", label: "Nominal (IDR)" },
  { value: "PERCENTAGE", label: "Percentage (%)" },
];

let vouchers = $state<Voucher[]>([]);
let isLoading = $state(true);
let isFormOpen = $state(false);
let editingVoucher = $state<Voucher | null>(null);
let deleteTarget = $state<Voucher | null>(null);
let isSaving = $state(false);
let isDeleting = $state(false);
let toast = $state<string | null>(null);

// Form state
let formCode = $state("");
let formType = $state<"NOMINAL" | "PERCENTAGE">("NOMINAL");
let formValue = $state("");
let formMinPurchase = $state("");
let formMaxDiscount = $state("");
let formUsageLimit = $state("");
let formValidFrom = $state("");
let formValidUntil = $state("");
let formIsActive = $state(true);

function formatIDR(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function formatDate(iso: string | Date): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getVoucherStatus(v: Voucher): { label: string; color: string } {
  if (!v.isActive) return { label: "Inactive", color: "text-[#F7F7F7]/40" };
  if (new Date(v.validUntil).getTime() < Date.now())
    return { label: "Expired", color: "text-orange-400" };
  if (v.usedCount >= v.usageLimit)
    return { label: "Exhausted", color: "text-red-400" };
  return { label: "Active", color: "text-green-400" };
}

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
    if (res.data && Array.isArray(res.data)) {
      vouchers = res.data as Voucher[];
    }
  } catch (e) {
    console.warn("Error fetching admin vouchers:", e);
  } finally {
    isLoading = false;
  }
}

function openCreate() {
  editingVoucher = null;
  formCode = "";
  formType = "NOMINAL";
  formValue = "";
  formMinPurchase = "";
  formMaxDiscount = "";
  formUsageLimit = "";
  formValidFrom = new Date().toISOString().slice(0, 10);
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  formValidUntil = nextMonth.toISOString().slice(0, 10);
  formIsActive = true;
  isFormOpen = true;
}

function openEdit(v: Voucher) {
  editingVoucher = v;
  formCode = v.code;
  formType = v.type;
  formValue = String(v.value);
  formMinPurchase = v.minPurchase != null ? String(v.minPurchase) : "";
  formMaxDiscount = v.maxDiscount != null ? String(v.maxDiscount) : "";
  formUsageLimit = String(v.usageLimit);
  formValidFrom = v.validFrom
    ? new Date(v.validFrom).toISOString().slice(0, 10)
    : "";
  formValidUntil = v.validUntil
    ? new Date(v.validUntil).toISOString().slice(0, 10)
    : "";
  formIsActive = v.isActive;
  isFormOpen = true;
}

async function handleSave() {
  if (
    !formCode.trim() ||
    !formValue ||
    !formUsageLimit ||
    !formValidFrom ||
    !formValidUntil ||
    isSaving
  )
    return;

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
      await api.admin
        .vouchers({ id: editingVoucher.id })
        .patch(payload, { headers: { authorization: `Bearer ${token}` } });
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
  if (!deleteTarget || isDeleting) return;
  isDeleting = true;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    await api.admin
      .vouchers({ id: deleteTarget.id })
      .delete({}, { headers: { authorization: `Bearer ${token}` } });
    showToast("Voucher deleted.");
    deleteTarget = null;
    await loadVouchers();
  } catch (err: any) {
    showToast(err.message || "Failed to delete voucher");
  } finally {
    isDeleting = false;
  }
}

$effect(() => {
  if (authStore.isInitialized && authStore.user) {
    loadVouchers();
  }
});

const inputClass =
  "body w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-[#F7F7F7] placeholder:text-[#F7F7F7]/25 focus:border-[#50C8C8]/40 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";
const labelClass = "mb-1.5 block caption text-[#F7F7F7]/40";
</script>

<svelte:head>
  <title>Voucher Management | PadelHive Admin</title>
</svelte:head>

<div class="flex flex-1 flex-col px-6 pb-6 pt-element lg:px-8 lg:pb-8 pt-8">
  <div class="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
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
        {@const status = getVoucherStatus(v)}
        <div
          class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6"
        >
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2 sm:gap-3">
                <h3 class="heading-2 font-mono tracking-wide text-[#F7F7F7] break-all">
                  {v.code}
                </h3>
                {#if status}
                  <span class="caption shrink-0 uppercase {status.color}">
                    {status.label}
                  </span>
                {/if}
              </div>
              <p class="body-sm mt-2 text-[#F7F7F7]/60">
                {v.type === "PERCENTAGE"
                  ? `${v.value}% off`
                  : `${formatIDR(v.value)} off`}
                {v.minPurchase != null ? ` · min ${formatIDR(v.minPurchase)}` : ""}
                {v.type === "PERCENTAGE" && v.maxDiscount != null
                  ? ` · max ${formatIDR(v.maxDiscount)}`
                  : ""}
              </p>
              <p class="caption mt-1 text-[#F7F7F7]/25">
                {formatDate(v.validFrom)} – {formatDate(v.validUntil)} · Used {v.usedCount ?? 0}/{v.usageLimit}
              </p>
            </div>
            <div class="mt-4 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-4 sm:mt-0 sm:border-0 sm:pt-0">
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

  <!-- Form Modal -->
  {#if isFormOpen}
    <div class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 px-4 py-10">
      <div class="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#0C1B26] p-6 shadow-2xl">
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

        <div class="mt-5 space-y-4">
          <div>
            <label class={labelClass} for="voucher-code">Code</label>
            <input
              id="voucher-code"
              bind:value={formCode}
              placeholder="WELCOME20"
              class="{inputClass} font-mono uppercase"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class={labelClass} for="voucher-type">Type</label>
              <FilterSelect
                value={formType}
                options={TYPE_OPTIONS}
                onChange={(val) => (formType = val as "NOMINAL" | "PERCENTAGE")}
                class="w-full"
                buttonClass="label flex w-full h-11 items-center justify-between gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-[#F7F7F7] hover:border-white/[0.15] transition-all"
              />
            </div>
            <div>
              <label class={labelClass} for="voucher-value">
                {formType === "PERCENTAGE" ? "Value (%)" : "Value (IDR)"}
              </label>
              <NumberInput
                id="voucher-value"
                bind:value={formValue}
                step={formType === "PERCENTAGE" ? 1 : 5000}
                min={0}
                max={formType === "PERCENTAGE" ? 100 : undefined}
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class={labelClass} for="voucher-min-purchase">Min Purchase (optional)</label>
              <NumberInput
                id="voucher-min-purchase"
                bind:value={formMinPurchase}
                placeholder="—"
                step={50000}
                min={0}
              />
            </div>
            <div>
              <label class={labelClass} for="voucher-max-discount">Max Discount (optional)</label>
              <NumberInput
                id="voucher-max-discount"
                bind:value={formMaxDiscount}
                placeholder="—"
                step={10000}
                min={0}
                disabled={formType !== "PERCENTAGE"}
              />
            </div>
          </div>

          <div>
            <label class={labelClass} for="voucher-usage-limit">Usage Limit</label>
            <NumberInput
              id="voucher-usage-limit"
              bind:value={formUsageLimit}
              step={10}
              min={1}
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class={labelClass} for="voucher-valid-from">Valid From</label>
              <DatePicker
                bind:value={formValidFrom}
                placeholder="Select Date"
                class="w-full"
                buttonClass="label flex w-full h-11 items-center justify-between gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-[#F7F7F7] hover:border-white/[0.15] transition-all"
              />
            </div>
            <div>
              <label class={labelClass} for="voucher-valid-until">Valid Until</label>
              <DatePicker
                bind:value={formValidUntil}
                placeholder="Select Date"
                class="w-full"
                buttonClass="label flex w-full h-11 items-center justify-between gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-[#F7F7F7] hover:border-white/[0.15] transition-all"
              />
            </div>
          </div>

          <label class="label flex items-center gap-2.5 text-[#F7F7F7]/60 cursor-pointer">
            <input
              type="checkbox"
              bind:checked={formIsActive}
              class="h-4 w-4 rounded border-white/20 bg-transparent"
            />
            Active
          </label>
        </div>

        <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onclick={() => (isFormOpen = false)}
            disabled={isSaving}
            class="label rounded-full border border-white/[0.08] px-5 py-2.5 text-[#F7F7F7]/60 transition-colors hover:border-white/[0.15] disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onclick={handleSave}
            disabled={isSaving || !formCode.trim() || !formValue || !formUsageLimit}
            class="btn-lime label flex items-center justify-center gap-2 rounded-full px-5 py-2.5 disabled:opacity-40"
          >
            {#if isSaving}
              <Loader2 class="h-3.5 w-3.5 animate-spin" />
            {:else if editingVoucher}
              Save Changes
            {:else}
              Create Voucher
            {/if}
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Delete Modal -->
  {#if deleteTarget}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div class="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0C1B26] p-6 shadow-2xl">
        <p class="section-label">Delete Voucher</p>
        <h2 class="heading-2 mt-3 text-[#F7F7F7]">
          Delete {deleteTarget.code}?
        </h2>
        <p class="body-sm mt-2 text-[#F7F7F7]/40">
          This permanently removes the voucher. If it has already been used on bookings, the server will block deletion — deactivate it instead by editing and turning off "Active".
        </p>
        <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onclick={() => (deleteTarget = null)}
            disabled={isDeleting}
            class="label rounded-full border border-white/[0.08] px-5 py-2.5 text-[#F7F7F7]/60 transition-colors hover:border-white/[0.15] disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onclick={handleDelete}
            disabled={isDeleting}
            class="label rounded-full bg-red-500/15 px-5 py-2.5 text-red-300 transition-colors hover:bg-red-500/25 disabled:opacity-40"
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
      <p class="body-sm text-[#F7F7F7]/60">{toast}</p>
    </div>
  {/if}
</div>
