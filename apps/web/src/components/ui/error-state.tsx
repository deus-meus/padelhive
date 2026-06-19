"use client";

import { AlertTriangle, RotateCw, Inbox } from "lucide-react";
import Link from "next/link";
import { getApiErrorMessage } from "@/lib/api";
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
    <div className={`mx-auto flex max-w-md flex-col items-center rounded-2xl border border-white/[0.06] bg-[#0C1B26] px-6 py-16 text-center md:py-20 ${className}`}>
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
          className="btn-lime mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-xl px-6 label uppercase disabled:opacity-60"
        >
          <RotateCw className={`h-3.5 w-3.5 ${isRetrying ? "animate-spin" : ""}`} />
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
  const resolvedDescription = description ?? (error !== undefined ? getApiErrorMessage(error) : "Couldn't load data");

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
        <div>
          <p className="heading-3 text-[#F7F7F7]">{title}</p>
          {resolvedDescription ? (
            <p className="mt-0.5 body-sm text-[#F7F7F7]/40">{resolvedDescription}</p>
          ) : null}
        </div>
      </div>
      {onRetry ? (
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="inline-flex h-9 shrink-0 items-center gap-2 self-start rounded-full border border-amber-400/30 bg-amber-400/10 px-4 label uppercase text-amber-300 transition-colors hover:bg-amber-400/20 disabled:opacity-50 sm:self-auto"
        >
          <RotateCw className={`h-3.5 w-3.5 ${isRetrying ? "animate-spin" : ""}`} />
          {isRetrying ? "Retrying" : "Try again"}
        </button>
      ) : null}
    </div>
  );
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
    "mt-6 inline-flex h-10 items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.04] px-5 label uppercase text-[#F7F7F7]/70 transition-colors hover:border-white/[0.2] hover:text-[#F7F7F7]";
  return (
    <div className="flex min-h-[360px] w-full flex-1 flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-[#0C1B26] px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.04]">
        <Icon className="h-6 w-6 text-[#F7F7F7]/40" />
      </div>
      <p className="mt-5 heading-3 text-[#F7F7F7]">{title}</p>
      {description ? (
        <p className="mt-1.5 max-w-sm body text-[#F7F7F7]/40">{description}</p>
      ) : null}
      {actionLabel ? (
        actionHref ? (
          <Link href={actionHref} className={actionClass}>{actionLabel}</Link>
        ) : (
          <button onClick={onAction} className={actionClass}>{actionLabel}</button>
        )
      ) : null}
    </div>
  );
}
