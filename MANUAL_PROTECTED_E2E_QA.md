# Manual Protected E2E QA Guide

Goal: verify the real protected player flow with Google/Firebase auth against local PostgreSQL, NestJS API, and Next.js web app.

Scope:

- Google login in browser
- Firebase ID token availability in web client
- Protected booking creation
- Protected invite creation/listing
- Public invite RSVP from incognito
- Protected internal payment intent creation
- Database rows and statuses

Do not implement features while running this guide. If a blocker appears, fix only the blocker, validate, and create a PR.

---

## 0. Prerequisites

- Node.js 20+
- npm
- Docker Engine or Docker Desktop with Compose
- Browser with Google login available
- Firebase project configured for Google sign-in
- `localhost` authorized in Firebase Auth settings
- Local app environment files created:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Expected local defaults:

- PostgreSQL: `localhost:5433`
- API: `http://localhost:3001/api`
- Web: `http://localhost:3000`
- Web API env: `NEXT_PUBLIC_API_URL=http://localhost:3001/api`

> Note: `apps/web/.env.example` is source-controlled reference only. Use `apps/web/.env.local` for local runs.

---

## 1. Start local services

### 1.1 Start database

```bash
npm run db:up
```

Confirm container is healthy:

```bash
docker compose ps
```

Expected:

- `padelhive-postgres` is `running` or `healthy`
- Port mapping includes `5433->5432`

### 1.2 Apply schema and seed data

```bash
npm run backend:setup
```

Expected:

- Prisma Client generated
- Migrations applied
- Seed completed

Seeded venues useful for QA:

- `Padel Bali Arena`
- `Jakarta Padel Club`

### 1.3 Start API

In a second terminal:

```bash
npm run api:dev
```

Expected:

- API listens on `http://localhost:3001/api`
- No startup errors

Smoke check:

```bash
curl http://localhost:3001/api/venues
```

Expected:

- HTTP 200
- JSON array with approved venues

### 1.4 Start web

In a third terminal:

```bash
npm run dev
```

Expected:

- Web listens on `http://localhost:3000`
- No Next.js startup errors

Open:

```text
http://localhost:3000
```

---

## 2. Login with Google in browser

1. Open `http://localhost:3000/auth/login`.
2. Click Google sign-in CTA.
3. Complete Google login.
4. Confirm app returns to requested page or logged-in state.

Expected:

- Browser shows authenticated user state.
- No Firebase popup/domain errors.
- No web console auth errors.

If login fails:

- Confirm `apps/web/.env.local` contains Firebase web config.
- Confirm Firebase Auth Google provider is enabled.
- Confirm `localhost` is authorized in Firebase Auth.

---

## 3. Verify Firebase token is available

Best verification: inspect real protected network request.

1. Open DevTools Network tab.
2. Enable `Preserve log`.
3. Create booking in Step 4.
4. Select `POST /api/bookings` request.
5. Confirm request headers include:

```text
Authorization: Bearer <Firebase ID token>
```

Expected:

- Protected API request includes bearer token.
- Token is non-empty JWT-like string with three dot-separated parts.
- API does not return `401 Missing bearer token`.

Optional direct console check if app exposes Firebase auth object during debugging:

```js
firebaseAuth.currentUser.getIdToken().then(console.log)
```

Use only if `firebaseAuth` is reachable from console.

---

## 4. Create booking

1. Open `http://localhost:3000/venues`.
2. Select an approved venue, e.g. `Padel Bali Arena`.
3. Click booking CTA.
4. On `/venues/{venueId}/book`, choose:
   - Venue: selected venue
   - Court: active court, e.g. `Court A`
   - Date: future date
   - Time: one available whole-hour slot
5. Click `Continue to Invite & Pay`.

Expected UI result:

- Booking submit shows progress.
- App navigates to `/booking/{bookingId}/invite?...`.
- No auth redirect after login.
- No generic backend unavailable message.

Expected API result:

- `POST /api/bookings` returns HTTP 201.
- Response has:
  - `id`
  - selected `venue`
  - selected `court`
  - selected `bookingDate`
  - selected `startsAt` / `endsAt`
  - `status: "PENDING_PAYMENT"`

Record:

```text
BOOKING_ID=<id from URL or network response>
VENUE_ID=<venue id>
COURT_ID=<court id>
BOOKING_DATE=<YYYY-MM-DD>
STARTS_AT=<HH:mm>
ENDS_AT=<HH:mm>
```

---

## 5. Verify database booking row

Use Prisma Studio or SQL. SQL example:

```bash
docker compose exec postgres psql -U postgres -d padelhive
```

Inside `psql`:

```sql
select
  id,
  "hostUserId",
  "venueId",
  "courtId",
  "bookingDate",
  "startsAt",
  "endsAt",
  status,
  "courtAmount",
  "platformFee",
  "finalAmount"
from "Booking"
where id = '<BOOKING_ID>';
```

Expected:

- Exactly one row.
- `status` is `PENDING_PAYMENT`.
- `venueId` matches selected venue.
- `courtId` matches selected court.
- `bookingDate`, `startsAt`, and `endsAt` match selected slot.
- Amount fields are positive integers.

Also verify user created from Firebase token:

```sql
select id, "firebaseUid", email, name, role, "isActive"
from "User"
where id = (select "hostUserId" from "Booking" where id = '<BOOKING_ID>');
```

Expected:

- User exists.
- `firebaseUid` matches Firebase account UID.
- `role` is `PLAYER` unless manually changed.
- `isActive` is `true`.

---

## 6. Add invite

On `/booking/{BOOKING_ID}/invite`:

1. Enter friend email, e.g. `qa-friend+<timestamp>@example.com`.
2. Click `Invite`.
3. Wait for success state.
4. Copy generated invite link.

Expected UI result:

- Success message appears.
- Invited player list includes email.
- Invite status shows `Pending`.
- Copy link action works.

Expected API result:

- `POST /api/bookings/{BOOKING_ID}/invites` returns HTTP 201.
- Response has:
  - `bookingId: <BOOKING_ID>`
  - normalized lowercase `email`
  - non-empty `token`
  - `status: "PENDING"`
  - `isHost: false`

Record:

```text
INVITE_ID=<id>
INVITE_TOKEN=<token>
INVITE_LINK=http://localhost:3000/invites/<token>
```

### 6.1 Verify database invite row

```sql
select id, "bookingId", email, name, token, status, "isHost"
from "Invite"
where "bookingId" = '<BOOKING_ID>'
order by "createdAt" desc;
```

Expected:

- Invite row exists for friend email.
- `token` is generated and unique-looking.
- `status` is `PENDING`.
- `isHost` is `false`.

---

## 7. Open invite link in incognito and RSVP

1. Open incognito/private browser window.
2. Paste `INVITE_LINK`.
3. Confirm invite page loads without login.
4. Verify displayed booking details:
   - Host
   - Venue
   - Court
   - Date
   - Time
   - Invitee name/email
5. Click `Accept Invite`.

Expected accept result:

- Page shows accepted success state.
- Invite badge/status updates to `ACCEPTED`.
- No login required.

Verify database:

```sql
select id, token, status, "updatedAt"
from "Invite"
where token = '<INVITE_TOKEN>';
```

Expected:

- `status` is `ACCEPTED`.
- `updatedAt` changed from initial invite creation time.

### 7.1 Decline path probe

Create a second invite from authenticated normal browser:

1. Return to `/booking/{BOOKING_ID}/invite`.
2. Add another email, e.g. `qa-decline+<timestamp>@example.com`.
3. Copy second invite link.
4. Open second link in incognito.
5. Click `Decline`.

Expected:

- Page shows declined success state.
- Database `Invite.status` is `DECLINED` for second token.

---

## 8. Create payment intent

From authenticated normal browser:

1. Open `/booking/{BOOKING_ID}/payment`.
2. Select one payment method:
   - `Virtual Account`
   - `E-Wallet`
   - `Credit / Debit Card`
3. Click `Create Payment Intent`.

Expected UI result:

- Success screen shows `Payment Intent Created`.
- Payment status displays `PENDING`.
- No real payment is processed.

Expected API result:

- `POST /api/payments/intents` returns HTTP 201.
- Request body includes:

```json
{
  "bookingId": "<BOOKING_ID>",
  "method": "va"
}
```

- Response has:
  - `bookingId: <BOOKING_ID>`
  - `status: "PENDING"`
  - `provider: "internal"`
  - selected `method`
  - `amount` equal booking `finalAmount`

### 8.1 Verify database payment row

```sql
select id, "bookingId", amount, status, provider, method, "providerReference", "paidAt", "failedAt"
from "Payment"
where "bookingId" = '<BOOKING_ID>';
```

Expected:

- Exactly one row.
- `status` is `PENDING`.
- `provider` is `internal`.
- `method` matches selected method (`va`, `ewallet`, or `card`).
- `providerReference` is `null`.
- `paidAt` is `null`.
- `failedAt` is `null`.

### 8.2 Duplicate payment probe

Click `Create Payment Intent` again or repeat request for same booking.

Expected:

- Existing pending payment is reused.
- No duplicate payment row is created because `Payment.bookingId` is unique.

Verify:

```sql
select count(*)
from "Payment"
where "bookingId" = '<BOOKING_ID>';
```

Expected:

- Count is `1`.

---

## 9. Required pass/fail checklist

Mark each item:

- [ ] DB starts and is healthy.
- [ ] Migrations and seed complete.
- [ ] API starts at `http://localhost:3001/api`.
- [ ] Web starts at `http://localhost:3000`.
- [ ] Google login succeeds.
- [ ] Protected API requests include Firebase bearer token.
- [ ] Booking can be created from browser UI.
- [ ] Booking row exists in DB.
- [ ] Booking status is `PENDING_PAYMENT`.
- [ ] Invite can be created from browser UI.
- [ ] Invite row exists in DB.
- [ ] Invite token is generated.
- [ ] Invite link opens in incognito without login.
- [ ] RSVP accept updates invite status to `ACCEPTED`.
- [ ] RSVP decline updates invite status to `DECLINED`.
- [ ] Payment intent can be created from browser UI.
- [ ] Payment row exists in DB.
- [ ] Payment status is `PENDING`.
- [ ] Payment provider is `internal`.
- [ ] Duplicate payment intent does not create duplicate payment row.

---

## 10. Blocker handling

If any blocker appears:

1. Capture exact failing step.
2. Capture browser URL, console error, network request/response, API log, and relevant DB row.
3. Fix only blocker.
4. Run focused manual verification from the failed step onward.
5. Run required project validation before PR:

```bash
npm run lint
npm run build
```

6. Commit fix on feature/fix branch.
7. Push and create PR.

Do not add unrelated features or broad refactors during QA sprint.

---

## 11. Known limitations to report if no blocker appears

- Payment intent is internal only; no real provider charge occurs.
- Split payment UI remains demo/state-only until split payment backend exists.
- Invite RSVP is public by token and does not authenticate invitee identity.
- Availability uses current booking conflict checks on submit; web slot grid may still show generated demo availability before submit.
- Firebase token is best verified through real protected network requests unless app exposes Firebase auth object in console.

---

## 12. Manual QA result template

Use this when reporting run outcome:

```markdown
## Manual Protected E2E QA

**Verdict:** PASS | FAIL | BLOCKED

**Environment:**
- DB: local Docker PostgreSQL on `5433`
- API: `http://localhost:3001/api`
- Web: `http://localhost:3000`
- Firebase project: `<project id>`
- Browser: `<browser/version>`

**Flow tested:**
1. Google login: PASS | FAIL
2. Firebase bearer token on protected requests: PASS | FAIL
3. Booking creation: PASS | FAIL — `<BOOKING_ID>`
4. Booking DB status `PENDING_PAYMENT`: PASS | FAIL
5. Invite creation: PASS | FAIL — `<INVITE_TOKEN>`
6. Incognito RSVP accept: PASS | FAIL
7. Incognito RSVP decline: PASS | FAIL
8. Payment intent creation: PASS | FAIL — `<PAYMENT_ID>`
9. Payment DB status/provider `PENDING/internal`: PASS | FAIL
10. Duplicate payment probe: PASS | FAIL

**Evidence:**
- Booking row: `<summary>`
- Invite row(s): `<summary>`
- Payment row: `<summary>`
- Screenshots/network captures: `<paths or notes>`

**Findings:**
- `<blockers or observations>`

**Remaining limitations:**
- Payment provider integration not live.
- Split payment backend not live.
- Public RSVP token does not authenticate invitee identity.
```
