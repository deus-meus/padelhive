"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  UserCircle,
  Building2,
  Flag,
  CheckCircle2,
  UserPlus,
  XCircle,
  Loader2,
} from "lucide-react";
import { queryKeys } from "@/lib/queries";
import {
  getAdminDisputes,
  assignDispute,
  resolveDispute,
  closeDispute,
  getApiErrorMessage,
  type ApiDispute,
  type DisputeStatus,
} from "@/lib/api";
import { ErrorBanner, EmptyState } from "@/components/ui/error-state";
import { formatShortDate } from "@/lib/format";

const ISSUE_LABELS: Record<ApiDispute["issueType"], string> = {
  COURT_UNAVAILABLE: "Court Unavailable",
  FACILITY_MISMATCH: "Facility Mismatch",
  PAYMENT_ISSUE: "Payment Issue",
  SAFETY_CONCERN: "Safety Concern",
  STAFF_BEHAVIOR: "Staff Behavior",
};

const PRIORITY_STYLES: Record<ApiDispute["priority"], string> = {
  LOW: "bg-[#F7F7F7]/5 text-[#F7F7F7]/40",
  MEDIUM: "bg-amber-500/10 text-amber-400",
  HIGH: "bg-orange-500/10 text-orange-400",
  CRITICAL: "bg-red-500/10 text-red-400",
};

const STATUS_STYLES: Record<ApiDispute["status"], string> = {
  OPEN: "bg-red-500/10 text-red-400",
  INVESTIGATING: "bg-[#50C8C8]/10 text-[#50C8C8]",
  RESOLVED: "bg-[#E6FA50]/10 text-[#E6FA50]",
  CLOSED: "bg-[#F7F7F7]/5 text-[#F7F7F7]/25",
};

export default function DisputesPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<DisputeStatus | "ALL">("ALL");
  const [actingId, setActingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [resolveTarget, setResolveTarget] = useState<string | null>(null);
  const [resolveNotes, setResolveNotes] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  const {
    data: disputes = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: queryKeys.admin.disputes(filter === "ALL" ? undefined : filter),
    queryFn: () => getAdminDisputes(filter === "ALL" ? undefined : filter),
  });

  const assignMutation = useMutation({
    mutationFn: (id: string) => assignDispute(id),
    onMutate: (id) => setActingId(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "disputes"] });
      showToast("Dispute assigned to you");
    },
    onError: (err) => showToast(getApiErrorMessage(err)),
    onSettled: () => setActingId(null),
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => resolveDispute(id, notes),
    onMutate: (vars) => setActingId(vars.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "disputes"] });
      setResolveTarget(null);
      showToast("Dispute marked as resolved");
    },
    onError: (err) => showToast(getApiErrorMessage(err)),
    onSettled: () => setActingId(null),
  });

  const closeMutation = useMutation({
    mutationFn: (id: string) => closeDispute(id),
    onMutate: (id) => setActingId(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "disputes"] });
      showToast("Dispute closed");
    },
    onError: (err) => showToast(getApiErrorMessage(err)),
    onSettled: () => setActingId(null),
  });

  return (
    <div className="flex flex-1 flex-col p-6 lg:p-8 relative">
      <div className="mb-8">
        <p className="caption text-[#F7F7F7]/25">Support</p>
        <h1 className="heading-1 mt-2 text-2xl text-[#F7F7F7] md:text-3xl">
          Dispute <span className="text-[#E6FA50]">Handling</span>
        </h1>
      </div>

      {/* Filter tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto">
        {(["ALL", "OPEN", "INVESTIGATING", "RESOLVED", "CLOSED"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`shrink-0 rounded-lg px-4 py-2 text-xs font-medium capitalize transition-all ${
              filter === tab
                ? "bg-[#E6FA50]/10 text-[#E6FA50]"
                : "text-[#F7F7F7]/40 hover:bg-white/[0.03] hover:text-[#F7F7F7]/60"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Dispute list */}
      <div className="flex flex-1 flex-col space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 w-full animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]" />
          ))
        ) : isError ? (
          <ErrorBanner title="Couldn't load disputes" error={error} onRetry={() => refetch()} isRetrying={isFetching} />
        ) : disputes.length === 0 ? (
          <EmptyState
            icon={AlertTriangle}
            title="No disputes"
            description={filter === "ALL" ? "There are no disputes right now." : `No ${filter.toLowerCase()} disputes in this category.`}
          />
        ) : (
          disputes.map((dispute) => (
            <div key={dispute.id} className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] ${STATUS_STYLES[dispute.status]}`}>
                        {dispute.status}
                      </span>
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] ${PRIORITY_STYLES[dispute.priority]}`}>
                        {dispute.priority}
                      </span>
                      <span className="rounded-full bg-white/[0.04] px-2.5 py-0.5 text-[10px] font-medium text-[#F7F7F7]/40">
                        {ISSUE_LABELS[dispute.issueType]}
                      </span>
                    </div>
                    <p className="text-sm text-[#F7F7F7]/80 mt-2">{dispute.description}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-4">
                      <span className="caption flex items-center gap-1.5 text-[#F7F7F7]/25">
                        <UserCircle className="h-3.5 w-3.5" /> {dispute.user.name}
                      </span>
                      <span className="caption flex items-center gap-1.5 text-[#F7F7F7]/25">
                        <Building2 className="h-3.5 w-3.5" /> {dispute.venue.name}
                      </span>
                      <span className="caption flex items-center gap-1.5 text-[#F7F7F7]/25">
                        <Flag className="h-3.5 w-3.5" /> {formatShortDate(dispute.createdAt)}
                      </span>
                    </div>
                    {dispute.assignedTo && (
                      <p className="caption mt-2 text-[#50C8C8]">Assigned to: {dispute.assignedTo.name}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 sm:shrink-0">
                  {(dispute.status === "OPEN" || dispute.status === "INVESTIGATING") && !dispute.assignedTo && (
                    <button
                      onClick={() => assignMutation.mutate(dispute.id)}
                      disabled={actingId !== null}
                      className="flex h-8 items-center gap-1.5 rounded-lg bg-[#50C8C8]/10 px-3 text-xs font-medium text-[#50C8C8] transition-colors hover:bg-[#50C8C8]/20 disabled:opacity-50"
                    >
                      {actingId === dispute.id && assignMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />} Assign
                    </button>
                  )}
                  {(dispute.status === "OPEN" || dispute.status === "INVESTIGATING") && (
                    <button
                      onClick={() => {
                        setResolveNotes("");
                        setResolveTarget(dispute.id);
                      }}
                      disabled={actingId !== null}
                      className="flex h-8 items-center gap-1.5 rounded-lg bg-[#E6FA50]/10 px-3 text-xs font-medium text-[#E6FA50] transition-colors hover:bg-[#E6FA50]/20 disabled:opacity-50"
                    >
                      {actingId === dispute.id && resolveMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />} Resolve
                    </button>
                  )}
                  {dispute.status !== "CLOSED" && (
                    <button
                      onClick={() => closeMutation.mutate(dispute.id)}
                      disabled={actingId !== null}
                      className="flex h-8 items-center gap-1.5 rounded-lg bg-white/[0.04] px-3 text-xs font-medium text-[#F7F7F7]/60 transition-colors hover:bg-white/[0.08] hover:text-[#F7F7F7] disabled:opacity-50"
                    >
                      {actingId === dispute.id && closeMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />} Close
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Resolve modal */}
      {resolveTarget !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 shadow-2xl">
            <h2 className="heading-2 text-xl text-[#F7F7F7]">Resolve dispute</h2>
            <textarea
              value={resolveNotes}
              onChange={(e) => setResolveNotes(e.target.value)}
              placeholder="Resolution notes (optional)..."
              className="mt-4 w-full rounded-xl border border-white/[0.06] bg-black/20 p-4 text-sm text-[#F7F7F7] placeholder:text-[#F7F7F7]/25 focus:border-[#E6FA50]/50 focus:outline-none"
              rows={4}
            />
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setResolveTarget(null)}
                disabled={resolveMutation.isPending}
                className="rounded-lg px-4 py-2 text-sm font-medium text-[#F7F7F7]/60 hover:bg-white/[0.04] hover:text-[#F7F7F7]"
              >
                Cancel
              </button>
              <button
                onClick={() => resolveMutation.mutate({ id: resolveTarget, notes: resolveNotes.trim() || undefined })}
                disabled={resolveMutation.isPending}
                className="flex items-center gap-2 rounded-lg bg-[#E6FA50]/10 px-4 py-2 text-sm font-medium text-[#E6FA50] hover:bg-[#E6FA50]/20 disabled:opacity-50"
              >
                {resolveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirm Resolve
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
