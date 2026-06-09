"use client";

import { useState } from "react";
import {
  Building2,
  CheckCircle2,
  Clock,
  MapPin,
  XCircle,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { getAdminVenues, updateVenueStatus, getApiErrorMessage } from "@/lib/api";
import { Venue } from "@/types";
import { ErrorBanner, EmptyState } from "@/components/ui/error-state";

type TabValue = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED" | "ALL";

const STATUS_CONFIG: Record<string, { label: string; icon: LucideIcon; color: string; bg: string }> = {
  APPROVED: { label: "Approved", icon: CheckCircle2, color: "text-green-400", bg: "bg-green-400/10" },
  PENDING: { label: "Pending Review", icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10" },
  REJECTED: { label: "Rejected", icon: XCircle, color: "text-red-400", bg: "bg-red-400/10" },
  SUSPENDED: { label: "Suspended", icon: XCircle, color: "text-orange-400", bg: "bg-orange-400/10" },
};

const TABS: { label: string; value: TabValue }[] = [
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Suspended", value: "SUSPENDED" },
  { label: "All", value: "ALL" },
];

export default function AdminVenuesPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabValue>("PENDING");
  const [toast, setToast] = useState<string | null>(null);
  const [inFlightId, setInFlightId] = useState<string | null>(null);

  const { data: venues = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: queryKeys.admin.venues(activeTab),
    queryFn: () => getAdminVenues(activeTab === "ALL" ? undefined : (activeTab as any)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: any }) => updateVenueStatus(id, status),
    onMutate: (vars) => setInFlightId(vars.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "venues"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.overview() });
      showToast("Venue status updated.");
    },
    onError: (err) => {
      showToast(getApiErrorMessage(err));
    },
    onSettled: () => {
      setInFlightId(null);
    },
  });

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <div className="px-6 pb-6 pt-element lg:px-8 lg:pb-8">
      {/* Header */}
      <div className="mb-8">
        <p className="caption text-[#E6FA50]">Marketplace Admin</p>
        <h1 className="heading-1 mt-2 text-3xl text-[#F7F7F7] sm:text-4xl">
          Venue <span className="text-[#E6FA50]">Approval</span>
        </h1>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex overflow-x-auto border-b border-white/[0.08] no-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? "border-[#E6FA50] text-[#F7F7F7]"
                : "border-transparent text-[#F7F7F7]/40 hover:text-[#F7F7F7]/80"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Venue List */}
      <div className="space-y-4">
        {isLoading ? (
          <>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl border border-white/[0.06] bg-[#0C1B26]" />
            ))}
          </>
        ) : isError ? (
          <ErrorBanner title="Couldn't load venues" error={error} onRetry={() => refetch()} isRetrying={isFetching} />
        ) : venues.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No venues found"
            description={
              activeTab === "PENDING"
                ? "There are no venues waiting for approval."
                : "No venues match the selected status."
            }
          />
        ) : (
          venues.map((venue) => {
            const isUpdating = inFlightId === venue.id;
            const status = venue.status ?? "PENDING";
            const config = STATUS_CONFIG[status] ?? STATUS_CONFIG["PENDING"];
            const StatusIcon = config.icon;

            return (
              <div
                key={venue.id}
                className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 transition-all"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="heading-2 text-lg text-[#F7F7F7] truncate">
                        {venue.name}
                      </h3>
                      <div className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 ${config.bg}`}>
                        <StatusIcon className={`h-3 w-3 ${config.color}`} />
                        <span className={`text-[9px] font-medium uppercase tracking-[0.1em] ${config.color}`}>
                          {config.label}
                        </span>
                      </div>
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-[#F7F7F7]/40">
                      <MapPin className="h-3.5 w-3.5" />
                      {venue.location} · {venue.city}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {status === "PENDING" && (
                      <>
                        <button
                          onClick={() => updateMutation.mutate({ id: venue.id, status: "REJECTED" })}
                          disabled={isUpdating}
                          className="flex h-9 items-center justify-center rounded-full border border-red-500/50 px-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                        >
                          {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Reject"}
                        </button>
                        <button
                          onClick={() => updateMutation.mutate({ id: venue.id, status: "APPROVED" })}
                          disabled={isUpdating}
                          className="btn-lime flex h-9 items-center justify-center rounded-full px-5 text-[11px] font-semibold uppercase tracking-[0.08em] disabled:opacity-50"
                        >
                          {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Approve"}
                        </button>
                      </>
                    )}
                    {status === "APPROVED" && (
                      <button
                        onClick={() => updateMutation.mutate({ id: venue.id, status: "SUSPENDED" })}
                        disabled={isUpdating}
                        className="flex h-9 items-center justify-center rounded-full border border-orange-500/50 px-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-orange-400 transition-colors hover:bg-orange-500/10 disabled:opacity-50"
                      >
                        {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Suspend"}
                      </button>
                    )}
                    {status === "REJECTED" && (
                      <button
                        onClick={() => updateMutation.mutate({ id: venue.id, status: "APPROVED" })}
                        disabled={isUpdating}
                        className="btn-lime flex h-9 items-center justify-center rounded-full px-5 text-[11px] font-semibold uppercase tracking-[0.08em] disabled:opacity-50"
                      >
                        {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Approve"}
                      </button>
                    )}
                    {status === "SUSPENDED" && (
                      <button
                        onClick={() => updateMutation.mutate({ id: venue.id, status: "APPROVED" })}
                        disabled={isUpdating}
                        className="btn-lime flex h-9 items-center justify-center rounded-full px-5 text-[11px] font-semibold uppercase tracking-[0.08em] disabled:opacity-50"
                      >
                        {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Reactivate"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-white/[0.08] bg-[#0C1B26] px-5 py-3 shadow-2xl shadow-black/40">
          <p className="text-sm text-[#F7F7F7]/60">{toast}</p>
        </div>
      )}
    </div>
  );
}
