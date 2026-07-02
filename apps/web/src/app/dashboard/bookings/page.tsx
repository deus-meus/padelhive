"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  Search,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { getAdminBookings } from "@/lib/api";
import { ErrorBanner } from "@/components/ui/error-state";

type TabKey = "upcoming" | "completed" | "cancelled";

const TABS: { key: TabKey; label: string }[] = [
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];


const STATUS_CONFIG = {
  confirmed: { label: "Confirmed", icon: CheckCircle2, color: "text-green-400", bg: "bg-green-400/10" },
  pending: { label: "Pending", icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10" },
  completed: { label: "Completed", icon: CheckCircle2, color: "text-[#50C8C8]", bg: "bg-[#50C8C8]/10" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "text-red-400", bg: "bg-red-400/10" },
  expired: { label: "Expired", icon: XCircle, color: "text-[#F7F7F7]/25", bg: "bg-white/[0.03]" },
};


const PAYMENT_CONFIG = {
  paid: { label: "Paid", color: "text-green-400", bg: "bg-green-400/10" },
  pending: { label: "Unpaid", color: "text-yellow-400", bg: "bg-yellow-400/10" },
  refunded: { label: "Refunded", color: "text-[#50C8C8]", bg: "bg-[#50C8C8]/10" },
};


export default function BookingsManagementPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("upcoming");
  const [search, setSearch] = useState("");

  const { data: bookingsData, isLoading, isError } = useQuery({
    queryKey: queryKeys.admin.bookings({}),
    queryFn: () => getAdminBookings(),
  });

  const allBookings = bookingsData?.items ?? [];

  const filteredBookings = allBookings.filter((b) => {
    const s = b.status.toLowerCase();
    if (activeTab === "upcoming") return s === "confirmed" || s === "pending_payment" || s === "pending";
    if (activeTab === "completed") return s === "completed";
    if (activeTab === "cancelled") return s === "cancelled" || s === "refunded" || s === "pending_refund";
    return true;
  }).filter((b) => {
    if (!search) return true;
    const courtName = b.court?.name?.toLowerCase() || "";
    const venueName = b.venue?.name?.toLowerCase() || "";
    const playerName = (b.host?.name || b.host?.email || "").toLowerCase();
    const searchLower = search.toLowerCase();
    return (
      courtName.includes(searchLower) ||
      venueName.includes(searchLower) ||
      playerName.includes(searchLower)
    );
  });

  const upcomingCount = allBookings.filter((b) => {
    const s = b.status.toLowerCase();
    return s === "confirmed" || s === "pending_payment" || s === "pending";
  }).length;
  const completedCount = allBookings.filter((b) => b.status.toLowerCase() === "completed").length;
  const cancelledCount = allBookings.filter((b) => {
    const s = b.status.toLowerCase();
    return s === "cancelled" || s === "refunded" || s === "pending_refund";
  }).length;

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
          <h1 className="heading-1 text-[#F7F7F7]">
            Bookings
          </h1>
          <p className="body mt-1 text-[#F7F7F7]/40">
            Manage all court reservations
          </p>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex items-center gap-1 rounded-xl bg-white/[0.02] p-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`label flex items-center gap-2 rounded-lg px-4 py-2.5 transition-all ${
                activeTab === tab.key
                  ? "bg-[#E6FA50]/10 text-[#E6FA50]"
                  : "text-[#F7F7F7]/40 hover:text-[#F7F7F7]/60"
              }`}
            >
              {tab.label}
              <span
                className={`caption rounded-full px-2 py-0.5 ${
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
            className="body w-full bg-transparent text-[#F7F7F7] outline-none placeholder:text-[#F7F7F7]/25"
          />
        </div>

        {isError && (
          <div className="mt-5">
            <ErrorBanner
              title="Couldn't load bookings"
              description="An error occurred while fetching your bookings. Please try again later."
            />
          </div>
        )}

        {isLoading && !isError && (
          <div className="mt-6 text-[#F7F7F7]/40 body-sm">
            Loading bookings...
          </div>
        )}

        {/* Bookings list */}
        <div className="mt-6 space-y-3">
          {!isLoading && !isError && filteredBookings.map((booking) => {
            const court = booking.court;
            const venue = booking.venue;
            const player = booking.host?.name || booking.host?.email || "Unknown Player";
            
            // Map API status to config keys
            let mappedStatus = booking.status.toLowerCase();
            if (mappedStatus === "pending_payment") mappedStatus = "pending";
            if (mappedStatus === "pending_refund") mappedStatus = "cancelled";
            if (mappedStatus === "refunded") mappedStatus = "cancelled";
            const config = STATUS_CONFIG[mappedStatus as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
            const StatusIcon = config.icon;

            return (
              <div
                key={booking.id}
                className="rounded-xl border border-white/[0.06] bg-[#0C1B26] p-5 transition-all hover:border-white/[0.1]"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="heading-3 text-[#F7F7F7]">
                        {player}
                      </p>
                      <div className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 ${config.bg}`}>
                        <StatusIcon className={`h-3 w-3 ${config.color}`} />
                        <span className={`caption ${config.color}`}>
                          {config.label}
                        </span>
                      </div>
                      {(() => {
                        const payStatus = booking.payment?.status?.toLowerCase() || "pending";
                        const payConfig = PAYMENT_CONFIG[payStatus as keyof typeof PAYMENT_CONFIG] || PAYMENT_CONFIG.pending;
                        return (
                          <span className={`caption rounded-full px-2.5 py-0.5 ${payConfig.bg} ${payConfig.color}`}>
                            {payConfig.label}
                          </span>
                        );
                      })()}
                    </div>
                    <div className="caption mt-2 flex flex-wrap items-center gap-3 text-[#F7F7F7]/25">
                      <span>{venue?.name}</span>
                      <span className="text-[#F7F7F7]/10">·</span>
                      <span>{court?.name}</span>
                      <span className="text-[#F7F7F7]/10">·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {booking.bookingDate}
                      </span>
                      <span className="text-[#F7F7F7]/10">·</span>
                      <span>{booking.startsAt?.substring(0, 5)} – {booking.endsAt?.substring(0, 5)}</span>
                    </div>
                  </div>
                  <p className="price shrink-0 text-[#F7F7F7]/60">
                    Rp {(booking.finalAmount / 1000).toFixed(0)}K
                  </p>
                </div>
              </div>
            );
          })}

          {!isLoading && !isError && filteredBookings.length === 0 && (
            <div className="rounded-xl border border-dashed border-white/[0.08] p-12 text-center">
              <p className="body text-[#F7F7F7]/25">
                No {activeTab} bookings found.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
