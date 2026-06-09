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
  type LucideIcon,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { getVenuesManage, createVenue, updateVenue, getVenueCourts, getApiErrorMessage, VenueInput, UpdateVenueInput } from "@/lib/api";
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
            <h1 className="heading-1 text-2xl text-[#F7F7F7] md:text-3xl">
              Venues
            </h1>
            <p className="mt-1 text-sm text-[#F7F7F7]/40">
              Manage your padel venues
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-lime flex h-10 items-center gap-2 rounded-full px-5 text-[11px] font-semibold uppercase tracking-[0.08em]"
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
            <p className="text-sm text-[#F7F7F7]/60">{toast}</p>
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
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-[#06121A]/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-2xl border border-white/[0.06] bg-[#0C1B26] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.06] p-6">
          <h2 className="heading-2 text-xl text-[#F7F7F7]">
            {mode === "add" ? "Add New Venue" : "Edit Venue"}
          </h2>
          <button onClick={onClose} className="text-[#F7F7F7]/40 hover:text-[#F7F7F7]">
            <XCircle className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="caption text-[#F7F7F7]/40">Venue Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Padel Bali Arena"
                className="mt-1.5 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-[#F7F7F7] placeholder:text-[#F7F7F7]/25 focus:border-[#E6FA50]/30 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="caption text-[#F7F7F7]/40">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Full address"
                className="mt-1.5 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-[#F7F7F7] placeholder:text-[#F7F7F7]/25 focus:border-[#E6FA50]/30 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="caption text-[#F7F7F7]/40">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Bali"
                className="mt-1.5 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-[#F7F7F7] placeholder:text-[#F7F7F7]/25 focus:border-[#E6FA50]/30 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="caption text-[#F7F7F7]/40">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your venue..."
                className="mt-1.5 w-full resize-none rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-[#F7F7F7] placeholder:text-[#F7F7F7]/25 focus:border-[#E6FA50]/30 focus:outline-none"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="caption text-[#F7F7F7]/40">Open Time</label>
                <input
                  type="time"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-[#F7F7F7] focus:border-[#E6FA50]/30 focus:outline-none [color-scheme:dark]"
                  required
                />
              </div>
              <div>
                <label className="caption text-[#F7F7F7]/40">Close Time</label>
                <input
                  type="time"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-[#F7F7F7] focus:border-[#E6FA50]/30 focus:outline-none [color-scheme:dark]"
                  required
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 rounded-full border border-white/[0.08] py-3 text-[11px] font-medium uppercase tracking-[0.08em] text-[#F7F7F7]/60 transition-colors hover:border-white/[0.15] hover:text-[#F7F7F7]/80 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn-lime flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-[11px] font-semibold uppercase tracking-[0.08em] disabled:opacity-50"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "add" ? "Submit for Approval" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function VenueCard({ venue, onEdit, showToast }: { venue: Venue; onEdit: (v: Venue) => void; showToast: (msg: string) => void }) {
  const { data: courts = [] } = useQuery({
    queryKey: queryKeys.venues.courts(venue.id),
    queryFn: () => getVenueCourts(venue.id),
  });

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
            <h3 className="heading-2 text-lg text-[#F7F7F7] truncate">
              {venue.name}
            </h3>
            {venue.isVerified && (
              <span className="shrink-0 rounded-full bg-[#E6FA50] px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.1em] text-[#06121A]">
                Verified
              </span>
            )}
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-[#F7F7F7]/40">
            <MapPin className="h-3.5 w-3.5" />
            {venue.location} · {venue.city}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-[#F7F7F7]/25">
              <Star className="h-3 w-3 fill-[#E6FA50] text-[#E6FA50]" />
              {venue.rating} ({venue.reviewCount})
            </span>
            <span className="text-xs text-[#F7F7F7]/25">
              {courts.length} courts
            </span>
            <span className="text-xs text-[#F7F7F7]/25">
              {venue.operatingHours.open} – {venue.operatingHours.close}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 ${config.bg}`}>
            <StatusIcon className={`h-3.5 w-3.5 ${config.color}`} />
            <span className={`text-[11px] font-medium ${config.color}`}>
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
            className="rounded-full bg-white/[0.03] px-3 py-1 text-[10px] font-medium text-[#F7F7F7]/25"
          >
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}
