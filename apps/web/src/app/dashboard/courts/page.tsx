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
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { getVenues, getVenueCourts } from "@/lib/api";
import { ErrorBanner, EmptyState } from "@/components/ui/error-state";

export default function CourtsPage() {
  const [editingCourt, setEditingCourt] = useState<string | null>(null);
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const { data: venues = [], isLoading: isVenuesLoading, isError: isVenuesError, refetch: refetchVenues, isFetching: isVenuesFetching } = useQuery({
    queryKey: queryKeys.venues.all(),
    queryFn: getVenues,
  });

  const activeVenueId = selectedVenueId || (venues.length > 0 ? venues[0].id : null);
  const venue = venues.find((v) => v.id === activeVenueId);

  const { data: courts = [], isLoading: isCourtsLoading } = useQuery({
    queryKey: activeVenueId ? queryKeys.venues.courts(activeVenueId) : [],
    queryFn: () => activeVenueId ? getVenueCourts(activeVenueId) : Promise.resolve([]),
    enabled: !!activeVenueId,
  });

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  return (
    <div className="py-8">
      <section className="container">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-1 text-2xl text-[#F7F7F7] md:text-3xl">
              Courts & Pricing
            </h1>
            <p className="mt-1 text-sm text-[#F7F7F7]/40">
              Manage courts and dynamic pricing
            </p>
          </div>
          <button
            onClick={() => showToast("Add court coming soon in backend integration.")}
            className="btn-lime flex h-10 items-center gap-2 rounded-full px-5 text-[11px] font-semibold uppercase tracking-[0.08em]"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Court
          </button>
        </div>

        {isVenuesError ? (
          <div className="mt-8">
            <ErrorBanner title="Couldn't load venues" description="We couldn't reach the server. Check your connection and try again." onRetry={() => refetchVenues()} isRetrying={isVenuesFetching} />
          </div>
        ) : !isVenuesLoading && venues.length === 0 ? (
          <div className="mt-8">
            <EmptyState icon={Building2} title="No venues yet" description="Add a venue first to manage its courts and pricing." actionLabel="Go to Venues" actionHref="/dashboard/venues" />
          </div>
        ) : (
          <>
            {/* Venue selector */}
            <div className="mt-6 flex gap-2">
              {isVenuesLoading && <span className="text-sm text-[#F7F7F7]/40">Loading venues...</span>}
          {venues.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVenueId(v.id)}
              className={`rounded-full px-4 py-2 text-[11px] font-medium uppercase tracking-[0.08em] transition-all ${
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
            const isEditing = editingCourt === court.id;
            return (
              <div
                key={court.id}
                className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6"
              >
                {/* Court header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="heading-2 text-lg text-[#F7F7F7]">
                      {court.name}
                    </h3>
                    <span className="rounded-full bg-white/[0.04] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.1em] text-[#F7F7F7]/40">
                      {court.type}
                    </span>
                    {court.isActive ? (
                      <span className="flex items-center gap-1 text-[11px] text-green-400">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] text-red-400">
                        <XCircle className="h-3 w-3" /> Inactive
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setEditingCourt(isEditing ? null : court.id)}
                    className={`flex h-9 items-center gap-2 rounded-lg border px-4 text-[11px] font-medium transition-all ${
                      isEditing
                        ? "border-[#E6FA50]/30 bg-[#E6FA50]/10 text-[#E6FA50]"
                        : "border-white/[0.06] text-[#F7F7F7]/40 hover:border-white/[0.12] hover:text-[#F7F7F7]/60"
                    }`}
                  >
                    <Edit3 className="h-3 w-3" />
                    {isEditing ? "Done" : "Edit Pricing"}
                  </button>
                </div>

                {/* Pricing grid */}
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <PricingCard
                    label="Weekday Off-Peak"
                    icon={Sun}
                    price={court.pricing.weekdayOffPeak}
                    editing={isEditing}
                  />
                  <PricingCard
                    label="Weekday Peak"
                    icon={Zap}
                    price={court.pricing.weekdayPeak}
                    editing={isEditing}
                    highlight
                  />
                  <PricingCard
                    label="Weekend Off-Peak"
                    icon={Sun}
                    price={court.pricing.weekendOffPeak}
                    editing={isEditing}
                  />
                  <PricingCard
                    label="Weekend Peak"
                    icon={Zap}
                    price={court.pricing.weekendPeak}
                    editing={isEditing}
                    highlight
                  />
                </div>

                {/* Peak hours info */}
                <div className="mt-4 flex items-center gap-4 border-t border-white/[0.04] pt-4">
                  <span className="text-[11px] text-[#F7F7F7]/25">
                    Peak hours: 09:00–11:00 & 16:00–21:00
                  </span>
                  <span className="text-[11px] text-[#F7F7F7]/25">
                    Venue: {venue?.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {isCourtsLoading && (
          <div className="mt-8 rounded-2xl border border-dashed border-white/[0.08] p-12 text-center">
            <p className="text-sm text-[#F7F7F7]/25">Loading courts...</p>
          </div>
        )}

        {!isCourtsLoading && courts.length === 0 && activeVenueId && (
          <div className="mt-8 rounded-2xl border border-dashed border-white/[0.08] p-12 text-center">
            <p className="text-sm text-[#F7F7F7]/25">No courts for this venue yet.</p>
            <button
              onClick={() => showToast("Add court coming soon in backend integration.")}
              className="btn-lime mt-4 rounded-full px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em]"
            >
              Add First Court
            </button>
          </div>
        )}
          </>
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

function PricingCard({
  label,
  icon: Icon,
  price,
  editing,
  highlight,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  price: number;
  editing: boolean;
  highlight?: boolean;
}) {
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
        <span className="text-[10px] text-[#F7F7F7]/25">{label}</span>
      </div>
      {editing ? (
        <input
          type="text"
          defaultValue={(price / 1000).toFixed(0)}
          className="mt-2 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-sm font-medium text-[#F7F7F7] focus:border-[#E6FA50]/30 focus:outline-none"
        />
      ) : (
        <p
          className={`mt-2 text-base font-semibold ${
            highlight ? "text-[#E6FA50]/80" : "text-[#F7F7F7]/60"
          }`}
        >
          Rp {(price / 1000).toFixed(0)}K
        </p>
      )}
      {editing && (
        <p className="mt-1 text-[9px] text-[#F7F7F7]/25">× 1,000 IDR</p>
      )}
    </div>
  );
}
