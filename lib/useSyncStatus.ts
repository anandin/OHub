import { useSyncExternalStore } from "react";

import { getSyncSnapshot, subscribeSync } from "@/lib/sync";
import type { SyncSnapshot } from "@/lib/sync";

/**
 * The current sync state, for screens that promise the student their work is
 * saved.
 *
 * "Saved" is a claim, and a spinner that always resolves to a tick whether or
 * not the write landed is the kind of lie that costs someone an application
 * deadline. This reports the actual state, including failure.
 */
export function useSyncStatus(): SyncSnapshot {
  return useSyncExternalStore(subscribeSync, getSyncSnapshot, getSyncSnapshot);
}

/** Human-readable sync state. Second element is true when it needs attention. */
export function describeSync(snapshot: SyncSnapshot, now = Date.now()): [string, boolean] {
  switch (snapshot.state) {
    case "syncing":
      return ["Saving to your account…", false];
    case "error":
      return ["Saved on this device — could not reach your account", true];
    case "off":
      return ["Not syncing", false];
    case "idle": {
      if (snapshot.lastSyncedAt === null) return ["Saved to your account", false];
      const seconds = Math.max(0, Math.round((now - snapshot.lastSyncedAt) / 1000));
      if (seconds < 60) return ["Saved to your account just now", false];
      const minutes = Math.round(seconds / 60);
      if (minutes < 60)
        return [`Saved to your account ${minutes} minute${minutes === 1 ? "" : "s"} ago`, false];
      const hours = Math.round(minutes / 60);
      return [`Saved to your account ${hours} hour${hours === 1 ? "" : "s"} ago`, false];
    }
  }
}
