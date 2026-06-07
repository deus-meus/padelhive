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
} from "lucide-react";
import { useState } from "react";
import { RequireAuth } from "@/components/auth/require-auth";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/venues", label: "Venue Approval", icon: Building2 },
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
    <div className="min-h-screen pt-20">
      <div className="flex">
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
                  className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-all duration-150 ${
                    isActive
                      ? "bg-[#E6FA50]/10 font-medium text-[#E6FA50]"
                      : "text-[#F7F7F7]/40 hover:bg-white/[0.03] hover:text-[#F7F7F7]/60"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="fixed bottom-6 right-6 z-40 lg:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E6FA50] text-[#06121A] shadow-lg shadow-[#E6FA50]/20"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

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
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-all ${
                      isActive
                        ? "bg-[#E6FA50]/10 font-medium text-[#E6FA50]"
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

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
    </RequireAuth>
  );
}
