#!/bin/sh
set -e

echo "Running Prisma Migrations..."
npx prisma migrate deploy

echo "Running Prisma Seeder..."
# Run the pre-compiled JS seeder
node prisma/seed.js

echo "Starting API Server..."
npm run start
