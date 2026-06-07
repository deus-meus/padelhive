"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
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
  RotateCcw,
} from "lucide-react";
import { ApiRequestError, cancelBooking, getUserBookings, getMyRefunds, createRefund, ApiBooking, ApiRefund } from "@/lib/api";
import { padelImg } from "@/lib/images";

const IMG = {
  venue1: padelImg(600),
  venue2: padelImg(600),
  venue3: padelImg(600),
};

const TABS = ["upcoming", "past", "cancelled", "refunds"] as const;
type TabKey = typeof TABS[number];

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("upcoming");
  const [toast, setToast] = useState<string | null>(null);
  const [cancelledIds, setCancelledIds] = useState<string[]>([]);
  const router = useRouter();
  const [bookingToCancel, setBookingToCancel] = useState<ApiBooking | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [bookingToRefund, setBookingToRefund] = useState<ApiBooking | null>(null);
  const [refundReason, setRefundReason] = useState("");

  const { data: bookings = [], isLoading, isError, error: queryError } = useQuery({
    queryKey: queryKeys.bookings.user(activeTab === "refunds" ? "cancelled" : activeTab),
    queryFn: () => activeTab === "refunds" ? getUserBookings("cancelled") : getUserBookings(activeTab),
  });

  const { data: myRefunds = [] } = useQuery({
    queryKey: queryKeys.refunds.me,
    queryFn: getMyRefunds,
  });

  const error = isError
    ? queryError instanceof ApiRequestError
      ? queryError.message || "Failed to load bookings"
      : "Failed to load bookings"
    : null;

  const visibleBookings = bookings.map((booking) =>
    cancelledIds.includes(booking.id)
      ? {
          ...booking,
          status: "CANCELLED",
        }
      : booking
  );

  const upcoming = visibleBookings.filter((b) => b.status === "CONFIRMED" || b.status === "PENDING_PAYMENT");
  const past = visibleBookings.filter((b) => b.status === "COMPLETED");
  const cancelled = visibleBookings.filter((b) => b.status === "CANCELLED");

  const tabData: Record<"upcoming" | "past" | "cancelled", ApiBooking[]> = { upcoming, past, cancelled };

  const nextBooking = upcoming[0];
  const nextVenue = nextBooking?.venue;
  const nextCourt = nextBooking?.court;

  const totalBookings = visibleBookings.length;
  const hoursPlayed = visibleBookings.filter((b) => b.status === "COMPLETED").reduce((sum, b) => sum + b.durationMinutes, 0);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function getRefundNote(booking: ApiBooking): string {
    if (booking.isRefundEligible) {
      return booking.refundPolicyReason ?? "Full refund eligible. A pending refund request will be created after cancellation.";
    }
    return booking.refundPolicyReason ?? "This booking is not eligible for a refund.";
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

  function handleCancel(booking: ApiBooking) {
    setBookingToCancel(booking);
  }

  const queryClient = useQueryClient();

  const cancelMutation = useMutation({
    mutationFn: cancelBooking,
    onSuccess: (result, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.user(activeTab) });
      setCancelledIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
      setBookingToCancel(null);
      showToast(getSuccessMessage(result));
    },
    onError: (error) => {
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
    },
    onSettled: () => {
      setIsCancelling(false);
    }
  });

  async function confirmCancel() {
    if (!bookingToCancel || isCancelling) return;
    setIsCancelling(true);
    cancelMutation.mutate(bookingToCancel.id);
  }

  const refundMutation = useMutation({
    mutationFn: (reason: string) => createRefund({ bookingId: bookingToRefund!.id, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.refunds.me });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.user(activeTab === "refunds" ? "cancelled" : activeTab) });
      setBookingToRefund(null);
      setRefundReason("");
      showToast("Refund request submitted successfully.");
    },
    onError: (error) => {
      if (error instanceof ApiRequestError) {
        showToast(error.message || "Failed to submit refund request.");
      } else {
        showToast("Failed to submit refund request.");
      }
    },
  });

  function confirmRefund() {
    if (!bookingToRefund || refundMutation.isPending || !refundReason.trim()) return;
    refundMutation.mutate(refundReason.trim());
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-28">
        <section className="container pb-8">
          <h1 className="heading-1 text-3xl text-[#F7F7F7] md:text-4xl">
            <span className="text-[#E6FA50]">Bookings</span>
          </h1>
          <p className="mt-2 text-sm font-light text-[#F7F7F7]/40">
            Manage your upcoming matches and booking history.
          </p>
        </section>
        <div className="container py-16 text-center">
          <p className="text-sm text-[#F7F7F7]/25">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-28">
        <section className="container pb-8">
          <h1 className="heading-1 text-3xl text-[#F7F7F7] md:text-4xl">
            <span className="text-[#E6FA50]">Bookings</span>
          </h1>
          <p className="mt-2 text-sm font-light text-[#F7F7F7]/40">
            Manage your upcoming matches and booking history.
          </p>
        </section>
        <div className="container py-16 text-center">
          <p className="text-sm text-red-400/80">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-full bg-red-500/15 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-red-300 transition-colors hover:bg-red-500/25"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28">
      {/* Header */}
      <section className="container pb-8">
        <h1 className="heading-1 text-3xl text-[#F7F7F7] md:text-4xl">
          <span className="text-[#E6FA50]">Bookings</span>
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
                {nextVenue.city}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <DetailChip icon={CalendarDays} label="Date" value={nextBooking.bookingDate} />
                <DetailChip icon={Clock} label="Time" value={`${nextBooking.startsAt} – ${nextBooking.endsAt}`} />
                <DetailChip icon={MapPin} label="Court" value={`${nextCourt.name} · ${nextCourt.type}`} />
                <DetailChip icon={Timer} label="Price" value={`Rp ${(nextBooking.finalAmount / 1000).toFixed(0)}K`} />
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/bookings/${nextBooking.id}`}
                  className="btn-lime inline-flex h-10 items-center gap-2 rounded-full px-6 text-[11px] font-semibold uppercase tracking-[0.08em]"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View Details
                </Link>
                <button
                  onClick={() => handleShare(nextBooking.id)}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 px-6 text-[11px] font-medium uppercase tracking-[0.08em] text-[#F7F7F7]/60 transition-colors hover:border-white/20 hover:text-[#F7F7F7] focus:outline-none focus:ring-2 focus:ring-[#E6FA50]/40"
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
        <div className="flex gap-1 border-b border-white/[0.06] mb-8 overflow-x-auto">
          {TABS.map((tab) => {
            const count = tab === "refunds" ? myRefunds.length : tabData[tab as "upcoming" | "past" | "cancelled"].length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-5 py-3 text-[11px] font-medium uppercase tracking-[0.1em] transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? "text-[#E6FA50]"
                    : "text-[#F7F7F7]/25 hover:text-[#F7F7F7]/60"
                }`}
              >
                {tab} ({count})
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E6FA50]" />
                )}
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          {activeTab === "refunds" ? (
            myRefunds.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm text-[#F7F7F7]/25">No refund requests.</p>
              </div>
            ) : (
              myRefunds.map((refund) => (
                <div key={refund.id} className="rounded-xl border border-white/[0.06] bg-[#0C1B26] p-5">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-[#F7F7F7]">{refund.booking?.venue?.name || refund.bookingId}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] ${
                          refund.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' :
                          refund.status === 'APPROVED' ? 'bg-[#E6FA50]/10 text-[#E6FA50]' :
                          refund.status === 'REJECTED' ? 'bg-red-500/10 text-red-400' :
                          'bg-[#50C8C8]/10 text-[#50C8C8]'
                        }`}>
                          {refund.status}
                        </span>
                      </div>
                      <p className="caption text-[#F7F7F7]/40 mt-2 italic">&ldquo;{refund.reason}&rdquo;</p>
                      <p className="caption text-[#F7F7F7]/25 mt-2">Requested: {new Date(refund.createdAt).toLocaleDateString()}</p>
                    </div>
                    <p className="price text-base text-[#F7F7F7]">Rp {(Number(refund.amount) / 1000).toFixed(0)}K</p>
                  </div>
                </div>
              ))
            )
          ) : (
            tabData[activeTab].length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm text-[#F7F7F7]/25">No {activeTab} bookings.</p>
              </div>
            ) : (
              tabData[activeTab].map((booking, i) => (
                <BookingRow
                  key={booking.id}
                  booking={booking}
                  index={i}
                  muted={activeTab !== "upcoming"}
                  onCancel={() => handleCancel(booking)}
                  onRequestRefund={() => setBookingToRefund(booking)}
                  myRefunds={myRefunds}
                />
              ))
            )
          )}
        </div>
      </section>

      {bookingToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0C1B26] p-6 shadow-2xl">
            <p className="section-label">Cancel Booking</p>
            <h2 className="heading-2 mt-3 text-xl text-[#F7F7F7]">Cancel this booking?</h2>
            <p className="mt-2 text-sm leading-6 text-[#F7F7F7]/40">
              This will cancel your booking and release the court time.
            </p>
            <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
              <p className="text-sm font-medium text-[#F7F7F7]/60">Refund eligibility</p>
              <p className="mt-1 text-xs leading-5 text-[#F7F7F7]/40">{getRefundNote(bookingToCancel)}</p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setBookingToCancel(null)}
                disabled={isCancelling}
                className="rounded-full border border-white/[0.08] px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.08em] text-[#F7F7F7]/60 transition-colors hover:border-white/[0.15] hover:text-[#F7F7F7]/80 disabled:opacity-40"
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

      {bookingToRefund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0C1B26] p-6 shadow-2xl">
            <p className="section-label">Request Refund</p>
            <h2 className="heading-2 mt-3 text-xl text-[#F7F7F7]">Why are you requesting a refund?</h2>
            <div className="mt-4 rounded-xl border border-white/[0.06] bg-[#50C8C8]/5 p-4">
              <p className="text-sm font-medium text-[#50C8C8]">Eligible Amount: Rp {(Number(bookingToRefund.refundAmount ?? 0) / 1000).toFixed(0)}K</p>
              <p className="mt-1 text-xs leading-5 text-[#50C8C8]/70">{bookingToRefund.refundPolicyReason}</p>
            </div>
            <div className="mt-4">
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Please describe why you are requesting a refund..."
                className="w-full h-24 resize-none rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-sm text-[#F7F7F7] placeholder:text-[#F7F7F7]/25 focus:border-[#E6FA50]/30 focus:outline-none"
                disabled={refundMutation.isPending}
              />
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => { setBookingToRefund(null); setRefundReason(""); }}
                disabled={refundMutation.isPending}
                className="rounded-full border border-white/[0.08] px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.08em] text-[#F7F7F7]/60 transition-colors hover:border-white/[0.15] hover:text-[#F7F7F7]/80 disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={confirmRefund}
                disabled={refundMutation.isPending || !refundReason.trim()}
                className="btn-lime rounded-full px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] disabled:opacity-40"
              >
                {refundMutation.isPending ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-white/[0.06] bg-[#0C1B26] px-5 py-3 shadow-2xl">
          <p className="caption text-[#F7F7F7]/60">{toast}</p>
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
      <p className="caption mt-0.5 text-[#F7F7F7]/25">{label}</p>
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
      <p className="caption mt-1 text-[#F7F7F7]/25">{label}</p>
    </div>
  );
}

function BookingRow({
  booking,
  index,
  muted = false,
  onCancel,
  onRequestRefund,
  myRefunds = [],
}: {
  booking: ApiBooking;
  index: number;
  muted?: boolean;
  onCancel: () => void;
  onRequestRefund: () => void;
  myRefunds?: ApiRefund[];
}) {
  const court = booking.court;
  const venue = booking.venue;
  const images = [IMG.venue1, IMG.venue2, IMG.venue3];
  const existingRefund = myRefunds.find(r => r.bookingId === booking.id);

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
        </div>
        <p className={`mt-1 flex flex-wrap items-center gap-3 caption ${muted ? "text-[#F7F7F7]/25" : "text-[#F7F7F7]/40"}`}>
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{court?.name}</span>
          <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{booking.bookingDate}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{booking.startsAt}–{booking.endsAt}</span>
        </p>
      </div>

      <div className="flex items-center gap-2 sm:shrink-0">
        <p className={`price text-base ${muted ? "text-[#F7F7F7]/25" : "text-[#F7F7F7]"}`}>
          Rp {(booking.finalAmount / 1000).toFixed(0)}K
        </p>
        <div className="flex gap-1.5">
          <Link
            href={`/bookings/${booking.id}`}
            aria-label={`View details for ${venue?.name ?? "booking"}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-[#F7F7F7]/40 transition-colors hover:bg-white/[0.08] hover:text-[#F7F7F7]/60 focus:outline-none focus:ring-2 focus:ring-[#E6FA50]/40"
            title="View Details"
          >
            <Eye className="h-3.5 w-3.5" />
          </Link>
          {booking.status === "CONFIRMED" && (
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
          {booking.isRefundEligible && !existingRefund && (
            <button
              onClick={onRequestRefund}
              aria-label={`Request refund for booking at ${venue?.name ?? "venue"}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 transition-colors hover:bg-amber-500/20 focus:outline-none focus:ring-2 focus:ring-[#E6FA50]/40"
              title="Request Refund"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
          {existingRefund && (
            <span className={`flex h-8 items-center justify-center rounded-lg px-2 text-[10px] font-medium uppercase tracking-[0.1em] ${
                existingRefund.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' :
                existingRefund.status === 'REJECTED' ? 'bg-red-500/10 text-red-400' :
                existingRefund.status === 'PROCESSED' ? 'bg-blue-500/10 text-blue-400' :
                'bg-[#E6FA50]/10 text-[#E6FA50]'
              }`} title={`Refund ${existingRefund.status}`}>
              {existingRefund.status}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    CONFIRMED: "bg-[#E6FA50]/10 text-[#E6FA50]",
    PENDING_PAYMENT: "bg-[#50C8C8]/10 text-[#50C8C8]",
    COMPLETED: "bg-white/[0.04] text-[#F7F7F7]/25",
    CANCELLED: "bg-red-500/10 text-red-400/70",
    EXPIRED: "bg-white/[0.04] text-[#F7F7F7]/25",
  };
  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] ${styles[status] ?? "bg-white/5 text-[#F7F7F7]/25"}`}>
      {status}
    </span>
  );
}
