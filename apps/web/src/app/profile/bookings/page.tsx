"use client";

import Link from "next/link";
import { useState } from "react";
import { MapPin, Clock, Users, Share2, CalendarDays, Trophy, Timer, ArrowRight } from "lucide-react";
import { mockBookings } from "@/mock/bookings";
import { mockVenues } from "@/mock/venues";
import { mockCourts } from "@/mock/courts";
import { PlayerAvatarStack } from "@/components/ui/player-avatar-stack";
import { padelImg } from "@/lib/images";

const IMG = {
  venue1: padelImg(600),
  venue2: padelImg(600),
  venue3: padelImg(600),
};

type TabKey = "upcoming" | "past" | "cancelled";

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("upcoming");

  const upcoming = mockBookings.filter((b) => b.status === "confirmed" || b.status === "pending");
  const past = mockBookings.filter((b) => b.status === "completed");
  const cancelled = mockBookings.filter((b) => b.status === "cancelled");

  const tabData: Record<TabKey, typeof mockBookings> = {
    upcoming,
    past,
    cancelled,
  };

  const nextBooking = upcoming[0];
  const nextVenue = nextBooking ? mockVenues.find((v) => v.id === nextBooking.venueId) : null;
  const nextCourt = nextBooking ? mockCourts.find((c) => c.id === nextBooking.courtId) : null;

  const totalBookings = mockBookings.length;
  const hoursPlayed = mockBookings.filter((b) => b.status === "completed").length;

  return (
    <div className="min-h-screen pt-28">
      {/* ─── PAGE HEADER ─── */}
      <section className="container pb-8">
        <h1 className="heading-1 text-3xl text-[#F7F7F7] md:text-4xl">
          My <span className="text-[#E6FA50]">Bookings</span>
        </h1>
        <p className="mt-2 text-sm font-light text-[#F7F7F7]/40">
          Manage your upcoming matches and booking history.
        </p>
      </section>

      {/* ─── YOUR NEXT MATCH ─── */}
      {nextBooking && nextVenue && nextCourt && (
        <section className="container pb-10">
          <span className="section-label">Your Next Match</span>

          <div className="mt-5 grid grid-cols-1 overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0C1B26] lg:grid-cols-[1.85fr_1fr]">
            {/* Content — left, dominant */}
            <div className="flex flex-col justify-center p-7 md:p-9">
              <div className="flex items-center gap-3">
                <span className="inline-block rounded-full bg-[#E6FA50]/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-[#E6FA50]">
                  {nextBooking.status}
                </span>
                <span className="caption text-[#F7F7F7]/25">In 2 days</span>
              </div>

              <h2 className="heading-1 mt-4 text-2xl text-[#F7F7F7] md:text-3xl">
                {nextVenue.name}
              </h2>

              <p className="mt-2 flex items-center gap-2 text-sm text-[#F7F7F7]/40">
                <MapPin className="h-3.5 w-3.5" />
                {nextVenue.location} · {nextVenue.city}
              </p>

              {/* Detail cards */}
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <DetailChip icon={CalendarDays} label="Date" value={nextBooking.bookingDate} />
                <DetailChip icon={Clock} label="Time" value={`${nextBooking.startTime} – ${nextBooking.endTime}`} />
                <DetailChip icon={MapPin} label="Court" value={`${nextCourt.name} · ${nextCourt.type}`} />
                <DetailChip icon={Timer} label="Price" value={`Rp ${(nextBooking.totalAmount / 1000).toFixed(0)}K`} />
              </div>

              {/* Players */}
              <div className="mt-5">
                <PlayerAvatarStack
                  players={[
                    { id: "u1", name: "Andi Pratama", avatarUrl: "https://i.pravatar.cc/150?img=11" },
                    { id: "u2", name: "Sari Dewi", avatarUrl: "https://i.pravatar.cc/150?img=32" },
                  ]}
                  totalSpots={4}
                  size={32}
                />
              </div>

              {/* CTAs */}
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/booking/${nextBooking.id}/invite`}
                  className="btn-lime inline-flex h-10 items-center gap-2 rounded-full px-6 text-[11px] font-semibold uppercase tracking-[0.08em]"
                >
                  <Users className="h-3.5 w-3.5" />
                  Invite Friends
                </Link>
                <button className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 px-6 text-[11px] font-medium uppercase tracking-[0.08em] text-[#F7F7F7]/50 transition-colors hover:border-white/20 hover:text-[#F7F7F7]">
                  <Share2 className="h-3.5 w-3.5" />
                  Share Match
                </button>
              </div>
            </div>

            {/* Image — right, secondary */}
            <div className="relative hidden overflow-hidden lg:block">
              <img
                src={IMG.venue1}
                alt={nextVenue.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </div>
        </section>
      )}

      {/* ─── STATS ─── */}
      <section className="container pb-10">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard icon={CalendarDays} value={totalBookings.toString()} label="Total Bookings" />
          <StatCard icon={Timer} value={`${hoursPlayed}h`} label="Hours Played" />
          <StatCard icon={Trophy} value="12" label="Matches Joined" />
          <StatCard icon={Users} value="8" label="Friends Invited" />
        </div>
      </section>

      {/* ─── TABS ─── */}
      <section className="container pb-section-sm">
        <div className="flex gap-1 border-b border-white/[0.06] mb-8">
          {(["upcoming", "past", "cancelled"] as TabKey[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-5 py-3 text-[11px] font-medium uppercase tracking-[0.1em] transition-colors ${
                activeTab === tab
                  ? "text-[#E6FA50]"
                  : "text-[#F7F7F7]/30 hover:text-[#F7F7F7]/60"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E6FA50]" />
              )}
            </button>
          ))}
        </div>

        {/* Booking list */}
        <div className="space-y-3">
          {tabData[activeTab].length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-[#F7F7F7]/30">No {activeTab} bookings.</p>
            </div>
          ) : (
            tabData[activeTab].map((booking, i) => (
              <BookingRow
                key={booking.id}
                booking={booking}
                index={i}
                muted={activeTab !== "upcoming"}
              />
            ))
          )}
        </div>
      </section>

      {/* ─── COMMUNITY ─── */}
      <section className="border-t border-white/[0.04] py-section-sm">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="heading-1 text-xl text-[#F7F7F7]">Community</h2>
            <Link href="#" className="group flex items-center gap-2 label text-[#F7F7F7]/30 transition-colors hover:text-[#E6FA50]">
              View all
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <ActivityCard type="match" title="Open Match — Padel Bali Arena" subtitle="Tomorrow · 18:00 · 2 spots left" />
            <ActivityCard type="friend" title="Andi joined your session" subtitle="Jakarta Padel Club · Sat, 31 May" />
            <ActivityCard type="session" title="New session near you" subtitle="Surabaya Padel Center · Sun, 1 Jun" />
          </div>
        </div>
      </section>
    </div>
  );
}

function DetailChip({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-white/[0.03] p-3">
      <Icon className="h-3.5 w-3.5 text-[#50C8C8]" />
      <p className="heading-3 mt-1.5 text-[13px] text-[#F7F7F7]">{value}</p>
      <p className="caption mt-0.5 text-[#F7F7F7]/20">{label}</p>
    </div>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5">
      <Icon className="h-4 w-4 text-[#50C8C8]" />
      <p className="metric mt-3 text-2xl text-[#E6FA50]">{value}</p>
      <p className="caption mt-1 text-[#F7F7F7]/30">{label}</p>
    </div>
  );
}

function BookingRow({
  booking,
  index,
  muted = false,
}: {
  booking: (typeof mockBookings)[0];
  index: number;
  muted?: boolean;
}) {
  const court = mockCourts.find((c) => c.id === booking.courtId);
  const venue = mockVenues.find((v) => v.id === booking.venueId);
  const images = [IMG.venue1, IMG.venue2, IMG.venue3];

  return (
    <Link href={`/booking/${booking.id}/payment`} className="group block">
      <div className={`flex items-center gap-4 rounded-xl border p-4 transition-all duration-200 ${
        muted
          ? "border-white/[0.03] bg-white/[0.01] group-hover:border-white/[0.06]"
          : "border-white/[0.06] bg-[#0C1B26] group-hover:border-[#E6FA50]/15"
      }`}>
        <div className="hidden h-12 w-12 shrink-0 overflow-hidden rounded-lg sm:block">
          <img src={images[index % images.length]} alt={venue?.name ?? ""} className="h-full w-full object-cover" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`heading-3 truncate text-sm ${muted ? "text-[#F7F7F7]/40" : "text-[#F7F7F7]"}`}>
              {venue?.name ?? "Unknown Venue"}
            </h3>
            <StatusPill status={booking.status} />
          </div>
          <p className={`mt-1 flex items-center gap-3 caption ${muted ? "text-[#F7F7F7]/20" : "text-[#F7F7F7]/35"}`}>
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{court?.name}</span>
            <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{booking.bookingDate}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{booking.startTime}–{booking.endTime}</span>
          </p>
        </div>

        <p className={`shrink-0 price text-base ${muted ? "text-[#F7F7F7]/20" : "text-[#F7F7F7]"}`}>
          Rp {(booking.totalAmount / 1000).toFixed(0)}K
        </p>
      </div>
    </Link>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    confirmed: "bg-[#E6FA50]/10 text-[#E6FA50]",
    pending: "bg-[#50C8C8]/10 text-[#50C8C8]",
    completed: "bg-white/[0.04] text-[#F7F7F7]/30",
    cancelled: "bg-red-500/10 text-red-400/70",
  };

  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] ${styles[status] ?? "bg-white/5 text-[#F7F7F7]/30"}`}>
      {status}
    </span>
  );
}

function ActivityCard({ type, title, subtitle }: { type: "match" | "friend" | "session"; title: string; subtitle: string }) {
  const icons = { match: Trophy, friend: Users, session: CalendarDays };
  const Icon = icons[type];

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0C1B26] p-5 transition-all duration-200 hover:border-[#E6FA50]/15">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E6FA50]/10">
        <Icon className="h-4 w-4 text-[#E6FA50]" />
      </div>
      <h4 className="heading-3 mt-4 text-sm text-[#F7F7F7]">{title}</h4>
      <p className="caption mt-1 text-[#F7F7F7]/30">{subtitle}</p>
    </div>
  );
}
