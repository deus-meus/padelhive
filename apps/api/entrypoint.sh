#!/bin/sh
set -e

echo "Running Prisma Migrations..."
npx prisma migrate deploy

echo "Running Prisma Seeder..."
# Compile seeder to JS and run it using pure node
npx tsc prisma/seed.ts
node prisma/seed.js

echo "Starting API Server..."
npm run start
