#!/bin/sh
set -e

echo "Running Prisma Migrations..."
if [ -f "./node_modules/prisma/build/index.js" ]; then
  bun ./node_modules/prisma/build/index.js migrate deploy --schema prisma/schema.prisma
elif [ -f "../../node_modules/prisma/build/index.js" ]; then
  bun ../../node_modules/prisma/build/index.js migrate deploy --schema prisma/schema.prisma
else
  bunx prisma migrate deploy --schema prisma/schema.prisma || true
fi

echo "Running Prisma Seeder..."
bun prisma/seed.ts || true

echo "Starting Elysia API Server..."
bun dist/index.js
