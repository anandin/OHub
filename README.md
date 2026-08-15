# oHub

The Ontario university application companion — programs, deadlines, OUAC
tracking and scholarships for Grade 12 students.

Built by Adhvaith Anand. One Expo codebase; it runs as a website and, with the
same source, as an iOS/Android app.

## What it does

| Tab | Route | What it's for |
|---|---|---|
| Today | `/(tabs)/index` | Countdown to the next OUAC deadline, your task list, a featured read |
| Programs | `/(tabs)/programs` | 1,406 Ontario programs, searchable, tiered Reach / Target / Safety against your average |
| Apply | `/(tabs)/apply` | OUAC tracker: Shortlisted → Applied → Supp. sent → Offer → Accepted |
| Pulse | `/(tabs)/universities` | Feed from the universities you follow |
| You | `/(tabs)/search` | Your profile, top-6 marks, application stats |

`/` is the marketing page — a 15 KB static file (5 KB gzipped) served straight
from the filesystem, so reading the pitch never downloads the 3.5 MB app bundle
and a search engine can index it. The app shell lives at `/app.html` behind a
rewrite, and the home tab is `/today`.

Also: `/scholarships` (21 verified awards), `/program/[id]`, `/university/[id]`,
`/essay/[id]`, and `/settings` (what's stored and how to erase it).

## Running it

Requires Node 22+ and pnpm 10.

```bash
pnpm install
pnpm run web       # http://localhost:8081 in a browser
pnpm run dev       # Expo dev server — press i / a for a simulator
```

## Checks

```bash
pnpm run verify    # typecheck + lint + unit tests
pnpm run test      # Jest only
pnpm run build     # static web build into dist/
pnpm run serve     # serve dist/ at http://127.0.0.1:4173
pnpm run test:e2e  # Playwright against dist/ (mobile + desktop)
```

To point the E2E suite at a real deployment, including the security-header
assertions that only apply there:

```bash
E2E_BASE_URL=https://<deployment-url> pnpm run test:e2e
```

Preview deployments sit behind Vercel Authentication. Pass a `_vercel_share`
token, or the project's Protection Bypass for Automation secret, and the suite
will authenticate itself first:

```bash
E2E_BASE_URL=https://<preview-url> E2E_SHARE_TOKEN=<token> pnpm run test:e2e
E2E_BASE_URL=https://<preview-url> E2E_BYPASS_SECRET=<secret> pnpm run test:e2e
```

## Deploying

Vercel builds `pnpm run build` and serves `dist/`. All of it is configured in
[`vercel.json`](./vercel.json) — the SPA rewrite, immutable asset caching, and
the security headers. Connect the repo in Vercel and pushes deploy themselves;
no CLI step and no build config in the dashboard.

## Architecture

```
landing/        the static marketing page served at /
app/            expo-router file-based routes; (tabs)/ is the tab bar
components/     shared UI — PostCard, UniversityCard, CategoryFilter, ErrorBoundary
context/        React contexts, each persisted through lib/storage
data/           bundled datasets: programs, universities, scholarships, deadlines, feed
hooks/          useFeedRefresh — rotating feed batches on a 6-hour timer
lib/            the modules the rest of the app is built on (below)
e2e/            Playwright specs
__tests__/      Jest unit + context tests
```

There is no backend. Every dataset ships in the bundle and everything a student
enters stays in `AsyncStorage` (which is `localStorage` on web). That is the
whole data model, and the privacy story follows from it.

### `lib/` — where the invariants live

| Module | Guarantee |
|---|---|
| `safeLink.ts` | Outbound URLs are `https:` only, with no embedded credentials and no loopback hosts, opened `noopener,noreferrer`. Nothing else may call `Linking.openURL`. |
| `storage.ts` | Persisted reads are Zod-validated, prototype keys stripped, writes size-capped. A bad or missing value degrades to a documented default. Nothing else may call `AsyncStorage.getItem`. |
| `admissions.ts` | Tier and average logic. Returns `null` / `"unknown"` rather than inventing a cutoff or an average. |
| `privacy.ts` | Masks OUAC references for display; strips control and bidi characters from stored text. |
| `share.ts` | Native share sheet, Web Share API, or clipboard — in that order. |

Design tokens live in `constants/theme.ts` — one contrast-measured palette for
light and dark, plus the type scale and spacing. Every colour pairing there
carries its measured WCAG ratio in a comment.

The first two are enforced by ESLint rules in `eslint.config.js`, so the
boundaries can't quietly erode. If you need the raw API, you're probably adding
a case to the module rather than bypassing it.

### Two conventions worth knowing

**Import icons and fonts by name, never through the barrel.** Metro bundles
every asset it can reach, so `import { Feather } from "@expo/vector-icons"`
ships all twenty icon families. Use `@expo/vector-icons/Feather` and
`@expo-google-fonts/inter/400Regular`. This is worth ~12 MB.

**Never fabricate a number for a student.** A missing average is `null`, not
`0`; an unparseable cutoff is `null`, not `75`. The UI asks for the missing
input instead of showing a confident answer built on a default.

## Privacy

No accounts, no analytics, no network calls. Name, school, OUAC reference,
marks, tracked applications and saved posts live only in the browser or app
that entered them. `/settings` lists exactly what is stored and erases all of
it. OUAC references are masked everywhere except the field that edits them.

Admission averages, deadlines and scholarship details come from public sources
and go out of date. The app says so, and links to the official page.

## Licence

MIT.
