"use client";

import Link from "next/link";
import {
  DollarSign,
  CalendarDays,
  TrendingUp,
  Plus,
  Tag,
  Clock,
  Building2,
  ArrowRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getOwnerDashboard } from "@/lib/api";
import { queryKeys } from "@/lib/queries";
import { useAuthStore } from "@/stores/auth-store";
import { ErrorOverlay } from "@/components/ui/error-state";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: queryKeys.dashboard.owner(),
    queryFn: getOwnerDashboard,
  });

  if (isLoading) {
    return (
      <div className="pt-element pb-component container space-y-8">
        <div className="h-20 w-64 animate-pulse rounded bg-white/[0.04]" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-white/[0.04]" />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-2xl bg-white/[0.04]" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="pt-element pb-component container">
        <ErrorOverlay
          title="Couldn't load your dashboard"
          description="We couldn't reach the server to load your venue data. Check your connection and try again."
          onRetry={() => refetch()}
          isRetrying={isFetching}
        />
      </div>
    );
  }

  const {
    kpis,
    revenueSeries,
    courtUtilization,
    todaysSchedule,
    recentBookings,
  } = data;

  const maxRevenue = Math.max(...revenueSeries.map((d) => d.value), 1);
  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="pt-element pb-component">
      {/* ─── WELCOME ─── */}
      <section className="container pb-component">
        <p className="caption text-[#F7F7F7]/25">Good morning</p>
        <h1 className="heading-1 mt-2 text-3xl text-[#F7F7F7] md:text-4xl">
          Welcome back, <span className="text-[#E6FA50]">{firstName}</span>
        </h1>
        <p className="mt-3 text-sm font-light text-[#F7F7F7]/40">
          Your venues generated{" "}
          <span className="price text-[#50C8C8]">
            Rp {(kpis.weeklyRevenue / 1000).toFixed(0)}K
          </span>{" "}
          this week.
        </p>
      </section>

      {/* ─── KPIs ─── */}
      <section className="container pb-component">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <KPICard icon={DollarSign} label="Revenue" value={`Rp ${(kpis.weeklyRevenue / 1000).toFixed(0)}K`} />
          <KPICard icon={CalendarDays} label="Bookings" value={kpis.weeklyBookings.toString()} />
          <KPICard icon={TrendingUp} label="Occupancy" value={`${kpis.occupancyRate}%`} />
          <KPICard icon={Building2} label="Active Courts" value={kpis.activeCourts.toString()} />
          <KPICard icon={Clock} label="Pending Payments" value={kpis.pendingPayments.toString()} highlight />
        </div>
      </section>

      {/* ─── REVENUE + UTILIZATION ─── */}
      <section className="container pb-component">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr]">
          {/* Revenue chart */}
          <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="section-label">Revenue This Week</p>
                <p className="metric mt-3 text-3xl text-[#F7F7F7]">
                  Rp {(kpis.weeklyRevenue / 1000).toFixed(0)}K
                </p>
              </div>
              <div className="flex gap-1">
                <button className="rounded-lg bg-[#E6FA50]/10 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.1em] text-[#E6FA50]">
                  Weekly
                </button>
                <button className="rounded-lg bg-white/[0.03] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.1em] text-[#F7F7F7]/25">
                  Monthly
                </button>
              </div>
            </div>

            <div className="mt-10 flex h-40 items-end gap-2">
              {revenueSeries.map((d, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-md bg-[#E6FA50]/15 transition-colors duration-200 hover:bg-[#E6FA50]/30"
                    style={{ height: `${(d.value / maxRevenue) * 140}px` }}
                  />
                  <span className="caption text-[#F7F7F7]/25">{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Court utilization */}
          <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-8">
            <p className="section-label">Court Utilization</p>

            <div className="mt-8 space-y-5">
              {courtUtilization.slice(0, 5).map((court, i) => (
                <CourtBar key={i} name={court.name} percentage={court.occupancyRate} />
              ))}
              {courtUtilization.length === 0 && (
                <p className="text-sm text-[#F7F7F7]/40">No active courts.</p>
              )}
            </div>

            <div className="mt-8 border-t border-white/[0.04] pt-5">
              <p className="caption text-[#F7F7F7]/25">Average occupancy</p>
              <p className="metric mt-1 text-2xl text-[#E6FA50]">{kpis.occupancyRate}%</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TODAY'S SCHEDULE ─── */}
      <section className="container pb-component">
        <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-8">
          <div className="flex items-center justify-between mb-6">
            <p className="section-label">Today&apos;s Schedule</p>
            <span className="caption text-[#F7F7F7]/25">{todaysSchedule.length} bookings</span>
          </div>

          <div className="space-y-0">
            {todaysSchedule.length === 0 ? (
              <p className="text-sm text-[#F7F7F7]/40">No bookings today.</p>
            ) : (
              todaysSchedule.map((slot, i) => {
                const isConfirmed = slot.status === "CONFIRMED";
                return (
                  <div key={i} className="flex items-center gap-5 border-b border-white/[0.03] py-3.5 last:border-0">
                    <span className="metric w-12 shrink-0 text-base text-[#F7F7F7]/40">{slot.time}</span>
                    <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${isConfirmed ? "bg-[#E6FA50]" : "border-2 border-[#50C8C8] bg-transparent"}`} />
                    <div className="flex-1">
                      <p className="heading-3 text-sm text-[#F7F7F7]">{slot.player}</p>
                      <p className="caption text-[#F7F7F7]/25">{slot.court}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] ${isConfirmed ? "bg-[#E6FA50]/10 text-[#E6FA50]" : "bg-[#50C8C8]/10 text-[#50C8C8]"}`}>
                      {slot.status.replace(/_/g, " ")}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* ─── RECENT BOOKINGS ─── */}
      <section className="container pb-component">
        <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-8">
          <div className="flex items-center justify-between mb-6">
            <p className="section-label">Recent Bookings</p>
            <Link href="/dashboard/bookings" className="group flex items-center gap-1 caption text-[#F7F7F7]/25 transition-colors hover:text-[#E6FA50]">
              View all <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="space-y-2">
            {recentBookings.length === 0 ? (
              <p className="text-sm text-[#F7F7F7]/40">No recent bookings.</p>
            ) : (
              recentBookings.map((booking) => {
                const isConfirmed = booking.status === "CONFIRMED";
                const isPending = booking.status === "PENDING_PAYMENT";
                return (
                  <div key={booking.id} className="flex items-center gap-4 rounded-lg bg-white/[0.02] p-3.5 transition-colors hover:bg-white/[0.04]">
                    <div className="flex-1 min-w-0">
                      <p className="heading-3 truncate text-sm text-[#F7F7F7]">{booking.venueName}</p>
                      <p className="caption mt-0.5 text-[#F7F7F7]/25">{booking.courtName} · {booking.bookingDate} · {booking.time}</p>
                    </div>
                    <p className="price shrink-0 text-sm text-[#F7F7F7]/60">Rp {(booking.finalAmount / 1000).toFixed(0)}K</p>
                    <div className={`h-2 w-2 shrink-0 rounded-full ${isConfirmed ? "bg-[#E6FA50]" : isPending ? "bg-[#50C8C8]" : "bg-[#F7F7F7]/25"}`} />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* ─── QUICK ACTIONS ─── */}
      <section className="container pb-component">
        <p className="section-label mb-5">Quick Actions</p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <QuickAction icon={Plus} label="Add Court" href="/dashboard/courts" />
          <QuickAction icon={Tag} label="Create Promo" href="/dashboard/revenue" />
          <QuickAction icon={CalendarDays} label="Manage Schedule" href="/dashboard/hours" />
          <QuickAction icon={Building2} label="View Venues" href="/dashboard/venues" />
        </div>
      </section>
    </div>
  );
}

function KPICard({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-6 ${highlight ? "border-[#50C8C8]/20 bg-[#50C8C8]/5" : "border-white/[0.06] bg-[#0C1B26]"}`}>
      <div className="flex items-center justify-between">
        <Icon className="h-4 w-4 text-[#50C8C8]" />
      </div>
      <p className="metric mt-3 text-2xl text-[#F7F7F7]">{value}</p>
      <p className="caption mt-1 text-[#F7F7F7]/25">{label}</p>
    </div>
  );
}

function CourtBar({ name, percentage }: { name: string; percentage: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="label text-[#F7F7F7]/40">{name}</span>
        <span className="metric text-sm text-[#E6FA50]">{percentage}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.04]">
        <div className="h-full rounded-full bg-[#E6FA50]/70" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, href }: { icon: React.ComponentType<{ className?: string }>; label: string; href: string }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-3 rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 transition-all duration-200 hover:border-[#E6FA50]/20 hover:bg-[#E6FA50]/5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E6FA50]/10">
        <Icon className="h-4 w-4 text-[#E6FA50]" />
      </div>
      <span className="caption font-medium text-[#F7F7F7]/40">{label}</span>
    </Link>
  );
}
