"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  X,
  CalendarDays,
  LayoutDashboard,
  Shield,
  LogOut,
  Ticket,
  LogIn,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { getUserBookings, getVouchers } from "@/lib/api";
import { mockVouchers } from "@/mock/vouchers";
import { useAuthStore } from "@/stores/auth-store";

export function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    void logout();
    setAvatarOpen(false);
    setMobileOpen(false);
    router.push("/");
  }

  const showDashboard = user?.role === "venue_owner" || user?.role === "venue_admin";
  const showAdmin = user?.role === "super_admin";

  const isPlayer = !!user && !showDashboard && !showAdmin;

  const { data: upcomingBookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: queryKeys.bookings.user("upcoming"),
    queryFn: () => getUserBookings("upcoming"),
    enabled: isPlayer,
    staleTime: 60_000,
  });
  const nextBooking = upcomingBookings.find(
    (b) => b.status === "CONFIRMED" || b.status === "PENDING_PAYMENT"
  );

  const { data: vouchersData = [], isLoading: vouchersLoading } = useQuery({
    queryKey: queryKeys.vouchers.all(),
    queryFn: getVouchers,
    enabled: isPlayer,
    staleTime: 60_000,
  });
  const hasVoucherData = Boolean(vouchersData && vouchersData.length > 0);
  const voucherList = hasVoucherData ? vouchersData : mockVouchers;
  const activeVoucherCount = voucherList.filter((v) => v.isActive).length;

  return (
    <header
      className={`fixed top-0 z-50 w-full border-b transition-all duration-300 ease-out ${
        scrolled
          ? "bg-[#06121A]/90 backdrop-blur-xl border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.25)]"
          : "bg-transparent backdrop-blur-none border-transparent shadow-none"
      }`}
    >
      <div className="container flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-heading text-xl font-semibold tracking-[-0.02em] text-[#F7F7F7]">
            Padel<span className="text-[#E6FA50]">hive</span>
          </span>
        </Link>

        {!user && (
          <nav className="hidden items-center gap-8 md:flex">
            <NavLink href="/venues">Venues</NavLink>
            <NavLink href="/#how-it-works">How It Works</NavLink>
            <NavLink href="/#community">Community</NavLink>
          </nav>
        )}

        {isPlayer && (
          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/bookings"
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs text-[#F7F7F7]/60 transition-colors hover:border-white/20 hover:text-[#F7F7F7]"
            >
              <CalendarDays className="h-3.5 w-3.5 shrink-0 text-[#50C8C8]" />
              <span className="max-w-[200px] truncate">
                {bookingsLoading
                  ? "Loading…"
                  : nextBooking
                    ? `Next: ${nextBooking.venue?.name ?? "Court"} · ${nextBooking.bookingDate}`
                    : "No upcoming bookings"}
              </span>
            </Link>
            <Link
              href="/vouchers"
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs text-[#F7F7F7]/60 transition-colors hover:border-white/20 hover:text-[#F7F7F7]"
            >
              <Ticket className="h-3.5 w-3.5 shrink-0 text-[#50C8C8]" />
              <span>
                {activeVoucherCount} {activeVoucherCount === 1 ? "voucher" : "vouchers"}
              </span>
            </Link>
          </div>
        )}

        <div className="flex items-center gap-4">
          {user ? (
            <div ref={avatarRef} className="relative">
              <button
                onClick={() => setAvatarOpen(!avatarOpen)}
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-transparent transition-all hover:border-[#E6FA50]/30"
              >
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-full w-full rounded-full object-cover"
                />
              </button>

              {avatarOpen && (
                <div className="absolute right-0 top-12 w-56 rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-2 shadow-2xl">
                  <div className="px-3 py-2 mb-1">
                    <p className="text-sm font-medium text-[#F7F7F7]">{user.name}</p>
                    <p className="caption text-[#F7F7F7]/25">{user.email}</p>
                    <span className="mt-1 inline-block rounded-full bg-[#E6FA50]/10 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.1em] text-[#E6FA50]">
                      {user.role.replace("_", " ")}
                    </span>
                  </div>
                  <div className="border-t border-white/[0.04] my-1" />
                  {isPlayer && (
                    <Link
                      href="/bookings"
                      onClick={() => setAvatarOpen(false)}
                      className="flex items-start gap-3 rounded-xl px-3 py-2.5 text-sm text-[#F7F7F7]/60 transition-colors hover:bg-white/[0.03] hover:text-[#F7F7F7]"
                    >
                      <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-[#50C8C8]" />
                      <span className="min-w-0 flex-1">
                        <span className="block">Bookings</span>
                        <span className="block truncate text-[11px] text-[#F7F7F7]/25">
                          {bookingsLoading
                            ? "Loading…"
                            : nextBooking
                              ? `Next: ${nextBooking.venue?.name ?? "Court"} · ${nextBooking.bookingDate}`
                              : "No upcoming bookings"}
                        </span>
                      </span>
                    </Link>
                  )}
                  {showDashboard && (
                    <MenuLink href="/dashboard" icon={LayoutDashboard} onClick={() => setAvatarOpen(false)}>
                      Dashboard
                    </MenuLink>
                  )}
                  {showAdmin && (
                    <MenuLink href="/admin" icon={Shield} onClick={() => setAvatarOpen(false)}>
                      Admin Panel
                    </MenuLink>
                  )}
                  {isPlayer && (
                    <Link
                      href="/vouchers"
                      onClick={() => setAvatarOpen(false)}
                      className="flex items-start gap-3 rounded-xl px-3 py-2.5 text-sm text-[#F7F7F7]/60 transition-colors hover:bg-white/[0.03] hover:text-[#F7F7F7]"
                    >
                      <Ticket className="mt-0.5 h-4 w-4 shrink-0 text-[#50C8C8]" />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span>Vouchers</span>
                          {activeVoucherCount > 0 && (
                            <span className="rounded-full bg-[#E6FA50]/10 px-2 py-0.5 text-[10px] font-medium text-[#E6FA50]">
                              {activeVoucherCount}
                            </span>
                          )}
                        </span>
                        <span className="block truncate text-[11px] text-[#F7F7F7]/25">
                          {vouchersLoading && !hasVoucherData ? "Loading…" : `${activeVoucherCount} active`}
                        </span>
                      </span>
                    </Link>
                  )}
                  <div className="border-t border-white/[0.04] my-1" />
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400/70 transition-colors hover:bg-red-500/5 hover:text-red-400"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="btn-lime hidden h-10 items-center gap-2 rounded-full px-6 text-[11px] font-semibold uppercase tracking-[0.08em] md:inline-flex"
            >
              <LogIn className="h-4 w-4" /> Sign In
            </Link>
          )}

          {!user && (
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-[#F7F7F7] md:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}
        </div>
      </div>

      {mobileOpen && !user && (
        <div className="glass-nav border-t border-white/[0.06] md:hidden">
          <nav className="container flex flex-col gap-1 py-4">
            <MobileNavLink href="/venues" onClick={() => setMobileOpen(false)}>
              Venues
            </MobileNavLink>
            <MobileNavLink href="/#how-it-works" onClick={() => setMobileOpen(false)}>
              How It Works
            </MobileNavLink>
            <MobileNavLink href="/#community" onClick={() => setMobileOpen(false)}>
              Community
            </MobileNavLink>
            <Link
              href="/auth/login"
              onClick={() => setMobileOpen(false)}
              className="btn-lime mt-3 flex h-12 items-center justify-center gap-2 rounded-full text-[11px] font-semibold uppercase tracking-[0.08em]"
            >
              <LogIn className="h-4 w-4" /> Sign In
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="label text-[#F7F7F7]/60 transition-colors duration-200 hover:text-[#F7F7F7]"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex h-12 items-center rounded-xl px-4 label text-[#F7F7F7]/60 transition-colors hover:bg-white/5 hover:text-[#F7F7F7]"
    >
      {children}
    </Link>
  );
}

function MenuLink({
  href,
  icon: Icon,
  children,
  onClick,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#F7F7F7]/60 transition-colors hover:bg-white/[0.03] hover:text-[#F7F7F7]"
    >
      <Icon className="h-4 w-4 text-[#50C8C8]" /> {children}
    </Link>
  );
}
