"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CalendarDays, CheckCircle2, Clock, CreditCard, MapPin, Loader2, XCircle } from "lucide-react";
import { getBookingById, getPayment } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { formatBookingDate, formatBookingTimeRange } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBanner } from "@/components/ui/error-state";

export default function BookingSuccessPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId");

  const { data: booking, isLoading: isBookingLoading, isError: isBookingError, error: bookingError, refetch: refetchBooking, isFetching: isFetchingBooking } = useQuery({
    queryKey: queryKeys.bookings.detail(params.id),
    queryFn: () => getBookingById(params.id),
  });

  const { data: payment } = useQuery({
    queryKey: queryKeys.payments.detail(paymentId ?? ""),
    queryFn: () => getPayment(paymentId!),
    enabled: !!paymentId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return (status === "PAID" || status === "FAILED") ? false : 3000;
    }
  });

  const venue = booking?.venue.name ?? "—";
  const court = booking?.court.name ?? "—";
  const date = booking?.bookingDate;
  const start = booking?.startsAt;
  const end = booking?.endsAt;
  const amount = payment?.amount ?? booking?.payment?.amount ?? booking?.courtAmount ?? 0;

  const resolvedPaymentStatus = payment?.status ?? booking?.payment?.status;
  
  let isPaid = false;
  let isFailed = false;
  let displayStatus = "PENDING";

  if (resolvedPaymentStatus) {
    isPaid = resolvedPaymentStatus === "PAID";
    isFailed = resolvedPaymentStatus === "FAILED";
    displayStatus = resolvedPaymentStatus;
  } else if (booking) {
    if (booking.status === "CONFIRMED") {
      isPaid = true;
      displayStatus = "PAID";
    } else if (booking.status === "CANCELLED" || booking.status === "EXPIRED") {
      isFailed = true;
      displayStatus = "FAILED";
    }
  }

  if (isBookingLoading) {
    return (
      <div className="min-h-screen pt-20">
        <div className="container max-w-2xl py-12">
          <div className="rounded-3xl border border-white/[0.06] bg-[#0C1B26] p-6 text-center md:p-8">
            <Skeleton className="mx-auto h-20 w-20 rounded-full" />
            <Skeleton className="mx-auto mt-6 h-4 w-32 rounded-full" />
            <Skeleton className="mx-auto mt-3 h-10 w-64 rounded-full" />
            <Skeleton className="mx-auto mt-3 h-4 w-80 rounded-full" />
            <div className="mt-8 rounded-2xl bg-white/[0.02] p-5 text-left">
              <div className="grid gap-4 sm:grid-cols-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex flex-col gap-1.5">
                    <Skeleton className="h-3 w-16 rounded-full" />
                    <Skeleton className="h-4 w-32 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isBookingError) {
    return (
      <div className="min-h-screen pt-20">
        <div className="container max-w-2xl py-12">
          <ErrorBanner title="Couldn't load booking" error={bookingError} onRetry={() => refetchBooking()} isRetrying={isFetchingBooking} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="container max-w-2xl py-12">
        <div className="rounded-3xl border border-white/[0.06] bg-[#0C1B26] p-6 text-center md:p-8">
          
          {isPaid ? (
            <>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#E6FA50]/10">
                <CheckCircle2 className="h-10 w-10 text-[#E6FA50]" />
              </div>
              <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#E6FA50]">
                Booking Confirmed
              </p>
              <h1 className="heading-1 mt-3 text-2xl text-[#F7F7F7] md:text-4xl">
                Court secured for your match
              </h1>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#F7F7F7]/40">
                Your payment was successful and the court is confirmed.
              </p>
            </>
          ) : isFailed ? (
            <>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10">
                <XCircle className="h-10 w-10 text-red-500" />
              </div>
              <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-red-500">
                Payment Failed
              </p>
              <h1 className="heading-1 mt-3 text-2xl text-[#F7F7F7] md:text-4xl">
                Payment could not be processed
              </h1>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#F7F7F7]/40">
                We could not confirm your payment. Please try again.
              </p>
            </>
          ) : (
            <>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-yellow-500/10">
                <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />
              </div>
              <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-yellow-500">
                Payment Pending
              </p>
              <h1 className="heading-1 mt-3 text-2xl text-[#F7F7F7] md:text-4xl">
                Waiting for confirmation
              </h1>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#F7F7F7]/40">
                We are waiting for the payment provider to confirm your payment. This screen will update automatically.
              </p>
            </>
          )}

          <div className="mt-8 rounded-2xl border border-white/[0.06] bg-[#06121A] p-5 text-left">
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-[#F7F7F7]/40">Booking ID</p>
                <p className="mt-1 text-sm font-medium text-[#F7F7F7]/80">{params.id}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${isPaid ? "bg-[#E6FA50]/10 text-[#E6FA50]" : isFailed ? "bg-red-500/10 text-red-500" : "bg-yellow-500/10 text-yellow-500"}`}>
                {displayStatus}
              </span>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-white/[0.03] p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-[#F7F7F7]/40">
                  <MapPin className="h-3.5 w-3.5" />
                  Venue
                </div>
                <p className="mt-2 text-sm font-medium text-[#F7F7F7]/80">{venue}</p>
                <p className="mt-1 text-xs text-[#F7F7F7]/40">{court}</p>
              </div>

              <div className="rounded-xl bg-white/[0.03] p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-[#F7F7F7]/40">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Date
                </div>
                <p className="mt-2 text-sm font-medium text-[#F7F7F7]/80">{formatBookingDate(date)}</p>
              </div>

              <div className="rounded-xl bg-white/[0.03] p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-[#F7F7F7]/40">
                  <Clock className="h-3.5 w-3.5" />
                  Time
                </div>
                <p className="mt-2 text-sm font-medium text-[#F7F7F7]/80">
                  {formatBookingTimeRange(start, end)}
                </p>
              </div>

              <div className="rounded-xl bg-white/[0.03] p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-[#F7F7F7]/40">
                  <CreditCard className="h-3.5 w-3.5" />
                  Payment
                </div>
                <p className="mt-2 text-sm font-medium text-[#F7F7F7]/80">
                  {amount > 0 ? `Rp ${amount.toLocaleString("id-ID")}` : "—"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {isFailed ? (
              <Link
                href={`/booking/${params.id}/payment`}
                className="btn-lime flex h-12 items-center justify-center rounded-full px-6 text-[11px] font-semibold uppercase tracking-[0.08em]"
              >
                Try Payment Again
              </Link>
            ) : (
              <Link
                href="/profile/bookings"
                className="btn-lime flex h-12 items-center justify-center rounded-full px-6 text-[11px] font-semibold uppercase tracking-[0.08em]"
              >
                View My Bookings
              </Link>
            )}
            <Link
              href="/venues"
              className="flex h-12 items-center justify-center rounded-full border border-white/[0.08] px-6 text-[11px] font-medium uppercase tracking-[0.08em] text-[#F7F7F7]/60 transition-colors hover:border-white/[0.15] hover:text-[#F7F7F7]/80"
            >
              Book Another Court
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
