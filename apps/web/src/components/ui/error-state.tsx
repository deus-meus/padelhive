"use client";

import { AlertTriangle, Inbox, RotateCw } from "lucide-react";
import Link from "next/link";
export function ErrorState({
  title = "Couldn't load data",
  description = "We couldn't reach the server. Check your connection and try again.",
  onRetry,
  isRetrying = false,
  className = "",
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto flex max-w-md flex-col items-center rounded-2xl border border-white/[0.06] bg-[#0C1B26] px-6 py-16 text-center md:py-20 ${className}`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E6FA50]/10">
        <AlertTriangle className="h-6 w-6 text-[#E6FA50]" />
      </div>
      <h2 className="heading-3 mt-6 text-[#F7F7F7]">{title}</h2>
      <p className="mt-2 max-w-sm body text-[#F7F7F7]/40">{description}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="btn-lime mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-xl px-6 label disabled:opacity-60"
        >
          <RotateCw
            className={`h-3.5 w-3.5 ${isRetrying ? "animate-spin" : ""}`}
          />
          {isRetrying ? "Retrying..." : "Try again"}
        </button>
      )}
    </div>
  );
}

export function ErrorBanner({
  title = "Couldn't load data",
  description,
  error,
  onRetry,
  isRetrying = false,
}: {
  title?: string;
  description?: string;
  error?: unknown;
  onRetry?: () => void;
  isRetrying?: boolean;
}) {
  return null; // Disabled globally as per user request to only show empty states instead
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
}) {
  const actionClass =
    "mt-6 inline-flex h-10 items-center gap-2 rounded-full bg-[#E6FA50] text-[#0A1628] hover:bg-[#E6FA50]/90 px-6 font-semibold label transition-colors";
  return (
    <div className="flex min-h-[360px] w-full flex-1 flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-[#0C1B26] px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E6FA50]/10">
        <Icon className="h-6 w-6 text-[#E6FA50]" />
      </div>
      <p className="mt-5 heading-3 text-[#F7F7F7]">{title}</p>
      {description ? (
        <p className="mt-1.5 max-w-sm body text-[#F7F7F7]/40">{description}</p>
      ) : null}
      {actionLabel ? (
        actionHref ? (
          <Link href={actionHref} className={actionClass}>
            {actionLabel}
          </Link>
        ) : (
          <button onClick={onAction} className={actionClass}>
            {actionLabel}
          </button>
        )
      ) : null}
    </div>
  );
}
