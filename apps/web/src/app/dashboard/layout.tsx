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
} from "lucide-react";
import { useState } from "react";
import { RequireAuth } from "@/components/auth/require-auth";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/venues", label: "Venues", icon: Building2 },
  { href: "/dashboard/courts", label: "Courts & Pricing", icon: SquareStack },
  { href: "/dashboard/hours", label: "Operating Hours", icon: Clock },
  { href: "/dashboard/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/dashboard/revenue", label: "Revenue", icon: TrendingUp },
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
    <div className="min-h-screen pt-20">
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
                  className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-all duration-150 ${
                    isActive
                      ? "bg-[#E6FA50]/10 font-medium text-[#E6FA50]"
                      : "text-[#F7F7F7]/40 hover:bg-white/[0.03] hover:text-[#F7F7F7]/70"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile nav toggle */}
        <div className="fixed bottom-6 right-6 z-40 lg:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E6FA50] text-[#06121A] shadow-lg shadow-[#E6FA50]/20"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 lg:hidden">
            <div
              className="absolute inset-0 bg-[#06121A]/80 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <nav className="absolute bottom-20 right-6 flex flex-col gap-1 rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-4 shadow-2xl">
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
                    className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-all ${
                      isActive
                        ? "bg-[#E6FA50]/10 font-medium text-[#E6FA50]"
                        : "text-[#F7F7F7]/50 hover:bg-white/[0.03] hover:text-[#F7F7F7]/70"
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
