"use client";

import { useState } from "react";
import {
  AlertTriangle,
  UserCircle,
  Building2,
  Flag,
  CheckCircle2,
  UserPlus,
} from "lucide-react";
import { disputes, type Dispute } from "@/mock/admin";
import { EmptyState } from "@/components/ui/error-state";

const ISSUE_LABELS: Record<Dispute["issueType"], string> = {
  court_unavailable: "Court Unavailable",
  facility_mismatch: "Facility Mismatch",
  payment_issue: "Payment Issue",
  safety_concern: "Safety Concern",
  staff_behavior: "Staff Behavior",
};

const PRIORITY_STYLES: Record<Dispute["priority"], string> = {
  low: "bg-[#F7F7F7]/5 text-[#F7F7F7]/40",
  medium: "bg-amber-500/10 text-amber-400",
  high: "bg-orange-500/10 text-orange-400",
  critical: "bg-red-500/10 text-red-400",
};

const STATUS_STYLES: Record<Dispute["status"], string> = {
  open: "bg-red-500/10 text-red-400",
  investigating: "bg-[#50C8C8]/10 text-[#50C8C8]",
  resolved: "bg-[#E6FA50]/10 text-[#E6FA50]",
  closed: "bg-[#F7F7F7]/5 text-[#F7F7F7]/25",
};

export default function DisputesPage() {
  const [items, setItems] = useState<Dispute[]>(disputes);
  const [filter, setFilter] = useState<"all" | Dispute["status"]>("all");
  const [toast, setToast] = useState<string | null>(null);

  const filtered = items.filter((d) => filter === "all" ? true : d.status === filter);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function handleAssign(id: string) {
    setItems((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, assignedTo: "Admin You", status: "investigating" as const } : d
      )
    );
    showToast("Dispute assigned to you");
  }

  function handleResolve(id: string) {
    setItems((prev) =>
      prev.map((d) => d.id === id ? { ...d, status: "resolved" as const } : d)
    );
    showToast("Dispute marked as resolved");
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <p className="caption text-[#F7F7F7]/25">Support</p>
        <h1 className="heading-1 mt-2 text-2xl text-[#F7F7F7] md:text-3xl">
          Dispute <span className="text-[#E6FA50]">Handling</span>
        </h1>
      </div>

      {/* Filter tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto">
        {(["all", "open", "investigating", "resolved", "closed"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`shrink-0 rounded-lg px-4 py-2 text-xs font-medium capitalize transition-all ${
              filter === tab
                ? "bg-[#E6FA50]/10 text-[#E6FA50]"
                : "text-[#F7F7F7]/40 hover:bg-white/[0.03] hover:text-[#F7F7F7]/60"
            }`}
          >
            {tab} ({items.filter((d) => tab === "all" ? true : d.status === tab).length})
          </button>
        ))}
      </div>

      {/* Dispute list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <EmptyState
            icon={AlertTriangle}
            title="No disputes"
            description={filter === "all" ? "There are no disputes right now." : `No ${filter} disputes in this category.`}
          />
        )}
        {filtered.map((dispute) => (
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
                      <UserCircle className="h-3.5 w-3.5" /> {dispute.user}
                    </span>
                    <span className="caption flex items-center gap-1.5 text-[#F7F7F7]/25">
                      <Building2 className="h-3.5 w-3.5" /> {dispute.venue}
                    </span>
                    <span className="caption flex items-center gap-1.5 text-[#F7F7F7]/25">
                      <Flag className="h-3.5 w-3.5" /> {dispute.createdAt}
                    </span>
                  </div>
                  {dispute.assignedTo && (
                    <p className="caption mt-2 text-[#50C8C8]">Assigned to: {dispute.assignedTo}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 sm:shrink-0">
                {(dispute.status === "open" || dispute.status === "investigating") && (
                  <>
                    {!dispute.assignedTo && (
                      <button
                        onClick={() => handleAssign(dispute.id)}
                        className="flex h-8 items-center gap-1.5 rounded-lg bg-[#50C8C8]/10 px-3 text-xs font-medium text-[#50C8C8] transition-colors hover:bg-[#50C8C8]/20"
                      >
                        <UserPlus className="h-3.5 w-3.5" /> Assign
                      </button>
                    )}
                    <button
                      onClick={() => handleResolve(dispute.id)}
                      className="flex h-8 items-center gap-1.5 rounded-lg bg-[#E6FA50]/10 px-3 text-xs font-medium text-[#E6FA50] transition-colors hover:bg-[#E6FA50]/20"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Resolve
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-white/[0.06] bg-[#0C1B26] px-5 py-3 shadow-2xl">
          <p className="caption text-[#F7F7F7]/60">{toast}</p>
        </div>
      )}
    </div>
  );
}
