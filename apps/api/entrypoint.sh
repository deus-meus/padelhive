#!/bin/sh
set -e

echo "Running Prisma Migrations..."
npx prisma migrate deploy

echo "Running Prisma Seeder..."
npm run prisma:seed

echo "Starting API Server..."
npm run start
