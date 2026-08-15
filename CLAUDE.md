# Working in this repo

oHub is a single Expo app at the repo root. It ships as a static web build on
Vercel and, from the same source, as an iOS/Android app. There is no backend
and no `artifacts/` layer — that was Replit's monorepo convention and it is
gone.

Read [`README.md`](./README.md) first for what the app does and how to run it.
This file covers what to do and not do when changing it.

## Before you push

```bash
pnpm run verify    # typecheck + lint + 84 unit tests
pnpm run build && pnpm run test:e2e
```

`verify` is fast; run it after any change. The E2E suite needs `dist/` to be
current, so rebuild first.

## Hard rules

These are enforced by ESLint, not just convention. If a rule fires, the fix is
almost always to use the module — not to add a disable comment.

1. **Outbound links go through `openExternalUrl`** (`lib/safeLink.ts`). Direct
   `Linking.openURL` is banned. On web it will execute a `javascript:` URL, and
   every URL in this app comes from a bundled data file that someone hand-edits.

2. **Persisted reads go through `readValidated`** (`lib/storage.ts`). Direct
   `AsyncStorage.getItem` is banned. On web that store is `localStorage` — user-,
   extension- and XSS-writable. `JSON.parse` plus a TypeScript cast is an
   assertion, not a check.

3. **Import icons and fonts by name.** `@expo/vector-icons/Feather`, not the
   barrel. `@expo-google-fonts/inter/400Regular`, not the package root. Metro
   bundles every asset a module can reach; the barrels cost ~12 MB.

## Design rules

4. **Never invent a number for a student.** A missing average is `null`. An
   unparseable cutoff is `null`. `classifyTier` returns `"unknown"` and the UI
   asks for marks. Do not reintroduce a default like `75` or `0` — the app
   previously showed confident admission verdicts computed from values the
   student had never entered, which is the worst thing a tool like this can do.

5. **New installs start empty.** No seeded profile, no fictional student. If a
   screen looks bare without data, that is an empty state to write, not a reason
   to seed one.

6. **Every interactive element needs an accessible name.** `accessibilityRole`
   plus `accessibilityLabel`, and `accessibilityState` for anything toggleable.
   Touch targets are 44×44 minimum. There is an E2E test that fails on any
   visible control without a name.

7. **Personal data is masked on screen.** OUAC references show the last four
   digits (`maskOuacRef`) everywhere except the field that edits them.

## Where things live

- `lib/` holds the invariants — read those five files before changing behaviour
  that touches links, storage, admission logic, personal data or sharing.
- `context/` providers each expose `isLoading` and `reset`. `reset` is what the
  Settings erase control calls; keep it working when you add state.
- `data/programs.ts` is ~28k lines and dominates the bundle. If you add a
  dataset that size, split it out and load it lazily.

## Deployment

Vercel builds `pnpm run build` and serves `dist/`. Everything — SPA rewrite,
caching, security headers — is in `vercel.json`; there is no dashboard config to
keep in sync. If you change the CSP, run the E2E suite against the preview URL:

```bash
E2E_BASE_URL=https://<preview-url> pnpm run test:e2e
```

`e2e/security-headers.spec.ts` only runs there. It is HTTP-only by design — no
browser — because that is the layer where a broken `vercel.json` shows up, and
it must stay verifiable on hosts where a browser cannot reach the network.

Note what the local preview server does **not** prove: `scripts/serve-dist.mjs`
implements its own SPA fallback, so a broken `rewrites` rule in `vercel.json`
passes locally and 404s every deep link in production. That exact bug shipped
once. The deep-link assertions in `security-headers.spec.ts` are the guard, and
they only run against a deployment.

For a protected preview, pass credentials so the suite can get past Vercel
Authentication:

```bash
E2E_BASE_URL=https://<preview-url> \
E2E_SHARE_TOKEN=<_vercel_share token> pnpm run test:e2e
# or, with Protection Bypass for Automation enabled:
E2E_BASE_URL=... E2E_BYPASS_SECRET=<secret> pnpm run test:e2e
```
