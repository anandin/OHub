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

A Reddit-style mobile app for Ontario Grade 12 applicants. Aggregates university info, tracks applications, and guides students through the Ontario university admissions process.

**Tech Stack:** Expo SDK 54, expo-router, AsyncStorage, @tanstack/react-query, Inter font, @expo/vector-icons (Feather)

**Tab Navigation (5 tabs):**
- `/(tabs)/index` — Home feed
- `/(tabs)/universities` — Browse & subscribe to all 23 Ontario universities
- `/(tabs)/programs` — Search all Ontario programs
- `/(tabs)/search` — Full-text search across posts/programs/universities
- `/(tabs)/apply` — Application tracker, grade calculator, deadlines, supp advice

**Routes:**
- `/university/[id]` — University detail (Feed / Programs / Admissions / About tabs)
- `/program/[id]` — Program detail with requirements, careers, supp advice
- `/post/[id]` — Post detail

**Features:**

*Feed:*
- Reddit-style feed from subscribed universities
- Heart-based likes, bookmarking (SavedPostsContext)
- Applicant Mode toggle (hides club/sports/merch posts)
- Hot/New/Top sorting
- Category filter chips
- 6-hour auto-refresh via useFeedRefresh + feedRefreshBatches
- Upcoming deadline banner at top
- University pill shortcuts

*Programs Tab (`/(tabs)/programs`):*
- **1,406 Ontario university programs** database (`data/programs.ts`) — every program from all 23 Ontario universities sourced from OUinfo.ca
- Full-text search (name, description, careers, faculty)
- Filter by faculty type: Engineering, Business, CS, Science, Health, Law, Architecture, Math, Arts, Music, Education, Environment
- Filter by university (dropdown)
- Sort: A–Z, Easiest Entry, Hardest Entry, By University
- Program cards show: avg grade, degree, duration, co-op status, supp required badge, competitiveness

*Program Detail (`/program/[id]`):*
- Full program info: degree, duration, tuition, intake size, OUAC code, deadline
- Required Grade 12 courses
- Career paths
- Notable features
- Supplementary app warning box
- Track Application button → links to ApplicationsContext
- Supplementary application advice cards (expandable, sourced from alumni/official/coaching/community)

*Apply Tab (`/(tabs)/apply`):*
- Application tracker: track per-university status (Shortlisted → Applied → Supp Sent → Offer → Accepted → Declined), notes, remove
- Progress bar overview
- Grade Average Calculator: enter top-6 marks → shows program eligibility (green/yellow/red)
- Deadline countdown strip (upcoming 5 deadlines from `data/deadlines.ts`)
- **Supplementary Application Advice section**: expandable cards filtered by program, sourced from:
  - Official university pages
  - Alumni accounts (Reddit, LinkedIn)
  - Youthfully.ca coaching guides
  - Grantme.ca coaching guides
  - "Browse All Programs" CTA

*University Detail (`/university/[id]`):*
- Tabs: Feed / Programs / Admissions / About
- Admissions tab: OUAC info, per-program requirements, admission averages, required courses, deadlines, supplementary app warnings, career paths
- Track My Application button (opens status picker)

**Data Files:**
- `data/universities.ts` — 16 Ontario universities
- `data/feed.ts` — 50+ SAMPLE_POSTS across all universities
- `data/feedRefreshBatches.ts` — 4 rotating refresh batches
- `data/programs.ts` — **1,406 programs** across all 23 Ontario universities sourced from OUinfo.ca (`ALL_PROGRAMS`, `SAMPLE_PROGRAMS`)
- `data/deadlines.ts` — Ontario application lifecycle deadlines (OUAC, supp apps, scholarships, offers)
- `data/suppAdvice.ts` — Supplementary application advice cards by program

**Context Providers (in `_layout.tsx`):**
SubscriptionsProvider → SavedPostsProvider → ApplicationsProvider → GestureHandlerRootView → KeyboardProvider

**Design System:**
- Colors: primary `#1A3A6B`, accent `#D4A017`, likeColor `#FF2D55`
- `Colors.light.primaryMuted` for tinted backgrounds
- `Colors.light.success` for co-op/acceptance indicators

**Key Notes:**
- `saved.tsx` still exists but is `href: null` (hidden) — PostCard still imports SavedPostsContext
- Post interface uses `likes` field (not `upvotes`)
- Applicant Mode hides categories: `["club", "sports", "merch"]`
- Application statuses: shortlisted → applied → supp_sent → offer → accepted → declined

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
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. Always typecheck from root: `pnpm run typecheck`.
