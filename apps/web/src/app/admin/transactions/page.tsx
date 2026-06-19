"use client";

import { useState } from "react";
import { formatBookingDate, formatBookingTimeRange } from "@/lib/format";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { getAdminBookings } from "@/lib/api";
import { ErrorBanner, EmptyState } from "@/components/ui/error-state";
import { Receipt, ChevronLeft, ChevronRight } from "lucide-react";

const TABS = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Awaiting Payment", value: "PENDING_PAYMENT" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Expired", value: "EXPIRED" },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  COMPLETED: { label: "Completed", color: "text-green-400", bg: "bg-green-400/10" },
  CONFIRMED: { label: "Confirmed", color: "text-[#50C8C8]", bg: "bg-[#50C8C8]/10" },
  PENDING: { label: "Pending", color: "text-yellow-400", bg: "bg-yellow-400/10" },
  PENDING_PAYMENT: { label: "Awaiting Payment", color: "text-amber-400", bg: "bg-amber-400/10" },
  CANCELLED: { label: "Cancelled", color: "text-red-400", bg: "bg-red-400/10" },
  EXPIRED: { label: "Expired", color: "text-[#F7F7F7]/40", bg: "bg-white/[0.04]" },
};

const PAYMENT_CONFIG: Record<string, { color: string }> = {
  PAID: { color: "text-green-400" },
  PENDING: { color: "text-yellow-400" },
  FAILED: { color: "text-red-400" },
  REFUNDED: { color: "text-[#F7F7F7]/40" },
};

const formatIDR = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);


export default function AdminTransactionsPage() {
  const [activeStatus, setActiveStatus] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: queryKeys.admin.bookings({ status: activeStatus, page }),
    queryFn: () => getAdminBookings({ status: activeStatus === "ALL" ? undefined : activeStatus, page, pageSize }),
    placeholderData: keepPreviousData,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex flex-1 flex-col px-6 pb-6 pt-element lg:px-8 lg:pb-8">
      {/* Header */}
      <div className="mb-8">
        <p className="caption text-[#E6FA50]">Marketplace Admin</p>
        <h1 className="heading-1 mt-2 text-[#F7F7F7]">Transactions</h1>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex overflow-x-auto border-b border-white/[0.08] no-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setActiveStatus(tab.value);
              setPage(1);
            }}
            className={`label whitespace-nowrap border-b-2 px-4 py-3 transition-colors ${
              activeStatus === tab.value
                ? "border-[#E6FA50] text-[#F7F7F7]"
                : "border-transparent text-[#F7F7F7]/40 hover:text-[#F7F7F7]/80"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Body States */}
      {isLoading ? (
        <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 space-y-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-12 w-full animate-pulse rounded-lg bg-white/[0.04]" />
          ))}
        </div>
      ) : isError ? (
        <ErrorBanner title="Couldn't load transactions" error={error} onRetry={() => refetch()} isRetrying={isFetching} />
      ) : items.length === 0 ? (
        <EmptyState icon={Receipt} title="No transactions found" description="No bookings match the selected status." />
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0C1B26]">
            <div className="overflow-x-auto">
              <table className="body-sm w-full text-left">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="caption px-4 py-3 uppercase whitespace-nowrap text-[#F7F7F7]/40">Date</th>
                    <th className="caption px-4 py-3 uppercase whitespace-nowrap text-[#F7F7F7]/40">Venue / Court</th>
                    <th className="caption px-4 py-3 uppercase whitespace-nowrap text-[#F7F7F7]/40">Customer</th>
                    <th className="caption px-4 py-3 uppercase whitespace-nowrap text-[#F7F7F7]/40">Schedule</th>
                    <th className="caption px-4 py-3 uppercase whitespace-nowrap text-[#F7F7F7]/40">Amount</th>
                    <th className="caption px-4 py-3 uppercase whitespace-nowrap text-[#F7F7F7]/40">Payment</th>
                    <th className="caption px-4 py-3 uppercase whitespace-nowrap text-[#F7F7F7]/40">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const cfg = STATUS_CONFIG[item.status] ?? { label: item.status, color: "text-[#F7F7F7]/40", bg: "bg-white/[0.04]" };
                    return (
                      <tr key={item.id} className="border-t border-white/[0.06] hover:bg-white/[0.02]">
                        <td className="px-4 py-3 align-middle whitespace-nowrap text-[#F7F7F7]/80">
                          {formatBookingDate(item.bookingDate)}
                        </td>
                        <td className="px-4 py-3 align-middle whitespace-nowrap text-[#F7F7F7]/80">
                          <div className="text-[#F7F7F7]">{item.venue.name}</div>
                          <div className="caption text-[#F7F7F7]/40">{item.court.name} · {item.venue.city}</div>
                        </td>
                        <td className="px-4 py-3 align-middle whitespace-nowrap text-[#F7F7F7]/80">
                          <div>{item.host.name ?? "—"}</div>
                          <div className="caption text-[#F7F7F7]/40">{item.host.email}</div>
                        </td>
                        <td className="px-4 py-3 align-middle whitespace-nowrap text-[#F7F7F7]/80">
                          <div>{formatBookingTimeRange(item.startsAt, item.endsAt)}</div>
                          <div className="caption text-[#F7F7F7]/40">{item.durationMinutes} min</div>
                        </td>
                        <td className="px-4 py-3 align-middle whitespace-nowrap text-[#F7F7F7]/80">
                          <div className="text-[#F7F7F7]">{formatIDR(item.finalAmount)}</div>
                          {item.voucherDiscount > 0 && (
                            <div className="caption text-[#F7F7F7]/40">-{formatIDR(item.voucherDiscount)} voucher</div>
                          )}
                        </td>
                        <td className="px-4 py-3 align-middle whitespace-nowrap text-[#F7F7F7]/80">
                          {item.payment ? (
                            <>
                              <div className={PAYMENT_CONFIG[item.payment.status]?.color ?? "text-[#F7F7F7]/40"}>
                                {item.payment.status}
                              </div>
                              <div className="caption text-[#F7F7F7]/40">
                                {item.payment.provider} · {item.payment.method}
                              </div>
                            </>
                          ) : (
                            <div className="text-[#F7F7F7]/40">—</div>
                          )}
                        </td>
                        <td className="px-4 py-3 align-middle whitespace-nowrap text-[#F7F7F7]/80">
                          <span className={`caption rounded-full px-2 py-0.5 uppercase ${cfg.color} ${cfg.bg}`}>
                            {cfg.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="body-sm text-[#F7F7F7]/40">
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="label flex items-center gap-1 rounded-full border border-white/[0.08] px-4 py-2 uppercase text-[#F7F7F7]/60 transition-colors hover:border-white/[0.15] hover:text-[#F7F7F7]/80 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="label flex items-center gap-1 rounded-full border border-white/[0.08] px-4 py-2 uppercase text-[#F7F7F7]/60 transition-colors hover:border-white/[0.15] hover:text-[#F7F7F7]/80 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
