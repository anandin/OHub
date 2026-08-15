#!/usr/bin/env node
/**
 * Put the marketing page at `/` and the app shell behind it.
 *
 * `expo export` writes the single-page app shell to `dist/index.html`. A
 * marketing page wants that address, and it should not cost a visitor the
 * 3.5 MB app bundle just to read a pitch — nor can a client-rendered SPA be
 * indexed by a search engine.
 *
 * So after the export:
 *   dist/index.html  ->  dist/app.html      the Expo shell
 *   landing/*        ->  dist/              the static marketing page
 *
 * `vercel.json` then rewrites every unmatched path to `/app.html`, which keeps
 * deep links working while `/` is served straight from the filesystem —
 * rewrites are applied after the filesystem check, so `/` never reaches them.
 *
 * The app's own home tab lives at `/today` (see `app/(tabs)/_layout.tsx`) so
 * nothing in the router needs to own `/`.
 */
import {
  copyFileSync,
  existsSync,
  readFileSync,
  readdirSync,
  renameSync,
  statSync,
} from "node:fs";
import { join } from "node:path";

const DIST = "dist";
const LANDING = "landing";
const SHELL = join(DIST, "app.html");

function fail(message) {
  console.error(`postbuild-landing: ${message}`);
  process.exit(1);
}

if (!existsSync(join(DIST, "index.html"))) {
  fail("dist/index.html is missing — did `expo export` run?");
}
if (!existsSync(join(LANDING, "index.html"))) {
  fail("landing/index.html is missing.");
}

renameSync(join(DIST, "index.html"), SHELL);

let copied = 0;
for (const entry of readdirSync(LANDING)) {
  const source = join(LANDING, entry);
  if (!statSync(source).isFile()) continue;
  copyFileSync(source, join(DIST, entry));
  copied += 1;
}

// A landing page that silently stopped linking into the app would be a dead
// end, and a route rename is exactly the kind of change that breaks it quietly.
if (!existsSync(SHELL)) fail("app shell was not created at dist/app.html");

const landing = readFileSync(join(DIST, "index.html"), "utf8");
if (!landing.includes('href="/today"')) {
  fail("landing page has no link into the app (expected href=\"/today\")");
}

console.log(
  `postbuild-landing: app shell -> dist/app.html, ${copied} landing file(s) -> dist/`,
);
