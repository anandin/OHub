import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  StorageKeys,
  clearAll,
  readValidated,
  setWriteMirror,
  write,
} from "@/lib/storage";
import { describeSync } from "@/lib/useSyncStatus";
import { z } from "zod";

afterEach(() => {
  setWriteMirror(null);
});

describe("the write mirror", () => {
  it("reports every persisted key so nothing saves locally without syncing", async () => {
    const seen: string[] = [];
    setWriteMirror((key) => seen.push(key));

    await write(StorageKeys.profile, { name: "A" });
    await write(StorageKeys.applications, []);

    expect(seen).toEqual([StorageKeys.profile, StorageKeys.applications]);
  });

  it("still reports the write as successful when the mirror throws", async () => {
    setWriteMirror(() => {
      throw new Error("network down");
    });

    // The value is on the device; a sync failure is a different problem and is
    // reported separately. Returning false here would make screens roll back
    // an edit that was saved.
    await expect(write(StorageKeys.profile, { name: "A" })).resolves.toBe(true);
    await expect(
      readValidated(StorageKeys.profile, z.object({ name: z.string() }), { name: "" }),
    ).resolves.toEqual({ name: "A" });
  });

  it("does not fire for a write that failed", async () => {
    const AsyncStorage = require("@react-native-async-storage/async-storage");
    const spy = jest
      .spyOn(AsyncStorage, "setItem")
      .mockRejectedValueOnce(new Error("quota exceeded"));

    const seen: string[] = [];
    setWriteMirror((key) => seen.push(key));

    await expect(write(StorageKeys.profile, { name: "A" })).resolves.toBe(false);
    expect(seen).toEqual([]);
    spy.mockRestore();
  });

  it("is not invoked by clearAll, which must not push an empty account up", async () => {
    await write(StorageKeys.profile, { name: "A" });

    const seen: string[] = [];
    setWriteMirror((key) => seen.push(key));
    await clearAll();

    expect(seen).toEqual([]);
  });
});

describe("sync status copy", () => {
  const at = 1_700_000_000_000;

  it("never claims a save that failed", () => {
    const [label, attention] = describeSync({ state: "error", lastSyncedAt: at }, at);
    expect(label).toMatch(/could not reach your account/i);
    expect(label).not.toMatch(/^Saved to your account/);
    expect(attention).toBe(true);
  });

  it("says what it is doing while in flight", () => {
    expect(describeSync({ state: "syncing", lastSyncedAt: null }, at)[0]).toMatch(
      /Saving/,
    );
  });

  it("ages the confirmation rather than leaving a stale tick", () => {
    expect(describeSync({ state: "idle", lastSyncedAt: at }, at)[0]).toMatch(/just now/);
    expect(
      describeSync({ state: "idle", lastSyncedAt: at - 90_000 }, at)[0],
    ).toBe("Saved to your account 2 minutes ago");
    expect(
      describeSync({ state: "idle", lastSyncedAt: at - 3_600_000 }, at)[0],
    ).toBe("Saved to your account 1 hour ago");
  });

  it("flags nothing when sync is off", () => {
    expect(describeSync({ state: "off", lastSyncedAt: null }, at)[1]).toBe(false);
  });
});

describe("the deployed content security policy", () => {
  const vercel = JSON.parse(
    readFileSync(join(__dirname, "..", "vercel.json"), "utf8"),
  ) as { headers: { source: string; headers: { key: string; value: string }[] }[] };

  const csp = vercel.headers
    .flatMap((entry) => entry.headers)
    .find((header) => header.key === "Content-Security-Policy")?.value;

  it("allows the app to reach the Supabase project it is configured against", () => {
    // A CSP that omits this does not fail the build or any local test — it
    // fails silently in the browser, and every sign-in attempt dies in the
    // token exchange with nothing but a console error.
    const supabaseUrl =
      process.env.EXPO_PUBLIC_SUPABASE_URL ??
      "https://brnusefzmfvkithtuobv.supabase.co";
    const origin = new URL(supabaseUrl).origin;

    expect(csp).toBeDefined();
    const connectSrc = csp?.split(";").find((d) => d.trim().startsWith("connect-src"));
    expect(connectSrc).toContain(origin);
  });

  it("still refuses scripts and frames from anywhere else", () => {
    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("base-uri 'none'");
  });

  it("does not widen connect-src to a wildcard", () => {
    const sources =
      csp
        ?.split(";")
        .find((d) => d.trim().startsWith("connect-src"))
        ?.trim()
        .split(/\s+/)
        .slice(1) ?? [];

    // `https:` on its own is every host on the internet; `https://host` is one.
    expect(sources).not.toContain("*");
    expect(sources).not.toContain("https:");
    expect(sources).not.toContain("data:");
    expect(sources.every((s) => s === "'self'" || s.startsWith("https://"))).toBe(true);
  });
});

describe("the privacy notice", () => {
  const page = readFileSync(
    join(__dirname, "..", "landing", "privacy.html"),
    "utf8",
  );

  it("exists, because the sign-in screen and Settings both link to it", () => {
    expect(page).toContain("<title>");
    expect(page.length).toBeGreaterThan(2000);
  });

  it("names the deletion route the app actually provides", () => {
    expect(page).toMatch(/Delete my account/);
  });

  it("links back into the app and the landing page", () => {
    expect(page).toContain('href="/today"');
    expect(page).toContain('href="/"');
  });
});

describe("vercel.json is deployable at all", () => {
  const raw = readFileSync(join(__dirname, "..", "vercel.json"), "utf8");
  const config = JSON.parse(raw) as Record<string, unknown>;

  /**
   * Vercel validates `vercel.json` against a schema with
   * `additionalProperties: false`, and rejects the deployment *before the
   * build starts* if it fails — which means no build log, no error line, and a
   * production alias silently left on the previous commit.
   *
   * That is exactly how a JSON "comment" shipped once. There is no comment
   * syntax in this file; explanations go in CLAUDE.md.
   */
  const ALLOWED = new Set([
    "$schema",
    "buildCommand",
    "installCommand",
    "outputDirectory",
    "devCommand",
    "framework",
    "ignoreCommand",
    "public",
    "regions",
    "trailingSlash",
    "cleanUrls",
    "github",
    "git",
    "headers",
    "redirects",
    "rewrites",
    "functions",
    "crons",
    "images",
    "buildEnv",
    "env",
  ]);

  it("has no top-level key Vercel would reject", () => {
    const unknown = Object.keys(config).filter((key) => !ALLOWED.has(key));
    expect(unknown).toEqual([]);
  });

  it("carries no attempt at a JSON comment", () => {
    const commentish = Object.keys(config).filter(
      (key) => key.startsWith("_") || key.startsWith("//"),
    );
    expect(commentish).toEqual([]);
  });

  it("redirects auth parameters landing on / into the app", () => {
    // `/` is the static landing page and cannot redeem an auth code. Rewrites
    // run after the filesystem check, so only a redirect can move it.
    const redirects = (config.redirects ?? []) as {
      source: string;
      destination: string;
      has?: { type: string; key: string }[];
    }[];

    for (const key of ["code", "token_hash", "error"]) {
      const rule = redirects.find(
        (r) => r.source === "/" && r.has?.some((h) => h.type === "query" && h.key === key),
      );
      // Named in the assertion rather than a message argument: Jest's expect
      // takes only one.
      expect({ key, destination: rule?.destination }).toEqual({
        key,
        destination: "/today",
      });
    }
  });
});
