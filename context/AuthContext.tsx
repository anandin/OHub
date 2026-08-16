import type { Session, User } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Platform } from "react-native";

import { clearAll } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import { flushNow, getSyncSnapshot, hydrateFromRemote, stopSync } from "@/lib/sync";

/**
 * `loading`  — we do not yet know whether there is a session. Render nothing
 *              that depends on the answer; a flash of the sign-in screen for a
 *              student who is already signed in reads as being logged out.
 * `signedOut`— no session. Only the sign-in screen is reachable.
 * `syncing`  — signed in, pulling this student's rows down before the app
 *              mounts. Providers read local storage once on mount, so the pull
 *              has to finish first or the first paint shows an empty account.
 * `ready`    — signed in and hydrated.
 */
export type AuthStatus = "loading" | "signedOut" | "syncing" | "ready";

interface AuthContextValue {
  status: AuthStatus;
  session: Session | null;
  user: User | null;
  /** Google's display name, then the email local part. Never empty when signed in. */
  accountName: string;
  /** Set when the last sign-in attempt failed, for display on the sign-in screen. */
  error: string | null;
  /**
   * True when the last sign-out had to leave this student's data on the device
   * because a final sync failed. The sign-in screen says so and offers to wipe
   * it, rather than silently leaving marks in a school laptop's localStorage.
   */
  deviceDataKept: boolean;
  signInWithGoogle: () => Promise<void>;
  /**
   * Signs out and, when everything has reached the server, wipes this device.
   *
   * `keepLocal` is returned true when a final sync could not be completed: the
   * device copy is then the only copy, and deleting it to tidy up a shared
   * computer would destroy the student's work. Settings surfaces that so the
   * choice is theirs.
   */
  signOut: () => Promise<{ keepLocal: boolean }>;
  /** Wipes this device unconditionally. The escape hatch for the case above. */
  forgetThisDevice: () => Promise<void>;
  /** Deletes the account and every row belonging to it, server-side. */
  deleteAccount: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Where Google sends the student back to.
 *
 * On web this must be a path the SPA actually owns. `/` is the static landing
 * page and is served straight off the filesystem, so a code delivered there
 * would never reach the router. `/today` is rewritten to the app shell.
 */
function redirectTarget(): string {
  if (Platform.OS === "web") {
    return `${window.location.origin}/today`;
  }
  return Linking.createURL("/today");
}

function nameFor(user: User | null): string {
  if (!user) return "";
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const full = typeof meta?.full_name === "string" ? meta.full_name.trim() : "";
  if (full !== "") return full;
  const name = typeof meta?.name === "string" ? meta.name.trim() : "";
  if (name !== "") return name;
  return user.email?.split("@")[0] ?? "your account";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deviceDataKept, setDeviceDataKept] = useState(false);

  /** Guards against hydrating twice for the same user on token refresh. */
  const hydratedFor = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function adopt(next: Session | null) {
      if (!mounted) return;
      setSession(next);

      if (!next) {
        hydratedFor.current = null;
        setStatus("signedOut");
        return;
      }

      if (hydratedFor.current === next.user.id) {
        setStatus("ready");
        return;
      }

      setStatus("syncing");
      // A failed pull must not lock the student out of their own app. The
      // local cache is still there; the next write will retry the push.
      await hydrateFromRemote(next.user.id).catch(() => {});
      if (!mounted) return;
      hydratedFor.current = next.user.id;
      setStatus("ready");
    }

    supabase.auth
      .getSession()
      .then(({ data }) => adopt(data.session))
      .catch(() => {
        if (mounted) setStatus("signedOut");
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      void adopt(next);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectTarget(),
        // Students share computers. Without this Google silently reuses
        // whichever account is already signed in on the machine.
        queryParams: { prompt: "select_account" },
      },
    });

    if (authError) {
      setError(
        authError.message.toLowerCase().includes("provider")
          ? "Google sign-in is not switched on for this deployment yet."
          : "Could not reach Google. Check your connection and try again.",
      );
    }
  }, []);

  const signOut = useCallback(async () => {
    // Push anything still queued before the device copy goes away. Signing out
    // on a school computer must not be how a student loses an evening's notes.
    await flushNow().catch(() => {});
    const keepLocal = getSyncSnapshot().state === "error";

    stopSync();
    if (!keepLocal) await clearAll();
    await supabase.auth.signOut().catch(() => {});

    hydratedFor.current = null;
    setDeviceDataKept(keepLocal);
    setSession(null);
    setStatus("signedOut");
    return { keepLocal };
  }, []);

  const forgetThisDevice = useCallback(async () => {
    stopSync();
    await clearAll();
    setDeviceDataKept(false);
  }, []);

  const deleteAccount = useCallback(async () => {
    const { error: rpcError } = await supabase.rpc("delete_my_account");
    if (rpcError) return false;
    stopSync();
    await clearAll();
    await supabase.auth.signOut().catch(() => {});
    hydratedFor.current = null;
    setSession(null);
    setStatus("signedOut");
    return true;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      session,
      user: session?.user ?? null,
      accountName: nameFor(session?.user ?? null),
      error,
      deviceDataKept,
      signInWithGoogle,
      signOut,
      forgetThisDevice,
      deleteAccount,
    }),
    [
      status,
      session,
      error,
      deviceDataKept,
      signInWithGoogle,
      signOut,
      forgetThisDevice,
      deleteAccount,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
