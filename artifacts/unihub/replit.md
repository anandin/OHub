# UniHub — Ontario University Hub

A Reddit-style Expo mobile app for Ontario Grade 12 university applicants, built with the **oHub Editorial** design system.

## Design System (Editorial Direction A)

| Token | Value |
|---|---|
| Background (Paper) | `#f5f1e8` |
| Card | `#fbf8f1` |
| Ink (primary text) | `#1a1612` |
| Soft Ink | `#5c4a2f` |
| Muted | `#8b7e62` |
| Rule / Border | `#e8e0cf` |
| Accent Warn | `#c2410c` |
| Accent Success | `#15803d` |
| Serif font | Fraunces (headlines) |
| Sans font | Inter (body) |
| Mono font | JetBrains Mono (numbers/code) |

## Navigation (5 Tabs)

| Tab | File | Description |
|---|---|---|
| Today | `app/(tabs)/index.tsx` | Dashboard: countdown, tasks, featured article, events |
| Programs | `app/(tabs)/programs.tsx` | 1,406 programs with Reach/Target/Safety tier filter |
| Apply | `app/(tabs)/apply.tsx` | OUAC tracker with ref number and deadlines |
| Pulse | `app/(tabs)/universities.tsx` | Social feed with Following/School/All |
| You | `app/(tabs)/search.tsx` | Profile, top-6 marks editor, app stats |

## Stack Screens

| Route | File | Description |
|---|---|---|
| `/scholarships` | `app/scholarships.tsx` | Scholarship match list with eligibility |
| `/chats` | `app/chats.tsx` | Chat list (pinned + all) |
| `/chat/[id]` | `app/chat/[id].tsx` | Group/DM chat thread |
| `/essay/[id]` | `app/essay/[id].tsx` | Essay drafting with word count + oHub coach |
| `/program/[id]` | `app/program/[id].tsx` | Program detail |
| `/university/[id]` | `app/university/[id].tsx` | University detail |

## Data Architecture

- **`data/programs.ts`** — 1,406 Ontario university programs (OUinfo.ca), ~28k lines
- **`data/universities.ts`** — 23 Ontario universities
- **`data/userData.ts`** — User profile defaults, tasks, events, scholarships, chat list
- **`data/deadlines.ts`** — OUAC key dates with countdown
- **`data/feed.ts`** — Sample posts (852 lines) for Pulse feed

## Context Providers

- **`UserContext`** — User profile (name, school, OUAC ref, avg, marks), tasks with toggle state
- **`ApplicationsContext`** — OUAC application tracker (status, notes, per-university)
- **`SubscriptionsContext`** — Followed universities (used in Pulse feed)
- **`SavedPostsContext`** — Saved posts from Pulse feed

## Key Features

### Tier Classification (Programs)
Programs classified as Reach/Target/Safety based on:
- `extreme`/`very_high` competitiveness → Reach
- `high` competitiveness → Target  
- `moderate` → Safety
- Also considers `userAvg - cutoff` for personalization

### OUAC Tracker (Apply)
- Tracks per-university application status: Shortlisted → Applied → Supp. Sent → Offer → Accepted/Declined
- Stores in AsyncStorage via ApplicationsContext
- Shows progress bar (submitted/total)

### Today Dashboard
- Hero countdown to next upcoming OUAC deadline
- Task list with tap-to-toggle (persisted via UserContext/AsyncStorage)
- Featured editorial article card
- This week's events with RSVP status

### Essay Drafting
- Word count with limit enforcement
- oHub coach suggestions based on word count + position
- Auto-save indication with timestamp

## Tech Stack

- Expo SDK 54 with expo-router (file-based routing)
- React Native with TypeScript
- Fonts: Inter + Fraunces + JetBrains Mono (all via @expo-google-fonts)
- Storage: AsyncStorage
- Icons: @expo/vector-icons (Feather)
