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
export type AuthStatus =
  | "loading"
  | "signedOut"
  | "syncing"
  | "ready"
  /**
   * Arrived from a password-reset link. There *is* a session — that is how the
   * new password can be set — but the app stays behind a "choose a password"
   * screen until they do. Dropping someone straight into their marks because
   * they clicked a link in their inbox is not the same as signing in.
   */
  | "recovery";

/** Shortest password the sign-up form accepts. Also set on the server. */
export const MIN_PASSWORD = 10;

export interface AuthResult {
  ok: boolean;
  /** Set when `ok` is false. Already written for a student to read. */
  message?: string;
  /**
   * Set when the account was created but needs the emailed link clicked first.
   * There is no session yet; the screen has to say so rather than hang.
   */
  needsConfirmation?: boolean;
}

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
  signInWithEmail: (email: string, password: string) => Promise<AuthResult>;
  signUpWithEmail: (email: string, password: string) => Promise<AuthResult>;
  /** Always reports success — see the comment on the implementation. */
  sendPasswordReset: (email: string) => Promise<AuthResult>;
  /** Sets a new password for the session opened by a reset link. */
  updatePassword: (password: string) => Promise<AuthResult>;
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

/**
 * Turn a Supabase auth error into something a 17-year-old can act on.
 *
 * The raw messages are written for developers ("Invalid login credentials",
 * "AuthApiError: over_email_send_rate_limit") and some of them leak more than
 * they should — telling an unauthenticated visitor whether an address has an
 * account here is an account-enumeration oracle, and this app's users are
 * minors.
 */
function readableAuthError(message: string, status?: number): string {
  const text = message.toLowerCase();

  if (text.includes("invalid login credentials")) {
    return "That email and password do not match an account. Check both, or reset your password.";
  }
  if (text.includes("email not confirmed")) {
    return "Confirm your email first — check your inbox for the link we sent.";
  }
  if (text.includes("rate limit") || status === 429) {
    return "Too many attempts. Wait a minute and try again.";
  }
  if (text.includes("password")) {
    return `Choose a password of at least ${MIN_PASSWORD} characters.`;
  }
  if (text.includes("email") && text.includes("invalid")) {
    return "That does not look like an email address.";
  }
  if (text.includes("provider") && text.includes("not enabled")) {
    return "That sign-in method is not switched on for this deployment yet.";
  }
  if (text.includes("failed to fetch") || text.includes("network")) {
    return "Could not reach oHub. Check your connection and try again.";
  }
  return "Something went wrong signing you in. Try again in a moment.";
}

/** Cheap sanity check. The server is the real validator. */
function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
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
  /**
   * Latched by the `PASSWORD_RECOVERY` event and cleared once a new password
   * is set. A ref as well as state because `adopt` runs from a subscription
   * callback and would otherwise read a stale closure.
   */
  const recovering = useRef(false);

  useEffect(() => {
    let mounted = true;

    async function adopt(next: Session | null) {
      if (!mounted) return;
      setSession(next);

      if (!next) {
        hydratedFor.current = null;
        recovering.current = false;
        setStatus("signedOut");
        return;
      }

      // A reset link opens a real session. Hold it at the password screen
      // rather than treating a click in an inbox as a sign-in.
      if (recovering.current) {
        setStatus("recovery");
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

    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      if (event === "PASSWORD_RECOVERY") recovering.current = true;
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

  const signInWithEmail = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      setError(null);
      if (!looksLikeEmail(email)) {
        return { ok: false, message: "That does not look like an email address." };
      }

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (authError) {
        return { ok: false, message: readableAuthError(authError.message, authError.status) };
      }
      // `onAuthStateChange` takes it from here.
      return { ok: true };
    },
    [],
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      setError(null);
      if (!looksLikeEmail(email)) {
        return { ok: false, message: "That does not look like an email address." };
      }
      if (password.length < MIN_PASSWORD) {
        return {
          ok: false,
          message: `Use at least ${MIN_PASSWORD} characters. A short phrase you will remember beats a clever short one.`,
        };
      }

      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { emailRedirectTo: redirectTarget() },
      });

      if (authError) {
        return { ok: false, message: readableAuthError(authError.message, authError.status) };
      }

      // Supabase deliberately returns a decoy user with no identities when the
      // address is already registered, so that this endpoint cannot be used to
      // discover who has an account. Treating that as success is the point:
      // the real owner gets an email, and a stranger learns nothing.
      const alreadyRegistered = (data.user?.identities?.length ?? 0) === 0;

      if (data.session === null || alreadyRegistered) {
        return { ok: true, needsConfirmation: true };
      }
      return { ok: true };
    },
    [],
  );

  const sendPasswordReset = useCallback(
    async (email: string): Promise<AuthResult> => {
      setError(null);
      if (!looksLikeEmail(email)) {
        return { ok: false, message: "That does not look like an email address." };
      }

      const { error: authError } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo: redirectTarget() },
      );

      // Rate limiting is worth surfacing; "no such account" is not. Reporting
      // the latter would turn this form into a way of asking oHub whether a
      // given classmate has an account.
      if (authError && (authError.status === 429 || /rate limit/i.test(authError.message))) {
        return { ok: false, message: readableAuthError(authError.message, authError.status) };
      }
      return { ok: true };
    },
    [],
  );

  const updatePassword = useCallback(
    async (password: string): Promise<AuthResult> => {
      if (password.length < MIN_PASSWORD) {
        return { ok: false, message: `Use at least ${MIN_PASSWORD} characters.` };
      }

      const { error: authError } = await supabase.auth.updateUser({ password });
      if (authError) {
        return { ok: false, message: readableAuthError(authError.message, authError.status) };
      }

      // Recovery is over; let the normal sign-in path hydrate and open the app.
      recovering.current = false;
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setStatus("syncing");
        await hydrateFromRemote(data.session.user.id).catch(() => {});
        hydratedFor.current = data.session.user.id;
        setStatus("ready");
      }
      return { ok: true };
    },
    [],
  );

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
      signInWithEmail,
      signUpWithEmail,
      sendPasswordReset,
      updatePassword,
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
      signInWithEmail,
      signUpWithEmail,
      sendPasswordReset,
      updatePassword,
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
