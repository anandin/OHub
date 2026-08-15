#!/usr/bin/env node
/**
 * Zero-dependency static server for `dist/`.
 *
 * Mirrors the two behaviours Vercel provides in production so the E2E suite can
 * run locally and in CI without a deploy:
 *   1. long-lived caching for fingerprinted assets under /_expo and /assets
 *   2. the SPA rewrite — any unknown path falls back to the app shell,
 *      app.html, while `/` is served from the filesystem as the landing page
 *
 * It is a test/preview harness, not the production server. Vercel serves the
 * real thing; `vercel.json` carries the security headers.
 */
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";

const ROOT = resolve(process.cwd(), "dist");
const PORT = Number(process.env.PORT ?? 4173);
const HOST = process.env.HOST ?? "127.0.0.1";

const MIME = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".otf": "font/otf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function resolveFile(pathname) {
  // normalize() collapses `..` segments; the prefix check then guarantees the
  // resolved path cannot escape dist/.
  const candidate = resolve(join(ROOT, normalize(decodeURIComponent(pathname))));
  if (candidate !== ROOT && !candidate.startsWith(ROOT + sep)) return null;
  if (existsSync(candidate)) {
    if (statSync(candidate).isFile()) return candidate;
    // A directory request resolves to its index.html, which is how Vercel
    // serves `/` from the filesystem before any rewrite is considered. Without
    // this, `/` would fall through to the SPA shell and the landing page would
    // never be reachable.
    const indexFile = join(candidate, "index.html");
    if (existsSync(indexFile) && statSync(indexFile).isFile()) return indexFile;
  }
  return null;
}

const server = createServer((req, res) => {
  const { pathname } = new URL(req.url ?? "/", `http://${req.headers.host}`);

  const direct = resolveFile(pathname);
  // Unmatched paths get the app shell, not index.html — index.html is the
  // marketing page and owns `/` only. This mirrors the Vercel rewrite.
  const file = direct ?? join(ROOT, "app.html");

  if (!existsSync(file)) {
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("Not found — run `pnpm run build` first.");
    return;
  }

  const immutable =
    direct !== null &&
    (pathname.startsWith("/_expo/") || pathname.startsWith("/assets/"));

  res.writeHead(200, {
    "content-type": MIME[extname(file).toLowerCase()] ?? "application/octet-stream",
    "cache-control": immutable
      ? "public, max-age=31536000, immutable"
      : "no-cache, must-revalidate",
    "x-content-type-options": "nosniff",
  });

  createReadStream(file).pipe(res);
});

server.listen(PORT, HOST, () => {
  console.log(`Serving dist/ at http://${HOST}:${PORT}`);
});
