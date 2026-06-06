# PadelHive

Padel court booking platform. Monorepo containing a NestJS API and a Next.js web app, backed by PostgreSQL (Prisma) with Firebase authentication.

## Tech stack
- **API (apps/api):** NestJS, Prisma, PostgreSQL 16, Firebase Admin
- **Web (apps/web):** Next.js 14 (App Router), React Query, Zustand, Firebase client
- **Tooling:** npm workspaces, Jest, ESLint, Docker Compose

## Project structure
```text
apps/
  api/   # NestJS backend (bookings, venues, courts, payments, refunds, invites, vouchers, auth, admin)
  web/   # Next.js frontend
docker-compose.yml   # local PostgreSQL
```

## Prerequisites
- Node.js
- npm
- Docker (for local PostgreSQL and API integration tests)

## Setup
1. Install dependencies: `npm install`
2. Copy env files:
   - `cp apps/api/.env.example apps/api/.env`
   - `cp apps/web/.env.example apps/web/.env`
3. Start PostgreSQL: `npm run db:up` (or `docker compose up -d postgres`)
4. Apply migrations: `npm run prisma:migrate`
5. (Optional) Seed data: `npm run prisma:seed`

## Running
- **API:** `npm run api:dev`
- **Web:** `npm run dev`

## Testing
- **API unit tests:** `npm run test -w @padelhive/api`
- **API lint:** `npm run api:lint`
- **API integration tests (require Docker, uses Testcontainers):** `npm run test:int -w @padelhive/api`

## Environment variables

**API (`apps/api/.env`)**
- `DATABASE_URL`: Connection string for PostgreSQL
- `PORT`: Port for the API (default `3001`)
- `FIREBASE_PROJECT_ID`: Firebase project ID
- `FIREBASE_CLIENT_EMAIL` (optional): For Firebase Admin Service Account
- `FIREBASE_PRIVATE_KEY` (optional): For Firebase Admin Service Account

**Web (`apps/web/.env`)**
- `NEXT_PUBLIC_API_URL`: URL for the API backend
- `NEXT_PUBLIC_FIREBASE_API_KEY`: Firebase client configuration
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Firebase client configuration
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Firebase client configuration
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: Firebase client configuration
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: Firebase client configuration
- `NEXT_PUBLIC_FIREBASE_APP_ID`: Firebase client configuration

*(Never commit real `.env` files with actual secrets to version control!)*
