"use client";

import { AlertTriangle, RotateCw } from "lucide-react";

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
      <h2 className="heading-3 mt-6 text-lg text-[#F7F7F7]">{title}</h2>
      <p className="mt-2 max-w-sm text-sm font-light text-[#F7F7F7]/40">{description}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="btn-lime mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-xl px-6 text-[11px] font-semibold uppercase tracking-[0.08em] disabled:opacity-60"
        >
          <RotateCw className={`h-3.5 w-3.5 ${isRetrying ? "animate-spin" : ""}`} />
          {isRetrying ? "Retrying..." : "Try again"}
        </button>
      )}
    </div>
  );
}

export function ErrorOverlay({
  title,
  description,
  onRetry,
  isRetrying = false,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}) {
  return (
    <div className="relative min-h-[70vh] w-full overflow-hidden">
      <div aria-hidden className="pointer-events-none select-none space-y-6 opacity-40 blur-[2px]">
        <div className="h-14 w-56 animate-pulse rounded-lg bg-white/[0.04]" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/[0.04]" />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-2xl bg-white/[0.04]" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <ErrorState
          title={title}
          description={description}
          onRetry={onRetry}
          isRetrying={isRetrying}
        />
      </div>
    </div>
  );
}
