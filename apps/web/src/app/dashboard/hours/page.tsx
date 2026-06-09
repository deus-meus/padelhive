"use client";

import { useState, useEffect } from "react";
import { Save, CheckCircle2, Building2, Loader2, Clock } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { getVenuesManage, updateVenue, getApiErrorMessage } from "@/lib/api";
import { ErrorBanner, EmptyState } from "@/components/ui/error-state";

export default function OperatingHoursPage() {
  const queryClient = useQueryClient();
  const { data: venues = [], isLoading, isError: isVenuesError, error: venuesError, refetch: refetchVenues, isFetching: isVenuesFetching } = useQuery({
    queryKey: queryKeys.venues.manage(),
    queryFn: getVenuesManage,
  });

  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const activeVenueId = selectedVenueId || (venues.length > 0 ? venues[0].id : null);
  const venue = venues.find((v) => v.id === activeVenueId);

  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync inputs when venue changes
  useEffect(() => {
    if (venue) {
      setOpenTime(venue.operatingHours.open);
      setCloseTime(venue.operatingHours.close);
      setErrorMsg(null);
    }
  }, [venue]);

  function handleVenueChange(id: string) {
    setSelectedVenueId(id);
    setErrorMsg(null);
  }

  const { mutate, isPending, isSuccess, reset } = useMutation({
    mutationFn: (data: { openTime: string; closeTime: string }) => {
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
    if (!openTime || !closeTime) {
      setErrorMsg("Both open and close times are required.");
      return;
    }
    if (closeTime <= openTime) {
      setErrorMsg("Close time must be after open time.");
      return;
    }
    setErrorMsg(null);
    mutate({ openTime, closeTime });
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
            {/* Venue selector */}
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

            {/* Editing Box */}
            <div className="mt-8 rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04]">
                  <Clock className="h-5 w-5 text-[#50C8C8]" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[#F7F7F7]">Venue Hours</h3>
                  <p className="text-xs text-[#F7F7F7]/40 mt-0.5">Applies to all courts in this venue.</p>
                </div>
              </div>

              {errorMsg && (
                <div className="mb-6 rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
                  {errorMsg}
                </div>
              )}

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#F7F7F7]/60">Open Time</label>
                  <input
                    type="time"
                    value={openTime}
                    onChange={(e) => setOpenTime(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[#F7F7F7] focus:border-[#E6FA50]/30 focus:outline-none [color-scheme:dark]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#F7F7F7]/60">Close Time</label>
                  <input
                    type="time"
                    value={closeTime}
                    onChange={(e) => setCloseTime(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[#F7F7F7] focus:border-[#E6FA50]/30 focus:outline-none [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
