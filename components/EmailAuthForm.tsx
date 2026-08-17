import Feather from "@expo/vector-icons/Feather";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
  type TextInput as TextInputType,
} from "react-native";

import { MIN_PASSWORD, useAuth } from "@/context/AuthContext";
import { usePalette } from "@/context/ThemeContext";
import { useThemedStyles } from "@/lib/useThemedStyles";
import { makeAuthFormStyles } from "@/components/authFormStyles";

/**
 * `signin`  — email and password.
 * `signup`  — the same two fields, plus what makes a usable password.
 * `forgot`  — email only.
 * `sent`    — a confirmation or reset email is on its way. A terminal state on
 *             purpose: there is nothing to do here but go to the inbox, and a
 *             form still sitting there invites a second submission that only
 *             burns the send-rate limit.
 */
type Mode = "signin" | "signup" | "forgot" | "sent";

export function EmailAuthForm() {
  const c = usePalette();
  const styles = useThemedStyles(makeAuthFormStyles);
  const { signInWithEmail, signUpWithEmail, sendPasswordReset } = useAuth();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reveal, setReveal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  /** What the `sent` state should say — the two cases read differently. */
  const [sentKind, setSentKind] = useState<"confirm" | "reset">("confirm");

  const passwordField = useRef<TextInputType>(null);

  function go(next: Mode) {
    setMode(next);
    setProblem(null);
    if (next !== "signin" && next !== "signup") setPassword("");
  }

  async function submit() {
    if (busy) return;
    setBusy(true);
    setProblem(null);

    const result =
      mode === "forgot"
        ? await sendPasswordReset(email)
        : mode === "signup"
          ? await signUpWithEmail(email, password)
          : await signInWithEmail(email, password);

    if (!result.ok) {
      setProblem(result.message ?? "That did not work. Try again.");
      setBusy(false);
      return;
    }

    if (mode === "forgot") {
      setSentKind("reset");
      setPassword("");
      go("sent");
    } else if (result.needsConfirmation) {
      setSentKind("confirm");
      setPassword("");
      go("sent");
    }
    // A successful sign-in unmounts this screen via the gate; leaving `busy`
    // set stops a second submit landing in the gap before that happens.
    setBusy(mode === "signin" && result.ok);
  }

  if (mode === "sent") {
    return (
      <View style={styles.sentCard} accessibilityLiveRegion="polite">
        <Feather name="mail" size={20} color={c.successText} />
        <Text style={styles.sentTitle}>
          {sentKind === "confirm" ? "Check your email" : "If that address has an account…"}
        </Text>
        <Text style={styles.sentBody}>
          {sentKind === "confirm"
            ? `We sent a confirmation link to ${email.trim()}. Open it on this device, in this browser, and you are in. It can take a minute, and it often lands in spam.`
            : `We have sent a reset link to ${email.trim()}. We do not say whether an account exists — that would let anyone check who uses oHub.`}
        </Text>
        {sentKind === "confirm" ? (
          // Two things a student needs before they decide the mail is a scam
          // and bin it: who it is from, and that it will not look like us yet.
          <Text style={styles.sentFootnote}>
            It comes from &ldquo;Supabase Auth&rdquo; — that is oHub&rsquo;s
            sign-in provider, not a scam. And open it in this browser: the
            confirmation is tied to the one you signed up in.
          </Text>
        ) : null}

        <Pressable
          onPress={() => go("signin")}
          accessibilityRole="button"
          accessibilityLabel="Back to sign in"
          style={styles.textAction}
        >
          <Text style={styles.textActionLabel}>Back to sign in</Text>
        </Pressable>
      </View>
    );
  }

  const submitLabel =
    mode === "forgot"
      ? "Send a reset link"
      : mode === "signup"
        ? "Create account"
        : "Sign in";

  return (
    <View style={styles.form}>
      <View style={styles.field}>
        <Text style={styles.label}>
          Email
        </Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor={c.muted}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          inputMode="email"
          returnKeyType={mode === "forgot" ? "go" : "next"}
          onSubmitEditing={() =>
            mode === "forgot" ? void submit() : passwordField.current?.focus()
          }
          editable={!busy}
          accessibilityLabel="Email address"
        />
      </View>

      {mode !== "forgot" ? (
        <View style={styles.field}>
          <Text style={styles.label}>
            Password
          </Text>
          <View style={styles.passwordRow}>
            <TextInput
              ref={passwordField}
              style={[styles.input, styles.passwordInput]}
              value={password}
              onChangeText={setPassword}
              placeholder={mode === "signup" ? `At least ${MIN_PASSWORD} characters` : "Your password"}
              placeholderTextColor={c.muted}
              secureTextEntry={!reveal}
              autoCapitalize="none"
              autoCorrect={false}
              // Tells a password manager to offer a new strong password on
              // sign-up and the saved one on sign-in, rather than guessing.
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              textContentType={mode === "signup" ? "newPassword" : "password"}
              returnKeyType="go"
              onSubmitEditing={() => void submit()}
              editable={!busy}
              accessibilityLabel="Password"
            />
            <Pressable
              onPress={() => setReveal((r) => !r)}
              style={styles.revealBtn}
              accessibilityRole="button"
              accessibilityLabel={reveal ? "Hide password" : "Show password"}
              accessibilityState={{ checked: reveal }}
            >
              <Feather name={reveal ? "eye-off" : "eye"} size={16} color={c.muted} />
            </Pressable>
          </View>
          {mode === "signup" ? (
            <Text style={styles.hint}>
              At least {MIN_PASSWORD} characters. Three unrelated words are easier
              to remember and harder to guess than one word with a 3 in it.
            </Text>
          ) : null}
        </View>
      ) : (
        <Text style={styles.hint}>
          We will email you a link to set a new one.
        </Text>
      )}

      {problem ? (
        <View style={styles.problem} accessibilityRole="alert" accessibilityLiveRegion="polite">
          <Feather name="alert-circle" size={16} color={c.errorText} />
          <Text style={styles.problemText}>{problem}</Text>
        </View>
      ) : null}

      <Pressable
        onPress={() => void submit()}
        disabled={busy}
        accessibilityRole="button"
        accessibilityLabel={submitLabel}
        accessibilityState={{ disabled: busy, busy }}
        style={({ pressed }) => [
          styles.submit,
          pressed && styles.submitPressed,
          busy && styles.submitBusy,
        ]}
      >
        {busy ? <ActivityIndicator size="small" color={c.paper} /> : null}
        <Text style={styles.submitLabel}>{busy ? "Working…" : submitLabel}</Text>
      </Pressable>

      <View style={styles.switchRow}>
        {mode === "signin" ? (
          <>
            <Pressable
              onPress={() => go("signup")}
              accessibilityRole="button"
              accessibilityLabel="Create an account with email instead"
              style={styles.textAction}
            >
              <Text style={styles.textActionLabel}>Create an account</Text>
            </Pressable>
            <Pressable
              onPress={() => go("forgot")}
              accessibilityRole="button"
              accessibilityLabel="Reset a forgotten password"
              style={styles.textAction}
            >
              <Text style={styles.textActionLabel}>Forgot password?</Text>
            </Pressable>
          </>
        ) : (
          <Pressable
            onPress={() => go("signin")}
            accessibilityRole="button"
            accessibilityLabel="Back to sign in"
            style={styles.textAction}
          >
            <Text style={styles.textActionLabel}>
              {mode === "signup" ? "I already have an account" : "Back to sign in"}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
