import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ZodTypeDef, ZodType } from "zod";

/**
 * A schema that accepts `unknown` input and produces `T`.
 *
 * Declaring the input side as `unknown` matters: schemas using `.catch()` have
 * an `unknown` input type, and the default `ZodType<T>` (input = output) would
 * make TypeScript infer `T` from the *input* side and hand callers back
 * `unknown`-shaped data.
 */
type Schema<T> = ZodType<T, ZodTypeDef, unknown>;

/**
 * Validated persistence layer.
 *
 * On web, AsyncStorage is `localStorage` — a store the user, any browser
 * extension, and any successful XSS can write to. Reading it back with a bare
 * `JSON.parse` and asserting a TypeScript type is a lie: the value is `unknown`
 * until it has been checked at runtime.
 *
 * Every read goes through a Zod schema here, so a corrupted or hostile value
 * degrades to the documented default instead of crashing a screen or smuggling
 * an unexpected shape (including `__proto__`) into React state.
 */

/** Keys are centralised so they can't drift between reader and writer. */
export const StorageKeys = {
  applications: "@ohub_applications",
  savedPosts: "@ohub_saved_posts",
  likedPosts: "@ohub_liked_posts",
  subscriptions: "@ohub_subscriptions",
  profile: "@ohub_user_profile",
  tasksDone: "@ohub_tasks_done",
  tasksList: "@ohub_tasks_list",
  lastRefresh: "@ohub_last_refresh",
  extraPosts: "@ohub_extra_posts",
} as const;

export type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys];

/** Keys written by the pre-1.0 "unihub" builds, migrated on first read. */
const LEGACY_KEYS: Record<StorageKey, string> = {
  [StorageKeys.applications]: "@unihub_applications",
  [StorageKeys.savedPosts]: "@unihub_saved_posts",
  [StorageKeys.likedPosts]: "@unihub_liked_posts",
  [StorageKeys.subscriptions]: "@unihub_subscriptions",
  [StorageKeys.profile]: "@unihub_user_profile",
  [StorageKeys.tasksDone]: "@unihub_tasks_done",
  [StorageKeys.tasksList]: "@unihub_tasks_list",
  [StorageKeys.lastRefresh]: "@unihub_last_refresh",
  [StorageKeys.extraPosts]: "@unihub_extra_posts",
};

/**
 * Keys that must never reach `JSON.parse`'d objects we spread into state.
 * `JSON.parse` itself does not pollute prototypes, but spreading a parsed
 * object that carries these keys into a fresh object can, depending on the
 * downstream code path. Stripping them is cheap and unconditional.
 */
const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);

function stripUnsafeKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripUnsafeKeys);
  if (value === null || typeof value !== "object") return value;

  const out: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (FORBIDDEN_KEYS.has(key)) continue;
    out[key] = stripUnsafeKeys(entry);
  }
  return out;
}

/**
 * Read and validate a persisted value.
 *
 * Returns `fallback` when the key is absent, the JSON is malformed, or the
 * value fails its schema. A value that fails validation is deleted so the app
 * cannot get stuck rejecting the same bad record on every launch.
 */
export async function readValidated<T>(
  key: StorageKey,
  schema: Schema<T>,
  fallback: T,
): Promise<T> {
  let raw: string | null = null;

  try {
    raw = await AsyncStorage.getItem(key);
    if (raw === null) {
      // One-time migration from the pre-rename key.
      const legacy = LEGACY_KEYS[key];
      if (legacy) {
        raw = await AsyncStorage.getItem(legacy);
        if (raw !== null) {
          await AsyncStorage.setItem(key, raw);
          await AsyncStorage.removeItem(legacy);
        }
      }
    }
  } catch {
    // Storage unavailable (Safari private mode, quota, disabled cookies).
    return fallback;
  }

  if (raw === null) return fallback;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    void remove(key);
    return fallback;
  }

  const result = schema.safeParse(stripUnsafeKeys(parsed));
  if (!result.success) {
    void remove(key);
    return fallback;
  }

  return result.data;
}

/**
 * Write a value. Never throws — a full or unavailable store degrades to
 * in-memory-only state rather than taking a screen down with it.
 */
export async function write(key: StorageKey, value: unknown): Promise<boolean> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export async function remove(key: StorageKey): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

/** Clear every oHub-owned key. Backs the "Erase my data" control in Settings. */
export async function clearAll(): Promise<void> {
  const keys = Object.values(StorageKeys) as StorageKey[];
  const legacy = Object.values(LEGACY_KEYS);
  try {
    await AsyncStorage.multiRemove([...keys, ...legacy]);
  } catch {
    await Promise.all(keys.map((key) => remove(key)));
  }
}
