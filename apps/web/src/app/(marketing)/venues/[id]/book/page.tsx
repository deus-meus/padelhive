"use client";

import { useEffect, useState, useMemo } from "react";
import { formatBookingDate, formatBookingTimeRange, formatShortWeekday, formatDayNumber } from "@/lib/format";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Users,
  Info,
  Tag,
  X,
} from "lucide-react";
import { ApiRequestError, createBooking, getVenue, getVenueCourts, getVenueAvailability, ApiAvailabilitySlot, validateVoucher, getApiErrorMessage } from "@/lib/api";
import { Court, Venue } from "@/types";

function SelectionTile({
  isSelected,
  isDisabled,
  primaryText,
  secondaryText,
  onClick,
  className = "",
}: {
  isSelected: boolean;
  isDisabled?: boolean;
  primaryText: React.ReactNode;
  secondaryText: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      disabled={isDisabled}
      onClick={onClick}
      className={`relative flex min-h-[64px] w-full flex-col items-center justify-center rounded-xl border p-3 text-center transition-all ${
        isDisabled
          ? "border-transparent bg-white/[0.02] text-[#F7F7F7]/25 line-through cursor-not-allowed"
          : isSelected
            ? "border-[#E6FA50] bg-[#E6FA50]/15 text-[#E6FA50] shadow-[0_0_12px_rgba(230,250,80,0.1)]"
            : "border-white/[0.08] bg-[#0C1B26] hover:border-[#50C8C8]/40"
      } ${className}`}
    >
      <span className={`text-sm font-medium ${isDisabled ? "text-[#F7F7F7]/25" : isSelected ? "text-[#E6FA50]" : "text-[#F7F7F7]/80"}`}>
        {primaryText}
      </span>
      <span
        className={`mt-0.5 block text-[11px] ${
          isSelected ? "text-[#E6FA50]/70" : isDisabled ? "text-[#F7F7F7]/25" : "text-[#F7F7F7]/60"
        }`}
      >
        {secondaryText}
      </span>
    </button>
  );
}

const DAYS_AHEAD = 14;

type BookingSubmitError =
  | "invalid-selection"
  | "overlap"
  | "auth-required"
  | "backend-unavailable"
  | "generic"
  | "voucher-invalid";

function generateDates() {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < DAYS_AHEAD; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d);
  }
  return dates;
}


function isWeekend(date: Date) {
  return date.getDay() === 0 || date.getDay() === 6;
}

function getIsoDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function areConsecutiveSlots(slots: string[]): boolean {
  if (slots.length === 0) return false;

  const hours = slots
    .map((slot) => parseInt(slot.split(":")[0], 10))
    .sort((a, b) => a - b);

  return hours.every((hour, index) => index === 0 || hour === hours[index - 1] + 1);
}

export default function BookingFlowPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { data: venue, isLoading: isLoadingVenue, isError: isVenueError } = useQuery({
    queryKey: queryKeys.venues.detail(params.id),
    queryFn: () => getVenue(params.id),
  });

  const { data: apiCourts, isLoading: isLoadingCourts, isError: isCourtsError } = useQuery({
    queryKey: queryKeys.venues.courts(params.id),
    queryFn: () => getVenueCourts(params.id),
  });

  const courts = useMemo(() => apiCourts && apiCourts.length > 0 ? apiCourts : [], [apiCourts]);

  const isLoadingApiData = isLoadingVenue || isLoadingCourts;
  const apiError = isVenueError || isCourtsError ? "Could not reach the live court API." : null;

  const dates = useMemo(() => generateDates(), []);

  const [selectedDate, setSelectedDate] = useState<Date>(dates[0]);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(courts[0] ?? null);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [rangeError, setRangeError] = useState<string | null>(null);

  useEffect(() => {
    if (courts.length > 0 && (!selectedCourt || !courts.some((c) => c.id === selectedCourt.id))) {
      setSelectedCourt(courts[0]);
      setSelectedSlots([]);
      setRangeError(null);
    }
  }, [courts, selectedCourt]);
  const [dateScrollStart, setDateScrollStart] = useState(0);
  const [confirmState, setConfirmState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [submitError, setSubmitError] = useState<BookingSubmitError | null>(null);

  const [voucherInput, setVoucherInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number } | null>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [voucherChecking, setVoucherChecking] = useState(false);
  
  const apiDateStr = useMemo(() => getIsoDateString(selectedDate), [selectedDate]);
  
  const { 
    data: availabilityResponse, 
    isError: isAvailabilityError,
    isLoading: isAvailabilityLoading,
    isFetching: isAvailabilityFetching,
    refetch: refetchAvailability
  } = useQuery({
    queryKey: queryKeys.venues.availability(venue?.id ?? "", apiDateStr, selectedCourt?.id ?? ""),
    queryFn: () => getVenueAvailability(venue!.id, apiDateStr, selectedCourt!.id),
    enabled: !!(venue?.id && selectedCourt?.id && apiDateStr),
  });

  const timeSlots = useMemo(() => {
    if (availabilityResponse && !isAvailabilityError && selectedCourt) {
      const court = availabilityResponse.courts.find((c) => c.id === selectedCourt.id);
      if (court) return court.slots;
    }
    return [];
  }, [availabilityResponse, isAvailabilityError, selectedCourt]);

  function toggleSlot(time: string) {
    if (confirmState === "submitting") return;

    setConfirmState("idle");
    setSubmitError(null);
    setAppliedVoucher(null);
    setVoucherError(null);

    setSelectedSlots((prev) => {
      if (prev.length === 0) {
        setRangeError(null);
        return [time];
      }

      if (prev.length === 1) {
        const anchor = prev[0];
        if (anchor === time) {
          setRangeError(null);
          return [];
        }

        const anchorHour = parseInt(anchor.split(":")[0], 10);
        const clickHour = parseInt(time.split(":")[0], 10);

        const startHour = Math.min(anchorHour, clickHour);
        const endHour = Math.max(anchorHour, clickHour);

        const range: string[] = [];
        for (let h = startHour; h <= endHour; h++) {
          range.push(`${h.toString().padStart(2, "0")}:00`);
        }

        const allAvailable = range.every((h) => {
          const slot = timeSlots.find((s) => s.startsAt === h);
          return slot && slot.available;
        });

        if (allAvailable) {
          setRangeError(null);
          return range.sort();
        } else {
          setRangeError("That range includes a booked slot — pick a clear range.");
          return [anchor];
        }
      }

      setRangeError(null);
      return [time];
    });
  }

  const totalPrice = useMemo(() => {
    return selectedSlots.reduce((sum, time) => {
      const slot = timeSlots.find((s) => s.startsAt === time);
      if (!slot) return sum;
      return sum + slot.price;
    }, 0);
  }, [selectedSlots, timeSlots]);

  const duration = selectedSlots.length;

  const platformFee = Math.round(totalPrice * 0.05);
  const subtotalWithFee = totalPrice + platformFee;
  const discountedTotal = Math.max(0, subtotalWithFee - (appliedVoucher?.discount ?? 0));

  async function handleApplyVoucher() {
    const code = voucherInput.trim().toUpperCase();
    if (!code || voucherChecking) return;
    if (selectedSlots.length === 0) {
      setVoucherError("Select your time slots first.");
      return;
    }
    setVoucherChecking(true);
    setVoucherError(null);
    try {
      const res = await validateVoucher(code, subtotalWithFee);
      setAppliedVoucher({ code: res.code, discount: res.discount });
    } catch (e) {
      setAppliedVoucher(null);
      setVoucherError(getApiErrorMessage(e));
    } finally {
      setVoucherChecking(false);
    }
  }

  function clearVoucher() {
    setAppliedVoucher(null);
    setVoucherError(null);
    setVoucherInput("");
  }

  const sortedSlots = [...selectedSlots].sort();
  const startTime = sortedSlots[0] ?? "--:--";
  const [endTime, setEndTime] = useState(sortedSlots.length
    ? `${sortedSlots[sortedSlots.length - 1].split(":")[0]}:00`
    : "--:--");

  useEffect(() => {
    if (selectedSlots.length > 0) {
      const lastSlot = sortedSlots[sortedSlots.length - 1];
      const nextHour = parseInt(lastSlot.split(":")[0], 10) + 1;
      setEndTime(`${nextHour.toString().padStart(2, "0")}:00`);
    }
  }, [selectedSlots, sortedSlots]);

  const queryClient = useQueryClient();

  const bookingMutation = useMutation({
    mutationFn: (data: Parameters<typeof createBooking>[0]) => createBooking(data),
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.venues.availability(venue!.id, getIsoDateString(selectedDate), selectedCourt!.id) });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });

      const query = new URLSearchParams({
        venue: booking.venue.name,
        court: booking.court.name,
        date: formatBookingDate(selectedDate),
        start: startTime,
        end: endTime,
        amount: booking.courtAmount.toString(),
        venueId: booking.venue.id,
      });

      setConfirmState("success");
      router.push(`/booking/${booking.id}/invite?${query.toString()}`);
    },
    onError: (error) => {
      setConfirmState("error");

      if (error instanceof ApiRequestError) {
        if (error.status === 409) {
          setSubmitError("overlap");
          return;
        }

        if (error.status === 401 || error.status === 403) {
          setSubmitError("auth-required");
          return;
        }

        if (error.status && error.status >= 500) {
          setSubmitError("backend-unavailable");
          return;
        }

        if (error.status === 400) {
          setSubmitError(appliedVoucher ? "voucher-invalid" : "generic");
          return;
        }

        setSubmitError("generic");
        return;
      }

      setSubmitError("backend-unavailable");
    }
  });

  async function handleConfirm() {
    if (confirmState === "submitting") return;

    const selectedUnavailableSlot = selectedSlots.some((time) => {
      const slot = timeSlots.find((candidate) => candidate.startsAt === time);
      return !slot || !slot.available;
    });

    if (
      !venue?.id ||
      !selectedCourt?.id ||
      selectedSlots.length === 0 ||
      selectedUnavailableSlot ||
      !areConsecutiveSlots(selectedSlots)
    ) {
      setConfirmState("error");
      setSubmitError("invalid-selection");
      return;
    }

    setConfirmState("submitting");
    setSubmitError(null);

    bookingMutation.mutate({
      venueId: venue.id,
      courtId: selectedCourt.id,
      bookingDate: formatBookingDate(selectedDate),
      startsAt: startTime,
      endsAt: endTime,
      voucherCode: appliedVoucher?.code,
    });
  }

  const submitErrorMessage = (() => {
    switch (submitError) {
      case "invalid-selection":
        return "Select one available consecutive time range before continuing.";
      case "overlap":
        return "This court is no longer available for the selected time. Choose another slot.";
      case "auth-required":
        return "Sign in before creating a booking.";
      case "backend-unavailable":
        return "Booking service is unavailable. Please try again when the backend is running.";
      case "generic":
        return "Could not create this booking. Please review your selection and retry.";
      case "voucher-invalid":
        return "This voucher couldn't be applied. Remove it or try another code.";
      default:
        return null;
    }
  })();

  return (
    <div className="min-h-screen">
      <div className="container max-w-7xl pb-component pt-28 md:pt-32">
        {apiError && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200/80">
            {apiError}
          </div>
        )}
        {!isLoadingApiData && courts.length === 0 && (
          <div className="mb-5 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm text-[#F7F7F7]/60">
            No courts are available for this venue yet.
          </div>
        )}
        {/* Back */}
        <Link
          href={venue ? `/venues/${venue.id}` : "/venues"}
          className="inline-flex items-center gap-2 text-sm text-[#F7F7F7]/40 hover:text-[#F7F7F7]/60 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to venue
        </Link>

        {/* Header */}
        <div className="mt-6">
          <h1 className="heading-1 text-3xl text-[#F7F7F7] md:text-4xl">
            Book a Court
          </h1>
          {venue && (
            <p className="mt-2 flex items-center gap-2 text-sm text-[#F7F7F7]/40">
              <MapPin className="h-3.5 w-3.5" />
              {venue.name} · {venue.city}
            </p>
          )}
        </div>

        <div className="mt-component grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_340px]">
          {/* Left — Selection */}
          <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5 md:p-6 space-y-8 divide-y divide-white/[0.06]">
            {/* Court Selector */}
            <div className="pt-0">
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#50C8C8]/20 text-[11px] font-bold text-[#50C8C8]">
                  1
                </div>
                <h2 className="section-label">Select Court</h2>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                {isLoadingApiData ? (
                  [...Array(2)].map((_, i) => (
                    <Skeleton key={i} className="min-h-[64px] w-full rounded-xl" />
                  ))
                ) : (
                  courts.map((court) => (
                    <SelectionTile
                      key={court.id}
                      isSelected={selectedCourt?.id === court.id}
                      primaryText={court.name}
                      secondaryText={court.type}
                      onClick={() => {
                        setSelectedCourt(court);
                        setSelectedSlots([]);
                        setRangeError(null);
                        setSubmitError(null);
                        setConfirmState("idle");
                        setAppliedVoucher(null);
                        setVoucherError(null);
                      }}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Date Selector */}
            <div className="pt-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#50C8C8]/20 text-[11px] font-bold text-[#50C8C8]">
                    2
                  </div>
                  <h2 className="section-label flex items-center">
                    <Calendar className="mr-2 inline h-3.5 w-3.5" />
                    Select Date
                  </h2>
                </div>
                <div className="hidden items-center gap-2 sm:flex">
                  <button
                    onClick={() =>
                      setDateScrollStart(Math.max(0, dateScrollStart - 4))
                    }
                    disabled={dateScrollStart === 0}
                    className="rounded-lg border border-white/[0.06] p-2 text-[#F7F7F7]/40 transition-colors hover:border-white/[0.12] hover:text-[#F7F7F7]/70 disabled:opacity-20 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() =>
                      setDateScrollStart(
                        Math.min(DAYS_AHEAD - 7, dateScrollStart + 4)
                      )
                    }
                    disabled={dateScrollStart >= DAYS_AHEAD - 7}
                    className="rounded-lg border border-white/[0.06] p-2 text-[#F7F7F7]/40 transition-colors hover:border-white/[0.12] hover:text-[#F7F7F7]/70 disabled:opacity-20 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="mt-4 flex overflow-x-auto gap-2.5 sm:grid sm:grid-cols-7 pb-2 sm:pb-0 scrollbar-none">
                  {isLoadingApiData ? (
                    [...Array(7)].map((_, i) => (
                      <Skeleton key={i} className="min-h-[64px] min-w-[72px] sm:min-w-0 flex-1 rounded-xl" />
                    ))
                  ) : (
                    dates
                      .slice(dateScrollStart, dateScrollStart + 7)
                      .map((date) => {
                        const isSelected = date.toDateString() === selectedDate.toDateString();
                        const isToday = date.toDateString() === new Date().toDateString();
                        return (
                          <div key={date.toISOString()} className="min-w-[72px] sm:min-w-0 flex-1">
                            <SelectionTile
                              isSelected={isSelected}
                              primaryText={formatDayNumber(date).toString()}
                              secondaryText={
                                <>
                                  {formatShortWeekday(date).toUpperCase()}
                                  {isToday && <span className="ml-1 text-[#50C8C8]">Today</span>}
                                </>
                              }
                              onClick={() => {
                                setSelectedDate(date);
                                setSelectedSlots([]);
                                setRangeError(null);
                                setSubmitError(null);
                                setConfirmState("idle");
                                setAppliedVoucher(null);
                                setVoucherError(null);
                              }}
                            />
                          </div>
                        );
                      })
                  )}
              </div>
              {/* Mobile pagination */}
              <div className="mt-2 flex items-center justify-between sm:hidden">
                <button
                  onClick={() =>
                    setDateScrollStart(Math.max(0, dateScrollStart - 4))
                  }
                  disabled={dateScrollStart === 0}
                  className="flex items-center gap-1 text-[11px] text-[#F7F7F7]/25 disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </button>
                <button
                  onClick={() =>
                    setDateScrollStart(
                      Math.min(DAYS_AHEAD - 7, dateScrollStart + 4)
                    )
                  }
                  disabled={dateScrollStart >= DAYS_AHEAD - 7}
                  className="flex items-center gap-1 text-[11px] text-[#F7F7F7]/25 disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Time Slot Selector */}
            <div className="pt-8">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#50C8C8]/20 text-[11px] font-bold text-[#50C8C8]">
                      3
                    </div>
                    <h2 className="section-label flex items-center">
                      <Clock className="mr-2 inline h-3.5 w-3.5" />
                      Select Time
                    </h2>
                  </div>
                  <p className="mt-2 text-[11px] text-[#F7F7F7]/25">
                    Each slot is 1 hour. Tap a slot to book that hour, or tap a start then an end slot to select a longer range.
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2.5 sm:grid-cols-6 md:grid-cols-8">
                {isLoadingApiData ? (
                  [...Array(16)].map((_, i) => (
                    <Skeleton key={i} className="min-h-[64px] w-full rounded-xl" />
                  ))
                ) : !selectedCourt ? (
                  <div className="col-span-full py-8 text-center text-[11px] text-[#F7F7F7]/40 border border-dashed border-white/[0.08] rounded-xl bg-white/[0.01]">
                    Select a court and date to see availability.
                  </div>
                ) : isAvailabilityLoading || isAvailabilityFetching ? (
                  [...Array(16)].map((_, i) => (
                    <Skeleton key={i} className="min-h-[64px] w-full rounded-xl" />
                  ))
                ) : isAvailabilityError ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-8 text-center border border-dashed border-red-500/20 bg-red-500/10 rounded-xl">
                    <p className="text-[11px] text-red-200/80 mb-3">Couldn&apos;t load availability. Please try again.</p>
                    <button onClick={() => refetchAvailability()} className="rounded-xl bg-red-500/20 px-4 py-2 text-[11px] font-medium text-red-200 hover:bg-red-500/30 transition-colors">
                      Retry
                    </button>
                  </div>
                ) : timeSlots.length === 0 ? (
                  <div className="col-span-full py-8 text-center text-[11px] text-[#F7F7F7]/40 border border-dashed border-white/[0.08] rounded-xl bg-white/[0.01]">
                    No slots available for this date.
                  </div>
                ) : (
                  timeSlots.map((slot) => {
                    const isSelected = selectedSlots.includes(slot.startsAt);
                    return (
                      <SelectionTile
                        key={slot.startsAt}
                        isDisabled={!slot.available}
                        isSelected={isSelected}
                        primaryText={slot.startsAt}
                        secondaryText={!slot.available ? "Booked" : `${(slot.price / 1000).toFixed(0)}K`}
                        onClick={() => toggleSlot(slot.startsAt)}
                      />
                    );
                  })
                )}
              </div>
              {rangeError && (
                <p className="mt-2 text-[11px] text-red-400">
                  {rangeError}
                </p>
              )}
              {selectedSlots.length > 0 && (
                <p className="mt-3 text-[11px] text-[#E6FA50]">
                  Booking {startTime} – {endTime} · {duration} hour{duration > 1 ? "s" : ""}
                </p>
              )}
              <div className="mt-3 flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-sm border border-white/[0.08] bg-[#0C1B26]" />
                  <span className="text-[10px] leading-[11px] text-[#F7F7F7]/25">Available</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-sm border border-[#E6FA50] bg-[#E6FA50]/15" />
                  <span className="text-[10px] leading-[11px] text-[#F7F7F7]/25">Selected</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-sm border border-transparent bg-white/[0.02]" />
                  <span className="text-[10px] leading-[11px] text-[#F7F7F7]/25">Booked</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Booking Summary */}
          <div className="lg:relative self-start">
            <div className="lg:sticky lg:top-28">
              <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
                <h3 className="section-label">
                  Booking Summary
                </h3>

                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#F7F7F7]/40">Venue</span>
                    <span className="text-sm font-medium text-[#F7F7F7]/80">
                      {venue?.name ?? "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#F7F7F7]/40">Court</span>
                    <span className="text-sm font-medium text-[#F7F7F7]/80">
                      {selectedCourt?.name ?? "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#F7F7F7]/40">Date</span>
                    <span className="text-sm font-medium text-[#F7F7F7]/80">
                      {formatBookingDate(selectedDate)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#F7F7F7]/40">Time</span>
                    <span className="text-sm font-medium text-[#F7F7F7]/80">
                      {selectedSlots.length > 0
                        ? formatBookingTimeRange(startTime, endTime)
                        : "Not selected"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#F7F7F7]/40">Duration</span>
                    <span className="text-sm font-medium text-[#F7F7F7]/80">
                      {duration > 0 ? `${duration} hour${duration > 1 ? "s" : ""}` : "—"}
                    </span>
                  </div>
                </div>

                <div className="mt-5 border-t border-white/[0.06] pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#F7F7F7]/40">
                      Court rental
                    </span>
                    <span className="text-sm text-[#F7F7F7]/60">
                      {totalPrice > 0
                        ? `Rp ${totalPrice.toLocaleString("id-ID")}`
                        : "—"}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-[#F7F7F7]/40">
                      Platform fee
                    </span>
                    <span className="text-sm text-[#F7F7F7]/60">
                      {totalPrice > 0
                        ? `Rp ${(totalPrice * 0.05).toLocaleString("id-ID")}`
                        : "—"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 border-t border-white/[0.06] pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#F7F7F7]/60">
                      Total
                    </span>
                    <span className="price text-xl text-[#F7F7F7]">
                      {totalPrice > 0
                        ? `Rp ${(totalPrice * 1.05).toLocaleString("id-ID")}`
                        : "—"}
                    </span>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <h4 className="section-label flex items-center">
                    <Tag className="mr-2 inline h-3.5 w-3.5" />
                    Voucher
                  </h4>
                  {appliedVoucher ? (
                    <div className="rounded-xl border border-white/[0.06] bg-[#0C1B26] p-3 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-[#F7F7F7]/80 uppercase">{appliedVoucher.code}</span>
                        <span className="text-[11px] text-[#E6FA50]">− Rp {appliedVoucher.discount.toLocaleString("id-ID")}</span>
                      </div>
                      <button onClick={clearVoucher} className="p-2 text-[#F7F7F7]/40 hover:text-[#F7F7F7]/80 transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={voucherInput}
                        onChange={(e) => setVoucherInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleApplyVoucher()}
                        placeholder="ENTER CODE"
                        className="w-full uppercase rounded-xl border border-white/[0.06] bg-[#0C1B26] px-3 py-2 text-sm text-[#F7F7F7] placeholder:text-[#F7F7F7]/25 outline-none focus:border-white/[0.15]"
                      />
                      <button
                        onClick={handleApplyVoucher}
                        disabled={!voucherInput.trim() || voucherChecking}
                        className="rounded-xl bg-white/[0.06] px-4 py-2 text-sm font-medium text-[#F7F7F7]/80 hover:bg-white/[0.1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {voucherChecking ? "Checking…" : "Apply"}
                      </button>
                    </div>
                  )}
                  {voucherError && (
                    <p className="text-[11px] text-red-400">
                      {voucherError}
                    </p>
                  )}
                  {appliedVoucher && (
                    <div className="pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#F7F7F7]/40">Discount</span>
                        <span className="text-sm text-[#E6FA50]">
                          − Rp {appliedVoucher.discount.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between border-t border-white/[0.06] pt-2">
                        <span className="text-sm font-medium text-[#F7F7F7]/60">Estimated total</span>
                        <span className="price text-xl text-[#F7F7F7]">
                          Rp {discountedTotal.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {selectedSlots.length === 0 && (
                  <div className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                    <p className="text-[11px] leading-relaxed text-[#F7F7F7]/40">
                      Select at least one available time slot to continue.
                    </p>
                  </div>
                )}
                {submitErrorMessage && (
                  <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-3">
                    <p className="text-[11px] leading-relaxed text-red-200/80">
                      {submitErrorMessage}
                    </p>
                  </div>
                )}
                {confirmState === "success" && (
                  <div className="mt-5 rounded-xl border border-[#E6FA50]/20 bg-[#E6FA50]/10 p-3">
                    <p className="text-[11px] leading-relaxed text-[#E6FA50]">
                      Booking created. Taking you to invite friends.
                    </p>
                  </div>
                )}

                <button
                  onClick={handleConfirm}
                  disabled={courts.length === 0 || selectedSlots.length === 0 || confirmState === "submitting"}
                  className="btn-lime mt-6 flex h-12 w-full items-center justify-center rounded-full text-[11px] font-semibold uppercase tracking-[0.08em] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  {confirmState === "submitting" ? "Creating Booking..." : "Continue to Invite & Pay"}
                </button>

                <div className="mt-4 flex items-start gap-2 rounded-lg bg-white/[0.02] p-3">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#F7F7F7]/25" />
                  <p className="text-[11px] leading-relaxed text-[#F7F7F7]/25">
                    Free cancellation up to 24 hours before your booking. After
                    that, standard refund policy applies.
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-[#F7F7F7]/25">
                  <Users className="h-3 w-3" />
                  <span>You can invite friends after booking</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
