"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  User,
  XCircle,
} from "lucide-react";
import { ApiRequestError, getInvite, rsvpInvite, type InviteDetails } from "@/lib/api";

type RsvpStatus = "ACCEPTED" | "DECLINED";

const STATUS_COPY: Record<RsvpStatus, { title: string; body: string; icon: typeof CheckCircle2; color: string; bg: string }> = {
  ACCEPTED: {
    title: "You’re in",
    body: "Your RSVP has been marked as accepted. Coordinate payment with your host for now.",
    icon: CheckCircle2,
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
  DECLINED: {
    title: "RSVP declined",
    body: "Your host will see that you can’t make this session.",
    icon: XCircle,
    color: "text-red-300",
    bg: "bg-red-400/10",
  },
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTimeRange(startsAt: string, endsAt: string) {
  const formatTime = (value: string) =>
    new Date(value).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  return `${formatTime(startsAt)} – ${formatTime(endsAt)}`;
}

export default function InviteRsvpPage({ params }: { params: { token: string } }) {
  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState<RsvpStatus | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedStatus, setSubmittedStatus] = useState<RsvpStatus | null>(null);

  const loadInvite = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const details = await getInvite(params.token);
      setInvite(details);
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 404) {
        setErrorMessage("This invite link is invalid or no longer available.");
      } else {
        setErrorMessage("Could not load this invite. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [params.token]);

  useEffect(() => {
    void loadInvite();
  }, [loadInvite]);

  async function handleRsvp(status: RsvpStatus) {
    if (isSubmitting) return;

    setIsSubmitting(status);
    setErrorMessage(null);

    try {
      const updatedInvite = await rsvpInvite(params.token, { status });
      setInvite((current) => current ? { ...current, ...updatedInvite } : current);
      setSubmittedStatus(status);
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 404) {
        setErrorMessage("This invite link is invalid or no longer available.");
      } else if (error instanceof ApiRequestError && error.status === 400) {
        setErrorMessage("Choose Accept or Decline to RSVP.");
      } else {
        setErrorMessage("Could not save your RSVP. Please try again.");
      }
    } finally {
      setIsSubmitting(null);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20">
        <div className="container flex min-h-[60vh] max-w-xl items-center justify-center py-12">
          <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-8 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#E6FA50]" />
            <p className="mt-4 text-sm text-[#F7F7F7]/50">Loading invite...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="min-h-screen pt-20">
        <div className="container flex min-h-[60vh] max-w-xl items-center justify-center py-12">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center">
            <AlertCircle className="mx-auto h-10 w-10 text-red-300" />
            <h1 className="heading-1 mt-5 text-2xl text-[#F7F7F7]">Invite unavailable</h1>
            <p className="mt-3 text-sm leading-relaxed text-red-100/70">
              {errorMessage ?? "This invite link is invalid or no longer available."}
            </p>
            <button
              onClick={loadInvite}
              className="mt-6 rounded-full border border-white/[0.08] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#F7F7F7]/70 hover:border-white/[0.15] hover:text-[#F7F7F7]"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const resultCopy = submittedStatus ? STATUS_COPY[submittedStatus] : null;
  const ResultIcon = resultCopy?.icon;

  return (
    <div className="min-h-screen pt-20">
      <div className="container max-w-2xl py-8">
        <Link
          href="/venues"
          className="inline-flex items-center gap-2 text-sm text-[#F7F7F7]/40 transition-colors hover:text-[#F7F7F7]/70"
        >
          <ArrowLeft className="h-4 w-4" />
          Browse venues
        </Link>

        <div className="mt-8 rounded-3xl border border-white/[0.06] bg-[#0C1B26] p-6 shadow-2xl shadow-black/20 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#50C8C8]">Padelhive Invite</p>
              <h1 className="heading-1 mt-3 text-2xl text-[#F7F7F7] md:text-3xl">
                Join {invite.booking.host.name ?? "your host"} for padel
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-[#F7F7F7]/45">
                RSVP for this court booking. No login or payment required.
              </p>
            </div>
            <div className="rounded-full bg-[#E6FA50]/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#E6FA50]">
              {invite.status}
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h2 className="heading-3 text-sm uppercase tracking-wider text-[#F7F7F7]/60">Booking Details</h2>
            <div className="mt-4 space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-[#50C8C8]" />
                <div>
                  <p className="text-sm font-medium text-[#F7F7F7]/80">{invite.booking.venue.name}</p>
                  <p className="text-[11px] text-[#F7F7F7]/35">{invite.booking.venue.city}</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/[0.06] bg-[#06121A]/40 p-4">
                  <p className="text-[11px] uppercase tracking-[0.08em] text-[#F7F7F7]/30">Court</p>
                  <p className="mt-1 text-sm font-medium text-[#F7F7F7]/80">{invite.booking.court.name}</p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-[#06121A]/40 p-4">
                  <p className="text-[11px] uppercase tracking-[0.08em] text-[#F7F7F7]/30">Time</p>
                  <p className="mt-1 text-sm font-medium text-[#F7F7F7]/80">{formatTimeRange(invite.booking.startsAt, invite.booking.endsAt)}</p>
                </div>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-[#06121A]/40 p-4">
                <div className="flex items-center gap-2 text-[#F7F7F7]/80">
                  <Clock className="h-4 w-4 text-[#E6FA50]" />
                  <span className="text-sm font-medium">{formatDate(invite.booking.bookingDate)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h2 className="heading-3 text-sm uppercase tracking-wider text-[#F7F7F7]/60">Invite</h2>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#50C8C8]/10 text-[#50C8C8]">
                <User className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#F7F7F7]/80">{invite.name}</p>
                <p className="text-[11px] text-[#F7F7F7]/35">{invite.email}</p>
              </div>
            </div>
          </div>

          {resultCopy && ResultIcon ? (
            <div className={`mt-6 rounded-2xl border border-white/[0.06] ${resultCopy.bg} p-5 text-center`}>
              <ResultIcon className={`mx-auto h-10 w-10 ${resultCopy.color}`} />
              <h2 className="heading-2 mt-4 text-xl text-[#F7F7F7]">{resultCopy.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#F7F7F7]/50">{resultCopy.body}</p>
            </div>
          ) : (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => handleRsvp("ACCEPTED")}
                disabled={Boolean(isSubmitting)}
                className="btn-lime flex h-12 items-center justify-center rounded-full text-[11px] font-semibold uppercase tracking-[0.08em] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSubmitting === "ACCEPTED" ? "Saving..." : "Accept Invite"}
              </button>
              <button
                onClick={() => handleRsvp("DECLINED")}
                disabled={Boolean(isSubmitting)}
                className="flex h-12 items-center justify-center rounded-full border border-white/[0.08] text-[11px] font-semibold uppercase tracking-[0.08em] text-[#F7F7F7]/60 transition-colors hover:border-red-300/30 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSubmitting === "DECLINED" ? "Saving..." : "Decline"}
              </button>
            </div>
          )}

          {errorMessage && invite && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
              <p className="text-[11px] leading-relaxed text-red-200/80">{errorMessage}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
