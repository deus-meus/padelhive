# Padelhive Frontend UX States Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add production-feeling frontend UX states for booking success, payment pending/failed, cancel flow, empty/error/loading states, disabled CTAs, and toast feedback.

**Architecture:** Use shared UI primitives for EmptyState, LoadingState, Toast, and ConfirmDialog, then wire them into existing Next.js App Router pages. Keep all behavior frontend-only with mock data, query params, and local React state.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, lucide-react, existing mock data.

---

## File Structure

Create:

- `apps/web/src/components/ui/empty-state.tsx` — reusable polished empty/error state card.
- `apps/web/src/components/ui/loading-state.tsx` — reusable skeleton card/list/page variants.
- `apps/web/src/components/ui/toast.tsx` — reusable mobile-safe toast.
- `apps/web/src/components/ui/confirm-dialog.tsx` — reusable mobile-safe modal.
- `apps/web/src/lib/booking-state.ts` — booking ID validation, refund eligibility, date formatting helpers.
- `apps/web/src/app/booking/[id]/success/page.tsx` — new booking success route.

Modify:

- `apps/web/src/app/booking/[id]/payment/page.tsx` — payment states, disabled CTA, success navigation.
- `apps/web/src/app/booking/[id]/invite/page.tsx` — email validation, empty participants, toast, loading state.
- `apps/web/src/app/bookings/page.tsx` — empty states, cancel modal, local cancel success.
- `apps/web/src/app/bookings/[id]/page.tsx` — not found state, cancel modal, refund note, toast.
- `apps/web/src/app/venues/page.tsx` — no venues empty state, join match toast.
- `apps/web/src/app/venues/[id]/page.tsx` — venue not found, no slots empty state, corrected refund policy text.
- `apps/web/src/app/admin/transactions/page.tsx` — transaction empty state and dashboard skeleton.
- `apps/web/src/app/admin/refunds/page.tsx` — refund empty state, toast component, dashboard skeleton.
- `apps/web/src/app/bookings/checkout/page.tsx` — voucher validation disabled state/toast if current code needs it.
- `apps/web/src/app/dashboard/page.tsx` and key dashboard child pages — loading skeleton/save settings toast if applicable.

---

### Task 1: Shared UX State Primitives

**Files:**
- Create: `apps/web/src/components/ui/empty-state.tsx`
- Create: `apps/web/src/components/ui/loading-state.tsx`
- Create: `apps/web/src/components/ui/toast.tsx`
- Create: `apps/web/src/components/ui/confirm-dialog.tsx`
- Create: `apps/web/src/lib/booking-state.ts`

- [ ] **Step 1: Create EmptyState component**

Write `apps/web/src/components/ui/empty-state.tsx`:

```tsx
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  eyebrow?: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  compact?: boolean;
}

export function EmptyState({
  icon: Icon,
  eyebrow,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  compact = false,
}: EmptyStateProps) {
  const actionClassName = "btn-lime mt-5 inline-flex h-10 items-center justify-center rounded-full px-6 text-[11px] font-semibold uppercase tracking-[0.08em]";

  return (
    <div className={`rounded-2xl border border-white/[0.06] bg-[#0C1B26] text-center ${compact ? "p-8" : "p-10 md:p-12"}`}>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E6FA50]/10">
        <Icon className="h-5 w-5 text-[#E6FA50]" />
      </div>
      {eyebrow && <p className="section-label mt-5 text-[#50C8C8]">{eyebrow}</p>}
      <h3 className="heading-2 mt-3 text-lg text-[#F7F7F7]">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm font-light leading-relaxed text-[#F7F7F7]/35">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className={actionClassName}>
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <button type="button" onClick={onAction} className={actionClassName}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create loading state component**

Write `apps/web/src/components/ui/loading-state.tsx`:

```tsx
function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-white/[0.06] ${className}`} />;
}

export function PageLoadingState({ label = "Loading experience" }: { label?: string }) {
  return (
    <div className="min-h-screen pt-28">
      <div className="container py-8">
        <div className="mb-8 flex items-center gap-3">
          <SkeletonBlock className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <SkeletonBlock className="h-3 w-28" />
            <SkeletonBlock className="h-6 w-56" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <SkeletonBlock className="h-56 w-full" />
            <SkeletonBlock className="h-32 w-full" />
          </div>
          <SkeletonBlock className="h-80 w-full" />
        </div>
        <p className="caption mt-6 text-center text-[#F7F7F7]/25">{label}</p>
      </div>
    </div>
  );
}

export function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5">
      <SkeletonBlock className="h-4 w-32" />
      <div className="mt-5 space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <SkeletonBlock key={index} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}

export function DashboardLoadingState() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 space-y-3">
        <SkeletonBlock className="h-3 w-24" />
        <SkeletonBlock className="h-8 w-72" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <CardSkeleton key={index} rows={2} />
        ))}
      </div>
      <div className="mt-6">
        <CardSkeleton rows={6} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create Toast component**

Write `apps/web/src/components/ui/toast.tsx`:

```tsx
import { CheckCircle2 } from "lucide-react";

interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  if (!message) return null;

  return (
    <div className="fixed bottom-5 left-4 right-4 z-50 mx-auto max-w-sm rounded-xl border border-white/[0.08] bg-[#0C1B26] px-4 py-3 shadow-2xl shadow-black/40 sm:left-1/2 sm:right-auto sm:-translate-x-1/2">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#E6FA50]" />
        <p className="caption text-[#F7F7F7]/70">{message}</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create ConfirmDialog component**

Write `apps/web/src/components/ui/confirm-dialog.tsx`:

```tsx
interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  note?: string;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  note,
  confirmLabel,
  cancelLabel = "Keep booking",
  danger = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#06121A]/80 px-4 py-4 backdrop-blur-sm sm:items-center">
      <div className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#0C1B26] p-5 shadow-2xl shadow-black/50">
        <h2 className="heading-2 text-xl text-[#F7F7F7]">{title}</h2>
        <p className="mt-3 text-sm font-light leading-relaxed text-[#F7F7F7]/45">{description}</p>
        {note && (
          <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
            <p className="caption leading-relaxed text-[#F7F7F7]/45">{note}</p>
          </div>
        )}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-full border border-white/[0.08] text-[11px] font-medium uppercase tracking-[0.08em] text-[#F7F7F7]/50 transition-colors hover:border-white/[0.16] hover:text-[#F7F7F7]/80"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`h-11 rounded-full text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors ${
              danger
                ? "bg-red-500/15 text-red-300 hover:bg-red-500/25"
                : "btn-lime"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create booking state helpers**

Write `apps/web/src/lib/booking-state.ts`:

```ts
export function isValidMockId(id: string | undefined, prefix: string) {
  return Boolean(id && id.startsWith(prefix) && id.length > prefix.length + 1);
}

export function isFullRefundEligible(bookingDate: string, startTime = "00:00") {
  const bookingStart = new Date(`${bookingDate}T${startTime}:00`);
  if (Number.isNaN(bookingStart.getTime())) return false;

  const millisecondsUntilBooking = bookingStart.getTime() - Date.now();
  const hoursUntilBooking = millisecondsUntilBooking / (1000 * 60 * 60);
  return hoursUntilBooking > 24;
}

export function getRefundCopy(eligible: boolean) {
  return eligible
    ? "Full refund eligible because this booking is more than 24 hours away."
    : "Non-refundable because this booking is within H-1 or already past.";
}

export function formatDisplayDate(date: string) {
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return date;

  return value.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
```

- [ ] **Step 6: Run lint after shared primitives**

Run:

```bash
cd /home/dwidora/Projects/padelhive/apps/web && npm run lint
```

Expected: pass or existing unrelated lint output. Fix import/type errors from Task 1 before moving on.

---

### Task 2: Booking Success and Payment States

**Files:**
- Create: `apps/web/src/app/booking/[id]/success/page.tsx`
- Modify: `apps/web/src/app/booking/[id]/payment/page.tsx`

- [ ] **Step 1: Add booking success route**

Create `apps/web/src/app/booking/[id]/success/page.tsx` using `enhancedBookings`, `mockVenues`, `mockCourts`, `EmptyState`, `Toast`, and helpers. The page must:

- find booking by `params.id`
- show EmptyState if ID malformed or not found
- show confirmed hero, venue/court/date/time/payment status
- include Invite Friends, View My Bookings, Download Receipt mock button
- show toast on receipt download

Use this component structure:

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, CheckCircle2, CreditCard, Download, Ticket, Users, AlertTriangle } from "lucide-react";
import { enhancedBookings } from "@/mock/enhanced-bookings";
import { mockVenues } from "@/mock/venues";
import { mockCourts } from "@/mock/courts";
import { EmptyState } from "@/components/ui/empty-state";
import { Toast } from "@/components/ui/toast";
import { formatDisplayDate, isValidMockId } from "@/lib/booking-state";

export default function BookingSuccessPage({ params }: { params: { id: string } }) {
  const [toast, setToast] = useState<string | null>(null);
  const booking = enhancedBookings.find((item) => item.id === params.id);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  }

  if (!isValidMockId(params.id, "booking") || !booking) {
    return (
      <div className="min-h-screen pt-28">
        <div className="container max-w-2xl py-12">
          <EmptyState
            icon={AlertTriangle}
            eyebrow="Booking not found"
            title="We could not find this confirmation"
            description="The booking ID is invalid or this mock booking does not exist. Return to your bookings to continue."
            actionLabel="View My Bookings"
            actionHref="/bookings"
          />
        </div>
      </div>
    );
  }

  const venue = mockVenues.find((item) => item.id === booking.venueId);
  const court = mockCourts.find((item) => item.id === booking.courtId);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container max-w-3xl py-8">
        <div className="rounded-3xl border border-[#E6FA50]/15 bg-[#0C1B26] p-6 text-center shadow-2xl shadow-black/30 md:p-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#E6FA50]/10">
            <CheckCircle2 className="h-10 w-10 text-[#E6FA50]" />
          </div>
          <p className="section-label mt-6 text-[#50C8C8]">Booking confirmed</p>
          <h1 className="heading-1 mt-3 text-3xl text-[#F7F7F7] md:text-4xl">Court secured. Game on.</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm font-light leading-relaxed text-[#F7F7F7]/40">
            Your Padelhive booking is confirmed. Invite your crew, save your receipt, and show up ready to play.
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-white/[0.06] bg-[#0C1B26] p-5 md:p-6">
          <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
            <div>
              <p className="caption text-[#F7F7F7]/30">Booking ID</p>
              <p className="heading-3 mt-1 text-sm text-[#50C8C8]">{booking.id.toUpperCase()}</p>
            </div>
            <span className="rounded-full bg-[#E6FA50]/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.1em] text-[#E6FA50]">
              {booking.payment.status}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SuccessInfo icon={Ticket} label="Venue" value={venue?.name ?? "Unknown Venue"} />
            <SuccessInfo icon={Ticket} label="Court" value={court?.name ?? "Unknown Court"} />
            <SuccessInfo icon={CalendarDays} label="Date" value={formatDisplayDate(booking.bookingDate)} />
            <SuccessInfo icon={CalendarDays} label="Time" value={`${booking.startTime} – ${booking.endTime}`} />
            <SuccessInfo icon={CreditCard} label="Payment" value={`${booking.payment.method} · ${booking.payment.provider.toUpperCase()}`} />
            <SuccessInfo icon={CreditCard} label="Total Paid" value={`Rp ${booking.finalAmount.toLocaleString("id-ID")}`} />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link href={`/booking/${booking.id}/invite`} className="btn-lime flex h-12 items-center justify-center gap-2 rounded-full text-[11px] font-semibold uppercase tracking-[0.08em]">
            <Users className="h-4 w-4" /> Invite Friends
          </Link>
          <Link href="/bookings" className="flex h-12 items-center justify-center rounded-full border border-white/[0.08] text-[11px] font-medium uppercase tracking-[0.08em] text-[#F7F7F7]/50 transition-colors hover:border-white/[0.15] hover:text-[#F7F7F7]/75">
            View My Bookings
          </Link>
          <button type="button" onClick={() => showToast("Mock receipt downloaded")} className="flex h-12 items-center justify-center gap-2 rounded-full border border-white/[0.08] text-[11px] font-medium uppercase tracking-[0.08em] text-[#F7F7F7]/50 transition-colors hover:border-white/[0.15] hover:text-[#F7F7F7]/75">
            <Download className="h-4 w-4" /> Receipt
          </button>
        </div>
      </div>
      <Toast message={toast} />
    </div>
  );
}

function SuccessInfo({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/[0.03] p-4">
      <Icon className="h-4 w-4 text-[#50C8C8]" />
      <p className="caption mt-2 text-[#F7F7F7]/25">{label}</p>
      <p className="mt-1 text-sm font-medium text-[#F7F7F7]/75">{value}</p>
    </div>
  );
}
```

- [ ] **Step 2: Modify payment page state model**

In `apps/web/src/app/booking/[id]/payment/page.tsx`:

- add imports: `useRouter`, `EmptyState`, `PageLoadingState`, `Toast`, `isValidMockId`
- add `const router = useRouter();`
- add `const status = searchParams.get("status");`
- add local `toast` and `pageLoading` state
- if invalid booking id, render payment session EmptyState
- show `PageLoadingState label="Loading payment session"` during initial short timeout if desired
- replace success inline screen with navigation to `/booking/${params.id}/success`

Payment confirm logic should be:

```tsx
function showToast(message: string) {
  setToast(message);
  setTimeout(() => setToast(null), 2500);
}

function handlePay() {
  if (!selectedMethod) {
    showToast("Choose payment method first");
    return;
  }
  setProcessing(true);
  showToast("Confirming mock payment");
  setTimeout(() => {
    setProcessing(false);
    router.push(`/booking/${params.id}/success`);
  }, 900);
}
```

- [ ] **Step 3: Add pending and failed branches**

Before normal payment form return in payment page, add:

```tsx
if (status === "pending") {
  return (
    <div className="min-h-screen pt-24">
      <div className="container max-w-xl py-12">
        <EmptyState
          icon={Clock}
          eyebrow="Payment pending"
          title="Waiting for payment confirmation"
          description="Your court is temporarily held while we wait for the mock payment provider to confirm this transaction."
          actionLabel="Check Again"
          onAction={() => showToast("Still pending in mock mode")}
        />
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => router.push(`/booking/${params.id}/payment`)} className="btn-lime h-11 rounded-full text-[11px] font-semibold uppercase tracking-[0.08em]">Change Payment Method</button>
          <Link href={`/bookings/${params.id}`} className="flex h-11 items-center justify-center rounded-full border border-white/[0.08] text-[11px] font-medium uppercase tracking-[0.08em] text-[#F7F7F7]/50">Back to Booking</Link>
        </div>
      </div>
      <Toast message={toast} />
    </div>
  );
}

if (status === "failed") {
  return (
    <div className="min-h-screen pt-24">
      <div className="container max-w-xl py-12">
        <EmptyState
          icon={AlertCircle}
          eyebrow="Payment failed"
          title="Payment could not be completed"
          description="No charge was made in this mock flow. Retry payment, change method, or return to booking details."
          actionLabel="Retry Payment"
          onAction={() => router.push(`/booking/${params.id}/payment`)}
        />
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => router.push(`/booking/${params.id}/payment`)} className="btn-lime h-11 rounded-full text-[11px] font-semibold uppercase tracking-[0.08em]">Change Payment Method</button>
          <Link href={`/bookings/${params.id}`} className="flex h-11 items-center justify-center rounded-full border border-white/[0.08] text-[11px] font-medium uppercase tracking-[0.08em] text-[#F7F7F7]/50">Back to Booking</Link>
        </div>
      </div>
      <Toast message={toast} />
    </div>
  );
}
```

- [ ] **Step 4: Update normal payment CTA disabled state**

In payment page confirm button, ensure:

```tsx
<button
  onClick={handlePay}
  disabled={!selectedMethod || processing}
  className="btn-lime flex h-12 w-full items-center justify-center rounded-full text-[11px] font-semibold uppercase tracking-[0.08em] disabled:cursor-not-allowed disabled:opacity-30"
>
  {processing ? "Confirming..." : "Confirm Payment"}
</button>
```

- [ ] **Step 5: Run lint for payment task**

Run:

```bash
cd /home/dwidora/Projects/padelhive/apps/web && npm run lint
```

Expected: no TypeScript import errors from new route/payment edits.

---

### Task 3: Booking Cancel Flow and Booking Empty/Error States

**Files:**
- Modify: `apps/web/src/app/bookings/page.tsx`
- Modify: `apps/web/src/app/bookings/[id]/page.tsx`

- [ ] **Step 1: Update My Bookings imports and state**

In `apps/web/src/app/bookings/page.tsx`:

Add imports:

```tsx
import { EmptyState } from "@/components/ui/empty-state";
import { Toast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { getRefundCopy, isFullRefundEligible } from "@/lib/booking-state";
```

Add state:

```tsx
const [cancelledIds, setCancelledIds] = useState<string[]>([]);
const [cancelTarget, setCancelTarget] = useState<EnhancedBooking | null>(null);
```

Compute bookings with local cancelled override:

```tsx
const visibleBookings = enhancedBookings.map((booking) =>
  cancelledIds.includes(booking.id) ? { ...booking, status: "cancelled" as const } : booking
);
const upcoming = visibleBookings.filter((b) => b.status === "confirmed" || b.status === "pending");
const completed = visibleBookings.filter((b) => b.status === "completed");
const cancelled = visibleBookings.filter((b) => b.status === "cancelled");
```

- [ ] **Step 2: Replace no booking text in My Bookings**

Replace existing `No {activeTab} bookings.` block with:

```tsx
<EmptyState
  icon={CalendarDays}
  eyebrow="No bookings"
  title={`No ${activeTab} bookings yet`}
  description={activeTab === "upcoming" ? "Book a court and your next match will appear here with invite and payment actions." : "Your booking history for this category will appear here."}
  actionLabel={activeTab === "upcoming" ? "Find Venues" : undefined}
  actionHref={activeTab === "upcoming" ? "/venues" : undefined}
  compact
/>
```

- [ ] **Step 3: Wire My Bookings cancel modal**

Change `BookingRow` usage:

```tsx
onCancel={() => setCancelTarget(booking)}
```

Add before `<Toast message={toast} />`:

```tsx
<ConfirmDialog
  open={Boolean(cancelTarget)}
  title="Cancel this booking?"
  description="This will cancel the mock booking in your local session. No backend request will be sent."
  note={cancelTarget ? getRefundCopy(isFullRefundEligible(cancelTarget.bookingDate, cancelTarget.startTime)) : undefined}
  confirmLabel="Cancel Booking"
  danger
  onClose={() => setCancelTarget(null)}
  onConfirm={() => {
    if (!cancelTarget) return;
    setCancelledIds((prev) => [...prev, cancelTarget.id]);
    setCancelTarget(null);
    showToast("Booking cancelled in mock mode");
  }}
/>
<Toast message={toast} />
```

Replace old inline toast block with reusable `<Toast message={toast} />`.

- [ ] **Step 4: Update Booking Detail not-found state**

In `apps/web/src/app/bookings/[id]/page.tsx`, add imports:

```tsx
import { AlertTriangle } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Toast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { getRefundCopy, isFullRefundEligible, isValidMockId } from "@/lib/booking-state";
```

Replace current `Booking not found.` return with `EmptyState`:

```tsx
if (!isValidMockId(bookingId, "booking") || !booking) {
  return (
    <div className="min-h-screen pt-28">
      <div className="container max-w-2xl py-12">
        <EmptyState
          icon={AlertTriangle}
          eyebrow="Booking not found"
          title="This booking does not exist"
          description="The booking ID is invalid or no mock booking matches it. Return to your bookings to continue."
          actionLabel="Back to Bookings"
          actionHref="/bookings"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Add Booking Detail cancel state and modal**

In Booking Detail page add:

```tsx
const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
const [locallyCancelled, setLocallyCancelled] = useState(false);
const effectiveStatus = locallyCancelled ? "cancelled" : booking.status;
const refundEligible = isFullRefundEligible(booking.bookingDate, booking.startTime);
```

Change status badge prop to use `effectiveStatus`.

Change `handleCancel` to:

```tsx
function handleCancel() {
  setCancelDialogOpen(true);
}
```

Add modal near bottom:

```tsx
<ConfirmDialog
  open={cancelDialogOpen}
  title="Cancel this booking?"
  description="This mock cancellation updates the page state only. Your court will appear cancelled in this session."
  note={getRefundCopy(refundEligible)}
  confirmLabel="Cancel Booking"
  danger
  onClose={() => setCancelDialogOpen(false)}
  onConfirm={() => {
    setLocallyCancelled(true);
    setCancelDialogOpen(false);
    showToast("Booking cancelled in mock mode");
  }}
/>
<Toast message={toast} />
```

Replace old inline toast block with reusable Toast.

- [ ] **Step 6: Disable cancel after local cancellation**

In Booking Detail action area, render cancel button only when `effectiveStatus !== "cancelled" && effectiveStatus !== "completed"`. If cancelled, show a muted message:

```tsx
<p className="rounded-xl bg-white/[0.02] px-4 py-3 text-sm text-[#F7F7F7]/35">Booking cancelled in mock mode.</p>
```

- [ ] **Step 7: Run lint for booking task**

Run:

```bash
cd /home/dwidora/Projects/padelhive/apps/web && npm run lint
```

Expected: no type errors from status overrides or component imports.

---

### Task 4: Invite, Venues, and Slot Empty/Disabled/Toast States

**Files:**
- Modify: `apps/web/src/app/booking/[id]/invite/page.tsx`
- Modify: `apps/web/src/app/venues/page.tsx`
- Modify: `apps/web/src/app/venues/[id]/page.tsx`

- [ ] **Step 1: Add invite page toast, loading, and validation**

In invite page:

Add imports:

```tsx
import { AlertTriangle, UserX } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoadingState } from "@/components/ui/loading-state";
import { Toast } from "@/components/ui/toast";
import { isValidMockId } from "@/lib/booking-state";
```

Add state:

```tsx
const [toast, setToast] = useState<string | null>(null);
const [loading, setLoading] = useState(false);
const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput);
```

Add functions:

```tsx
function showToast(message: string) {
  setToast(message);
  setTimeout(() => setToast(null), 2500);
}
```

Change copy handler:

```tsx
function handleCopy() {
  navigator.clipboard.writeText(inviteLink);
  setCopied(true);
  showToast("Invite link copied");
  setTimeout(() => setCopied(false), 2000);
}
```

Change add friend guard:

```tsx
function handleAddFriend() {
  if (!isValidEmail) {
    showToast("Enter a valid email first");
    return;
  }
  const newFriend: InvitedFriend = {
    id: `f${Date.now()}`,
    name: emailInput.split("@")[0],
    email: emailInput,
    avatar: `https://i.pravatar.cc/150?u=${emailInput}`,
    status: "invited",
  };
  setFriends([...friends, newFriend]);
  setEmailInput("");
  showToast("Friend invited in mock mode");
}
```

- [ ] **Step 2: Add invite invalid ID and empty participants states**

Before normal invite return:

```tsx
if (!isValidMockId(params.id, "booking")) {
  return (
    <div className="min-h-screen pt-28">
      <div className="container max-w-2xl py-12">
        <EmptyState
          icon={AlertTriangle}
          eyebrow="Invalid invite"
          title="This invite link is not valid"
          description="The booking ID does not match a mock booking route. Return to bookings and open an invite from there."
          actionLabel="View Bookings"
          actionHref="/bookings"
        />
      </div>
    </div>
  );
}

if (loading) return <PageLoadingState label="Loading invite" />;
```

Inside friends list, before mapping:

```tsx
{friends.length === 0 ? (
  <EmptyState
    icon={UserX}
    title="No invite participants yet"
    description="Copy the invite link or add a friend by email to start building your match crew."
    compact
  />
) : (
  friends.map(...existing row...)
)}
```

Add `<Toast message={toast} />` before page closing.

Change invite button disabled condition to `disabled={!isValidEmail}`.

- [ ] **Step 3: Improve venues page empty state and join toast**

In venues page:

Add imports:

```tsx
import { EmptyState } from "@/components/ui/empty-state";
import { Toast } from "@/components/ui/toast";
```

Add toast state and helper:

```tsx
const [toast, setToast] = useState<string | null>(null);
function showToast(message: string) {
  setToast(message);
  setTimeout(() => setToast(null), 2500);
}
```

Change Open Match CTA from Link to button:

```tsx
<button
  type="button"
  onClick={() => showToast("Joined match in mock mode")}
  className="btn-lime mt-5 flex w-full items-center justify-center rounded-full py-2.5 text-[10px] font-semibold uppercase tracking-[0.08em]"
>
  Join Match
</button>
```

Replace no venues block with:

```tsx
<EmptyState
  icon={Search}
  eyebrow="No venues found"
  title="Try another city or keyword"
  description="No mock venues match your filters. Clear filters to see all available Padelhive venues."
  actionLabel="Clear Filters"
  onAction={() => { setSearch(""); setCity("All"); }}
/>
```

Add `<Toast message={toast} />` before fragment close.

- [ ] **Step 4: Fix venue detail not-found behavior**

In `apps/web/src/app/venues/[id]/page.tsx`, stop falling back to first venue.

Change:

```tsx
const venue = mockVenues.find((v) => v.id === params.id) ?? mockVenues[0];
```

to:

```tsx
const venue = mockVenues.find((v) => v.id === params.id);

if (!venue) {
  return (
    <div className="min-h-screen pt-28">
      <div className="container max-w-2xl py-12">
        <EmptyState
          icon={MapPin}
          eyebrow="Venue not found"
          title="This venue is not available"
          description="The venue ID is invalid or no mock venue matches it. Browse all venues to find another court."
          actionLabel="Browse Venues"
          actionHref="/venues"
        />
      </div>
    </div>
  );
}
```

Add `EmptyState` import.

- [ ] **Step 5: Add no available slots state**

In venue detail, create:

```tsx
const availableSlots = TIME_SLOTS.filter((slot) => slot.available);
```

Replace availability grid section body with conditional:

```tsx
{availableSlots.length === 0 ? (
  <div className="mt-4">
    <EmptyState
      icon={Clock}
      title="No available slots today"
      description="All mock slots are booked for this date. Choose another day when date selection is available."
      compact
    />
  </div>
) : (
  <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-8">
    {TIME_SLOTS.map((slot) => (/* existing button */))}
  </div>
)}
```

- [ ] **Step 6: Correct refund policy to PRD rule**

In venue detail refund policy, replace three-row 50% policy with two rows:

- Full refund before H-1.
- Non-refundable after H-1.

Use existing styles. Remove 50% refund row.

- [ ] **Step 7: Run lint for invite/venues task**

Run:

```bash
cd /home/dwidora/Projects/padelhive/apps/web && npm run lint
```

Expected: no Link/button import issues or unused imports.

---

### Task 5: Admin/Dashboard Empty, Loading, Toast, and Checkout Validation Polish

**Files:**
- Modify: `apps/web/src/app/admin/transactions/page.tsx`
- Modify: `apps/web/src/app/admin/refunds/page.tsx`
- Modify: `apps/web/src/app/bookings/checkout/page.tsx`
- Modify: `apps/web/src/app/dashboard/page.tsx`
- Modify dashboard children as needed: `apps/web/src/app/dashboard/bookings/page.tsx`, `apps/web/src/app/dashboard/courts/page.tsx`, `apps/web/src/app/dashboard/hours/page.tsx`, `apps/web/src/app/dashboard/revenue/page.tsx`, `apps/web/src/app/dashboard/settings/page.tsx`

- [ ] **Step 1: Transactions empty/loading state**

In admin transactions page:

Add imports:

```tsx
import { ReceiptText } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { DashboardLoadingState } from "@/components/ui/loading-state";
```

Add optional loading state:

```tsx
const [loading] = useState(false);
if (loading) return <DashboardLoadingState />;
```

Replace `No transactions match your filters` with:

```tsx
<EmptyState
  icon={ReceiptText}
  eyebrow="No transactions"
  title="No transactions match your filters"
  description="Try another booking ID, user, venue, or payment status to inspect marketplace payments."
  actionLabel="Clear Filters"
  onAction={() => { setSearch(""); setStatusFilter("all"); }}
/>
```

- [ ] **Step 2: Refunds empty/loading/toast component**

In admin refunds page:

Add imports:

```tsx
import { EmptyState } from "@/components/ui/empty-state";
import { Toast } from "@/components/ui/toast";
import { DashboardLoadingState } from "@/components/ui/loading-state";
```

Add optional loading state:

```tsx
const [loading] = useState(false);
if (loading) return <DashboardLoadingState />;
```

Replace filtered empty block with:

```tsx
<EmptyState
  icon={RotateCcw}
  eyebrow="No refund requests"
  title="No refund requests in this category"
  description="Refund requests from cancelled bookings will appear here with eligibility and approval actions."
  actionLabel={filter !== "all" ? "Show All" : undefined}
  onAction={filter !== "all" ? () => setFilter("all") : undefined}
/>
```

Replace inline toast with `<Toast message={toast} />`.

- [ ] **Step 3: Checkout voucher disabled state and toast consistency**

Inspect `apps/web/src/app/bookings/checkout/page.tsx`. Ensure voucher apply button is disabled unless voucher code has 3+ characters. If existing handler accepts invalid input, change to:

```tsx
const voucherIsValid = voucherCode.trim().length >= 3;

function handleApplyVoucher() {
  if (!voucherIsValid) {
    showToast("Enter a valid voucher code");
    return;
  }
  // existing mock apply behavior
  showToast("Voucher applied in mock mode");
}
```

Button class must include:

```tsx
disabled={!voucherIsValid}
className="... disabled:cursor-not-allowed disabled:opacity-30"
```

Replace inline toast with reusable Toast if page has custom toast.

- [ ] **Step 4: Dashboard loading skeletons**

For each dashboard page that has a top-level client component and local state:

- import `DashboardLoadingState`
- add `const [loading] = useState(false);`
- return `<DashboardLoadingState />` when loading

Use this only where it does not force converting server pages unnecessarily. For server pages, add skeleton-looking blocks inline if simpler.

- [ ] **Step 5: Save mock settings toast**

In dashboard settings page, ensure any save button updates local state or shows toast:

```tsx
function handleSaveSettings() {
  showToast("Mock settings saved");
}
```

If no settings page exists, skip this step and note skipped in final response.

- [ ] **Step 6: Run lint for admin/dashboard task**

Run:

```bash
cd /home/dwidora/Projects/padelhive/apps/web && npm run lint
```

Expected: no unused state/import errors.

---

### Task 6: Final Mobile QA and Build Validation

**Files:**
- Modify only files needed to fix validation issues.

- [ ] **Step 1: Search for dead button placeholders**

Run:

```bash
cd /home/dwidora/Projects/padelhive/apps/web && grep -R "Coming soon in backend integration\|No .*found\.\|not found\." -n src/app src/components || true
```

Expected: no user-facing dead placeholder that should have been replaced. If found, replace with local state, navigation, or toast.

- [ ] **Step 2: Search for risky mobile overflow classes**

Run:

```bash
cd /home/dwidora/Projects/padelhive/apps/web && grep -R "w-\[\|min-w-\[\|fixed bottom" -n src/app src/components || true
```

Expected: inspect results. Ensure modal/toast/sticky areas use mobile-safe widths and content padding.

- [ ] **Step 3: Run lint**

Run:

```bash
cd /home/dwidora/Projects/padelhive/apps/web && npm run lint
```

Expected: lint passes.

- [ ] **Step 4: Run production build**

Run:

```bash
cd /home/dwidora/Projects/padelhive/apps/web && npm run build
```

Expected: build passes. If Next.js reports route/type issues, fix them and rerun.

- [ ] **Step 5: Final manual route spot-check by build reasoning**

Spot-check these routes in code or running app if available:

- `/booking/booking-1/success`
- `/booking/booking-1/payment?status=pending`
- `/booking/booking-1/payment?status=failed`
- `/booking/not-real/success`
- `/bookings`
- `/bookings/booking-1`
- `/booking/booking-1/invite`
- `/venues?city=Nowhere`
- `/venues/not-real`
- `/admin/transactions`
- `/admin/refunds`

Expected: routes render clean states, no dead buttons, no obvious mobile overflow from fixed widths.

---

## Self-Review

Spec coverage:

- Booking success route: Task 2.
- Payment pending/failed: Task 2.
- Cancel flow/refund rule: Task 3.
- Empty states: Tasks 3, 4, 5.
- Error/not found states: Tasks 2, 3, 4.
- Loading states: Tasks 1, 2, 4, 5.
- Toast feedback: Tasks 1 through 5.
- Disabled states: Tasks 2, 4, 5.
- Mobile QA: Tasks 1 and 6.

Placeholder scan: no TBD/TODO/fill-in-later instructions. Steps include exact file paths, snippets, commands, expected results.

Type consistency: helper names and component names are consistent across tasks: `EmptyState`, `Toast`, `ConfirmDialog`, `PageLoadingState`, `DashboardLoadingState`, `isValidMockId`, `isFullRefundEligible`, `getRefundCopy`, `formatDisplayDate`.
