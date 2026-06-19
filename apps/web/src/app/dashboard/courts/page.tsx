"use client";

import { useState } from "react";
import {
  Plus,
  Edit3,
  CheckCircle2,
  XCircle,
  Zap,
  Sun,
  Building2,
  Loader2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { getVenues, getVenueCourtsManage, createCourt, updateCourt, getApiErrorMessage, CreateCourtInput, UpdateCourtInput } from "@/lib/api";
import { ErrorBanner, EmptyState } from "@/components/ui/error-state";
import { Court } from "@/types";

export default function CourtsPage() {
  const queryClient = useQueryClient();
  const [editingCourtId, setEditingCourtId] = useState<string | null>(null);
  const [editingPrices, setEditingPrices] = useState<{
    weekdayOffPeak: string;
    weekdayPeak: string;
    weekendOffPeak: string;
    weekendPeak: string;
  } | null>(null);
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: venues = [], isLoading: isVenuesLoading, isError: isVenuesError, error: venuesError, refetch: refetchVenues, isFetching: isVenuesFetching } = useQuery({
    queryKey: queryKeys.venues.all(),
    queryFn: () => getVenues(),
  });

  const activeVenueId = selectedVenueId || (venues.length > 0 ? venues[0].id : null);
  const venue = venues.find((v) => v.id === activeVenueId);

  const { data: courts = [], isLoading: isCourtsLoading } = useQuery({
    queryKey: activeVenueId ? queryKeys.venues.courtsManage(activeVenueId) : [],
    queryFn: () => activeVenueId ? getVenueCourtsManage(activeVenueId) : Promise.resolve([]),
    enabled: !!activeVenueId,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateCourtInput) => createCourt(activeVenueId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.venues.courtsManage(activeVenueId!) });
      setIsAddModalOpen(false);
      showToast("Court added");
    },
    onError: (err) => {
      showToast(getApiErrorMessage(err));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ courtId, data }: { courtId: string; data: UpdateCourtInput }) => updateCourt(activeVenueId!, courtId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.venues.courtsManage(activeVenueId!) });
      setEditingCourtId(null);
      setEditingPrices(null);
      showToast("Court updated");
    },
    onError: (err) => {
      showToast(getApiErrorMessage(err));
    },
  });

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handleEditClick(court: Court) {
    if (editingCourtId === court.id) {
      setEditingCourtId(null);
      setEditingPrices(null);
    } else {
      setEditingCourtId(court.id);
      setEditingPrices({
        weekdayOffPeak: String(court.pricing.weekdayOffPeak / 1000),
        weekdayPeak: String(court.pricing.weekdayPeak / 1000),
        weekendOffPeak: String(court.pricing.weekendOffPeak / 1000),
        weekendPeak: String(court.pricing.weekendPeak / 1000),
      });
    }
  }

  function handleSavePricing(courtId: string) {
    if (!editingPrices) return;
    const weekdayOffPeak = parseInt(editingPrices.weekdayOffPeak, 10) * 1000;
    const weekdayPeak = parseInt(editingPrices.weekdayPeak, 10) * 1000;
    const weekendOffPeak = parseInt(editingPrices.weekendOffPeak, 10) * 1000;
    const weekendPeak = parseInt(editingPrices.weekendPeak, 10) * 1000;

    if (isNaN(weekdayOffPeak) || isNaN(weekdayPeak) || isNaN(weekendOffPeak) || isNaN(weekendPeak) ||
        weekdayOffPeak < 0 || weekdayPeak < 0 || weekendOffPeak < 0 || weekendPeak < 0) {
      showToast("Prices must be valid numbers >= 0");
      return;
    }

    updateMutation.mutate({
      courtId,
      data: { weekdayOffPeak, weekdayPeak, weekendOffPeak, weekendPeak }
    });
  }

  function handleToggleActive(court: Court) {
    updateMutation.mutate({
      courtId: court.id,
      data: { isActive: !court.isActive }
    });
  }

  return (
    <div className="py-8">
      <section className="container">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-1 text-[#F7F7F7]">
              Courts & Pricing
            </h1>
            <p className="body mt-1 text-[#F7F7F7]/40">
              Manage courts and dynamic pricing
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            disabled={!activeVenueId}
            className="label btn-lime flex h-10 items-center gap-2 rounded-full px-5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Court
          </button>
        </div>

        {isVenuesLoading || isCourtsLoading ? (
          <>
            {/* Skeleton Venue selector */}
            <div className="mt-6 flex gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-9 w-24 animate-pulse rounded-full bg-white/[0.04]" />
              ))}
            </div>
            {/* Skeleton Courts list */}
            <div className="mt-8 space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-32 animate-pulse rounded-md bg-white/[0.04]" />
                      <div className="h-5 w-16 animate-pulse rounded-full bg-white/[0.04]" />
                    </div>
                    <div className="h-9 w-24 animate-pulse rounded-lg bg-white/[0.04]" />
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="h-[90px] animate-pulse rounded-xl border border-white/[0.04] bg-white/[0.02]" />
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-4 border-t border-white/[0.04] pt-4">
                    <div className="h-3 w-48 animate-pulse rounded-md bg-white/[0.04]" />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : isVenuesError ? (
          <div className="mt-8">
            <ErrorBanner title="Couldn't load venues" error={venuesError} onRetry={() => refetchVenues()} isRetrying={isVenuesFetching} />
          </div>
        ) : venues.length === 0 ? (
          <div className="mt-8">
            <EmptyState icon={Building2} title="No venues yet" description="Add a venue first to manage its courts and pricing." actionLabel="Go to Venues" actionHref="/dashboard/venues" />
          </div>
        ) : (
          <>
            {/* Venue selector */}
            <div className="mt-6 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {venues.map((v) => (
            <button
              key={v.id}
              onClick={() => {
                setSelectedVenueId(v.id);
                setEditingCourtId(null);
                setEditingPrices(null);
              }}
              className={`label whitespace-nowrap rounded-full px-4 py-2 transition-all ${
                activeVenueId === v.id
                  ? "bg-[#E6FA50] text-[#06121A]"
                  : "bg-white/[0.03] text-[#F7F7F7]/40 hover:bg-white/[0.06] hover:text-[#F7F7F7]/60"
              }`}
            >
              {v.name}
            </button>
          ))}
        </div>

        {/* Courts list */}
        <div className="mt-8 space-y-4">
          {courts.map((court) => {
            const isEditing = editingCourtId === court.id;
            return (
              <div
                key={court.id}
                className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6"
              >
                {/* Court header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="heading-2 text-[#F7F7F7]">
                      {court.name}
                    </h3>
                    <span className="caption rounded-full bg-white/[0.04] px-3 py-1 text-[#F7F7F7]/40">
                      {court.type}
                    </span>
                    {court.isActive ? (
                      <span className="caption flex items-center gap-1 text-green-400">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </span>
                    ) : (
                      <span className="caption flex items-center gap-1 text-red-400">
                        <XCircle className="h-3 w-3" /> Inactive
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(court)}
                      disabled={updateMutation.isPending}
                      className="label flex h-9 items-center gap-2 rounded-lg border border-white/[0.06] px-3 text-[#F7F7F7]/40 transition-all hover:border-white/[0.12] hover:text-[#F7F7F7]/60 disabled:opacity-50"
                    >
                      {court.isActive ? "Deactivate" : "Activate"}
                    </button>
                    {isEditing ? (
                      <button
                        onClick={() => handleSavePricing(court.id)}
                        disabled={updateMutation.isPending}
                        className="label flex h-9 items-center gap-2 rounded-lg border border-[#E6FA50]/30 bg-[#E6FA50]/10 px-4 text-[#E6FA50] transition-all hover:bg-[#E6FA50]/20 disabled:opacity-50"
                      >
                        {updateMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Edit3 className="h-3 w-3" />}
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEditClick(court)}
                        className="label flex h-9 items-center gap-2 rounded-lg border border-white/[0.06] px-4 text-[#F7F7F7]/40 transition-all hover:border-white/[0.12] hover:text-[#F7F7F7]/60"
                      >
                        <Edit3 className="h-3 w-3" />
                        Edit Pricing
                      </button>
                    )}
                    {isEditing && (
                      <button
                        onClick={() => handleEditClick(court)}
                        disabled={updateMutation.isPending}
                        className="label flex h-9 items-center gap-2 rounded-lg border border-white/[0.06] px-3 text-[#F7F7F7]/40 transition-all hover:border-white/[0.12] hover:text-[#F7F7F7]/60 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* Pricing grid */}
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <PricingCard
                    label="Weekday Off-Peak"
                    icon={Sun}
                    price={isEditing ? editingPrices!.weekdayOffPeak : court.pricing.weekdayOffPeak}
                    onChange={(val) => setEditingPrices(prev => ({...prev!, weekdayOffPeak: val}))}
                    editing={isEditing}
                  />
                  <PricingCard
                    label="Weekday Peak"
                    icon={Zap}
                    price={isEditing ? editingPrices!.weekdayPeak : court.pricing.weekdayPeak}
                    onChange={(val) => setEditingPrices(prev => ({...prev!, weekdayPeak: val}))}
                    editing={isEditing}
                    highlight
                  />
                  <PricingCard
                    label="Weekend Off-Peak"
                    icon={Sun}
                    price={isEditing ? editingPrices!.weekendOffPeak : court.pricing.weekendOffPeak}
                    onChange={(val) => setEditingPrices(prev => ({...prev!, weekendOffPeak: val}))}
                    editing={isEditing}
                  />
                  <PricingCard
                    label="Weekend Peak"
                    icon={Zap}
                    price={isEditing ? editingPrices!.weekendPeak : court.pricing.weekendPeak}
                    onChange={(val) => setEditingPrices(prev => ({...prev!, weekendPeak: val}))}
                    editing={isEditing}
                    highlight
                  />
                </div>

                {/* Peak hours info */}
                <div className="mt-4 flex items-center gap-4 border-t border-white/[0.04] pt-4">
                  <span className="caption text-[#F7F7F7]/25">
                    Peak hours: 09:00–11:00 & 16:00–21:00
                  </span>
                  <span className="caption text-[#F7F7F7]/25">
                    Venue: {venue?.name}
                  </span>
                </div>
              </div>
            );
          })}
          {courts.length === 0 && activeVenueId && (
            <div className="mt-8 rounded-2xl border border-dashed border-white/[0.08] p-12 text-center">
              <p className="body text-[#F7F7F7]/25">No courts for this venue yet.</p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="label btn-lime mt-4 rounded-full px-6 py-2.5"
              >
                Add First Court
              </button>
            </div>
          )}
        </div>
          </>
        )}

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-white/[0.08] bg-[#0C1B26] px-5 py-3 shadow-2xl shadow-black/40">
            <p className="body text-[#F7F7F7]/60">{toast}</p>
          </div>
        )}

        {/* Add Modal */}
        {isAddModalOpen && (
          <AddCourtModal
            onClose={() => setIsAddModalOpen(false)}
            onSubmit={(data) => createMutation.mutate(data)}
            isPending={createMutation.isPending}
          />
        )}
      </section>
    </div>
  );
}

function PricingCard({
  label,
  icon: Icon,
  price,
  onChange,
  editing,
  highlight,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  price: number | string;
  onChange?: (val: string) => void;
  editing: boolean;
  highlight?: boolean;
}) {
  const displayPrice = typeof price === "number" ? (price / 1000).toFixed(0) : price;

  return (
    <div
      className={`rounded-xl border p-4 transition-all ${
        highlight
          ? "border-[#E6FA50]/10 bg-[#E6FA50]/[0.03]"
          : "border-white/[0.04] bg-white/[0.02]"
      }`}
    >
      <div className="flex items-center gap-1.5">
        <Icon
          className={`h-3 w-3 ${highlight ? "text-[#E6FA50]/60" : "text-[#F7F7F7]/25"}`}
        />
        <span className="caption text-[#F7F7F7]/25">{label}</span>
      </div>
      {editing ? (
        <input
          type="text"
          value={displayPrice}
          onChange={(e) => onChange?.(e.target.value)}
          className="body mt-2 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[#F7F7F7] focus:border-[#E6FA50]/30 focus:outline-none"
        />
      ) : (
        <p
          className={`price mt-2 ${
            highlight ? "text-[#E6FA50]/80" : "text-[#F7F7F7]/60"
          }`}
        >
          Rp {displayPrice}K
        </p>
      )}
      {editing && (
        <p className="caption mt-1 text-[#F7F7F7]/25">× 1,000 IDR</p>
      )}
    </div>
  );
}

function AddCourtModal({
  onClose,
  onSubmit,
  isPending,
}: {
  onClose: () => void;
  onSubmit: (data: CreateCourtInput) => void;
  isPending: boolean;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"INDOOR" | "OUTDOOR">("INDOOR");
  const [weekdayOffPeak, setWeekdayOffPeak] = useState("100");
  const [weekdayPeak, setWeekdayPeak] = useState("150");
  const [weekendOffPeak, setWeekendOffPeak] = useState("150");
  const [weekendPeak, setWeekendPeak] = useState("200");
  const [isActive, setIsActive] = useState(true);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const prices = [weekdayOffPeak, weekdayPeak, weekendOffPeak, weekendPeak].map(p => parseInt(p, 10) * 1000);
    if (prices.some(isNaN) || prices.some(p => p < 0)) return;

    onSubmit({
      name: name.trim(),
      type,
      weekdayOffPeak: prices[0],
      weekdayPeak: prices[1],
      weekendOffPeak: prices[2],
      weekendPeak: prices[3],
      isActive,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-white/[0.06] bg-[#0C1B26] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.06] p-6">
          <h2 className="heading-3 text-[#F7F7F7]">Add New Court</h2>
          <button onClick={onClose} className="text-[#F7F7F7]/40 hover:text-[#F7F7F7]">
            <XCircle className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="label block text-[#F7F7F7]/60">Court Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Court A"
                className="body mt-1.5 w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-[#F7F7F7] focus:border-[#E6FA50]/30 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="label block text-[#F7F7F7]/60">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "INDOOR" | "OUTDOOR")}
                className="body mt-1.5 w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-[#F7F7F7] focus:border-[#E6FA50]/30 focus:outline-none [&>option]:bg-[#0C1B26]"
              >
                <option value="INDOOR">Indoor</option>
                <option value="OUTDOOR">Outdoor</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label block text-[#F7F7F7]/60">Weekday Off-Peak (K)</label>
                <input
                  type="text"
                  value={weekdayOffPeak}
                  onChange={(e) => setWeekdayOffPeak(e.target.value)}
                  className="body mt-1.5 w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-[#F7F7F7] focus:border-[#E6FA50]/30 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="label block text-[#F7F7F7]/60">Weekday Peak (K)</label>
                <input
                  type="text"
                  value={weekdayPeak}
                  onChange={(e) => setWeekdayPeak(e.target.value)}
                  className="body mt-1.5 w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-[#F7F7F7] focus:border-[#E6FA50]/30 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="label block text-[#F7F7F7]/60">Weekend Off-Peak (K)</label>
                <input
                  type="text"
                  value={weekendOffPeak}
                  onChange={(e) => setWeekendOffPeak(e.target.value)}
                  className="body mt-1.5 w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-[#F7F7F7] focus:border-[#E6FA50]/30 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="label block text-[#F7F7F7]/60">Weekend Peak (K)</label>
                <input
                  type="text"
                  value={weekendPeak}
                  onChange={(e) => setWeekendPeak(e.target.value)}
                  className="body mt-1.5 w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-[#F7F7F7] focus:border-[#E6FA50]/30 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <label className="label text-[#F7F7F7]/60">Status:</label>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  isActive ? "bg-[#E6FA50]" : "bg-white/20"
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    isActive ? "translate-x-4 bg-[#06121A]" : "translate-x-1"
                  }`}
                />
              </button>
              <span className="body text-[#F7F7F7]">
                {isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="label rounded-full px-5 py-2 text-[#F7F7F7]/60 hover:bg-white/[0.04] hover:text-[#F7F7F7] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="label btn-lime flex items-center justify-center gap-2 rounded-full px-6 py-2 disabled:opacity-50"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Court
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
