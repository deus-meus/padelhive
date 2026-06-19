"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { Mail, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { getUserFacingErrorMessage } from "@/lib/errors";

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#E6FA50]" />
      </div>
    }>
      <ForgotPasswordContent />
    </Suspense>
  );
}

function ForgotPasswordContent() {
  const { sendPasswordReset, isLoading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (isLoading) return;
    setError(null);
    setSuccess(false);
    
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    
    try {
      await sendPasswordReset(email);
      setSuccess(true);
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
            Reset your password
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-8">
          <h1 className="heading-2 text-[#F7F7F7] text-center mb-6">Forgot Password</h1>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
              <p className="body text-red-100/80">{error}</p>
            </div>
          )}
          
          {success ? (
            <div className="mb-6 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-4 text-center">
              <p className="body text-green-100/80 mb-4">
                We&apos;ve sent a password reset link to <strong>{email}</strong>. Check your email to continue.
              </p>
              <Link href="/auth/login" className="label btn-outline-white w-full flex items-center justify-center gap-2 rounded-xl py-3">
                Return to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4 mb-6">
              <p className="body text-[#F7F7F7]/60 mb-4">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>
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

              <button
                type="submit"
                disabled={isLoading}
                className="label btn-lime w-full flex items-center justify-center gap-2 rounded-xl py-3 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Reset Link"}
              </button>
            </form>
          )}

          {!success && (
            <div className="body mt-4 flex flex-col items-center gap-2">
              <div className="text-[#F7F7F7]/40">
                Remember your password?{" "}
                <Link href="/auth/login" className="text-[#F7F7F7]/80 hover:text-[#E6FA50] transition-colors">
                  Sign in
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
