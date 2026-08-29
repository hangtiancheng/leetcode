# Playground

A LeetCode-style personal algorithm notebook: the problem statement and examples on the left, a Monaco editor on the right maintaining reference solutions in TS / JS / Go. Edits are not persisted automatically — saving requires dialog confirmation (version incremented, previous revision archived) and can be rolled back to the prior version at any time. The dashboard supports full CRUD over problems.

Stack: TanStack Start · React 19 · Tailwind CSS v4 · shadcn-style components (@base-ui/react) · Monaco Editor · Prisma 7 + SQLite (better-sqlite3).

## Local development

```bash
pnpm install
cp .env.example .env.local   # first time only
pnpm db:generate             # generate the Prisma Client
pnpm db:push                 # create tables (SQLite: ./dev.db)
pnpm dev                     # http://localhost:3000
```

Common scripts: `pnpm check` (Biome), `pnpm build` (output in `.output/`), `pnpm start` (run the production build), `pnpm db:studio`.

## Docker deployment

```bash
docker compose up -d --build
```

- Open `http://localhost:3000`
- The database persists in the named volume `playground-data` (`/data/playground.db` inside the container)
- On startup the entrypoint runs `prisma db push` to sync the schema before starting the server

Docker without Compose:

```bash
docker build -t playground .
docker run -d -p 3000:3000 -v playground-data:/data --name playground playground
```

### Environment variables

| Variable          | Default                    | Description                                             |
| ----------------- | -------------------------- | ------------------------------------------------------- |
| `DATABASE_URL`    | `file:/data/playground.db` | SQLite file path                                        |
| `PORT` / `HOST`   | `3000` / `0.0.0.0`         | Server listen address                                   |
| `VITE_SENTRY_DSN` | empty                      | When unset, Sentry only warns locally and never reports |

### Notes

- The image runs as the non-root `node` user by default. When using a host directory bind mount instead of a named volume, make sure it is writable: `chown 1000:1000 <directory>`.
- The build depends on the official npm registry (see the project `.npmrc`). On a corporate network, point that file at a mirror registry before building.
- For cross-architecture deployment (e.g. built on Apple Silicon, run on x86), build on the target machine or use `docker build --platform linux/amd64`.
