import Feather from "@expo/vector-icons/Feather";
import type { Palette } from "@/constants/theme";
import { usePalette } from "@/context/ThemeContext";
import { useThemedStyles } from "@/lib/useThemedStyles";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApplications } from "@/context/ApplicationsContext";
import { useAuth } from "@/context/AuthContext";
import { useSavedPosts } from "@/context/SavedPostsContext";
import { useSubscriptions } from "@/context/SubscriptionsContext";
import {
  useTheme,
  type ThemePreference,
} from "@/context/ThemeContext";
import { useUser } from "@/context/UserContext";
import { maskOuacRef } from "@/lib/privacy";
import { openExternalUrl } from "@/lib/safeLink";
import { flushNow } from "@/lib/sync";
import { describeSync, useSyncStatus } from "@/lib/useSyncStatus";

const PRIVACY_URL = "https://o-hub-api-server.vercel.app/privacy.html";

const THEME_OPTIONS: {
  value: ThemePreference;
  label: string;
  icon: "smartphone" | "sun" | "moon";
}[] = [
  { value: "system", label: "System", icon: "smartphone" },
  { value: "light", label: "Light", icon: "sun" },
  { value: "dark", label: "Dark", icon: "moon" },
];

/**
 * Settings & privacy.
 *
 * oHub asks Grade 12 students for their name, school, OUAC reference number and
 * marks. Anything that collects that much about a person owes them a plain
 * answer to "what do you have on me, and how do I get rid of it?" — this screen
 * is that answer, and the delete control actually clears every key the app owns.
 */
export default function SettingsScreen() {
  const c = usePalette();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 20 : insets.top;

  const { profile, tasks, reset: resetUser } = useUser();
  const { applications, reset: resetApplications } = useApplications();
  const { subscribed, reset: resetSubscriptions } = useSubscriptions();
  const { savedPostIds, likedPostIds, reset: resetSaved } = useSavedPosts();
  const { preference, scheme, setPreference } = useTheme();
  const { accountName, user, signOut, deleteAccount } = useAuth();
  const sync = useSyncStatus();
  const [syncLabel, syncNeedsAttention] = describeSync(sync);

  /** Which destructive control is awaiting a second tap: none, one, or both. */
  const [confirming, setConfirming] = useState<"clear" | "delete" | null>(null);
  const [cleared, setCleared] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const stored = [
    {
      label: "Profile",
      detail: profile.name
        ? `${profile.name}, ${profile.school || "no school set"}`
        : "Nothing saved yet",
    },
    { label: "OUAC reference", detail: maskOuacRef(profile.ouacRef) },
    {
      label: "Marks entered",
      detail: `${profile.marks.filter(Boolean).length} of 6`,
    },
    { label: "Applications tracked", detail: `${applications.length}` },
    { label: "Universities followed", detail: `${subscribed.length}` },
    {
      label: "Posts saved / liked",
      detail: `${savedPostIds.length} saved · ${likedPostIds.length} liked`,
    },
    { label: "Tasks", detail: `${tasks.length}` },
  ];

  /**
   * Empties the account without deleting it.
   *
   * Resetting each provider writes an empty value, and every write is mirrored
   * to the server — so the flush below is what actually removes the rows. The
   * previous version of this control cleared local storage only, while telling
   * the student it had also cleared their account.
   */
  const handleClear = async () => {
    setBusy(true);
    setProblem(null);
    resetUser();
    resetApplications();
    resetSubscriptions();
    resetSaved();
    await flushNow();
    setBusy(false);
    setConfirming(null);
    setCleared(true);
  };

  // Signing out flips the gate, which unmounts this screen — so there is no
  // "after". Anything the student needs to be told (such as a device copy that
  // had to be kept because the final sync failed) is reported on the sign-in
  // screen, which is where they land.
  const handleSignOut = async () => {
    setBusy(true);
    setProblem(null);
    await signOut();
  };

  const handleDeleteAccount = async () => {
    setBusy(true);
    setProblem(null);
    const ok = await deleteAccount();
    setBusy(false);
    if (!ok) {
      setConfirming(null);
      setProblem(
        "Could not delete your account — we could not reach the server. Nothing was removed. Try again in a moment.",
      );
    }
    // On success the gate unmounts this screen and shows sign-in.
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: topInset }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="arrow-left" size={20} color={c.ink} />
        </Pressable>
        <View>
          <Text style={styles.eyebrow}>Settings</Text>
          <Text style={styles.title}>Privacy & data</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your account</Text>
        <View style={styles.accountRow}>
          <View style={styles.accountAvatar}>
            <Feather name="user" size={16} color={c.warnText} />
          </View>
          <View style={styles.accountBody}>
            <Text style={styles.accountName}>{accountName}</Text>
            <Text style={styles.accountEmail}>{user?.email ?? ""}</Text>
          </View>
        </View>

        <View
          style={styles.syncRow}
          accessibilityRole="text"
          accessibilityLiveRegion="polite"
          accessibilityLabel={syncLabel}
        >
          <Feather
            name={
              syncNeedsAttention
                ? "alert-triangle"
                : sync.state === "syncing"
                  ? "refresh-cw"
                  : "check-circle"
            }
            size={14}
            color={syncNeedsAttention ? c.warn : c.success}
          />
          <Text style={[styles.syncText, syncNeedsAttention && styles.syncTextWarn]}>
            {syncLabel}
          </Text>
        </View>

        <Pressable
          style={styles.linkBtn}
          onPress={() => void handleSignOut()}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel="Sign out and clear this device"
          accessibilityHint="Removes your data from this browser. It stays in your account."
          accessibilityState={{ disabled: busy }}
        >
          <Feather name="log-out" size={14} color={c.ink} />
          <Text style={styles.linkBtnText}>Sign out of this device</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Where your data lives</Text>
        <Text style={styles.body}>
          Your name, school, OUAC reference, marks, tracked applications and
          saved posts are stored in your oHub account, in a Canadian data
          region. They are also kept on this device so the app works offline.
        </Text>
        <Text style={styles.body}>
          Only your account can read your data. That is enforced by the database
          itself rather than by app code — a bug in oHub cannot show your grades
          to somebody else. It is never used for advertising, never sold, and
          never used to train a model.
        </Text>
        <Text style={styles.body}>
          On a shared or school computer, sign out when you are done. Signing
          out clears the copy held on that device.
        </Text>
        <Pressable
          style={styles.linkBtn}
          onPress={() => void openExternalUrl(PRIVACY_URL)}
          accessibilityRole="link"
          accessibilityLabel="Read the full privacy notice"
          accessibilityHint="Opens the privacy page in a new tab"
        >
          <Feather name="file-text" size={14} color={c.ink} />
          <Text style={styles.linkBtnText}>Read the full privacy notice</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>What is in your account</Text>
        {stored.map((row) => (
          <View key={row.label} style={styles.row}>
            <Text style={styles.rowLabel}>{row.label}</Text>
            <Text style={styles.rowValue}>{row.detail}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Appearance</Text>
        <Text style={styles.body}>
          oHub follows your device by default, so late-night reading is already
          dark if your phone is. Override it here if you&rsquo;d rather it
          didn&rsquo;t.
        </Text>
        <View
          style={styles.themeRow}
          accessibilityRole="radiogroup"
          accessibilityLabel="Appearance"
        >
          {THEME_OPTIONS.map((option) => {
            const active = preference === option.value;
            return (
              <Pressable
                key={option.value}
                style={[styles.themeOption, active && styles.themeOptionActive]}
                onPress={() => setPreference(option.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                accessibilityLabel={option.label}
                accessibilityHint={
                  option.value === "system"
                    ? `Currently showing ${scheme}`
                    : undefined
                }
              >
                <Feather
                  name={option.icon}
                  size={14}
                  color={active ? c.paper : c.softInk}
                />
                <Text
                  style={[
                    styles.themeOptionText,
                    active && styles.themeOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Check the source</Text>
        <Text style={styles.body}>
          Admission averages, deadlines and scholarship details in oHub are
          gathered from public sources and can go out of date. Always confirm
          against the official page before you rely on a date or a cutoff.
        </Text>
        <Pressable
          style={styles.linkBtn}
          onPress={() => void openExternalUrl("https://www.ouac.on.ca")}
          accessibilityRole="link"
          accessibilityLabel="Open OUAC, the official Ontario application centre"
          accessibilityHint="Opens ouac.on.ca in a new tab"
        >
          <Feather name="external-link" size={14} color={c.ink} />
          <Text style={styles.linkBtnText}>Open OUAC — the official source</Text>
        </Pressable>
      </View>

      <View style={[styles.card, styles.dangerCard]}>
        <Text style={styles.cardTitle}>Start over</Text>
        <Text style={styles.body}>
          Empties your profile, marks, tracked applications, followed
          universities, saved posts and tasks — everywhere, not just here. Your
          account stays, so you can begin a fresh list. This cannot be undone.
        </Text>

        {cleared ? (
          <View style={styles.doneRow} accessibilityLiveRegion="polite">
            <Feather name="check-circle" size={16} color={c.success} />
            <Text style={styles.doneText}>
              Cleared. oHub is back to a fresh start.
            </Text>
          </View>
        ) : confirming === "clear" ? (
          <View style={styles.confirmRow}>
            <Pressable
              style={[styles.dangerBtn, styles.dangerBtnFilled]}
              onPress={() => void handleClear()}
              disabled={busy}
              accessibilityRole="button"
              accessibilityLabel="Confirm — clear all my oHub data"
              accessibilityState={{ disabled: busy, busy }}
            >
              <Text style={styles.dangerBtnFilledText}>
                {busy ? "Clearing…" : "Yes, clear it all"}
              </Text>
            </Pressable>
            <Pressable
              style={styles.cancelBtn}
              onPress={() => setConfirming(null)}
              accessibilityRole="button"
              accessibilityLabel="Cancel clearing data"
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={styles.dangerBtn}
            onPress={() => setConfirming("clear")}
            accessibilityRole="button"
            accessibilityLabel="Clear all my oHub data"
          >
            <Feather name="rotate-ccw" size={14} color={c.warn} />
            <Text style={styles.dangerBtnText}>Clear my oHub data</Text>
          </Pressable>
        )}
      </View>

      <View style={[styles.card, styles.dangerCard]}>
        <Text style={styles.cardTitle}>Delete my account</Text>
        <Text style={styles.body}>
          Deletes the account itself along with everything in it, including the
          name and email address Google gave us. Immediate, permanent, and there
          is no backup to restore it from. You do not need to email anyone.
        </Text>

        {problem ? (
          <View
            style={styles.problemRow}
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
          >
            <Feather name="alert-circle" size={16} color={c.error} />
            <Text style={styles.problemText}>{problem}</Text>
          </View>
        ) : null}

        {confirming === "delete" ? (
          <View style={styles.confirmRow}>
            <Pressable
              style={[styles.dangerBtn, styles.dangerBtnFilled]}
              onPress={() => void handleDeleteAccount()}
              disabled={busy}
              accessibilityRole="button"
              accessibilityLabel="Confirm — permanently delete my oHub account"
              accessibilityState={{ disabled: busy, busy }}
            >
              <Text style={styles.dangerBtnFilledText}>
                {busy ? "Deleting…" : "Yes, delete my account"}
              </Text>
            </Pressable>
            <Pressable
              style={styles.cancelBtn}
              onPress={() => setConfirming(null)}
              accessibilityRole="button"
              accessibilityLabel="Cancel deleting my account"
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={styles.dangerBtn}
            onPress={() => setConfirming("delete")}
            accessibilityRole="button"
            accessibilityLabel="Permanently delete my oHub account"
          >
            <Feather name="trash-2" size={14} color={c.warn} />
            <Text style={styles.dangerBtnText}>Delete my account</Text>
          </Pressable>
        )}
      </View>

      <Text style={styles.footer}>oHub · Built for Ontario applicants</Text>
    </ScrollView>
  );
}

const makeStyles = (c: Palette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.paper },
  content: { paddingBottom: 80 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -10,
  },
  eyebrow: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: c.muted,
  },
  title: {
    fontFamily: "Fraunces_600SemiBold",
    fontSize: 26,
    color: c.ink,
    letterSpacing: -0.5,
  },
  card: {
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.rule,
    borderRadius: 14,
    padding: 18,
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 10,
  },
  dangerCard: { borderColor: c.pillBorder },
  themeRow: { flexDirection: "row", gap: 8 },
  themeOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: c.pillBorder,
  },
  themeOptionActive: { backgroundColor: c.ink, borderColor: c.ink },
  themeOptionText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: c.softInk,
  },
  themeOptionTextActive: { color: c.paper },
  cardTitle: {
    fontFamily: "Fraunces_600SemiBold",
    fontSize: 17,
    color: c.ink,
  },
  body: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 21,
    color: c.softInk,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: c.rule,
    gap: 16,
  },
  rowLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: c.ink,
    flexShrink: 1,
  },
  rowValue: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 13,
    color: c.muted,
    textAlign: "right",
    flexShrink: 1,
  },
  linkBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: c.pillBorder,
  },
  linkBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: c.ink,
  },
  accountRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  accountAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: c.warnBg,
    alignItems: "center",
    justifyContent: "center",
  },
  accountBody: { flex: 1, gap: 1 },
  accountName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: c.ink,
  },
  accountEmail: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: c.muted,
  },
  syncRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  syncText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: c.softInk,
    flexShrink: 1,
  },
  syncTextWarn: { color: c.warnText },
  problemRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  problemText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 19,
    color: c.errorText,
    flex: 1,
  },
  dangerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    // Was a hardcoded #e7cdbb, which stayed a pale tan on the dark surface.
    borderColor: c.pillBorder,
  },
  dangerBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: c.warn,
  },
  dangerBtnFilled: { backgroundColor: c.warn, borderColor: c.warn, flex: 1 },
  dangerBtnFilledText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: c.paper,
  },
  confirmRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  cancelBtn: {
    minHeight: 44,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: c.softInk,
  },
  doneRow: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 44 },
  doneText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: c.success,
    flexShrink: 1,
  },
  footer: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: c.muted,
    textAlign: "center",
    marginTop: 8,
  },
});
