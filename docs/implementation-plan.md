# ECM Local Suite v2 - Implementation Plan

## Phase 0 - Bootstrap

- Monorepo layout
- UI shell Explorer
- Local API service and health endpoints
- Tauri shell and IPC command placeholders

## Phase 1 - Core data layer

- Prisma schema for users, repositories, documents, versions
- SQLite migration and seed
- File storage adapter for local filesystem

## Phase 2 - Document operations

- Upload/download, rename, move, delete
- Metadata forms by document class
- Versioning and check-in/check-out

## Phase 3 - Workflow and activity

- Process definitions
- Task assignment and completion
- Activity panel and status indicators

## Phase 4 - Search and usability

- Full-text indexing
- Global search overlay (`Ctrl+K`)
- Keyboard-first navigation and context menus

## Phase 5 - Desktop integration

- Native dialogs, notifications, tray
- Sidecar process management (API + search)
- Packaging for Windows/macOS/Linux

