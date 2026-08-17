import type { EmailOtpType } from "@supabase/supabase-js";

/**
 * Reading the one-time token out of an emailed link.
 *
 * ## Why not the link Supabase gives you by default
 *
 * `{{ .ConfirmationURL }}` sends the student through the project's `/verify`
 * endpoint, which — with the PKCE flow this app uses — hands back a `?code=`
 * that can only be exchanged by the browser that *started* the sign-up,
 * because the verifier is in that browser's local storage.
 *
 * Students sign up on a school desktop and open their email on a phone. That
 * is not an edge case, it is the normal case, and it fails with an opaque
 * "code verifier missing" error.
 *
 * A token hash carries no client-side secret. It is verified server-side, so
 * the link works from any device, any browser, any email client.
 */

const TYPES = new Set<EmailOtpType>([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]);

/**
 * What a page load arrived carrying.
 *
 * Three shapes, because there are three ways Supabase can land someone here:
 *
 * - `token`: our own templates, which link with `{{ .TokenHash }}`.
 * - `code`:  the stock templates and the OAuth redirect, which use PKCE. Kept
 *            because the stock templates cannot be replaced on the free tier
 *            without custom SMTP, so this is the live path until that is set up.
 * - `error`: an expired or already-used link. Supabase redirects rather than
 *            showing its own page, so this is ours to explain.
 */
export type EmailArrival =
  | { kind: "none" }
  | { kind: "token"; tokenHash: string; type: EmailOtpType; recovery: boolean }
  | { kind: "code"; code: string; recovery: boolean }
  | { kind: "error"; code: string | undefined; recovery: boolean };

function paramsOf(url: string): URLSearchParams | null {
  try {
    const parsed = new URL(url, "https://placeholder.invalid");
    // Supabase puts errors in the query on some paths and the fragment on
    // others, so both are worth reading.
    const merged = new URLSearchParams(parsed.search);
    for (const [key, value] of new URLSearchParams(parsed.hash.replace(/^#/, ""))) {
      if (!merged.has(key)) merged.append(key, value);
    }
    return merged;
  } catch {
    return null;
  }
}

export function readEmailArrival(url: string): EmailArrival {
  const params = paramsOf(url);
  if (!params) return { kind: "none" };

  const type = params.get("type") ?? "";
  const recovery = type === "recovery";

  const errorCode = params.get("error_code") ?? params.get("error") ?? undefined;
  if (params.has("error") || params.has("error_code")) {
    return { kind: "error", code: errorCode, recovery };
  }

  const tokenHash = params.get("token_hash");
  // Bounded: these go into a network call, and a megabyte of query string is
  // not a token. An unrecognised `type` is refused rather than forwarded —
  // it would otherwise reach `verifyOtp` straight from a URL anyone can write.
  if (tokenHash && tokenHash.length <= 512 && TYPES.has(type as EmailOtpType)) {
    return { kind: "token", tokenHash, type: type as EmailOtpType, recovery };
  }

  const code = params.get("code");
  if (code && code.length <= 512) return { kind: "code", code, recovery };

  return { kind: "none" };
}

/** Plain-language version of why a link did not work. */
export function describeLinkError(code: string | undefined, recovery: boolean): string {
  const kind = recovery ? "reset link" : "confirmation link";

  if (code === "otp_expired") {
    return `That ${kind} has expired. Ask for a new one — they last 24 hours.`;
  }
  if (code === "access_denied") {
    return `That ${kind} has already been used. If you are already confirmed, just sign in.`;
  }
  return `That ${kind} did not work — it may have expired or already been used. Ask for a new one.`;
}

/**
 * The same URL with the one-time token removed.
 *
 * The token is spent the moment it is verified, but leaving it in the address
 * bar puts it in history, in a screenshot, and in the `Referer` of the next
 * outbound click. Everything else in the URL is preserved so a deep link the
 * student arrived on still resolves.
 */
export function urlWithoutEmailToken(url: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }

  for (const key of ["token_hash", "type", "code", "error", "error_description"]) {
    parsed.searchParams.delete(key);
  }
  parsed.hash = "";

  const query = parsed.searchParams.toString();
  return `${parsed.origin}${parsed.pathname}${query ? `?${query}` : ""}`;
}
