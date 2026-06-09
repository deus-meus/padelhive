"use client";

import {
  DollarSign,
  Building2,
  CalendarCheck,
  Clock,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAdminOverview } from "@/lib/api";
import { queryKeys } from "@/lib/queries";
import { ErrorState } from "@/components/ui/error-state";

export default function AdminOverviewPage() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: queryKeys.admin.overview(),
    queryFn: getAdminOverview,
  });

  if (isLoading) {
    return (
      <div className="px-6 pb-6 pt-element lg:px-8 lg:pb-8 space-y-8">
        <div className="mb-8">
          <div className="h-4 w-32 animate-pulse rounded bg-white/[0.04] mb-2" />
          <div className="h-8 w-64 animate-pulse rounded bg-white/[0.04]" />
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-white/[0.04]" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-white/[0.04]" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-white/[0.04]" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="px-6 pb-6 pt-element lg:px-8 lg:pb-8">
        <ErrorState
          title="Couldn't load admin metrics"
          description="We couldn't reach the server to load platform metrics. Check your connection and try again."
          onRetry={() => refetch()}
          isRetrying={isFetching}
        />
      </div>
    );
  }

  return (
    <div className="px-6 pb-6 pt-element lg:px-8 lg:pb-8">
      <div className="mb-8">
        <p className="caption text-[#F7F7F7]/25">Marketplace Admin</p>
        <h1 className="heading-1 mt-2 text-2xl text-[#F7F7F7] md:text-3xl">
          Operations <span className="text-[#E6FA50]">Overview</span>
        </h1>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
        <KPI icon={TrendingUp} label="GMV This Month" value={formatCurrency(data.gmv)} />
        <KPI icon={DollarSign} label="Commission Revenue" value={formatCurrency(data.commissionRevenue)} />
        <KPI icon={CalendarCheck} label="Total Bookings" value={data.totalBookings.toLocaleString()} />
        <KPI icon={Building2} label="Active Venues" value={data.activeVenues.toString()} />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 mb-8">
        <KPI icon={Clock} label="Pending Approvals" value={data.pendingApprovals.toString()} variant="warning" />
        <KPI icon={RotateCcw} label="Refund Requests" value={data.refundRequests.toString()} variant="warning" />
        <KPI icon={CheckCircle2} label="Payment Success" value={`${data.paymentSuccessRate}%`} variant="success" />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <QuickStat label="Avg. Booking Value" value={formatCurrency(data.avgBookingValue)} description="Per transaction average, this month" />
        <QuickStat label="Avg. Commission" value={`${data.avgCommissionRate.toFixed(1)}%`} description="Weighted platform fee" />
      </div>
    </div>
  );
}

function formatCurrency(amount: number): string {
  if (amount >= 1_000_000_000) return `Rp ${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `Rp ${(amount / 1_000).toFixed(0)}K`;
  return `Rp ${amount}`;
}

function KPI({
  icon: Icon,
  label,
  value,
  trend,
  trendUp,
  variant,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  variant?: "warning" | "danger" | "success";
}) {
  const iconColor = variant === "danger"
    ? "text-red-400"
    : variant === "warning"
    ? "text-amber-400"
    : variant === "success"
    ? "text-[#E6FA50]"
    : "text-[#50C8C8]";

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5">
      <div className="flex items-center justify-between">
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <p className="metric mt-3 text-2xl text-[#F7F7F7]">{value}</p>
      <p className="caption mt-1 text-[#F7F7F7]/25">{label}</p>
    </div>
  );
}

function QuickStat({ label, value, description }: { label: string; value: string; description: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-6 text-center">
      <p className="metric text-3xl text-[#E6FA50]">{value}</p>
      <p className="heading-3 mt-2 text-sm text-[#F7F7F7]">{label}</p>
      <p className="caption mt-1 text-[#F7F7F7]/25">{description}</p>
    </div>
  );
}
