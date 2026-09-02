#!/bin/sh
set -e

export PATH="/app/node_modules/.bin:$PATH"

echo "Generating Prisma Client..."
bun run prisma:generate || true

echo "Running Prisma Migrations..."
bun run prisma:migrate:deploy || true

echo "Running Prisma Seeder..."
bun run prisma:seed || true

echo "Starting Elysia API Server..."
bun dist/index.js
