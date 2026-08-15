import { request, type FullConfig } from "@playwright/test";

export const STORAGE_STATE = ".playwright/state.json";

/** Chromium and Playwright's request client both need this passed explicitly. */
export const proxy = (() => {
  const server = process.env.HTTPS_PROXY ?? process.env.https_proxy;
  return server ? { server, bypass: "localhost,127.0.0.1,::1" } : undefined;
})();

/**
 * Authenticate against a protected Vercel deployment before the suite runs.
 *
 * Preview deployments have Vercel Authentication on by default, so an
 * unauthenticated request 302s to vercel.com/sso-api and every test would
 * assert against a login redirect instead of the app.
 *
 * Two supported ways in, both no-ops when unset:
 *   E2E_SHARE_TOKEN   a `_vercel_share` token — requesting the URL once sets
 *                     the bypass cookie, which we persist as storage state.
 *   E2E_BYPASS_SECRET the project's Protection Bypass for Automation secret,
 *                     sent as a header and exchanged for the same cookie.
 *
 * This uses Playwright's HTTP client rather than a browser: the header and
 * rewrite assertions are pure HTTP, and requiring a working browser here would
 * stop them running on hosts where Chromium has no outbound network.
 */
async function globalSetup(config: FullConfig) {
  const baseURL = process.env.E2E_BASE_URL;
  const shareToken = process.env.E2E_SHARE_TOKEN;
  const bypassSecret = process.env.E2E_BYPASS_SECRET;

  // Playwright creates the file (and its directory) from storageState below;
  // `use.storageState` is only set when one of these is present, so there is
  // nothing to write in the unauthenticated case.
  if (!baseURL || (!shareToken && !bypassSecret)) return;

  const context = await request.newContext({
    baseURL,
    ...(proxy ? { proxy } : {}),
    ...(bypassSecret
      ? {
          extraHTTPHeaders: {
            "x-vercel-protection-bypass": bypassSecret,
            "x-vercel-set-bypass-cookie": "true",
          },
        }
      : {}),
  });

  const target = shareToken
    ? `/?_vercel_share=${encodeURIComponent(shareToken)}`
    : "/";

  const response = await context.get(target);

  if (!response.ok()) {
    await context.dispose();
    throw new Error(
      `Could not authenticate against ${baseURL} (status ${response.status()}). ` +
        "Check that E2E_SHARE_TOKEN / E2E_BYPASS_SECRET is current.",
    );
  }

  await context.storageState({ path: STORAGE_STATE });
  await context.dispose();

  console.log(`Authenticated against ${baseURL}; bypass cookie stored.`);
  void config;
}

export default globalSetup;
