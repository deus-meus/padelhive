<script lang="ts">
import {
  Building2,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Image as ImageIcon,
  Images as ImagesIcon,
  Loader2,
  MapPin,
  Navigation,
  Pencil,
  Plus,
  Sparkles,
  Star,
  Upload,
  X,
  XCircle,
} from "lucide-svelte";
import { api } from "$lib/api/client";
import { authStore } from "$lib/auth/store.svelte";
import EmptyState from "$lib/components/ui/empty-state.svelte";
import FormInput from "$lib/components/ui/form-input.svelte";
import FormTextarea from "$lib/components/ui/form-textarea.svelte";
import TimeSelect from "$lib/components/ui/time-select.svelte";
import { padelImg } from "$lib/images";

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
  "Shower",
  "Locker",
  "Cafe",
  "Pro Shop",
  "WiFi",
  "Coaching",
  "Equipment Rental",
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
let formLatitude = $state("");
let formLongitude = $state("");
let formDescription = $state("");
let formOpenTime = $state("06:00");
let formCloseTime = $state("23:00");
let formImageUrl = $state("");
let formPhotos = $state<string[]>([]);
let formFacilities = $state<string[]>([]);
let photoInput = $state("");
let facilityInput = $state("");

// Real File Picker references
let coverFileInputRef = $state<HTMLInputElement | null>(null);
let photoFileInputRef = $state<HTMLInputElement | null>(null);
let isUploadingCover = $state(false);
let isUploadingPhoto = $state(false);

function showToast(msg: string) {
  toast = msg;
  setTimeout(() => (toast = null), 3000);
}

async function loadOwnerVenues() {
  if (!authStore.firebaseUser) return;
  isLoading = true;
  try {
    const token = await authStore.firebaseUser.getIdToken();
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
  formLatitude = "";
  formLongitude = "";
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
  formLatitude = v.latitude != null ? String(v.latitude) : "";
  formLongitude = v.longitude != null ? String(v.longitude) : "";
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

function triggerCoverFilePicker() {
  if (coverFileInputRef) coverFileInputRef.click();
}

function triggerPhotoFilePicker() {
  if (photoFileInputRef) photoFileInputRef.click();
}

function handleCoverFileSelect(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  isUploadingCover = true;
  const reader = new FileReader();
  reader.onload = (evt) => {
    if (evt.target?.result) {
      formImageUrl = evt.target.result as string;
      showToast("Cover image loaded from disk.");
    }
    isUploadingCover = false;
    target.value = "";
  };
  reader.onerror = () => {
    showToast("Failed to read image file.");
    isUploadingCover = false;
    target.value = "";
  };
  reader.readAsDataURL(file);
}

function handlePhotoFileSelect(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  isUploadingPhoto = true;
  const reader = new FileReader();
  reader.onload = (evt) => {
    if (evt.target?.result) {
      const dataUrl = evt.target.result as string;
      if (!formPhotos.includes(dataUrl)) {
        formPhotos = [...formPhotos, dataUrl];
        showToast("Photo added to gallery.");
      }
    }
    isUploadingPhoto = false;
    target.value = "";
  };
  reader.onerror = () => {
    showToast("Failed to read image file.");
    isUploadingPhoto = false;
    target.value = "";
  };
  reader.readAsDataURL(file);
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
      latitude: formLatitude.trim() ? parseFloat(formLatitude) : null,
      longitude: formLongitude.trim() ? parseFloat(formLongitude) : null,
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
  if (authStore.isInitialized && authStore.user && authStore.firebaseUser) {
    loadOwnerVenues();
  }
});

const integratedBtnClass =
  "label flex h-full shrink-0 items-center gap-2 border-l border-white/[0.08] bg-white/[0.04] px-4 text-xs font-medium text-[#F7F7F7]/70 transition-colors hover:bg-white/[0.08] hover:text-[#E6FA50]";
</script>

<svelte:head>
  <title>Venues Management | Padelhive Owner</title>
</svelte:head>

<!-- Hidden File Inputs -->
<input
  bind:this={coverFileInputRef}
  type="file"
  accept="image/*"
  class="hidden"
  onchange={handleCoverFileSelect}
/>
<input
  bind:this={photoFileInputRef}
  type="file"
  accept="image/*"
  class="hidden"
  onchange={handlePhotoFileSelect}
/>

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
      {#if isLoading || !authStore.isInitialized || authStore.isLoading}
        {#each Array.from({ length: 2 }) as _}
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
                {#each Array.from({ length: 3 }) as _}
                  <div class="h-9 w-9 animate-pulse rounded-lg bg-white/[0.04]"></div>
                {/each}
              </div>
            </div>
            <div class="mt-4 flex flex-wrap gap-2 border-t border-white/[0.04] pt-4">
              {#each Array.from({ length: 4 }) as _}
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
                  <Pencil class="h-3.5 w-3.5" />
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

        <div class="relative flex w-full max-w-3xl flex-col rounded-2xl border border-white/[0.08] bg-[#0C1B26] p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto no-scrollbar">
          <!-- Modal Header -->
          <div class="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-6">
            <div class="flex items-center gap-3">
              <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E6FA50]/10 text-[#E6FA50] border border-[#E6FA50]/20">
                <Building2 class="h-5 w-5" />
              </div>
              <div>
                <h3 class="text-base font-bold text-[#F7F7F7]">
                  {modalMode === "add" ? "Add New Venue" : "Edit Venue"}
                </h3>
                <p class="text-xs text-[#F7F7F7]/40">Fill in the venue details below for admin approval.</p>
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

          <!-- 2-Column Form Body -->
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <!-- Left Column: Core Info -->
            <div class="space-y-4">
              <div class="flex items-center gap-2 pb-1 border-b border-white/[0.04]">
                <span class="flex h-5 w-5 items-center justify-center rounded-full bg-[#E6FA50]/15 text-[10px] font-bold text-[#E6FA50]">1</span>
                <span class="text-xs font-bold uppercase tracking-wider text-[#E6FA50]">Basic Venue Info</span>
              </div>

              <FormInput
                id="venue-name"
                label="Venue Name"
                required
                icon={Building2}
                bind:value={formName}
                placeholder="e.g. Padel Bali Arena"
              />

              <div class="grid grid-cols-2 gap-3">
                <FormInput
                  id="venue-city"
                  label="City"
                  required
                  icon={MapPin}
                  bind:value={formCity}
                  placeholder="e.g. Bali"
                />
                <FormInput
                  id="venue-location"
                  label="Address"
                  required
                  icon={MapPin}
                  bind:value={formLocation}
                  placeholder="Jl. Sunset Road No. 88"
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <FormInput
                  id="venue-lat"
                  type="number"
                  step="any"
                  label="Latitude (GPS)"
                  icon={Navigation}
                  bind:value={formLatitude}
                  placeholder="-8.6905"
                />
                <FormInput
                  id="venue-lng"
                  type="number"
                  step="any"
                  label="Longitude (GPS)"
                  icon={Navigation}
                  bind:value={formLongitude}
                  placeholder="115.1686"
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#F7F7F7]/60" for="venue-open">
                    <Clock class="h-3.5 w-3.5 text-[#E6FA50]" />
                    <span>Open Time</span>
                  </label>
                  <TimeSelect bind:value={formOpenTime} ariaLabel="Open time" />
                </div>
                <div>
                  <label class="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#F7F7F7]/60" for="venue-close">
                    <Clock class="h-3.5 w-3.5 text-[#E6FA50]" />
                    <span>Close Time</span>
                  </label>
                  <TimeSelect bind:value={formCloseTime} ariaLabel="Close time" />
                </div>
              </div>

              <FormTextarea
                id="venue-desc"
                label="Description"
                required
                icon={FileText}
                bind:value={formDescription}
                placeholder="Describe your venue facilities..."
                rows={3}
              />
            </div>

            <!-- Right Column: Media & Facilities -->
            <div class="space-y-4">
              <div class="flex items-center gap-2 pb-1 border-b border-white/[0.04]">
                <span class="flex h-5 w-5 items-center justify-center rounded-full bg-[#E6FA50]/15 text-[10px] font-bold text-[#E6FA50]">2</span>
                <span class="text-xs font-bold uppercase tracking-wider text-[#E6FA50]">Media & Amenities</span>
              </div>

              <FormInput
                id="venue-cover"
                type="url"
                label="Cover Image URL (Optional)"
                icon={ImageIcon}
                bind:value={formImageUrl}
                placeholder="https://images.unsplash.com/..."
              >
                <button
                  type="button"
                  onclick={triggerCoverFilePicker}
                  disabled={isUploadingCover}
                  class={integratedBtnClass}
                >
                  {#if isUploadingCover}
                    <Loader2 class="h-3.5 w-3.5 animate-spin" />
                  {:else}
                    <Upload class="h-3.5 w-3.5" />
                  {/if}
                  Choose file
                </button>
              </FormInput>

              {#if formImageUrl.trim()}
                <div class="relative h-24 w-full overflow-hidden rounded-xl border border-white/[0.08] bg-[#071521]">
                  <img
                    src={formImageUrl}
                    alt="Cover preview"
                    class="h-full w-full object-cover"
                    onerror={(e) => {
                      (e.currentTarget as HTMLImageElement).src = padelImg(600);
                    }}
                  />
                  <span class="absolute bottom-1.5 left-2 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white/90 backdrop-blur-sm border border-white/10">
                    Cover Preview
                  </span>
                </div>
              {/if}

              <FormInput
                id="venue-photo-draft"
                type="url"
                label="Photo Gallery (Optional)"
                icon={ImagesIcon}
                bind:value={photoInput}
                placeholder="Photo URL..."
              >
                <button
                  type="button"
                  onclick={triggerPhotoFilePicker}
                  disabled={isUploadingPhoto}
                  class={integratedBtnClass}
                >
                  {#if isUploadingPhoto}
                    <Loader2 class="h-3.5 w-3.5 animate-spin" />
                  {:else}
                    <Upload class="h-3.5 w-3.5" />
                  {/if}
                  Choose file
                </button>
              </FormInput>

              {#if formPhotos.length > 0}
                <div class="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto no-scrollbar pt-1">
                  {#each formPhotos as p, idx}
                    <span class="caption flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[#F7F7F7]/70">
                      <span class="truncate max-w-[120px] text-xs">{p}</span>
                      <button type="button" onclick={() => removePhoto(idx)} class="text-white/40 hover:text-red-400">
                        <X class="h-3 w-3" />
                      </button>
                    </span>
                  {/each}
                </div>
              {/if}

              <FormInput
                id="venue-facility-draft"
                label="Facilities (Optional)"
                icon={Sparkles}
                bind:value={facilityInput}
                placeholder="Custom facility..."
              >
                <button
                  type="button"
                  onclick={() => addFacility(facilityInput)}
                  class={integratedBtnClass}
                >
                  <Plus class="h-3.5 w-3.5" />
                  Add
                </button>
              </FormInput>

              {#if formFacilities.length > 0}
                <div class="flex flex-wrap gap-1.5 pt-1">
                  {#each formFacilities as f, idx}
                    <span class="caption flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-1 text-xs font-semibold text-[#F7F7F7]">
                      {f}
                      <button type="button" onclick={() => removeFacility(idx)} class="text-white/40 hover:text-red-400 transition-colors">
                        <X class="h-3 w-3" />
                      </button>
                    </span>
                  {/each}
                </div>
              {/if}

              <div class="pt-1">
                <p class="text-[11px] font-semibold text-[#F7F7F7]/40 uppercase tracking-wider mb-1.5">Quick Add Amenities:</p>
                <div class="flex flex-wrap gap-1.5">
                  {#each PRESET_FACILITIES as preset}
                    {@const isAdded = formFacilities.some((f) => f.toLowerCase() === preset.toLowerCase())}
                    <button
                      type="button"
                      onclick={() => addFacility(preset)}
                      disabled={isAdded}
                      class="rounded-lg border px-2.5 py-1 text-xs font-medium transition-all {isAdded
                        ? 'border-white/[0.04] bg-white/[0.02] text-[#F7F7F7]/30 opacity-40 cursor-default'
                        : 'border-white/[0.08] bg-white/[0.03] text-[#F7F7F7]/70 hover:border-[#E6FA50]/50 hover:bg-[#E6FA50]/10 hover:text-[#E6FA50]'}"
                    >
                      + {preset}
                    </button>
                  {/each}
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
