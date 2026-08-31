#!/bin/sh
set -e

echo "[playground] syncing database schema -> $DATABASE_URL"
./node_modules/.bin/prisma db push

echo "[playground] starting server on :$PORT"
exec node .output/server/index.mjs
