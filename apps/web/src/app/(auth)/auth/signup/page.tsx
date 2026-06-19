"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, User as UserIcon, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { getUserFacingErrorMessage } from "@/lib/errors";

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#E6FA50]" />
      </div>
    }>
      <SignupContent />
    </Suspense>
  );
}

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const { registerWithEmail, isLoading } = useAuthStore();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (isLoading) return;
    setError(null);
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }
    try {
      await registerWithEmail(name, email, password);
      // Let the onAuthStateChanged handle redirect or user mapping
      router.push(nextPath || "/venues");
    } catch (err: unknown) {
      const msg = getUserFacingErrorMessage(err);
      setError(msg || null);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block">
            <span className="font-heading text-3xl font-bold tracking-[-0.02em] text-[#F7F7F7]">
              Padel<span className="text-[#E6FA50]">hive</span>
            </span>
          </Link>
          <p className="body-lg mt-3 text-[#F7F7F7]/40">
            Create an account to start booking courts.
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-8">
          <h1 className="heading-2 text-[#F7F7F7] text-center mb-6">Sign Up</h1>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
              <p className="body text-red-100/80">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4 mb-6">
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#F7F7F7]/25" />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                required
                className="body w-full rounded-xl border border-white/[0.06] bg-white/[0.02] py-3 pl-11 pr-4 text-[#F7F7F7] placeholder:text-[#F7F7F7]/25 focus:border-[#E6FA50]/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#F7F7F7]/25" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="body w-full rounded-xl border border-white/[0.06] bg-white/[0.02] py-3 pl-11 pr-4 text-[#F7F7F7] placeholder:text-[#F7F7F7]/25 focus:border-[#E6FA50]/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="relative">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                minLength={6}
                className="body w-full rounded-xl border border-white/[0.06] bg-white/[0.02] py-3 px-4 text-[#F7F7F7] placeholder:text-[#F7F7F7]/25 focus:border-[#E6FA50]/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="label btn-lime w-full flex items-center justify-center gap-2 rounded-xl py-3 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign Up"}
            </button>
          </form>

          <div className="body mt-4 flex flex-col items-center gap-2">
            <div className="text-[#F7F7F7]/40">
              Already have an account?{" "}
              <Link href={`/auth/login${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ''}`} className="text-[#F7F7F7]/80 hover:text-[#E6FA50] transition-colors">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
