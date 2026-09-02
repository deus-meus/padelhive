#!/bin/sh
set -e

PRISMA_CLI=$(bun -e 'console.log(require.resolve("prisma"))')

echo "Generating Prisma Client..."
bun "$PRISMA_CLI" generate --schema prisma/schema.prisma || true

echo "Running Prisma Migrations..."
bun "$PRISMA_CLI" migrate deploy --schema prisma/schema.prisma || true

echo "Running Prisma Seeder..."
bun prisma/seed.ts || true

echo "Starting Elysia API Server..."
bun dist/index.js
