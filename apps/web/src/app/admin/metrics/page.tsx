"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart3 } from "lucide-react";
import { queryKeys } from "@/lib/queries";
import { getAdminMetrics } from "@/lib/api";
import { ErrorBanner, EmptyState } from "@/components/ui/error-state";

const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export default function AdminMetricsPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: queryKeys.admin.metrics(),
    queryFn: () => getAdminMetrics(),
  });

  if (isLoading) {
    return (
      <div className="px-6 pb-6 pt-element lg:px-8 lg:pb-8">
        <div className="mb-8">
          <p className="caption text-[#E6FA50]">Platform</p>
          <h1 className="heading-1 mt-2 text-[#F7F7F7]">
            Metrics <span className="text-[#E6FA50]">Report</span>
          </h1>
        </div>
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]" />
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="col-span-2 h-[400px] animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]" />
            <div className="h-[400px] animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="px-6 pb-6 pt-element lg:px-8 lg:pb-8">
        <div className="mb-8">
          <p className="caption text-[#E6FA50]">Platform</p>
          <h1 className="heading-1 mt-2 text-3xl text-[#F7F7F7] sm:text-4xl">
            Metrics <span className="text-[#E6FA50]">Report</span>
          </h1>
        </div>
        <ErrorBanner title="Couldn't load metrics" error={error} onRetry={() => refetch()} isRetrying={isFetching} />
      </div>
    );
  }

  if (data && data.totalBookings === 0) {
    return (
      <div className="flex flex-1 flex-col px-6 pb-6 pt-element lg:px-8 lg:pb-8">
        <div className="mb-8">
          <p className="caption text-[#E6FA50]">Platform</p>
          <h1 className="heading-1 mt-2 text-3xl text-[#F7F7F7] sm:text-4xl">
            Metrics <span className="text-[#E6FA50]">Report</span>
          </h1>
        </div>
        <EmptyState icon={BarChart3} title="No metrics data" description="No bookings have been made yet." />
      </div>
    );
  }

  if (!data) return null;

  const maxGmv = Math.max(...data.monthlySeries.map((m) => m.gmv));
  const totalStatusCount = data.statusBreakdown.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="px-6 pb-6 pt-element lg:px-8 lg:pb-8">
      <div className="mb-8">
        <p className="caption text-[#E6FA50]">Platform</p>
        <h1 className="heading-1 mt-2 text-3xl text-[#F7F7F7] sm:text-4xl">
          Metrics <span className="text-[#E6FA50]">Report</span>
        </h1>
      </div>

      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5">
            <p className="caption text-[#F7F7F7]/40">Total GMV</p>
            <p className="price mt-2 text-[#F7F7F7]">{formatIDR(data.totalGmv)}</p>
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5">
            <p className="caption text-[#F7F7F7]/40">Total Commission</p>
            <p className="price mt-2 text-[#E6FA50]">{formatIDR(data.totalCommission)}</p>
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5">
            <p className="caption text-[#F7F7F7]/40">Total Bookings</p>
            <p className="price mt-2 text-[#F7F7F7]">{data.totalBookings}</p>
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5">
            <p className="caption text-[#F7F7F7]/40">Avg Monthly GMV</p>
            <p className="price mt-2 text-[#F7F7F7]">{formatIDR(data.avgMonthlyGmv)}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="col-span-2 rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
            <p className="section-label mb-6">12-Month GMV Trend</p>
            <div className="flex h-64 items-end justify-between gap-2 md:gap-4">
              {data.monthlySeries.map((m) => {
                const heightPct = maxGmv > 0 ? (m.gmv / maxGmv) * 100 : 0;
                const monthName = new Date(`${m.month}-01T00:00:00Z`).toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
                return (
                  <div key={m.month} className="group relative flex w-full flex-col items-center justify-end h-full">
                    <div
                      className="w-full max-w-[40px] rounded-t-sm bg-[#E6FA50] transition-all hover:bg-[#E6FA50]/80"
                      style={{ height: `${heightPct}%`, minHeight: heightPct > 0 ? "4px" : "0" }}
                    />
                    <p className="caption mt-3 text-[#F7F7F7]/40">{monthName}</p>
                    
                    {/* Tooltip */}
                    <div className="caption absolute -top-12 hidden whitespace-nowrap rounded-lg bg-white/[0.1] px-3 py-1.5 text-[#F7F7F7] backdrop-blur-md group-hover:block z-10">
                      {formatIDR(m.gmv)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6">
            <p className="section-label mb-6">Status Breakdown</p>
            <div className="space-y-5">
              {data.statusBreakdown.map((s) => {
                const pct = totalStatusCount > 0 ? (s.count / totalStatusCount) * 100 : 0;
                return (
                  <div key={s.status}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="caption text-[#F7F7F7]/60">{s.status}</span>
                      <span className="body-sm text-[#F7F7F7]">{s.count}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.04]">
                      <div className="h-full bg-[#E6FA50] transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
