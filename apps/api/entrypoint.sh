#!/bin/sh
set -e

echo "Generating Prisma Client..."
bun run prisma generate --schema prisma/schema.prisma || true

echo "Running Prisma Migrations..."
bun run prisma migrate deploy --schema prisma/schema.prisma

echo "Running Prisma Seeder..."
bun prisma/seed.ts || true

echo "Starting Elysia API Server..."
bun dist/index.js
