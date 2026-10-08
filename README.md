<div align="center">

# LeetCode

**A personal algorithm notebook — problem statements on the left, a
Monaco editor on the right, with reference solutions in TypeScript,
JavaScript, and Go.**

[![TanStack Start](https://img.shields.io/badge/TanStack-Start-0ea5e9?logo=typescript&logoColor=white)](https://tanstack.com/start)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)

</div>

---

## Overview

A personal workspace for storing and reviewing algorithm problems and reference
solutions. Each problem shows its statement and examples on the left and a
[Monaco](https://microsoft.github.io/monaco-editor/) editor on the right, where you
maintain solutions in TypeScript, JavaScript, or Go.

Saving is deliberate, not automatic: edits require a dialog confirmation and
overwrite the stored solution. A dedicated dashboard provides full CRUD over
problems.

## Features

- **Problem notebook** — statement + examples rendered as Markdown, with per-problem
  reference solutions in TS / JS / Go and difficulty badges.
- **Deliberate saves** — edits are committed only after a confirmation dialog,
  directly overwriting the previous code.
- **Full CRUD dashboard** — create, edit, and delete problems with a form dialog.
- **Dark / light theming** — toggle in the app header.
- **SSR + SPA modes** — TanStack Start server-rendered by default, with a fully
  static build (`build:static`) that swaps the data seam (MongoDB server functions →
  IndexedDB) so it can deploy anywhere.
- **Optional telemetry** — `@yukino.js/sentry` browser monitoring, active only when
  `VITE_YUKINO_SENTRY_DSN` is set.

## Tech stack

| Layer     | Technologies                                                                 |
| --------- | ---------------------------------------------------------------------------- |
| Framework | TanStack Start · React 19 · Nitro (server)                                   |
| UI        | Tailwind CSS v4 · shadcn-style components (`@base-ui/react`) · Monaco Editor |
| Data      | MongoDB (official driver) · TanStack Query                                   |
| Routing   | TanStack Router (file-based), TanStack Devtools                              |
| Tooling   | Vite 8 · Biome · TypeScript strict                                           |

## Local development

Prerequisites: **Node.js 24+** (used by CI and Docker), **pnpm**, and a running
**MongoDB** (e.g. `brew services start mongodb-community`, or any reachable
server — point `MONGODB_URI` at it).

```bash
pnpm install
cp .env.example .env.local   # first time only
pnpm db:import               # seed MongoDB from the committed snapshot.json
pnpm dev                     # http://localhost:3000
```

Common scripts: `pnpm check` (Biome), `pnpm build` (output in `.output/`),
`pnpm start` (run the production build), `pnpm db:import` (seed/re-seed
MongoDB from a snapshot), `pnpm db:export` (dump MongoDB back to
`public/snapshot.json`).

### Static build (GitHub Pages)

```bash
pnpm db:export        # refresh public/snapshot.json from MongoDB
pnpm build:static
pnpm preview:static
```

`pnpm db:export` dumps the MongoDB collections straight into
`public/snapshot.json` — the JSON snapshot of the database. The static build
aliases `#/data/problems.ts` to a static data source backed by IndexedDB,
keeping MongoDB and the server functions out of the bundle.

The snapshot is committed to the repository, so the Pages workflow
(`.github/workflows/deploy.yaml`) builds without any database access: at
runtime the static client fetches `snapshot.json` and seeds it into IndexedDB
(re-seeding whenever the snapshot's version hash changes).

## Docker deployment

```bash
docker build -t leetcode .
docker run -d -p 3000:3000 \
  -e MONGODB_URI="mongodb://host.docker.internal:27017" \
  --name leetcode leetcode
```

- Open `http://localhost:3000`
- MongoDB runs outside the container (local install, another container on a
  shared network, or a managed cluster); the app connects via `MONGODB_URI`
- Collections and indexes are created lazily on first use — no schema push or
  migration step on boot

### Environment variables

| Variable                 | Default                      | Description                                      |
| ------------------------ | ---------------------------- | ------------------------------------------------ |
| `MONGODB_URI`            | `mongodb://127.0.0.1:27017`  | MongoDB connection string                        |
| `MONGODB_DB`             | `leetcode`                   | Database name                                    |
| `PORT` / `HOST`          | `3000` / `0.0.0.0`           | Server listen address                            |
| `VITE_YUKINO_SENTRY_DSN` | empty                        | Browser monitoring endpoint; disabled when unset |

### Notes

- The image runs as the non-root `node` user by default.
- The build depends on the official npm registry (see the project `.npmrc`). On a
  corporate network, point that file at a mirror registry before building.
- For cross-architecture deployment (e.g. built on Apple Silicon, run on x86), build
  on the target machine or use `docker build --platform linux/amd64`.

## Repository layout

```
src/
├── routes/                # __root, index, dashboard, problems.$problemId
├── components/            # app header, Monaco code editor, markdown, dialogs
├── server/                # MongoDB-backed server functions (createServerFn)
├── data/                  # data seam: server functions vs. static/IndexedDB
├── integrations/          # TanStack Query wiring
├── lib/                   # languages, theme, utils
└── db.ts                  # Mongo client, typed collections, id counters
public/snapshot.json       # committed MongoDB JSON snapshot (static-build seed)
scripts/                   # snapshot import/export, static build/preview
```
