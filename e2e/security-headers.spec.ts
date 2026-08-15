import { expect, test } from "@playwright/test";

/**
 * Security header checks.
 *
 * These assert the headers declared in `vercel.json` are actually served.
 * They are skipped against the local static server, which has no header layer —
 * the point is to verify the deployed edge configuration, not `serve`.
 */
const isRemote = Boolean(process.env.E2E_BASE_URL);

test.describe("security headers", () => {
  test.skip(!isRemote, "Headers come from Vercel; run with E2E_BASE_URL set.");

  test("sets a restrictive Content-Security-Policy", async ({ request }) => {
    const response = await request.get("/");
    const csp = response.headers()["content-security-policy"];

    expect(csp, "CSP header is missing").toBeTruthy();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("base-uri 'none'");
    // No inline script execution — the whole app ships as one external bundle.
    expect(csp).not.toContain("script-src 'self' 'unsafe-inline'");
  });

  test("sets the standard hardening headers", async ({ request }) => {
    const headers = (await request.get("/")).headers();

    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["strict-transport-security"]).toContain("max-age=");
    expect(headers["cross-origin-opener-policy"]).toBe("same-origin");
  });

  test("denies the sensor and media permissions the app never uses", async ({
    request,
  }) => {
    const policy = (await request.get("/")).headers()["permissions-policy"];

    expect(policy).toBeTruthy();
    for (const feature of ["geolocation", "camera", "microphone", "payment"]) {
      expect(policy).toContain(`${feature}=()`);
    }
  });

  test("is served over HTTPS", async ({ baseURL }) => {
    expect(baseURL?.startsWith("https://")).toBe(true);
  });

  test("fingerprinted assets are cached immutably", async ({ request, page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const bundleSrc = await page.evaluate(() => {
      const script = document.querySelector<HTMLScriptElement>(
        'script[src*="/_expo/static/js/"]',
      );
      return script?.getAttribute("src") ?? null;
    });

    expect(bundleSrc, "no hashed bundle found in index.html").toBeTruthy();

    const cacheControl = (await request.get(bundleSrc!)).headers()["cache-control"];
    expect(cacheControl).toContain("immutable");
  });
});
