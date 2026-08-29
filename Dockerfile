# ---------- Build stage ----------
FROM node:24-bookworm-slim AS builder
WORKDIR /app

# Toolchain to compile better-sqlite3 from source if the prebuilt binary download fails
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm@11.22.0

# Copy the dependency manifests first so the dependency layer stays cached
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

COPY . .

# generate does not touch the database, but prisma.config.ts requires DATABASE_URL to be set
ENV DATABASE_URL="file:./build-placeholder.db"
RUN pnpm exec prisma generate && pnpm build

# ---------- Runtime stage ----------
FROM node:24-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    DATABASE_URL="file:/data/playground.db"

# prisma schema-engine needs openssl at runtime
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# Install only the prisma CLI, used by the entrypoint to sync the schema on boot (keep in sync with package.json)
COPY .npmrc ./
RUN npm install --no-package-lock --no-audit --no-fund prisma@7.10.0 \
    && npm cache clean --force

COPY prisma.config.ts ./
COPY prisma ./prisma
COPY --from=builder /app/.output ./.output
COPY --chmod=0755 docker-entrypoint.sh ./

RUN mkdir -p /data && chown -R node:node /data /app
USER node

EXPOSE 3000
VOLUME ["/data"]

ENTRYPOINT ["./docker-entrypoint.sh"]
