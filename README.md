# ECM Local Suite - v2 Bootstrap

This repository contains an initial scaffold aligned with the ECM Local Suite v2 desktop-native specification.

## Workspace layout

- `apps/ui`: React + TypeScript UI with Explorer-style layout
- `apps/api`: Fastify TypeScript backend (local loopback API)
- `apps/desktop`: Tauri Rust shell with placeholder IPC commands
- `packages/shared`: shared types used across apps
- `docs`: technical notes and implementation planning

## Quick start

1. Install dependencies:

```bash
pnpm install
```

2. Run UI:

```bash
pnpm dev:ui
```

3. Run API:

```bash
pnpm dev:api
```

## Current scope

This bootstrap provides:

- Explorer desktop UI skeleton (menu, toolbar, tree/content/detail, status bar)
- Local API health endpoints on `127.0.0.1:3001`
- Tauri command surface placeholder for OS operations

## Next implementation phases

1. Domain model and Prisma schema (SQLite default)
2. Repository/document APIs with auth and ACL
3. Virtualized content panel + filtering/sorting
4. Check-in/check-out and version history
5. Workflow engine integration
6. Search index and global search overlay

