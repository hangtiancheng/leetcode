FROM node:24-bookworm-slim AS builder
WORKDIR /app

RUN npm install -g pnpm@11.22.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM node:24-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    MONGODB_URI="mongodb://localhost:27017" \
    MONGODB_DB="leetcode"

COPY --from=builder /app/.output ./.output
COPY --chmod=0755 docker-entrypoint.sh ./

USER node

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
