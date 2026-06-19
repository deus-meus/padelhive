"use client";

import { useState } from "react";
import { formatBookingDate, formatShortDate, formatBookingDateTime } from "@/lib/format";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ShieldCheck,
  ShieldX,
  Loader2,
  History,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { queryKeys } from "@/lib/queries";
import { getRefunds, approveRefund, rejectRefund, processRefund, getApiErrorMessage, RefundStatus, ApiRefund, getRefundHistory } from "@/lib/api";
import { ErrorBanner, EmptyState } from "@/components/ui/error-state";

const formatIDR = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);



export default function RefundsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<RefundStatus | "ALL">("PENDING");
  const [toast, setToast] = useState<string | null>(null);

  const [actingId, setActingId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: refunds = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: queryKeys.refunds.list(filter === "ALL" ? undefined : filter),
    queryFn: () => getRefunds(filter === "ALL" ? undefined : filter),
  });

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  const approveMutation = useMutation({
    mutationFn: (id: string) => approveRefund(id),
    onMutate: (id) => setActingId(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.refunds.all });
      showToast("Refund approved — now process it to issue the payout");
    },
    onError: (err) => showToast(getApiErrorMessage(err)),
    onSettled: () => setActingId(null),
  });

  const processMutation = useMutation({
    mutationFn: (id: string) => processRefund(id),
    onMutate: (id) => setActingId(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.refunds.all });
      showToast("Refund processed — payout issued to customer");
    },
    onError: (err) => showToast(getApiErrorMessage(err)),
    onSettled: () => setActingId(null),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) => rejectRefund(id, notes),
    onMutate: (vars) => setActingId(vars.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.refunds.all });
      setRejectTarget(null);
      showToast("Refund rejected");
    },
    onError: (err) => showToast(getApiErrorMessage(err)),
    onSettled: () => setActingId(null),
  });

  function handleApprove(id: string) {
    approveMutation.mutate(id);
  }

  function handleProcess(id: string) {
    processMutation.mutate(id);
  }

  return (
    <div className="flex flex-1 flex-col px-6 pb-6 pt-element lg:px-8 lg:pb-8">
      <div className="mb-8">
        <p className="caption text-[#E6FA50]">Financial</p>
        <h1 className="heading-1 mt-2 text-[#F7F7F7]">
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
              <p className="body-sm text-[#F7F7F7]/60">Full refund before H-1</p>
              <p className="caption text-[#F7F7F7]/25">Cancellation 24+ hours before booking</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.02] p-3">
            <ShieldX className="h-4 w-4 shrink-0 text-red-400" />
            <div>
              <p className="body-sm text-[#F7F7F7]/60">Non-refundable after H-1</p>
              <p className="caption text-[#F7F7F7]/25">Less than 24 hours before booking</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto no-scrollbar">
        {(["PENDING", "APPROVED", "REJECTED", "PROCESSED", "ALL"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`label shrink-0 rounded-lg px-4 py-2 transition-all ${
              filter === tab
                ? "bg-[#E6FA50]/10 text-[#E6FA50]"
                : "text-[#F7F7F7]/40 hover:bg-white/[0.03] hover:text-[#F7F7F7]/60"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Refund list */}
      <div className="flex flex-1 flex-col space-y-3">
        {isLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 w-full animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]" />
            ))}
          </>
        ) : isError ? (
          <ErrorBanner title="Couldn't load refunds" error={error} onRetry={() => refetch()} isRetrying={isFetching} />
        ) : refunds.length === 0 ? (
          <EmptyState
            icon={RotateCcw}
            title="No refunds found"
            description={filter === "PENDING" ? "There are no refund requests waiting for review." : "No refunds match the selected filter."}
          />
        ) : (
          refunds.map((refund) => {
            const isActing = actingId === refund.id;

            return (
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
                        <span className="body-sm text-[#F7F7F7]">
                          {refund.booking?.venue?.name ?? "Unknown venue"}
                        </span>
                        <RefundStatusBadge status={refund.status} />
                      </div>
                      <p className="caption text-[#F7F7F7]/40 mt-1">
                        {refund.booking?.court?.name ?? "Court"} · #{refund.bookingId.slice(0, 8)}
                      </p>
                      <p className="body-sm mt-1 text-[#F7F7F7]/60">
                        {refund.booking?.host?.name || refund.booking?.host?.email || "Unknown User"}
                      </p>
                      <p className="caption text-[#F7F7F7]/40 mt-2 italic">&ldquo;{refund.reason}&rdquo;</p>
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <span className="caption flex items-center gap-1 text-[#F7F7F7]/25">
                          <Clock className="h-3 w-3" /> Booking: {formatBookingDate(refund.booking?.bookingDate)}
                        </span>
                        <span className="caption flex items-center gap-1 text-[#F7F7F7]/25">
                          Requested: {formatShortDate(refund.createdAt)}
                        </span>
                      </div>
                      <div className="mt-3">
                        <button
                          onClick={() => setExpandedId(expandedId === refund.id ? null : refund.id)}
                          className="flex items-center gap-1.5 caption text-[#F7F7F7]/40 hover:text-[#F7F7F7]/60 transition-colors"
                        >
                          <History className="h-3 w-3" />
                          View history
                          {expandedId === refund.id ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                      {expandedId === refund.id && (
                        <div className="mt-4 border-t border-white/[0.06] pt-4">
                          <RefundHistoryTimeline refundId={refund.id} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:shrink-0 sm:flex-col sm:items-end">
                    <p className="price text-[#F7F7F7]">{formatIDR(Number(refund.amount))}</p>
                    {refund.status === "PENDING" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(refund.id)}
                          disabled={actingId !== null}
                          className="label flex h-8 min-w-[80px] items-center justify-center gap-1.5 rounded-lg bg-[#E6FA50]/10 px-3 text-[#E6FA50] transition-colors hover:bg-[#E6FA50]/20 disabled:opacity-50"
                        >
                          {isActing && approveMutation.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <><CheckCircle2 className="h-3.5 w-3.5" /> Approve</>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setRejectReason("");
                            setRejectTarget(refund.id);
                          }}
                          disabled={actingId !== null}
                          className="label flex h-8 min-w-[80px] items-center justify-center gap-1.5 rounded-lg bg-red-500/10 px-3 text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                        >
                          {isActing && rejectMutation.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <><XCircle className="h-3.5 w-3.5" /> Reject</>
                          )}
                        </button>
                      </div>
                    )}
                    {refund.status === "APPROVED" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleProcess(refund.id)}
                          disabled={actingId !== null}
                          className="label flex h-8 min-w-[120px] items-center justify-center gap-1.5 rounded-lg bg-[#50C8C8]/10 px-3 text-[#50C8C8] transition-colors hover:bg-[#50C8C8]/20 disabled:opacity-50"
                        >
                          {isActing && processMutation.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <><RotateCcw className="h-3.5 w-3.5" /> Process refund</>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reject Modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#06121A]/80 backdrop-blur-sm" onClick={() => setRejectTarget(null)} />
          <div className="relative w-full max-w-md rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 shadow-2xl">
            <h2 className="heading-2 text-xl text-[#F7F7F7]">Reject refund</h2>
            <div className="mt-4">
              <textarea
                rows={4}
                placeholder="Reason for rejection (required)..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="body w-full resize-none rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[#F7F7F7] placeholder:text-[#F7F7F7]/25 focus:border-[#E6FA50]/30 focus:outline-none"
              />
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
                disabled={rejectMutation.isPending}
                className="label flex-1 rounded-xl border border-white/[0.08] py-2.5 uppercase text-[#F7F7F7]/60 transition-colors hover:border-white/[0.15] hover:text-[#F7F7F7]/80 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => rejectMutation.mutate({ id: rejectTarget, notes: rejectReason.trim() })}
                disabled={!rejectReason.trim() || rejectMutation.isPending}
                className="label flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500/10 py-2.5 uppercase text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
              >
                {rejectMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-white/[0.06] bg-[#0C1B26] px-5 py-3 shadow-2xl">
          <p className="caption text-[#F7F7F7]/60">{toast}</p>
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
    <span className={`caption rounded-full px-2 py-0.5 uppercase ${styles[status]}`}>
      {status}
    </span>
  );
}

function RefundHistoryTimeline({ refundId }: { refundId: string }) {
  const { data: events = [], isLoading, isError, error } = useQuery({
    queryKey: queryKeys.refunds.history(refundId),
    queryFn: () => getRefundHistory(refundId),
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-4 w-full animate-pulse rounded bg-white/[0.04]" />
        <div className="h-4 w-full animate-pulse rounded bg-white/[0.04]" />
        <div className="h-4 w-full animate-pulse rounded bg-white/[0.04]" />
      </div>
    );
  }

  if (isError) {
    return <p className="caption text-[#F7F7F7]/40">{getApiErrorMessage(error)}</p>;
  }

  if (events.length === 0) {
    return <p className="caption text-[#F7F7F7]/40">No history recorded yet.</p>;
  }

  return (
    <div className="space-y-4">
      {events.map((event) => {
        const actorName = event.actor?.name || event.actor?.email || "System";
        const formattedTime = formatBookingDateTime(event.createdAt);

        return (
          <div key={event.id} className="border-l-2 border-white/[0.06] pl-4 relative">
            <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-[#E6FA50]" />
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {event.fromStatus ? (
                <RefundStatusBadge status={event.fromStatus} />
              ) : (
                <span className="caption text-[#F7F7F7]/40 uppercase tracking-[0.1em]">Requested</span>
              )}
              <span className="body-sm text-[#F7F7F7]/40">→</span>
              <RefundStatusBadge status={event.toStatus} />
            </div>
            <p className="caption text-[#F7F7F7]/40">
              {actorName} &middot; {formattedTime}
            </p>
            {event.notes && (
              <p className="caption italic text-[#F7F7F7]/60 mt-1">&ldquo;{event.notes}&rdquo;</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
