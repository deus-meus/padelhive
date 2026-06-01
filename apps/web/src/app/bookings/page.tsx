"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  MapPin,
  Clock,
  Users,
  Share2,
  CalendarDays,
  Trophy,
  Timer,
  Eye,
  CreditCard,
  XCircle,
} from "lucide-react";
import { enhancedBookings, type EnhancedBooking } from "@/mock/enhanced-bookings";
import { mockVenues } from "@/mock/venues";
import { mockCourts } from "@/mock/courts";
import { PlayerAvatarStack } from "@/components/ui/player-avatar-stack";
import { ApiRequestError, cancelBooking } from "@/lib/api";
import { getIdToken } from "@/lib/auth-client";
import { padelImg } from "@/lib/images";

const IMG = {
  venue1: padelImg(600),
  venue2: padelImg(600),
  venue3: padelImg(600),
};

type TabKey = "upcoming" | "completed" | "cancelled";

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("upcoming");
  const [toast, setToast] = useState<string | null>(null);
  const [cancelledIds, setCancelledIds] = useState<string[]>([]);
  const router = useRouter();
  const [bookingToCancel, setBookingToCancel] = useState<EnhancedBooking | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const visibleBookings = enhancedBookings.map((booking) =>
    cancelledIds.includes(booking.id)
      ? {
          ...booking,
          status: "cancelled" as EnhancedBooking["status"],
          payment: { ...booking.payment, status: "refunded" as EnhancedBooking["payment"]["status"] },
        }
      : booking
  );

  const upcoming = visibleBookings.filter((b) => b.status === "confirmed" || b.status === "pending");
  const completed = visibleBookings.filter((b) => b.status === "completed");
  const cancelled = visibleBookings.filter((b) => b.status === "cancelled");

  const tabData: Record<TabKey, EnhancedBooking[]> = { upcoming, completed, cancelled };

  const nextBooking = upcoming[0];
  const nextVenue = nextBooking ? mockVenues.find((v) => v.id === nextBooking.venueId) : null;
  const nextCourt = nextBooking ? mockCourts.find((c) => c.id === nextBooking.courtId) : null;

  const totalBookings = visibleBookings.length;
  const hoursPlayed = visibleBookings.filter((b) => b.status === "completed").reduce((sum, b) => sum + b.duration, 0);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function getBookingStart(booking: EnhancedBooking): Date {
    return new Date(`${booking.bookingDate}T${booking.startTime}:00.000Z`);
  }

  function getRefundNote(booking: EnhancedBooking): string {
    const isEligible = getBookingStart(booking).getTime() - Date.now() >= 24 * 60 * 60 * 1000;
    if (isEligible && booking.payment.status === "paid") {
      return "Full refund eligible. A pending refund request will be created after cancellation.";
    }
    if (isEligible) {
      return "Full refund eligible, but no paid payment exists for this booking.";
    }
    return "Non-refundable: less than 24 hours before booking start.";
  }

  function getSuccessMessage(result: { isRefundEligible?: boolean; refundAmount?: number; refundPolicyReason?: string }): string {
    if (result.isRefundEligible && result.refundAmount && result.refundAmount > 0) {
      return `Booking cancelled. Pending refund: Rp ${result.refundAmount.toLocaleString("id-ID")}.`;
    }
    return `Booking cancelled. ${result.refundPolicyReason ?? "No refund record needed."}`;
  }

  async function handleShare(bookingId: string) {
    const shareUrl = `${window.location.origin}/booking/${bookingId}/invite`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast("Invite link copied to clipboard.");
    } catch {
      showToast(`Share this invite link: ${shareUrl}`);
    }
  }

  function handleCancel(booking: EnhancedBooking) {
    setBookingToCancel(booking);
  }

  async function confirmCancel() {
    if (!bookingToCancel || isCancelling) return;

    setIsCancelling(true);
    const authToken = await getIdToken();
    if (!authToken) {
      setIsCancelling(false);
      router.push(`/auth/login?next=${encodeURIComponent("/bookings")}`);
      return;
    }

    try {
      const result = await cancelBooking(bookingToCancel.id, authToken);
      setCancelledIds((prev) => (prev.includes(bookingToCancel.id) ? prev : [...prev, bookingToCancel.id]));
      setBookingToCancel(null);
      showToast(getSuccessMessage(result));
    } catch (error) {
      if (error instanceof ApiRequestError) {
        if (error.status === 404) {
          showToast("Booking was not found for this account.");
        } else if (error.status === 400) {
          showToast(error.message || "This booking cannot be cancelled.");
        } else {
          showToast("Could not cancel booking. Please try again.");
        }
      } else {
        showToast("Could not cancel booking. Please try again.");
      }
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <div className="min-h-screen pt-28">
      {/* Header */}
      <section className="container pb-8">
        <h1 className="heading-1 text-3xl text-[#F7F7F7] md:text-4xl">
          My <span className="text-[#E6FA50]">Bookings</span>
        </h1>
        <p className="mt-2 text-sm font-light text-[#F7F7F7]/40">
          Manage your upcoming matches and booking history.
        </p>
      </section>

      {/* Next Match */}
      {nextBooking && nextVenue && nextCourt && (
        <section className="container pb-10">
          <span className="section-label">Your Next Match</span>
          <div className="mt-5 grid grid-cols-1 overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0C1B26] lg:grid-cols-[1.85fr_1fr]">
            <div className="flex flex-col justify-center p-7 md:p-9">
              <div className="flex items-center gap-3">
                <span className="inline-block rounded-full bg-[#E6FA50]/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-[#E6FA50]">
                  {nextBooking.status}
                </span>
                <span className="caption text-[#F7F7F7]/25">{nextBooking.bookingDate}</span>
              </div>

              <h2 className="heading-1 mt-4 text-2xl text-[#F7F7F7] md:text-3xl">
                {nextVenue.name}
              </h2>

              <p className="mt-2 flex items-center gap-2 text-sm text-[#F7F7F7]/40">
                <MapPin className="h-3.5 w-3.5" />
                {nextVenue.location} · {nextVenue.city}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <DetailChip icon={CalendarDays} label="Date" value={nextBooking.bookingDate} />
                <DetailChip icon={Clock} label="Time" value={`${nextBooking.startTime} – ${nextBooking.endTime}`} />
                <DetailChip icon={MapPin} label="Court" value={`${nextCourt.name} · ${nextCourt.type}`} />
                <DetailChip icon={Timer} label="Price" value={`Rp ${(nextBooking.finalAmount / 1000).toFixed(0)}K`} />
              </div>

              <div className="mt-5">
                <PlayerAvatarStack
                  players={nextBooking.participants.map((p) => ({ id: p.id, name: p.name, avatarUrl: p.avatarUrl }))}
                  totalSpots={4}
                  size={32}
                />
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/bookings/${nextBooking.id}`}
                  className="btn-lime inline-flex h-10 items-center gap-2 rounded-full px-6 text-[11px] font-semibold uppercase tracking-[0.08em]"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View Details
                </Link>
                <Link
                  href={`/booking/${nextBooking.id}/invite`}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 px-6 text-[11px] font-medium uppercase tracking-[0.08em] text-[#F7F7F7]/50 transition-colors hover:border-white/20 hover:text-[#F7F7F7]"
                >
                  <Users className="h-3.5 w-3.5" />
                  Invite Friends
                </Link>
                <button
                  onClick={() => handleShare(nextBooking.id)}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 px-6 text-[11px] font-medium uppercase tracking-[0.08em] text-[#F7F7F7]/50 transition-colors hover:border-white/20 hover:text-[#F7F7F7] focus:outline-none focus:ring-2 focus:ring-[#E6FA50]/40"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  Share
                </button>
              </div>
            </div>

            <div className="relative hidden overflow-hidden lg:block">
              <Image
                src={IMG.venue1}
                alt={nextVenue.name}
                fill
                sizes="(min-width: 1024px) 33vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>
      )}

      {/* Stats */}
      <section className="container pb-10">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard icon={CalendarDays} value={totalBookings.toString()} label="Total Bookings" />
          <StatCard icon={Timer} value={`${hoursPlayed / 60}h`} label="Hours Played" />
          <StatCard icon={Trophy} value="12" label="Matches Joined" />
          <StatCard icon={Users} value="8" label="Friends Invited" />
        </div>
      </section>

      {/* Tabs */}
      <section className="container pb-section-sm">
        <div className="flex gap-1 border-b border-white/[0.06] mb-8">
          {(["upcoming", "completed", "cancelled"] as TabKey[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-5 py-3 text-[11px] font-medium uppercase tracking-[0.1em] transition-colors ${
                activeTab === tab
                  ? "text-[#E6FA50]"
                  : "text-[#F7F7F7]/30 hover:text-[#F7F7F7]/60"
              }`}
            >
              {tab} ({tabData[tab].length})
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E6FA50]" />
              )}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {tabData[activeTab].length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-[#F7F7F7]/30">No {activeTab} bookings.</p>
            </div>
          ) : (
            tabData[activeTab].map((booking, i) => (
              <BookingRow
                key={booking.id}
                booking={booking}
                index={i}
                muted={activeTab !== "upcoming"}
                onCancel={() => handleCancel(booking)}
              />
            ))
          )}
        </div>
      </section>

      {bookingToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0C1B26] p-6 shadow-2xl">
            <p className="section-label">Cancel Booking</p>
            <h2 className="heading-2 mt-3 text-xl text-[#F7F7F7]">Cancel this booking?</h2>
            <p className="mt-2 text-sm leading-6 text-[#F7F7F7]/45">
              This will cancel your booking and release the court time.
            </p>
            <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
              <p className="text-sm font-medium text-[#F7F7F7]/70">Refund eligibility</p>
              <p className="mt-1 text-xs leading-5 text-[#F7F7F7]/40">{getRefundNote(bookingToCancel)}</p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setBookingToCancel(null)}
                disabled={isCancelling}
                className="rounded-full border border-white/[0.08] px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.08em] text-[#F7F7F7]/50 transition-colors hover:border-white/[0.15] hover:text-[#F7F7F7]/70 disabled:opacity-40"
              >
                Keep Booking
              </button>
              <button
                onClick={confirmCancel}
                disabled={isCancelling}
                className="rounded-full bg-red-500/15 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-red-300 transition-colors hover:bg-red-500/25 disabled:opacity-40"
              >
                {isCancelling ? "Cancelling..." : "Cancel Booking"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-white/[0.06] bg-[#0C1B26] px-5 py-3 shadow-2xl">
          <p className="caption text-[#F7F7F7]/70">{toast}</p>
        </div>
      )}
    </div>
  );
}

function DetailChip({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-white/[0.03] p-3">
      <Icon className="h-3.5 w-3.5 text-[#50C8C8]" />
      <p className="heading-3 mt-1.5 text-[13px] text-[#F7F7F7]">{value}</p>
      <p className="caption mt-0.5 text-[#F7F7F7]/20">{label}</p>
    </div>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5">
      <Icon className="h-4 w-4 text-[#50C8C8]" />
      <p className="metric mt-3 text-2xl text-[#E6FA50]">{value}</p>
      <p className="caption mt-1 text-[#F7F7F7]/30">{label}</p>
    </div>
  );
}

function BookingRow({
  booking,
  index,
  muted = false,
  onCancel,
}: {
  booking: EnhancedBooking;
  index: number;
  muted?: boolean;
  onCancel: () => void;
}) {
  const court = mockCourts.find((c) => c.id === booking.courtId);
  const venue = mockVenues.find((v) => v.id === booking.venueId);
  const images = [IMG.venue1, IMG.venue2, IMG.venue3];

  return (
    <div className={`flex flex-col gap-4 rounded-xl border p-4 transition-all duration-200 sm:flex-row sm:items-center ${
      muted
        ? "border-white/[0.03] bg-white/[0.01]"
        : "border-white/[0.06] bg-[#0C1B26]"
    }`}>
      <div className="relative hidden h-12 w-12 shrink-0 overflow-hidden rounded-lg sm:block">
        <Image
          src={images[index % images.length]}
          alt={venue?.name ?? "Venue image"}
          fill
          sizes="48px"
          className="object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className={`heading-3 truncate text-sm ${muted ? "text-[#F7F7F7]/40" : "text-[#F7F7F7]"}`}>
            {venue?.name ?? "Unknown Venue"}
          </h3>
          <StatusPill status={booking.status} />
          <PaymentPill status={booking.payment.status} />
        </div>
        <p className={`mt-1 flex flex-wrap items-center gap-3 caption ${muted ? "text-[#F7F7F7]/20" : "text-[#F7F7F7]/35"}`}>
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{court?.name}</span>
          <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{booking.bookingDate}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{booking.startTime}–{booking.endTime}</span>
        </p>
      </div>

      <div className="flex items-center gap-2 sm:shrink-0">
        <p className={`price text-base ${muted ? "text-[#F7F7F7]/20" : "text-[#F7F7F7]"}`}>
          Rp {(booking.finalAmount / 1000).toFixed(0)}K
        </p>
        <div className="flex gap-1.5">
          <Link
            href={`/bookings/${booking.id}`}
            aria-label={`View details for ${venue?.name ?? "booking"}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-[#F7F7F7]/40 transition-colors hover:bg-white/[0.08] hover:text-[#F7F7F7]/70 focus:outline-none focus:ring-2 focus:ring-[#E6FA50]/40"
            title="View Details"
          >
            <Eye className="h-3.5 w-3.5" />
          </Link>
          {booking.status === "confirmed" && (
            <>
              <Link
                href={`/booking/${booking.id}/invite`}
                aria-label={`Invite friends to ${venue?.name ?? "booking"}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E6FA50]/10 text-[#E6FA50] transition-colors hover:bg-[#E6FA50]/20 focus:outline-none focus:ring-2 focus:ring-[#E6FA50]/40"
                title="Invite Friends"
              >
                <Users className="h-3.5 w-3.5" />
              </Link>
              <Link
                href={`/bookings/${booking.id}#payment`}
                aria-label={`View payment for ${venue?.name ?? "booking"}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#50C8C8]/10 text-[#50C8C8] transition-colors hover:bg-[#50C8C8]/20 focus:outline-none focus:ring-2 focus:ring-[#E6FA50]/40"
                title="View Payment"
              >
                <CreditCard className="h-3.5 w-3.5" />
              </Link>
              <button
                onClick={onCancel}
                aria-label={`Cancel booking at ${venue?.name ?? "venue"}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-400 transition-colors hover:bg-red-500/20 focus:outline-none focus:ring-2 focus:ring-[#E6FA50]/40"
                title="Cancel Booking"
              >
                <XCircle className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    confirmed: "bg-[#E6FA50]/10 text-[#E6FA50]",
    pending: "bg-[#50C8C8]/10 text-[#50C8C8]",
    completed: "bg-white/[0.04] text-[#F7F7F7]/30",
    cancelled: "bg-red-500/10 text-red-400/70",
  };
  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] ${styles[status] ?? "bg-white/5 text-[#F7F7F7]/30"}`}>
      {status}
    </span>
  );
}

function PaymentPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: "bg-[#E6FA50]/5 text-[#E6FA50]/60",
    pending: "bg-amber-500/5 text-amber-400/60",
    failed: "bg-red-500/5 text-red-400/60",
    refunded: "bg-[#50C8C8]/5 text-[#50C8C8]/60",
  };
  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] ${styles[status] ?? ""}`}>
      {status}
    </span>
  );
}
