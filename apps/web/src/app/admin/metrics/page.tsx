"use client";

import { useState } from "react";
import { TrendingUp, MapPin, Building2 } from "lucide-react";
import { monthlyMetrics } from "@/mock/admin";

type ChartView = "gmv" | "revenue" | "bookings";

export default function MetricsPage() {
  const [chartView, setChartView] = useState<ChartView>("gmv");

  const chartData = monthlyMetrics[chartView];
  const maxValue = Math.max(...chartData.map((d) => d.value));

  function formatValue(value: number): string {
    if (chartView === "bookings") return value.toLocaleString();
    if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(0)}M`;
    return `Rp ${(value / 1_000).toFixed(0)}K`;
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <p className="caption text-[#F7F7F7]/30">Analytics</p>
        <h1 className="heading-1 mt-2 text-2xl text-[#F7F7F7] md:text-3xl">
          Marketplace <span className="text-[#E6FA50]">Metrics</span>
        </h1>
      </div>

      {/* Chart Section */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-4 w-4 text-[#50C8C8]" />
            <p className="heading-3 text-sm text-[#F7F7F7]">Monthly Performance</p>
          </div>
          <div className="flex gap-2">
            {(["gmv", "revenue", "bookings"] as const).map((view) => (
              <button
                key={view}
                onClick={() => setChartView(view)}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-medium uppercase transition-all ${
                  chartView === view
                    ? "bg-[#E6FA50]/10 text-[#E6FA50]"
                    : "text-[#F7F7F7]/30 hover:text-[#F7F7F7]/60"
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="flex items-end gap-3 h-48">
          {chartData.map((item, idx) => {
            const height = (item.value / maxValue) * 100;
            const isLast = idx === chartData.length - 1;
            return (
              <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
                <span className="caption text-[#F7F7F7]/40 text-[10px]">
                  {formatValue(item.value)}
                </span>
                <div className="w-full flex justify-center">
                  <div
                    className={`w-full max-w-[48px] rounded-t-lg transition-all duration-500 ${
                      isLast ? "bg-[#E6FA50]" : "bg-[#E6FA50]/20"
                    }`}
                    style={{ height: `${height}%`, minHeight: "8px" }}
                  />
                </div>
                <span className="caption text-[#F7F7F7]/25">{item.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Cities */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 mb-6">
        <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
          <div className="flex items-center gap-3 mb-5">
            <MapPin className="h-4 w-4 text-[#50C8C8]" />
            <p className="heading-3 text-sm text-[#F7F7F7]">Top Cities</p>
          </div>
          <div className="space-y-3">
            {monthlyMetrics.topCities.map((city, idx) => {
              const maxBookings = monthlyMetrics.topCities[0].bookings;
              const width = (city.bookings / maxBookings) * 100;
              return (
                <div key={city.city}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E6FA50]/10 text-[10px] font-semibold text-[#E6FA50]">
                        {idx + 1}
                      </span>
                      <span className="text-sm text-[#F7F7F7]/70">{city.city}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-[#F7F7F7]/60">{city.bookings.toLocaleString()} bookings</span>
                      <span className="ml-2 caption text-[#E6FA50]">Rp {(city.revenue / 1_000_000).toFixed(1)}M</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/[0.04]">
                    <div
                      className="h-full rounded-full bg-[#E6FA50]/40 transition-all duration-500"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Venues */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
          <div className="flex items-center gap-3 mb-5">
            <Building2 className="h-4 w-4 text-[#50C8C8]" />
            <p className="heading-3 text-sm text-[#F7F7F7]">Top Venues</p>
          </div>
          <div className="space-y-3">
            {monthlyMetrics.topVenues.map((venue, idx) => (
              <div key={venue.name} className="flex items-center gap-3 rounded-xl bg-white/[0.02] p-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E6FA50]/10 text-[10px] font-semibold text-[#E6FA50]">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#F7F7F7]/70 truncate">{venue.name}</p>
                  <p className="caption text-[#F7F7F7]/25">{venue.city}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm text-[#F7F7F7]/60">{venue.bookings}</p>
                  <p className="caption text-[#E6FA50]">Rp {(venue.revenue / 1_000_000).toFixed(1)}M</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Growth Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <GrowthCard
          label="GMV Growth"
          current="Rp 847.5M"
          previous="Rp 760M"
          growth="+11.5%"
        />
        <GrowthCard
          label="Revenue Growth"
          current="Rp 84.7M"
          previous="Rp 76M"
          growth="+11.5%"
        />
        <GrowthCard
          label="Booking Growth"
          current="3,842"
          previous="3,520"
          growth="+9.1%"
        />
      </div>
    </div>
  );
}

function GrowthCard({
  label,
  current,
  previous,
  growth,
}: {
  label: string;
  current: string;
  previous: string;
  growth: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5">
      <p className="caption text-[#F7F7F7]/25 mb-2">{label}</p>
      <p className="metric text-xl text-[#F7F7F7]">{current}</p>
      <div className="mt-2 flex items-center gap-2">
        <span className="caption text-[#F7F7F7]/20">vs {previous}</span>
        <span className="text-[11px] font-medium text-[#E6FA50]">{growth}</span>
      </div>
    </div>
  );
}
