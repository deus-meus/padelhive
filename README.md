# PadelHive

Padel court booking marketplace. Monorepo containing an ElysiaJS API and a SvelteKit web app, backed by PostgreSQL (Prisma) with Firebase authentication.

## Tech stack
- **API (`apps/api`):** ElysiaJS, Prisma, PostgreSQL 16, Firebase Admin, Bun
- **Web (`apps/web`):** SvelteKit 2, Svelte 5 Runes, Tailwind CSS, Lucide Svelte, Eden Treaty, Firebase Client
- **Tooling:** Bun workspaces, BiomeJS, Docker Compose

## Project structure
```text
apps/
  api/   # ElysiaJS backend (bookings, venues, courts, payments, refunds, invites, vouchers, auth, admin, disputes, notifications, health)
  web/   # SvelteKit frontend
docker-compose.yml   # local PostgreSQL
```

## Prerequisites
- Bun (>= 1.1)
- Docker (for local PostgreSQL)

## Setup
1. Install dependencies: `bun install`
2. Copy env files:
   - `cp apps/api/.env.example apps/api/.env`
   - `cp apps/web/.env.example apps/web/.env`
3. Start PostgreSQL: `bun run db:up` (or `docker compose up -d postgres`)
4. Apply migrations: `bun run prisma:migrate`
5. (Optional) Seed data: `bun run prisma:seed`

## Firebase auth (setup)
1) Create/select Firebase project (id `padelhive`)
2) Authentication -> enable Email/Password + Google
3) Fill `apps/web/.env` (`PUBLIC_FIREBASE_*`)
4) Fill `apps/api/.env` (`PROJECT_ID`/`CLIENT_EMAIL`/`PRIVATE_KEY` from service account JSON, never commit)
5) `bun run seed:test-auth` to create the test accounts
6) Login with `admin@padelhive.com` / `Padel#Super1`

## Running
- **API:** `bun run api:dev` (runs on `http://localhost:3001/api`)
- **Web:** `bun run dev` (runs on `http://localhost:3000`)

### Observability & Health Endpoints
- **Health Check:** `http://localhost:3001/api/health`
- **Swagger Documentation:** `http://localhost:3001/api/swagger`
- **Request Tracing:** Automatic `X-Request-ID` header correlation across web & API logs.
- **Logging:** Clean text-based logging in Development mode; structured JSON logging in Production mode.

## Testing & Quality Assurance
- **Type Checking:** `bun run check` (or `cd apps/web && bun svelte-check`)
- **Linting & Code Formatting:** `bun run lint` (uses BiomeJS)

## Environment variables

**API (`apps/api/.env`)**
- `DATABASE_URL`: Connection string for PostgreSQL
- `PORT`: Port for the API (default `3001`)
- `FIREBASE_PROJECT_ID`: Firebase project ID
- `FIREBASE_CLIENT_EMAIL` (optional): For Firebase Admin Service Account
- `FIREBASE_PRIVATE_KEY` (optional): For Firebase Admin Service Account
- `MIDTRANS_IS_PRODUCTION`: Toggles sandbox vs production endpoints (default "false")
- `MIDTRANS_SERVER_KEY`: Secret used for webhook signature verification and Basic auth

**Web (`apps/web/.env`)**
- `PUBLIC_API_URL`: URL for the API backend (default `http://localhost:3001`)
- `PUBLIC_FIREBASE_API_KEY`: Firebase client configuration
- `PUBLIC_FIREBASE_AUTH_DOMAIN`: Firebase client configuration
- `PUBLIC_FIREBASE_PROJECT_ID`: Firebase client configuration
- `PUBLIC_FIREBASE_STORAGE_BUCKET`: Firebase client configuration
- `PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: Firebase client configuration
- `PUBLIC_FIREBASE_APP_ID`: Firebase client configuration
- `PUBLIC_MIDTRANS_CLIENT_KEY`: Midtrans client key

*(Never commit real `.env` files with actual secrets to version control!)*
