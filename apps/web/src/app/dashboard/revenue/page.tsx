"use client";

import { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  Users,
} from "lucide-react";

const MONTHLY_REVENUE = [
  { month: "Jan", value: 8200000 },
  { month: "Feb", value: 9100000 },
  { month: "Mar", value: 7800000 },
  { month: "Apr", value: 11500000 },
  { month: "May", value: 13200000 },
  { month: "Jun", value: 10800000 },
  { month: "Jul", value: 14500000 },
  { month: "Aug", value: 12900000 },
  { month: "Sep", value: 15800000 },
  { month: "Oct", value: 16200000 },
  { month: "Nov", value: 14100000 },
  { month: "Dec", value: 18500000 },
];

const WEEKLY_REVENUE = [
  { day: "Mon", value: 1850000 },
  { day: "Tue", value: 1420000 },
  { day: "Wed", value: 2100000 },
  { day: "Thu", value: 1680000 },
  { day: "Fri", value: 2850000 },
  { day: "Sat", value: 3900000 },
  { day: "Sun", value: 3200000 },
];

const BOOKING_STATS = [
  { label: "Total Bookings", value: "342", trend: "+18%", up: true },
  { label: "Avg. Booking Value", value: "Rp 320K", trend: "+5%", up: true },
  { label: "Cancellation Rate", value: "4.2%", trend: "-1.2%", up: true },
  { label: "Repeat Customers", value: "67%", trend: "+8%", up: true },
];

const TOP_COURTS = [
  { name: "Court A", venue: "Padel Bali Arena", bookings: 89, revenue: 26700000 },
  { name: "Court B", venue: "Padel Bali Arena", bookings: 72, revenue: 21600000 },
  { name: "Court 1", venue: "Jakarta Padel Club", bookings: 65, revenue: 26000000 },
  { name: "Court 2", venue: "Jakarta Padel Club", bookings: 58, revenue: 23200000 },
  { name: "Court Utama", venue: "Surabaya Padel Center", bookings: 45, revenue: 11250000 },
];

type Period = "weekly" | "monthly";

export default function RevenuePage() {
  const [period, setPeriod] = useState<Period>("monthly");

  const chartData = period === "monthly" ? MONTHLY_REVENUE : WEEKLY_REVENUE;
  const maxValue = Math.max(...chartData.map((d) => d.value));
  const totalRevenue = chartData.reduce((sum, d) => sum + d.value, 0);
  const avgRevenue = Math.round(totalRevenue / chartData.length);

  return (
    <div className="py-8">
      <section className="container">
        {/* Header */}
        <div>
          <h1 className="heading-1 text-2xl text-[#F7F7F7] md:text-3xl">
            Revenue
          </h1>
          <p className="mt-1 text-sm text-[#F7F7F7]/40">
            Financial overview and booking statistics
          </p>
        </div>

        {/* Revenue cards */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <RevenueCard
            icon={DollarSign}
            label="Total Revenue"
            value={`Rp ${(totalRevenue / 1000000).toFixed(1)}M`}
            trend="+23%"
            trendUp
          />
          <RevenueCard
            icon={TrendingUp}
            label="Avg. per Period"
            value={`Rp ${(avgRevenue / 1000000).toFixed(1)}M`}
            trend="+12%"
            trendUp
          />
          <RevenueCard
            icon={CalendarDays}
            label="Total Bookings"
            value="342"
            trend="+18%"
            trendUp
          />
          <RevenueCard
            icon={Users}
            label="Unique Players"
            value="187"
            trend="+31%"
            trendUp
          />
        </div>

        {/* Revenue chart */}
        <div className="mt-8 rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 md:p-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="section-label">Revenue Overview</p>
              <p className="metric mt-3 text-3xl text-[#F7F7F7]">
                Rp {(totalRevenue / 1000000).toFixed(1)}M
              </p>
              <p className="mt-1 text-xs text-[#F7F7F7]/30">
                {period === "monthly" ? "This year" : "This week"}
              </p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setPeriod("weekly")}
                className={`rounded-lg px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.1em] transition-all ${
                  period === "weekly"
                    ? "bg-[#E6FA50]/10 text-[#E6FA50]"
                    : "bg-white/[0.03] text-[#F7F7F7]/25 hover:text-[#F7F7F7]/50"
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setPeriod("monthly")}
                className={`rounded-lg px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.1em] transition-all ${
                  period === "monthly"
                    ? "bg-[#E6FA50]/10 text-[#E6FA50]"
                    : "bg-white/[0.03] text-[#F7F7F7]/25 hover:text-[#F7F7F7]/50"
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
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-md bg-[#0C1B26] border border-white/[0.08] px-2 py-1 text-[9px] text-[#E6FA50] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Rp {(d.value / 1000000).toFixed(1)}M
                    </div>
                  </div>
                  <span className="caption text-[#F7F7F7]/20">{label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Booking Statistics */}
        <div className="mt-8">
          <p className="section-label mb-5">Booking Statistics</p>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {BOOKING_STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-white/[0.06] bg-[#0C1B26] p-5"
              >
                <p className="caption text-[#F7F7F7]/30">{stat.label}</p>
                <p className="metric mt-2 text-xl text-[#F7F7F7]">{stat.value}</p>
                <span
                  className={`mt-2 inline-flex items-center gap-0.5 text-[10px] font-medium ${
                    stat.up ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {stat.up ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {stat.trend}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top performing courts */}
        <div className="mt-8 rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 md:p-8">
          <p className="section-label mb-6">Top Performing Courts</p>
          <div className="space-y-0">
            {TOP_COURTS.map((court, i) => (
              <div
                key={court.name + court.venue}
                className="flex items-center gap-4 border-b border-white/[0.03] py-4 last:border-0"
              >
                <span className="metric w-6 text-center text-sm text-[#F7F7F7]/20">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="heading-3 text-sm text-[#F7F7F7]">
                    {court.name}
                  </p>
                  <p className="caption text-[#F7F7F7]/25">{court.venue}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-[#F7F7F7]/60">
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
      </section>
    </div>
  );
}

function RevenueCard({
  icon: Icon,
  label,
  value,
  trend,
  trendUp,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5">
      <div className="flex items-center justify-between">
        <Icon className="h-4 w-4 text-[#50C8C8]" />
        <span
          className={`flex items-center gap-0.5 text-[10px] font-medium ${
            trendUp ? "text-green-400" : "text-red-400"
          }`}
        >
          {trendUp ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
          {trend}
        </span>
      </div>
      <p className="metric mt-3 text-xl text-[#F7F7F7] md:text-2xl">{value}</p>
      <p className="caption mt-1 text-[#F7F7F7]/25">{label}</p>
    </div>
  );
}
