#!/bin/sh
set -e

echo "Running Prisma Migrations..."
bunx prisma migrate deploy --schema prisma/schema.prisma

echo "Running Prisma Seeder..."
bun prisma/seed.ts

echo "Starting Elysia API Server..."
bun dist/index.js
