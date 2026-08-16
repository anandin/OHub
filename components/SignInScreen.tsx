import Feather from "@expo/vector-icons/Feather";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmailAuthForm } from "@/components/EmailAuthForm";
import { GoogleMark } from "@/components/GoogleMark";
import { TOUCH_TARGET, radius, space, type } from "@/constants/theme";
import type { Palette } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { usePalette } from "@/context/ThemeContext";
import { openExternalUrl } from "@/lib/safeLink";
import { useThemedStyles } from "@/lib/useThemedStyles";

const PRIVACY_URL = "https://o-hub-api-server.vercel.app/privacy.html";

/**
 * The sign-in screen.
 *
 * It says what the account is *for* before asking for it. A Grade 12 student
 * being asked to hand over a Google identity in exchange for an unexplained
 * "continue" button is right to close the tab, and this app is asking to hold
 * their marks and their OUAC reference number.
 *
 * Deliberately not a route. The gate in `app/_layout` renders this *instead of*
 * the navigator, so while there is no session there is no router to push a
 * protected screen onto — the protection is structural rather than a redirect
 * that has to win a race against the screen it is protecting. It also means
 * the URL is preserved, so signing in returns the student to the deep link
 * they arrived on.
 */
export function SignInScreen() {
  const c = usePalette();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { signInWithGoogle, error, deviceDataKept, forgetThisDevice } = useAuth();
  const [busy, setBusy] = useState(false);
  const [wiping, setWiping] = useState(false);

  async function handleSignIn() {
    if (busy) return;
    setBusy(true);
    await signInWithGoogle();
    // On success the browser navigates away and this component unmounts. If we
    // are still here, it failed — release the button so they can retry.
    setBusy(false);
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + space.xxl, paddingBottom: insets.bottom + space.xl },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.mark}>oHub</Text>
        <Text style={styles.eyebrow}>Ontario university applications</Text>
      </View>

      <Text style={styles.headline}>
        Your application, in one place — on every device you use.
      </Text>

      <Text style={styles.lede}>
        Sign in so your programme list, marks and deadlines follow you from the
        school library to your phone to the laptop at home.
      </Text>

      {error ? (
        <View
          style={styles.error}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          <Feather name="alert-circle" size={16} color={c.errorText} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {deviceDataKept ? (
        <View
          style={styles.warning}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          <Feather name="alert-triangle" size={16} color={c.warnText} />
          <View style={styles.warningBody}>
            <Text style={styles.warningText}>
              You signed out, but the last save to your account did not go
              through — so your work is still on this device rather than lost.
              Sign back in to finish saving it.
            </Text>
            <Pressable
              onPress={async () => {
                setWiping(true);
                await forgetThisDevice();
                setWiping(false);
              }}
              disabled={wiping}
              accessibilityRole="button"
              accessibilityLabel="Delete the copy of my data left on this device"
              accessibilityState={{ disabled: wiping, busy: wiping }}
              style={styles.warningAction}
            >
              <Text style={styles.warningActionText}>
                {wiping ? "Clearing…" : "Delete it from this device instead"}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <Pressable
        onPress={handleSignIn}
        disabled={busy}
        accessibilityRole="button"
        accessibilityLabel="Continue with Google"
        accessibilityState={{ disabled: busy, busy }}
        style={({ pressed }) => [
          styles.googleButton,
          pressed && styles.googleButtonPressed,
          busy && styles.googleButtonBusy,
        ]}
      >
        {busy ? (
          <ActivityIndicator size="small" color={c.ink} />
        ) : (
          <GoogleMark size={18} />
        )}
        <Text style={styles.googleLabel}>
          {busy ? "Opening Google…" : "Continue with Google"}
        </Text>
      </Pressable>

      <Text style={styles.fineprint}>
        oHub only receives your name and email address from Google. It cannot
        read your Gmail, Drive or calendar.
      </Text>

      {/* Google first because it is one tap and has nothing to forget, but not
          everyone has a Google account they want attached to their marks —
          plenty of students only have a school one their board can read. */}
      <View style={styles.divider}>
        <View style={styles.dividerRule} />
        <Text style={styles.dividerLabel}>or use an email address</Text>
        <View style={styles.dividerRule} />
      </View>

      <EmailAuthForm />

      <Text style={styles.reasonsHeading}>Why oHub asks for an account</Text>

      <View style={styles.reasons}>
        <Reason
          icon="refresh-cw"
          title="Nothing to re-enter"
          body="Add a programme on one device and it is there on the next one."
          c={c}
          styles={styles}
        />
        <Reason
          icon="shield"
          title="Stored in Canada"
          body="Your marks and OUAC reference live in a Canadian data centre, readable only by your account."
          c={c}
          styles={styles}
        />
        <Reason
          icon="trash-2"
          title="Delete it whenever"
          body="One control in Settings erases your account and everything in it. No email, no waiting."
          c={c}
          styles={styles}
        />
      </View>

      <Pressable
        onPress={() => openExternalUrl(PRIVACY_URL)}
        accessibilityRole="link"
        accessibilityLabel="Read what oHub stores and why"
        style={styles.privacyLink}
      >
        <Text style={styles.privacyLinkText}>What oHub stores, and why</Text>
        <Feather name="arrow-up-right" size={14} color={c.warnText} />
      </Pressable>
    </ScrollView>
  );
}

function Reason({
  icon,
  title,
  body,
  c,
  styles,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  title: string;
  body: string;
  c: Palette;
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <View style={styles.reason}>
      <View style={styles.reasonIcon}>
        <Feather name={icon} size={16} color={c.warnText} />
      </View>
      <View style={styles.reasonBody}>
        <Text style={styles.reasonTitle}>{title}</Text>
        <Text style={styles.reasonText}>{body}</Text>
      </View>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.paper },
    content: {
      paddingHorizontal: space.xl,
      gap: space.lg,
      maxWidth: 520,
      width: "100%",
      alignSelf: "center",
    },
    header: { gap: space.xs },
    mark: {
      ...type.title,
      color: c.ink,
      fontSize: 24,
    },
    eyebrow: { ...type.eyebrow, color: c.muted },
    headline: {
      ...type.display,
      color: c.ink,
      marginTop: space.md,
    },
    lede: { ...type.body, color: c.softInk },

    reasonsHeading: { ...type.eyebrow, color: c.muted, marginTop: space.md },
    reasons: { gap: space.lg },
    reason: { flexDirection: "row", gap: space.md, alignItems: "flex-start" },
    reasonIcon: {
      width: 32,
      height: 32,
      borderRadius: radius.md,
      backgroundColor: c.warnBg,
      alignItems: "center",
      justifyContent: "center",
    },
    reasonBody: { flex: 1, gap: 2 },
    reasonTitle: { ...type.heading, color: c.ink },
    reasonText: { ...type.bodySmall, color: c.softInk },

    error: {
      flexDirection: "row",
      gap: space.sm,
      alignItems: "flex-start",
      backgroundColor: c.errorBg,
      borderRadius: radius.md,
      padding: space.md,
    },
    errorText: { ...type.bodySmall, color: c.errorText, flex: 1 },

    warning: {
      flexDirection: "row",
      gap: space.sm,
      alignItems: "flex-start",
      backgroundColor: c.warnBg,
      borderRadius: radius.md,
      padding: space.md,
    },
    warningBody: { flex: 1, gap: space.xs },
    warningText: { ...type.bodySmall, color: c.warnText },
    warningAction: {
      minHeight: TOUCH_TARGET,
      justifyContent: "center",
    },
    warningActionText: {
      ...type.label,
      color: c.warnText,
      textDecorationLine: "underline",
    },

    googleButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: space.md,
      minHeight: TOUCH_TARGET + 6,
      borderRadius: radius.md,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.pillBorder,
      paddingHorizontal: space.lg,
      marginTop: space.sm,
    },
    googleButtonPressed: { backgroundColor: c.rule },
    googleButtonBusy: { opacity: 0.7 },
    googleLabel: { ...type.heading, color: c.ink },

    fineprint: { ...type.bodySmall, color: c.muted, textAlign: "center" },

    divider: {
      flexDirection: "row",
      alignItems: "center",
      gap: space.md,
      marginTop: space.sm,
    },
    dividerRule: { flex: 1, height: 1, backgroundColor: c.rule },
    dividerLabel: { ...type.bodySmall, color: c.muted },

    privacyLink: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: space.xs,
      minHeight: TOUCH_TARGET,
    },
    privacyLinkText: { ...type.label, color: c.warnText },
  });
