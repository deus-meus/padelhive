# PadelHive

Padel court booking platform. Monorepo containing an ElysiaJS API and a Next.js web app, backed by PostgreSQL (Prisma) with Firebase authentication.

## Tech stack
- **API (apps/api):** ElysiaJS, Prisma, PostgreSQL 16, Firebase Admin, Bun
- **Web (apps/web):** Next.js 14 (App Router), React Query, Zustand, Firebase client
- **Tooling:** Bun workspaces, BiomeJS, Jest, Docker Compose

## Project structure
```text
apps/
  api/   # ElysiaJS backend (bookings, venues, courts, payments, refunds, invites, vouchers, auth, admin)
  web/   # Next.js frontend
docker-compose.yml   # local PostgreSQL
```

## Prerequisites
- Bun (>= 1.1)
- Docker (for local PostgreSQL and API integration tests)

## Setup
1. Install dependencies: `bun install`
2. Copy env files:
   - `cp apps/api/.env.example apps/api/.env`
   - `cp apps/web/.env.example apps/web/.env`
3. Start PostgreSQL: `bun run db:up` (or `docker compose up -d postgres`)
4. Apply migrations: `bun run prisma:migrate`
5. (Optional) Seed data: `bun run prisma:seed`

## Firebase auth (setup)
1) create/select Firebase project (id padelhive)
2) Authentication -> enable Email/Password + Google
3) fill apps/web/.env (NEXT_PUBLIC_FIREBASE_*)
4) fill apps/api/.env (PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY from service account JSON, never commit)
5) bun run seed:test-auth to create the 4 test accounts
6) login with admin@padelhive.com / Padel#Super1

## Running
- **API:** `bun run api:dev`
- **Web:** `bun run dev`

**Local Redis test:** run `docker compose --profile redis up -d redis` (or `docker run -p 6379:6379 redis:7` as a fallback for non-compose users), set `REDIS_URL=redis://localhost:6379` in `apps/api/.env`, start two api instances on different ports, open an SSE stream against each, trigger a notification, and confirm BOTH receive it; then unset `REDIS_URL` and confirm the app still boots and SSE works single-instance.

## Testing
- **API unit tests:** `bun run test -w @padelhive/api` (or `bun --filter @padelhive/api test`)
- **API lint:** `bun run api:lint`
- **API integration tests (require Docker, uses Testcontainers):** `bun run test:int -w @padelhive/api`

## Environment variables

**API (`apps/api/.env`)**
- `DATABASE_URL`: Connection string for PostgreSQL
- `PORT`: Port for the API (default `3001`)
- `FIREBASE_PROJECT_ID`: Firebase project ID
- `FIREBASE_CLIENT_EMAIL` (optional): For Firebase Admin Service Account
- `FIREBASE_PRIVATE_KEY` (optional): For Firebase Admin Service Account
- `MIDTRANS_IS_PRODUCTION`: Toggles sandbox vs production endpoints (default "false")
- `MIDTRANS_SERVER_KEY`: Secret used for webhook signature verification and Basic auth
- `REDIS_URL` (optional): Enables cross-pod SSE fan-out + shared rate limiting. Leave empty for single-instance/local dev (in-memory).

**Web (`apps/web/.env`)**
- `NEXT_PUBLIC_API_URL`: URL for the API backend
- `NEXT_PUBLIC_FIREBASE_API_KEY`: Firebase client configuration
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Firebase client configuration
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Firebase client configuration
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: Firebase client configuration
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: Firebase client configuration
- `NEXT_PUBLIC_FIREBASE_APP_ID`: Firebase client configuration

*(Never commit real `.env` files with actual secrets to version control!)*
