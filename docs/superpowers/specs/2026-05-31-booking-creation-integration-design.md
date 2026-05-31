# Booking Creation Integration Design

## Goal

Connect the existing frontend booking UI at `/venues/[id]/book` to the real `POST /bookings` backend endpoint.

This sprint covers frontend integration only. It does not add invite backend logic, payment provider logic, split payment backend logic, or backend schema changes.

## Product Flow

Preserve current product journey:

`Venue Discovery → Venue Detail → Availability Calendar → Booking → Invite Friends → Payment`

After successful booking creation, navigate to `/booking/[id]/invite` using the real booking id returned by the backend. Do not use `/booking/new` after a successful API booking.

## Approach

Use real booking submit with mock display fallback only.

- Venue and court display data may fall back to existing mocks if read APIs fail.
- Booking creation always calls real `POST /bookings`.
- Missing auth token stops submission before backend call.
- Failed booking creation does not continue to invite.
- No fake or local booking id is created.

## API Client

Update `apps/web/src/lib/api.ts`:

- Generalize `apiFetch` to accept request options.
- Preserve existing GET behavior and `cache: "no-store"`.
- Add typed API error with HTTP status for UI error mapping.
- Add `createBooking(input, authToken)`.
- Request body includes only:
  - `venueId`
  - `courtId`
  - `bookingDate`
  - `startsAt`
  - `endsAt`
- Do not send price or computed fee fields from frontend.
- Return backend booking summary including id, status, server-calculated amounts, venue, court, and host summary.

## Booking Page Behavior

Update `apps/web/src/app/venues/[id]/book/page.tsx`:

- Continue loading selected venue and courts from existing read API integration.
- Keep mock fallback for venue/court display when read API is unavailable.
- Keep UI layout unchanged except required loading/error/success states.
- Use selected venue, selected court, selected date, and selected time range for creation.
- Require selected slots to form one consecutive range before submit.
- Submit real booking via `createBooking`.
- Use the real returned booking id for navigation.
- Navigate to `/booking/${booking.id}/invite` with existing query params so mock invite/payment pages can display booking context.

## Auth

Booking creation requires auth token.

- If token is missing, show auth-required feedback and do not call backend.
- If backend returns `401` or `403`, show auth-required feedback.
- Token source should use existing frontend auth pattern if present. If no shared auth helper exists, add the smallest page-local helper needed to read the currently stored token without changing auth architecture.

## Error States

Map creation errors as follows:

- Invalid selection: no court, no date, no slots, unavailable selected slot, or non-consecutive slots.
- Overlapping booking: backend `409`.
- Auth required: missing token before call, or backend `401`/`403`.
- Backend unavailable: network error, fetch failure, or backend `5xx`.
- Other backend validation errors: show generic retry/selection message without continuing.

## Loading and Success States

- Disable submit while request is pending.
- Keep existing button style; change label during submit.
- On success, show transient success state only until route change.
- Do not continue if submit fails.

## Validation

Required before completion:

- Backend running.
- Frontend creates booking in database.
- Overlap error displays for duplicate booking time.
- `npm run lint` passes.
- `npm run build` passes.

## Out of Scope

- Backend schema changes.
- Payment provider integration.
- Invite creation API.
- Split payment backend.
- Replacing current invite mock page.
