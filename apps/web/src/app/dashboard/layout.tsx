"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  SquareStack,
  Clock,
  CalendarDays,
  TrendingUp,
  Menu,
  X,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { Navbar } from "@/components/shared/navbar";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/venues", label: "Venues", icon: Building2 },
  { href: "/dashboard/courts", label: "Courts & Pricing", icon: SquareStack },
  { href: "/dashboard/hours", label: "Operating Hours", icon: Clock },
  { href: "/dashboard/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/dashboard/revenue", label: "Revenue", icon: TrendingUp },
  { href: "/dashboard/refunds", label: "Refunds", icon: RotateCcw },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <RequireAuth allowedRoles={["venue_owner", "venue_admin"]}>
      <Navbar />
      <div className="min-h-screen pt-20">
        {/* Mobile nav toggle (Top Bar) */}
        <div className="flex h-16 items-center justify-between border-b border-white/[0.04] bg-[#06121A] px-4 lg:hidden">
          <span className="font-heading text-lg font-semibold text-[#F7F7F7]">Owner Dashboard</span>
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-[#F7F7F7]"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <div className="flex">
          {/* Sidebar — desktop */}
          <aside className="hidden lg:flex lg:w-[240px] lg:shrink-0 lg:flex-col lg:border-r lg:border-white/[0.04]">
            <nav className="sticky top-20 flex flex-col gap-1 p-5">
              <p className="section-label mb-4">Venue Owner</p>
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
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
                  <p className="section-label">Venue Owner</p>
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
                    item.href === "/dashboard"
                      ? pathname === "/dashboard"
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
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </RequireAuth>
  );
}
