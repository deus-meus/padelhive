# Migration Plan

## Phase 1 (Foundation)

- Create schema only (no business logic).
- Validate schema:
  - `npm run prisma:validate -w @padelhive/api`
- Generate Prisma client:
  - `npm run prisma:generate -w @padelhive/api`
- Create migration once PostgreSQL is available:
  - `npm run prisma:migrate:create -w @padelhive/api`
- Apply migration and seed:
  - `npm run prisma:seed -w @padelhive/api`

## Notes

- `DATABASE_URL` must point to a PostgreSQL instance.
- Seed data uses upserts for deterministic Indonesian demo data.

## Local Docker runtime

1. Copy env file:
   `cp apps/api/.env.example apps/api/.env`
2. Start PostgreSQL:
   `npm run db:up`
3. Generate Prisma client:
   `npm run prisma:generate`
4. Apply migrations:
   `npm run prisma:migrate`
5. Seed data:
   `npm run prisma:seed`
6. Start API:
   `npm run api:dev`

## Future migrations

- Booking locks and availability holds
- Provider webhook tables (Midtrans/Xendit)
- Socket.IO availability/event tables
- Notification delivery (email/push)
