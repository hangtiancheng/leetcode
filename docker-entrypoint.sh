#!/bin/sh
set -e

echo "[leetcode] starting server on :$PORT (mongodb: $MONGODB_URI, db: $MONGODB_DB)"
exec node .output/server/index.mjs
