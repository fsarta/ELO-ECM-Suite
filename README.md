# ECM Local Suite - v2

Desktop-native ECM suite (Tauri + React + Fastify) aligned to the Explorer-style specification.

## Workspace

- `apps/ui`: React Explorer UI (tree/content/detail, tabs, global search overlay)
- `apps/api`: Fastify local API with seeded ECM domain data and document operations
- `apps/desktop`: Tauri shell + IPC commands (`dialog`, `notify`, `fs`, `tray`)
- `packages/shared`: shared types between UI and API
- `docs`: planning and architecture notes

## Prerequisites

- Node.js 20+
- pnpm 8+
- Rust stable toolchain (for Tauri checks/build)

## Development

Install dependencies:

```bash
pnpm install
```

Run API:

```bash
pnpm dev:api
```

Run UI (in another terminal):

```bash
pnpm dev:ui
```

Run desktop shell (optional):

```bash
pnpm dev:desktop
```

## Validation

Typecheck all:

```bash
pnpm typecheck
```

Build all JS packages:

```bash
pnpm build
```

Run automated tests:

```bash
pnpm test
```

Check desktop Rust crate:

```bash
cargo check -p ecm-desktop
```

## Key API endpoints

- `GET /api/v1/health`
- `GET /api/v1/repositories/tree`
- `GET /api/v1/repositories/:nodeId/content`
- `GET /api/v1/documents/:documentId`
- `PATCH /api/v1/documents/:documentId`
- `POST /api/v1/documents/:documentId/comments`
- `POST /api/v1/documents/:documentId/check-out`
- `POST /api/v1/documents/:documentId/check-in`
- `DELETE /api/v1/documents/:documentId`
- `POST /api/v1/documents/:documentId/restore`
- `GET /api/v1/search/global`
- `GET /api/v1/workflow/tasks/my`
- `GET /api/v1/dashboard/summary`

