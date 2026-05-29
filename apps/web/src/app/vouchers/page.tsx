"use client";

import { useState } from "react";
import {
  Ticket,
  Percent,
  DollarSign,
  Calendar,
  Copy,
  CheckCircle2,
  X,
} from "lucide-react";
import { mockVouchers } from "@/mock/vouchers";
import { Voucher } from "@/types";

export default function VouchersPage() {
  const [filter, setFilter] = useState<"active" | "expired">("active");
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const active = mockVouchers.filter((v) => v.isActive);
  const expired = mockVouchers.filter((v) => !v.isActive);
  const filtered = filter === "active" ? active : expired;

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      showToast(`Copied "${code}" to clipboard`);
    }).catch(() => {
      showToast(`Code: ${code}`);
    });
  }

  function formatDiscount(voucher: Voucher): string {
    if (voucher.type === "percentage") return `${voucher.value}% OFF`;
    return `Rp ${(voucher.value / 1000).toFixed(0)}K OFF`;
  }

  return (
    <div className="min-h-screen pt-28">
      <section className="container pb-8">
        <h1 className="heading-1 text-3xl text-[#F7F7F7] md:text-4xl">
          Promo & <span className="text-[#E6FA50]">Vouchers</span>
        </h1>
        <p className="mt-2 text-sm font-light text-[#F7F7F7]/40">
          Use voucher codes to get discounts on your bookings.
        </p>
      </section>

      {/* Tabs */}
      <section className="container pb-8">
        <div className="flex gap-1 border-b border-white/[0.06]">
          {(["active", "expired"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`relative px-5 py-3 text-[11px] font-medium uppercase tracking-[0.1em] transition-colors ${
                filter === tab
                  ? "text-[#E6FA50]"
                  : "text-[#F7F7F7]/30 hover:text-[#F7F7F7]/60"
              }`}
            >
              {tab} ({tab === "active" ? active.length : expired.length})
              {filter === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E6FA50]" />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Voucher Grid */}
      <section className="container pb-section-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((voucher) => (
            <div
              key={voucher.id}
              className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-200 ${
                voucher.isActive
                  ? "border-white/[0.06] bg-[#0C1B26] hover:border-[#E6FA50]/15"
                  : "border-white/[0.03] bg-[#0C1B26]/50 opacity-60"
              }`}
            >
              {/* Discount badge */}
              <div className="flex items-center justify-between mb-4">
                <div className={`flex items-center gap-2 rounded-full px-3 py-1 ${
                  voucher.type === "percentage"
                    ? "bg-[#E6FA50]/10 text-[#E6FA50]"
                    : "bg-[#50C8C8]/10 text-[#50C8C8]"
                }`}>
                  {voucher.type === "percentage"
                    ? <Percent className="h-3.5 w-3.5" />
                    : <DollarSign className="h-3.5 w-3.5" />
                  }
                  <span className="text-xs font-semibold">{formatDiscount(voucher)}</span>
                </div>
                {voucher.isActive && (
                  <span className="h-2 w-2 rounded-full bg-[#E6FA50] animate-pulse" />
                )}
              </div>

              {/* Code */}
              <div className="flex items-center gap-2 mb-3">
                <code className="heading-3 text-lg text-[#F7F7F7] tracking-wider">{voucher.code}</code>
                {voucher.isActive && (
                  <button
                    onClick={() => copyCode(voucher.code)}
                    className="flex h-6 w-6 items-center justify-center rounded-md bg-white/[0.04] text-[#F7F7F7]/30 transition-colors hover:bg-white/[0.08] hover:text-[#F7F7F7]/60"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Details */}
              <div className="space-y-1.5">
                {voucher.minPurchase && (
                  <p className="caption text-[#F7F7F7]/30">
                    Min. spend Rp {(voucher.minPurchase / 1000).toFixed(0)}K
                  </p>
                )}
                {voucher.maxDiscount && (
                  <p className="caption text-[#F7F7F7]/30">
                    Max discount Rp {(voucher.maxDiscount / 1000).toFixed(0)}K
                  </p>
                )}
                <p className="caption flex items-center gap-1 text-[#F7F7F7]/25">
                  <Calendar className="h-3 w-3" />
                  Valid until {voucher.validUntil}
                </p>
              </div>

              {/* Usage bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="caption text-[#F7F7F7]/20">Usage</span>
                  <span className="caption text-[#F7F7F7]/30">{voucher.usedCount}/{voucher.usageLimit}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/[0.04]">
                  <div
                    className="h-full rounded-full bg-[#E6FA50]/40 transition-all"
                    style={{ width: `${(voucher.usedCount / voucher.usageLimit) * 100}%` }}
                  />
                </div>
              </div>

              {/* View details */}
              <button
                onClick={() => setSelectedVoucher(voucher)}
                className="mt-4 w-full rounded-xl border border-white/[0.06] py-2 text-xs font-medium text-[#F7F7F7]/40 transition-colors hover:border-white/[0.12] hover:text-[#F7F7F7]/70"
              >
                View Details
              </button>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <Ticket className="mx-auto h-8 w-8 text-[#F7F7F7]/10 mb-3" />
            <p className="text-sm text-[#F7F7F7]/30">No {filter} vouchers available.</p>
          </div>
        )}
      </section>

      {/* Detail Modal */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#06121A]/80 backdrop-blur-sm" onClick={() => setSelectedVoucher(null)} />
          <div className="relative w-full max-w-md rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 shadow-2xl">
            <button
              onClick={() => setSelectedVoucher(null)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-[#F7F7F7]/30 transition-colors hover:bg-white/[0.04] hover:text-[#F7F7F7]/60"
            >
              <X className="h-4 w-4" />
            </button>

            <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4 ${
              selectedVoucher.type === "percentage"
                ? "bg-[#E6FA50]/10 text-[#E6FA50]"
                : "bg-[#50C8C8]/10 text-[#50C8C8]"
            }`}>
              {selectedVoucher.type === "percentage"
                ? <Percent className="h-3.5 w-3.5" />
                : <DollarSign className="h-3.5 w-3.5" />
              }
              <span className="text-xs font-semibold">{formatDiscount(selectedVoucher)}</span>
            </div>

            <h2 className="heading-2 text-xl text-[#F7F7F7] tracking-wider mb-1">{selectedVoucher.code}</h2>
            <p className="caption text-[#F7F7F7]/30 mb-5">
              {selectedVoucher.type === "percentage" ? "Percentage discount" : "Fixed amount discount"}
            </p>

            <div className="space-y-3 mb-6">
              <DetailRow label="Discount" value={formatDiscount(selectedVoucher)} />
              {selectedVoucher.minPurchase && (
                <DetailRow label="Min. Spend" value={`Rp ${(selectedVoucher.minPurchase / 1000).toFixed(0)}K`} />
              )}
              {selectedVoucher.maxDiscount && (
                <DetailRow label="Max Discount" value={`Rp ${(selectedVoucher.maxDiscount / 1000).toFixed(0)}K`} />
              )}
              <DetailRow label="Valid From" value={selectedVoucher.validFrom} />
              <DetailRow label="Valid Until" value={selectedVoucher.validUntil} />
              <DetailRow label="Usage" value={`${selectedVoucher.usedCount} / ${selectedVoucher.usageLimit}`} />
              <DetailRow label="Status" value={selectedVoucher.isActive ? "Active" : "Expired"} />
            </div>

            {selectedVoucher.isActive && (
              <button
                onClick={() => { copyCode(selectedVoucher.code); setSelectedVoucher(null); }}
                className="btn-lime w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm"
              >
                <Copy className="h-4 w-4" /> Copy Code
              </button>
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-white/[0.06] bg-[#0C1B26] px-5 py-3 shadow-2xl">
          <p className="caption flex items-center gap-2 text-[#F7F7F7]/70">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#E6FA50]" />
            {toast}
          </p>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2.5">
      <span className="caption text-[#F7F7F7]/30">{label}</span>
      <span className="text-sm font-medium text-[#F7F7F7]/70">{value}</span>
    </div>
  );
}
