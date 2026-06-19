"use client";

import Image from "next/image";
import { formatBookingDate, formatBookingTimeRange, formatShortDate } from "@/lib/format";
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
  AlertTriangle,
} from "lucide-react";
import { ApiRequestError, cancelBooking, getUserBookings, getMyRefunds, createRefund, ApiBooking, ApiRefund, getMyDisputes, createPlayerDispute, type ApiDispute, type DisputeIssueType, type DisputePriority } from "@/lib/api";
import { getUserFacingErrorMessage } from "@/lib/errors";
import { ErrorBanner, EmptyState } from "@/components/ui/error-state";
import { padelImg } from "@/lib/images";

const IMG = {
  venue1: padelImg(600),
  venue2: padelImg(600),
  venue3: padelImg(600),
};

const TABS = ["upcoming", "past", "cancelled", "refunds", "disputes"] as const;
type TabKey = typeof TABS[number];

const DISPUTE_ISSUE_LABELS: Record<DisputeIssueType, string> = {
  COURT_UNAVAILABLE: "Court Unavailable",
  FACILITY_MISMATCH: "Facility Mismatch",
  PAYMENT_ISSUE: "Payment Issue",
  SAFETY_CONCERN: "Safety Concern",
  STAFF_BEHAVIOR: "Staff Behavior",
};
const DISPUTE_STATUS_STYLES: Record<ApiDispute["status"], string> = {
  OPEN: "bg-red-500/10 text-red-400",
  INVESTIGATING: "bg-[#50C8C8]/10 text-[#50C8C8]",
  RESOLVED: "bg-[#E6FA50]/10 text-[#E6FA50]",
  CLOSED: "bg-[#F7F7F7]/5 text-[#F7F7F7]/25",
};

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("upcoming");
  const [toast, setToast] = useState<string | null>(null);
  const [cancelledIds, setCancelledIds] = useState<string[]>([]);
  const router = useRouter();
  const [bookingToCancel, setBookingToCancel] = useState<ApiBooking | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [bookingToRefund, setBookingToRefund] = useState<ApiBooking | null>(null);
  const [refundReason, setRefundReason] = useState("");

  const { data: bookings = [], isLoading, isError, error: queryError, refetch, isFetching } = useQuery({
    queryKey: queryKeys.bookings.user(activeTab === "refunds" ? "cancelled" : activeTab),
    queryFn: () => activeTab === "refunds" || activeTab === "disputes" ? getUserBookings("cancelled") : getUserBookings(activeTab as "upcoming" | "past" | "cancelled"),
    enabled: activeTab !== "refunds" && activeTab !== "disputes",
  });

  const { data: myRefunds = [] } = useQuery({
    queryKey: queryKeys.refunds.me,
    queryFn: getMyRefunds,
  });

  const { data: myDisputes = [] } = useQuery({
    queryKey: queryKeys.disputes.me,
    queryFn: getMyDisputes,
  });

  const [bookingToDispute, setBookingToDispute] = useState<ApiBooking | null>(null);
  const [disputeIssueType, setDisputeIssueType] = useState<DisputeIssueType>("COURT_UNAVAILABLE");
  const [disputeDescription, setDisputeDescription] = useState("");
  const [disputePriority, setDisputePriority] = useState<DisputePriority>("MEDIUM");


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
          showToast(getUserFacingErrorMessage(error) || "This booking cannot be cancelled.");
        } else {
          showToast(getUserFacingErrorMessage(error));
        }
      } else {
        showToast(getUserFacingErrorMessage(error));
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
      if (error instanceof ApiRequestError && error.status === 400) {
        showToast(getUserFacingErrorMessage(error) || "Failed to submit refund request.");
      } else {
        showToast(getUserFacingErrorMessage(error));
      }
    },
  });

  function confirmRefund() {
    if (!bookingToRefund || refundMutation.isPending || !refundReason.trim()) return;
    refundMutation.mutate(refundReason.trim());
  }

  const disputeMutation = useMutation({
    mutationFn: (input: { issueType: DisputeIssueType; description: string; priority: DisputePriority }) =>
      createPlayerDispute({ bookingId: bookingToDispute!.id, ...input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.disputes.me });
      setBookingToDispute(null);
      setDisputeDescription("");
      setDisputeIssueType("COURT_UNAVAILABLE");
      setDisputePriority("MEDIUM");
      showToast("Dispute submitted successfully.");
    },
    onError: (error) => showToast(getUserFacingErrorMessage(error)),
  });

  function confirmDispute() {
    if (!bookingToDispute || disputeMutation.isPending || !disputeDescription.trim()) return;
    disputeMutation.mutate({ issueType: disputeIssueType, description: disputeDescription.trim(), priority: disputePriority });
  }

  if (isLoading && activeTab !== "refunds" && activeTab !== "disputes") {
    return (
      <div className="min-h-screen pt-28">
        <section className="container pb-8">
          <h1 className="heading-1 text-[#F7F7F7]">
            <span className="text-[#E6FA50]">Bookings</span>
          </h1>
          <p className="body-lg mt-2 text-[#F7F7F7]/40">
            Manage your upcoming matches and booking history.
          </p>
        </section>
        <section className="container pb-10">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-[120px] animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]" />
            ))}
          </div>
        </section>
        <section className="container pb-section-sm">
          <div className="flex gap-1 border-b border-white/[0.06] mb-8 overflow-x-auto">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-9 w-24 animate-pulse rounded-full bg-white/[0.04]" />
            ))}
          </div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 w-full animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]" />
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen pt-28">
        <section className="container pb-8">
          <h1 className="heading-1 text-[#F7F7F7]">
            <span className="text-[#E6FA50]">Bookings</span>
          </h1>
          <p className="body-lg mt-2 text-[#F7F7F7]/40">
            Manage your upcoming matches and booking history.
          </p>
        </section>
        <section className="container pb-section-sm">
          <ErrorBanner
            title="Couldn't load bookings"
            error={queryError}
            onRetry={() => refetch()}
            isRetrying={isFetching}
          />
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28">
      {/* Header */}
      <section className="container pb-8">
        <h1 className="heading-1 text-[#F7F7F7]">
          <span className="text-[#E6FA50]">Bookings</span>
        </h1>
        <p className="body-lg mt-2 text-[#F7F7F7]/40">
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
                <span className="caption inline-block rounded-full bg-[#E6FA50]/10 px-3 py-1 text-[#E6FA50]">
                  {nextBooking.status}
                </span>
                <span className="caption text-[#F7F7F7]/25">{formatBookingDate(nextBooking.bookingDate)}</span>
              </div>

              <h2 className="heading-1 mt-4 text-[#F7F7F7]">
                {nextVenue.name}
              </h2>

              <p className="body mt-2 flex items-center gap-2 text-[#F7F7F7]/40">
                <MapPin className="h-3.5 w-3.5" />
                {nextVenue.city}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <DetailChip icon={CalendarDays} label="Date" value={formatBookingDate(nextBooking.bookingDate)} />
                <DetailChip icon={Clock} label="Time" value={formatBookingTimeRange(nextBooking.startsAt, nextBooking.endsAt)} />
                <DetailChip icon={MapPin} label="Court" value={`${nextCourt.name} · ${nextCourt.type}`} />
                <DetailChip icon={Timer} label="Price" value={`Rp ${(nextBooking.finalAmount / 1000).toFixed(0)}K`} />
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/bookings/${nextBooking.id}`}
                  className="label btn-lime inline-flex h-10 items-center gap-2 rounded-full px-6"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View Details
                </Link>
                <button
                  onClick={() => handleShare(nextBooking.id)}
                  className="label inline-flex h-10 items-center gap-2 rounded-full border border-white/10 px-6 text-[#F7F7F7]/60 transition-colors hover:border-white/20 hover:text-[#F7F7F7] focus:outline-none focus:ring-2 focus:ring-[#E6FA50]/40"
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
            const count = tab === "refunds" ? myRefunds.length : tab === "disputes" ? myDisputes.length : tabData[tab as "upcoming" | "past" | "cancelled"].length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`label relative px-5 py-3 transition-colors whitespace-nowrap ${
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
              <EmptyState
                icon={RotateCcw}
                title="No refund requests"
                description="Refund requests you submit will appear here."
              />
            ) : (
              myRefunds.map((refund) => (
                <div key={refund.id} className="rounded-xl border border-white/[0.06] bg-[#0C1B26] p-5">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="body text-[#F7F7F7]">{refund.booking?.venue?.name || refund.bookingId}</span>
                        <span className={`caption rounded-full px-2 py-0.5 ${
                          refund.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' :
                          refund.status === 'APPROVED' ? 'bg-[#E6FA50]/10 text-[#E6FA50]' :
                          refund.status === 'REJECTED' ? 'bg-red-500/10 text-red-400' :
                          'bg-[#50C8C8]/10 text-[#50C8C8]'
                        }`}>
                          {refund.status}
                        </span>
                      </div>
                      <p className="caption text-[#F7F7F7]/40 mt-2 italic">&ldquo;{refund.reason}&rdquo;</p>
                      <p className="caption text-[#F7F7F7]/25 mt-2">Requested: {formatShortDate(refund.createdAt)}</p>
                    </div>
                    <p className="price text-base text-[#F7F7F7]">Rp {(Number(refund.amount) / 1000).toFixed(0)}K</p>
                  </div>
                </div>
              ))
            )
          ) : activeTab === "disputes" ? (
            myDisputes.length === 0 ? (
              <EmptyState icon={AlertTriangle} title="No disputes" description="Issues you report will appear here." />
            ) : (
              myDisputes.map((dispute) => (
                <div key={dispute.id} className="rounded-xl border border-white/[0.06] bg-[#0C1B26] p-5">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="body text-[#F7F7F7]">{dispute.venue.name}</span>
                        <span className={`caption rounded-full px-2 py-0.5 ${DISPUTE_STATUS_STYLES[dispute.status]}`}>{dispute.status}</span>
                        <span className="caption rounded-full bg-white/[0.04] px-2 py-0.5 text-[#F7F7F7]/40">{DISPUTE_ISSUE_LABELS[dispute.issueType]}</span>
                      </div>
                      <p className="caption text-[#F7F7F7]/40 mt-2 italic">&ldquo;{dispute.description}&rdquo;</p>
                      <p className="caption text-[#F7F7F7]/25 mt-2">Reported: {formatShortDate(dispute.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))
            )
          ) : (
            tabData[activeTab].length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title={`No ${activeTab} bookings`}
                description="When you book a court it'll show up here."
                actionLabel="Browse venues"
                actionHref="/venues"
              />
            ) : (
              tabData[activeTab].map((booking, i) => (
                <BookingRow
                  key={booking.id}
                  booking={booking}
                  index={i}
                  muted={activeTab !== "upcoming"}
                  onCancel={() => handleCancel(booking)}
                  onRequestRefund={() => setBookingToRefund(booking)}
                  onReportIssue={() => setBookingToDispute(booking)}
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
            <h2 className="heading-2 mt-3 text-[#F7F7F7]">Cancel this booking?</h2>
            <p className="body mt-2 text-[#F7F7F7]/40">
              This will cancel your booking and release the court time.
            </p>
            <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
              <p className="body text-[#F7F7F7]/60">Refund eligibility</p>
              <p className="body-sm mt-1 text-[#F7F7F7]/40">{getRefundNote(bookingToCancel)}</p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setBookingToCancel(null)}
                disabled={isCancelling}
                className="label rounded-full border border-white/[0.08] px-5 py-2.5 text-[#F7F7F7]/60 transition-colors hover:border-white/[0.15] hover:text-[#F7F7F7]/80 disabled:opacity-40"
              >
                Keep Booking
              </button>
              <button
                onClick={confirmCancel}
                disabled={isCancelling}
                className="label rounded-full bg-red-500/15 px-5 py-2.5 text-red-300 transition-colors hover:bg-red-500/25 disabled:opacity-40"
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
            <h2 className="heading-2 mt-3 text-[#F7F7F7]">Why are you requesting a refund?</h2>
            <div className="mt-4 rounded-xl border border-white/[0.06] bg-[#50C8C8]/5 p-4">
              <p className="body text-[#50C8C8]">Eligible Amount: Rp {(Number(bookingToRefund.refundAmount ?? 0) / 1000).toFixed(0)}K</p>
              <p className="body-sm mt-1 text-[#50C8C8]/70">{bookingToRefund.refundPolicyReason}</p>
            </div>
            <div className="mt-4">
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Please describe why you are requesting a refund..."
                className="body w-full h-24 resize-none rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-[#F7F7F7] placeholder:text-[#F7F7F7]/25 focus:border-[#E6FA50]/30 focus:outline-none"
                disabled={refundMutation.isPending}
              />
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => { setBookingToRefund(null); setRefundReason(""); }}
                disabled={refundMutation.isPending}
                className="label rounded-full border border-white/[0.08] px-5 py-2.5 text-[#F7F7F7]/60 transition-colors hover:border-white/[0.15] hover:text-[#F7F7F7]/80 disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={confirmRefund}
                disabled={refundMutation.isPending || !refundReason.trim()}
                className="label btn-lime rounded-full px-5 py-2.5 disabled:opacity-40"
              >
                {refundMutation.isPending ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {bookingToDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0C1B26] p-6 shadow-2xl">
            <p className="section-label">Report an Issue</p>
            <h2 className="heading-2 mt-3 text-[#F7F7F7]">What went wrong?</h2>
            
            <div className="mt-4 space-y-4">
              <div>
                <label className="label block text-[#F7F7F7]/60 mb-1.5">Issue type</label>
                <select
                  value={disputeIssueType}
                  onChange={(e) => setDisputeIssueType(e.target.value as DisputeIssueType)}
                  className="body w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[#F7F7F7] focus:border-[#E6FA50]/30 focus:outline-none"
                  disabled={disputeMutation.isPending}
                >
                  {Object.entries(DISPUTE_ISSUE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label block text-[#F7F7F7]/60 mb-1.5">Priority</label>
                <select
                  value={disputePriority}
                  onChange={(e) => setDisputePriority(e.target.value as DisputePriority)}
                  className="body w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[#F7F7F7] focus:border-[#E6FA50]/30 focus:outline-none"
                  disabled={disputeMutation.isPending}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div>
                <label className="label block text-[#F7F7F7]/60 mb-1.5">Description</label>
                <textarea
                  value={disputeDescription}
                  onChange={(e) => setDisputeDescription(e.target.value)}
                  placeholder="Describe the issue you experienced..."
                  className="body w-full h-24 resize-none rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-[#F7F7F7] placeholder:text-[#F7F7F7]/25 focus:border-[#E6FA50]/30 focus:outline-none"
                  disabled={disputeMutation.isPending}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => { setBookingToDispute(null); setDisputeDescription(""); }}
                disabled={disputeMutation.isPending}
                className="label rounded-full border border-white/[0.08] px-5 py-2.5 text-[#F7F7F7]/60 transition-colors hover:border-white/[0.15] hover:text-[#F7F7F7]/80 disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={confirmDispute}
                disabled={disputeMutation.isPending || !disputeDescription.trim()}
                className="label btn-lime rounded-full px-5 py-2.5 disabled:opacity-40"
              >
                {disputeMutation.isPending ? "Submitting..." : "Submit Report"}
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
      <p className="heading-3 mt-1.5 text-[#F7F7F7]">{value}</p>
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
      <p className="metric mt-3 text-[#E6FA50]">{value}</p>
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
  onReportIssue,
  myRefunds = [],
}: {
  booking: ApiBooking;
  index: number;
  muted?: boolean;
  onCancel: () => void;
  onRequestRefund: () => void;
  onReportIssue: () => void;
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
          <h3 className={`heading-3 truncate ${muted ? "text-[#F7F7F7]/40" : "text-[#F7F7F7]"}`}>
            {venue?.name ?? "Unknown Venue"}
          </h3>
          <StatusPill status={booking.status} />
        </div>
        <p className={`mt-1 flex flex-wrap items-center gap-3 caption ${muted ? "text-[#F7F7F7]/25" : "text-[#F7F7F7]/40"}`}>
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{court?.name}</span>
          <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{formatBookingDate(booking.bookingDate)}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatBookingTimeRange(booking.startsAt, booking.endsAt)}</span>
        </p>
      </div>

      <div className="flex items-center gap-2 sm:shrink-0">
        <p className={`price ${muted ? "text-[#F7F7F7]/25" : "text-[#F7F7F7]"}`}>
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
            <span className={`caption flex h-8 items-center justify-center rounded-lg px-2 ${
                existingRefund.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' :
                existingRefund.status === 'REJECTED' ? 'bg-red-500/10 text-red-400' :
                existingRefund.status === 'PROCESSED' ? 'bg-blue-500/10 text-blue-400' :
                'bg-[#E6FA50]/10 text-[#E6FA50]'
              }`} title={`Refund ${existingRefund.status}`}>
              {existingRefund.status}
            </span>
          )}
          <button
            onClick={onReportIssue}
            aria-label={`Report an issue for booking at ${venue?.name ?? "venue"}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-[#F7F7F7]/40 transition-colors hover:bg-white/[0.08] hover:text-[#F7F7F7]/60 focus:outline-none focus:ring-2 focus:ring-[#E6FA50]/40"
            title="Report an issue"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
          </button>
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
    <span className={`caption shrink-0 rounded-full px-2 py-0.5 ${styles[status] ?? "bg-white/5 text-[#F7F7F7]/25"}`}>
      {status}
    </span>
  );
}
