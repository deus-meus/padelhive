#!/bin/sh
set -e

echo "Generating Prisma Client..."
bunx prisma generate --schema prisma/schema.prisma || true

echo "Running Prisma Migrations..."
bunx prisma migrate deploy --schema prisma/schema.prisma || true

echo "Running Prisma Seeder..."
bun run prisma:seed || true

echo "Starting Elysia API Server..."
bun dist/index.js
