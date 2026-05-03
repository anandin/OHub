# oHub — Product Requirements Document

**Version:** 1.0 · Direction A (Editorial)
**Owner:** Design + PM
**Date:** May 2026
**Status:** Design exploration — pre-build

---

## 1. Summary

oHub is a mobile super-app for Grade 12 Ontario students applying to university through OUAC. It consolidates the application journey — program research, deadlines, essay drafting, scholarships, and peer support — into a single calmer surface, replacing the patchwork of OUAC.ca, school-specific portals, Reddit, group chats, and Notion docs students currently juggle.

The product targets the 8-week panic window from December (applications open) through mid-February (supplementary deadlines), with a longer tail through May (offer decisions).

---

## 2. Problem

A typical Ontario applicant is managing:

- 1 OUAC 101 reference number
- 3–7 university applications
- 5–15 supplementary forms, essays, and video submissions
- 6–20 scholarship deadlines (auto-considered + actively applied)
- 3–5 group chats with peers stressing about the same things
- 2–4 reference letter requests to teachers
- 1–2 mid-term grade uploads

This work is split across browser tabs, screenshots in DMs, sticky notes, and lossy parental advice. Students miss deadlines. They write generic essays because they don't know what good looks like. They skip scholarships they would have won. They feel alone.

The market today is dominated by:
- **OUAC.ca** — functional, but transactional and visually dated
- **University portals** — siloed, inconsistent UX per school
- **Reddit r/OntarioUniversities** — unreliable, anxiety-amplifying
- **Group chats** — high signal but unstructured
- **Notion / Sheets** — student-built, brittle, doesn't scale

No one owns the calm, end-to-end experience.

---

## 3. Audience

**Primary persona — "Priya"**

- Grade 12 student, age 17, Bayview SS in Richmond Hill
- Top 6 average: 92.4%, applying to 7 programs
- Lives on her phone (iOS, primarily)
- Active in 2–3 application-themed group chats
- First-gen or non-first-gen — but parents are often unfamiliar with OUAC mechanics
- Deeply comparison-driven; checks averages and acceptance rates obsessively
- High anxiety, low time, high agency

**Secondary**
- Guidance counsellors (read-only future feature)
- Parents (notification recipients, future)

**Out of scope**
- Grad / professional school applicants
- US / international applications (Common App, UCAS) — future
- Non-Ontario Canadian applications — future

---

## 4. Design principles

1. **Calm beats clever.** This is the most stressful season of a student's life. The product should reduce cognitive load, not add to it.
2. **Editorial, not enterprise.** The visual language is closer to a magazine than a CRM. Serif headlines, generous whitespace, monospace numerics for credibility.
3. **Truth over flattery.** Show real cutoffs, real acceptance rates, real distance from your average. No false hope, no doom either.
4. **Peers are the product.** Other applicants are the highest-signal information source — designed-for, not bolted-on.
5. **Mobile-first, dual-platform.** One design works on iOS and Android. 390×844 reference frame.

---

## 5. Scope (v1)

### 5.1 In scope

| Area | Feature | Priority |
|---|---|---|
| Onboarding | Welcome, school picker, mark entry, profile setup | P0 |
| Today / Home | OUAC countdown, today's tasks, this week's events, featured reading | P0 |
| Programs | Search, tier filter (Reach/Target/Safety), program detail subpage | P0 |
| Apply | OUAC tracker, per-application status, essay status | P0 |
| Essays | Drafting view, prompt panel, word count, reading-level, coach suggestions | P0 |
| Scholarships | Match list, eligibility tags, total potential aid | P1 |
| Pulse (feed) | Following / school / trending tabs, posts, milestones, tips | P1 |
| Chats | Pinned + all chats, group threads, DMs | P1 |
| Profile | Avatar, top 6 4U marks, stats grid | P0 |
| Notifications | Deadline, match, social, system | P0 |

### 5.2 Out of scope (v1)

- Real OUAC API integration (manual entry / mock for v1)
- Counsellor / parent accounts
- Live mark sync from school SIS
- Video essay recording (link out for v1)
- US, Quebec, BC, AB applications
- Grade 11 / earlier prep features

---

## 6. Key screens

The current design exploration covers 11 screens in Direction A (Editorial):

**Onboarding** (2 screens)
1. Welcome — countdown framing, sign-in vs. start
2. School picker — multi-select Ontario universities

**Core flow** (6 screens)
3. Today — countdown hero, daily plan, this-week events, featured article
4. Programs — live search, tier-filter chips, ranked list with stats
5. Program detail — Waterloo CS subpage with stats grid, requirements, deadlines, save/apply CTAs
6. Apply — OUAC reference, 5/7 progress, per-application status list
7. Essay drafting — prompt panel, editor, word/reading metrics, coach card
8. Scholarships — $248k aid total, match bars, status chips

**Social** (3 screens)
9. Pulse feed — Following/School/All tabs, posts, milestones, tips
10. Chat list — pinned + all, search
11. Group chat thread — OUAC '26 group with mixed-bubble messages

**Profile** (1 screen)
12. You — avatar, school, top 6 4U marks with bars, stats grid

---

## 7. Functional requirements

### 7.1 OUAC tracker
- Display reference number, deadline countdown (days), submission progress (X/Y), in-progress count, decision count
- Per-application: university, program, status (Submitted / In progress / Not started), essay progress (X/Y), submission date
- Add/remove programs (subject to OUAC's 3-school 101 limit + paid additions)

### 7.2 Programs
- Browse 96+ Ontario undergrad programs
- Live text search (name, school, faculty)
- Filter by tier (Reach / Target / Safety) — auto-derived from user's Top 6 vs. cutoff
- Program detail: cutoff, avg admit, acceptance rate, class size, requirements list, deadline list, blurb, save, start application

### 7.3 Essay drafting
- Auto-save every 10s (display "Auto-saved · HH:MM" pill)
- Word count and limit enforcement
- Reading-level estimate (Flesch-Kincaid) and active-voice flag
- Coach suggestions (rule-based + LLM-backed) — flag passive voice, vague openings, generic conclusions
- Plain text only (matches OUAC supplementary form constraints)

### 7.4 Scholarships
- Match algorithm using profile (avg, school, residence, EC areas, income bracket if provided)
- Status: Eligible (actionable), Submitted, Auto-considered, Closed
- Sortable by deadline, value, match %

### 7.5 Pulse / social
- Three feed tabs: Following, Your school, All
- Post types: text post, milestone (auto-generated when user submits), tip (verified content)
- Like, comment, share, save

### 7.6 Chats
- Group chats (pre-seeded by school, by program-of-interest, by class year)
- DMs
- Pinned chats persist at top
- Unread badge

---

## 8. Non-functional requirements

- **Performance:** Cold start under 2s on iPhone 12 / equivalent Android
- **Offline:** Essay drafts editable offline; sync on reconnect
- **Privacy:** Marks and essays never shown in Pulse feed without explicit opt-in
- **Accessibility:** WCAG AA. Min text size 11px in chrome, 13px in body. Hit targets ≥ 44px
- **Platform:** iOS 16+ and Android 11+. React Native / Expo
- **Scale:** Designed for ~50,000 active applicants in peak season (Jan–Feb)

---

## 9. Design system (Direction A — Editorial)

| Token | Value |
|---|---|
| Paper (background) | #f5f1e8 |
| Card | #fbf8f1 |
| Ink (primary text) | #1a1612 |
| Soft ink | #5c4a2f |
| Muted | #8b7e62 |
| Rule | #e8e0cf |
| Accent (warning) | #c2410c |
| Accent (success) | #15803d |
| Serif | Fraunces |
| Sans | Inter |
| Mono | JetBrains Mono |
| Frame | 390 × 844 |
| Radius (cards) | 14px |
| Radius (pills) | 999px |

**Tweaks** (live-adjustable in design): accent color, paper background, serif weight (400–700), density (compact / regular / spacious).

---

## 10. Success metrics

- **Activation:** % of signed-up users who complete onboarding and pick ≥ 1 school (target: 85%)
- **OUAC submission lift:** % of users who submit OUAC 101 by Jan 15 (target: 95% of paid users)
- **Essays drafted:** Median essay drafts per user during Jan–Feb (target: 6+)
- **Scholarships applied:** Net-new scholarships applied per user vs. pre-oHub baseline (target: +3)
- **Retention to decision day:** % of users active in May (target: 70%)
- **NPS during peak season:** target: 50+

---

## 11. Risks

- **OUAC partnership** — without official integration, users must double-enter data. Mitigation: best-in-class import flow, push for partnership in v2.
- **Cold-start social problem** — feed and chats need critical mass. Mitigation: school-by-school rollout, seed with sponsored content from current undergrads.
- **Essay coach quality** — bad LLM suggestions damage trust. Mitigation: human review of suggestion templates, conservative tone, easy dismissal.
- **Privacy concerns** — students entering marks. Mitigation: marks never leave device unless explicitly shared; no leaderboards.

---

## 12. Open questions

1. Pricing — free with paid coach tier, or freemium scholarships unlock, or institutional?
2. Counsellor partnership — design-for from v1, or v2?
3. Parent companion app — same product, or separate?
4. Decision-day experience — push notification celebration / bad-news framing?
5. What happens to a user May 1 onward (committed) — graduate them out, or evolve into university-life app?

---

## 13. Roadmap

| Phase | Timeline | Scope |
|---|---|---|
| **v0 — Prototype** | now | Design exploration, this PRD, 11 screens |
| **v0.5 — Closed beta** | Sept 2026 | Onboarding, programs, OUAC tracker, manual essay editor — 1 partner school (~200 students) |
| **v1.0 — GA** | Dec 2026 | Full feature set above, paid scholarship coach tier, push notifications |
| **v1.5** | Mar 2027 | Counsellor dashboard, OUAC API integration (if partnership lands) |
| **v2** | Sept 2027 | Other Canadian provinces, US Common App connector |

---

*Companion to `oHub.html` design exploration. Open the design file to see screens, interactions, and live tweaks.*
