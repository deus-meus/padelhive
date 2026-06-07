"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Clock,
  CalendarDays,
  Timer,
  CreditCard,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { mockVenues } from "@/mock/venues";
import { mockCourts } from "@/mock/courts";
import { VoucherApply, type VoucherResult } from "@/components/booking/voucher-apply";
import { padelImg } from "@/lib/images";

const MOCK_CHECKOUT = {
  venueId: "venue-1",
  courtId: "court-1",
  date: "2026-06-10",
  startTime: "09:00",
  endTime: "10:00",
  duration: 60,
  courtFee: 300000,
  platformFee: 15000,
};

export default function CheckoutPage() {
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [voucherCode, setVoucherCode] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle");

  const venue = mockVenues.find((v) => v.id === MOCK_CHECKOUT.venueId);
  const court = mockCourts.find((c) => c.id === MOCK_CHECKOUT.courtId);

  const subtotal = MOCK_CHECKOUT.courtFee;
  const total = subtotal - voucherDiscount + MOCK_CHECKOUT.platformFee;

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function handleVoucherApply(result: VoucherResult) {
    setVoucherDiscount(result.discount);
    setVoucherCode(result.code);
  }

  function handleVoucherRemove() {
    setVoucherDiscount(0);
    setVoucherCode(null);
  }

  function handlePay() {
    if (!paymentMethod) {
      showToast("Please select a payment method");
      setPaymentStatus("error");
      return;
    }

    setPaymentStatus("processing");
    window.setTimeout(() => {
      setPaymentStatus("success");
      showToast("Payment authorized in demo checkout.");
    }, 800);
  }

  const paymentMethods = [
    { id: "gopay", label: "GoPay", provider: "midtrans" },
    { id: "ovo", label: "OVO", provider: "xendit" },
    { id: "dana", label: "DANA", provider: "midtrans" },
    { id: "bca-va", label: "BCA Virtual Account", provider: "xendit" },
    { id: "bni-va", label: "BNI Virtual Account", provider: "xendit" },
  ];

  return (
    <div className="min-h-screen pt-28 pb-16">
      <section className="container pb-6">
        <Link href="/venues" className="inline-flex items-center gap-2 text-sm text-[#F7F7F7]/25 transition-colors hover:text-[#F7F7F7]/60">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>
      </section>

      <section className="container pb-8">
        <h1 className="heading-1 text-2xl text-[#F7F7F7] md:text-3xl">
          Checkout
        </h1>
        <p className="mt-2 text-sm font-light text-[#F7F7F7]/40">
          Review your booking and complete payment.
        </p>
      </section>

      <section className="container">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left — booking details & voucher */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking summary card */}
            <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
              <p className="section-label mb-4">Booking Details</p>
              <div className="flex gap-4">
                <div className="relative hidden h-20 w-28 shrink-0 overflow-hidden rounded-xl sm:block">
                  <Image
                    src={padelImg(300)}
                    alt={venue?.name ?? "Venue image"}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h2 className="heading-3 text-lg text-[#F7F7F7]">{venue?.name}</h2>
                  <p className="mt-1 flex items-center gap-2 caption text-[#F7F7F7]/25">
                    <MapPin className="h-3 w-3" /> {venue?.location} · {venue?.city}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <span className="flex items-center gap-1.5 caption text-[#F7F7F7]/40">
                      <CalendarDays className="h-3 w-3 text-[#50C8C8]" /> {MOCK_CHECKOUT.date}
                    </span>
                    <span className="flex items-center gap-1.5 caption text-[#F7F7F7]/40">
                      <Clock className="h-3 w-3 text-[#50C8C8]" /> {MOCK_CHECKOUT.startTime} – {MOCK_CHECKOUT.endTime}
                    </span>
                    <span className="flex items-center gap-1.5 caption text-[#F7F7F7]/40">
                      <Timer className="h-3 w-3 text-[#50C8C8]" /> {MOCK_CHECKOUT.duration} min
                    </span>
                    <span className="flex items-center gap-1.5 caption text-[#F7F7F7]/40">
                      <MapPin className="h-3 w-3 text-[#50C8C8]" /> {court?.name} · {court?.type}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Voucher */}
            <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
              <p className="section-label mb-4">Voucher Code</p>
              <VoucherApply
                orderAmount={subtotal}
                onApply={handleVoucherApply}
                onRemove={handleVoucherRemove}
              />
            </div>

            {/* Payment method */}
            <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
              <p className="section-label mb-4">Payment Method</p>
              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all ${
                      paymentMethod === method.id
                        ? "border border-[#E6FA50]/20 bg-[#E6FA50]/5"
                        : "border border-white/[0.04] bg-white/[0.02] hover:border-white/[0.08]"
                    }`}
                  >
                    <CreditCard className={`h-4 w-4 ${paymentMethod === method.id ? "text-[#E6FA50]" : "text-[#F7F7F7]/25"}`} />
                    <div className="flex-1">
                      <p className={`text-sm ${paymentMethod === method.id ? "text-[#F7F7F7]" : "text-[#F7F7F7]/60"}`}>
                        {method.label}
                      </p>
                      <p className="caption text-[#F7F7F7]/25">{method.provider}</p>
                    </div>
                    {paymentMethod === method.id && (
                      <CheckCircle2 className="h-4 w-4 text-[#E6FA50]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right — order summary */}
          <div>
            <div className="sticky top-24 rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
              <p className="section-label mb-4">Order Summary</p>
              <div className="space-y-3 mb-4">
                <SummaryRow label="Court fee" value={`Rp ${(subtotal / 1000).toFixed(0)}K`} />
                {voucherDiscount > 0 && (
                  <SummaryRow
                    label={`Voucher (${voucherCode})`}
                    value={`-Rp ${(voucherDiscount / 1000).toFixed(0)}K`}
                    highlight
                  />
                )}
                <SummaryRow label="Platform fee" value={`Rp ${(MOCK_CHECKOUT.platformFee / 1000).toFixed(0)}K`} />
                <div className="border-t border-white/[0.04] pt-3">
                  <SummaryRow label="Total" value={`Rp ${(total / 1000).toFixed(0)}K`} bold />
                </div>
              </div>

              {voucherDiscount > 0 && (
                <div className="mb-4 rounded-lg bg-[#E6FA50]/5 px-3 py-2">
                  <p className="caption text-[#E6FA50]">
                    You save Rp {(voucherDiscount / 1000).toFixed(0)}K with {voucherCode}
                  </p>
                </div>
              )}

              {paymentStatus === "error" && (
                <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2">
                  <p className="caption text-red-100/80">Select a payment method before paying.</p>
                </div>
              )}
              {paymentStatus === "processing" && (
                <div className="mb-4 rounded-lg border border-[#50C8C8]/20 bg-[#50C8C8]/10 px-3 py-2">
                  <p className="caption text-[#50C8C8]">Processing demo payment...</p>
                </div>
              )}
              {paymentStatus === "success" && (
                <div className="mb-4 rounded-lg border border-[#E6FA50]/20 bg-[#E6FA50]/10 px-3 py-2">
                  <p className="caption text-[#E6FA50]">Payment authorized. Booking is ready in this demo flow.</p>
                </div>
              )}

              <button
                onClick={handlePay}
                disabled={paymentStatus === "processing" || paymentStatus === "success"}
                className="btn-lime w-full rounded-xl py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                {paymentStatus === "processing" ? "Processing..." : paymentStatus === "success" ? "Payment Authorized" : `Pay Rp ${(total / 1000).toFixed(0)}K`}
              </button>

              <p className="caption text-center text-[#F7F7F7]/25 mt-3">
                Secure payment via Midtrans / Xendit
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-white/[0.06] bg-[#0C1B26] px-5 py-3 shadow-2xl">
          <p className="caption text-[#F7F7F7]/60">{toast}</p>
        </div>
      )}
    </div>
  );
}

function SummaryRow({ label, value, highlight, bold }: { label: string; value: string; highlight?: boolean; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${bold ? "font-medium text-[#F7F7F7]/60" : "text-[#F7F7F7]/40"}`}>{label}</span>
      <span className={`text-sm ${highlight ? "text-[#E6FA50]" : bold ? "font-semibold text-[#F7F7F7]" : "text-[#F7F7F7]/60"}`}>{value}</span>
    </div>
  );
}
