"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  Wallet,
  Building2,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Shield,
  UserPlus,
} from "lucide-react";
import { ApiRequestError, createPaymentIntent, markPaymentPaid, type PaymentSummary } from "@/lib/api";

interface SplitPlayer {
  id: string;
  name: string;
  avatar: string;
  amount: number;
  status: "paid" | "pending" | "unpaid";
}

const PAYMENT_METHODS = [
  {
    id: "va",
    label: "Virtual Account",
    description: "BCA, Mandiri, BNI, BRI",
    icon: Building2,
  },
  {
    id: "ewallet",
    label: "E-Wallet",
    description: "GoPay, OVO, DANA, ShopeePay",
    icon: Wallet,
  },
  {
    id: "card",
    label: "Credit / Debit Card",
    description: "Visa, Mastercard",
    icon: CreditCard,
  },
];

const SPLIT_PLAYERS: SplitPlayer[]= [
  {
    id: "p1",
    name: "You",
    avatar: "https://i.pravatar.cc/150?u=you",
    amount: 0,
    status: "pending",
  },
  {
    id: "p2",
    name: "Andi Saputra",
    avatar: "https://i.pravatar.cc/150?u=andi",
    amount: 0,
    status: "paid",
  },
  {
    id: "p3",
    name: "Budi Rahmat",
    avatar: "https://i.pravatar.cc/150?u=budi",
    amount: 0,
    status: "pending",
  },
  {
    id: "p4",
    name: "Clara Wijaya",
    avatar: "https://i.pravatar.cc/150?u=clara",
    amount: 0,
    status: "unpaid",
  },
];

const SPLIT_STATUS_CONFIG = {
  paid: {
    label: "Paid",
    icon: CheckCircle2,
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
  unpaid: {
    label: "Not Paid",
    icon: AlertCircle,
    color: "text-red-400",
    bg: "bg-red-400/10",
  },
};

export default function PaymentPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [splitEnabled, setSplitEnabled] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [payment, setPayment] = useState<PaymentSummary | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [markingPaid, setMarkingPaid] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);

  const venue = searchParams.get("venue") ?? "Padel Bali Arena";
  const court = searchParams.get("court") ?? "Court A";
  const date = searchParams.get("date") ?? "2026-05-29";
  const start = searchParams.get("start") ?? "10:00";
  const end = searchParams.get("end") ?? "11:00";
  const amount = parseInt(searchParams.get("amount") ?? "300000");
  const venueId = searchParams.get("venueId") ?? "venue-1";

  const platformFee = Math.round(amount * 0.05);
  const totalAmount = amount + platformFee;

  const playerCount = SPLIT_PLAYERS.length;
  const perPlayer = Math.ceil(totalAmount / playerCount);

  const players = SPLIT_PLAYERS.map((p) => ({
    ...p,
    amount: perPlayer,
  }));

  const paidAmount = players
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);
  const yourShare = splitEnabled ? totalAmount - paidAmount : totalAmount;

  const formattedDate = (() => {
    try {
      return new Date(date).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch {
      return date;
    }
  })();

  async function handlePay() {
    if (!selectedMethod || processing) return;

    setProcessing(true);
    setPaymentError(null);

    try {
      const paymentIntent = await createPaymentIntent(
        { bookingId: params.id, method: selectedMethod as "va" | "ewallet" | "card" }
      );
      setPayment(paymentIntent);
      setSuccess(true);
    } catch (error) {
      if (error instanceof ApiRequestError) {
        if (error.status === 401 || error.status === 403) {
          setPaymentError("Sign in before creating a payment intent.");
        } else if (error.status === 404) {
          setPaymentError("Booking or payment was not found.");
        } else if (error.status === 400) {
          setPaymentError("This booking cannot be paid with the selected method.");
        } else if (error.status && error.status >= 500) {
          setPaymentError("Payment service is unavailable. Please try again later.");
        } else {
          setPaymentError("Could not create payment intent. Please try again.");
        }
      } else {
        setPaymentError("Payment service is unavailable. Please try again later.");
      }
    } finally {
      setProcessing(false);
    }
  }

  async function handleMarkPaid() {
    if (!payment || markingPaid) return;

    setMarkingPaid(true);
    setPaymentError(null);
    setConfirmationMessage(null);

    try {
      const paidPayment = await markPaymentPaid(payment.id);
      setPayment(paidPayment);
      setConfirmationMessage("Payment marked as paid. Booking confirmed.");
      window.setTimeout(() => {
        router.push(
          `/booking/${params.id}/success?venue=${encodeURIComponent(paidPayment.booking.venue.name)}&court=${encodeURIComponent(paidPayment.booking.court.name)}&date=${encodeURIComponent(paidPayment.booking.bookingDate)}&start=${encodeURIComponent(paidPayment.booking.startsAt)}&end=${encodeURIComponent(paidPayment.booking.endsAt)}&amount=${paidPayment.amount}`
        );
      }, 900);
    } catch (error) {
      if (error instanceof ApiRequestError) {
        if (error.status === 401 || error.status === 403) {
          setPaymentError("This demo payment belongs to another account or your session expired.");
        } else if (error.status === 404) {
          setPaymentError("Payment was not found.");
        } else if (error.status === 400) {
          setPaymentError(error.message || "This payment cannot be marked paid in demo mode.");
        } else if (error.status && error.status >= 500) {
          setPaymentError("Payment service is unavailable. Please try again later.");
        } else {
          setPaymentError("Could not mark demo payment as paid. Please try again.");
        }
      } else {
        setPaymentError("Payment service is unavailable. Please try again later.");
      }
    } finally {
      setMarkingPaid(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen pt-20">
        <div className="container max-w-lg py-16 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#E6FA50]/10">
            <CheckCircle2 className="h-10 w-10 text-[#E6FA50]" />
          </div>
          <h1 className="heading-1 mt-8 text-2xl text-[#F7F7F7] md:text-3xl">
            Payment Intent Created
          </h1>
          <p className="mt-3 text-sm text-[#F7F7F7]/40">
            Your internal payment intent is ready. Use the demo action below to confirm this booking without processing real money.
          </p>

          <div className="mt-8 rounded-xl border border-white/[0.06] bg-[#0C1B26] p-5 text-left">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#F7F7F7]/40">Venue</span>
                <span className="text-[#F7F7F7]/80">{venue}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#F7F7F7]/40">Court</span>
                <span className="text-[#F7F7F7]/80">{court}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#F7F7F7]/40">Date</span>
                <span className="text-[#F7F7F7]/80">{formattedDate}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#F7F7F7]/40">Time</span>
                <span className="text-[#F7F7F7]/80">{start} – {end}</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/[0.06] pt-3 text-sm">
                <span className="font-medium text-[#F7F7F7]/60">Payment amount</span>
                <span className="price text-lg text-[#E6FA50]">
                  Rp {(payment?.amount ?? yourShare).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#F7F7F7]/40">Payment status</span>
                <span className="text-[#F7F7F7]/80">{payment?.status ?? "PENDING"}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            {confirmationMessage && (
              <div className="rounded-xl border border-[#E6FA50]/20 bg-[#E6FA50]/10 p-3">
                <p className="text-sm font-medium text-[#E6FA50]">{confirmationMessage}</p>
                <p className="mt-1 text-[11px] text-[#F7F7F7]/40">
                  Redirecting to booking success...
                </p>
              </div>
            )}
            {paymentError && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3">
                <p className="text-[11px] leading-relaxed text-red-200/80">{paymentError}</p>
              </div>
            )}
            <button
              onClick={handleMarkPaid}
              disabled={!payment || markingPaid || payment?.status === "PAID"}
              className="btn-lime flex h-12 items-center justify-center rounded-full text-[11px] font-semibold uppercase tracking-[0.08em] disabled:cursor-not-allowed disabled:opacity-30"
            >
              {markingPaid ? "Marking Paid..." : "Mark as Paid (Demo)"}
            </button>
            <Link
              href="/profile/bookings"
              className="flex h-12 items-center justify-center rounded-full border border-white/[0.08] text-[11px] font-medium uppercase tracking-[0.08em] text-[#F7F7F7]/50 transition-colors hover:border-white/[0.15] hover:text-[#F7F7F7]/70"
            >
              View My Bookings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="container max-w-4xl py-8">
        {/* Back */}
        <Link
          href={`/venues/${venueId}/book`}
          className="inline-flex items-center gap-2 text-sm text-[#F7F7F7]/40 hover:text-[#F7F7F7]/70 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to booking
        </Link>

        {/* Header */}
        <div className="mt-6">
          <h1 className="heading-1 text-2xl text-[#F7F7F7] md:text-3xl">
            Payment
          </h1>
          <p className="mt-2 text-sm text-[#F7F7F7]/40">
            Complete your booking
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
          {/* Left — Payment options */}
          <div className="space-y-8">
            {/* Booking Summary Card */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0C1B26] p-5">
              <h3 className="heading-3 text-sm text-[#F7F7F7]/60 uppercase tracking-wider">
                Booking Details
              </h3>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#F7F7F7]/40">Venue</span>
                  <span className="text-[#F7F7F7]/80">{venue}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#F7F7F7]/40">Court</span>
                  <span className="text-[#F7F7F7]/80">{court}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#F7F7F7]/40">Date</span>
                  <span className="text-[#F7F7F7]/80">{formattedDate}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#F7F7F7]/40">Time</span>
                  <span className="text-[#F7F7F7]/80">
                    {start} – {end}
                  </span>
                </div>
              </div>
            </div>

            {/* Split Payment Toggle */}
            <div>
              <div className="flex items-center justify-between">
                <h2 className="heading-3 text-sm text-[#F7F7F7]/60 uppercase tracking-wider">
                  <Users className="mr-2 inline h-3.5 w-3.5" />
                  Split Payment
                </h2>
                <button
                  onClick={() => setSplitEnabled(!splitEnabled)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    splitEnabled ? "bg-[#E6FA50]" : "bg-white/[0.1]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      splitEnabled ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
              <p className="mt-1 text-[11px] text-[#F7F7F7]/25">
                Split the cost equally among all players
              </p>

              {splitEnabled && (
                <div className="mt-4 space-y-3">
                  <div className="rounded-xl border border-[#E6FA50]/10 bg-[#E6FA50]/[0.03] p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#F7F7F7]/50">
                        Price per player
                      </span>
                      <span className="text-sm font-semibold text-[#E6FA50]">
                        Rp {perPlayer.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] text-[#F7F7F7]/25">
                      Total Rp {totalAmount.toLocaleString("id-ID")} ÷{" "}
                      {playerCount} players
                    </p>
                  </div>

                  {players.map((player) => {
                    const config = SPLIT_STATUS_CONFIG[player.status];
                    const StatusIcon = config.icon;
                    return (
                      <div
                        key={player.id}
                        className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#0C1B26] p-4"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={player.avatar}
                            alt={player.name}
                            className="h-9 w-9 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-sm font-medium text-[#F7F7F7]/80">
                              {player.name}
                            </p>
                            <p className="text-[11px] text-[#F7F7F7]/30">
                              Rp {player.amount.toLocaleString("id-ID")}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 ${config.bg}`}
                        >
                          <StatusIcon
                            className={`h-3.5 w-3.5 ${config.color}`}
                          />
                          <span
                            className={`text-[11px] font-medium ${config.color}`}
                          >
                            {config.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  <div className="rounded-lg bg-white/[0.02] p-3">
                    <p className="text-[11px] text-[#F7F7F7]/30">
                      You pay the remaining balance. Friends who haven&apos;t
                      paid will be charged their share separately.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Invite Friends Link */}
            <Link
              href={`/booking/${params.id}/invite`}
              className="flex items-center gap-3 rounded-xl border border-dashed border-white/[0.08] bg-white/[0.01] p-4 transition-colors hover:border-[#50C8C8]/20 hover:bg-[#50C8C8]/[0.02]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#50C8C8]/10">
                <UserPlus className="h-4 w-4 text-[#50C8C8]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#F7F7F7]/70">
                  Invite Friends
                </p>
                <p className="text-[11px] text-[#F7F7F7]/30">
                  Share your booking link and manage RSVPs
                </p>
              </div>
            </Link>

            {/* Payment Method */}
            <div>
              <h2 className="heading-3 text-sm text-[#F7F7F7]/60 uppercase tracking-wider">
                <CreditCard className="mr-2 inline h-3.5 w-3.5" />
                Payment Method
              </h2>
              <div className="mt-4 space-y-3">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  const isSelected = selectedMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                        isSelected
                          ? "border-[#E6FA50]/40 bg-[#E6FA50]/5"
                          : "border-white/[0.06] bg-[#0C1B26] hover:border-white/[0.12]"
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                          isSelected
                            ? "bg-[#E6FA50]/15 text-[#E6FA50]"
                            : "bg-white/[0.04] text-[#F7F7F7]/40"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium ${
                            isSelected
                              ? "text-[#E6FA50]"
                              : "text-[#F7F7F7]/70"
                          }`}
                        >
                          {method.label}
                        </p>
                        <p className="text-[11px] text-[#F7F7F7]/30">
                          {method.description}
                        </p>
                      </div>
                      <div
                        className={`h-5 w-5 rounded-full border-2 ${
                          isSelected
                            ? "border-[#E6FA50] bg-[#E6FA50]"
                            : "border-white/[0.15]"
                        }`}
                      >
                        {isSelected && (
                          <div className="flex h-full w-full items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-[#06121A]" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right — Order Summary */}
          <div className="lg:relative">
            <div className="lg:sticky lg:top-28">
              <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
                <h3 className="heading-3 text-sm text-[#F7F7F7]/60 uppercase tracking-wider">
                  Order Summary
                </h3>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#F7F7F7]/40">Court rental</span>
                    <span className="text-[#F7F7F7]/60">
                      Rp {amount.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#F7F7F7]/40">Platform fee (5%)</span>
                    <span className="text-[#F7F7F7]/60">
                      Rp {platformFee.toLocaleString("id-ID")}
                    </span>
                  </div>
                  {splitEnabled && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#F7F7F7]/40">
                        Paid by friends
                      </span>
                      <span className="text-green-400/70">
                        - Rp {paidAmount.toLocaleString("id-ID")}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 border-t border-white/[0.06] pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#F7F7F7]/70">
                      {splitEnabled ? "You pay" : "Total"}
                    </span>
                    <span className="price text-xl text-[#F7F7F7]">
                      Rp {yourShare.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                {paymentError && (
                  <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3">
                    <p className="text-[11px] leading-relaxed text-red-200/80">{paymentError}</p>
                  </div>
                )}

                <button
                  onClick={handlePay}
                  disabled={!selectedMethod || processing}
                  className="btn-lime mt-6 flex h-12 w-full items-center justify-center rounded-full text-[11px] font-semibold uppercase tracking-[0.08em] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {processing ? "Processing..." : "Create Payment Intent"}
                </button>

                <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#F7F7F7]/25">
                  <Shield className="h-3 w-3" />
                  <span>Internal payment intent only — provider integration coming soon</span>
                </div>

                <div className="mt-3 rounded-lg bg-white/[0.02] p-3">
                  <p className="text-[11px] leading-relaxed text-[#F7F7F7]/25">
                    Free cancellation up to 24h before booking. After that,
                    standard refund policy applies.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
