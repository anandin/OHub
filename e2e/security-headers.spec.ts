import { expect, test } from "@playwright/test";

/**
 * Edge-configuration checks for a real deployment.
 *
 * These assert what `vercel.json` actually produces at the edge — headers,
 * caching, and the SPA rewrite. They are skipped against the local static
 * server, which reimplements only enough of that behaviour to run the UI specs.
 *
 * Deliberately HTTP-only, no browser: this is the layer where a broken
 * `vercel.json` shows up, and it should stay verifiable even where a browser
 * cannot run.
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
    expect(csp).toContain("script-src 'self'");
    expect(csp).not.toContain("script-src 'self' 'unsafe-inline'");
  });

  test("sets the standard hardening headers", async ({ request }) => {
    const headers = (await request.get("/")).headers();

    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["strict-transport-security"]).toContain("max-age=");
    expect(headers["cross-origin-opener-policy"]).toBe("same-origin");
    expect(headers["cross-origin-resource-policy"]).toBe("same-origin");
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
});

test.describe("edge routing", () => {
  test.skip(!isRemote, "Rewrites come from Vercel; run with E2E_BASE_URL set.");

  // Regression: the original `rewrites.source` was written as a negative-lookahead
  // regex. A Vercel `source` is path-to-regexp, not a raw regex, and its groups do
  // not span `/`, so it matched nothing and every deep link 404'd in production —
  // while passing locally, because the local preview server does its own fallback.
  const deepLinks = [
    "/today",
    "/programs",
    "/settings",
    "/scholarships",
    "/program/torontos-tla",
    "/university/waterloo",
    "/program/a-program-that-does-not-exist",
  ];

  for (const path of deepLinks) {
    test(`${path} is served the app shell, not a 404`, async ({ request }) => {
      const response = await request.get(path);

      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toContain("text/html");
      expect(await response.text()).toContain('id="root"');
    });
  }

  // Regression: Supabase sends a confirmation link back to the Site URL, which
  // is `/` — and `/` is the static landing page, so the code arrived on a page
  // with no router to hand it to and the student saw a marketing page instead
  // of their account. A rewrite cannot fix it (rewrites run after the
  // filesystem check, and index.html exists), so these are redirects, and this
  // is the only place a broken one would show up.
  for (const param of ["code=abc123", "token_hash=abc123&type=signup", "error=access_denied"]) {
    test(`/?${param} is redirected into the app`, async ({ request }) => {
      const response = await request.get(`/?${param}`, { maxRedirects: 0 });

      expect(response.status()).toBe(307);
      const location = response.headers()["location"] ?? "";
      expect(location).toContain("/today");
      // The parameters have to survive the hop or there is nothing to redeem.
      expect(location).toContain(param.split("=")[0]);
    });
  }

  test("real files are still served directly, not rewritten", async ({
    request,
  }) => {
    const favicon = await request.get("/favicon.ico");
    expect(favicon.status()).toBe(200);
    expect(favicon.headers()["content-type"]).toContain("image");
  });

  test("`/` is the landing page, not the app shell", async ({ request }) => {
    // The catch-all rewrite must not swallow the root: rewrites run after the
    // filesystem check, so dist/index.html wins. If that ever stops being true,
    // visitors get the app bundle instead of the pitch.
    const html = await (await request.get("/")).text();
    expect(html).toContain("Every Ontario program");
    expect(html).not.toContain("/_expo/static/js/web/");
  });

  test("fingerprinted assets are cached immutably", async ({ request }) => {
    const html = await (await request.get("/today")).text();
    const bundleSrc = html.match(/src="(\/_expo\/static\/js\/web\/[^"]+)"/)?.[1];

    expect(bundleSrc, "no hashed bundle found in index.html").toBeTruthy();

    const headers = (await request.get(bundleSrc!)).headers();
    expect(headers["cache-control"]).toContain("immutable");
    expect(headers["cache-control"]).toContain("max-age=31536000");
  });

  test("the HTML shell is not cached immutably", async ({ request }) => {
    // index.html must revalidate, or a deploy would never reach returning users.
    const cacheControl = (await request.get("/")).headers()["cache-control"];
    expect(cacheControl).not.toContain("immutable");
  });
});
