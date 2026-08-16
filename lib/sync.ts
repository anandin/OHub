import { z } from "zod";

import { StorageKeys, readValidated, setWriteMirror, write } from "@/lib/storage";
import type { StorageKey } from "@/lib/storage";
import { supabase } from "@/lib/supabase";

/**
 * Sync between local storage and the student's rows in Postgres.
 *
 * ## Why it hangs off `write()` rather than the contexts
 *
 * Every context already funnels its persistence through `write(key, value)`.
 * Hooking that one function means a screen cannot add a feature that saves
 * locally and forgets to sync — the failure mode where a student's note
 * survives a reload but vanishes on their next device.
 *
 * ## Direction of trust
 *
 * The device is a cache; the row is the record. On sign-in we pull and let the
 * server win, with one exception: if the server has nothing for a dataset and
 * the device has something, the device's copy is pushed up. That is the
 * first-sign-in case — a student who used the app before making an account
 * must not lose the list they already built.
 *
 * Nothing here is allowed to throw. A sync failure degrades to "saved on this
 * device, not yet saved to your account", which the Settings screen reports.
 */

const PUSH_DEBOUNCE_MS = 800;

/** Keys that correspond to a row somewhere. The rest are device-local. */
const SYNCED_KEYS: readonly StorageKey[] = [
  StorageKeys.profile,
  StorageKeys.tasksList,
  StorageKeys.tasksDone,
  StorageKeys.essayDrafts,
  StorageKeys.applications,
  StorageKeys.savedPosts,
  StorageKeys.likedPosts,
  StorageKeys.subscriptions,
  StorageKeys.themePreference,
];

/** Which push routine each key triggers. Two keys can share one. */
type Target =
  | "profile"
  | "tasks"
  | "applications"
  | "reactions"
  | "subscriptions"
  | "drafts";

const TARGET_FOR: Partial<Record<StorageKey, Target>> = {
  [StorageKeys.profile]: "profile",
  [StorageKeys.themePreference]: "profile",
  [StorageKeys.tasksList]: "tasks",
  [StorageKeys.tasksDone]: "tasks",
  [StorageKeys.applications]: "applications",
  [StorageKeys.savedPosts]: "reactions",
  [StorageKeys.likedPosts]: "reactions",
  [StorageKeys.subscriptions]: "subscriptions",
  [StorageKeys.essayDrafts]: "drafts",
};

// ---------------------------------------------------------------------------
// Shapes
// ---------------------------------------------------------------------------

const StringList = z.array(z.string()).catch([]);

const LocalProfile = z
  .object({
    name: z.string().catch(""),
    school: z.string().catch(""),
    ouacRef: z.string().catch(""),
    avg: z.number().nullable().catch(null),
    marks: StringList,
    courseCodes: StringList,
  })
  .partial()
  .catch({});

const LocalTasks = z
  .array(
    z.object({
      id: z.string(),
      label: z.string(),
      est: z.string().catch(""),
      priority: z.enum(["high", "med", "low"]).catch("med"),
    }),
  )
  .catch([]);

const LocalApplications = z
  .array(
    z.object({
      universityId: z.string(),
      status: z.string(),
      note: z.string().catch(""),
      addedAt: z.number().catch(0),
      programName: z.string().optional(),
    }),
  )
  .catch([]);

const LocalTheme = z.enum(["system", "light", "dark"]).catch("system");

/** Prompt id -> draft body. Bounded so one paste cannot fill the quota. */
const LocalDrafts = z.record(z.string().max(64), z.string().max(20_000)).catch({});

const APP_STATUSES = new Set([
  "shortlisted",
  "applied",
  "supp_sent",
  "offer",
  "accepted",
  "declined",
]);

// ---------------------------------------------------------------------------
// Observable state, so Settings can tell the student the truth
// ---------------------------------------------------------------------------

export type SyncState = "off" | "idle" | "syncing" | "error";

export interface SyncSnapshot {
  state: SyncState;
  /** Epoch ms of the last successful push, or null if nothing has synced. */
  lastSyncedAt: number | null;
}

/**
 * Held as one frozen object because `useSyncExternalStore` compares snapshots
 * by reference — returning a fresh object each read is an infinite render.
 */
let snapshot: SyncSnapshot = { state: "off", lastSyncedAt: null };
const listeners = new Set<() => void>();

function announce(next: SyncState) {
  snapshot = {
    state: next,
    lastSyncedAt: next === "idle" ? Date.now() : snapshot.lastSyncedAt,
  };
  listeners.forEach((fn) => fn());
}

export function subscribeSync(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSyncSnapshot(): SyncSnapshot {
  return snapshot;
}

// ---------------------------------------------------------------------------
// Push
// ---------------------------------------------------------------------------

let currentUserId: string | null = null;
let suspended = false;
const dirty = new Set<Target>();
let timer: ReturnType<typeof setTimeout> | null = null;

/** Called by `lib/storage.write` on every persisted value. */
export function onLocalWrite(key: StorageKey): void {
  if (suspended || currentUserId === null) return;
  const target = TARGET_FOR[key];
  if (!target) return;

  dirty.add(target);
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    void flush();
  }, PUSH_DEBOUNCE_MS);
}

async function flush(): Promise<void> {
  const uid = currentUserId;
  if (uid === null || dirty.size === 0) return;

  const targets = [...dirty];
  dirty.clear();
  announce("syncing");

  const results = await Promise.all(
    targets.map((target) =>
      pushTarget(target, uid).then(
        () => true,
        () => false,
      ),
    ),
  );

  if (results.every(Boolean)) {
    announce("idle");
  } else {
    // Put the failures back so the next write retries them.
    targets.forEach((t, i) => {
      if (!results[i]) dirty.add(t);
    });
    announce("error");
  }
}

/** Flush anything queued right now. Used before sign-out. */
export async function flushNow(): Promise<void> {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  await flush();
}

async function pushTarget(target: Target, uid: string): Promise<void> {
  switch (target) {
    case "profile":
      return pushProfile(uid);
    case "tasks":
      return pushTasks(uid);
    case "applications":
      return pushApplications(uid);
    case "reactions":
      return pushReactions(uid);
    case "subscriptions":
      return pushSubscriptions(uid);
    case "drafts":
      return pushDrafts(uid);
  }
}

function fail(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

async function pushProfile(uid: string): Promise<void> {
  const profile = await readValidated(StorageKeys.profile, LocalProfile, {});
  const theme = await readValidated(StorageKeys.themePreference, LocalTheme, "system");

  const { error } = await supabase.from("profiles").upsert(
    {
      id: uid,
      display_name: (profile.name ?? "").slice(0, 80),
      school: (profile.school ?? "").slice(0, 120),
      ouac_ref: (profile.ouacRef ?? "").slice(0, 32),
      // `null` means "not entered". The database allows null for exactly this
      // reason and the app is never allowed to substitute a number.
      average: typeof profile.avg === "number" ? profile.avg : null,
      marks: (profile.marks ?? []).slice(0, 12),
      course_codes: (profile.courseCodes ?? []).slice(0, 12),
      theme,
    },
    { onConflict: "id" },
  );
  fail(error);
}

async function pushTasks(uid: string): Promise<void> {
  const tasks = await readValidated(StorageKeys.tasksList, LocalTasks, []);
  const done = new Set(await readValidated(StorageKeys.tasksDone, StringList, []));

  const rows = tasks
    .filter((t) => t.id.length <= 64 && t.label.trim() !== "")
    .slice(0, 100)
    .map((t) => ({
      id: t.id,
      user_id: uid,
      label: t.label.slice(0, 160),
      estimate: t.est.slice(0, 32),
      priority: t.priority,
      done: done.has(t.id),
    }));

  if (rows.length > 0) {
    const { error } = await supabase.from("tasks").upsert(rows, { onConflict: "id" });
    fail(error);
  }
  await deleteMissing("tasks", "id", uid, rows.map((r) => r.id));
}

async function pushApplications(uid: string): Promise<void> {
  const apps = await readValidated(StorageKeys.applications, LocalApplications, []);

  const rows = apps
    .filter((a) => a.universityId !== "" && APP_STATUSES.has(a.status))
    .slice(0, 40)
    .map((a) => ({
      user_id: uid,
      university_id: a.universityId.slice(0, 120),
      status: a.status,
      note: a.note.slice(0, 2000),
      added_at: new Date(a.addedAt || Date.now()).toISOString(),
      program_name: a.programName ? a.programName.slice(0, 200) : null,
    }));

  if (rows.length > 0) {
    const { error } = await supabase
      .from("applications")
      .upsert(rows, { onConflict: "user_id,university_id" });
    fail(error);
  }
  await deleteMissing(
    "applications",
    "university_id",
    uid,
    rows.map((r) => r.university_id),
  );
}

async function pushReactions(uid: string): Promise<void> {
  const saved = await readValidated(StorageKeys.savedPosts, StringList, []);
  const liked = await readValidated(StorageKeys.likedPosts, StringList, []);

  const ids = [...new Set([...saved, ...liked])].slice(0, 500);
  const savedSet = new Set(saved);
  const likedSet = new Set(liked);

  const rows = ids.map((post_id) => ({
    user_id: uid,
    post_id: post_id.slice(0, 120),
    saved: savedSet.has(post_id),
    liked: likedSet.has(post_id),
  }));

  if (rows.length > 0) {
    const { error } = await supabase
      .from("post_reactions")
      .upsert(rows, { onConflict: "user_id,post_id" });
    fail(error);
  }
  await deleteMissing("post_reactions", "post_id", uid, rows.map((r) => r.post_id));
}

async function pushSubscriptions(uid: string): Promise<void> {
  const subs = await readValidated(StorageKeys.subscriptions, StringList, []);
  const rows = subs
    .slice(0, 50)
    .map((university_id) => ({ user_id: uid, university_id: university_id.slice(0, 120) }));

  if (rows.length > 0) {
    const { error } = await supabase
      .from("subscriptions")
      .upsert(rows, { onConflict: "user_id,university_id" });
    fail(error);
  }
  await deleteMissing(
    "subscriptions",
    "university_id",
    uid,
    rows.map((r) => r.university_id),
  );
}

async function pushDrafts(uid: string): Promise<void> {
  const drafts = await readValidated(StorageKeys.essayDrafts, LocalDrafts, {});

  const rows = Object.entries(drafts)
    .filter(([promptId, body]) => promptId !== "" && body.trim() !== "")
    .slice(0, 60)
    .map(([promptId, body]) => ({
      user_id: uid,
      prompt_id: promptId.slice(0, 64),
      body: body.slice(0, 20_000),
    }));

  if (rows.length > 0) {
    const { error } = await supabase
      .from("essay_drafts")
      .upsert(rows, { onConflict: "user_id,prompt_id" });
    fail(error);
  }
  await deleteMissing("essay_drafts", "prompt_id", uid, rows.map((r) => r.prompt_id));
}

/**
 * Remove rows the student deleted locally.
 *
 * Done as read-then-delete rather than a `not.in` filter because the keys are
 * user-supplied strings and building a PostgREST filter list out of them by
 * hand is a parsing problem waiting to happen. `.in()` with an array is
 * escaped by the client.
 */
async function deleteMissing(
  table: string,
  keyColumn: string,
  uid: string,
  keep: string[],
): Promise<void> {
  const { data, error } = await supabase
    .from(table)
    .select(keyColumn)
    .eq("user_id", uid);
  fail(error);

  const kept = new Set(keep);
  // `keyColumn` is a runtime string, so supabase-js cannot type the row shape.
  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  const stale = rows
    .map((row) => row[keyColumn])
    .filter((v): v is string => typeof v === "string" && !kept.has(v));

  if (stale.length === 0) return;

  const { error: deleteError } = await supabase
    .from(table)
    .delete()
    .eq("user_id", uid)
    .in(keyColumn, stale);
  fail(deleteError);
}

// ---------------------------------------------------------------------------
// Pull
// ---------------------------------------------------------------------------

/**
 * Populate local storage from this student's rows, then start mirroring.
 *
 * Must complete before the data providers mount: they read local storage once,
 * on mount, and would otherwise paint an empty account for a student who has
 * been using oHub for months.
 */
export async function hydrateFromRemote(uid: string): Promise<void> {
  currentUserId = uid;
  suspended = true;
  announce("syncing");

  try {
    const [profile, tasks, apps, reactions, subs, drafts] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase.from("tasks").select("*").eq("user_id", uid),
      supabase.from("applications").select("*").eq("user_id", uid),
      supabase.from("post_reactions").select("*").eq("user_id", uid),
      supabase.from("subscriptions").select("university_id").eq("user_id", uid),
      supabase.from("essay_drafts").select("prompt_id, body").eq("user_id", uid),
    ]);

    const firstError =
      profile.error ??
      tasks.error ??
      apps.error ??
      reactions.error ??
      subs.error ??
      drafts.error;
    if (firstError) throw new Error(firstError.message);

    const pushBack = new Set<Target>();

    await adoptProfile(profile.data, pushBack);
    await adoptTasks(tasks.data ?? [], pushBack);
    await adoptApplications(apps.data ?? [], pushBack);
    await adoptReactions(reactions.data ?? [], pushBack);
    await adoptSubscriptions(subs.data ?? [], pushBack);
    await adoptDrafts(drafts.data ?? [], pushBack);

    suspended = false;

    if (pushBack.size > 0) {
      pushBack.forEach((t) => dirty.add(t));
      await flush();
    } else {
      announce("idle");
    }
  } catch (err) {
    suspended = false;
    announce("error");
    throw err;
  }
}

/** Stop mirroring. Called on sign-out, before local storage is cleared. */
export function stopSync(): void {
  currentUserId = null;
  dirty.clear();
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  snapshot = { state: "off", lastSyncedAt: null };
  announce("off");
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function strList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

async function adoptProfile(row: unknown, pushBack: Set<Target>): Promise<void> {
  const local = await readValidated(StorageKeys.profile, LocalProfile, {});
  const localHasData =
    (local.name ?? "") !== "" ||
    (local.school ?? "") !== "" ||
    (local.ouacRef ?? "") !== "" ||
    (local.marks ?? []).some((m) => m !== "");

  if (row === null || row === undefined) {
    if (localHasData) pushBack.add("profile");
    return;
  }

  const r = row as Record<string, unknown>;
  const remoteHasData =
    str(r.display_name) !== "" ||
    str(r.school) !== "" ||
    str(r.ouac_ref) !== "" ||
    strList(r.marks).some((m) => m !== "");

  if (!remoteHasData && localHasData) {
    pushBack.add("profile");
    return;
  }

  const avg = r.average;
  await write(StorageKeys.profile, {
    name: str(r.display_name),
    school: str(r.school),
    ouacRef: str(r.ouac_ref),
    // Postgres numerics arrive as strings over PostgREST.
    avg: avg === null || avg === undefined ? null : Number(avg),
    marks: strList(r.marks),
    courseCodes: strList(r.course_codes),
  });

  const theme = str(r.theme);
  if (theme === "light" || theme === "dark" || theme === "system") {
    await write(StorageKeys.themePreference, theme);
  }
}

async function adoptTasks(rows: unknown[], pushBack: Set<Target>): Promise<void> {
  if (rows.length === 0) {
    const local = await readValidated(StorageKeys.tasksList, LocalTasks, []);
    if (local.length > 0) pushBack.add("tasks");
    return;
  }

  const list = rows.map((row) => {
    const r = row as Record<string, unknown>;
    const priority = str(r.priority);
    return {
      id: str(r.id),
      label: str(r.label),
      est: str(r.estimate),
      priority:
        priority === "high" || priority === "low" || priority === "med"
          ? priority
          : ("med" as const),
    };
  });

  const done = rows
    .filter((row) => (row as Record<string, unknown>).done === true)
    .map((row) => str((row as Record<string, unknown>).id));

  await write(StorageKeys.tasksList, list);
  await write(StorageKeys.tasksDone, done);
}

async function adoptApplications(rows: unknown[], pushBack: Set<Target>): Promise<void> {
  if (rows.length === 0) {
    const local = await readValidated(StorageKeys.applications, LocalApplications, []);
    if (local.length > 0) pushBack.add("applications");
    return;
  }

  await write(
    StorageKeys.applications,
    rows.map((row) => {
      const r = row as Record<string, unknown>;
      const programName = str(r.program_name);
      return {
        universityId: str(r.university_id),
        status: APP_STATUSES.has(str(r.status)) ? str(r.status) : "shortlisted",
        note: str(r.note),
        addedAt: Date.parse(str(r.added_at)) || 0,
        ...(programName !== "" ? { programName } : {}),
      };
    }),
  );
}

async function adoptReactions(rows: unknown[], pushBack: Set<Target>): Promise<void> {
  if (rows.length === 0) {
    const saved = await readValidated(StorageKeys.savedPosts, StringList, []);
    const liked = await readValidated(StorageKeys.likedPosts, StringList, []);
    if (saved.length > 0 || liked.length > 0) pushBack.add("reactions");
    return;
  }

  const saved: string[] = [];
  const liked: string[] = [];
  for (const row of rows) {
    const r = row as Record<string, unknown>;
    const id = str(r.post_id);
    if (id === "") continue;
    if (r.saved === true) saved.push(id);
    if (r.liked === true) liked.push(id);
  }

  await write(StorageKeys.savedPosts, saved);
  await write(StorageKeys.likedPosts, liked);
}

async function adoptSubscriptions(rows: unknown[], pushBack: Set<Target>): Promise<void> {
  if (rows.length === 0) {
    const local = await readValidated(StorageKeys.subscriptions, StringList, []);
    if (local.length > 0) pushBack.add("subscriptions");
    return;
  }

  await write(
    StorageKeys.subscriptions,
    rows
      .map((row) => str((row as Record<string, unknown>).university_id))
      .filter((id) => id !== ""),
  );
}

async function adoptDrafts(rows: unknown[], pushBack: Set<Target>): Promise<void> {
  if (rows.length === 0) {
    const local = await readValidated(StorageKeys.essayDrafts, LocalDrafts, {});
    if (Object.keys(local).length > 0) pushBack.add("drafts");
    return;
  }

  const drafts: Record<string, string> = {};
  for (const row of rows) {
    const r = row as Record<string, unknown>;
    const promptId = str(r.prompt_id);
    if (promptId !== "") drafts[promptId] = str(r.body);
  }

  await write(StorageKeys.essayDrafts, drafts);
}

/** Exported for the unit tests, which assert the key list stays in step. */
export const __syncedKeys = SYNCED_KEYS;

// Registering here rather than in a screen means there is no way to import the
// storage layer into a new feature and forget to wire up sync.
setWriteMirror(onLocalWrite);
