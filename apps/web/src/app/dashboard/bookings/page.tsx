"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  Search,
} from "lucide-react";
import { mockBookings } from "@/mock/bookings";
import { mockCourts } from "@/mock/courts";
import { mockVenues } from "@/mock/venues";

type TabKey = "upcoming" | "completed" | "cancelled";

const TABS: { key: TabKey; label: string }[] = [
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const MOCK_OWNER_BOOKINGS = [
  ...mockBookings,
  {
    id: "booking-5",
    userId: "user-1",
    courtId: "court-1",
    venueId: "venue-1",
    bookingDate: "2026-06-01",
    startTime: "09:00",
    endTime: "10:00",
    status: "confirmed" as const,
    totalAmount: 300000,
    createdAt: "2026-05-28T10:00:00Z",
  },
  {
    id: "booking-6",
    userId: "user-2",
    courtId: "court-2",
    venueId: "venue-1",
    bookingDate: "2026-06-01",
    startTime: "14:00",
    endTime: "15:00",
    status: "confirmed" as const,
    totalAmount: 200000,
    createdAt: "2026-05-28T12:00:00Z",
  },
  {
    id: "booking-7",
    userId: "user-1",
    courtId: "court-3",
    venueId: "venue-2",
    bookingDate: "2026-06-02",
    startTime: "18:00",
    endTime: "19:00",
    status: "pending" as const,
    totalAmount: 400000,
    createdAt: "2026-05-29T08:00:00Z",
  },
  {
    id: "booking-8",
    userId: "user-2",
    courtId: "court-1",
    venueId: "venue-1",
    bookingDate: "2026-05-20",
    startTime: "10:00",
    endTime: "11:00",
    status: "completed" as const,
    totalAmount: 300000,
    createdAt: "2026-05-19T09:00:00Z",
  },
  {
    id: "booking-9",
    userId: "user-1",
    courtId: "court-4",
    venueId: "venue-2",
    bookingDate: "2026-05-18",
    startTime: "16:00",
    endTime: "17:00",
    status: "cancelled" as const,
    totalAmount: 500000,
    createdAt: "2026-05-17T14:00:00Z",
  },
];

const STATUS_CONFIG = {
  confirmed: { label: "Confirmed", icon: CheckCircle2, color: "text-green-400", bg: "bg-green-400/10" },
  pending: { label: "Pending", icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10" },
  completed: { label: "Completed", icon: CheckCircle2, color: "text-[#50C8C8]", bg: "bg-[#50C8C8]/10" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "text-red-400", bg: "bg-red-400/10" },
  expired: { label: "Expired", icon: XCircle, color: "text-[#F7F7F7]/30", bg: "bg-white/[0.03]" },
};

const PAYMENT_STATUS: Record<string, "paid" | "pending" | "refunded"> = {
  "booking-1": "paid",
  "booking-2": "paid",
  "booking-3": "pending",
  "booking-4": "refunded",
  "booking-5": "paid",
  "booking-6": "pending",
  "booking-7": "pending",
  "booking-8": "paid",
  "booking-9": "refunded",
};

const PAYMENT_CONFIG = {
  paid: { label: "Paid", color: "text-green-400", bg: "bg-green-400/10" },
  pending: { label: "Unpaid", color: "text-yellow-400", bg: "bg-yellow-400/10" },
  refunded: { label: "Refunded", color: "text-[#50C8C8]", bg: "bg-[#50C8C8]/10" },
};

const PLAYER_NAMES: Record<string, string> = {
  "user-1": "Andi Saputra",
  "user-2": "Budi Rahmat",
  "user-3": "Clara Wijaya",
};

export default function BookingsManagementPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("upcoming");
  const [search, setSearch] = useState("");

  const filteredBookings = MOCK_OWNER_BOOKINGS.filter((b) => {
    if (activeTab === "upcoming") return b.status === "confirmed" || b.status === "pending";
    if (activeTab === "completed") return b.status === "completed";
    if (activeTab === "cancelled") return b.status === "cancelled";
    return true;
  }).filter((b) => {
    if (!search) return true;
    const court = mockCourts.find((c) => c.id === b.courtId);
    const venue = mockVenues.find((v) => v.id === b.venueId);
    const player = PLAYER_NAMES[b.userId] ?? "";
    const searchLower = search.toLowerCase();
    return (
      court?.name.toLowerCase().includes(searchLower) ||
      venue?.name.toLowerCase().includes(searchLower) ||
      player.toLowerCase().includes(searchLower)
    );
  });

  const upcomingCount = MOCK_OWNER_BOOKINGS.filter(
    (b) => b.status === "confirmed" || b.status === "pending"
  ).length;
  const completedCount = MOCK_OWNER_BOOKINGS.filter((b) => b.status === "completed").length;
  const cancelledCount = MOCK_OWNER_BOOKINGS.filter((b) => b.status === "cancelled").length;

  const tabCounts: Record<TabKey, number> = {
    upcoming: upcomingCount,
    completed: completedCount,
    cancelled: cancelledCount,
  };

  return (
    <div className="py-8">
      <section className="container">
        {/* Header */}
        <div>
          <h1 className="heading-1 text-2xl text-[#F7F7F7] md:text-3xl">
            Bookings
          </h1>
          <p className="mt-1 text-sm text-[#F7F7F7]/40">
            Manage all court reservations
          </p>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex items-center gap-1 rounded-xl bg-white/[0.02] p-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-all ${
                activeTab === tab.key
                  ? "bg-[#E6FA50]/10 font-medium text-[#E6FA50]"
                  : "text-[#F7F7F7]/40 hover:text-[#F7F7F7]/60"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] ${
                  activeTab === tab.key
                    ? "bg-[#E6FA50]/20 text-[#E6FA50]"
                    : "bg-white/[0.04] text-[#F7F7F7]/25"
                }`}
              >
                {tabCounts[tab.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mt-5 flex items-center gap-3 rounded-xl bg-white/[0.03] px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-[#F7F7F7]/25" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by player, court, or venue..."
            className="w-full bg-transparent text-sm font-light text-[#F7F7F7] outline-none placeholder:text-[#F7F7F7]/25"
          />
        </div>

        {/* Bookings list */}
        <div className="mt-6 space-y-3">
          {filteredBookings.map((booking) => {
            const court = mockCourts.find((c) => c.id === booking.courtId);
            const venue = mockVenues.find((v) => v.id === booking.venueId);
            const player = PLAYER_NAMES[booking.userId] ?? "Unknown Player";
            const config = STATUS_CONFIG[booking.status];
            const StatusIcon = config.icon;

            return (
              <div
                key={booking.id}
                className="rounded-xl border border-white/[0.06] bg-[#0C1B26] p-5 transition-all hover:border-white/[0.1]"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="heading-3 text-sm text-[#F7F7F7]">
                        {player}
                      </p>
                      <div className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 ${config.bg}`}>
                        <StatusIcon className={`h-3 w-3 ${config.color}`} />
                        <span className={`text-[10px] font-medium ${config.color}`}>
                          {config.label}
                        </span>
                      </div>
                      {(() => {
                        const payStatus = PAYMENT_STATUS[booking.id] ?? "pending";
                        const payConfig = PAYMENT_CONFIG[payStatus];
                        return (
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${payConfig.bg} ${payConfig.color}`}>
                            {payConfig.label}
                          </span>
                        );
                      })()}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#F7F7F7]/30">
                      <span>{venue?.name}</span>
                      <span className="text-[#F7F7F7]/10">·</span>
                      <span>{court?.name}</span>
                      <span className="text-[#F7F7F7]/10">·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {booking.bookingDate}
                      </span>
                      <span className="text-[#F7F7F7]/10">·</span>
                      <span>{booking.startTime} – {booking.endTime}</span>
                    </div>
                  </div>
                  <p className="price shrink-0 text-base text-[#F7F7F7]/60">
                    Rp {(booking.totalAmount / 1000).toFixed(0)}K
                  </p>
                </div>
              </div>
            );
          })}

          {filteredBookings.length === 0 && (
            <div className="rounded-xl border border-dashed border-white/[0.08] p-12 text-center">
              <p className="text-sm text-[#F7F7F7]/30">
                No {activeTab} bookings found.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
