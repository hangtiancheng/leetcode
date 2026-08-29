#!/bin/sh
set -e

echo "[playground] syncing database schema -> $DATABASE_URL"
./node_modules/.bin/prisma db push

echo "[playground] starting server on :$PORT"
exec node --import ./.output/server/instrument.server.mjs .output/server/index.mjs
