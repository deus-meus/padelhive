"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useAuthStore, ROLE_REDIRECTS } from "@/stores/auth-store";

const VALID_OTP = "123456";

export default function VerifyPage() {
  return (
    <Suspense fallback={<VerifyLoading />}>
      <VerifyContent />
    </Suspense>
  );
}

function VerifyLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-[#E6FA50]" />
    </div>
  );
}

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading } = useAuthStore();

  const method = searchParams.get("method") ?? "phone";
  const contact = searchParams.get("contact") ?? "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  function handleChange(index: number, value: string) {
    if (value.length > 1) value = value[value.length - 1];
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(null);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
  }

  async function handleVerify() {
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the full 6-digit code");
      return;
    }

    if (code !== VALID_OTP) {
      setError("Invalid OTP code. Try 123456 for demo.");
      return;
    }

    setSuccess(true);
    await login("player");
    setTimeout(() => {
      router.push(ROLE_REDIRECTS.player);
    }, 800);
  }

  function handleResend() {
    if (resendCooldown > 0) return;
    setResendCooldown(30);
    setOtp(["", "", "", "", "", ""]);
    setError(null);
    inputRefs.current[0]?.focus();
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
        </div>

        {/* Verify Card */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-8">
          {/* Back button */}
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-sm text-[#F7F7F7]/30 transition-colors hover:text-[#F7F7F7]/60 mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Edit {method}
          </Link>

          <h1 className="heading-2 text-xl text-[#F7F7F7] mb-2">Verify OTP</h1>
          <p className="text-sm text-[#F7F7F7]/40 mb-6">
            We sent a 6-digit code to{" "}
            <span className="text-[#F7F7F7]/70 font-medium">{decodeURIComponent(contact) || "your device"}</span>
          </p>

          {/* OTP Input */}
          <div className="flex gap-2 justify-center mb-4" onPaste={handlePaste}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => { inputRefs.current[idx] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`h-14 w-11 rounded-xl border text-center text-lg font-semibold transition-all focus:outline-none ${
                  success
                    ? "border-[#E6FA50]/30 bg-[#E6FA50]/5 text-[#E6FA50]"
                    : error
                    ? "border-red-500/30 bg-red-500/5 text-red-400"
                    : "border-white/[0.08] bg-white/[0.02] text-[#F7F7F7] focus:border-[#E6FA50]/30"
                }`}
              />
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 justify-center mb-4">
              <XCircle className="h-3.5 w-3.5 text-red-400" />
              <span className="caption text-red-400">{error}</span>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="flex items-center gap-2 justify-center mb-4">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#E6FA50]" />
              <span className="caption text-[#E6FA50]">Verified! Redirecting...</span>
            </div>
          )}

          {/* Verify button */}
          <button
            onClick={handleVerify}
            disabled={isLoading || success}
            className="btn-lime w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold disabled:opacity-50"
          >
            {isLoading || success ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Verify"
            )}
          </button>

          {/* Resend */}
          <div className="mt-4 text-center">
            {resendCooldown > 0 ? (
              <p className="caption text-[#F7F7F7]/25">
                Resend code in <span className="text-[#F7F7F7]/50">{resendCooldown}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                className="caption text-[#E6FA50] hover:underline"
              >
                Resend code
              </button>
            )}
          </div>

          {/* Demo hint */}
          <div className="mt-6 rounded-lg bg-white/[0.02] px-3 py-2 text-center">
            <p className="caption text-[#F7F7F7]/20">
              Demo OTP: <span className="text-[#50C8C8] font-medium">123456</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
