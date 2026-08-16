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

Design tokens live in `constants/theme.ts` — contrast-measured palettes for
light and dark, plus the type scale and spacing. Every colour pairing carries
its measured WCAG ratio in a comment.

Dark mode follows the device by default and can be overridden in Settings;
the choice persists. Screens build their styles from the active palette via
`useThemedStyles`, so switching theme rebuilds each sheet once rather than on
every render.

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

## Accounts, and privacy

Signing in with Google is required to use the app. There is one gate, in
`app/_layout.tsx`: with no session the navigator is not mounted at all, so
there is no protected screen for a redirect to race. `/` stays public — it is
the static landing page and never reaches the router.

Personal data lives in Postgres (Supabase, `ca-central-1`) and is cached in
local storage on each device so the app works offline. Every table has RLS on,
with policies keyed to `auth.uid()`; the key shipped in the bundle grants the
`anon` role, which has had its table access revoked outright. Row caps and
length limits are database triggers and constraints, not client-side checks,
because the client is not a trust boundary.

Sync hangs off `write()` in `lib/storage.ts` rather than off the contexts, so a
new feature cannot save locally and forget to sync. `lib/sync.ts` owns the
mapping and reports its real state — `/settings` says "could not reach your
account" when that is what happened, rather than showing a tick regardless.

`/settings` lists what is stored, clears it, or deletes the account outright
(`delete_my_account()`, which removes the `auth.users` row and cascades).
`/privacy.html` is the full notice. OUAC references are masked everywhere
except the field that edits them.

No analytics, no ad tech, no third-party scripts — `script-src 'self'`.
`connect-src` names exactly one external origin, the Supabase project, and
`__tests__/sync.test.ts` fails if it drifts from the configured URL.

Admission averages, deadlines and scholarship details come from public sources
and go out of date. The app says so, and links to the official page.

### One-time setup for a fork

The app is wired to a Supabase project already; a fork needs its own. Set
`EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`, add the origin
to `connect-src` in `vercel.json`, and in the Supabase dashboard:

1. **Authentication → Sign In / Providers → Google**: on, with a client ID and
   secret from a Google Cloud OAuth 2.0 Web application credential.
2. In Google Cloud, the authorised redirect URI is
   `https://<project-ref>.supabase.co/auth/v1/callback`.
3. **Authentication → URL Configuration**: Site URL is the production origin;
   the redirect allow list needs `<origin>/today` and, for previews,
   `https://*.vercel.app/today`.
4. **Authentication → Sign In / Providers → Email**: on, with "Confirm email"
   on. `MIN_PASSWORD` in `context/AuthContext.tsx` is enforced in the form;
   set the same minimum under **Password requirements** so it also holds for
   anyone posting straight to `/auth/v1/signup`.
5. **Custom SMTP.** Supabase's built-in sender is rate-limited to a handful of
   messages an hour and is documented as not for production. Email sign-up and
   password reset both depend on a message arriving, so without this the second
   student to sign up in an hour simply never gets their link.

## Licence

MIT.

## Design

`PRODUCT.md` holds durable product truth — users, purpose, positioning,
constraints. It is the input to design decisions, not a design document.

The landing page was rebuilt against [Impeccable](https://github.com/pbakaus/impeccable)'s
anti-pattern detector, which flagged the first version as textbook
AI-generated: eyebrow labels above headings, a row of identical icon-tile
feature cards, a coloured `border-left` callout, a hero-metric strip, emoji
standing in for an icon system, and a warm-cream background. All of it is gone.

Typeface is **Spectral** (SIL Open Font License), self-hosted as two 22 KB
subsets. Fraunces and Instrument Serif were both rejected: they sit on the
short list of faces every AI-generated interface converges on.

The surface is the pale green of an Ontario exam booklet, with printed-ink
green-black and a teacher's marking red for the single accent — a palette taken
from the student's desk rather than from a mood. Every pairing is measured and
noted inline; all pass WCAG AA.

Four E2E specs in `e2e/smoke.spec.ts` guard the result: no side-tabs or icon
tiles, the display face actually loads, no emoji-as-icons, and body text inside
a readable measure.

To re-audit after a change:

```bash
node <impeccable>/scripts/detect.mjs landing/index.html   # static
CI=1 node <impeccable>/scripts/detect.mjs http://127.0.0.1:4173/   # rendered
```
