import { sourceById } from "./sources";

/**
 * The only way this project is allowed to fetch a remote page.
 *
 * Two rules, both enforced here rather than left to whoever writes the next
 * source adapter:
 *
 *  1. A source registered as `forbidden` is refused outright, before any
 *     network call.
 *  2. Every other host's live robots.txt is fetched, parsed and honoured —
 *     including its Crawl-delay. A source that stops permitting us stops
 *     working, which is the correct behaviour.
 *
 * The identifying user agent is deliberate. A tool that will not say who it is
 * has no business arguing it is being polite.
 */

export const USER_AGENT =
  "oHubBot/1.0 (+https://github.com/anandin/OHub; Ontario university application tool; contact via GitHub issues)";

/** Politeness floor, used when a host does not specify Crawl-delay. */
const DEFAULT_DELAY_MS = 2000;
const ROBOTS_TTL_MS = 60 * 60 * 1000;

interface RobotsRules {
  disallow: string[];
  allow: string[];
  crawlDelayMs: number;
  fetchedAt: number;
}

const robotsCache = new Map<string, RobotsRules>();
const lastRequestAt = new Map<string, number>();

/**
 * Parse robots.txt for the groups that apply to us: our own user agent if it
 * is named, otherwise `*`. A more specific group wins outright — that is what
 * the standard says, and a host that singles us out has been explicit.
 */
export function parseRobots(text: string, userAgent: string): RobotsRules {
  const rules: RobotsRules = {
    disallow: [],
    allow: [],
    crawlDelayMs: DEFAULT_DELAY_MS,
    fetchedAt: Date.now(),
  };

  const agentToken = userAgent.split("/")[0]?.toLowerCase() ?? "";
  const groups: { agents: string[]; lines: [string, string][] }[] = [];
  let current: { agents: string[]; lines: [string, string][] } | null = null;
  let lastWasAgent = false;

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.split("#")[0]?.trim() ?? "";
    if (!line) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const field = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();

    if (field === "user-agent") {
      if (!current || !lastWasAgent) {
        current = { agents: [], lines: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
    } else if (current) {
      current.lines.push([field, value]);
      lastWasAgent = false;
    }
  }

  const specific = groups.find((g) => g.agents.includes(agentToken));
  const wildcard = groups.find((g) => g.agents.includes("*"));
  const group = specific ?? wildcard;
  if (!group) return rules;

  for (const [field, value] of group.lines) {
    if (field === "disallow" && value) rules.disallow.push(value);
    else if (field === "allow" && value) rules.allow.push(value);
    else if (field === "crawl-delay") {
      const seconds = Number.parseFloat(value);
      if (Number.isFinite(seconds) && seconds >= 0) {
        rules.crawlDelayMs = Math.max(seconds * 1000, DEFAULT_DELAY_MS);
      }
    }
  }
  return rules;
}

/** Longest matching rule wins; Allow beats Disallow at equal length. */
export function pathAllowed(rules: RobotsRules, pathname: string): boolean {
  const match = (pattern: string) =>
    pathname.startsWith(pattern) ? pattern.length : -1;

  const deny = Math.max(-1, ...rules.disallow.map(match));
  const permit = Math.max(-1, ...rules.allow.map(match));

  if (deny === -1) return true;
  return permit >= deny;
}

async function robotsFor(origin: string): Promise<RobotsRules> {
  const cached = robotsCache.get(origin);
  if (cached && Date.now() - cached.fetchedAt < ROBOTS_TTL_MS) return cached;

  let rules: RobotsRules;
  try {
    const response = await fetch(`${origin}/robots.txt`, {
      headers: { "user-agent": USER_AGENT },
      signal: AbortSignal.timeout(20_000),
    });
    rules = response.ok
      ? parseRobots(await response.text(), USER_AGENT)
      : // No robots.txt means no restrictions, per the standard.
        { disallow: [], allow: [], crawlDelayMs: DEFAULT_DELAY_MS, fetchedAt: Date.now() };
  } catch {
    // Unreachable robots.txt is treated as a refusal. Guessing in our own
    // favour is exactly the failure mode this module exists to prevent.
    rules = { disallow: ["/"], allow: [], crawlDelayMs: DEFAULT_DELAY_MS, fetchedAt: Date.now() };
  }

  robotsCache.set(origin, rules);
  return rules;
}

export class NotPermittedError extends Error {
  constructor(url: string, reason: string) {
    super(`Refusing to fetch ${url}: ${reason}`);
    this.name = "NotPermittedError";
  }
}

/** Whether a URL may be fetched. Exposed so callers can plan without fetching. */
export async function fetchAllowed(
  url: string,
  sourceId: string,
): Promise<{ allowed: boolean; reason: string; delayMs: number }> {
  const source = sourceById(sourceId);
  if (!source) return { allowed: false, reason: `unknown source "${sourceId}"`, delayMs: 0 };
  if (source.permission === "forbidden") {
    return { allowed: false, reason: `source is registered forbidden — ${source.note}`, delayMs: 0 };
  }
  if (source.permission === "manual") {
    return { allowed: false, reason: "source is manual-entry only", delayMs: 0 };
  }

  const target = new URL(url);
  if (target.protocol !== "https:") {
    return { allowed: false, reason: "only https is fetched", delayMs: 0 };
  }

  const rules = await robotsFor(target.origin);
  const allowed = pathAllowed(rules, target.pathname);
  return {
    allowed,
    reason: allowed ? "permitted by robots.txt" : `robots.txt disallows ${target.pathname}`,
    delayMs: rules.crawlDelayMs,
  };
}

/**
 * Fetch a page, honouring robots.txt and the host's crawl delay.
 * Throws `NotPermittedError` rather than returning empty, so a source that
 * revokes access fails the job loudly instead of quietly producing no data.
 */
export async function politeFetch(url: string, sourceId: string): Promise<string> {
  const verdict = await fetchAllowed(url, sourceId);
  if (!verdict.allowed) throw new NotPermittedError(url, verdict.reason);

  const origin = new URL(url).origin;
  const since = Date.now() - (lastRequestAt.get(origin) ?? 0);
  if (since < verdict.delayMs) {
    await new Promise((r) => setTimeout(r, verdict.delayMs - since));
  }
  lastRequestAt.set(origin, Date.now());

  const response = await fetch(url, {
    headers: { "user-agent": USER_AGENT, accept: "text/html,application/xhtml+xml" },
    signal: AbortSignal.timeout(45_000),
  });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  return response.text();
}
