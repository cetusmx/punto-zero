#!/bin/sh
set -e

echo "[entrypoint] Running prisma generate..."
npx prisma generate

echo "[entrypoint] Running prisma db push..."
npx prisma db push --accept-data-loss

echo "[entrypoint] Starting app..."
exec node index.js
