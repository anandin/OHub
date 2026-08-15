import { expect, test, type Page } from "@playwright/test";

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

async function gotoApp(page: Page, path = "/") {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  // The Expo bundle mounts into #root; wait for real content, not just HTML.
  await expect(page.locator("#root")).not.toBeEmpty({ timeout: 30_000 });
}

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
  test("settings explains storage and offers erasure", async ({ page }) => {
    await gotoApp(page, "/settings");
    await expect(page.locator("#root")).toContainText(/stored only on this device/i);
    await expect(page.locator("#root")).toContainText(/erase my ohub data/i);
  });

  test("erasing data clears a saved profile", async ({ page }) => {
    await gotoApp(page);
    await page.getByText("You", { exact: true }).first().click();
    await page.getByText(/add your name/i).first().click();
    await page.getByPlaceholder(/full name/i).fill("Erase Me");
    await page.getByText(/save changes/i).click();
    await expect(page.locator("#root")).toContainText("Erase Me");

    await page.goto("/settings", { waitUntil: "domcontentloaded" });
    await page.getByText(/erase my ohub data/i).click();
    await page.getByText(/yes, erase it all/i).click();
    await expect(page.locator("#root")).toContainText(/fresh start/i);

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.getByText("You", { exact: true }).first().click();
    await expect(page.locator("#root")).toContainText(/add your name/i);
    await expect(page.locator("#root")).not.toContainText("Erase Me");
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
