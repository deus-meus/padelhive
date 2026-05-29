"use client";

import Link from "next/link";
import { LogIn } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import type { UserRole } from "@/types";

function getRoleDestination(role: UserRole) {
  if (role === "super_admin") return { href: "/admin", label: "Go to Admin" };
  if (role === "venue_owner" || role === "venue_admin") return { href: "/dashboard", label: "Go to Dashboard" };
  return { href: "/bookings", label: "Go to My Bookings" };
}

export function RequireAuth({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}) {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-28 pb-16">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E6FA50]/10">
            <LogIn className="h-7 w-7 text-[#E6FA50]" />
          </div>
          <h2 className="heading-2 text-xl text-[#F7F7F7] mb-2">Sign in required</h2>
          <p className="text-sm text-[#F7F7F7]/40 mb-6">
            You need to be signed in to access this page.
          </p>
          <Link
            href="/auth/login"
            className="btn-lime inline-flex h-11 items-center gap-2 rounded-full px-8 text-[11px] font-semibold uppercase tracking-[0.08em]"
          >
            <LogIn className="h-3.5 w-3.5" />
            Sign In to Continue
          </Link>
        </div>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const destination = getRoleDestination(user.role);

    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-28 pb-16">
        <div className="w-full max-w-sm text-center">
          <h2 className="heading-2 text-xl text-[#F7F7F7] mb-2">Access denied</h2>
          <p className="text-sm text-[#F7F7F7]/40 mb-6">
            Your current role cannot view this page. Continue to your workspace instead.
          </p>
          <Link
            href={destination.href}
            className="btn-outline-white inline-flex h-11 items-center rounded-full px-8 text-[11px] font-semibold uppercase tracking-[0.08em]"
          >
            {destination.label}
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
