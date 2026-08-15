import { Alert, Linking, Platform } from "react-native";

/**
 * Outbound-link safety.
 *
 * Every external URL the app opens originates from bundled data files
 * (`data/scholarships.ts`, `data/universities.ts`, `data/suppAdvice.ts`, ...).
 * Those files are edited by hand and — for a student-facing app that will grow
 * to accept community-contributed links — must be treated as untrusted input at
 * the point of use, not at the point of authoring.
 *
 * `Linking.openURL` will happily execute a `javascript:` URL on web and hand a
 * `file:`/`intent:` URL to the OS on native. Funnelling every outbound link
 * through `openExternalUrl` makes that class of bug impossible by construction.
 */

/** The only schemes we will ever hand to the platform. */
const ALLOWED_PROTOCOLS = new Set(["https:"]);

/** Hosts that are never valid destinations, regardless of scheme. */
const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "[::1]",
]);

export interface SafeUrlResult {
  ok: boolean;
  /** Normalised, safe-to-open URL. Only present when `ok` is true. */
  url?: string;
  /** Machine-readable reason the URL was rejected. */
  reason?:
    | "empty"
    | "malformed"
    | "disallowed-protocol"
    | "blocked-host"
    | "credentials-in-url";
}

/**
 * Validate and normalise an external URL.
 *
 * Rejects anything that is not plain `https:`, anything pointing at a loopback
 * host, and anything carrying embedded credentials (a classic phishing shape:
 * `https://ouac.on.ca@evil.example/`).
 */
export function sanitizeExternalUrl(raw: string | undefined | null): SafeUrlResult {
  if (typeof raw !== "string" || raw.trim() === "") {
    return { ok: false, reason: "empty" };
  }

  let parsed: URL;
  try {
    parsed = new URL(raw.trim());
  } catch {
    return { ok: false, reason: "malformed" };
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    return { ok: false, reason: "disallowed-protocol" };
  }

  if (parsed.username !== "" || parsed.password !== "") {
    return { ok: false, reason: "credentials-in-url" };
  }

  if (BLOCKED_HOSTNAMES.has(parsed.hostname.toLowerCase())) {
    return { ok: false, reason: "blocked-host" };
  }

  return { ok: true, url: parsed.toString() };
}

/** Human-readable label for a URL, e.g. `www.ouac.on.ca` → `ouac.on.ca`. */
export function displayHost(raw: string | undefined | null): string {
  const result = sanitizeExternalUrl(raw);
  if (!result.ok || !result.url) return "";
  return new URL(result.url).hostname.replace(/^www\./, "");
}

function notifyBlocked(message: string) {
  if (Platform.OS === "web") {
    // `Alert` on react-native-web maps to `window.alert`, which is fine here —
    // this path is only reached when data is malformed, never in normal use.
    if (typeof window !== "undefined") window.alert(message);
    return;
  }
  Alert.alert("Link unavailable", message);
}

/**
 * Open an external URL, or tell the user why we would not.
 *
 * Returns `true` when the link was handed to the platform.
 */
export async function openExternalUrl(
  raw: string | undefined | null,
): Promise<boolean> {
  const result = sanitizeExternalUrl(raw);

  if (!result.ok || !result.url) {
    notifyBlocked(
      result.reason === "empty"
        ? "This item doesn't have a link yet."
        : "That link doesn't look safe, so oHub didn't open it.",
    );
    return false;
  }

  if (Platform.OS === "web") {
    if (typeof window === "undefined") return false;
    // `noopener,noreferrer` prevents the opened page from reaching back through
    // `window.opener` (reverse tabnabbing) and strips the Referer header.
    window.open(result.url, "_blank", "noopener,noreferrer");
    return true;
  }

  try {
    await Linking.openURL(result.url);
    return true;
  } catch {
    notifyBlocked("oHub couldn't open that link. Try again later.");
    return false;
  }
}
