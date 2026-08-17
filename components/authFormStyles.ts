import { StyleSheet } from "react-native";

import { TOUCH_TARGET, radius, space, type } from "@/constants/theme";
import type { Palette } from "@/constants/theme";

/**
 * Shared by the email form and the set-a-new-password screen, which are the
 * same three controls in a different order. Kept in its own module so both can
 * import it without one screen depending on the other.
 */
export const makeAuthFormStyles = (c: Palette) =>
  StyleSheet.create({
    form: { gap: space.md },

    field: { gap: space.xs },
    label: { ...type.label, color: c.ink },
    input: {
      ...type.body,
      color: c.ink,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.pillBorder,
      borderRadius: radius.md,
      paddingHorizontal: space.md,
      // Height rather than vertical padding: a text input that grows with its
      // font size drifts out of step with the button beside it.
      minHeight: TOUCH_TARGET + 4,
    },
    passwordRow: { position: "relative", justifyContent: "center" },
    // Room for the reveal control, so a long password never runs under it.
    passwordInput: { paddingRight: TOUCH_TARGET + space.sm },
    revealBtn: {
      position: "absolute",
      right: 0,
      width: TOUCH_TARGET,
      height: TOUCH_TARGET,
      alignItems: "center",
      justifyContent: "center",
    },
    hint: { ...type.bodySmall, color: c.muted },

    problem: {
      flexDirection: "row",
      gap: space.sm,
      alignItems: "flex-start",
      backgroundColor: c.errorBg,
      borderRadius: radius.md,
      padding: space.md,
    },
    problemText: { ...type.bodySmall, color: c.errorText, flex: 1 },

    submit: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: space.sm,
      minHeight: TOUCH_TARGET + 6,
      borderRadius: radius.md,
      backgroundColor: c.ink,
      paddingHorizontal: space.lg,
    },
    submitPressed: { opacity: 0.85 },
    submitBusy: { opacity: 0.7 },
    submitLabel: { ...type.heading, color: c.paper },

    switchRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
    },
    textAction: { minHeight: TOUCH_TARGET, justifyContent: "center" },
    textActionLabel: { ...type.label, color: c.warnText },

    sentCard: {
      gap: space.sm,
      backgroundColor: c.successBg,
      borderRadius: radius.md,
      padding: space.lg,
      alignItems: "flex-start",
    },
    sentTitle: { ...type.heading, color: c.successText },
    sentBody: { ...type.bodySmall, color: c.successText },
    sentFootnote: { ...type.bodySmall, color: c.successText, opacity: 0.85 },
  });
