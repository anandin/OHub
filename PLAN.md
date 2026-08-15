# oHub → product

The ask was "make this a real product — scraper, DB, user management, AI, all of
it." This is the plan, and it argues against building some of that in the order
it was asked for. Reasons below, evidence first.

## What oHub is today

A client-only app. 1,406 programmes, 23 universities, 21 scholarships and the
OUAC dates are TypeScript arrays compiled into the bundle. Everything a student
enters lives in `localStorage`. No account, no server, no network calls at all —
the CSP is `connect-src 'self'`, so the app *cannot* reach a backend even if one
existed.

The logic is real. The data is a snapshot with no refresh path. That is the gap.

## The finding that reorders the roadmap

**OUInfo cannot be scraped.** `ouinfo.ca/robots.txt`:

```
User-agent: *
Disallow: /
```

A blanket refusal. OUAC's own site returns 403 to non-browser clients. Those two
are where the programme data nominally came from, and both have said no in the
only machine-readable way available to them.

This is not a technicality to route around. oHub's single distinguishing claim
is that it does not fake data, and it gets shown to teachers and scholarship
committees. A tool that lectures students about honest numbers while ignoring a
site's explicit refusal has no argument left. It is also the kind of thing that
ends a conversation with a university partner permanently.

**The legitimate source exists and is better.** The Council of Ontario
Universities publishes **Common University Data Ontario (CUDO)** as open data,
specifically so applicants can compare universities on a common basis —
including entering-grade ranges. `cudo.ouac.on.ca` serves `robots: index,
follow`. `data.ontario.ca` carries provincial open data under the Open
Government Licence. Individual university sites vary: Queen's permits crawling
with `Crawl-delay: 10`, Toronto's robots.txt is permissive.

So the data pipeline is buildable — from sources that publish *for* this purpose,
which is also a better story than "we scraped it."

## The strategic problem with the rest of the ask

The privacy position is currently oHub's only real moat. No account, no
database, nothing leaves the device. That is genuinely rare, it is what the
landing page leads with, and for a product handling **minors' names, schools,
grades and OUAC reference numbers** it is also the cheapest possible compliance
posture.

Adding accounts and a server database trades that moat for table stakes.
Every competitor has a login. None of them can say "we cannot leak your grades
because we never have them."

That is not an argument against sync — students do lose data when they clear a
browser, and the counsellor use case genuinely needs sharing. It is an argument
about **defaults**: local-first, with sync as an explicit opt-in, keeps the claim
truthful for the students who never turn it on, which will be most of them.

Getting this wrong is expensive in a way that code review will not catch. Under
PIPEDA, meaningful consent from users under the age of majority is a live
question, and most Grade 12 students are 17.

## Sequencing

### Phase 1 — Trust: make the data defensible *(no PII, no auth, buildable now)*

The highest-value backend work needs no user accounts at all.

1. **Source registry + robots gate** — `scraper/sources.ts`, `scraper/fetcher.ts`.
   Forbidden sources are refused before any network call; every other host's
   live robots.txt and `Crawl-delay` are honoured; an unreachable robots.txt is
   treated as refusal. **Built.**
2. **Provenance on every dataset** — source, collection date, method, caveat,
   surfaced in the UI. **Built** (`data/provenance.ts`).
3. **CUDO importer** — pull entering-grade ranges from COU open data, validate
   with Zod, diff against the current dataset, and open a pull request with the
   changes. Git becomes the audit trail: every cutoff change is a reviewable
   diff with a date and a source. No database required.
4. **Scheduled refresh** — GitHub Actions on a cron. A failed or suspicious
   import fails the job rather than publishing.
5. **Client fetches the published dataset** — a static, versioned JSON on the
   same origin, so `connect-src 'self'` stays intact and the app updates without
   a rebuild.

Cost: zero. Risk: low. This is what turns a snapshot into a product.

### Phase 2 — Continuity: accounts, only if the default holds *(needs decisions)*

Local-first stays the default. Sync is opt-in, and the pitch to the student is
"keep your list if you lose this browser", not "sign up to continue."

- Supabase (Postgres + Auth + RLS). Row-level security keyed to the user id so a
  misconfigured query cannot cross students.
- Email magic link. No passwords to leak, no third-party identity provider
  getting a list of Ontario applicants.
- Sync the student's own records only — profile, marks, applications, saved
  items. Programme data stays bundled and public.
- Counsellor sharing as a **read-only, revocable, expiring link**, not an
  account relationship. A counsellor account implies a roster, and a roster of
  minors' grades is a materially different product with materially different
  obligations.
- Retention: automatic deletion a fixed period after the application cycle ends.
  Nobody needs a 2026 applicant's grades in 2030.

### Phase 3 — Leverage: AI where it beats a search box *(needs decisions)*

AI that recommends programmes is the obvious build and the wrong one: it
reintroduces exactly the confident-guess failure the product was designed to
refuse. Two uses that hold up:

- **Supplementary-application drafting.** The essay editor exists. A coach that
  responds to what the student wrote — structure, specificity, whether they
  answered the prompt — is real help and cannot be faked with a rules engine.
- **Plain-language explanation of a programme's requirements**, grounded strictly
  in the stored record, with citations, and refusing to answer beyond it.

Constraints that decide the design:
- Server-side only. An API key in a client bundle is a public API key.
- Per-user rate and spend caps before launch, not after the first bill.
- It must be able to say "I don't know" — anything else contradicts the product.
- It must never estimate an admission chance. That is the one line.

## What is built in this pass

- `scraper/sources.ts` — permission registry; OUInfo and OUAC recorded as
  forbidden with the evidence, so nobody wires them up later by accident.
- `scraper/fetcher.ts` — robots-respecting fetcher with crawl-delay, identifying
  user agent, and refusal-on-error.
- `data/provenance.ts` — source and collection date per dataset.
- Pulse labelled as sample content; the dead fake-refresh machinery deleted.

## Open decisions

Phases 2 and 3 are blocked on product calls, not engineering:

1. **Does the "nothing leaves your device" promise survive?** Local-first with
   opt-in sync keeps it truthful. Accounts-by-default does not, and the landing
   page and Settings screen both need rewriting the day that ships.
2. **Who runs it, and who pays?** Supabase, scheduled jobs and LLM tokens are
   recurring cost against a free product used by minors. A tool that dies when
   the card expires mid-application-cycle is worse than one that never had a
   server.
3. **Is anyone accountable for minors' data?** A named person, a privacy notice,
   a deletion route and a breach plan are the actual entry requirements for
   storing this category of data — not the schema.
