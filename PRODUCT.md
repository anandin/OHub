# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: Ontario Grade 12 students applying to university, usually on a phone,
often late at night, deciding where to spend the next four years. They are
anxious and time-pressured.

Also confirmed:
- **Guidance counsellors**, comparing options alongside a student on a school
  desktop. Implies denser comparison views and a desktop layout that is not a
  stretched phone.
- **Demo audiences** — Adhvaith shows oHub to teachers, judges and scholarship
  committees. The first screen must land in about ten seconds with no
  explanation.

## Product Purpose

Put the Ontario university application in one place: every undergraduate
program, the OUAC deadlines, and an honest read on where the student stands.
Success is a student who applies to the right list of programs on time, without
having assembled it from a dozen university sites.

## Positioning

It refuses to invent numbers. Competing admission tools return a confident
percentage regardless of what the student has entered; oHub returns "unknown"
and asks for the missing input. A missing average is `null`, an unparseable
cutoff is `null`, and the UI says so. That refusal is enforced in code
(`lib/admissions.ts`) and covered by tests, so it is a product property rather
than a marketing claim.

## Operating Context

Ontario's application runs through OUAC on fixed annual deadlines. Students
juggle OUAC itself, individual program pages, and supplementary applications
they often discover late. Marks arrive as a top-six average. Work happens in
short bursts on a phone between other obligations.

## Capabilities and Constraints

- 1,406 programs across all 23 Ontario universities; 21 scholarships; OUAC
  deadline countdown; per-application status tracking; top-six mark entry.
- **No backend.** Every dataset ships in the bundle; everything the student
  enters stays in `AsyncStorage` (`localStorage` on web). No account, no
  analytics, no network calls.
- Expo / React Native Web, exported static and served by Vercel. The same
  source targets iOS and Android.
- Strict CSP: `script-src 'self'`, `connect-src 'self'`, `font-src 'self' data:`.
  Anything the design needs must be self-hosted.
- Data is gathered from public sources and goes stale; every figure links out to
  the official page.

## Brand Commitments

- Name: oHub. Built by Adhvaith Anand.
- Not affiliated with OUAC or any university, and must not imply otherwise.
- Voice: plain, factual, unhurried. No urgency theatre around deadlines that are
  already stressful.

## Evidence on Hand

1,406 programs and 23 universities are real counts in `data/programs.ts`. The
"never invents a number" claim is verifiable in `lib/admissions.ts` and its
tests. No testimonials, user counts, or outcome statistics exist — none may be
implied.

## Accessibility

WCAG 2.1 AA baseline, verified by measurement rather than eyeballing. Every
palette token in `constants/theme.ts` carries its contrast ratio. Interactive
elements need accessible names and 44×44 targets; an E2E test fails the build
on an unnamed visible control.
