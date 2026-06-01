"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CalendarDays, CheckCircle2, Clock, CreditCard, MapPin } from "lucide-react";

function formatDate(value: string | null): string {
  if (!value) return "Confirmed booking";

  try {
    return new Date(value).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

function formatTime(value: string | null): string {
  if (!value) return "Confirmed time";

  try {
    return new Date(value).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

export default function BookingSuccessPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const venue = searchParams.get("venue") ?? "Confirmed venue";
  const court = searchParams.get("court") ?? "Confirmed court";
  const date = searchParams.get("date");
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const amount = Number(searchParams.get("amount") ?? 0);

  return (
    <div className="min-h-screen pt-20">
      <div className="container max-w-2xl py-12">
        <div className="rounded-3xl border border-white/[0.06] bg-[#0C1B26] p-6 text-center md:p-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#E6FA50]/10">
            <CheckCircle2 className="h-10 w-10 text-[#E6FA50]" />
          </div>

          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#E6FA50]">
            Booking Confirmed
          </p>
          <h1 className="heading-1 mt-3 text-2xl text-[#F7F7F7] md:text-4xl">
            Court secured for your match
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#F7F7F7]/45">
            Payment marked as paid in demo mode. No real money was processed and no payment provider was contacted.
          </p>

          <div className="mt-8 rounded-2xl border border-white/[0.06] bg-[#06121A] p-5 text-left">
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-[#F7F7F7]/35">Booking ID</p>
                <p className="mt-1 text-sm font-medium text-[#F7F7F7]/80">{params.id}</p>
              </div>
              <span className="rounded-full bg-[#E6FA50]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#E6FA50]">
                Confirmed
              </span>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-white/[0.03] p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-[#F7F7F7]/35">
                  <MapPin className="h-3.5 w-3.5" />
                  Venue
                </div>
                <p className="mt-2 text-sm font-medium text-[#F7F7F7]/80">{venue}</p>
                <p className="mt-1 text-xs text-[#F7F7F7]/35">{court}</p>
              </div>

              <div className="rounded-xl bg-white/[0.03] p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-[#F7F7F7]/35">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Date
                </div>
                <p className="mt-2 text-sm font-medium text-[#F7F7F7]/80">{formatDate(date)}</p>
              </div>

              <div className="rounded-xl bg-white/[0.03] p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-[#F7F7F7]/35">
                  <Clock className="h-3.5 w-3.5" />
                  Time
                </div>
                <p className="mt-2 text-sm font-medium text-[#F7F7F7]/80">
                  {formatTime(start)} – {formatTime(end)}
                </p>
              </div>

              <div className="rounded-xl bg-white/[0.03] p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-[#F7F7F7]/35">
                  <CreditCard className="h-3.5 w-3.5" />
                  Demo payment
                </div>
                <p className="mt-2 text-sm font-medium text-[#F7F7F7]/80">
                  {amount > 0 ? `Rp ${amount.toLocaleString("id-ID")}` : "Marked paid"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/profile/bookings"
              className="btn-lime flex h-12 items-center justify-center rounded-full px-6 text-[11px] font-semibold uppercase tracking-[0.08em]"
            >
              View My Bookings
            </Link>
            <Link
              href="/venues"
              className="flex h-12 items-center justify-center rounded-full border border-white/[0.08] px-6 text-[11px] font-medium uppercase tracking-[0.08em] text-[#F7F7F7]/50 transition-colors hover:border-white/[0.15] hover:text-[#F7F7F7]/70"
            >
              Book Another Court
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
