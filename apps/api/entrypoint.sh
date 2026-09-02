#!/bin/sh
set -e

cd /app
chmod -R +x /app/node_modules 2>/dev/null || true

echo "Generating Prisma Client..."
bun --filter @padelhive/api prisma:generate || true

echo "Running Prisma Migrations..."
bun --filter @padelhive/api prisma:migrate:deploy || true

echo "Running Prisma Seeder..."
bun --filter @padelhive/api prisma:seed || true

echo "Starting Elysia API Server..."
cd /app/apps/api
bun dist/index.js
