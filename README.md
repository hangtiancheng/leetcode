<div align="center">

# Playground

**A LeetCode-style personal algorithm notebook — problem statements on the left, a
Monaco editor on the right, with versioned reference solutions in TypeScript,
JavaScript, and Go.**

[![TanStack Start](https://img.shields.io/badge/TanStack-Start-0ea5e9?logo=typescript&logoColor=white)](https://tanstack.com/start)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

</div>

---

## Overview

A personal workspace for storing and reviewing algorithm problems and reference
solutions. Each problem shows its statement and examples on the left and a
[Monaco](https://microsoft.github.io/monaco-editor/) editor on the right, where you
maintain solutions in TypeScript, JavaScript, or Go.

Saving is deliberate, not automatic: edits require a dialog confirmation, which
archives the previous revision, bumps the version number, and can be rolled back to
the prior version at any time. A dedicated dashboard provides full CRUD over
problems.

## Features

- **Problem notebook** — statement + examples rendered as Markdown, with per-problem
  reference solutions in TS / JS / Go and difficulty badges.
- **Versioned solutions** — confirmed saves create an immutable revision and bump
  the version; one-click rollback restores the previous version.
- **Full CRUD dashboard** — create, edit, and delete problems with a form dialog.
- **Dark / light theming** — toggle in the app header.
- **SSR + SPA modes** — TanStack Start server-rendered by default, with a fully
  static build (`build:static`) that swaps the data seam (Prisma server functions →
  IndexedDB) so it can deploy anywhere.
- **Optional telemetry** — `@swifty.js/sentry` browser monitoring, active only when
  `VITE_SWIFTY_SENTRY_DSN` is set.

## Tech stack

| Layer     | Technologies                                                                 |
| --------- | ---------------------------------------------------------------------------- |
| Framework | TanStack Start · React 19 · Nitro (server)                                   |
| UI        | Tailwind CSS v4 · shadcn-style components (`@base-ui/react`) · Monaco Editor |
| Data      | Prisma 7 + SQLite (better-sqlite3) · TanStack Query                          |
| Routing   | TanStack Router (file-based), TanStack Devtools                              |
| Tooling   | Vite 8 · Biome · TypeScript strict                                           |

## Local development

Prerequisites: **Node.js 20+** and **pnpm**.

```bash
pnpm install
cp .env.example .env.local   # first time only
pnpm db:generate             # generate the Prisma Client
pnpm db:push                 # create tables (SQLite: ./dev.db)
pnpm dev                     # http://localhost:3000
```

Common scripts: `pnpm check` (Biome), `pnpm build` (output in `.output/`),
`pnpm start` (run the production build), `pnpm db:studio` (Prisma Studio).

### Static build

```bash
pnpm build:static
pnpm preview:static
```

The static build aliases `#/data/problems.ts` to a static data source backed by
IndexedDB, keeping Prisma and the server functions out of the bundle.

## Docker deployment

```bash
docker compose up -d --build
```

- Open `http://localhost:3000`
- The database persists in the named volume `playground-data`
  (`/data/playground.db` inside the container)
- On startup the entrypoint runs `prisma db push` to sync the schema before
  starting the server

Docker without Compose:

```bash
docker build -t playground .
docker run -d -p 3000:3000 -v playground-data:/data --name playground playground
```

### Environment variables

| Variable                 | Default                    | Description                                      |
| ------------------------ | -------------------------- | ------------------------------------------------ |
| `DATABASE_URL`           | `file:/data/playground.db` | SQLite file path                                 |
| `PORT` / `HOST`          | `3000` / `0.0.0.0`         | Server listen address                            |
| `VITE_SWIFTY_SENTRY_DSN` | empty                      | Browser monitoring endpoint; disabled when unset |

### Notes

- The image runs as the non-root `node` user by default. With a host-directory bind
  mount (instead of a named volume), ensure it is writable: `chown 1000:1000 <dir>`.
- The build depends on the official npm registry (see the project `.npmrc`). On a
  corporate network, point that file at a mirror registry before building.
- For cross-architecture deployment (e.g. built on Apple Silicon, run on x86), build
  on the target machine or use `docker build --platform linux/amd64`.

## Repository layout

```
src/
├── routes/                # __root, index, dashboard, problems.$problemId
├── components/            # app header, Monaco code editor, markdown, dialogs
├── server/                # Prisma-backed server functions (createServerFn)
├── data/                  # data seam: server functions vs. static/IndexedDB
├── integrations/          # TanStack Query wiring
├── lib/                   # languages, theme, utils
└── generated/prisma/      # generated Prisma client
prisma/                    # schema.prisma + migrations
scripts/                   # export snapshot, finalize/serve static build
```
