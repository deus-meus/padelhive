#!/bin/sh
set -e

cd /app
export NODE_PATH=/app/node_modules
export PRISMA_GENERATE_SKIP_AUTO_INSTALL=true

PRISMA_CLI=$(find /app/node_modules -type f -name "index.js" | grep "prisma/build/index.js" | head -n 1)

echo "Running Prisma Migrations..."
bun "$PRISMA_CLI" migrate deploy --schema apps/api/prisma/schema.prisma || bun "$PRISMA_CLI" db push --schema apps/api/prisma/schema.prisma || true

echo "Running Prisma Seeder..."
cd /app/apps/api && bun prisma/seed.ts || true

cd /app
echo "Starting Elysia API Server..."
bun apps/api/dist/index.js
