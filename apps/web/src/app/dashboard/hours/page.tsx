"use client";

import { useState, useEffect } from "react";
import { Save, CheckCircle2, Building2, Loader2, Clock, Copy } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { getVenuesManage, updateVenue, getApiErrorMessage } from "@/lib/api";
import { ErrorBanner, EmptyState } from "@/components/ui/error-state";
import { TimeSelect } from "@/components/ui/time-select";

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
  const [isDirty, setIsDirty] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

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
      setIsDirty(false);
    }
  }, [venue]);

  useEffect(() => {
    if (!venue || schedule.length === 0) return;
    const isDifferent = schedule.some(day => {
      if (venue.weeklyHours) {
        const entry = venue.weeklyHours[day.key];
        if (!entry) return day.open !== venue.operatingHours.open || day.close !== venue.operatingHours.close || day.closed !== false;
        return day.open !== entry.open || day.close !== entry.close || day.closed !== !!entry.closed;
      } else {
        return day.open !== venue.operatingHours.open || day.close !== venue.operatingHours.close || day.closed !== false;
      }
    });
    setIsDirty(isDifferent);
  }, [schedule, venue]);

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
      setIsDirty(false);
      showToast("Operating hours saved");
      setTimeout(() => reset(), 2000);
    },
    onError: (err) => {
      const msg = getApiErrorMessage(err);
      setErrorMsg(msg);
      showToast(msg);
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

  const wibKey = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "Asia/Jakarta" }).format(new Date()).toLowerCase();

  return (
    <div className="py-8">
      <section className="container">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-1 text-2xl text-[#F7F7F7] md:text-3xl">
              Operating Hours
            </h1>
            <p className="mt-1 text-sm text-[#F7F7F7]/40">
              Set venue-wide open and close times
            </p>
          </div>
          <div className="flex items-center gap-4">
            {isDirty && !isPending && !isSuccess && (
              <span className="hidden sm:inline caption text-[#E6FA50]">Unsaved changes</span>
            )}
            <button
              onClick={handleSave}
              disabled={isPending || isLoading || isVenuesError || venues.length === 0 || !isDirty}
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
        </div>

        {isLoading ? (
          <>
            <div className="mt-6 flex gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-9 w-24 animate-pulse rounded-full bg-white/[0.04]" />
              ))}
            </div>
            <div className="mt-8 rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
              <div className="h-64 w-full animate-pulse rounded-lg bg-white/[0.04]" />
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
              <div className="flex items-center justify-between mb-6 border-b border-white/[0.06] pb-6">
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
                  className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#F7F7F7]/60 transition-colors hover:border-white/[0.15] hover:bg-white/[0.04] hover:text-[#F7F7F7]/80"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Copy Monday</span>
                </button>
              </div>

              {errorMsg && (
                <div className="mb-6 rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-4">
                {schedule.map((day, index) => {
                  const isToday = day.key === wibKey;
                  return (
                    <div key={day.key} className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-white/[0.04] bg-white/[0.01] transition-all ${isToday ? "border-l-2 border-l-[#E6FA50]/60 bg-[#E6FA50]/[0.02]" : ""}`}>
                      <div className="flex items-center justify-between sm:w-32 shrink-0">
                        <span className="text-sm font-medium text-[#F7F7F7]/80 flex items-center gap-2">
                          {day.label}
                          {isToday && <span className="rounded bg-[#E6FA50]/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#E6FA50]">Today</span>}
                        </span>
                        <label className="flex items-center gap-2 cursor-pointer sm:hidden">
                          <span className="text-xs font-medium text-[#F7F7F7]/40 uppercase tracking-wider">Closed</span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={day.closed}
                            onClick={() => handleDayChange(index, "closed", !day.closed)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                              day.closed ? "bg-[#E6FA50]" : "bg-white/[0.08]"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full shadow ring-0 transition duration-200 ease-in-out ${
                                day.closed ? "translate-x-4 bg-[#06121A]" : "translate-x-1 bg-[#F7F7F7]/80"
                              }`}
                            />
                          </button>
                        </label>
                      </div>
                      
                      <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {day.closed ? (
                          <div className="w-full sm:max-w-xs rounded-lg bg-white/[0.02] px-3 py-2 text-center sm:text-left text-sm text-[#F7F7F7]/40 border border-white/[0.04]">
                            Closed all day
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="w-full sm:w-32">
                              <TimeSelect value={day.open} onChange={(v) => handleDayChange(index, "open", v)} disabled={day.closed} ariaLabel={`${day.label} opening time`} />
                            </div>
                            <span className="text-[#F7F7F7]/40">–</span>
                            <div className="w-full sm:w-32">
                              <TimeSelect value={day.close} onChange={(v) => handleDayChange(index, "close", v)} disabled={day.closed} ariaLabel={`${day.label} closing time`} />
                            </div>
                          </div>
                        )}
                        <label className="hidden sm:flex items-center gap-3 cursor-pointer shrink-0">
                          <span className="text-xs font-medium text-[#F7F7F7]/40 uppercase tracking-wider">Closed</span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={day.closed}
                            onClick={() => handleDayChange(index, "closed", !day.closed)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                              day.closed ? "bg-[#E6FA50]" : "bg-white/[0.08]"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full shadow ring-0 transition duration-200 ease-in-out ${
                                day.closed ? "translate-x-4 bg-[#06121A]" : "translate-x-1 bg-[#F7F7F7]/80"
                              }`}
                            />
                          </button>
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </section>
      
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-white/[0.08] bg-[#0C1B26] px-5 py-3 shadow-2xl shadow-black/40 transition-all">
          <p className="text-sm text-[#F7F7F7]/60">{toast}</p>
        </div>
      )}
    </div>
  );
}
