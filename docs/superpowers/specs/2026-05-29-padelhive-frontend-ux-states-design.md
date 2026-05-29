# Padelhive Frontend UX States Design

## Goal

Make Padelhive frontend feel complete and production-ready without backend work. Add success, pending, failure, empty, error, loading, disabled, and toast states using mock data and local React state.

## Scope

Frontend only. No API integration, no backend changes, no redesign. Keep existing Padelhive premium sports-tech style, Tailwind classes, mock data, routes, and component idioms.

## Chosen Approach

Use a broad shared-state pass:

- Add small reusable UI primitives for empty states, loading states, toast feedback, and confirmation dialogs.
- Add small helpers for booking/refund/payment state logic where useful.
- Wire components into existing player, booking, invite, payment, venue, admin, and dashboard pages.
- Avoid visible state-demo toggles. States come from route IDs, query params, mock data, validation, and local interaction state.

## Routes and States

### Booking Success

Add route `/booking/[id]/success`.

Show:

- Confirmed booking hero state.
- Venue name, court, date/time.
- Payment status.
- Invite friends CTA.
- View my bookings CTA.
- Download receipt mock button with toast feedback.
- Booking-not-found state for invalid IDs.

### Payment Pending and Failed

Improve `/booking/[id]/payment`.

Support payment state through query parameter and local state:

- `?status=pending` shows pending confirmation/checking state.
- `?status=failed` shows failed state.
- Normal page supports payment selection and processing.

Show CTAs:

- Retry payment.
- Change payment method.
- Back to booking.

Disable confirm payment until a method is selected. Processing state prevents duplicate clicks. Confirm success links to `/booking/[id]/success`.

### Booking Cancel Flow

Improve My Bookings and Booking Detail.

Add:

- Cancel booking button for active bookings.
- Confirmation modal.
- Refund eligibility note.
- Mock cancel success state using local state.

Refund rule:

- Full refund before H-1, meaning booking starts more than 24 hours from current time.
- Non-refundable after H-1.

### Empty States

Add polished empty states for:

- No bookings.
- No venues found.
- No available slots.
- No invite participants.
- No transactions.
- No refund requests.

Each state should include icon, short title, helpful copy, and action when useful.

### Error and Not Found States

Add clean states for:

- Venue not found.
- Booking not found.
- Invalid route ID.
- Payment session not found.

Invalid route ID means missing/unknown mock entity or malformed expected ID shape.

### Loading States

Add skeleton or spinner states for:

- Venue detail.
- Booking page.
- Invite page.
- Payment page.
- Dashboards.

Use short local loading timers only where page already has client state. Otherwise add reusable skeleton blocks that can be displayed without changing data flow.

### Toast Feedback

Use consistent toast feedback for:

- Copy invite link.
- Add friend.
- Apply voucher.
- Cancel booking.
- Join match.
- Confirm payment.
- Save mock settings.
- Download receipt.

No dead buttons: if action has no backend, it should still update local state, navigate, or show a clear mock toast.

### Disabled States

Ensure CTAs are disabled until required inputs are complete:

- Court selected before booking continuation.
- Date selected before booking continuation.
- Time selected before booking continuation.
- Payment method selected before payment confirmation.
- Valid email before invite add/send.
- Valid voucher before apply.

Disabled buttons must look disabled and avoid click side effects.

## Components

Add or improve reusable UI components under `src/components/ui/`:

- `EmptyState`: icon, eyebrow, title, description, action.
- `LoadingState` or skeleton helpers: card/list/page skeleton variants.
- `Toast`: consistent fixed mobile-safe toast.
- `ConfirmDialog`: mobile-safe confirmation modal with title, description, note, cancel, confirm, danger mode.

Components should match existing design:

- Dark navy card background.
- Subtle white borders.
- Lime primary accents.
- Cyan supporting accents.
- Rounded cards and premium spacing.

## Data Flow

Use existing mock arrays as source of truth. For mutations like cancel booking, keep local IDs/status maps in page state rather than editing mock files at runtime. Query params may drive mock payment state, but UI must stay useful if params are missing.

## Mobile Requirements

- Modal max height fits viewport and scrolls if needed.
- Sticky CTAs use bottom padding so content is not covered.
- Cards use responsive grids and avoid fixed widths that overflow.
- Toasts fit narrow screens.
- Long venue/booking/payment text wraps safely.

## Validation

Run from `apps/web`:

```bash
npm run lint
npm run build
```

Fix issues caused by this work. Report validation output honestly.

## Out of Scope

- Backend/API integration.
- Payment provider integration.
- Persistent data storage.
- Redesigning visual language.
- Native mobile work.
