"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import { queryKeys } from "@/lib/queries";
import { getRefunds, approveRefund, rejectRefund, RefundStatus, ApiRefund } from "@/lib/api";

export default function RefundsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<RefundStatus | "ALL">("PENDING");
  const [toast, setToast] = useState<string | null>(null);

  const { data: refunds = [], isLoading } = useQuery({
    queryKey: queryKeys.refunds.list(filter === "ALL" ? undefined : filter),
    queryFn: () => getRefunds(filter === "ALL" ? undefined : filter),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => approveRefund(id, "Approved from admin dashboard"),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.refunds.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.refunds.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.refunds.history(data.id) });
      showToast("Refund approved — payment will be processed");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => rejectRefund(id, "Rejected from admin dashboard"),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.refunds.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.refunds.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.refunds.history(data.id) });
      showToast("Refund rejected");
    },
  });

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function handleApprove(id: string) {
    approveMutation.mutate(id);
  }

  function handleReject(id: string) {
    rejectMutation.mutate(id);
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
        {(["PENDING", "APPROVED", "REJECTED", "PROCESSED", "ALL"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`shrink-0 rounded-lg px-4 py-2 text-xs font-medium transition-all ${
              filter === tab
                ? "bg-[#E6FA50]/10 text-[#E6FA50]"
                : "text-[#F7F7F7]/40 hover:bg-white/[0.03] hover:text-[#F7F7F7]/70"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Refund list */}
      <div className="space-y-3">
        {isLoading && (
          <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-12 text-center">
            <p className="caption text-[#F7F7F7]/30">Loading refunds...</p>
          </div>
        )}
        {!isLoading && refunds.length === 0 && (
          <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-12 text-center">
            <p className="caption text-[#F7F7F7]/30">No refund requests in this category</p>
          </div>
        )}
        {!isLoading && refunds.map((refund) => (
          <div key={refund.id} className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  refund.status === "PENDING" ? "bg-amber-500/10" : "bg-[#E6FA50]/10"
                }`}>
                  {refund.status === "PENDING"
                    ? <AlertCircle className="h-4 w-4 text-amber-400" />
                    : <RotateCcw className="h-4 w-4 text-[#E6FA50]" />
                  }
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-[#50C8C8]">{refund.bookingId}</span>
                    <RefundStatusBadge status={refund.status} />
                  </div>
                  <p className="text-sm text-[#F7F7F7]/70 mt-1">
                    {refund.booking?.host?.name || refund.booking?.host?.email || "Unknown User"}
                  </p>
                  <p className="caption text-[#F7F7F7]/25 mt-0.5">
                    {refund.booking?.venue?.name || "Unknown Venue"}
                  </p>
                  <p className="caption text-[#F7F7F7]/40 mt-2 italic">&ldquo;{refund.reason}&rdquo;</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <span className="caption flex items-center gap-1 text-[#F7F7F7]/25">
                      <Clock className="h-3 w-3" /> Booking: {refund.booking?.bookingDate ? new Date(refund.booking.bookingDate).toLocaleDateString() : "—"}
                    </span>
                    <span className="caption flex items-center gap-1 text-[#F7F7F7]/25">
                      Requested: {new Date(refund.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:shrink-0 sm:flex-col sm:items-end">
                <p className="price text-lg text-[#F7F7F7]">Rp {(Number(refund.amount) / 1000).toFixed(0)}K</p>
                {refund.status === "PENDING" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(refund.id)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      className="flex h-8 items-center gap-1.5 rounded-lg bg-[#E6FA50]/10 px-3 text-xs font-medium text-[#E6FA50] transition-colors hover:bg-[#E6FA50]/20 disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(refund.id)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      className="flex h-8 items-center gap-1.5 rounded-lg bg-red-500/10 px-3 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
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

function RefundStatusBadge({ status }: { status: RefundStatus }) {
  const styles = {
    PENDING: "bg-amber-500/10 text-amber-400",
    APPROVED: "bg-[#E6FA50]/10 text-[#E6FA50]",
    REJECTED: "bg-red-500/10 text-red-400",
    PROCESSED: "bg-blue-500/10 text-blue-400",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] ${styles[status]}`}>
      {status}
    </span>
  );
}
