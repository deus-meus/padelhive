"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import Script from "next/script";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import {
  ApiRequestError,
  createPaymentIntent,
  markPaymentPaid,
  getBookingById,
  getBookingSplit,
  getBookingInvites,
  setBookingSplit,
  clearBookingSplit,
  setSplitShareStatus,
  type ApiBooking,
} from "@/lib/api";
import { getUserFacingErrorMessage } from "@/lib/errors";

declare global {
  interface Window {
    snap: {
      pay: (
        token: string,
        options?: {
          onSuccess?: (result: any) => void;
          onPending?: (result: any) => void;
          onError?: (result: any) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

// No SplitPlayer mock data

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

// No SPLIT_PLAYERS mock data

const SPLIT_STATUS_CONFIG = {
  PAID: {
    label: "Paid",
    icon: CheckCircle2,
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
  PENDING: {
    label: "Pending",
    icon: Clock,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
};

export default function PaymentPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [markingPaid, setMarkingPaid] = useState(false);
  const [togglingShareId, setTogglingShareId] = useState<string | null>(null);
  const [splitMode, setSplitMode] = useState<"equal" | "custom">("equal");
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [customError, setCustomError] = useState<string | null>(null);
  const hasInitializedSplitMode = useRef(false);

  const isDemoMode = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION !== "true";
  const snapScriptUrl = isDemoMode
    ? "https://app.sandbox.midtrans.com/snap/snap.js"
    : "https://app.midtrans.com/snap/snap.js";
  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

  const { data: booking, isLoading: isBookingLoading, isError: isBookingError } = useQuery({
    queryKey: queryKeys.bookings.detail(params.id),
    queryFn: () => getBookingById(params.id),
  });

  const { data: splitData, isLoading: isSplitLoading } = useQuery({
    queryKey: queryKeys.bookings.split(params.id),
    queryFn: () => getBookingSplit(params.id),
    enabled: !!booking,
  });

  const { data: invites } = useQuery({
    queryKey: queryKeys.bookings.invites(params.id),
    queryFn: () => getBookingInvites(params.id),
    enabled: !!booking,
  });

  const { mutate: setSplit, isPending: isSettingSplit } = useMutation({
    mutationFn: (input: Parameters<typeof setBookingSplit>[1]) => setBookingSplit(params.id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.bookings.split(params.id) }),
  });

  const { mutate: clearSplit, isPending: isClearingSplit } = useMutation({
    mutationFn: () => clearBookingSplit(params.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.bookings.split(params.id) }),
  });

  const { mutate: setShareStatus } = useMutation({
    mutationFn: ({ shareId, status }: { shareId: string; status: "PENDING" | "PAID" }) =>
      setSplitShareStatus(params.id, shareId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.bookings.split(params.id) }),
    onSettled: () => setTogglingShareId(null),
  });

  const splitEnabled = (splitData?.shares?.length ?? 0) > 0;
  const isSplitToggling = isSettingSplit || isClearingSplit;

  const isEqualSplit = (() => {
    if (!splitData || !splitData.shares || splitData.shares.length === 0 || !splitData.shareCount || splitData.shareCount <= 0) {
      return true;
    }
    const base = Math.floor(splitData.totalAmount / splitData.shareCount);
    const remainder = splitData.totalAmount - base * splitData.shareCount;
    const expected = [base + remainder, ...Array(splitData.shareCount - 1).fill(base)].sort((a, b) => b - a);
    const actual = splitData.shares.map((s) => s.amount).sort((a, b) => b - a);

    if (expected.length !== actual.length) return false;
    return expected.every((val, idx) => val === actual[idx]);
  })();

  const splitInviteIds = new Set((splitData?.shares ?? []).map((s) => s.inviteId));
  const unsyncedInvites = (invites ?? []).filter((inv) => !splitInviteIds.has(inv.id));
  const hasUnsyncedInvites = splitEnabled && unsyncedInvites.length > 0;

  useEffect(() => {
    if (!splitData || hasInitializedSplitMode.current) return;
    if ((splitData.shares?.length ?? 0) === 0) return;
    hasInitializedSplitMode.current = true;
    setSplitMode(isEqualSplit ? "equal" : "custom");
  }, [splitData, isEqualSplit]);

  const handleResyncParticipants = () => {
    const participants = [];
    participants.push({
      name: "You",
      userId: booking?.host?.id,
      email: booking?.host?.email,
    });
    if (invites) {
      invites.forEach((invite) => {
        participants.push({
          name: invite.name,
          email: invite.email,
          userId: invite.userId ?? undefined,
          inviteId: invite.id,
        });
      });
    }
    setSplit({ mode: "equal", participants });
    setSplitMode("equal");
    setCustomAmounts({});
    setCustomError(null);
  };

  const handleToggleSplit = () => {
    if (splitEnabled) {
      clearSplit();
      setSplitMode("equal");
      setCustomAmounts({});
      setCustomError(null);
      hasInitializedSplitMode.current = false;
    } else {
      const participants = [];
      participants.push({
        name: "You",
        userId: booking?.host?.id,
        email: booking?.host?.email,
      });

      if (invites) {
        invites.forEach((invite) => {
          participants.push({
            name: invite.name,
            email: invite.email,
            userId: invite.userId ?? undefined,
            inviteId: invite.id,
          });
        });
      }

      setSplit({ mode: "equal", participants });
    }
  };

  const venue = booking?.venue.name ?? "—";
  const court = booking?.court.name ?? "—";
  const date = booking?.bookingDate ?? "—";
  const start = booking?.startsAt ?? "—";
  const end = booking?.endsAt ?? "—";
  const amount = booking?.courtAmount ?? 0;
  const venueId = booking?.venue.id ?? "";

  const platformFee = booking?.platformFee ?? 0;
  const totalAmount = booking?.finalAmount ?? 0;

  const paidAmount = splitData?.paidAmount ?? 0;
  const yourShare = splitEnabled ? Math.max(0, totalAmount - paidAmount) : totalAmount;

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
    if (!selectedMethod || processing || !booking) return;

    if (typeof window === "undefined" || !window.snap) {
      setPaymentError("Payment module is still loading. Please try again in a moment.");
      setProcessing(false);
      return;
    }

    setProcessing(true);
    setPaymentError(null);

    try {
      const paymentIntent = await createPaymentIntent(
        { bookingId: params.id, method: selectedMethod as "va" | "ewallet" | "card" }
      );
      
      if (paymentIntent.providerToken) {
        window.snap.pay(paymentIntent.providerToken, {
          onSuccess: () => {
            router.push(`/booking/${params.id}/success?paymentId=${paymentIntent.id}`);
          },
          onPending: () => {
            router.push(`/booking/${params.id}/success?paymentId=${paymentIntent.id}`);
          },
          onError: () => {
            setPaymentError("Payment failed or was declined. Please try again.");
            setProcessing(false);
          },
          onClose: () => {
            setProcessing(false);
          }
        });
      } else {
        setPaymentError("Missing payment token. Please try again.");
        setProcessing(false);
      }
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
      setProcessing(false);
    }
  }

  async function handleMarkPaid() {
    if (markingPaid) return;

    setMarkingPaid(true);
    setPaymentError(null);

    try {
      let paymentId = booking?.payment?.id;
      if (!paymentId) {
        try {
          const paymentIntent = await createPaymentIntent({ bookingId: params.id, method: "va" });
          paymentId = paymentIntent.id;
        } catch (err: any) {
          if (err instanceof ApiRequestError && err.status === 409) {
            const freshBooking = await getBookingById(params.id);
            if (freshBooking.payment?.id) {
              paymentId = freshBooking.payment.id;
            } else {
              throw new Error("Could not resolve existing payment.");
            }
          } else {
            throw err;
          }
        }
      }

      const paidPayment = await markPaymentPaid(paymentId);
      router.push(`/booking/${params.id}/success?paymentId=${paidPayment.id}`);
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setPaymentError(getUserFacingErrorMessage(error) || "Could not mark demo payment as paid.");
      } else {
        setPaymentError(getUserFacingErrorMessage(error));
      }
    } finally {
      setMarkingPaid(false);
    }
  }



  return (
    <div className="min-h-screen pt-20">
      <Script src={snapScriptUrl} data-client-key={clientKey} strategy="afterInteractive" />
      <div className="container max-w-4xl py-8">
        {/* Back */}
        <Link
          href={`/venues/${venueId}/book`}
          className="inline-flex items-center gap-2 text-sm text-[#F7F7F7]/40 hover:text-[#F7F7F7]/60 transition-colors"
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
                {isBookingLoading ? (
                  <div className="text-sm text-[#F7F7F7]/40">Loading booking details...</div>
                ) : isBookingError ? (
                  <div className="text-sm text-red-400">Error loading booking details.</div>
                ) : (
                  <>
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
                  </>
                )}
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
                  onClick={handleToggleSplit}
                  disabled={isSplitToggling}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    splitEnabled ? "bg-[#E6FA50]" : "bg-white/[0.1]"
                  } disabled:opacity-50`}
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
                  <div className="flex rounded-lg border border-white/[0.06] bg-[#0C1B26] p-1">
                    <button
                      onClick={() => {
                        if (splitMode === "custom") {
                          const participants = splitData?.shares.map((share) => ({
                            name: share.name,
                            email: share.email ?? undefined,
                            userId: share.userId ?? undefined,
                            inviteId: share.inviteId ?? undefined,
                          })) || [];
                          setSplit({ mode: "equal", participants });
                          setSplitMode("equal");
                          setCustomError(null);
                        }
                      }}
                      disabled={isSettingSplit}
                      className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
                        splitMode === "equal" ? "bg-white/[0.06] text-[#E6FA50]" : "text-[#F7F7F7]/40 hover:text-[#F7F7F7]/80"
                      } disabled:opacity-50`}
                    >
                      Equal
                    </button>
                    <button
                      onClick={() => {
                        if (splitMode === "equal" && splitData) {
                          const newAmounts: Record<string, string> = {};
                          splitData.shares.forEach((share) => {
                            newAmounts[share.id] = String(share.amount);
                          });
                          setCustomAmounts(newAmounts);
                          setCustomError(null);
                          setSplitMode("custom");
                        }
                      }}
                      disabled={isSettingSplit}
                      className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
                        splitMode === "custom" ? "bg-white/[0.06] text-[#E6FA50]" : "text-[#F7F7F7]/40 hover:text-[#F7F7F7]/80"
                      } disabled:opacity-50`}
                    >
                      Custom
                    </button>
                  </div>

                  {hasUnsyncedInvites && (
                    <div className="rounded-xl border border-[#E6FA50]/10 bg-[#E6FA50]/[0.03] p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[11px] text-[#F7F7F7]/60">
                          {unsyncedInvites.length} new {unsyncedInvites.length === 1 ? "invitee isn't" : "invitees aren't"} in this split yet.
                        </p>
                        <button
                          onClick={handleResyncParticipants}
                          disabled={isSplitToggling}
                          className="shrink-0 rounded-full border border-[#E6FA50]/30 px-3 py-1 text-[11px] font-medium text-[#E6FA50] transition-colors hover:bg-[#E6FA50]/10 disabled:opacity-50"
                        >
                          Re-sync
                        </button>
                      </div>
                      <p className="mt-1 text-[10px] text-[#F7F7F7]/25">
                        Re-syncing resets everyone to an equal split. Players who already paid keep their paid status.
                      </p>
                    </div>
                  )}

                  {isSplitLoading || isSplitToggling ? (
                    <div className="animate-pulse rounded-xl bg-white/[0.05] h-[80px]" />
                  ) : splitData && splitData.shares && splitData.shares.length > 0 ? (
                    <>
                      {splitMode === "equal" ? (
                        <>
                          {isEqualSplit ? (
                            <div className="rounded-xl border border-[#E6FA50]/10 bg-[#E6FA50]/[0.03] p-4">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-[#F7F7F7]/60">
                                  Price per player
                                </span>
                                <span className="text-sm font-semibold text-[#E6FA50]">
                                  Rp {Math.floor(splitData.totalAmount / splitData.shareCount).toLocaleString("id-ID")}
                                </span>
                              </div>
                              <p className="mt-1 text-[10px] text-[#F7F7F7]/25">
                                Total Rp {splitData.totalAmount.toLocaleString("id-ID")} ÷{" "}
                                {splitData.shareCount} players
                              </p>
                            </div>
                          ) : (
                            <div className="rounded-xl border border-white/[0.06] bg-[#0C1B26] p-4">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-[#F7F7F7]/60">Custom split</span>
                                <span className="text-sm font-semibold text-[#E6FA50]">
                                  Rp {splitData.totalAmount.toLocaleString("id-ID")}
                                </span>
                              </div>
                              <p className="mt-1 text-[10px] text-[#F7F7F7]/25">
                                Custom amounts per player · {splitData.shareCount} players
                              </p>
                            </div>
                          )}

                          {splitData.shares.map((share) => {
                            const config = SPLIT_STATUS_CONFIG[share.status];
                            const StatusIcon = config.icon;
                            const isToggling = togglingShareId === share.id;

                            return (
                              <div
                                key={share.id}
                                className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#0C1B26] p-4"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.05] text-[#F7F7F7]/60 text-xs font-semibold">
                                    {share.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-[#F7F7F7]/80">
                                      {share.name}
                                    </p>
                                    <p className="text-[11px] text-[#F7F7F7]/25">
                                      Rp {share.amount.toLocaleString("id-ID")}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    setTogglingShareId(share.id);
                                    setShareStatus({ shareId: share.id, status: share.status === "PENDING" ? "PAID" : "PENDING" });
                                  }}
                                  disabled={isToggling}
                                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors ${config.bg} hover:opacity-80 disabled:opacity-50`}
                                >
                                  {isToggling ? (
                                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                                  ) : (
                                    <StatusIcon
                                      className={`h-3.5 w-3.5 ${config.color}`}
                                    />
                                  )}
                                  <span
                                    className={`text-[11px] font-medium ${config.color}`}
                                  >
                                    {config.label}
                                  </span>
                                </button>
                              </div>
                            );
                          })}
                        </>
                      ) : (
                        <>
                          {(() => {
                            const currentSum = Object.values(customAmounts).reduce((acc, val) => acc + (parseInt(val, 10) || 0), 0);
                            const remaining = splitData.totalAmount - currentSum;
                            return (
                              <div className="rounded-xl border border-white/[0.06] bg-[#0C1B26] p-4">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-[#F7F7F7]/60">Allocated</span>
                                  <span className="text-sm font-semibold text-[#F7F7F7]/80">
                                    Rp {currentSum.toLocaleString("id-ID")} / Rp {splitData.totalAmount.toLocaleString("id-ID")}
                                  </span>
                                </div>
                                <div className="mt-1 flex items-center justify-between">
                                  <span className="text-sm text-[#F7F7F7]/60">Remaining</span>
                                  <span className={`text-sm font-semibold ${remaining === 0 ? "text-green-400" : "text-red-400"}`}>
                                    Rp {remaining.toLocaleString("id-ID")}
                                  </span>
                                </div>
                              </div>
                            );
                          })()}

                          {splitData.shares.map((share) => (
                            <div
                              key={share.id}
                              className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#0C1B26] p-4"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.05] text-[#F7F7F7]/60 text-xs font-semibold">
                                  {share.name.charAt(0).toUpperCase()}
                                </div>
                                <p className="text-sm font-medium text-[#F7F7F7]/80">
                                  {share.name}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-[#F7F7F7]/40">Rp</span>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={customAmounts[share.id] ?? ""}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, "");
                                    setCustomAmounts((prev) => ({ ...prev, [share.id]: val }));
                                    setCustomError(null);
                                  }}
                                  className="w-24 rounded-lg border border-white/[0.1] bg-[#06121A] px-3 py-1.5 text-right text-sm text-[#F7F7F7] focus:border-[#E6FA50] focus:outline-none"
                                />
                              </div>
                            </div>
                          ))}

                          <div className="mt-2 space-y-2">
                            {customError && <p className="text-[11px] text-red-400">{customError}</p>}
                            <button
                              disabled={
                                isSettingSplit ||
                                Object.values(customAmounts).some((v) => v === "" || isNaN(parseInt(v, 10))) ||
                                Object.values(customAmounts).reduce((acc, val) => acc + (parseInt(val, 10) || 0), 0) !== splitData.totalAmount
                              }
                              onClick={() => {
                                const parsedAmounts: Record<string, number> = {};
                                let sum = 0;
                                for (const shareId of Object.keys(customAmounts)) {
                                  const val = parseInt(customAmounts[shareId] || "0", 10);
                                  parsedAmounts[shareId] = val;
                                  sum += val;
                                }
                                if (sum !== splitData.totalAmount) {
                                  setCustomError("Couldn't save the custom split. Make sure the amounts add up to the total.");
                                  return;
                                }
                                const participants = splitData.shares.map((share) => ({
                                  name: share.name,
                                  email: share.email ?? undefined,
                                  userId: share.userId ?? undefined,
                                  inviteId: share.inviteId ?? undefined,
                                  amount: parsedAmounts[share.id],
                                }));
                                setSplit({ mode: "custom", participants }, {
                                  onError: () => setCustomError("Couldn't save the custom split. Make sure the amounts add up to the total.")
                                });
                              }}
                              className="btn-lime flex w-full h-10 items-center justify-center rounded-xl text-xs font-semibold disabled:opacity-50"
                            >
                              {isSettingSplit ? "Saving..." : "Save custom split"}
                            </button>
                            <p className="text-center text-[11px] text-[#F7F7F7]/25">
                              Saved amounts apply immediately. Players who already paid keep their paid status.
                            </p>
                          </div>
                        </>
                      )}

                      <div className="rounded-lg bg-white/[0.02] p-3">
                        <p className="text-[11px] text-[#F7F7F7]/25">
                          You pay the remaining balance. Friends who haven&apos;t
                          paid will be charged their share separately.
                        </p>
                      </div>
                    </>
                  ) : null}
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
                <p className="text-sm font-medium text-[#F7F7F7]/60">
                  Invite Friends
                </p>
                <p className="text-[11px] text-[#F7F7F7]/25">
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
                              : "text-[#F7F7F7]/60"
                          }`}
                        >
                          {method.label}
                        </p>
                        <p className="text-[11px] text-[#F7F7F7]/25">
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
                  {booking && booking.voucherDiscount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#F7F7F7]/40">Voucher discount</span>
                      <span className="text-[#E6FA50]/80">- Rp {booking.voucherDiscount.toLocaleString("id-ID")}</span>
                    </div>
                  )}
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
                    <span className="text-sm font-medium text-[#F7F7F7]/60">
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
                  disabled={!selectedMethod || processing || !booking || !clientKey}
                  className="btn-lime mt-6 flex h-12 w-full items-center justify-center rounded-full text-[11px] font-semibold uppercase tracking-[0.08em] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {processing ? "Processing..." : "Pay with Midtrans"}
                </button>

                {!clientKey && (
                  <div className="mt-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3">
                    <p className="text-[11px] leading-relaxed text-red-200/80">Missing Midtrans Client Key configuration.</p>
                  </div>
                )}

                {isDemoMode && (
                  <button
                    onClick={handleMarkPaid}
                    disabled={markingPaid || processing || !booking}
                    className="mt-3 flex h-12 w-full items-center justify-center rounded-full border border-white/[0.08] text-[11px] font-semibold uppercase tracking-[0.08em] text-[#F7F7F7]/60 transition-colors hover:border-[#E6FA50]/30 hover:text-[#E6FA50] disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {markingPaid ? "Marking Paid..." : "Mark as Paid (Demo)"}
                  </button>
                )}

                <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#F7F7F7]/25">
                  <Shield className="h-3 w-3" />
                  <span>Secure payment provided by Midtrans</span>
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
