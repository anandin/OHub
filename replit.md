# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### `artifacts/unihub` - UniHub Mobile App (Expo)

A Reddit-style mobile app for Ontario university students. Aggregates information from all Ontario universities including programs, events, hackathons, scholarships, club events, merch drops, open houses, etc.

**Features:**
- Reddit-style scrollable feed with posts from subscribed universities
- University subscription system (subscribe/unsubscribe to any Ontario university)
- Post voting and saving system (persisted via AsyncStorage)
- Category filtering (events, hackathons, open houses, programs, scholarships, etc.)
- Hot/New/Top sorting
- University detail pages with Feed, Programs, Faculties, About tabs
- Post detail pages with source links
- Full-text search across posts, programs, and universities
- Saved posts bookmarking

**Data:**
- 16 Ontario universities pre-seeded with full data
- Sample posts representing real-world content categories
- Sample programs for major universities with requirements, deadlines, tuition

**Routes:**
- `/(tabs)/index` - Home feed
- `/(tabs)/universities` - Browse all universities
- `/(tabs)/search` - Search posts, programs, universities
- `/(tabs)/saved` - Saved posts
- `/university/[id]` - University detail
- `/post/[id]` - Post detail

**Data Sources (future integration):**
- OUInfo.ca
- Individual university websites
- Affiliated organizations (MathSoc, EngSoc, etc.)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── unihub/             # UniHub Expo mobile app
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references
