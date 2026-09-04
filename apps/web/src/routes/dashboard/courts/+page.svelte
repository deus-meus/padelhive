<script lang="ts">
import {
  Building2,
  CheckCircle2,
  Loader2,
  Pencil,
  Plus,
  Power,
  SlidersHorizontal,
  Sun,
  Tag,
  Trash2,
  X,
  XCircle,
  Zap,
} from "lucide-svelte";
import { api } from "$lib/api/client";
import { authStore } from "$lib/auth/store.svelte";
import EmptyState from "$lib/components/ui/empty-state.svelte";
import FormInput from "$lib/components/ui/form-input.svelte";
import NumberInput from "$lib/components/ui/number-input.svelte";

let venues = $state<any[]>([]);
let selectedVenueId = $state<string | null>(null);
let courts = $state<any[]>([]);
let isLoading = $state(true);
let toast = $state<string | null>(null);

// Modal state
let isModalOpen = $state(false);
let modalMode = $state<"add" | "edit">("add");
let editingCourt = $state<any | null>(null);
let isSubmitting = $state(false);

// Delete target state
let deleteTarget = $state<any | null>(null);
let isDeleting = $state(false);

// Form state
let formName = $state("");
let formType = $state<"INDOOR" | "OUTDOOR">("INDOOR");
let formWeekdayOffPeak = $state(150000);
let formWeekdayPeak = $state(200000);
let formWeekendOffPeak = $state(200000);
let formWeekendPeak = $state(250000);
let formIsActive = $state(true);

const activeVenueId = $derived(
  selectedVenueId || (venues.length > 0 ? venues[0].id : null),
);
const activeVenue = $derived(venues.find((v) => v.id === activeVenueId));

function showToast(msg: string) {
  toast = msg;
  setTimeout(() => (toast = null), 3000);
}

function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

async function loadOwnerCourtsData() {
  if (!authStore.firebaseUser) return;
  isLoading = true;
  try {
    const token = await authStore.firebaseUser.getIdToken();
    if (!token) return;

    const resVenues = await api.venues.manage.get({
      headers: { authorization: `Bearer ${token}` },
    });
    if (resVenues.data && Array.isArray(resVenues.data)) {
      venues = resVenues.data;
      const vId = selectedVenueId || (venues.length > 0 ? venues[0].id : null);
      if (vId) {
        const resCourts = await api.venues({ id: vId }).courts.manage.get({
          headers: { authorization: `Bearer ${token}` },
        });
        if (resCourts.data && Array.isArray(resCourts.data)) {
          courts = resCourts.data;
        }
      }
    }
  } catch (e) {
    console.warn("Error fetching owner courts:", e);
  } finally {
    isLoading = false;
  }
}

async function handleVenueChange(vId: string) {
  selectedVenueId = vId;
  isLoading = true;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    const resCourts = await api.venues({ id: vId }).courts.manage.get({
      headers: { authorization: `Bearer ${token}` },
    });
    if (resCourts.data && Array.isArray(resCourts.data)) {
      courts = resCourts.data;
    }
  } catch (e) {
    console.warn("Error changing venue:", e);
  } finally {
    isLoading = false;
  }
}

function openAddModal() {
  modalMode = "add";
  editingCourt = null;
  formName = `Court ${courts.length + 1}`;
  formType = "INDOOR";
  formWeekdayOffPeak = 150000;
  formWeekdayPeak = 200000;
  formWeekendOffPeak = 200000;
  formWeekendPeak = 250000;
  formIsActive = true;
  isModalOpen = true;
}

function openEditModal(court: any) {
  modalMode = "edit";
  editingCourt = court;
  formName = court.name || "";
  formType = court.type || "INDOOR";
  formWeekdayOffPeak =
    court.weekdayOffPeak ?? court.pricing?.weekdayOffPeak ?? 150000;
  formWeekdayPeak = court.weekdayPeak ?? court.pricing?.weekdayPeak ?? 200000;
  formWeekendOffPeak =
    court.weekendOffPeak ?? court.pricing?.weekendOffPeak ?? 200000;
  formWeekendPeak = court.weekendPeak ?? court.pricing?.weekendPeak ?? 250000;
  formIsActive = court.isActive ?? true;
  isModalOpen = true;
}

async function handleSubmit() {
  if (!activeVenueId || !formName.trim() || isSubmitting) return;
  isSubmitting = true;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    const body = {
      name: formName.trim(),
      type: formType,
      weekdayOffPeak: Number(formWeekdayOffPeak),
      weekdayPeak: Number(formWeekdayPeak),
      weekendOffPeak: Number(formWeekendOffPeak),
      weekendPeak: Number(formWeekendPeak),
      isActive: formIsActive,
    };

    if (modalMode === "add") {
      const res = await api.venues({ id: activeVenueId }).courts.post(body, {
        headers: { authorization: `Bearer ${token}` },
      });
      if (res.data) {
        showToast("Court added successfully.");
        isModalOpen = false;
        await handleVenueChange(activeVenueId);
      }
    } else if (editingCourt) {
      const res = await api
        .venues({ id: activeVenueId })
        .courts({ courtId: editingCourt.id })
        .patch(body, {
          headers: { authorization: `Bearer ${token}` },
        });
      if (res.data) {
        showToast("Court updated successfully.");
        isModalOpen = false;
        await handleVenueChange(activeVenueId);
      }
    }
  } catch (e: any) {
    showToast(e.message || "Failed to save court");
  } finally {
    isSubmitting = false;
  }
}

async function handleToggleStatus(court: any) {
  if (!activeVenueId) return;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    const nextStatus = !court.isActive;
    const res = await api
      .venues({ id: activeVenueId })
      .courts({ courtId: court.id })
      .patch(
        { isActive: nextStatus },
        { headers: { authorization: `Bearer ${token}` } },
      );
    if (res.data) {
      showToast(nextStatus ? "Court activated." : "Court deactivated.");
      await handleVenueChange(activeVenueId);
    }
  } catch (e: any) {
    showToast(e.message || "Failed to toggle court status");
  }
}

async function handleDeleteConfirm() {
  if (!activeVenueId || !deleteTarget || isDeleting) return;
  isDeleting = true;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    const res = await api
      .venues({ id: activeVenueId })
      .courts({ courtId: deleteTarget.id })
      .patch(
        { isActive: false },
        { headers: { authorization: `Bearer ${token}` } },
      );
    if (res.data) {
      showToast(`Court ${deleteTarget.name} deactivated.`);
      deleteTarget = null;
      await handleVenueChange(activeVenueId);
    }
  } catch (e: any) {
    showToast(e.message || "Failed to delete court");
  } finally {
    isDeleting = false;
  }
}

$effect(() => {
  if (authStore.isInitialized && authStore.user && authStore.firebaseUser) {
    loadOwnerCourtsData();
  }
});

const labelClass = "mb-1.5 block text-xs text-[#F7F7F7]/50 font-medium";
</script>

<svelte:head>
  <title>Courts & Pricing | Padelhive Owner</title>
</svelte:head>

<div class="py-8">
  <section class="container">
    <!-- Header -->
    <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 class="heading-1 text-[#F7F7F7]">Courts & Pricing</h1>
        <p class="body mt-1 text-[#F7F7F7]/40">
          Manage courts and dynamic pricing
        </p>
      </div>
      <button
        type="button"
        onclick={openAddModal}
        disabled={!activeVenueId}
        class="label btn-lime flex h-11 w-full items-center justify-center gap-2 rounded-full px-5 disabled:opacity-50 disabled:cursor-not-allowed sm:h-10 sm:w-auto"
      >
        <Plus class="h-4 w-4" />
        Add Court
      </button>
    </div>

    {#if isLoading || !authStore.isInitialized || authStore.isLoading}
      <!-- 1:1 Precision Skeleton for Courts & Pricing -->
      <div class="mt-6 flex gap-2">
        {#each Array.from({ length: 3 }) as _, i}
          <div class="h-9 w-28 animate-pulse rounded-full bg-white/[0.04]"></div>
        {/each}
      </div>

      <div class="mt-8 space-y-4">
        {#each Array.from({ length: 2 }) as _, i}
          <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
            <div class="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div class="flex flex-wrap items-center gap-3">
                <div class="h-6 w-36 animate-pulse rounded-md bg-white/[0.04]"></div>
                <div class="h-5 w-20 animate-pulse rounded-full bg-white/[0.04]"></div>
                <div class="h-5 w-16 animate-pulse rounded-full bg-white/[0.04]"></div>
              </div>
              <div class="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                <div class="h-9 w-24 animate-pulse rounded-lg bg-white/[0.04]"></div>
                <div class="h-9 w-28 animate-pulse rounded-lg bg-white/[0.04]"></div>
              </div>
            </div>

            <div class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {#each Array.from({ length: 4 }) as _, j}
                <div class="h-[96px] animate-pulse rounded-xl border border-white/[0.04] bg-white/[0.02] p-4">
                  <div class="h-3 w-24 animate-pulse rounded bg-white/[0.04]"></div>
                  <div class="mt-3 h-6 w-20 animate-pulse rounded bg-white/[0.04]"></div>
                </div>
              {/each}
            </div>

            <div class="mt-4 flex items-center gap-4 border-t border-white/[0.04] pt-4">
              <div class="h-3 w-48 animate-pulse rounded bg-white/[0.04]"></div>
              <div class="h-3 w-32 animate-pulse rounded bg-white/[0.04]"></div>
            </div>
          </div>
        {/each}
      </div>
    {:else if venues.length === 0}
      <div class="mt-8">
        <EmptyState
          icon={Building2}
          title="No venues yet"
          description="Add a venue first to manage its courts and pricing."
          actionLabel="Go to Venues"
          onAction={() => showToast("Please add a venue first.")}
        />
      </div>
    {:else}
      <!-- Venue selector tabs -->
      <div class="mt-6 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {#each venues as v (v.id)}
          <button
            type="button"
            onclick={() => handleVenueChange(v.id)}
            class="label whitespace-nowrap rounded-xl px-4 py-2 transition-all {activeVenueId === v.id
              ? 'bg-[#E6FA50] text-[#06121A]'
              : 'bg-white/[0.03] text-[#F7F7F7]/40 hover:bg-white/[0.06] hover:text-[#F7F7F7]/60'}"
          >
            {v.name}
          </button>
        {/each}
      </div>

      <!-- Courts List -->
      <div class="mt-8 space-y-4">
        {#each courts as court (court.id)}
          <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 transition-all hover:border-white/[0.12]">
            <div class="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div class="flex flex-wrap items-center gap-3">
                <h3 class="heading-2 text-[#F7F7F7]">{court.name}</h3>
                <span class="caption rounded-full bg-white/[0.04] px-3 py-1 text-[#F7F7F7]/60 font-medium">
                  {court.type || "INDOOR"}
                </span>
                {#if court.isActive}
                  <span class="caption flex items-center gap-1 rounded-full bg-green-400/10 px-2.5 py-0.5 text-green-400 font-medium">
                    <CheckCircle2 class="h-3 w-3" /> Active
                  </span>
                {:else}
                  <span class="caption flex items-center gap-1 rounded-full bg-red-400/10 px-2.5 py-0.5 text-red-400 font-medium">
                    <XCircle class="h-3 w-3" /> Inactive
                  </span>
                {/if}
              </div>

              <!-- Court Actions -->
              <div class="flex flex-wrap items-center gap-2">
                <!-- Activate / Deactivate button -->
                <button
                  type="button"
                  onclick={() => handleToggleStatus(court)}
                  class="label flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-all {court.isActive ? 'border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20' : 'border-green-500/20 bg-green-500/10 text-green-400 hover:bg-green-500/20'}"
                >
                  <Power class="h-3.5 w-3.5" />
                  {court.isActive ? "Deactivate" : "Activate"}
                </button>

                <!-- Edit Pricing button -->
                <button
                  type="button"
                  onclick={() => openEditModal(court)}
                  class="label flex h-9 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3.5 text-xs font-medium text-[#F7F7F7]/80 transition-all hover:border-white/[0.15] hover:bg-white/[0.06] hover:text-[#F7F7F7]"
                >
                  <Pencil class="h-3.5 w-3.5 text-[#E6FA50]" />
                  Edit Pricing
                </button>

                <!-- Delete button -->
                <button
                  type="button"
                  onclick={() => (deleteTarget = court)}
                  class="label flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 transition-all hover:bg-red-500/20"
                  aria-label="Delete court"
                >
                  <Trash2 class="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <!-- Pricing Grid -->
            <div class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div class="rounded-xl border border-white/[0.04] bg-white/[0.02] p-4">
                <div class="flex items-center gap-1.5">
                  <Sun class="h-3.5 w-3.5 text-[#F7F7F7]/40" />
                  <span class="caption text-[#F7F7F7]/40">Weekday Off-Peak</span>
                </div>
                <p class="price mt-2 text-[#F7F7F7]/80">
                  {formatIDR(court.weekdayOffPeak ?? court.pricing?.weekdayOffPeak ?? 150000)}
                </p>
              </div>

              <div class="rounded-xl border border-[#E6FA50]/20 bg-[#E6FA50]/[0.04] p-4">
                <div class="flex items-center gap-1.5">
                  <Zap class="h-3.5 w-3.5 text-[#E6FA50]" />
                  <span class="caption text-[#E6FA50]/80">Weekday Peak</span>
                </div>
                <p class="price mt-2 text-[#E6FA50]">
                  {formatIDR(court.weekdayPeak ?? court.pricing?.weekdayPeak ?? 200000)}
                </p>
              </div>

              <div class="rounded-xl border border-white/[0.04] bg-white/[0.02] p-4">
                <div class="flex items-center gap-1.5">
                  <Sun class="h-3.5 w-3.5 text-[#F7F7F7]/40" />
                  <span class="caption text-[#F7F7F7]/40">Weekend Off-Peak</span>
                </div>
                <p class="price mt-2 text-[#F7F7F7]/80">
                  {formatIDR(court.weekendOffPeak ?? court.pricing?.weekendOffPeak ?? 200000)}
                </p>
              </div>

              <div class="rounded-xl border border-[#E6FA50]/20 bg-[#E6FA50]/[0.04] p-4">
                <div class="flex items-center gap-1.5">
                  <Zap class="h-3.5 w-3.5 text-[#E6FA50]" />
                  <span class="caption text-[#E6FA50]/80">Weekend Peak</span>
                </div>
                <p class="price mt-2 text-[#E6FA50]">
                  {formatIDR(court.weekendPeak ?? court.pricing?.weekendPeak ?? 250000)}
                </p>
              </div>
            </div>

            <!-- Peak hours info -->
            <div class="mt-4 flex items-center justify-between border-t border-white/[0.04] pt-4">
              <span class="caption text-[#F7F7F7]/40">
                Peak hours: 09:00–11:00 & 16:00–21:00
              </span>
              <span class="caption text-[#F7F7F7]/40">
                Venue: {activeVenue?.name || "—"}
              </span>
            </div>
          </div>
        {/each}

        {#if courts.length === 0 && activeVenueId}
          <div class="mt-8 rounded-2xl border border-dashed border-white/[0.08] p-12 text-center">
            <p class="body text-[#F7F7F7]/40">
              No courts added for this venue yet.
            </p>
            <button
              type="button"
              onclick={openAddModal}
              class="label btn-lime mt-4 rounded-full px-6 py-2.5 inline-flex items-center gap-2"
            >
              <Plus class="h-4 w-4" />
              Add First Court
            </button>
          </div>
        {/if}
      </div>
    {/if}

    <!-- Add / Edit Court Modal -->
    {#if isModalOpen}
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <button
          type="button"
          class="absolute inset-0 bg-[#06121A]/80 backdrop-blur-sm w-full h-full border-0 cursor-default"
          onclick={() => (isModalOpen = false)}
          aria-label="Close modal"
        ></button>
        <div class="relative w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#0C1B26] p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto no-scrollbar">
          <div class="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <div class="flex items-center gap-3">
              <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#50C8C8]/10 text-[#50C8C8] border border-[#50C8C8]/20">
                <SlidersHorizontal class="h-5 w-5" />
              </div>
              <div>
                <h2 class="heading-2 text-base text-[#F7F7F7]">
                  {modalMode === "add" ? "Add New Court" : "Edit Court & Pricing"}
                </h2>
                <p class="caption text-[#F7F7F7]/40 text-xs">
                  Configure court details and dynamic pricing rates
                </p>
              </div>
            </div>
            <button
              type="button"
              onclick={() => (isModalOpen = false)}
              class="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-[#F7F7F7]/40 hover:border-white/[0.15] hover:text-[#F7F7F7] transition-all"
            >
              <X class="h-4 w-4" />
            </button>
          </div>

          <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="mt-5 space-y-4">
            <!-- Court Name -->
            <FormInput
              id="court-name-input"
              label="Court Name"
              required
              icon={Tag}
              bind:value={formName}
              placeholder="e.g. Court 1 (Center Court)"
            />

            <!-- Court Type & Active Toggle -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <span class={labelClass}>Court Type</span>
                <div class="flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.02] p-1">
                  <button
                    type="button"
                    onclick={() => (formType = "INDOOR")}
                    class="flex-1 rounded-lg text-xs font-semibold transition-all {formType === 'INDOOR' ? 'bg-[#E6FA50] text-[#06121A] shadow-sm' : 'text-[#F7F7F7]/40 hover:text-[#F7F7F7]'}"
                  >
                    Indoor
                  </button>
                  <button
                    type="button"
                    onclick={() => (formType = "OUTDOOR")}
                    class="flex-1 rounded-lg text-xs font-semibold transition-all {formType === 'OUTDOOR' ? 'bg-[#E6FA50] text-[#06121A] shadow-sm' : 'text-[#F7F7F7]/40 hover:text-[#F7F7F7]'}"
                  >
                    Outdoor
                  </button>
                </div>
              </div>

              <div>
                <span class={labelClass}>Status</span>
                <button
                  type="button"
                  onclick={() => (formIsActive = !formIsActive)}
                  class="flex h-11 w-full items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 transition-colors hover:border-white/[0.15]"
                >
                  <span class="body-sm font-semibold {formIsActive ? 'text-green-400' : 'text-red-400'}">
                    {formIsActive ? "Active" : "Inactive"}
                  </span>
                  <div class="relative inline-flex h-5 w-9 items-center rounded-full p-0.5 transition-colors {formIsActive ? 'bg-[#E6FA50]' : 'bg-white/[0.15]'}">
                    <span class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out {formIsActive ? 'translate-x-4' : 'translate-x-0'}"></span>
                  </div>
                </button>
              </div>
            </div>

            <!-- Dynamic Pricing Grid (4 Inputs) -->
            <div class="pt-2">
              <p class="section-label mb-3">Dynamic Pricing (IDR)</p>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label for="weekday-offpeak-input" class={labelClass}>Weekday Off-Peak</label>
                  <NumberInput
                    id="weekday-offpeak-input"
                    bind:value={formWeekdayOffPeak}
                    step={10000}
                    min={0}
                    placeholder="150000"
                  />
                </div>
                <div>
                  <label for="weekday-peak-input" class={labelClass}>Weekday Peak</label>
                  <NumberInput
                    id="weekday-peak-input"
                    bind:value={formWeekdayPeak}
                    step={10000}
                    min={0}
                    placeholder="200000"
                  />
                </div>
                <div>
                  <label for="weekend-offpeak-input" class={labelClass}>Weekend Off-Peak</label>
                  <NumberInput
                    id="weekend-offpeak-input"
                    bind:value={formWeekendOffPeak}
                    step={10000}
                    min={0}
                    placeholder="200000"
                  />
                </div>
                <div>
                  <label for="weekend-peak-input" class={labelClass}>Weekend Peak</label>
                  <NumberInput
                    id="weekend-peak-input"
                    bind:value={formWeekendPeak}
                    step={10000}
                    min={0}
                    placeholder="250000"
                  />
                </div>
              </div>
            </div>

            <!-- Modal Footer Actions -->
            <div class="mt-6 flex items-center justify-end gap-3 border-t border-white/[0.06] pt-4">
              <button
                type="button"
                onclick={() => (isModalOpen = false)}
                disabled={isSubmitting}
                class="label rounded-xl px-5 py-2.5 text-[#F7F7F7]/60 hover:bg-white/[0.04] hover:text-[#F7F7F7] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                class="btn-lime label flex items-center gap-2 rounded-full px-6 py-2.5 font-semibold text-[#06121A] bg-[#E6FA50] hover:bg-[#E6FA50]/90 disabled:opacity-50"
              >
                {#if isSubmitting}
                  <Loader2 class="h-4 w-4 animate-spin" /> Saving...
                {:else}
                  Save Court
                {/if}
              </button>
            </div>
          </form>
        </div>
      </div>
    {/if}

    <!-- Delete Confirmation Modal -->
    {#if deleteTarget}
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <button
          type="button"
          class="absolute inset-0 bg-[#06121A]/80 backdrop-blur-sm w-full h-full border-0 cursor-default"
          onclick={() => (deleteTarget = null)}
          aria-label="Close modal"
        ></button>
        <div class="relative w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0C1B26] p-6 shadow-2xl z-10">
          <h3 class="heading-2 text-xl text-[#F7F7F7]">Deactivate Court</h3>
          <p class="body-sm mt-3 text-[#F7F7F7]/60">
            Are you sure you want to deactivate <span class="text-[#F7F7F7] font-semibold">{deleteTarget.name}</span>? Users will no longer be able to book this court until it is reactivated.
          </p>
          <div class="mt-6 flex items-center justify-end gap-3 border-t border-white/[0.06] pt-4">
            <button
              type="button"
              onclick={() => (deleteTarget = null)}
              disabled={isDeleting}
              class="label rounded-xl px-5 py-2 text-[#F7F7F7]/60 hover:bg-white/[0.04] hover:text-[#F7F7F7] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onclick={handleDeleteConfirm}
              disabled={isDeleting}
              class="label flex items-center gap-2 rounded-full bg-red-500 px-5 py-2 font-semibold text-white hover:bg-red-600 disabled:opacity-50"
            >
              {#if isDeleting}
                <Loader2 class="h-4 w-4 animate-spin" /> Deactivating...
              {:else}
                Deactivate Court
              {/if}
            </button>
          </div>
        </div>
      </div>
    {/if}

    <!-- Toast -->
    {#if toast}
      <div class="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-white/[0.08] bg-[#0C1B26] px-5 py-3 shadow-2xl shadow-black/40">
        <p class="body text-[#F7F7F7]/60">{toast}</p>
      </div>
    {/if}
  </section>
</div>
