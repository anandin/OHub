import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

/**
 * The Supabase client.
 *
 * ## Why the key is in the source
 *
 * `SUPABASE_PUBLISHABLE_KEY` is not a secret. It identifies the project and
 * nothing else: it grants the `anon` Postgres role, which this project has
 * `revoke all` on for every table. Every row a signed-in student can reach is
 * reachable because their *access token* passes an RLS policy keyed to
 * `auth.uid()`, not because of this key.
 *
 * It lives here rather than in an environment variable because a static web
 * export inlines `EXPO_PUBLIC_*` at build time anyway — the value ends up in
 * the bundle either way, and pretending otherwise invites someone to put a
 * real secret next to it. The environment variables are still honoured so a
 * fork can point at its own project without editing code.
 *
 * The service-role key is not here, is not in the bundle, and must never be:
 * it bypasses RLS entirely.
 *
 * ## Where the session lives
 *
 * In `localStorage` on web, via AsyncStorage. That is script-readable, so the
 * defence is that no foreign script can run: the CSP is `script-src 'self'`
 * with no `unsafe-inline` and no CDN origins. Access tokens are one-hour and
 * refresh tokens rotate on use, so a stolen session has a bounded life.
 *
 * A cookie-based session would be better, but it needs a server to set
 * `HttpOnly`, and this app is a static export with no origin server.
 */
const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? "https://brnusefzmfvkithtuobv.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  "sb_publishable_56sNpK5722W-zp8sTtR0ag_fuop6pHr";

/** Exported so the CSP test can assert `connect-src` actually allows it. */
export const supabaseOrigin = new URL(SUPABASE_URL).origin;

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    // PKCE keeps the authorization code useless without the verifier this
    // client generated, so an intercepted redirect URL cannot be replayed.
    flowType: "pkce",
    // Off deliberately, on every platform. `AuthContext` redeems the code or
    // token itself, because the automatic path swallows the failure: a student
    // who signs up on a school desktop and opens the email on their phone
    // cannot complete a PKCE exchange, and needs to be told that rather than
    // watching a spinner. See `redeemEmailLink`.
    detectSessionInUrl: false,
  },
  global: {
    headers: { "x-application-name": "ohub" },
  },
});
