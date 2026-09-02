#!/bin/sh
set -e

PRISMA_CLI=$(find /app/node_modules -type f -name "index.js" | grep "prisma/build/index.js" | head -n 1)

echo "Generating Prisma Client..."
bun "$PRISMA_CLI" generate --schema prisma/schema.prisma || true

echo "Running Prisma Migrations..."
bun "$PRISMA_CLI" migrate deploy --schema prisma/schema.prisma || true

echo "Running Prisma Seeder..."
bun prisma/seed.ts || true

echo "Starting Elysia API Server..."
bun dist/index.js
