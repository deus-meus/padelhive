"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { mockVenues } from "@/mock/venues";
import { mockCourts } from "@/mock/courts";

const DAYS_AHEAD = 14;

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

function generateTimeSlots(open: string, close: string, seed: number) {
  const slots = [];
  const startHour = parseInt(open.split(":")[0]);
  const endHour = parseInt(close.split(":")[0]);
  for (let h = startHour; h < endHour; h++) {
    const time = `${h.toString().padStart(2, "0")}:00`;
    const isPeak = (h >= 9 && h <= 11) || (h >= 16 && h <= 21);
    const hash = ((h + 1) * 2654435761 + seed) >>> 0;
    const isBooked = (hash % 100) < 35;
    slots.push({ time, isPeak, isBooked });
  }
  return slots;
}

function isWeekend(date: Date) {
  return date.getDay() === 0 || date.getDay() === 6;
}

export default function BookingFlowPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const venue = mockVenues.find((v) => v.id === params.id) ?? mockVenues[0];
  const courts = mockCourts.filter((c) => c.venueId === venue.id);

  const dates = useMemo(() => generateDates(), []);

  const [selectedDate, setSelectedDate] = useState<Date>(dates[0]);
  const [selectedCourt, setSelectedCourt] = useState(courts[0]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [dateScrollStart, setDateScrollStart] = useState(0);

  const timeSlots = useMemo(() => {
    const dateSeed = selectedDate.getFullYear() * 10000 + (selectedDate.getMonth() + 1) * 100 + selectedDate.getDate();
    const courtSeed = selectedCourt.id.charCodeAt(selectedCourt.id.length - 1);
    return generateTimeSlots(
      venue.operatingHours.open,
      venue.operatingHours.close,
      dateSeed + courtSeed
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venue.id, selectedDate.toDateString(), selectedCourt.id]);

  const weekend = isWeekend(selectedDate);

  function getSlotPrice(isPeak: boolean) {
    if (weekend) {
      return isPeak
        ? selectedCourt.pricing.weekendPeak
        : selectedCourt.pricing.weekendOffPeak;
    }
    return isPeak
      ? selectedCourt.pricing.weekdayPeak
      : selectedCourt.pricing.weekdayOffPeak;
  }

  function toggleSlot(time: string) {
    setSelectedSlots((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    );
  }

  const totalPrice = useMemo(() => {
    return selectedSlots.reduce((sum, time) => {
      const slot = timeSlots.find((s) => s.time === time);
      if (!slot) return sum;
      return sum + getSlotPrice(slot.isPeak);
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSlots, selectedCourt, selectedDate]);

  const duration = selectedSlots.length;

  const sortedSlots = [...selectedSlots].sort();
  const startTime = sortedSlots[0] ?? "--:--";
  const endTime = sortedSlots.length
    ? `${(parseInt(sortedSlots[sortedSlots.length - 1].split(":")[0]) + 1).toString().padStart(2, "0")}:00`
    : "--:--";

  function handleConfirm() {
    const params = new URLSearchParams({
      venue: venue.name,
      court: selectedCourt.name,
      date: selectedDate.toISOString().split("T")[0],
      start: startTime,
      end: endTime,
      amount: totalPrice.toString(),
      venueId: venue.id,
    });
    router.push(`/booking/new/invite?${params.toString()}`);
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="container max-w-4xl py-8">
        {/* Back */}
        <Link
          href={`/venues/${venue.id}`}
          className="inline-flex items-center gap-2 text-sm text-[#F7F7F7]/40 hover:text-[#F7F7F7]/70 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to venue
        </Link>

        {/* Header */}
        <div className="mt-6">
          <h1 className="heading-1 text-2xl text-[#F7F7F7] md:text-3xl">
            Book a Court
          </h1>
          <p className="mt-2 flex items-center gap-2 text-sm text-[#F7F7F7]/40">
            <MapPin className="h-3.5 w-3.5" />
            {venue.name} · {venue.city}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
          {/* Left — Selection */}
          <div className="space-y-8">
            {/* Court Selector */}
            <div>
              <h2 className="heading-3 text-sm text-[#F7F7F7]/60 uppercase tracking-wider">
                Select Court
              </h2>
              <div className="mt-3 flex flex-wrap gap-3">
                {courts.map((court) => (
                  <button
                    key={court.id}
                    onClick={() => {
                      setSelectedCourt(court);
                      setSelectedSlots([]);
                    }}
                    className={`rounded-xl border px-5 py-3 transition-all ${
                      selectedCourt.id === court.id
                        ? "border-[#E6FA50]/40 bg-[#E6FA50]/10 text-[#E6FA50]"
                        : "border-white/[0.06] bg-[#0C1B26] text-[#F7F7F7]/50 hover:border-white/[0.12]"
                    }`}
                  >
                    <p className="text-sm font-medium">{court.name}</p>
                    <p className="mt-0.5 text-[10px] opacity-60">
                      {court.type}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Selector */}
            <div>
              <h2 className="heading-3 text-sm text-[#F7F7F7]/60 uppercase tracking-wider">
                <Calendar className="mr-2 inline h-3.5 w-3.5" />
                Select Date
              </h2>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() =>
                    setDateScrollStart(Math.max(0, dateScrollStart - 4))
                  }
                  disabled={dateScrollStart === 0}
                  className="hidden sm:block rounded-lg border border-white/[0.06] p-2 text-[#F7F7F7]/30 hover:text-[#F7F7F7]/60 disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="grid flex-1 grid-cols-4 gap-2 sm:grid-cols-7">
                  {dates
                    .slice(dateScrollStart, dateScrollStart + 7)
                    .map((date, idx) => {
                      const isSelected =
                        date.toDateString() === selectedDate.toDateString();
                      const isToday =
                        date.toDateString() === new Date().toDateString();
                      const wknd = isWeekend(date);
                      const hiddenOnMobile = idx >= 4 ? "hidden sm:flex" : "flex";
                      return (
                        <button
                          key={date.toISOString()}
                          onClick={() => {
                            setSelectedDate(date);
                            setSelectedSlots([]);
                          }}
                          className={`${hiddenOnMobile} flex-col items-center rounded-xl border py-3 transition-all ${
                            isSelected
                              ? "border-[#E6FA50]/40 bg-[#E6FA50]/10"
                              : "border-white/[0.06] bg-[#0C1B26] hover:border-white/[0.12]"
                          }`}
                        >
                          <span
                            className={`text-[10px] uppercase ${
                              isSelected
                                ? "text-[#E6FA50]/70"
                                : wknd
                                  ? "text-[#50C8C8]/50"
                                  : "text-[#F7F7F7]/25"
                            }`}
                          >
                            {date.toLocaleDateString("en-US", {
                              weekday: "short",
                            })}
                          </span>
                          <span
                            className={`mt-1 text-lg font-medium ${
                              isSelected
                                ? "text-[#E6FA50]"
                                : "text-[#F7F7F7]/60"
                            }`}
                          >
                            {date.getDate()}
                          </span>
                          {isToday && (
                            <span className="mt-0.5 text-[9px] text-[#50C8C8]">
                              Today
                            </span>
                          )}
                        </button>
                      );
                    })}
                </div>
                <button
                  onClick={() =>
                    setDateScrollStart(
                      Math.min(DAYS_AHEAD - 7, dateScrollStart + 4)
                    )
                  }
                  disabled={dateScrollStart >= DAYS_AHEAD - 7}
                  className="hidden sm:block rounded-lg border border-white/[0.06] p-2 text-[#F7F7F7]/30 hover:text-[#F7F7F7]/60 disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              {/* Mobile pagination */}
              <div className="mt-2 flex items-center justify-between sm:hidden">
                <button
                  onClick={() =>
                    setDateScrollStart(Math.max(0, dateScrollStart - 4))
                  }
                  disabled={dateScrollStart === 0}
                  className="flex items-center gap-1 text-[11px] text-[#F7F7F7]/30 disabled:opacity-20 disabled:cursor-not-allowed"
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
                  className="flex items-center gap-1 text-[11px] text-[#F7F7F7]/30 disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Time Slot Selector */}
            <div>
              <h2 className="heading-3 text-sm text-[#F7F7F7]/60 uppercase tracking-wider">
                <Clock className="mr-2 inline h-3.5 w-3.5" />
                Select Time
              </h2>
              <p className="mt-1 text-[11px] text-[#F7F7F7]/25">
                Select one or more consecutive hours. Peak hours are highlighted.
              </p>
              <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
                {timeSlots.map((slot) => {
                  const isSelected = selectedSlots.includes(slot.time);
                  const price = getSlotPrice(slot.isPeak);
                  return (
                    <button
                      key={slot.time}
                      disabled={slot.isBooked}
                      onClick={() => toggleSlot(slot.time)}
                      className={`relative rounded-xl border py-3 text-center transition-all ${
                        slot.isBooked
                          ? "border-transparent bg-white/[0.02] text-[#F7F7F7]/10 cursor-not-allowed"
                          : isSelected
                            ? "border-[#E6FA50] bg-[#E6FA50]/15 text-[#E6FA50] shadow-[0_0_12px_rgba(230,250,80,0.1)]"
                            : slot.isPeak
                              ? "border-[#E6FA50]/15 bg-[#E6FA50]/[0.03] text-[#F7F7F7]/50 hover:border-[#E6FA50]/30"
                              : "border-white/[0.06] bg-[#0C1B26] text-[#F7F7F7]/50 hover:border-white/[0.15]"
                      }`}
                    >
                      <span className="text-xs font-medium">{slot.time}</span>
                      <span
                        className={`mt-0.5 block text-[9px] ${
                          isSelected
                            ? "text-[#E6FA50]/70"
                            : slot.isBooked
                              ? "text-[#F7F7F7]/10"
                              : "text-[#F7F7F7]/25"
                        }`}
                      >
                        {slot.isBooked
                          ? "Booked"
                          : `${(price / 1000).toFixed(0)}K`}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-sm border border-white/[0.06] bg-[#0C1B26]" />
                  <span className="text-[10px] text-[#F7F7F7]/30">
                    Off-Peak
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-sm border border-[#E6FA50]/15 bg-[#E6FA50]/[0.03]" />
                  <span className="text-[10px] text-[#F7F7F7]/30">Peak</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-sm bg-white/[0.02]" />
                  <span className="text-[10px] text-[#F7F7F7]/30">Booked</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-sm border border-[#E6FA50] bg-[#E6FA50]/15" />
                  <span className="text-[10px] text-[#F7F7F7]/30">
                    Selected
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Booking Summary */}
          <div className="lg:relative">
            <div className="lg:sticky lg:top-28">
              <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
                <h3 className="heading-3 text-sm text-[#F7F7F7]/60 uppercase tracking-wider">
                  Booking Summary
                </h3>

                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#F7F7F7]/40">Venue</span>
                    <span className="text-sm font-medium text-[#F7F7F7]/80">
                      {venue.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#F7F7F7]/40">Court</span>
                    <span className="text-sm font-medium text-[#F7F7F7]/80">
                      {selectedCourt.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#F7F7F7]/40">Date</span>
                    <span className="text-sm font-medium text-[#F7F7F7]/80">
                      {selectedDate.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#F7F7F7]/40">Time</span>
                    <span className="text-sm font-medium text-[#F7F7F7]/80">
                      {selectedSlots.length > 0
                        ? `${startTime} – ${endTime}`
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
                    <span className="text-sm font-medium text-[#F7F7F7]/70">
                      Total
                    </span>
                    <span className="price text-xl text-[#F7F7F7]">
                      {totalPrice > 0
                        ? `Rp ${(totalPrice * 1.05).toLocaleString("id-ID")}`
                        : "—"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleConfirm}
                  disabled={selectedSlots.length === 0}
                  className="btn-lime mt-6 flex h-12 w-full items-center justify-center rounded-full text-[11px] font-semibold uppercase tracking-[0.08em] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Continue to Invite & Pay
                </button>

                <div className="mt-4 flex items-start gap-2 rounded-lg bg-white/[0.02] p-3">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#F7F7F7]/20" />
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
