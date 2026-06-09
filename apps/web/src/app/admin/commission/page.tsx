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

  return (
    <div className="px-6 pb-6 pt-element lg:px-8 lg:pb-8">
      <div className="mb-8">
        <p className="caption text-[#E6FA50]">Financial</p>
        <h1 className="heading-1 mt-2 text-3xl text-[#F7F7F7] sm:text-4xl">
          Commission <span className="text-[#E6FA50]">Report</span>
        </h1>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto no-scrollbar">
        {(["This month", "Last month", "This year", "All time"] as PeriodPreset[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setPreset(tab)}
            className={`shrink-0 rounded-lg px-4 py-2 text-xs font-medium transition-all ${
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
              <p className="price text-2xl text-[#E6FA50] mt-2">{formatIDR(data.totalCommission)}</p>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5">
              <p className="caption text-[#F7F7F7]/40">Total GMV</p>
              <p className="price text-2xl text-[#F7F7F7] mt-2">{formatIDR(data.totalGmv)}</p>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5">
              <p className="caption text-[#F7F7F7]/40">Avg Commission Rate</p>
              <p className="price text-2xl text-[#F7F7F7] mt-2">{data.avgCommissionRate}%</p>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5">
              <p className="caption text-[#F7F7F7]/40">Total Bookings</p>
              <p className="price text-2xl text-[#F7F7F7] mt-2">{data.totalBookings}</p>
            </div>
          </div>

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
                      <p className="truncate text-sm font-medium text-[#F7F7F7]">{row.venueName}</p>
                      <p className="truncate caption text-[#F7F7F7]/40 mt-0.5">{row.city}</p>
                    </div>
                    <div className="col-span-2 text-right">
                      <p className="text-sm text-[#F7F7F7]/60">{row.commissionRate}%</p>
                    </div>
                    <div className="col-span-1 text-right">
                      <p className="text-sm text-[#F7F7F7]/60">{row.bookings}</p>
                    </div>
                    <div className="col-span-2 text-right">
                      <p className="price text-sm text-[#F7F7F7]">{formatIDR(row.gmv)}</p>
                    </div>
                    <div className="col-span-2 text-right">
                      <p className="price text-sm text-[#E6FA50]">{formatIDR(row.commission)}</p>
                    </div>
                    <div className="col-span-1 text-right">
                      <p className="text-sm text-[#F7F7F7]/60">{row.effectiveRate}%</p>
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
