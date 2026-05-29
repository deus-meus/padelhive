"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  MapPin,
  Star,
  CheckCircle2,
  Clock,
  XCircle,
  FileEdit,
  Edit3,
  Eye,
  MoreVertical,
} from "lucide-react";
import { mockVenues } from "@/mock/venues";
import { mockCourts } from "@/mock/courts";

type ApprovalStatus = "approved" | "pending" | "rejected" | "draft";

const VENUE_STATUS: Record<string, ApprovalStatus> = {
  "venue-1": "approved",
  "venue-2": "approved",
  "venue-3": "pending",
};

const STATUS_CONFIG: Record<ApprovalStatus, { label: string; icon: typeof CheckCircle2; color: string; bg: string }> = {
  approved: { label: "Approved", icon: CheckCircle2, color: "text-green-400", bg: "bg-green-400/10" },
  pending: { label: "Pending Review", icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10" },
  rejected: { label: "Rejected", icon: XCircle, color: "text-red-400", bg: "bg-red-400/10" },
  draft: { label: "Draft", icon: FileEdit, color: "text-[#F7F7F7]/40", bg: "bg-white/[0.04]" },
};

export default function VenueManagementPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  return (
    <div className="py-8">
      <section className="container">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-1 text-2xl text-[#F7F7F7] md:text-3xl">
              Venues
            </h1>
            <p className="mt-1 text-sm text-[#F7F7F7]/40">
              Manage your padel venues
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-lime flex h-10 items-center gap-2 rounded-full px-5 text-[11px] font-semibold uppercase tracking-[0.08em]"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Venue
          </button>
        </div>

        {/* Venue List */}
        <div className="mt-8 space-y-4">
          {mockVenues.map((venue) => {
            const courts = mockCourts.filter((c) => c.venueId === venue.id);
            const status = VENUE_STATUS[venue.id] ?? "pending";
            const config = STATUS_CONFIG[status];
            const StatusIcon = config.icon;

            return (
              <div
                key={venue.id}
                className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 transition-all hover:border-white/[0.1]"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="heading-2 text-lg text-[#F7F7F7] truncate">
                        {venue.name}
                      </h3>
                      {venue.isVerified && (
                        <span className="shrink-0 rounded-full bg-[#E6FA50] px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.1em] text-[#06121A]">
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-[#F7F7F7]/35">
                      <MapPin className="h-3.5 w-3.5" />
                      {venue.location} · {venue.city}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-4">
                      <span className="flex items-center gap-1.5 text-xs text-[#F7F7F7]/30">
                        <Star className="h-3 w-3 fill-[#E6FA50] text-[#E6FA50]" />
                        {venue.rating} ({venue.reviewCount})
                      </span>
                      <span className="text-xs text-[#F7F7F7]/30">
                        {courts.length} courts
                      </span>
                      <span className="text-xs text-[#F7F7F7]/30">
                        {venue.operatingHours.open} – {venue.operatingHours.close}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 ${config.bg}`}>
                      <StatusIcon className={`h-3.5 w-3.5 ${config.color}`} />
                      <span className={`text-[11px] font-medium ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                    <Link
                      href={`/venues/${venue.id}`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] text-[#F7F7F7]/30 transition-colors hover:border-white/[0.12] hover:text-[#F7F7F7]/60"
                      title="View venue"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      onClick={() => showToast("Edit venue coming soon in backend integration.")}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] text-[#F7F7F7]/30 transition-colors hover:border-white/[0.12] hover:text-[#F7F7F7]/60"
                      title="Edit venue"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => showToast("More options coming soon in backend integration.")}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] text-[#F7F7F7]/30 transition-colors hover:border-white/[0.12] hover:text-[#F7F7F7]/60"
                    >
                      <MoreVertical className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Facilities */}
                <div className="mt-4 flex flex-wrap gap-2 border-t border-white/[0.04] pt-4">
                  {venue.facilities.map((f) => (
                    <span
                      key={f}
                      className="rounded-full bg-white/[0.03] px-3 py-1 text-[10px] font-medium text-[#F7F7F7]/30"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Venue Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-[#06121A]/80 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />
            <div className="relative w-full max-w-md rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-8 shadow-2xl">
              <h2 className="heading-2 text-xl text-[#F7F7F7]">Add New Venue</h2>
              <p className="mt-2 text-sm text-[#F7F7F7]/35">
                Submit your venue for approval
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="caption text-[#F7F7F7]/40">Venue Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Padel Bali Arena"
                    className="mt-1.5 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-[#F7F7F7] placeholder:text-[#F7F7F7]/20 focus:border-[#E6FA50]/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="caption text-[#F7F7F7]/40">Location</label>
                  <input
                    type="text"
                    placeholder="Full address"
                    className="mt-1.5 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-[#F7F7F7] placeholder:text-[#F7F7F7]/20 focus:border-[#E6FA50]/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="caption text-[#F7F7F7]/40">City</label>
                  <select className="mt-1.5 w-full appearance-none rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-[#F7F7F7] focus:border-[#E6FA50]/30 focus:outline-none">
                    <option value="Bali" className="bg-[#0C1B26]">Bali</option>
                    <option value="Jakarta" className="bg-[#0C1B26]">Jakarta</option>
                    <option value="Surabaya" className="bg-[#0C1B26]">Surabaya</option>
                  </select>
                </div>
                <div>
                  <label className="caption text-[#F7F7F7]/40">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe your venue..."
                    className="mt-1.5 w-full resize-none rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-[#F7F7F7] placeholder:text-[#F7F7F7]/20 focus:border-[#E6FA50]/30 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-full border border-white/[0.08] py-3 text-[11px] font-medium uppercase tracking-[0.08em] text-[#F7F7F7]/50 transition-colors hover:border-white/[0.15] hover:text-[#F7F7F7]/70"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    showToast("Venue submitted for approval.");
                  }}
                  className="btn-lime flex-1 rounded-full py-3 text-[11px] font-semibold uppercase tracking-[0.08em]"
                >
                  Submit for Approval
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-white/[0.08] bg-[#0C1B26] px-5 py-3 shadow-2xl shadow-black/40">
            <p className="text-sm text-[#F7F7F7]/70">{toast}</p>
          </div>
        )}
      </section>
    </div>
  );
}
