"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Copy,
  Check,
  UserPlus,
  Mail,
  Clock,
  CheckCircle2,
  Share2,
  Users,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { ApiRequestError, createBookingInvite, getBookingInvites, type InviteSummary } from "@/lib/api";

const STATUS_CONFIG = {
  ACCEPTED: {
    label: "Accepted",
    icon: CheckCircle2,
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
  DECLINED: {
    label: "Declined",
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-400/10",
  },
  PENDING: {
    label: "Pending",
    icon: Clock,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
  INVITED: {
    label: "Invited",
    icon: Mail,
    color: "text-[#50C8C8]",
    bg: "bg-[#50C8C8]/10",
  },
};

function getInviteStatusConfig(status: InviteSummary["status"]) {
  return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.PENDING;
}

export default function InviteFriendsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: invites = [], isLoading, isError, error: queryError, refetch } = useQuery({
    queryKey: queryKeys.bookings.invites(params.id),
    queryFn: () => getBookingInvites(params.id),
  });

  const errorMessage = isError
    ? queryError instanceof ApiRequestError
      ? queryError.status === 401 || queryError.status === 403
        ? "Sign in with the booking owner account to manage invites."
        : queryError.status === 404
          ? "Booking was not found or does not belong to this account."
          : "Could not load invites. Please try again."
      : "Could not load invites. Please try again."
    : null;

  const venue = searchParams.get("venue") ?? "Padel Bali Arena";
  const date = searchParams.get("date") ?? "2026-05-29";
  const court = searchParams.get("court") ?? "Court A";
  const start = searchParams.get("start") ?? "10:00";
  const end = searchParams.get("end") ?? "11:00";
  const amount = searchParams.get("amount") ?? "300000";
  const venueId = searchParams.get("venueId") ?? "venue-1";

  const firstInviteLink = invites[0] ? buildInviteLink(invites[0].token) : "Add a friend to generate an invite link";
  const acceptedCount = invites.filter((invite) => invite.status === "ACCEPTED").length;

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

  function buildInviteLink(token: string) {
    if (typeof window === "undefined") return `/invites/${token}`;
    return `${window.location.origin}/invites/${token}`;
  }



  async function handleCopy(token?: string) {
    if (!token) return;
    await navigator.clipboard.writeText(buildInviteLink(token));
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  }

  const queryClient = useQueryClient();

  const inviteMutation = useMutation({
    mutationFn: (email: string) => createBookingInvite(params.id, { email }),
    onSuccess: (invite) => {
      queryClient.setQueryData(
        queryKeys.bookings.invites(params.id),
        (old: InviteSummary[] | undefined) => {
          if (!old) return [invite];
          const withoutDuplicate = old.filter((item) => item.id !== invite.id);
          return [...withoutDuplicate, invite];
        }
      );
      setEmailInput("");
      setSuccessMessage(`Invite ready for ${invite.email}.`);
      setSubmitError(null);
    },
    onError: (error) => {
      if (error instanceof ApiRequestError) {
        if (error.status === 400) {
          setSubmitError(error.message || "Enter a valid email for an invitable booking.");
        } else if (error.status === 401 || error.status === 403) {
          setSubmitError("Sign in with the booking owner account to invite friends.");
        } else if (error.status === 404) {
          setSubmitError("Booking was not found or does not belong to this account.");
        } else {
          setSubmitError("Could not create invite. Please try again.");
        }
      } else {
        setSubmitError("Could not create invite. Please try again.");
      }
    }
  });

  async function handleAddFriend() {
    const email = emailInput.trim();
    if (!email || inviteMutation.isPending) return;

    setSuccessMessage(null);
    setSubmitError(null);

    inviteMutation.mutate(email);
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="container max-w-2xl py-8">
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
            Invite Friends
          </h1>
          <p className="mt-2 text-sm text-[#F7F7F7]/40">
            Share your booking and play together
          </p>
        </div>

        {/* Booking context */}
        <div className="mt-6 rounded-xl border border-white/[0.06] bg-[#0C1B26] p-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#F7F7F7]/60">
            <span>{venue}</span>
            <span className="text-[#F7F7F7]/15">·</span>
            <span>{court}</span>
            <span className="text-[#F7F7F7]/15">·</span>
            <span>{formattedDate}</span>
            <span className="text-[#F7F7F7]/15">·</span>
            <span>{start} – {end}</span>
          </div>
        </div>

        {/* Invite Link */}
        <div className="mt-8">
          <h2 className="heading-3 text-sm text-[#F7F7F7]/60 uppercase tracking-wider">
            <Share2 className="mr-2 inline h-3.5 w-3.5" />
            Share Invite Link
          </h2>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-center rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <span className="flex-1 truncate text-sm text-[#F7F7F7]/60">
                {firstInviteLink}
              </span>
            </div>
            <button
              onClick={() => handleCopy(invites[0]?.token)}
              disabled={!invites[0]}
              className={`flex h-[46px] items-center justify-center gap-2 rounded-xl border px-5 transition-all disabled:cursor-not-allowed disabled:opacity-30 ${
                copiedToken === invites[0]?.token
                  ? "border-green-400/30 bg-green-400/10 text-green-400"
                  : "border-white/[0.06] bg-[#0C1B26] text-[#F7F7F7]/60 hover:border-white/[0.12] hover:text-[#F7F7F7]"
              }`}
            >
              {copiedToken === invites[0]?.token ? (
                <>
                  <Check className="h-4 w-4" />
                  <span className="text-sm">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span className="text-sm">Copy</span>
                </>
              )}
            </button>
          </div>
          <p className="mt-2 text-[11px] text-[#F7F7F7]/25">
            Invite links are generated after adding a friend. Each friend gets a unique RSVP token.
          </p>
        </div>

        {/* Add by email */}
        <div className="mt-8">
          <h2 className="heading-3 text-sm text-[#F7F7F7]/60 uppercase tracking-wider">
            <UserPlus className="mr-2 inline h-3.5 w-3.5" />
            Add by Email
          </h2>
          <div className="mt-3 flex items-center gap-3">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddFriend()}
              disabled={inviteMutation.isPending}
              placeholder="friend@email.com"
              className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-[#F7F7F7] placeholder:text-[#F7F7F7]/25 focus:border-[#E6FA50]/30 focus:outline-none focus:ring-1 focus:ring-[#E6FA50]/20 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button
              onClick={handleAddFriend}
              disabled={!emailInput.trim() || inviteMutation.isPending}
              className="btn-lime flex h-[46px] items-center gap-2 rounded-xl px-5 text-[11px] font-semibold uppercase tracking-[0.08em] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {inviteMutation.isPending ? "Inviting..." : "Invite"}
            </button>
          </div>

          {successMessage && (
            <div className="mt-3 rounded-xl border border-green-400/20 bg-green-400/10 p-3">
              <p className="text-[11px] leading-relaxed text-green-200/80">{successMessage}</p>
            </div>
          )}
          {submitError && (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
              <div className="flex-1">
                <p className="text-[11px] leading-relaxed text-red-200/80">{submitError}</p>
              </div>
            </div>
          )}
          {errorMessage && !isLoading && (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
              <div className="flex-1">
                <p className="text-[11px] leading-relaxed text-red-200/80">{errorMessage}</p>
                <button onClick={() => refetch()} className="mt-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-red-100/80 hover:text-red-100">
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Friends List */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="heading-3 text-sm text-[#F7F7F7]/60 uppercase tracking-wider">
              <Users className="mr-2 inline h-3.5 w-3.5" />
              Invited Players ({invites.length})
            </h2>
            <span className="text-xs text-green-400/70">
              {acceptedCount} accepted
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {isLoading ? (
              <div className="rounded-xl border border-white/[0.06] bg-[#0C1B26] p-5">
                <p className="text-sm text-[#F7F7F7]/60">Loading invites...</p>
              </div>
            ) : invites.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] p-6 text-center">
                <Mail className="mx-auto h-8 w-8 text-[#50C8C8]/60" />
                <h3 className="mt-3 text-sm font-medium text-[#F7F7F7]/60">No invites yet</h3>
                <p className="mt-1 text-[11px] leading-relaxed text-[#F7F7F7]/25">
                  Add a friend by email to generate RSVP link for this booking.
                </p>
              </div>
            ) : (
              invites.map((invite) => {
                const config = getInviteStatusConfig(invite.status);
                const StatusIcon = config.icon;
                const isCopied = copiedToken === invite.token;
                return (
                  <div
                    key={invite.id}
                    className="flex flex-col gap-4 rounded-xl border border-white/[0.06] bg-[#0C1B26] p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#50C8C8]/10 text-sm font-semibold uppercase text-[#50C8C8]">
                        {invite.name.slice(0, 1)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[#F7F7F7]/80">
                          {invite.name}
                        </p>
                        <p className="truncate text-[11px] text-[#F7F7F7]/25">
                          {invite.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 ${config.bg}`}>
                        <StatusIcon className={`h-3.5 w-3.5 ${config.color}`} />
                        <span className={`text-[11px] font-medium ${config.color}`}>
                          {config.label}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(invite.token)}
                        className="flex h-9 items-center gap-2 rounded-full border border-white/[0.06] px-3 text-[11px] font-medium text-[#F7F7F7]/60 transition-colors hover:border-white/[0.12] hover:text-[#F7F7F7]/80"
                      >
                        {isCopied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                        {isCopied ? "Copied" : "Copy Link"}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Continue */}
        <div className="mt-10">
          <Link
            href={`/booking/${params.id}/payment?venue=${encodeURIComponent(venue)}&court=${encodeURIComponent(court)}&date=${date}&start=${start}&end=${end}&amount=${amount}&venueId=${venueId}`}
            className="btn-lime flex h-12 w-full items-center justify-center rounded-full text-[11px] font-semibold uppercase tracking-[0.08em]"
          >
            Continue to Payment
          </Link>
        </div>

        <p className="mt-4 text-center text-[11px] text-[#F7F7F7]/25">
          Friends can RSVP from their invite link. Split payment backend is coming later.
        </p>
      </div>
    </div>
  );
}
