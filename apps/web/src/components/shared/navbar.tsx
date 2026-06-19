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
import { NotificationBell } from "./notification-bell";
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

  const { data: vouchersData = [] } = useQuery({
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
          <span className="heading-3 text-[#F7F7F7]">
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



        <div className="flex items-center gap-4">
          {isPlayer && (
            <div className="flex items-center gap-1">
              <Link
                href="/bookings"
                aria-label="Bookings"
                title={
                  bookingsLoading
                    ? "Loading bookings…"
                    : nextBooking
                      ? `Next: ${nextBooking.venue?.name ?? "Court"} · ${nextBooking.bookingDate}`
                      : "No upcoming bookings"
                }
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#F7F7F7]/60 transition-colors hover:bg-white/[0.05] hover:text-[#F7F7F7]"
              >
                <CalendarDays className="h-[18px] w-[18px]" />
                {nextBooking && (
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#E6FA50] ring-2 ring-[#06121A]" />
                )}
              </Link>
              <Link
                href="/vouchers"
                aria-label="Vouchers"
                title={`${activeVoucherCount} active voucher${activeVoucherCount === 1 ? "" : "s"}`}
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#F7F7F7]/60 transition-colors hover:bg-white/[0.05] hover:text-[#F7F7F7]"
              >
                <Ticket className="h-[18px] w-[18px]" />
                {activeVoucherCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#E6FA50] px-1 caption text-[#06121A]">
                    {activeVoucherCount}
                  </span>
                )}
              </Link>
            </div>
          )}
          {user && <NotificationBell enabled={!!user} />}
          {user ? (
            <div ref={avatarRef} className="relative">
              <button
                onClick={() => setAvatarOpen(!avatarOpen)}
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-transparent transition-all hover:border-[#E6FA50]/30"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center rounded-full bg-[#E6FA50]/10 label text-[#E6FA50]">
                    {user.name?.trim().charAt(0).toUpperCase() || "?"}
                  </span>
                )}
              </button>

              {avatarOpen && (
                <div className="absolute right-0 top-12 w-56 rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-2 shadow-2xl">
                  <div className="px-3 py-2 mb-1">
                    <p className="label text-[#F7F7F7]">{user.name}</p>
                    <p className="caption text-[#F7F7F7]/25">{user.email}</p>
                    <span className="mt-1 inline-block rounded-full bg-[#E6FA50]/10 px-2 py-0.5 caption uppercase text-[#E6FA50]">
                      {user.role.replace("_", " ")}
                    </span>
                  </div>
                  <div className="border-t border-white/[0.04] my-1" />

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

                  <div className="border-t border-white/[0.04] my-1" />
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 label text-red-400/70 transition-colors hover:bg-red-500/5 hover:text-red-400"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="btn-lime hidden h-10 items-center gap-2 rounded-full px-6 label md:inline-flex"
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
              className="btn-lime mt-3 flex h-12 items-center justify-center gap-2 rounded-full label"
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
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 label text-[#F7F7F7]/60 transition-colors hover:bg-white/[0.03] hover:text-[#F7F7F7]"
    >
      <Icon className="h-4 w-4 text-[#50C8C8]" /> {children}
    </Link>
  );
}
