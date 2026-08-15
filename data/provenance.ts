/**
 * Where each dataset came from and when.
 *
 * oHub's whole claim is that it does not invent numbers. A cutoff collected
 * two admission cycles ago and shown with no date is a quieter version of the
 * same lie: the student cannot tell whether "95%" is this year's number or a
 * stale one, so they trust it either way.
 *
 * Every bundled dataset therefore carries its source and its collection date,
 * and the UI shows them. When the CUDO pipeline lands these stamps become the
 * pipeline's output rather than hand-maintained constants — the shape stays
 * the same so nothing downstream changes.
 */

export interface Provenance {
  /** Human-readable source name. */
  source: string;
  /** Where a student can check the figure themselves. */
  sourceUrl: string;
  /** ISO date the data was collected. */
  collectedAt: string;
  /** How it was collected — honest about hand-entry. */
  method: "manual-entry" | "open-data-import" | "permitted-crawl";
  /** Anything a reader should know before relying on it. */
  caveat?: string;
}

/**
 * Collection dates are the earliest defensible claim, not a guess dressed up
 * as precision: these datasets were assembled during the app's initial build
 * and have not been refreshed since. Where the exact day is unknown the month
 * is used, because inventing a day would be the same failure this file exists
 * to prevent.
 */
export const PROVENANCE: Record<string, Provenance> = {
  programs: {
    source: "Ontario university programme listings",
    sourceUrl: "https://ontariosuniversities.ca/",
    collectedAt: "2026-01",
    method: "manual-entry",
    caveat:
      "Entering averages change every cycle and are set by each university, " +
      "not by oHub. Confirm on the programme's own page before relying on one.",
  },
  universities: {
    source: "Ontario university public pages",
    sourceUrl: "https://ontariosuniversities.ca/",
    collectedAt: "2026-01",
    method: "manual-entry",
  },
  scholarships: {
    source: "Award pages published by each provider",
    sourceUrl: "https://ontariosuniversities.ca/",
    collectedAt: "2026-01",
    method: "manual-entry",
    caveat: "Values, quantities and deadlines change year to year.",
  },
  deadlines: {
    source: "Ontario Universities' Application Centre",
    sourceUrl: "https://www.ouac.on.ca/dates/",
    collectedAt: "2026-01",
    method: "manual-entry",
    caveat: "OUAC publishes the authoritative dates; check them there.",
  },
  feed: {
    source: "Written for the app",
    sourceUrl: "",
    collectedAt: "2026-01",
    method: "manual-entry",
    caveat:
      "Sample content, not a live feed. The Pulse tab is a worked example of " +
      "what a university feed would look like; these posts are not real and " +
      "nothing fetches them.",
  },
};

/** "January 2026" / "12 August 2026" from an ISO date or year-month. */
export function formatCollected(iso: string): string {
  const [year, month, day] = iso.split("-");
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const monthName = months[Number(month) - 1] ?? "";
  if (!monthName) return iso;
  return day ? `${Number(day)} ${monthName} ${year}` : `${monthName} ${year}`;
}

/** One-line attribution for a dataset, ready to render. */
export function attribution(key: keyof typeof PROVENANCE | string): string {
  const p = PROVENANCE[key];
  if (!p) return "";
  return `${p.source} · collected ${formatCollected(p.collectedAt)}`;
}
