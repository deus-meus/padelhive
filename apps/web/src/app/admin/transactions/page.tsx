"use client";

import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { transactions, type Transaction } from "@/mock/admin";

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Transaction["paymentStatus"]>("all");

  const filtered = transactions.filter((tx) => {
    const matchesSearch =
      tx.bookingId.toLowerCase().includes(search.toLowerCase()) ||
      tx.user.toLowerCase().includes(search.toLowerCase()) ||
      tx.venue.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || tx.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <p className="caption text-[#F7F7F7]/25">Financial</p>
        <h1 className="heading-1 mt-2 text-2xl text-[#F7F7F7] md:text-3xl">
          Transaction <span className="text-[#E6FA50]">Monitoring</span>
        </h1>
      </div>

      {/* Search & Filter */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#F7F7F7]/25" />
          <input
            type="text"
            placeholder="Search by booking ID, user, or venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] py-2.5 pl-10 pr-4 text-sm text-[#F7F7F7] placeholder:text-[#F7F7F7]/25 focus:border-[#E6FA50]/30 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#F7F7F7]/25" />
          {(["all", "completed", "pending", "failed", "refunded"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-[11px] font-medium capitalize transition-all ${
                statusFilter === s
                  ? "bg-[#E6FA50]/10 text-[#E6FA50]"
                  : "text-[#F7F7F7]/25 hover:text-[#F7F7F7]/60"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table — desktop */}
      <div className="hidden md:block rounded-2xl border border-white/[0.06] bg-[#0C1B26] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.04]">
                <th className="px-5 py-3 caption text-[#F7F7F7]/25 font-medium">Booking ID</th>
                <th className="px-5 py-3 caption text-[#F7F7F7]/25 font-medium">User</th>
                <th className="px-5 py-3 caption text-[#F7F7F7]/25 font-medium">Venue</th>
                <th className="px-5 py-3 caption text-[#F7F7F7]/25 font-medium text-right">Amount</th>
                <th className="px-5 py-3 caption text-[#F7F7F7]/25 font-medium text-right">Commission</th>
                <th className="px-5 py-3 caption text-[#F7F7F7]/25 font-medium">Provider</th>
                <th className="px-5 py-3 caption text-[#F7F7F7]/25 font-medium">Status</th>
                <th className="px-5 py-3 caption text-[#F7F7F7]/25 font-medium">Date/Time</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => (
                <tr key={tx.id} className="border-b border-white/[0.02] last:border-0 hover:bg-white/[0.01] transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium text-[#50C8C8]">{tx.bookingId}</td>
                  <td className="px-5 py-3.5 text-sm text-[#F7F7F7]/60">{tx.user}</td>
                  <td className="px-5 py-3.5 text-sm text-[#F7F7F7]/60">{tx.venue}</td>
                  <td className="px-5 py-3.5 text-sm text-[#F7F7F7]/60 text-right">Rp {(tx.amount / 1000).toFixed(0)}K</td>
                  <td className="px-5 py-3.5 text-sm text-[#E6FA50] text-right">+Rp {(tx.commission / 1000).toFixed(0)}K</td>
                  <td className="px-5 py-3.5">
                    <span className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium uppercase text-[#F7F7F7]/40">
                      {tx.provider}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <PaymentStatusBadge status={tx.paymentStatus} />
                  </td>
                  <td className="px-5 py-3.5 caption text-[#F7F7F7]/25">{tx.dateTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards — mobile */}
      <div className="md:hidden space-y-3">
        {filtered.map((tx) => (
          <div key={tx.id} className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#50C8C8]">{tx.bookingId}</span>
              <PaymentStatusBadge status={tx.paymentStatus} />
            </div>
            <p className="text-sm text-[#F7F7F7]/60">{tx.user}</p>
            <p className="caption text-[#F7F7F7]/25 mt-0.5">{tx.venue}</p>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <span className="text-sm text-[#F7F7F7]/60">Rp {(tx.amount / 1000).toFixed(0)}K</span>
                <span className="ml-2 text-xs text-[#E6FA50]">+Rp {(tx.commission / 1000).toFixed(0)}K</span>
              </div>
              <span className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium uppercase text-[#F7F7F7]/40">
                {tx.provider}
              </span>
            </div>
            <p className="caption text-[#F7F7F7]/25 mt-2">{tx.dateTime}</p>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-12 text-center mt-4">
          <p className="caption text-[#F7F7F7]/25">No transactions match your filters</p>
        </div>
      )}
    </div>
  );
}

function PaymentStatusBadge({ status }: { status: Transaction["paymentStatus"] }) {
  const styles = {
    completed: "bg-[#E6FA50]/10 text-[#E6FA50]",
    pending: "bg-amber-500/10 text-amber-400",
    failed: "bg-red-500/10 text-red-400",
    refunded: "bg-[#50C8C8]/10 text-[#50C8C8]",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] ${styles[status]}`}>
      {status}
    </span>
  );
}
