"use client";

import {
  DollarSign,
  Building2,
  Users,
  TrendingUp,
  ArrowUpRight,
  CalendarCheck,
  Clock,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { adminKPIs } from "@/mock/admin";

export default function AdminOverviewPage() {
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
        <KPI icon={TrendingUp} label="GMV This Month" value={formatCurrency(adminKPIs.gmv)} trend={adminKPIs.gmvTrend} trendUp />
        <KPI icon={DollarSign} label="Commission Revenue" value={formatCurrency(adminKPIs.commissionRevenue)} trend={adminKPIs.commissionTrend} trendUp />
        <KPI icon={CalendarCheck} label="Total Bookings" value={adminKPIs.totalBookings.toLocaleString()} trend={adminKPIs.bookingsTrend} trendUp />
        <KPI icon={Building2} label="Active Venues" value={adminKPIs.activeVenues.toString()} trend={adminKPIs.venuesTrend} trendUp />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
        <KPI icon={Clock} label="Pending Approvals" value={adminKPIs.pendingApprovals.toString()} variant="warning" />
        <KPI icon={RotateCcw} label="Refund Requests" value={adminKPIs.refundRequests.toString()} variant="warning" />
        <KPI icon={AlertTriangle} label="Open Disputes" value={adminKPIs.disputes.toString()} variant="danger" />
        <KPI icon={CheckCircle2} label="Payment Success" value={`${adminKPIs.paymentSuccessRate}%`} variant="success" />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <QuickStat label="Avg. Booking Value" value="Rp 420K" description="Per transaction average" />
        <QuickStat label="Venue Retention" value="92%" description="Active after 3 months" />
        <QuickStat label="Avg. Commission" value="10.5%" description="Weighted platform fee" />
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
        {trend && (
          <span className={`flex items-center gap-0.5 text-[10px] font-medium ${trendUp ? "text-[#E6FA50]" : "text-red-400"}`}>
            <ArrowUpRight className="h-3 w-3" />{trend}
          </span>
        )}
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
