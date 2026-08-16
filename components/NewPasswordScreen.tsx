import Feather from "@expo/vector-icons/Feather";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { makeAuthFormStyles } from "@/components/authFormStyles";
import { space, type } from "@/constants/theme";
import type { Palette } from "@/constants/theme";
import { MIN_PASSWORD, useAuth } from "@/context/AuthContext";
import { usePalette } from "@/context/ThemeContext";
import { useThemedStyles } from "@/lib/useThemedStyles";

/**
 * Where a password-reset link lands.
 *
 * The link opens a real session — that is how the password can be changed at
 * all — so without this screen the student would be dropped straight into
 * their marks with the old password still live and no way to change it. The
 * gate holds them here until they have actually set one.
 */
export function NewPasswordScreen() {
  const c = usePalette();
  const form = useThemedStyles(makeAuthFormStyles);
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { updatePassword, signOut, accountName } = useAuth();

  const [password, setPassword] = useState("");
  const [reveal, setReveal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  async function submit() {
    if (busy) return;
    setBusy(true);
    setProblem(null);

    const result = await updatePassword(password);
    if (!result.ok) {
      setProblem(result.message ?? "Could not set that password. Try again.");
      setBusy(false);
      return;
    }
    // On success the gate switches to the app and this screen unmounts.
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        form.form,
        styles.content,
        { paddingTop: insets.top + space.xxl, paddingBottom: insets.bottom + space.xl },
      ]}
    >
      <Text style={styles.mark}>oHub</Text>
      <Text style={styles.headline}>Choose a new password</Text>
      <Text style={styles.lede}>
        You are signed in as {accountName}. Set a password and oHub will open.
      </Text>

      <View style={form.field}>
        <Text style={form.label}>
          New password
        </Text>
        <View style={form.passwordRow}>
          <TextInput
            style={[form.input, form.passwordInput]}
            value={password}
            onChangeText={setPassword}
            placeholder={`At least ${MIN_PASSWORD} characters`}
            placeholderTextColor={c.muted}
            secureTextEntry={!reveal}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            textContentType="newPassword"
            autoFocus
            returnKeyType="go"
            onSubmitEditing={() => void submit()}
            editable={!busy}
            accessibilityLabel="New password"
          />
          <Pressable
            onPress={() => setReveal((r) => !r)}
            style={form.revealBtn}
            accessibilityRole="button"
            accessibilityLabel={reveal ? "Hide password" : "Show password"}
            accessibilityState={{ checked: reveal }}
          >
            <Feather name={reveal ? "eye-off" : "eye"} size={16} color={c.muted} />
          </Pressable>
        </View>
        <Text style={form.hint}>
          Three unrelated words are easier to remember and harder to guess than
          one word with a 3 in it.
        </Text>
      </View>

      {problem ? (
        <View style={form.problem} accessibilityRole="alert" accessibilityLiveRegion="polite">
          <Feather name="alert-circle" size={16} color={c.errorText} />
          <Text style={form.problemText}>{problem}</Text>
        </View>
      ) : null}

      <Pressable
        onPress={() => void submit()}
        disabled={busy}
        accessibilityRole="button"
        accessibilityLabel="Set my new password"
        accessibilityState={{ disabled: busy, busy }}
        style={({ pressed }) => [
          form.submit,
          pressed && form.submitPressed,
          busy && form.submitBusy,
        ]}
      >
        {busy ? <ActivityIndicator size="small" color={c.paper} /> : null}
        <Text style={form.submitLabel}>{busy ? "Saving…" : "Set password and continue"}</Text>
      </Pressable>

      {/* A reset link clicked by mistake needs a way out that is not the back
          button — the session is already open at this point. */}
      <Pressable
        onPress={() => void signOut()}
        accessibilityRole="button"
        accessibilityLabel="Cancel and sign out"
        style={form.textAction}
      >
        <Text style={form.textActionLabel}>I did not ask for this — sign out</Text>
      </Pressable>
    </ScrollView>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.paper },
    content: {
      paddingHorizontal: space.xl,
      maxWidth: 520,
      width: "100%",
      alignSelf: "center",
    },
    mark: { ...type.title, color: c.ink, fontSize: 24 },
    headline: { ...type.display, color: c.ink },
    lede: { ...type.body, color: c.softInk },
  });
