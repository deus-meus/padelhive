"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Receipt,
  Percent,
  RotateCcw,
  AlertTriangle,
  BarChart3,
  Menu,
  X,
  Ticket,
} from "lucide-react";
import { useState } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { Navbar } from "@/components/shared/navbar";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/venues", label: "Venue Approval", icon: Building2 },
  { href: "/admin/vouchers", label: "Vouchers", icon: Ticket },
  { href: "/admin/transactions", label: "Transactions", icon: Receipt },
  { href: "/admin/commission", label: "Commission", icon: Percent },
  { href: "/admin/refunds", label: "Refunds", icon: RotateCcw },
  { href: "/admin/disputes", label: "Disputes", icon: AlertTriangle },
  { href: "/admin/metrics", label: "Metrics", icon: BarChart3 },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <RequireAuth allowedRoles={["super_admin"]}>
      <Navbar />
      <div className="min-h-screen pt-20">
        {/* Mobile nav toggle (Top Bar) */}
        <div className="flex h-16 items-center justify-between border-b border-white/[0.04] bg-[#06121A] px-4 lg:hidden">
          <span className="font-heading text-lg font-semibold text-[#F7F7F7]">Super Admin</span>
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-[#F7F7F7]"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1">
          {/* Sidebar — desktop */}
          <aside className="hidden lg:flex lg:w-[240px] lg:shrink-0 lg:flex-col lg:border-r lg:border-white/[0.04]">
            <nav className="sticky top-20 flex flex-col gap-1 p-5">
              <p className="section-label mb-4">Super Admin</p>
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`label flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all duration-150 ${ isActive ? "bg-[#E6FA50]/10 text-[#E6FA50]" : "text-[#F7F7F7]/40 hover:bg-white/[0.03] hover:text-[#F7F7F7]/60" }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Mobile sidebar overlay (Drawer) */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-[#06121A]/80 backdrop-blur-sm"
                onClick={() => setSidebarOpen(false)}
              />
              <nav className="absolute inset-y-0 left-0 w-[260px] flex flex-col gap-1 border-r border-white/[0.06] bg-[#0C1B26] p-5 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <p className="section-label">Super Admin</p>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[#F7F7F7]/60 hover:bg-white/[0.05] hover:text-[#F7F7F7]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`label flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all ${
                        isActive
                          ? "bg-[#E6FA50]/10 text-[#E6FA50]"
                          : "text-[#F7F7F7]/60 hover:bg-white/[0.03] hover:text-[#F7F7F7]/80"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}

          {/* Main content */}
          <main className="flex flex-1 flex-col min-w-0">{children}</main>
        </div>
      </div>
    </RequireAuth>
  );
}
