"use client";

import { useState } from "react";
import { Clock, Save, CheckCircle2, Building2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { getVenues } from "@/lib/api";
import { Venue } from "@/types";
import { ErrorBanner, EmptyState } from "@/components/ui/error-state";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

interface DaySchedule {
  day: string;
  open: string;
  close: string;
  isOpen: boolean;
}

function getDefaultSchedule(venue: Venue): DaySchedule[] {
  return DAYS.map((day) => ({
    day,
    open: venue.operatingHours.open,
    close: venue.operatingHours.close,
    isOpen: true,
  }));
}

export default function OperatingHoursPage() {
  const { data: venues = [], isLoading, isError: isVenuesError, refetch: refetchVenues, isFetching: isVenuesFetching } = useQuery({
    queryKey: queryKeys.venues.all(),
    queryFn: getVenues,
  });

  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const activeVenueId = selectedVenueId || (venues.length > 0 ? venues[0].id : null);
  const venue = venues.find((v) => v.id === activeVenueId);

  const [schedule, setSchedule] = useState<DaySchedule[] | null>(null);
  const [saved, setSaved] = useState(false);

  function handleVenueChange(id: string) {
    setSelectedVenueId(id);
    const v = venues.find((v) => v.id === id);
    if (v) setSchedule(getDefaultSchedule(v));
    setSaved(false);
  }

  // Initialize schedule once venue is loaded
  if (venue && !schedule) {
    setSchedule(getDefaultSchedule(venue));
  }

  function updateDay(index: number, field: keyof DaySchedule, value: string | boolean) {
    setSchedule((prev) =>
      prev ? prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)) : null
    );
    setSaved(false);
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="py-8">
      <section className="container max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-1 text-2xl text-[#F7F7F7] md:text-3xl">
              Operating Hours
            </h1>
            <p className="mt-1 text-sm text-[#F7F7F7]/40">
              Set opening and closing times per day
            </p>
          </div>
          <button
            onClick={handleSave}
            className={`flex h-10 items-center gap-2 rounded-full px-5 text-[11px] font-semibold uppercase tracking-[0.08em] transition-all ${
              saved
                ? "bg-green-400/10 text-green-400 border border-green-400/30"
                : "btn-lime"
            }`}
          >
            {saved ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Saved
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                Save Changes
              </>
            )}
          </button>
        </div>

        {isVenuesError ? (
          <div className="mt-6">
            <ErrorBanner title="Couldn't load venues" description="We couldn't reach the server. Check your connection and try again." onRetry={() => refetchVenues()} isRetrying={isVenuesFetching} />
          </div>
        ) : !isLoading && venues.length === 0 ? (
          <div className="mt-6">
            <EmptyState icon={Building2} title="No venues yet" description="Add a venue first to set its operating hours." actionLabel="Go to Venues" actionHref="/dashboard/venues" />
          </div>
        ) : (
          <>
            {/* Venue selector */}
            <div className="mt-6 flex gap-2">
              {isLoading && <span className="text-sm text-[#F7F7F7]/40">Loading venues...</span>}
          {venues.map((v) => (
            <button
              key={v.id}
              onClick={() => handleVenueChange(v.id)}
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

        {/* Current hours summary */}
        {venue && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#0C1B26] px-5 py-3">
            <Clock className="h-4 w-4 text-[#50C8C8]" />
            <span className="text-sm text-[#F7F7F7]/60">
              Default: {venue.operatingHours.open} – {venue.operatingHours.close}
            </span>
          </div>
        )}

        {/* Schedule table */}
        <div className="mt-8 rounded-2xl border border-white/[0.06] bg-[#0C1B26] overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-[1fr_80px_80px_60px] gap-4 border-b border-white/[0.04] px-6 py-3 sm:grid-cols-[1fr_120px_120px_80px]">
            <span className="caption text-[#F7F7F7]/25">Day</span>
            <span className="caption text-[#F7F7F7]/25">Open</span>
            <span className="caption text-[#F7F7F7]/25">Close</span>
            <span className="caption text-[#F7F7F7]/25">Status</span>
          </div>

          {/* Day rows */}
          {schedule?.map((day, i) => (
            <div
              key={day.day}
              className={`grid grid-cols-[1fr_80px_80px_60px] items-center gap-4 border-b border-white/[0.03] px-6 py-4 last:border-0 sm:grid-cols-[1fr_120px_120px_80px] ${
                !day.isOpen ? "opacity-40" : ""
              }`}
            >
              <span className="text-sm font-medium text-[#F7F7F7]/60">
                {day.day}
              </span>
              <input
                type="time"
                value={day.open}
                onChange={(e) => updateDay(i, "open", e.target.value)}
                disabled={!day.isOpen}
                className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 py-1.5 text-xs text-[#F7F7F7] focus:border-[#E6FA50]/30 focus:outline-none disabled:cursor-not-allowed [color-scheme:dark]"
              />
              <input
                type="time"
                value={day.close}
                onChange={(e) => updateDay(i, "close", e.target.value)}
                disabled={!day.isOpen}
                className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 py-1.5 text-xs text-[#F7F7F7] focus:border-[#E6FA50]/30 focus:outline-none disabled:cursor-not-allowed [color-scheme:dark]"
              />
              <button
                onClick={() => updateDay(i, "isOpen", !day.isOpen)}
                className={`rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em] transition-all ${
                  day.isOpen
                    ? "bg-green-400/10 text-green-400"
                    : "bg-red-400/10 text-red-400"
                }`}
              >
                {day.isOpen ? "Open" : "Closed"}
              </button>
            </div>
          ))}
        </div>

        {/* Info */}
        <p className="mt-4 text-[11px] text-[#F7F7F7]/25">
          Changes apply to all courts in this venue. Peak hours (09:00–11:00 &
          16:00–21:00) are configured in Courts & Pricing.
        </p>
          </>
        )}
      </section>
    </div>
  );
}
