"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  DollarSign,
  TrendingUp,
  CalendarDays,
  Users,
} from "lucide-react";
import { getRevenue } from "@/lib/api";
import { queryKeys } from "@/lib/queries";
import { ErrorBanner, EmptyState } from "@/components/ui/error-state";

type Period = "weekly" | "monthly";

export default function RevenuePage() {
  const [period, setPeriod] = useState<Period>("monthly");

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: queryKeys.dashboard.revenue(),
    queryFn: getRevenue,
  });

  if (isLoading) {
    return (
      <div className="py-8">
        <section className="container">
          {/* Header */}
          <div>
            <div className="h-8 w-48 animate-pulse rounded-md bg-white/[0.04]" />
            <div className="mt-2 h-4 w-64 animate-pulse rounded-md bg-white/[0.04]" />
          </div>

          {/* Revenue cards skeleton */}
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-[120px] animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]" />
            ))}
          </div>

          {/* Chart panel skeleton */}
          <div className="mt-8 h-[360px] animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]" />

          {/* Booking statistics skeleton */}
          <div className="mt-8">
            <div className="mb-5 h-5 w-32 animate-pulse rounded-md bg-white/[0.04]" />
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-[110px] animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]" />
              ))}
            </div>
          </div>

          {/* Top courts skeleton */}
          <div className="mt-8 h-[320px] animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]" />
        </section>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="py-8">
        <section className="container">
          {/* Header */}
          <div>
            <h1 className="heading-1 text-[#F7F7F7]">
              Revenue
            </h1>
            <p className="body mt-1 text-[#F7F7F7]/40">
              Financial overview and booking statistics
            </p>
          </div>
          <div className="mt-8">
            <ErrorBanner
              title="Couldn't load revenue"
              error={error}
              onRetry={() => refetch()}
              isRetrying={isFetching}
            />
          </div>
        </section>
      </div>
    );
  }

  if (data.kpis.totalBookings === 0) {
    return (
      <div className="py-8">
        <section className="container">
          {/* Header */}
          <div>
            <h1 className="heading-1 text-[#F7F7F7]">
              Revenue
            </h1>
            <p className="body mt-1 text-[#F7F7F7]/40">
              Financial overview and booking statistics
            </p>
          </div>
          <div className="mt-8">
            <EmptyState
              icon={TrendingUp}
              title="No revenue data yet"
              description="Once your venues start taking bookings, revenue analytics will show up here."
            />
          </div>
        </section>
      </div>
    );
  }

  const chartData = period === "monthly" ? data.monthlySeries : data.weeklySeries;
  const maxValue = Math.max(...chartData.map((d) => d.value), 1);
  const totalRevenuePeriod = chartData.reduce((sum, d) => sum + d.value, 0);
  const avgRevenuePeriod = chartData.length ? Math.round(totalRevenuePeriod / chartData.length) : 0;

  return (
    <div className="py-8">
      <section className="container">
        {/* Header */}
        <div>
          <h1 className="heading-1 text-[#F7F7F7]">
            Revenue
          </h1>
          <p className="body mt-1 text-[#F7F7F7]/40">
            Financial overview and booking statistics
          </p>
        </div>

        {/* Revenue cards */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <RevenueCard
            icon={DollarSign}
            label="Total Revenue"
            value={`Rp ${(totalRevenuePeriod / 1000000).toFixed(1)}M`}
          />
          <RevenueCard
            icon={TrendingUp}
            label="Avg. per Period"
            value={`Rp ${(avgRevenuePeriod / 1000000).toFixed(1)}M`}
          />
          <RevenueCard
            icon={CalendarDays}
            label="Total Bookings"
            value={data.kpis.totalBookings.toString()}
          />
          <RevenueCard
            icon={Users}
            label="Unique Players"
            value={data.kpis.uniquePlayers.toString()}
          />
        </div>

        {/* Revenue chart */}
        <div className="mt-8 rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 md:p-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="section-label">Revenue Overview</p>
              <p className="metric mt-3 text-[#F7F7F7]">
                Rp {(totalRevenuePeriod / 1000000).toFixed(1)}M
              </p>
              <p className="body-sm mt-1 text-[#F7F7F7]/25">
                {period === "monthly" ? "This year" : "This week"}
              </p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setPeriod("weekly")}
                className={`label rounded-lg px-3 py-1.5 uppercase transition-all ${
                  period === "weekly"
                    ? "bg-[#E6FA50]/10 text-[#E6FA50]"
                    : "bg-white/[0.03] text-[#F7F7F7]/25 hover:text-[#F7F7F7]/60"
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setPeriod("monthly")}
                className={`label rounded-lg px-3 py-1.5 uppercase transition-all ${
                  period === "monthly"
                    ? "bg-[#E6FA50]/10 text-[#E6FA50]"
                    : "bg-white/[0.03] text-[#F7F7F7]/25 hover:text-[#F7F7F7]/60"
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          {/* Bar chart */}
          <div className="mt-10 flex h-48 items-end gap-2">
            {chartData.map((d) => {
              const label = "month" in d ? d.month : d.day;
              return (
                <div key={label} className="flex flex-1 flex-col items-center gap-2">
                  <div className="relative w-full group">
                    <div
                      className="w-full rounded-md bg-[#E6FA50]/15 transition-all duration-200 hover:bg-[#E6FA50]/30"
                      style={{ height: `${(d.value / maxValue) * 180}px` }}
                    />
                    <div className="caption absolute -top-8 left-1/2 -translate-x-1/2 rounded-md bg-[#0C1B26] border border-white/[0.08] px-2 py-1 text-[#E6FA50] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      Rp {(d.value / 1000000).toFixed(1)}M
                    </div>
                  </div>
                  <span className="caption text-[#F7F7F7]/25">{label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Booking Statistics */}
        <div className="mt-8">
          <p className="section-label mb-5">Booking Statistics</p>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Total Bookings" value={data.kpis.totalBookings.toString()} />
            <StatCard label="Avg. Booking Value" value={`Rp ${(data.kpis.avgBookingValue / 1000).toFixed(0)}K`} />
            <StatCard label="Cancellation Rate" value={`${data.kpis.cancellationRate}%`} />
            <StatCard label="Repeat Customers" value={`${data.kpis.repeatCustomerRate}%`} />
          </div>
        </div>

        {/* Top performing courts */}
        {data.topCourts.length > 0 && (
          <div className="mt-8 rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 md:p-8">
            <p className="section-label mb-6">Top Performing Courts</p>
            <div className="space-y-0">
              {data.topCourts.map((court, i) => (
                <div
                  key={court.courtId}
                  className="flex items-center gap-4 border-b border-white/[0.03] py-4 last:border-0"
                >
                  <span className="metric w-6 text-center text-[#F7F7F7]/25">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="heading-3 text-[#F7F7F7]">
                      {court.name}
                    </p>
                    <p className="caption text-[#F7F7F7]/25">{court.venue}</p>
                  </div>
                  <div className="text-right">
                    <p className="body-sm text-[#F7F7F7]/60">
                      {court.bookings} bookings
                    </p>
                    <p className="caption text-[#50C8C8]">
                      Rp {(court.revenue / 1000000).toFixed(1)}M
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function RevenueCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5">
      <div className="flex items-center justify-between">
        <Icon className="h-4 w-4 text-[#50C8C8]" />
      </div>
      <p className="metric mt-3 text-[#F7F7F7]">{value}</p>
      <p className="caption mt-1 text-[#F7F7F7]/25">{label}</p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0C1B26] p-5">
      <p className="caption text-[#F7F7F7]/25">{label}</p>
      <p className="metric mt-2 text-[#F7F7F7]">{value}</p>
    </div>
  );
}
