"use client";

import { useState } from "react";
import {
  Building2,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  MapPin,
  Calendar,
  Users,
} from "lucide-react";
import { venueApprovals, type VenueApproval } from "@/mock/admin";

export default function VenueApprovalPage() {
  const [venues, setVenues] = useState<VenueApproval[]>(venueApprovals);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [toast, setToast] = useState<string | null>(null);
  const [detailModal, setDetailModal] = useState<VenueApproval | null>(null);

  const filtered = venues.filter((v) => filter === "all" ? true : v.status === filter);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function handleApprove(id: string) {
    setVenues((prev) => prev.map((v) => v.id === id ? { ...v, status: "approved" as const } : v));
    showToast("Venue approved successfully");
  }

  function handleReject(id: string) {
    setVenues((prev) => prev.map((v) => v.id === id ? { ...v, status: "rejected" as const } : v));
    showToast("Venue rejected");
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <p className="caption text-[#F7F7F7]/25">Venue Management</p>
        <h1 className="heading-1 mt-2 text-2xl text-[#F7F7F7] md:text-3xl">
          Venue <span className="text-[#E6FA50]">Approval</span>
        </h1>
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
                : "text-[#F7F7F7]/40 hover:bg-white/[0.03] hover:text-[#F7F7F7]/60"
            }`}
          >
            {tab} ({venues.filter((v) => tab === "all" ? true : v.status === tab).length})
          </button>
        ))}
      </div>

      {/* Venue list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-12 text-center">
            <p className="caption text-[#F7F7F7]/25">No venues in this category</p>
          </div>
        )}
        {filtered.map((venue) => (
          <div key={venue.id} className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E6FA50]/10">
                  <Building2 className="h-4 w-4 text-[#E6FA50]" />
                </div>
                <div className="min-w-0">
                  <p className="heading-3 text-sm text-[#F7F7F7]">{venue.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-3">
                    <span className="caption flex items-center gap-1 text-[#F7F7F7]/25">
                      <Users className="h-3 w-3" /> {venue.ownerName}
                    </span>
                    <span className="caption flex items-center gap-1 text-[#F7F7F7]/25">
                      <MapPin className="h-3 w-3" /> {venue.city}
                    </span>
                    <span className="caption flex items-center gap-1 text-[#F7F7F7]/25">
                      <Calendar className="h-3 w-3" /> {venue.submittedAt}
                    </span>
                    <span className="caption flex items-center gap-1 text-[#F7F7F7]/25">
                      <FileText className="h-3 w-3" /> {venue.documents.length} docs
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:shrink-0">
                <StatusBadge status={venue.status} />
                {venue.status === "pending" && (
                  <>
                    <button
                      onClick={() => setDetailModal(venue)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-[#F7F7F7]/60 transition-colors hover:bg-white/[0.08] hover:text-[#F7F7F7]"
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleApprove(venue.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E6FA50]/10 text-[#E6FA50] transition-colors hover:bg-[#E6FA50]/20"
                      title="Approve"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleReject(venue.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-400 transition-colors hover:bg-red-500/20"
                      title="Reject"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#06121A]/80 backdrop-blur-sm" onClick={() => setDetailModal(null)} />
          <div className="relative w-full max-w-lg rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 shadow-2xl">
            <h2 className="heading-2 text-lg text-[#F7F7F7]">{detailModal.name}</h2>
            <div className="mt-4 space-y-3">
              <DetailRow label="Owner" value={detailModal.ownerName} />
              <DetailRow label="City" value={detailModal.city} />
              <DetailRow label="Courts" value={`${detailModal.courts} courts`} />
              <DetailRow label="Submitted" value={detailModal.submittedAt} />
              <div>
                <p className="caption text-[#F7F7F7]/25 mb-2">Documents</p>
                <div className="space-y-1">
                  {detailModal.documents.length > 0 ? detailModal.documents.map((doc) => (
                    <div key={doc} className="flex items-center gap-2 rounded-lg bg-white/[0.02] px-3 py-2">
                      <FileText className="h-3.5 w-3.5 text-[#50C8C8]" />
                      <span className="caption text-[#F7F7F7]/60">{doc}</span>
                    </div>
                  )) : (
                    <p className="caption text-[#F7F7F7]/25">No documents uploaded</p>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => { handleApprove(detailModal.id); setDetailModal(null); }}
                className="btn-lime flex-1 rounded-xl px-4 py-2.5 text-sm"
              >
                Approve
              </button>
              <button
                onClick={() => { handleReject(detailModal.id); setDetailModal(null); }}
                className="flex-1 rounded-xl border border-red-500/30 px-4 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/10"
              >
                Reject
              </button>
              <button
                onClick={() => setDetailModal(null)}
                className="btn-outline-white rounded-xl px-4 py-2.5 text-sm"
              >
                Close
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

function StatusBadge({ status }: { status: "pending" | "approved" | "rejected" }) {
  const styles = {
    pending: "bg-amber-500/10 text-amber-400",
    approved: "bg-[#E6FA50]/10 text-[#E6FA50]",
    rejected: "bg-red-500/10 text-red-400",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] ${styles[status]}`}>
      {status}
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2">
      <span className="caption text-[#F7F7F7]/25">{label}</span>
      <span className="caption text-[#F7F7F7]/60">{value}</span>
    </div>
  );
}
