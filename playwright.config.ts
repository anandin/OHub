import { defineConfig, devices } from "@playwright/test";

import { proxy, STORAGE_STATE } from "./e2e/global-setup";

/**
 * End-to-end config.
 *
 * `E2E_BASE_URL` points the suite at a deployment (preview or production).
 * With it unset, Playwright builds and serves `dist/` locally so the same
 * assertions run in CI without needing a deploy.
 */
const baseURL = process.env.E2E_BASE_URL ?? "http://127.0.0.1:4173";
const isRemote = Boolean(process.env.E2E_BASE_URL);
const needsAuth = Boolean(
  process.env.E2E_SHARE_TOKEN ?? process.env.E2E_BYPASS_SECRET,
);

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    // Carries the Vercel protection-bypass cookie when testing a protected
    // preview deployment. Only set when global setup actually wrote one.
    ...(needsAuth ? { storageState: STORAGE_STATE } : {}),
    ...(proxy ? { proxy } : {}),
  },
  projects: [
    {
      name: "mobile-chrome",
      // Grade 12 students use this on a phone. Test that shape first.
      use: { ...devices["Pixel 7"] },
    },
    {
      name: "desktop-chrome",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  ...(isRemote
    ? {}
    : {
        webServer: {
          command: "node scripts/serve-dist.mjs",
          url: baseURL,
          reuseExistingServer: true,
          timeout: 120_000,
        },
      }),
});
