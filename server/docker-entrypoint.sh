#!/bin/sh
set -e

echo "[entrypoint] Running prisma generate..."
npx prisma generate

echo "[entrypoint] Running prisma migrate deploy..."
npx prisma migrate deploy

echo "[entrypoint] Starting app..."
exec node index.js
