import { expect, test, type Page } from "@playwright/test";

import { signInAsTestStudent, stubSupabase } from "./session";

/**
 * Smoke tests for the deployed web app.
 *
 * These run against a real deployment (`E2E_BASE_URL`) or a local static serve
 * of `dist/`. They assert the things that would make the app useless if broken:
 * it boots, every tab renders, deep links resolve, and the student's data
 * survives a reload.
 */

/** Collect console errors so a silently broken bundle fails the test. */
function watchConsole(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));
  return errors;
}

/**
 * Open a screen as a signed-in student.
 *
 * The session has to be seeded before the first script runs, so this must be
 * called instead of `page.goto` — see `e2e/session.ts` for why the session is
 * faked rather than obtained from Google.
 */
async function gotoApp(page: Page, path = "/today") {
  await signInAsTestStudent(page);
  await page.goto(path, { waitUntil: "domcontentloaded" });
  // The Expo bundle mounts into #root; wait for real content, not just HTML.
  await expect(page.locator("#root")).not.toBeEmpty({ timeout: 30_000 });
  // The gate paints a loading state first; wait for it to resolve so tests do
  // not race the sync that runs between sign-in and the first screen.
  await expect(page.locator("#root")).not.toContainText(/Loading your application/i, {
    timeout: 30_000,
  });
}

test.describe("landing page", () => {
  test("`/` serves the marketing page, not the app bundle", async ({ page }) => {
    const errors = watchConsole(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveTitle(/oHub/i);
    await expect(
      page.getByRole("heading", { level: 1 }),
    ).toContainText(/every ontario program/i);

    // The pitch must not cost a visitor the 3.5 MB app bundle.
    const appBundles = await page
      .locator('script[src*="/_expo/static/js/web/"]')
      .count();
    expect(appBundles).toBe(0);

    expect(errors, `console errors: ${errors.join(" | ")}`).toEqual([]);
  });

  test("every call to action reaches the app", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const ctas = page.locator('a[href="/today"]');
    expect(await ctas.count()).toBeGreaterThan(0);

    await ctas.first().click();
    await expect(page.locator("#root")).not.toBeEmpty({ timeout: 30_000 });
  });

  test("states the privacy promise the app has to keep", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toContainText(/stays in canada/i);
    await expect(page.locator("body")).toContainText(/no tracking/i);
  });

  test("has a skip link for keyboard users", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator('a.skip[href="#main"]')).toHaveCount(1);
  });
});

test.describe("the sign-in gate", () => {
  test("an unauthenticated visitor gets the sign-in screen, not the app", async ({
    page,
  }) => {
    const errors = watchConsole(page);
    await stubSupabase(page);
    await page.goto("/today", { waitUntil: "domcontentloaded" });

    const root = page.locator("#root");
    await expect(root).toContainText(/continue with google/i, { timeout: 30_000 });

    // The navigator is not mounted at all while signed out, so none of the
    // tabs should exist to be reached — this is the assertion that would catch
    // the gate degrading into a redirect that a screen can render behind.
    await expect(root).not.toContainText(/Programs/);
    await expect(root).not.toContainText(/Universities/);

    expect(errors, `console errors: ${errors.join(" | ")}`).toEqual([]);
  });

  test("a protected deep link is gated the same way", async ({ page }) => {
    await stubSupabase(page);
    await page.goto("/settings", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#root")).toContainText(/continue with google/i, {
      timeout: 30_000,
    });
    await expect(page.locator("#root")).not.toContainText(/canadian data region/i);
  });

  test("says what the account is for before asking for it", async ({ page }) => {
    await stubSupabase(page);
    await page.goto("/today", { waitUntil: "domcontentloaded" });
    const root = page.locator("#root");

    await expect(root).toContainText(/continue with google/i, { timeout: 30_000 });
    await expect(root).toContainText(/stored in canada/i);
    await expect(root).toContainText(/delete it whenever/i);
    // The scope disclosure is the part a student actually needs.
    await expect(root).toContainText(/cannot read your gmail/i);
  });

  test("the sign-in button is reachable and named", async ({ page }) => {
    await stubSupabase(page);
    await page.goto("/today", { waitUntil: "domcontentloaded" });

    const button = page.getByRole("button", { name: /continue with google/i });
    await expect(button).toBeVisible({ timeout: 30_000 });

    const box = await button.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  });

  test("the privacy notice it links to actually exists", async ({ request }) => {
    const response = await request.get("/privacy.html");
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toMatch(/what oHub stores/i);
    expect(body).toMatch(/delete my account/i);
  });
});

test.describe("boot", () => {
  test("loads without console errors and renders the shell", async ({ page }) => {
    const errors = watchConsole(page);
    await gotoApp(page);

    await expect(page).toHaveTitle(/oHub/i);
    await expect(page.getByText("Programs", { exact: true }).first()).toBeVisible();

    expect(errors, `console errors: ${errors.join(" | ")}`).toEqual([]);
  });

  test("serves a favicon", async ({ request }) => {
    const response = await request.get("/favicon.ico");
    expect(response.status()).toBe(200);
  });
});

test.describe("navigation", () => {
  const tabs = [
    { label: "Today", expect: /day|track|plan/i },
    { label: "Programs", expect: /program/i },
    { label: "Apply", expect: /application/i },
    { label: "Pulse", expect: /follow|feed|all/i },
    { label: "You", expect: /profile|marks|you/i },
  ];

  for (const tab of tabs) {
    test(`the ${tab.label} tab opens`, async ({ page }) => {
      await gotoApp(page);
      await page.getByText(tab.label, { exact: true }).first().click();
      await expect(page.locator("#root")).toContainText(tab.expect, {
        timeout: 15_000,
      });
    });
  }

  test("a deep link to an unknown route still renders the app", async ({ page }) => {
    // The SPA rewrite must serve index.html for any path, otherwise a shared
    // link or a refresh on a sub-page 404s.
    await gotoApp(page, "/program/this-does-not-exist");
    await expect(page.locator("#root")).not.toBeEmpty();
  });

  test("a refresh on a sub-route is served by the SPA rewrite", async ({ page }) => {
    await gotoApp(page, "/scholarships");
    await expect(page.locator("#root")).toContainText(/scholarship/i);
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator("#root")).toContainText(/scholarship/i);
  });
});

test.describe("programs search", () => {
  test("filters the program list", async ({ page }) => {
    await gotoApp(page);
    await page.getByText("Programs", { exact: true }).first().click();

    const search = page.getByPlaceholder(/search/i).first();
    await expect(search).toBeVisible();
    await search.fill("engineering");

    await expect(page.locator("#root")).toContainText(/engineering/i);
  });

  test("shows an honest empty state for a query with no matches", async ({
    page,
  }) => {
    await gotoApp(page);
    await page.getByText("Programs", { exact: true }).first().click();

    await page.getByPlaceholder(/search/i).first().fill("zzzzqqqqnotaprogram");
    await expect(page.locator("#root")).toContainText(/no programs match/i);
  });
});

test.describe("persistence", () => {
  test("a saved profile name survives a reload", async ({ page }) => {
    await gotoApp(page);
    await page.getByText("You", { exact: true }).first().click();

    // A fresh install must not invent an identity.
    await expect(page.locator("#root")).toContainText(/add your name/i);

    await page.getByText(/add your name/i).first().click();
    const nameField = page.getByPlaceholder(/full name/i);
    await expect(nameField).toBeVisible();
    await nameField.fill("Test Student");
    await page.getByText(/save changes/i).click();

    await expect(page.locator("#root")).toContainText("Test Student");

    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator("#root")).not.toBeEmpty();
    await page.getByText("You", { exact: true }).first().click();
    await expect(page.locator("#root")).toContainText("Test Student");
  });
});

test.describe("privacy", () => {
  test("settings explains storage and offers both ways out", async ({ page }) => {
    await gotoApp(page, "/settings");
    const root = page.locator("#root");
    await expect(root).toContainText(/canadian data region/i);
    await expect(root).toContainText(/clear my ohub data/i);
    // Emptying the account and deleting it are different promises and need to
    // be different controls.
    await expect(root).toContainText(/delete my account/i);
    await expect(root).toContainText(/sign out of this device/i);
  });

  test("shows the signed-in account rather than implying anonymity", async ({
    page,
  }) => {
    await gotoApp(page, "/settings");
    await expect(page.locator("#root")).toContainText("Test Student");
    await expect(page.locator("#root")).toContainText("test.student@example.com");
  });

  test("clearing data clears a saved profile", async ({ page }) => {
    await gotoApp(page);
    await page.getByText("You", { exact: true }).first().click();
    await page.getByText(/add your name/i).first().click();
    await page.getByPlaceholder(/full name/i).fill("Erase Me");
    await page.getByText(/save changes/i).click();
    await expect(page.locator("#root")).toContainText("Erase Me");

    await page.goto("/settings", { waitUntil: "domcontentloaded" });
    await page.getByText(/clear my ohub data/i).click();
    await page.getByText(/yes, clear it all/i).click();
    await expect(page.locator("#root")).toContainText(/fresh start/i);

    await gotoApp(page);
    await page.getByText("You", { exact: true }).first().click();
    await expect(page.locator("#root")).toContainText(/add your name/i);
    await expect(page.locator("#root")).not.toContainText("Erase Me");
  });

  test("deleting the account needs a confirmation and does not fire on one tap", async ({
    page,
  }) => {
    await gotoApp(page, "/settings");

    await page.getByRole("button", { name: /permanently delete my ohub account/i }).click();
    // Still signed in — the first tap only arms the control.
    await expect(page.locator("#root")).toContainText(/yes, delete my account/i);
    await expect(page.locator("#root")).toContainText("test.student@example.com");

    await page.getByRole("button", { name: /cancel deleting my account/i }).click();
    await expect(page.locator("#root")).not.toContainText(/yes, delete my account/i);
  });

  test("the OUAC reference is masked on screen", async ({ page }) => {
    await gotoApp(page);
    await page.getByText("You", { exact: true }).first().click();
    await page.getByText(/add your name/i).first().click();

    await page.getByPlaceholder(/full name/i).fill("Ref Test");
    await page.getByPlaceholder(/2026-0000000/).fill("2026-1093478");
    await page.getByText(/save changes/i).click();

    const root = page.locator("#root");
    await expect(root).toContainText("3478");
    await expect(root).not.toContainText("2026-1093478");
  });
});

test.describe("accessibility basics", () => {
  test("interactive controls expose names to assistive tech", async ({ page }) => {
    await gotoApp(page);

    // Every rendered button should have an accessible name; unnamed buttons are
    // invisible to a screen reader.
    const unnamed = await page.evaluate(() => {
      const nodes = Array.from(
        document.querySelectorAll('[role="button"], button, [role="link"], a'),
      );
      return nodes
        .filter((node) => {
          const el = node as HTMLElement;
          if (el.offsetParent === null) return false;
          const label =
            el.getAttribute("aria-label") ?? el.textContent?.trim() ?? "";
          return label === "";
        })
        .map((node) => (node as HTMLElement).outerHTML.slice(0, 120));
    });

    expect(unnamed, `unnamed controls: ${unnamed.join(" | ")}`).toEqual([]);
  });

  test("the page declares a language", async ({ page }) => {
    await gotoApp(page);
    await expect(page.locator("html")).toHaveAttribute("lang", /en/);
  });
});

test.describe("dark mode", () => {
  test("the app follows a dark system preference", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await gotoApp(page);

    // Read the painted background rather than a class name — the point is what
    // the student actually sees, not which token we think we applied.
    const background = await page
      .locator("#root > div")
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor);

    const [r, g, b] = background.match(/\d+/g)!.map(Number);
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    expect(luminance, `background was ${background}`).toBeLessThan(0.3);

    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("the app stays light for a light system preference", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await gotoApp(page);
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });

  test("an explicit choice overrides the system and survives a reload", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await gotoApp(page, "/settings");

    await page.getByRole("radio", { name: "Dark" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator("#root")).not.toBeEmpty({ timeout: 30_000 });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("the landing page respects the system preference too", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const background = await page
      .locator("body")
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    const [r, g, b] = background.match(/\d+/g)!.map(Number);
    expect((0.2126 * r + 0.7152 * g + 0.0722 * b) / 255).toBeLessThan(0.3);
  });
});

test.describe("landing craft floor", () => {
  // Regressions for what Impeccable's detector flagged on the first landing
  // build. Each of these shipped once; the assertion is cheaper than the audit.
  test("no eyebrow labels, icon tiles, or side-tab borders", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const tells = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll("*")) as HTMLElement[];
      const found: string[] = [];
      for (const el of els) {
        const cs = getComputedStyle(el);
        const w = parseFloat(cs.borderLeftWidth) || 0;
        if (w > 1 && cs.borderLeftStyle !== "none") {
          const c = cs.borderLeftColor;
          if (c && c !== "rgba(0, 0, 0, 0)" && !c.startsWith("rgba(0, 0, 0, 0")) {
            found.push(`side-tab: ${el.tagName.toLowerCase()} ${w}px`);
          }
        }
        // A small square tile immediately before a heading is the AI feature card.
        const box = el.getBoundingClientRect();
        const next = el.nextElementSibling?.tagName ?? "";
        if (
          box.width > 0 && box.width <= 56 && Math.abs(box.width - box.height) < 6 &&
          parseFloat(cs.borderRadius) > 3 && /^H[1-4]$/.test(next)
        ) {
          found.push(`icon-tile above ${next}`);
        }
      }
      return found;
    });

    expect(tells, tells.join(" | ")).toEqual([]);
  });

  test("the display face is self-hosted, not a platform fallback", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => document.fonts.ready);

    const family = await page
      .locator("h1")
      .evaluate((el) => getComputedStyle(el).fontFamily);
    expect(family).toContain("Spectral");

    const loaded = await page.evaluate(() =>
      Array.from(document.fonts).some((f) => f.family === "Spectral" && f.status === "loaded"),
    );
    expect(loaded, "Spectral did not load — the page fell back to a system serif").toBe(true);
  });

  test("no emoji standing in for an icon system", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const text = (await page.locator("body").innerText()) ?? "";
    // Pictographic ranges; the drawn ticks are inline SVG and are not caught.
    expect(text).not.toMatch(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u);
  });

  test("body text stays within a readable measure", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const tooWide = await page.evaluate(() => {
      const out: string[] = [];
      for (const p of Array.from(document.querySelectorAll("p, li"))) {
        const el = p as HTMLElement;
        if (!el.innerText.trim()) continue;
        const size = parseFloat(getComputedStyle(el).fontSize);
        // ~0.5em average glyph advance is the usual approximation.
        const chars = el.getBoundingClientRect().width / (size * 0.5);
        if (chars > 80) out.push(`${Math.round(chars)}ch: ${el.innerText.slice(0, 40)}`);
      }
      return out;
    });

    expect(tooWide, tooWide.join(" | ")).toEqual([]);
  });
});
