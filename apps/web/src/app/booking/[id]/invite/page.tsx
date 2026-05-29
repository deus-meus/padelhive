"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
} from "lucide-react";

interface InvitedFriend {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: "invited" | "confirmed" | "pending";
}

const MOCK_FRIENDS: InvitedFriend[] = [
  {
    id: "f1",
    name: "Andi Saputra",
    email: "andi@email.com",
    avatar: "https://i.pravatar.cc/150?u=andi",
    status: "confirmed",
  },
  {
    id: "f2",
    name: "Budi Rahmat",
    email: "budi@email.com",
    avatar: "https://i.pravatar.cc/150?u=budi",
    status: "pending",
  },
  {
    id: "f3",
    name: "Clara Wijaya",
    email: "clara@email.com",
    avatar: "https://i.pravatar.cc/150?u=clara",
    status: "invited",
  },
];

const STATUS_CONFIG = {
  confirmed: {
    label: "Confirmed",
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
  invited: {
    label: "Invited",
    icon: Mail,
    color: "text-[#50C8C8]",
    bg: "bg-[#50C8C8]/10",
  },
};

export default function InviteFriendsPage({
  params,
}: {
  params: { id: string };
}) {
  const searchParams = useSearchParams();
  const [friends, setFriends] = useState<InvitedFriend[]>(MOCK_FRIENDS);
  const [copied, setCopied] = useState(false);
  const [emailInput, setEmailInput] = useState("");

  const inviteLink = `https://padelhive.com/join/${params.id}`;
  const venue = searchParams.get("venue") ?? "Padel Bali Arena";
  const date = searchParams.get("date") ?? "2026-05-29";
  const court = searchParams.get("court") ?? "Court A";
  const start = searchParams.get("start") ?? "10:00";
  const end = searchParams.get("end") ?? "11:00";
  const amount = searchParams.get("amount") ?? "300000";
  const venueId = searchParams.get("venueId") ?? "venue-1";

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

  function handleCopy() {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleAddFriend() {
    if (!emailInput.trim()) return;
    const newFriend: InvitedFriend = {
      id: `f${Date.now()}`,
      name: emailInput.split("@")[0],
      email: emailInput,
      avatar: `https://i.pravatar.cc/150?u=${emailInput}`,
      status: "invited",
    };
    setFriends([...friends, newFriend]);
    setEmailInput("");
  }

  const confirmedCount = friends.filter((f) => f.status === "confirmed").length;

  return (
    <div className="min-h-screen pt-20">
      <div className="container max-w-2xl py-8">
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
            Invite Friends
          </h1>
          <p className="mt-2 text-sm text-[#F7F7F7]/40">
            Share your booking and play together
          </p>
        </div>

        {/* Booking context */}
        <div className="mt-6 rounded-xl border border-white/[0.06] bg-[#0C1B26] p-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#F7F7F7]/50">
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
          <div className="mt-3 flex items-center gap-3">
            <div className="flex flex-1 items-center rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <span className="flex-1 truncate text-sm text-[#F7F7F7]/50">
                {inviteLink}
              </span>
            </div>
            <button
              onClick={handleCopy}
              className={`flex h-[46px] items-center gap-2 rounded-xl border px-5 transition-all ${
                copied
                  ? "border-green-400/30 bg-green-400/10 text-green-400"
                  : "border-white/[0.06] bg-[#0C1B26] text-[#F7F7F7]/60 hover:border-white/[0.12] hover:text-[#F7F7F7]"
              }`}
            >
              {copied ? (
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
              placeholder="friend@email.com"
              className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-[#F7F7F7] placeholder:text-[#F7F7F7]/20 focus:border-[#E6FA50]/30 focus:outline-none focus:ring-1 focus:ring-[#E6FA50]/20"
            />
            <button
              onClick={handleAddFriend}
              disabled={!emailInput.trim()}
              className="btn-lime flex h-[46px] items-center gap-2 rounded-xl px-5 text-[11px] font-semibold uppercase tracking-[0.08em] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Invite
            </button>
          </div>
        </div>

        {/* Friends List */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="heading-3 text-sm text-[#F7F7F7]/60 uppercase tracking-wider">
              <Users className="mr-2 inline h-3.5 w-3.5" />
              Invited Players ({friends.length})
            </h2>
            <span className="text-xs text-green-400/70">
              {confirmedCount} confirmed
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {friends.map((friend) => {
              const config = STATUS_CONFIG[friend.status];
              const StatusIcon = config.icon;
              return (
                <div
                  key={friend.id}
                  className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#0C1B26] p-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium text-[#F7F7F7]/80">
                        {friend.name}
                      </p>
                      <p className="text-[11px] text-[#F7F7F7]/30">
                        {friend.email}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 ${config.bg}`}
                  >
                    <StatusIcon className={`h-3.5 w-3.5 ${config.color}`} />
                    <span className={`text-[11px] font-medium ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                </div>
              );
            })}
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
          Friends can also join and pay their share after you complete the
          booking.
        </p>
      </div>
    </div>
  );
}
