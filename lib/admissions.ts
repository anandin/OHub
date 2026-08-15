import type { Program } from "@/data/programs";

/**
 * Admission-chance logic, extracted from `app/(tabs)/programs.tsx` and
 * `app/program/[id].tsx` where it existed as two near-identical copies that had
 * already drifted apart.
 *
 * Design rule for this module: **never invent a number for a student.** The
 * previous implementation defaulted an unparseable cutoff to 75% and treated a
 * missing user average as 0, so a student who had entered nothing was shown a
 * confident "Reach" verdict computed from data that did not exist. Every
 * function here returns `null` / `"unknown"` instead of guessing, and the UI is
 * responsible for saying "add your marks to see this".
 */

export type Tier = "reach" | "target" | "safety";
export type TierOrUnknown = Tier | "unknown";

export type Competitiveness = Program["competitiveness"];

export const TIER_CONFIG: Record<
  TierOrUnknown,
  { label: string; color: string; bg: string; description: string }
> = {
  reach: {
    label: "Reach",
    color: "#9a3412",
    bg: "#fef3e2",
    description: "Above your current average — strong application needed.",
  },
  target: {
    label: "Target",
    color: "#1a1612",
    bg: "#f0ebe0",
    description: "In range of your current average.",
  },
  safety: {
    label: "Safety",
    color: "#14532d",
    bg: "#ecfdf5",
    description: "Comfortably below your current average.",
  },
  unknown: {
    label: "Add marks",
    color: "#5c4a2f",
    bg: "#f0ebe0",
    description: "Add your top-6 marks in the You tab to see your tier.",
  },
};

/** Sort weight — targets first, then safeties, then reaches, unknown last. */
export const TIER_ORDER: Record<TierOrUnknown, number> = {
  target: 0,
  safety: 1,
  reach: 2,
  unknown: 3,
};

/**
 * Parse a published admission average such as `"87%+"`, `"low 80s"`, `"90-95%"`.
 * Returns `null` when no percentage can be read, rather than a made-up default.
 */
export function parseAverageCutoff(grade: string | undefined | null): number | null {
  if (typeof grade !== "string") return null;
  const match = grade.match(/(\d{2,3})/);
  if (!match?.[1]) return null;
  const value = Number.parseInt(match[1], 10);
  if (!Number.isFinite(value) || value < 50 || value > 100) return null;
  return value;
}

/**
 * Classify a program against a student's average.
 *
 * `userAvg` of `null` (marks not entered) yields `"unknown"` — competitiveness
 * alone is not a personalised verdict and must not be presented as one.
 */
export function classifyTier(
  competitiveness: Competitiveness | string,
  averageGrade: string | undefined | null,
  userAvg: number | null,
): TierOrUnknown {
  if (userAvg === null || !Number.isFinite(userAvg)) return "unknown";

  const cutoff = parseAverageCutoff(averageGrade);
  if (cutoff === null) {
    // No published cutoff: fall back to competitiveness only, which is a real
    // signal even without a number.
    if (competitiveness === "extreme" || competitiveness === "very_high") return "reach";
    if (competitiveness === "high") return "target";
    return "safety";
  }

  const diff = userAvg - cutoff;

  if (competitiveness === "extreme") return "reach";
  if (competitiveness === "very_high" && diff < 2) return "reach";
  if (diff < -2) return "reach";
  if (competitiveness === "high" || diff <= 5) return "target";
  return "safety";
}

/** Top-6 average from raw text inputs. `null` when nothing usable was entered. */
export function computeAverage(marks: readonly string[]): number | null {
  const parsed = marks
    .map((mark) => Number.parseFloat(mark))
    .filter((mark) => Number.isFinite(mark) && mark > 0 && mark <= 100);

  if (parsed.length === 0) return null;

  const mean = parsed.reduce((total, mark) => total + mark, 0) / parsed.length;
  return Math.round(mean * 10) / 10;
}

/** Formats an average for display without pretending zero is a real mark. */
export function formatAverage(userAvg: number | null): string {
  return userAvg === null ? "—" : `${userAvg}%`;
}
