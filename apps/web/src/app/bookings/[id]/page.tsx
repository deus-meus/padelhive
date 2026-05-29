"use client";

import { useState } from "react";
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
import { enhancedBookings, type Participant } from "@/mock/enhanced-bookings";
import { mockVenues } from "@/mock/venues";
import { mockCourts } from "@/mock/courts";
import { padelImg } from "@/lib/images";

export default function BookingDetailPage() {
  const params = useParams();
  const bookingId = params.id as string;
  const booking = enhancedBookings.find((b) => b.id === bookingId);
  const [toast, setToast] = useState<string | null>(null);

  if (!booking) {
    return (
      <div className="min-h-screen pt-28">
        <div className="container py-16 text-center">
          <p className="text-sm text-[#F7F7F7]/30">Booking not found.</p>
          <Link href="/bookings" className="mt-4 inline-flex items-center gap-2 text-sm text-[#E6FA50] hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to bookings
          </Link>
        </div>
      </div>
    );
  }

  const venue = mockVenues.find((v) => v.id === booking.venueId);
  const court = mockCourts.find((c) => c.id === booking.courtId);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function handleShareInvite() {
    const url = `${window.location.origin}/booking/${bookingId}/invite`;
    navigator.clipboard.writeText(url).then(() => {
      showToast("Invite link copied to clipboard");
    }).catch(() => {
      showToast("Coming soon in backend integration.");
    });
  }

  function handleCancel() {
    showToast("Coming soon in backend integration.");
  }

  return (
    <div className="min-h-screen pt-28 pb-16">
      {/* Back nav */}
      <section className="container pb-6">
        <Link href="/bookings" className="inline-flex items-center gap-2 text-sm text-[#F7F7F7]/30 transition-colors hover:text-[#F7F7F7]/60">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to bookings
        </Link>
      </section>

      {/* Header */}
      <section className="container pb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <StatusBadge status={booking.status} />
              <PaymentBadge status={booking.payment.status} />
            </div>
            <h1 className="heading-1 text-2xl text-[#F7F7F7] md:text-3xl">
              {venue?.name ?? "Unknown Venue"}
            </h1>
            <p className="mt-1 flex items-center gap-2 text-sm text-[#F7F7F7]/40">
              <MapPin className="h-3.5 w-3.5" />
              {venue?.location} · {venue?.city}
            </p>
          </div>
          <div className="hidden sm:block h-20 w-32 overflow-hidden rounded-xl">
            <img src={padelImg(400)} alt={venue?.name ?? ""} className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="container">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column — main info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Information */}
            <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
              <p className="section-label mb-4">Booking Information</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <InfoCard icon={Ticket} label="Booking ID" value={booking.id.toUpperCase()} />
                <InfoCard icon={MapPin} label="Court" value={`${court?.name ?? "—"} · ${court?.type ?? ""}`} />
                <InfoCard icon={CalendarDays} label="Date" value={booking.bookingDate} />
                <InfoCard icon={Clock} label="Time" value={`${booking.startTime} – ${booking.endTime}`} />
                <InfoCard icon={Timer} label="Duration" value={`${booking.duration} min`} />
                <InfoCard icon={CalendarDays} label="Booked On" value={new Date(booking.createdAt).toLocaleDateString()} />
              </div>
            </div>

            {/* Participants */}
            <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="section-label">Participants</p>
                <span className="caption text-[#F7F7F7]/25">
                  {booking.participants.filter((p) => p.rsvp === "accepted").length}/{booking.participants.length} confirmed
                </span>
              </div>
              <div className="space-y-2">
                {booking.participants.map((participant) => (
                  <ParticipantRow key={participant.id} participant={participant} />
                ))}
              </div>
              {booking.status === "confirmed" && (
                <button
                  onClick={handleShareInvite}
                  className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl border border-white/[0.06] py-2.5 text-xs font-medium text-[#F7F7F7]/40 transition-colors hover:border-white/[0.12] hover:text-[#F7F7F7]/70"
                >
                  <Users className="h-3.5 w-3.5" /> Invite More Friends
                </button>
              )}
            </div>

            {/* Refund Policy */}
            <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
              <p className="section-label mb-4">Refund Policy</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-xl bg-white/[0.02] p-4">
                  <ShieldCheck className="h-5 w-5 shrink-0 text-[#E6FA50]" />
                  <div>
                    <p className="text-sm font-medium text-[#F7F7F7]/70">Full refund before H-1</p>
                    <p className="caption text-[#F7F7F7]/25">Cancel 24+ hours before booking date</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-white/[0.02] p-4">
                  <ShieldX className="h-5 w-5 shrink-0 text-red-400" />
                  <div>
                    <p className="text-sm font-medium text-[#F7F7F7]/70">Non-refundable after H-1</p>
                    <p className="caption text-[#F7F7F7]/25">Less than 24 hours before booking</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column — payment & actions */}
          <div className="space-y-6">
            {/* Payment */}
            <div id="payment" className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
              <p className="section-label mb-4">Payment</p>
              <div className="space-y-3 mb-4">
                <PaymentRow label="Court fee" value={`Rp ${(booking.totalAmount / 1000).toFixed(0)}K`} />
                {booking.voucherDiscount > 0 && (
                  <PaymentRow
                    label={`Voucher (${booking.voucherCode})`}
                    value={`-Rp ${(booking.voucherDiscount / 1000).toFixed(0)}K`}
                    highlight
                  />
                )}
                <PaymentRow label="Platform fee" value={`Rp ${(booking.platformFee / 1000).toFixed(0)}K`} />
                <div className="border-t border-white/[0.04] pt-3">
                  <PaymentRow label="Total" value={`Rp ${(booking.finalAmount / 1000).toFixed(0)}K`} bold />
                </div>
              </div>

              <div className="space-y-2 rounded-xl bg-white/[0.02] p-3">
                <div className="flex items-center justify-between">
                  <span className="caption text-[#F7F7F7]/30">Method</span>
                  <span className="text-xs font-medium text-[#F7F7F7]/60">{booking.payment.method}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="caption text-[#F7F7F7]/30">Provider</span>
                  <span className="text-xs font-medium text-[#F7F7F7]/60 uppercase">{booking.payment.provider}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="caption text-[#F7F7F7]/30">Status</span>
                  <PaymentBadge status={booking.payment.status} />
                </div>
                {booking.payment.paidAt && (
                  <div className="flex items-center justify-between">
                    <span className="caption text-[#F7F7F7]/30">Paid at</span>
                    <span className="caption text-[#F7F7F7]/40">{new Date(booking.payment.paidAt).toLocaleString()}</span>
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
                  <Copy className="ml-auto h-3.5 w-3.5 text-[#F7F7F7]/20" />
                </button>
                <Link
                  href={`/booking/${booking.id}/payment`}
                  className="w-full flex items-center gap-3 rounded-xl bg-white/[0.02] px-4 py-3 text-sm text-[#F7F7F7]/60 transition-colors hover:bg-white/[0.04] hover:text-[#F7F7F7]"
                >
                  <CreditCard className="h-4 w-4 text-[#50C8C8]" />
                  View payment receipt
                </Link>
                {booking.status === "confirmed" && (
                  <button
                    onClick={handleCancel}
                    className="w-full flex items-center gap-3 rounded-xl bg-red-500/5 px-4 py-3 text-sm text-red-400/70 transition-colors hover:bg-red-500/10 hover:text-red-400"
                  >
                    <XCircle className="h-4 w-4" />
                    Cancel booking
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-white/[0.06] bg-[#0C1B26] px-5 py-3 shadow-2xl">
          <p className="caption text-[#F7F7F7]/70">{toast}</p>
        </div>
      )}
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-white/[0.02] p-3">
      <Icon className="h-3.5 w-3.5 text-[#50C8C8]" />
      <p className="heading-3 mt-1.5 text-[13px] text-[#F7F7F7] break-all">{value}</p>
      <p className="caption mt-0.5 text-[#F7F7F7]/20">{label}</p>
    </div>
  );
}

function ParticipantRow({ participant }: { participant: Participant }) {
  const rsvpStyles = {
    accepted: { icon: CheckCircle2, color: "text-[#E6FA50]", label: "Accepted" },
    pending: { icon: Clock, color: "text-amber-400", label: "Pending" },
    declined: { icon: XCircle, color: "text-red-400", label: "Declined" },
  };
  const { icon: RsvpIcon, color, label } = rsvpStyles[participant.rsvp];

  return (
    <div className="flex items-center gap-3 rounded-xl bg-white/[0.02] p-3">
      <img
        src={participant.avatarUrl}
        alt={participant.name}
        className="h-8 w-8 rounded-full object-cover"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm text-[#F7F7F7]/70 truncate">{participant.name}</p>
          {participant.isHost && (
            <span className="rounded-full bg-[#E6FA50]/10 px-2 py-0.5 text-[9px] font-medium uppercase text-[#E6FA50]">Host</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <RsvpIcon className={`h-3.5 w-3.5 ${color}`} />
        <span className={`caption ${color}`}>{label}</span>
      </div>
    </div>
  );
}

function PaymentRow({ label, value, highlight, bold }: { label: string; value: string; highlight?: boolean; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${bold ? "font-medium text-[#F7F7F7]/70" : "text-[#F7F7F7]/40"}`}>{label}</span>
      <span className={`text-sm ${highlight ? "text-[#E6FA50]" : bold ? "font-semibold text-[#F7F7F7]" : "text-[#F7F7F7]/60"}`}>{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    confirmed: "bg-[#E6FA50]/10 text-[#E6FA50]",
    pending: "bg-[#50C8C8]/10 text-[#50C8C8]",
    completed: "bg-white/[0.04] text-[#F7F7F7]/30",
    cancelled: "bg-red-500/10 text-red-400/70",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] ${styles[status] ?? "bg-white/5 text-[#F7F7F7]/30"}`}>
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
