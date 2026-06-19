"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  MapPin,
  Star,
  CheckCircle2,
  Clock,
  XCircle,
  Edit3,
  Eye,
  MoreVertical,
  Building2,
  Loader2,
  X,
  ImageIcon,
  type LucideIcon,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { getVenuesManage, createVenue, updateVenue, getApiErrorMessage, VenueInput, UpdateVenueInput } from "@/lib/api";
import { Venue } from "@/types";
import { ErrorBanner, EmptyState } from "@/components/ui/error-state";

const STATUS_CONFIG: Record<string, { label: string; icon: LucideIcon; color: string; bg: string }> = {
  APPROVED: { label: "Approved", icon: CheckCircle2, color: "text-green-400", bg: "bg-green-400/10" },
  PENDING: { label: "Pending Review", icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10" },
  REJECTED: { label: "Rejected", icon: XCircle, color: "text-red-400", bg: "bg-red-400/10" },
  SUSPENDED: { label: "Suspended", icon: XCircle, color: "text-orange-400", bg: "bg-orange-400/10" },
};

export default function VenueManagementPage() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editVenue, setEditVenue] = useState<Venue | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const { data: venues = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: queryKeys.venues.manage(),
    queryFn: getVenuesManage,
  });

  const createMutation = useMutation({
    mutationFn: createVenue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.venues.manage() });
      setShowAddModal(false);
      showToast("Venue submitted for approval.");
    },
    onError: (err) => {
      showToast(getApiErrorMessage(err));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVenueInput }) => updateVenue(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.venues.manage() });
      setEditVenue(null);
      showToast("Venue updated.");
    },
    onError: (err) => {
      showToast(getApiErrorMessage(err));
    },
  });

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <div className="py-8">
      <section className="container">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-1 text-[#F7F7F7]">
              Venues
            </h1>
            <p className="body mt-1 text-[#F7F7F7]/40">
              Manage your padel venues
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="label btn-lime flex h-10 items-center gap-2 rounded-full px-5 uppercase"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Venue
          </button>
        </div>

        {/* Venue List */}
        <div className="mt-8 space-y-4">
          {isLoading ? (
            <>
              {[...Array(2)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="h-6 w-48 animate-pulse rounded-md bg-white/[0.04]" />
                      </div>
                      <div className="mt-2 h-4 w-64 animate-pulse rounded-md bg-white/[0.04]" />
                      <div className="mt-4 flex flex-wrap items-center gap-4">
                        <div className="h-4 w-16 animate-pulse rounded-md bg-white/[0.04]" />
                        <div className="h-4 w-20 animate-pulse rounded-md bg-white/[0.04]" />
                        <div className="h-4 w-32 animate-pulse rounded-md bg-white/[0.04]" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-24 animate-pulse rounded-full bg-white/[0.04]" />
                      {[...Array(3)].map((_, j) => (
                        <div key={j} className="h-9 w-9 animate-pulse rounded-lg bg-white/[0.04]" />
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-white/[0.04] pt-4">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="h-6 w-16 animate-pulse rounded-full bg-white/[0.04]" />
                    ))}
                  </div>
                </div>
              ))}
            </>
          ) : isError ? (
            <ErrorBanner title="Couldn't load venues" error={error} onRetry={() => refetch()} isRetrying={isFetching} />
          ) : venues.length === 0 ? (
            <EmptyState icon={Building2} title="No venues yet" description="Add your first venue to start managing courts and bookings." actionLabel="Add Venue" onAction={() => setShowAddModal(true)} />
          ) : (
            venues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} onEdit={(v) => setEditVenue(v)} showToast={showToast} />
            ))
          )}
        </div>

        {/* Modals */}
        {showAddModal && (
          <VenueFormModal
            mode="add"
            onClose={() => setShowAddModal(false)}
            onSubmit={(data) => createMutation.mutate(data as VenueInput)}
            isPending={createMutation.isPending}
          />
        )}
        {editVenue && (
          <VenueFormModal
            mode="edit"
            initial={editVenue}
            onClose={() => setEditVenue(null)}
            onSubmit={(data) => updateMutation.mutate({ id: editVenue.id, data: data as UpdateVenueInput })}
            isPending={updateMutation.isPending}
          />
        )}

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-white/[0.08] bg-[#0C1B26] px-5 py-3 shadow-2xl shadow-black/40">
            <p className="body text-[#F7F7F7]/60">{toast}</p>
          </div>
        )}
      </section>
    </div>
  );
}

function VenueFormModal({
  mode,
  initial,
  onClose,
  onSubmit,
  isPending,
}: {
  mode: "add" | "edit";
  initial?: Venue;
  onClose: () => void;
  onSubmit: (data: VenueInput | UpdateVenueInput) => void;
  isPending: boolean;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [location, setLocation] = useState(initial?.location || "");
  const [city, setCity] = useState(initial?.city || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [openTime, setOpenTime] = useState(initial?.operatingHours?.open || "06:00");
  const [closeTime, setCloseTime] = useState(initial?.operatingHours?.close || "23:00");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl || "");
  const [coverError, setCoverError] = useState(false);
  const [photos, setPhotos] = useState<string[]>(initial?.photos ?? []);
  const [photoDraft, setPhotoDraft] = useState("");
  const [facilities, setFacilities] = useState<string[]>(initial?.facilities ?? []);
  const [facilityDraft, setFacilityDraft] = useState("");

  const handleAddPhoto = () => {
    const val = photoDraft.trim();
    if (val && !photos.includes(val)) setPhotos([...photos, val]);
    setPhotoDraft("");
  };

  const handleAddFacility = () => {
    const val = facilityDraft.trim();
    if (val && !facilities.includes(val)) setFacilities([...facilities, val]);
    setFacilityDraft("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !location.trim() || !city.trim() || !description.trim() || !openTime || !closeTime) {
      return;
    }
    onSubmit({
      name,
      location,
      city,
      description,
      openTime,
      closeTime,
      imageUrl: imageUrl.trim(),
      photos,
      facilities,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#06121A]/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative flex w-full max-w-lg max-h-[90vh] flex-col rounded-2xl border border-white/[0.06] bg-[#0C1B26] shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] p-6">
          <h2 className="heading-2 text-[#F7F7F7]">
            {mode === "add" ? "Add New Venue" : "Edit Venue"}
          </h2>
          <button onClick={onClose} className="text-[#F7F7F7]/40 hover:text-[#F7F7F7]">
            <XCircle className="h-5 w-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            <div className="space-y-4">
            <div>
              <label className="label text-[#F7F7F7]/40">Venue Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Padel Bali Arena"
                className="body mt-1.5 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[#F7F7F7] placeholder:text-[#F7F7F7]/25 focus:border-[#E6FA50]/30 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="label text-[#F7F7F7]/40">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Full address"
                className="body mt-1.5 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[#F7F7F7] placeholder:text-[#F7F7F7]/25 focus:border-[#E6FA50]/30 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="label text-[#F7F7F7]/40">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Bali"
                className="body mt-1.5 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[#F7F7F7] placeholder:text-[#F7F7F7]/25 focus:border-[#E6FA50]/30 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="label text-[#F7F7F7]/40">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your venue..."
                className="body mt-1.5 w-full resize-none rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[#F7F7F7] placeholder:text-[#F7F7F7]/25 focus:border-[#E6FA50]/30 focus:outline-none"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label text-[#F7F7F7]/40">Open Time</label>
                <input
                  type="time"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  className="body mt-1.5 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[#F7F7F7] focus:border-[#E6FA50]/30 focus:outline-none [color-scheme:dark]"
                  required
                />
              </div>
              <div>
                <label className="label text-[#F7F7F7]/40">Close Time</label>
                <input
                  type="time"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  className="body mt-1.5 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[#F7F7F7] focus:border-[#E6FA50]/30 focus:outline-none [color-scheme:dark]"
                  required
                />
              </div>
            </div>
            </div>

            <hr className="border-white/[0.06]" />

            {/* Cover Image */}
            <div>
              <label className="label text-[#F7F7F7]/40">Cover Image URL (Optional)</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setCoverError(false);
                }}
                placeholder="https://..."
                className="body mt-1.5 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[#F7F7F7] placeholder:text-[#F7F7F7]/25 focus:border-[#E6FA50]/30 focus:outline-none"
              />
              {imageUrl && !coverError && (
                <img
                  src={imageUrl}
                  alt="Cover preview"
                  className="mt-2 h-24 w-full rounded-xl object-cover"
                  onError={() => setCoverError(true)}
                />
              )}
            </div>

            {/* Photo Gallery */}
            <div>
              <label className="label text-[#F7F7F7]/40">Photo Gallery (Optional)</label>
              <div className="mt-1.5 flex gap-2">
                <input
                  type="url"
                  value={photoDraft}
                  onChange={(e) => setPhotoDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddPhoto();
                    }
                  }}
                  placeholder="Add photo URL..."
                  className="body w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[#F7F7F7] placeholder:text-[#F7F7F7]/25 focus:border-[#E6FA50]/30 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddPhoto}
                  className="label btn-lime shrink-0 rounded-xl px-4 uppercase"
                >
                  Add
                </button>
              </div>
              {photos.length === 0 ? (
                <p className="body-sm mt-2 text-[#F7F7F7]/40">No photos added yet.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {photos.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-2">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <img
                          src={p}
                          alt="Thumbnail"
                          className="h-10 w-10 shrink-0 rounded object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <span className="body-sm truncate text-[#F7F7F7]/60">{p}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                        className="ml-2 shrink-0 p-1 text-[#F7F7F7]/40 hover:text-red-400"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Facilities */}
            <div>
              <label className="label text-[#F7F7F7]/40">Facilities (Optional)</label>
              <div className="mt-1.5 flex gap-2">
                <input
                  type="text"
                  value={facilityDraft}
                  onChange={(e) => setFacilityDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddFacility();
                    }
                  }}
                  placeholder="Add facility..."
                  className="body w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[#F7F7F7] placeholder:text-[#F7F7F7]/25 focus:border-[#E6FA50]/30 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddFacility}
                  className="label btn-lime shrink-0 rounded-xl px-4 uppercase"
                >
                  Add
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {facilities.map((f, idx) => (
                  <span
                    key={idx}
                    className="caption flex items-center gap-1.5 rounded-full bg-white/[0.03] pl-3 pr-1.5 py-1 text-[#F7F7F7]/60"
                  >
                    {f}
                    <button
                      type="button"
                      onClick={() => setFacilities(facilities.filter((_, i) => i !== idx))}
                      className="rounded-full p-0.5 hover:bg-white/[0.1] hover:text-[#F7F7F7]"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="mt-3 border-t border-white/[0.04] pt-3">
                <p className="section-label mb-2 text-[#F7F7F7]/40">Quick Add:</p>
                <div className="flex flex-wrap gap-2">
                  {["Parking", "Showers", "Locker Room", "Cafe", "Pro Shop", "WiFi", "Equipment Rental", "Seating Area"].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        if (!facilities.includes(preset)) setFacilities([...facilities, preset]);
                      }}
                      className="caption rounded-full border border-white/[0.06] px-2 py-1 text-[#F7F7F7]/40 transition-colors hover:border-[#E6FA50]/50 hover:text-[#F7F7F7]"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="label flex-1 rounded-full border border-white/[0.08] py-3 uppercase text-[#F7F7F7]/60 transition-colors hover:border-white/[0.15] hover:text-[#F7F7F7]/80 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="label btn-lime flex flex-1 items-center justify-center gap-2 rounded-full py-3 uppercase disabled:opacity-50"
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === "add" ? "Submit for Approval" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function VenueCard({ venue, onEdit, showToast }: { venue: Venue; onEdit: (v: Venue) => void; showToast: (msg: string) => void }) {
  const status = venue.status ?? "PENDING";
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG["PENDING"];
  const StatusIcon = config.icon;

  return (
    <div
      className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 transition-all hover:border-white/[0.1]"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h3 className="heading-3 truncate text-[#F7F7F7]">
              {venue.name}
            </h3>
            {venue.isVerified && (
              <span className="caption shrink-0 rounded-full bg-[#E6FA50] px-2 py-0.5 uppercase text-[#06121A]">
                Verified
              </span>
            )}
          </div>
          <p className="body-sm mt-1 flex items-center gap-1.5 text-[#F7F7F7]/40">
            <MapPin className="h-3.5 w-3.5" />
            {venue.location} · {venue.city}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <span className="body-sm flex items-center gap-1.5 text-[#F7F7F7]/25">
              <Star className="h-3 w-3 fill-[#E6FA50] text-[#E6FA50]" />
              {venue.rating} ({venue.reviewCount})
            </span>
            <span className="body-sm text-[#F7F7F7]/25">
              {venue.courtCount ?? 0} courts
            </span>
            <span className="body-sm text-[#F7F7F7]/25">
              {venue.operatingHours.open} – {venue.operatingHours.close}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 ${config.bg}`}>
            <StatusIcon className={`h-3.5 w-3.5 ${config.color}`} />
            <span className={`caption ${config.color}`}>
              {config.label}
            </span>
          </div>
          <Link
            href={`/venues/${venue.id}`}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] text-[#F7F7F7]/25 transition-colors hover:border-white/[0.12] hover:text-[#F7F7F7]/60"
            title="View venue"
          >
            <Eye className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={() => onEdit(venue)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] text-[#F7F7F7]/25 transition-colors hover:border-white/[0.12] hover:text-[#F7F7F7]/60"
            title="Edit venue"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => showToast("More options coming soon in backend integration.")}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] text-[#F7F7F7]/25 transition-colors hover:border-white/[0.12] hover:text-[#F7F7F7]/60"
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Facilities */}
      <div className="mt-4 flex flex-wrap gap-2 border-t border-white/[0.04] pt-4">
        {venue.facilities.map((f) => (
          <span
            key={f}
            className="caption rounded-full bg-white/[0.03] px-3 py-1 text-[#F7F7F7]/25"
          >
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}
