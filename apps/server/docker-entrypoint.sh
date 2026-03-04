#!/bin/sh
set -e

echo "Syncing database schema..."
npx prisma db push

echo "Starting server..."
exec node dist/index.js
