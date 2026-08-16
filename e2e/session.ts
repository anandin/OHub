import type { Page } from "@playwright/test";

/**
 * Put the browser in a signed-in state without a real Google round trip.
 *
 * The app is gated: with no session the navigator is never mounted, so every
 * assertion about a screen needs one. Three ways to get there, and only this
 * one is acceptable:
 *
 *   - A test-only bypass in the app. Rejected: the gate is the security
 *     control, and a control with a documented way around it in production
 *     source is not a control.
 *   - A real Google sign-in. Rejected: it needs a live Google account, a
 *     working consent screen and outbound network, which CI does not have, and
 *     it would test Google rather than oHub.
 *   - Seed the session the way the browser would hold it, and answer the
 *     project's own requests locally. That is this.
 *
 * The access token is a syntactically valid JWT with a far-future expiry and a
 * meaningless signature. Nothing verifies it, because nothing reaches the real
 * server: `stubSupabase` intercepts the project origin entirely. That also
 * keeps the console clean, so the "no console errors" assertions stay
 * meaningful instead of being permanently drowned in 401s.
 */

const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? "https://brnusefzmfvkithtuobv.supabase.co";

/** supabase-js derives its storage key from the first label of the hostname. */
const PROJECT_REF = new URL(SUPABASE_URL).hostname.split(".")[0];
const STORAGE_KEY = `sb-${PROJECT_REF}-auth-token`;

const TEST_USER_ID = "00000000-0000-4000-8000-000000000001";
const TEST_EMAIL = "test.student@example.com";

function base64url(value: object): string {
  return Buffer.from(JSON.stringify(value))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fakeSession() {
  // Two hours out. supabase-js refreshes a token inside its expiry margin, and
  // a refresh the stub has to answer is one more thing that can go wrong.
  const expiresAt = Math.floor(Date.now() / 1000) + 7200;

  const accessToken = [
    base64url({ alg: "HS256", typ: "JWT" }),
    base64url({
      sub: TEST_USER_ID,
      aud: "authenticated",
      role: "authenticated",
      email: TEST_EMAIL,
      exp: expiresAt,
    }),
    "e2e-signature-not-verified-locally",
  ].join(".");

  return {
    access_token: accessToken,
    refresh_token: "e2e-refresh-token",
    token_type: "bearer",
    expires_in: 7200,
    expires_at: expiresAt,
    user: {
      id: TEST_USER_ID,
      aud: "authenticated",
      role: "authenticated",
      email: TEST_EMAIL,
      email_confirmed_at: "2026-01-01T00:00:00Z",
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      app_metadata: { provider: "google", providers: ["google"] },
      user_metadata: { full_name: "Test Student", email: TEST_EMAIL },
      identities: [],
    },
  };
}

/**
 * Answer every request to the Supabase project locally with an empty account.
 *
 * An empty account is the right fixture: it is what a student sees on their
 * first sign-in, it keeps each test's state coming from that test's own
 * actions, and it exercises every empty state the app has to render.
 */
export async function stubSupabase(page: Page): Promise<void> {
  const origin = new URL(SUPABASE_URL).origin;

  await page.route(`${origin}/**`, async (route) => {
    const method = route.request().method();

    if (method === "DELETE") {
      await route.fulfill({ status: 204, body: "" });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "content-range": "0-0/0" },
      body: "[]",
    });
  });
}

/** Seed the session before any app script runs, so the gate never flashes. */
export async function signInAsTestStudent(page: Page): Promise<void> {
  await stubSupabase(page);
  await page.addInitScript(
    ([key, session]) => {
      window.localStorage.setItem(key as string, session as string);
    },
    [STORAGE_KEY, JSON.stringify(fakeSession())] as const,
  );
}

export { STORAGE_KEY, TEST_EMAIL, TEST_USER_ID };
