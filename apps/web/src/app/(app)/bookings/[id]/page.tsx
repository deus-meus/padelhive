"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatBookingDate, formatBookingTimeRange } from "@/lib/format";
import Image from "next/image";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Clock,
  CalendarDays,
  Timer,
  Users,
  CreditCard,
  Share2,
  XCircle,
  CheckCircle2,
  ShieldCheck,
  ShieldX,
  Ticket,
  ArrowLeft,
  Copy,
} from "lucide-react";
import { ApiRequestError, cancelBooking, getBookingById } from "@/lib/api";
import { queryKeys } from "@/lib/queries";
import { getUserFacingErrorMessage } from "@/lib/errors";
import { padelImg } from "@/lib/images";
import { ErrorState } from "@/components/ui/error-state";

export default function BookingDetailPage() {
  const params = useParams();
  const bookingId = params.id as string;
  const [toast, setToast] = useState<string | null>(null);
  const [isCancelled, setIsCancelled] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [refundMessage, setRefundMessage] = useState<string | null>(null);

  const { data: booking, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.bookings.detail(bookingId),
    queryFn: () => getBookingById(bookingId),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen pt-28 pb-16">
        <div className="container pb-8">
          <div className="h-8 w-48 animate-pulse rounded-md bg-white/[0.04]"></div>
          <div className="mt-4 h-4 w-32 animate-pulse rounded-md bg-white/[0.04]"></div>
        </div>
        <div className="container">
          <div className="h-64 animate-pulse rounded-2xl bg-white/[0.02]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    if (error instanceof ApiRequestError && error.status === 404) {
      return (
        <div className="min-h-screen pt-28">
          <div className="container py-16 text-center">
            <p className="text-sm text-[#F7F7F7]/25">Booking not found.</p>
            <Link href="/bookings" className="mt-4 inline-flex items-center gap-2 text-sm text-[#E6FA50] hover:underline">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to bookings
            </Link>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen pt-28">
        <ErrorState title="Failed to load booking" onRetry={refetch} />
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  const currentBooking = booking;
  const venue = booking.venue;
  const court = booking.court;

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function handleShareInvite() {
    const url = `${window.location.origin}/booking/${bookingId}/invite`;
    navigator.clipboard.writeText(url).then(() => {
      showToast("Invite link copied to clipboard");
    }).catch(() => {
      showToast(`Share this invite link: ${url}`);
    });
  }

  function getBookingStart(): Date {
    return new Date(currentBooking.startsAt);
  }

  function getRefundNote(): string {
    const isEligible = getBookingStart().getTime() - Date.now() >= 24 * 60 * 60 * 1000;
    if (isEligible && currentBooking.payment?.status === "PAID") {
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

  function handleCancel() {
    setShowCancelModal(true);
  }

  async function confirmCancel() {
    if (isCancelling) return;

    setIsCancelling(true);

    try {
      const result = await cancelBooking(bookingId);
      setIsCancelled(true);
      setShowCancelModal(false);
      const message = getSuccessMessage(result);
      setRefundMessage(message);
      showToast(message);
    } catch (error) {
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
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <div className="min-h-screen pt-28 pb-16">
      {/* Back nav */}
      <section className="container pb-6">
        <Link href="/bookings" className="inline-flex items-center gap-2 text-sm text-[#F7F7F7]/25 transition-colors hover:text-[#F7F7F7]/60">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to bookings
        </Link>
      </section>

      {/* Header */}
      <section className="container pb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <StatusBadge status={isCancelled ? "cancelled" : currentBooking.status.toLowerCase()} />
              {currentBooking.payment && <PaymentBadge status={isCancelled ? "refunded" : currentBooking.payment.status.toLowerCase()} />}
            </div>
            <h1 className="heading-1 text-2xl text-[#F7F7F7] md:text-3xl">
              {venue?.name ?? "Unknown Venue"}
            </h1>
            <p className="mt-1 flex items-center gap-2 text-sm text-[#F7F7F7]/40">
              <MapPin className="h-3.5 w-3.5" />
              {venue?.city}
            </p>
          </div>
          <div className="relative hidden h-20 w-32 overflow-hidden rounded-xl sm:block">
            <Image
              src={padelImg(400)}
              alt={venue?.name ?? "Venue image"}
              fill
              sizes="128px"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="container">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Details */}
            <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
              <p className="section-label mb-4">Booking Information</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-white/[0.02] p-3">
                  <Ticket className="h-3.5 w-3.5 text-[#50C8C8]" />
                  <p className="heading-3 mt-1.5 text-[13px] text-[#F7F7F7] break-all">{`#${currentBooking.id.slice(-6).toUpperCase()}`}</p>
                  <p className="caption mt-0.5 text-[#F7F7F7]/25">Booking ID</p>
                </div>
                <div className="rounded-xl bg-white/[0.02] p-3">
                  <MapPin className="h-3.5 w-3.5 text-[#50C8C8]" />
                  <p className="heading-3 mt-1.5 text-[13px] text-[#F7F7F7] break-all">{`${court?.name ?? "—"} · ${court?.type ?? ""}`}</p>
                  <p className="caption mt-0.5 text-[#F7F7F7]/25">Court</p>
                </div>
                <div className="rounded-xl bg-white/[0.02] p-3">
                  <CalendarDays className="h-3.5 w-3.5 text-[#50C8C8]" />
                  <p className="heading-3 mt-1.5 text-[13px] text-[#F7F7F7] break-all">{formatBookingDate(currentBooking.bookingDate)}</p>
                  <p className="caption mt-0.5 text-[#F7F7F7]/25">Date</p>
                </div>
                <div className="rounded-xl bg-white/[0.02] p-3">
                  <Clock className="h-3.5 w-3.5 text-[#50C8C8]" />
                  <p className="heading-3 mt-1.5 text-[13px] text-[#F7F7F7] break-all">{formatBookingTimeRange(currentBooking.startsAt, currentBooking.endsAt)}</p>
                  <p className="caption mt-0.5 text-[#F7F7F7]/25">Time</p>
                </div>
                <div className="rounded-xl bg-white/[0.02] p-3">
                  <Timer className="h-3.5 w-3.5 text-[#50C8C8]" />
                  <p className="heading-3 mt-1.5 text-[13px] text-[#F7F7F7] break-all">{`${currentBooking.durationMinutes} min`}</p>
                  <p className="caption mt-0.5 text-[#F7F7F7]/25">Duration</p>
                </div>
              </div>
            </div>

            {/* Refund Policy */}
            <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
              <p className="section-label mb-4">Refund Policy</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-white/[0.02] p-4">
                  <ShieldCheck className="h-4 w-4 text-[#E6FA50]" />
                  <p className="heading-3 mt-1.5 text-[13px] text-[#F7F7F7]">Full refund before H-1</p>
                  <p className="caption mt-1 text-[#F7F7F7]/25">Cancel 24+ hours before your booking date — the full amount is returned to your original payment method.</p>
                </div>
                <div className="rounded-xl bg-white/[0.02] p-4">
                  <ShieldX className="h-4 w-4 text-red-400" />
                  <p className="heading-3 mt-1.5 text-[13px] text-[#F7F7F7]">Non-refundable after H-1</p>
                  <p className="caption mt-1 text-[#F7F7F7]/25">Cancelling less than 24 hours before the start time isn&apos;t eligible for a refund.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Summary sidebar (sticky) */}
          <div className="space-y-6 lg:sticky lg:top-24">
            {/* Payment */}
            <div id="payment" className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
              <p className="section-label mb-4">Payment</p>
              <div className="space-y-3 mb-4">
                <PaymentRow label="Court fee" value={`Rp ${(currentBooking.courtAmount / 1000).toFixed(0)}K`} />
                {currentBooking.voucherDiscount > 0 && (
                  <PaymentRow
                    label="Voucher"
                    value={`-Rp ${(currentBooking.voucherDiscount / 1000).toFixed(0)}K`}
                    highlight
                  />
                )}
                <PaymentRow label="Platform fee" value={`Rp ${(currentBooking.platformFee / 1000).toFixed(0)}K`} />
                <div className="flex items-center justify-between border-t border-white/[0.04] pt-3">
                  <span className="text-sm font-medium text-[#F7F7F7]/60">Total</span>
                  <span className="price text-lg text-[#F7F7F7]">{`Rp ${(currentBooking.finalAmount / 1000).toFixed(0)}K`}</span>
                </div>
              </div>

              <div className="space-y-2 rounded-xl bg-white/[0.02] p-3">
                <div className="flex items-center justify-between">
                  <span className="caption text-[#F7F7F7]/25">Status</span>
                  <PaymentBadge status={isCancelled ? "refunded" : (currentBooking.payment?.status.toLowerCase() ?? "pending")} />
                </div>
                {refundMessage && (
                  <div className="rounded-xl border border-[#E6FA50]/15 bg-[#E6FA50]/10 p-3">
                    <p className="text-xs leading-5 text-[#E6FA50]">{refundMessage}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
              <p className="section-label mb-4">Actions</p>
              <div className="space-y-2">
                <button
                  onClick={handleShareInvite}
                  className="w-full flex items-center gap-3 rounded-xl bg-white/[0.02] px-4 py-3 text-sm text-[#F7F7F7]/60 transition-colors hover:bg-white/[0.04] hover:text-[#F7F7F7]"
                >
                  <Share2 className="h-4 w-4 text-[#50C8C8]" />
                  Share invite link
                  <Copy className="ml-auto h-3.5 w-3.5 text-[#F7F7F7]/25" />
                </button>
                <Link
                  href={`/booking/${currentBooking.id}/payment`}
                  className="w-full flex items-center gap-3 rounded-xl bg-white/[0.02] px-4 py-3 text-sm text-[#F7F7F7]/60 transition-colors hover:bg-white/[0.04] hover:text-[#F7F7F7]"
                >
                  <CreditCard className="h-4 w-4 text-[#50C8C8]" />
                  View payment receipt
                </Link>
                {currentBooking.status === "CONFIRMED" && !isCancelled && (
                  <>
                    <div className="my-1 border-t border-white/[0.04]" />
                    <button
                      onClick={handleCancel}
                      className="w-full flex items-center gap-3 rounded-xl bg-red-500/5 px-4 py-3 text-sm text-red-400/70 transition-colors hover:bg-red-500/10 hover:text-red-400"
                    >
                      <XCircle className="h-4 w-4" />
                      Cancel booking
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0C1B26] p-6 shadow-2xl">
            <p className="section-label">Cancel Booking</p>
            <h2 className="heading-2 mt-3 text-xl text-[#F7F7F7]">Cancel this booking?</h2>
            <p className="mt-2 text-sm leading-6 text-[#F7F7F7]/40">
              This will cancel your booking and release the court time.
            </p>
            <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
              <p className="text-sm font-medium text-[#F7F7F7]/60">Refund eligibility</p>
              <p className="mt-1 text-xs leading-5 text-[#F7F7F7]/40">{getRefundNote()}</p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setShowCancelModal(false)}
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

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-white/[0.06] bg-[#0C1B26] px-5 py-3 shadow-2xl">
          <p className="caption text-[#F7F7F7]/60">{toast}</p>
        </div>
      )}
    </div>
  );
}





function PaymentRow({ label, value, highlight, bold }: { label: string; value: string; highlight?: boolean; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`caption ${bold ? "text-[#F7F7F7]/60" : "text-[#F7F7F7]/40"}`}>{label}</span>
      <span className={`heading-3 text-[13px] ${highlight ? "text-[#E6FA50]" : bold ? "text-[#F7F7F7]" : "text-[#F7F7F7]/60"}`}>{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    confirmed: "bg-[#E6FA50]/10 text-[#E6FA50]",
    pending: "bg-[#50C8C8]/10 text-[#50C8C8]",
    completed: "bg-white/[0.04] text-[#F7F7F7]/25",
    cancelled: "bg-red-500/10 text-red-400/70",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] ${styles[status] ?? "bg-white/5 text-[#F7F7F7]/25"}`}>
      {status}
    </span>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: "bg-[#E6FA50]/10 text-[#E6FA50]",
    pending: "bg-amber-500/10 text-amber-400",
    failed: "bg-red-500/10 text-red-400",
    refunded: "bg-[#50C8C8]/10 text-[#50C8C8]",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] ${styles[status] ?? ""}`}>
      {status}
    </span>
  );
}
