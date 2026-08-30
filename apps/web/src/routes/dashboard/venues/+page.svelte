<script lang="ts">
import {
  Building2,
  CheckCircle2,
  Clock,
  Edit3,
  Eye,
  Loader2,
  MapPin,
  Plus,
  Star,
  Upload,
  X,
  XCircle,
} from "lucide-svelte";
import { onMount } from "svelte";
import { api } from "$lib/api/client";
import { authStore } from "$lib/auth/store.svelte";
import EmptyState from "$lib/components/ui/empty-state.svelte";
import TimeSelect from "$lib/components/ui/time-select.svelte";

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: any; color: string; bg: string }
> = {
  APPROVED: {
    label: "Approved",
    icon: CheckCircle2,
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
  PENDING: {
    label: "Pending Review",
    icon: Clock,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-400/10",
  },
  SUSPENDED: {
    label: "Suspended",
    icon: XCircle,
    color: "text-orange-400",
    bg: "bg-orange-400/10",
  },
};

const PRESET_FACILITIES = [
  "Parking",
  "Showers",
  "Locker Room",
  "Cafe",
  "Pro Shop",
  "WiFi",
  "Equipment Rental",
  "Seating Area",
];

let venues = $state<any[]>([]);
let isLoading = $state(true);
let toast = $state<string | null>(null);

// Modal state
let isModalOpen = $state(false);
let modalMode = $state<"add" | "edit">("add");
let editingVenue = $state<any | null>(null);
let isSubmitting = $state(false);

// Form state
let formName = $state("");
let formLocation = $state("");
let formCity = $state("");
let formDescription = $state("");
let formOpenTime = $state("06:00");
let formCloseTime = $state("23:00");
let formImageUrl = $state("");
let formPhotos = $state<string[]>([]);
let formFacilities = $state<string[]>([]);
let photoInput = $state("");
let facilityInput = $state("");

function showToast(msg: string) {
  toast = msg;
  setTimeout(() => (toast = null), 3000);
}

async function loadOwnerVenues() {
  isLoading = true;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    const res = await api.venues.manage.get({
      headers: { authorization: `Bearer ${token}` },
    });
    if (res.data && Array.isArray(res.data)) {
      venues = res.data;
    }
  } catch (e) {
    console.warn("Error fetching owner venues:", e);
  } finally {
    isLoading = false;
  }
}

function openAddModal() {
  modalMode = "add";
  editingVenue = null;
  formName = "";
  formLocation = "";
  formCity = "";
  formDescription = "";
  formOpenTime = "06:00";
  formCloseTime = "23:00";
  formImageUrl = "";
  formPhotos = [];
  formFacilities = [];
  photoInput = "";
  facilityInput = "";
  isModalOpen = true;
}

function openEditModal(v: any) {
  modalMode = "edit";
  editingVenue = v;
  formName = v.name || "";
  formLocation = v.location || "";
  formCity = v.city || "";
  formDescription = v.description || "";
  formOpenTime = v.operatingHours?.open || v.openTime || "06:00";
  formCloseTime = v.operatingHours?.close || v.closeTime || "23:00";
  formImageUrl = v.imageUrl || "";
  formPhotos = Array.isArray(v.photos) ? [...v.photos] : [];
  formFacilities = Array.isArray(v.facilities) ? [...v.facilities] : [];
  photoInput = "";
  facilityInput = "";
  isModalOpen = true;
}

function addPhoto() {
  const url = photoInput.trim();
  if (url && !formPhotos.includes(url)) {
    formPhotos = [...formPhotos, url];
    photoInput = "";
  }
}

function removePhoto(idx: number) {
  formPhotos = formPhotos.filter((_, i) => i !== idx);
}

function addFacility(facilityName: string) {
  const f = facilityName.trim();
  if (f && !formFacilities.includes(f)) {
    formFacilities = [...formFacilities, f];
    facilityInput = "";
  }
}

function removeFacility(idx: number) {
  formFacilities = formFacilities.filter((_, i) => i !== idx);
}

async function handleSubmit() {
  if (
    !formName.trim() ||
    !formLocation.trim() ||
    !formCity.trim() ||
    !formDescription.trim() ||
    isSubmitting
  ) {
    showToast("Please fill in all required fields.");
    return;
  }

  isSubmitting = true;
  try {
    const token = await authStore.firebaseUser?.getIdToken();
    if (!token) return;

    const payload = {
      name: formName.trim(),
      location: formLocation.trim(),
      city: formCity.trim(),
      description: formDescription.trim(),
      openTime: formOpenTime,
      closeTime: formCloseTime,
      imageUrl: formImageUrl.trim() || undefined,
      photos: formPhotos,
      facilities: formFacilities,
    };

    if (modalMode === "edit" && editingVenue) {
      await api
        .venues({ id: editingVenue.id })
        .patch(payload, { headers: { authorization: `Bearer ${token}` } });
      showToast("Venue updated.");
    } else {
      await api.venues.post(payload, {
        headers: { authorization: `Bearer ${token}` },
      });
      showToast("Venue submitted for approval.");
    }

    isModalOpen = false;
    await loadOwnerVenues();
  } catch (err: any) {
    showToast(err.message || "Failed to save venue");
  } finally {
    isSubmitting = false;
  }
}

$effect(() => {
  if (authStore.isInitialized && authStore.user) {
    loadOwnerVenues();
  }
});

onMount(() => {
  if (authStore.user) loadOwnerVenues();
});

const inputWrapperClass =
  "relative flex h-11 w-full items-center overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02] transition-colors focus-within:border-[#50C8C8]/40";
const inputClass =
  "body h-full w-full bg-transparent px-4 py-2.5 text-[#F7F7F7] placeholder:text-[#F7F7F7]/25 outline-none";
const labelClass = "mb-1.5 block caption text-[#F7F7F7]/40 font-medium";
</script>

<svelte:head>
  <title>Venues Management | Padelhive Owner</title>
</svelte:head>

<div class="py-8">
  <section class="container">
    <!-- Header -->
    <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 class="heading-1 text-[#F7F7F7]">Venues</h1>
        <p class="body mt-1 text-[#F7F7F7]/40">
          Manage your padel venues
        </p>
      </div>
      <button
        type="button"
        onclick={openAddModal}
        class="label btn-lime flex h-11 w-full items-center justify-center gap-2 rounded-full px-5 sm:h-10 sm:w-auto"
      >
        <Plus class="h-4 w-4" />
        Add Venue
      </button>
    </div>

    <!-- Venue List -->
    <div class="mt-8 space-y-4">
      {#if isLoading}
        {#each Array.from({ length: 2 }) as _, i}
          <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-3">
                  <div class="h-6 w-48 animate-pulse rounded-md bg-white/[0.04]"></div>
                </div>
                <div class="mt-2 h-4 w-64 animate-pulse rounded-md bg-white/[0.04]"></div>
                <div class="mt-4 flex flex-wrap items-center gap-4">
                  <div class="h-4 w-16 animate-pulse rounded-md bg-white/[0.04]"></div>
                  <div class="h-4 w-20 animate-pulse rounded-md bg-white/[0.04]"></div>
                  <div class="h-4 w-32 animate-pulse rounded-md bg-white/[0.04]"></div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <div class="h-8 w-24 animate-pulse rounded-full bg-white/[0.04]"></div>
                {#each Array.from({ length: 3 }) as _, j}
                  <div class="h-9 w-9 animate-pulse rounded-lg bg-white/[0.04]"></div>
                {/each}
              </div>
            </div>
            <div class="mt-4 flex flex-wrap gap-2 border-t border-white/[0.04] pt-4">
              {#each Array.from({ length: 4 }) as _, j}
                <div class="h-6 w-16 animate-pulse rounded-full bg-white/[0.04]"></div>
              {/each}
            </div>
          </div>
        {/each}
      {:else if venues.length === 0}
        <EmptyState
          icon={Building2}
          title="No venues yet"
          description="Add your first venue to start managing courts and bookings."
          actionLabel="Add Venue"
          onAction={openAddModal}
        />
      {:else}
        {#each venues as venue (venue.id)}
          {@const status = venue.status ?? "PENDING"}
          {@const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING}
          {@const StatusIcon = config.icon}

          <div class="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 transition-all hover:border-white/[0.1]">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-3">
                  <h3 class="heading-3 truncate text-[#F7F7F7]">{venue.name}</h3>
                  {#if venue.isVerified}
                    <span class="caption shrink-0 rounded-full bg-[#E6FA50] px-2 py-0.5 uppercase text-[#06121A]">
                      Verified
                    </span>
                  {/if}
                </div>
                <p class="body-sm mt-1 flex items-center gap-1.5 text-[#F7F7F7]/40">
                  <MapPin class="h-3.5 w-3.5" />
                  {venue.location} · {venue.city}
                </p>
                <div class="mt-3 flex flex-wrap items-center gap-4">
                  <span class="body-sm flex items-center gap-1.5 text-[#F7F7F7]/25">
                    <Star class="h-3 w-3 fill-[#E6FA50] text-[#E6FA50]" />
                    {venue.rating || "5.0"} ({venue.reviewCount || 0})
                  </span>
                  <span class="body-sm text-[#F7F7F7]/25">
                    {venue.courtCount ?? 0} courts
                  </span>
                  <span class="body-sm text-[#F7F7F7]/25">
                    {venue.operatingHours?.open || venue.openTime || "06:00"} – {venue.operatingHours?.close || venue.closeTime || "23:00"}
                  </span>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <div class="flex items-center gap-1.5 rounded-full px-3 py-1.5 {config.bg}">
                  <StatusIcon class="h-3.5 w-3.5 {config.color}" />
                  <span class="caption {config.color}">{config.label}</span>
                </div>
                <a
                  href={`/venues/${venue.id}`}
                  class="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] text-[#F7F7F7]/25 transition-colors hover:border-white/[0.12] hover:text-[#F7F7F7]/60"
                  title="View venue"
                >
                  <Eye class="h-3.5 w-3.5" />
                </a>
                <button
                  type="button"
                  onclick={() => openEditModal(venue)}
                  class="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] text-[#F7F7F7]/25 transition-colors hover:border-white/[0.12] hover:text-[#F7F7F7]/60"
                  title="Edit venue"
                >
                  <Edit3 class="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {#if venue.facilities && venue.facilities.length > 0}
              <div class="mt-4 flex flex-wrap gap-2 border-t border-white/[0.04] pt-4">
                {#each venue.facilities as f}
                  <span class="caption rounded-full bg-white/[0.03] px-3 py-1 text-[#F7F7F7]/25">
                    {f}
                  </span>
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      {/if}
    </div>

    <!-- Venue Add/Edit Modal -->
    {#if isModalOpen}
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
        <button
          type="button"
          class="absolute inset-0 bg-transparent w-full h-full border-0 cursor-default"
          onclick={() => (isModalOpen = false)}
          aria-label="Close modal backdrop"
        ></button>

        <div class="relative flex w-full max-w-3xl flex-col rounded-2xl border border-white/[0.08] bg-[#0C1B26] p-6 shadow-2xl z-10">
          <!-- Modal Header -->
          <div class="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-5">
            <p class="section-label">
              {modalMode === "add" ? "Add New Venue" : "Edit Venue"}
            </p>
            <button
              type="button"
              onclick={() => (isModalOpen = false)}
              class="text-[#F7F7F7]/40 hover:text-[#F7F7F7]"
            >
              <X class="h-4 w-4" />
            </button>
          </div>

          <!-- 2-Column Form Body -->
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <!-- Left Column: Core Info -->
            <div class="space-y-4">
              <div>
                <label class={labelClass} for="venue-name">Venue Name *</label>
                <div class={inputWrapperClass}>
                  <input
                    id="venue-name"
                    bind:value={formName}
                    placeholder="e.g. Padel Bali Arena"
                    class={inputClass}
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class={labelClass} for="venue-city">City *</label>
                  <div class={inputWrapperClass}>
                    <input
                      id="venue-city"
                      bind:value={formCity}
                      placeholder="e.g. Bali"
                      class={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label class={labelClass} for="venue-location">Address *</label>
                  <div class={inputWrapperClass}>
                    <input
                      id="venue-location"
                      bind:value={formLocation}
                      placeholder="Jl. Sunset Road No. 88"
                      class={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class={labelClass} for="venue-open">Open Time</label>
                  <TimeSelect
                    bind:value={formOpenTime}
                    ariaLabel="Open time"
                  />
                </div>
                <div>
                  <label class={labelClass} for="venue-close">Close Time</label>
                  <TimeSelect
                    bind:value={formCloseTime}
                    ariaLabel="Close time"
                  />
                </div>
              </div>

              <div>
                <label class={labelClass} for="venue-desc">Description *</label>
                <div class="relative flex w-full items-center overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02] focus-within:border-[#50C8C8]/40">
                  <textarea
                    id="venue-desc"
                    rows={3}
                    bind:value={formDescription}
                    placeholder="Describe your venue facilities..."
                    class="body w-full bg-transparent px-4 py-2.5 text-[#F7F7F7] placeholder:text-[#F7F7F7]/25 outline-none resize-none"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Right Column: Media & Facilities -->
            <div class="space-y-4">
              <!-- Integrated Cover Image Input with Choose File Button -->
              <div>
                <label class={labelClass} for="venue-cover">Cover Image URL (Optional)</label>
                <div class={inputWrapperClass}>
                  <input
                    id="venue-cover"
                    type="url"
                    bind:value={formImageUrl}
                    placeholder="https://images.unsplash.com/..."
                    class={inputClass}
                  />
                  <button
                    type="button"
                    onclick={() => showToast("File picker ready. You can also paste image URL.")}
                    class="label flex h-[32px] shrink-0 items-center gap-1.5 rounded-lg bg-[#E6FA50] px-3 mr-1.5 text-xs font-semibold text-[#06121A] transition-colors hover:bg-[#d4e845]"
                  >
                    <Upload class="h-3.5 w-3.5" />
                    Choose file
                  </button>
                </div>
              </div>

              <!-- Integrated Photo Gallery Input -->
              <div>
                <label class={labelClass} for="venue-photo-draft">Photo Gallery (Optional)</label>
                <div class={inputWrapperClass}>
                  <input
                    id="venue-photo-draft"
                    type="url"
                    bind:value={photoInput}
                    onkeydown={(e) => e.key === "Enter" && (e.preventDefault(), addPhoto())}
                    placeholder="Photo URL..."
                    class={inputClass}
                  />
                  <button
                    type="button"
                    onclick={addPhoto}
                    class="label flex h-[32px] shrink-0 items-center gap-1.5 rounded-lg bg-[#E6FA50] px-3 mr-1.5 text-xs font-semibold text-[#06121A] transition-colors hover:bg-[#d4e845]"
                  >
                    <Plus class="h-3.5 w-3.5" />
                    Choose file
                  </button>
                </div>

                {#if formPhotos.length > 0}
                  <div class="mt-2 flex flex-wrap gap-1.5 max-h-20 overflow-y-auto no-scrollbar">
                    {#each formPhotos as p, idx}
                      <span class="caption flex items-center gap-1.5 rounded-lg bg-white/[0.04] px-2.5 py-1 text-[#F7F7F7]/60">
                        <span class="truncate max-w-[120px]">{p}</span>
                        <button type="button" onclick={() => removePhoto(idx)} class="text-white/40 hover:text-red-400">
                          <X class="h-3 w-3" />
                        </button>
                      </span>
                    {/each}
                  </div>
                {/if}
              </div>

              <!-- Integrated Facilities Input -->
              <div>
                <label class={labelClass} for="venue-facility-draft">Facilities (Optional)</label>
                <div class={inputWrapperClass}>
                  <input
                    id="venue-facility-draft"
                    type="text"
                    bind:value={facilityInput}
                    onkeydown={(e) => e.key === "Enter" && (e.preventDefault(), addFacility(facilityInput))}
                    placeholder="Custom facility..."
                    class={inputClass}
                  />
                  <button
                    type="button"
                    onclick={() => addFacility(facilityInput)}
                    class="label flex h-[32px] shrink-0 items-center gap-1.5 rounded-lg bg-[#E6FA50] px-3.5 mr-1.5 text-xs font-semibold text-[#06121A] transition-colors hover:bg-[#d4e845]"
                  >
                    <Plus class="h-3.5 w-3.5" />
                    Add
                  </button>
                </div>

                {#if formFacilities.length > 0}
                  <div class="mt-2 flex flex-wrap gap-1.5">
                    {#each formFacilities as f, idx}
                      <span class="caption flex items-center gap-1 rounded-full bg-[#E6FA50]/10 px-2.5 py-0.5 text-[#E6FA50]">
                        {f}
                        <button type="button" onclick={() => removeFacility(idx)} class="hover:text-white">
                          <X class="h-3 w-3" />
                        </button>
                      </span>
                    {/each}
                  </div>
                {/if}

                <div class="mt-2">
                  <p class="caption text-[#F7F7F7]/30 mb-1">Quick Add:</p>
                  <div class="flex flex-wrap gap-1">
                    {#each PRESET_FACILITIES as preset}
                      <button
                        type="button"
                        onclick={() => addFacility(preset)}
                        disabled={formFacilities.includes(preset)}
                        class="caption rounded-md border border-white/[0.06] px-2 py-0.5 text-[11px] text-[#F7F7F7]/40 hover:border-[#E6FA50]/40 hover:text-[#F7F7F7] disabled:opacity-20"
                      >
                        + {preset}
                      </button>
                    {/each}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="mt-6 flex justify-end gap-3 border-t border-white/[0.06] pt-4">
            <button
              type="button"
              onclick={() => (isModalOpen = false)}
              disabled={isSubmitting}
              class="label rounded-full border border-white/[0.08] px-5 py-2.5 text-[#F7F7F7]/60 transition-colors hover:border-white/[0.15] disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="button"
              onclick={handleSubmit}
              disabled={isSubmitting || !formName.trim() || !formLocation.trim() || !formCity.trim()}
              class="btn-lime label flex items-center justify-center gap-2 rounded-full px-6 py-2.5 disabled:opacity-40"
            >
              {#if isSubmitting}
                <Loader2 class="h-3.5 w-3.5 animate-spin" />
              {:else if modalMode === "edit"}
                Save Changes
              {:else}
                Submit for Approval
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
