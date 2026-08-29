# Padelhive API

High-performance ElysiaJS backend for Padelhive powered by Bun.

## Prerequisites

- Bun (>= 1.1)
- Docker Desktop or Docker Engine with Compose

## Local setup

```bash
cp apps/api/.env.example apps/api/.env
bun install
bun run db:up
bun run prisma:generate
bun run prisma:migrate
bun run prisma:seed
bun run api:dev
```

The API listens on `http://localhost:3001/api`.
Swagger docs are available at `http://localhost:3001/api/swagger`.

## Database

Docker Compose starts PostgreSQL 16 with:

- database: `padelhive`
- user: `postgres`
- password: `postgres`
- host port: `5433`
- container port: `5432`

Connection string:

```bash
postgresql://postgres:postgres@localhost:5433/padelhive?schema=public
```

## Useful commands

```bash
bun run db:up
bun run db:down
bun run db:logs
bun run prisma:validate
bun run prisma:generate
bun run prisma:migrate
bun run prisma:seed
bun run backend:setup
bun run api:dev
bun --filter @padelhive/api test
```
