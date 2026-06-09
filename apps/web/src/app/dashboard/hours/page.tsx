"use client";

import { useState, useEffect } from "react";
import { Save, CheckCircle2, Building2, Loader2, Clock, Copy } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { getVenuesManage, updateVenue, getApiErrorMessage } from "@/lib/api";
import { ErrorBanner, EmptyState } from "@/components/ui/error-state";

const DAYS = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];

type DaySchedule = {
  key: string;
  label: string;
  open: string;
  close: string;
  closed: boolean;
};

export default function OperatingHoursPage() {
  const queryClient = useQueryClient();
  const { data: venues = [], isLoading, isError: isVenuesError, error: venuesError, refetch: refetchVenues, isFetching: isVenuesFetching } = useQuery({
    queryKey: queryKeys.venues.manage(),
    queryFn: getVenuesManage,
  });

  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const activeVenueId = selectedVenueId || (venues.length > 0 ? venues[0].id : null);
  const venue = venues.find((v) => v.id === activeVenueId);

  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (venue) {
      if (venue.weeklyHours) {
        setSchedule(
          DAYS.map((d) => {
            const entry = venue.weeklyHours![d.key] || { open: "06:00", close: "22:00", closed: false };
            return {
              key: d.key,
              label: d.label,
              open: entry.open || "06:00",
              close: entry.close || "22:00",
              closed: !!entry.closed,
            };
          })
        );
      } else {
        setSchedule(
          DAYS.map((d) => ({
            key: d.key,
            label: d.label,
            open: venue.operatingHours.open,
            close: venue.operatingHours.close,
            closed: false,
          }))
        );
      }
      setErrorMsg(null);
    }
  }, [venue]);

  function handleVenueChange(id: string) {
    setSelectedVenueId(id);
    setErrorMsg(null);
  }

  const { mutate, isPending, isSuccess, reset } = useMutation({
    mutationFn: (data: { weeklyHours: Record<string, { open: string; close: string; closed: boolean }> }) => {
      if (!activeVenueId) throw new Error("No venue selected");
      return updateVenue(activeVenueId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.venues.manage() });
      if (activeVenueId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.venues.detail(activeVenueId) });
      }
      setTimeout(() => reset(), 2000);
    },
    onError: (err) => {
      setErrorMsg(getApiErrorMessage(err));
    },
  });

  function handleSave() {
    for (const day of schedule) {
      if (!day.closed) {
        if (!day.open || !day.close) {
          setErrorMsg("Both open and close times are required for all open days.");
          return;
        }
        if (day.close <= day.open) {
          setErrorMsg(`Close time must be after open time on ${day.label}.`);
          return;
        }
      }
    }
    setErrorMsg(null);

    const weeklyHours: Record<string, { open: string; close: string; closed: boolean }> = {};
    schedule.forEach((day) => {
      weeklyHours[day.key] = { open: day.open, close: day.close, closed: day.closed };
    });

    mutate({ weeklyHours });
  }

  function handleDayChange(index: number, field: keyof DaySchedule, value: string | boolean) {
    setSchedule((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function copyMonday() {
    const mon = schedule.find((s) => s.key === "mon");
    if (!mon) return;
    setSchedule((prev) =>
      prev.map((s) => ({
        ...s,
        open: mon.open,
        close: mon.close,
        closed: mon.closed,
      }))
    );
  }

  return (
    <div className="py-8">
      <section className="container max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-1 text-2xl text-[#F7F7F7] md:text-3xl">
              Operating Hours
            </h1>
            <p className="mt-1 text-sm text-[#F7F7F7]/40">
              Set venue-wide open and close times
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={isPending || isLoading || isVenuesError || venues.length === 0}
            className={`flex h-10 items-center gap-2 rounded-full px-5 text-[11px] font-semibold uppercase tracking-[0.08em] transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              isSuccess
                ? "bg-green-400/10 text-green-400 border border-green-400/30"
                : "btn-lime"
            }`}
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving
              </>
            ) : isSuccess ? (
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

        {isLoading ? (
          <>
            <div className="mt-6 flex gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-9 w-24 animate-pulse rounded-full bg-white/[0.04]" />
              ))}
            </div>
            <div className="mt-8 rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
              <div className="h-16 w-full animate-pulse rounded-lg bg-white/[0.04]" />
            </div>
          </>
        ) : isVenuesError ? (
          <div className="mt-6">
            <ErrorBanner title="Couldn't load venues" error={venuesError} onRetry={() => refetchVenues()} isRetrying={isVenuesFetching} />
          </div>
        ) : venues.length === 0 ? (
          <div className="mt-6">
            <EmptyState icon={Building2} title="No venues yet" description="Add a venue first to set its operating hours." actionLabel="Go to Venues" actionHref="/dashboard/venues" />
          </div>
        ) : (
          <>
            <div className="mt-6 flex gap-2 overflow-x-auto no-scrollbar">
              {venues.map((v) => (
                <button
                  key={v.id}
                  onClick={() => handleVenueChange(v.id)}
                  className={`shrink-0 rounded-full px-4 py-2 text-[11px] font-medium uppercase tracking-[0.08em] transition-all ${
                    activeVenueId === v.id
                      ? "bg-[#E6FA50] text-[#06121A]"
                      : "bg-white/[0.03] text-[#F7F7F7]/40 hover:bg-white/[0.06] hover:text-[#F7F7F7]/60"
                  }`}
                >
                  {v.name}
                </button>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04]">
                    <Clock className="h-5 w-5 text-[#50C8C8]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[#F7F7F7]">Venue Hours</h3>
                    <p className="text-xs text-[#F7F7F7]/40 mt-0.5">Applies to all courts in this venue.</p>
                  </div>
                </div>
                <button
                  onClick={copyMonday}
                  className="flex items-center gap-1.5 rounded-full border border-white/[0.08] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-[#F7F7F7]/60 transition-colors hover:border-white/[0.15] hover:text-[#F7F7F7]/80"
                >
                  <Copy className="h-3 w-3" />
                  Copy Monday
                </button>
              </div>

              {errorMsg && (
                <div className="mb-6 rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-4">
                {schedule.map((day, index) => (
                  <div key={day.key} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-white/[0.04] bg-white/[0.01]">
                    <div className="flex items-center justify-between sm:w-32">
                      <span className="text-sm font-medium text-[#F7F7F7]/80">{day.label}</span>
                      <label className="flex items-center gap-2 cursor-pointer sm:hidden">
                        <span className="text-xs text-[#F7F7F7]/40">Closed</span>
                        <input
                          type="checkbox"
                          checked={day.closed}
                          onChange={(e) => handleDayChange(index, "closed", e.target.checked)}
                          className="h-4 w-4 rounded border-white/[0.2] bg-transparent text-[#E6FA50] focus:ring-[#E6FA50]/30 focus:ring-offset-0"
                        />
                      </label>
                    </div>
                    
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <input
                        type="time"
                        value={day.open}
                        onChange={(e) => handleDayChange(index, "open", e.target.value)}
                        disabled={day.closed}
                        className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm text-[#F7F7F7] focus:border-[#E6FA50]/30 focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed [color-scheme:dark]"
                      />
                      <input
                        type="time"
                        value={day.close}
                        onChange={(e) => handleDayChange(index, "close", e.target.value)}
                        disabled={day.closed}
                        className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm text-[#F7F7F7] focus:border-[#E6FA50]/30 focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed [color-scheme:dark]"
                      />
                    </div>

                    <label className="hidden sm:flex items-center gap-2 cursor-pointer ml-2">
                      <input
                        type="checkbox"
                        checked={day.closed}
                        onChange={(e) => handleDayChange(index, "closed", e.target.checked)}
                        className="h-4 w-4 rounded border-white/[0.2] bg-transparent text-[#E6FA50] focus:ring-[#E6FA50]/30 focus:ring-offset-0"
                      />
                      <span className="text-xs font-medium text-[#F7F7F7]/40 uppercase tracking-wider">Closed</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
