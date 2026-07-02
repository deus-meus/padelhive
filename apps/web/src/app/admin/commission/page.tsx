"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Coins } from "lucide-react";
import { queryKeys } from "@/lib/queries";
import { getCommissionReport } from "@/lib/api";
import { ErrorBanner, EmptyState } from "@/components/ui/error-state";

const formatIDR = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

type PeriodPreset = "This month" | "Last month" | "This year" | "All time";

export default function CommissionPage() {
  const [preset, setPreset] = useState<PeriodPreset>("This month");

  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();
  const pad = (n: number) => String(n).padStart(2, "0");
  const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  let fromDate: string | undefined;
  let toDate: string | undefined;

  switch (preset) {
    case "This month":
      fromDate = iso(new Date(y, m, 1));
      toDate = iso(today);
      break;
    case "Last month":
      fromDate = iso(new Date(y, m - 1, 1));
      toDate = iso(new Date(y, m, 0));
      break;
    case "This year":
      fromDate = `${y}-01-01`;
      toDate = iso(today);
      break;
    case "All time":
      fromDate = undefined;
      toDate = undefined;
      break;
  }

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: queryKeys.admin.commission({ fromDate, toDate }),
    queryFn: () => getCommissionReport({ fromDate, toDate }),
  });

  const exportCsv = () => {
    if (!data || data.venues.length === 0) return;
    const escapeCsv = (str: string | number) => `"${String(str).replace(/"/g, '""')}"`;
    const header = ["Venue", "City", "Config Rate (%)", "Bookings", "GMV", "Commission", "Effective Rate (%)"];
    const rows = data.venues.map((row) => [
      escapeCsv(row.venueName),
      escapeCsv(row.city),
      row.commissionRate,
      row.bookings,
      row.gmv,
      row.commission,
      row.effectiveRate,
    ]);
    const totalRow = [
      escapeCsv(""),
      escapeCsv(""),
      "",
      data.totalBookings,
      data.totalGmv,
      data.totalCommission,
      data.avgCommissionRate,
    ];
    const csvContent = [header, ...rows, totalRow].map(r => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `commission-report-${preset.toLowerCase().replace(/\s+/g,"-")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-1 flex-col px-6 pb-6 pt-element lg:px-8 lg:pb-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="caption text-[#E6FA50]">Financial</p>
          <h1 className="heading-1 mt-2 text-[#F7F7F7]">
            Commission <span className="text-[#E6FA50]">Report</span>
          </h1>
        </div>
        {data && data.venues.length > 0 && (
          <button
            onClick={exportCsv}
            className="label btn-lime inline-flex h-10 items-center justify-center rounded-xl px-6"
          >
            Export CSV
          </button>
        )}
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto no-scrollbar">
        {(["This month", "Last month", "This year", "All time"] as PeriodPreset[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setPreset(tab)}
            className={`label shrink-0 rounded-lg px-4 py-2 transition-all ${
              preset === tab
                ? "bg-[#E6FA50]/10 text-[#E6FA50]"
                : "text-[#F7F7F7]/40 hover:bg-white/[0.03] hover:text-[#F7F7F7]/60"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]" />
            ))}
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-4">
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded bg-white/[0.04]" />
              ))}
            </div>
          </div>
        </div>
      ) : isError ? (
        <ErrorBanner title="Couldn't load commission report" error={error} onRetry={() => refetch()} isRetrying={isFetching} />
      ) : data && data.venues.length === 0 ? (
        <EmptyState icon={Coins} title="No commission data" description="No completed bookings in this period." />
      ) : data ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5">
              <p className="caption text-[#F7F7F7]/40">Total Commission</p>
              <p className="price mt-2 text-[#E6FA50]">{formatIDR(data.totalCommission)}</p>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5">
              <p className="caption text-[#F7F7F7]/40">Total GMV</p>
              <p className="price mt-2 text-[#F7F7F7]">{formatIDR(data.totalGmv)}</p>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5">
              <p className="caption text-[#F7F7F7]/40">Avg Commission Rate</p>
              <p className="price mt-2 text-[#F7F7F7]">{data.avgCommissionRate}%</p>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5">
              <p className="caption text-[#F7F7F7]/40">Total Bookings</p>
              <p className="price mt-2 text-[#F7F7F7]">{data.totalBookings}</p>
            </div>
          </div>

          {data.monthlySeries && data.monthlySeries.length > 0 && (
            <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5">
              <p className="body font-medium text-[#F7F7F7] mb-4">Monthly Commission</p>
              <div className="flex h-48 items-end gap-2 overflow-x-auto no-scrollbar pt-10 sm:gap-4">
                {(() => {
                  const maxComm = Math.max(...data.monthlySeries.map((m) => m.commission), 1);
                  return data.monthlySeries.map((m) => {
                    const heightPct = Math.max((m.commission / maxComm) * 100, 1);
                    const monthLabel = new Date(`${m.month}-01T00:00:00Z`).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
                    return (
                      <div key={m.month} className="flex h-full w-12 flex-shrink-0 flex-col justify-end gap-2 sm:w-16">
                        <div className="group relative flex w-full flex-1 flex-col justify-end">
                          <div className="absolute -top-10 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded border border-white/[0.06] bg-[#0C1B26] px-2 py-1 text-xs text-[#F7F7F7] opacity-0 transition-opacity group-hover:opacity-100">
                            {formatIDR(m.commission)}
                          </div>
                          <div
                            className="w-full rounded-t bg-[#E6FA50] transition-all"
                            style={{ height: `${heightPct}%` }}
                          />
                        </div>
                        <div className="text-center text-xs text-[#F7F7F7]/40">
                          {monthLabel}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] overflow-x-auto no-scrollbar">
            <div className="min-w-[800px] p-4">
              <div className="grid grid-cols-12 gap-4 px-4 py-3 caption uppercase text-[#F7F7F7]/40">
                <div className="col-span-4">Venue</div>
                <div className="col-span-2 text-right">Config Rate</div>
                <div className="col-span-1 text-right">Bookings</div>
                <div className="col-span-2 text-right">GMV</div>
                <div className="col-span-2 text-right">Commission</div>
                <div className="col-span-1 text-right">Effective Rate</div>
              </div>
              <div className="space-y-2">
                {data.venues.map((row) => (
                  <div key={row.venueId} className="grid grid-cols-12 items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                    <div className="col-span-4 min-w-0">
                      <p className="body-sm truncate text-[#F7F7F7]">{row.venueName}</p>
                      <p className="truncate caption text-[#F7F7F7]/40 mt-0.5">{row.city}</p>
                    </div>
                    <div className="col-span-2 text-right">
                      <p className="body-sm text-[#F7F7F7]/60">{row.commissionRate}%</p>
                    </div>
                    <div className="col-span-1 text-right">
                      <p className="body-sm text-[#F7F7F7]/60">{row.bookings}</p>
                    </div>
                    <div className="col-span-2 text-right">
                      <p className="price text-[#F7F7F7]">{formatIDR(row.gmv)}</p>
                    </div>
                    <div className="col-span-2 text-right">
                      <p className="price text-[#E6FA50]">{formatIDR(row.commission)}</p>
                    </div>
                    <div className="col-span-1 text-right">
                      <p className="body-sm text-[#F7F7F7]/60">{row.effectiveRate}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
