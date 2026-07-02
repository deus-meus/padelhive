"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2 } from "lucide-react";
import { useAuthStore, ROLE_REDIRECTS } from "@/stores/auth-store";
import { getUserFacingErrorMessage } from "@/lib/errors";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-[#E6FA50]" />
    </div>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const { loginWithGoogle, loginWithEmail, user, isLoading } = useAuthStore();


  async function handleGoogleLogin() {
    if (isLoading) return;
    setError(null);
    try {
      const loggedInUser = await loginWithGoogle();
      router.push(nextPath || ROLE_REDIRECTS[loggedInUser.role] || "/venues");
    } catch (err: unknown) {
      const msg = getUserFacingErrorMessage(err);
      setError(msg || null);
    }
  }

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    if (isLoading) return;
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password");
      return;
    }
    try {
      const loggedInUser = await loginWithEmail(email, password);
      router.push(nextPath || ROLE_REDIRECTS[loggedInUser.role] || "/venues");
    } catch (err: unknown) {
      const msg = getUserFacingErrorMessage(err);
      setError(msg || null);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block">
            <span className="font-heading text-3xl font-bold tracking-[-0.02em] text-[#F7F7F7]">
              Padel<span className="text-[#E6FA50]">hive</span>
            </span>
          </Link>
          <p className="body-lg mt-3 text-[#F7F7F7]/40">
            Book padel courts in seconds. Play more, wait less.
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-8">
          <h1 className="heading-2 text-[#F7F7F7] text-center mb-6">Sign In</h1>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
              <p className="body text-red-100/80">{error}</p>
            </div>
          )}

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="label w-full flex items-center justify-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] py-3.5 text-[#F7F7F7] transition-all hover:border-white/[0.15] hover:bg-white/[0.04] disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 border-t border-white/[0.06]" />
            <span className="caption text-[#F7F7F7]/25">or</span>
            <div className="flex-1 border-t border-white/[0.06]" />
          </div>

          {/* Method toggle */}
          {/* Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4 mb-4">
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
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#F7F7F7]/25" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                className="body w-full rounded-xl border border-white/[0.06] bg-white/[0.02] py-3 pl-11 pr-4 text-[#F7F7F7] placeholder:text-[#F7F7F7]/25 focus:border-[#E6FA50]/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="label btn-lime w-full flex items-center justify-center gap-2 rounded-xl py-3 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
            </button>
          </form>

          {/* Links for Email method */}
          <div className="body mt-4 flex flex-col items-center gap-2">
            <Link href="/auth/forgot-password" className="text-[#F7F7F7]/60 hover:text-[#E6FA50] transition-colors">
              Forgot password?
            </Link>
            <div className="text-[#F7F7F7]/40">
              Don&apos;t have an account?{" "}
              <Link href={`/auth/signup${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ''}`} className="text-[#F7F7F7]/80 hover:text-[#E6FA50] transition-colors">
                Sign up
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center caption text-[#F7F7F7]/25">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>

    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}
