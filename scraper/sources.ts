/**
 * Where oHub's data may and may not come from.
 *
 * This registry exists because the obvious source is off limits. oHub's
 * programme data was originally described as "sourced from OUinfo.ca", and
 * ouinfo.ca serves:
 *
 *     User-agent: *
 *     Disallow: /
 *
 * A blanket disallow. OUAC's own site returns 403 to non-browser clients.
 * Crawling either one means ignoring an explicit, machine-readable refusal —
 * for a product whose entire positioning is that it does not fake data, and
 * which gets shown to teachers and scholarship committees, that is not a
 * trade worth making. Both are recorded here as `forbidden` so nobody wires
 * one up later without reading this.
 *
 * The legitimate route is the Council of Ontario Universities, which publishes
 * Common University Data Ontario (CUDO) as open data precisely so that people
 * can compare universities. Individual university sites are case by case:
 * `fetchAllowed()` checks each one's robots.txt at run time rather than
 * trusting anything written here.
 */

export type Permission =
  /** Published for reuse. Still fetched politely. */
  | "open-data"
  /** Not explicitly published, but robots.txt permits it. Verified per fetch. */
  | "robots-permitted"
  /** robots.txt disallows, or the operator blocks automated clients. Never fetch. */
  | "forbidden"
  /** No automated access; a human enters the data and stamps its provenance. */
  | "manual";

export interface Source {
  id: string;
  name: string;
  homepage: string;
  permission: Permission;
  /** What this source can tell us. */
  provides: ("programs" | "admission-averages" | "deadlines" | "scholarships")[];
  /** Why the permission is what it is. Cite the evidence, not an opinion. */
  note: string;
}

export const SOURCES: Source[] = [
  {
    id: "cou-cudo",
    name: "Common University Data Ontario (Council of Ontario Universities)",
    homepage: "https://ontariosuniversities.ca/open-data/common-university-data-ontario-cudo/",
    permission: "open-data",
    provides: ["admission-averages"],
    note:
      "Published under the COU's open-data programme so applicants can compare " +
      "universities on a common basis. cudo.ouac.on.ca serves meta robots " +
      "'index, follow'. This is the intended public source for entering-grade " +
      "ranges and is the one to build on.",
  },
  {
    id: "ontario-open-data",
    name: "Ontario Open Data catalogue",
    homepage: "https://data.ontario.ca/",
    permission: "open-data",
    provides: ["admission-averages"],
    note:
      "Provincial open-data catalogue, under the Open Government Licence – Ontario. " +
      "Useful for enrolment and institution reference data.",
  },
  {
    id: "university-sites",
    name: "Individual Ontario university websites",
    homepage: "https://ontariosuniversities.ca/",
    permission: "robots-permitted",
    provides: ["programs", "deadlines"],
    note:
      "Case by case. Queen's allows crawling with Crawl-delay: 10 and disallows " +
      "only infrastructure paths; Toronto's robots.txt is permissive. Every " +
      "request is gated on that host's live robots.txt — nothing here is assumed.",
  },
  {
    id: "ouinfo",
    name: "OUInfo / eINFO",
    homepage: "https://ouinfo.ca/",
    permission: "forbidden",
    provides: ["programs", "admission-averages"],
    note:
      "robots.txt is 'User-agent: * / Disallow: /' — a blanket refusal of all " +
      "automated access. Do not crawl. If oHub needs this data, the route is to " +
      "ask OUAC for permission or a feed, not to take it anyway.",
  },
  {
    id: "ouac",
    name: "Ontario Universities' Application Centre",
    homepage: "https://www.ouac.on.ca/",
    permission: "forbidden",
    provides: ["deadlines"],
    note:
      "Returns HTTP 403 to non-browser clients; bot protection is deliberate. " +
      "Deadlines are few, change once a year, and are published in human-readable " +
      "form — a person transcribing them with a source link is both legal and " +
      "cheaper than defeating a bot wall.",
  },
];

export function sourceById(id: string): Source | undefined {
  return SOURCES.find((s) => s.id === id);
}

/** Sources an automated job is permitted to touch at all. */
export function automatable(): Source[] {
  return SOURCES.filter(
    (s) => s.permission === "open-data" || s.permission === "robots-permitted",
  );
}
