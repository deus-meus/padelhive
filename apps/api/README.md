# Padelhive API

NestJS backend foundation for Padelhive.

## Prerequisites

- Node.js 20+
- npm
- Docker Desktop or Docker Engine with Compose

## Local setup

```bash
cp apps/api/.env.example apps/api/.env
npm install
npm run db:up
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run api:dev
```

The API listens on `http://localhost:3001/api`.

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
npm run db:up
npm run db:down
npm run db:logs
npm run prisma:validate
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run backend:setup
npm run api:dev
```

## Reset local database

```bash
npm run db:down -- --volumes
npm run db:up
npm run backend:setup
```

## Scope

This backend foundation intentionally contains no endpoint business logic yet. Controllers and services are scaffolds for future API phases.
