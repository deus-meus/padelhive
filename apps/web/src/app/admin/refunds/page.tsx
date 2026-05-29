"use client";

import { useState } from "react";
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import { refundRequests, type RefundRequest } from "@/mock/admin";

export default function RefundsPage() {
  const [refunds, setRefunds] = useState<RefundRequest[]>(refundRequests);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [toast, setToast] = useState<string | null>(null);

  const filtered = refunds.filter((r) => filter === "all" ? true : r.status === filter);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function handleApprove(id: string) {
    setRefunds((prev) => prev.map((r) => r.id === id ? { ...r, status: "approved" as const } : r));
    showToast("Refund approved — payment will be processed");
  }

  function handleReject(id: string) {
    setRefunds((prev) => prev.map((r) => r.id === id ? { ...r, status: "rejected" as const } : r));
    showToast("Refund rejected");
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <p className="caption text-[#F7F7F7]/30">Financial</p>
        <h1 className="heading-1 mt-2 text-2xl text-[#F7F7F7] md:text-3xl">
          Refund <span className="text-[#E6FA50]">Management</span>
        </h1>
      </div>

      {/* Eligibility info */}
      <div className="mb-6 rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-4">
        <p className="section-label mb-3">Refund Policy</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.02] p-3">
            <ShieldCheck className="h-4 w-4 shrink-0 text-[#E6FA50]" />
            <div>
              <p className="text-xs font-medium text-[#F7F7F7]/70">Full refund before H-1</p>
              <p className="caption text-[#F7F7F7]/25">Cancellation 24+ hours before booking</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.02] p-3">
            <ShieldX className="h-4 w-4 shrink-0 text-red-400" />
            <div>
              <p className="text-xs font-medium text-[#F7F7F7]/70">Non-refundable after H-1</p>
              <p className="caption text-[#F7F7F7]/25">Less than 24 hours before booking</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto">
        {(["pending", "approved", "rejected", "all"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`shrink-0 rounded-lg px-4 py-2 text-xs font-medium capitalize transition-all ${
              filter === tab
                ? "bg-[#E6FA50]/10 text-[#E6FA50]"
                : "text-[#F7F7F7]/40 hover:bg-white/[0.03] hover:text-[#F7F7F7]/70"
            }`}
          >
            {tab} ({refunds.filter((r) => tab === "all" ? true : r.status === tab).length})
          </button>
        ))}
      </div>

      {/* Refund list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-12 text-center">
            <p className="caption text-[#F7F7F7]/30">No refund requests in this category</p>
          </div>
        )}
        {filtered.map((refund) => (
          <div key={refund.id} className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  refund.eligible ? "bg-[#E6FA50]/10" : "bg-red-500/10"
                }`}>
                  {refund.eligible
                    ? <RotateCcw className="h-4 w-4 text-[#E6FA50]" />
                    : <AlertCircle className="h-4 w-4 text-red-400" />
                  }
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-[#50C8C8]">{refund.bookingId}</span>
                    <EligibilityBadge eligible={refund.eligible} />
                    <RefundStatusBadge status={refund.status} />
                  </div>
                  <p className="text-sm text-[#F7F7F7]/70 mt-1">{refund.user}</p>
                  <p className="caption text-[#F7F7F7]/25 mt-0.5">{refund.venue}</p>
                  <p className="caption text-[#F7F7F7]/40 mt-2 italic">&ldquo;{refund.reason}&rdquo;</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <span className="caption flex items-center gap-1 text-[#F7F7F7]/25">
                      <Clock className="h-3 w-3" /> Booking: {refund.bookingDate}
                    </span>
                    <span className="caption flex items-center gap-1 text-[#F7F7F7]/25">
                      Requested: {refund.requestDate}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:shrink-0 sm:flex-col sm:items-end">
                <p className="price text-lg text-[#F7F7F7]">Rp {(refund.amount / 1000).toFixed(0)}K</p>
                {refund.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(refund.id)}
                      className="flex h-8 items-center gap-1.5 rounded-lg bg-[#E6FA50]/10 px-3 text-xs font-medium text-[#E6FA50] transition-colors hover:bg-[#E6FA50]/20"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(refund.id)}
                      className="flex h-8 items-center gap-1.5 rounded-lg bg-red-500/10 px-3 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
                    >
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-white/[0.06] bg-[#0C1B26] px-5 py-3 shadow-2xl">
          <p className="caption text-[#F7F7F7]/70">{toast}</p>
        </div>
      )}
    </div>
  );
}

function EligibilityBadge({ eligible }: { eligible: boolean }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
      eligible ? "bg-[#E6FA50]/10 text-[#E6FA50]" : "bg-red-500/10 text-red-400"
    }`}>
      {eligible ? "Eligible" : "Non-refundable"}
    </span>
  );
}

function RefundStatusBadge({ status }: { status: RefundRequest["status"] }) {
  const styles = {
    pending: "bg-amber-500/10 text-amber-400",
    approved: "bg-[#E6FA50]/10 text-[#E6FA50]",
    rejected: "bg-red-500/10 text-red-400",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] ${styles[status]}`}>
      {status}
    </span>
  );
}
