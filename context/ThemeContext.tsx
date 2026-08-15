import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Appearance, Platform, useColorScheme } from "react-native";
import { z } from "zod";

import { dark, light, type Palette } from "@/constants/theme";
import { StorageKeys, readValidated, write } from "@/lib/storage";

/**
 * Theme resolution.
 *
 * Students use oHub late at night — that is the whole reason this exists, and
 * why "system" is the default rather than a hardcoded light mode. A student
 * whose phone is already in dark mode should not get a page of warm paper at
 * 1am, and should not have to go and find a setting to fix it.
 *
 * The manual override is still worth having: system-level dark mode is
 * all-or-nothing, and people legitimately want one app to differ.
 */
export type ThemePreference = "system" | "light" | "dark";
export type ResolvedScheme = "light" | "dark";

const PreferenceSchema = z.enum(["system", "light", "dark"]);

interface ThemeContextValue {
  /** Active colours. Pass to `useThemedStyles` or read directly. */
  palette: Palette;
  /** What is actually being shown, after resolving "system". */
  scheme: ResolvedScheme;
  /** What the student chose. */
  preference: ThemePreference;
  setPreference: (next: ThemePreference) => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Tell the browser which scheme is active.
 *
 * `color-scheme` is what makes form controls, scrollbars and the space beyond
 * the page background follow the theme. Without it a dark page keeps white
 * scrollbars and a white overscroll gutter, which looks broken.
 */
function syncWebDocument(scheme: ResolvedScheme) {
  if (Platform.OS !== "web" || typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-theme", scheme);
  root.style.colorScheme = scheme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    readValidated(StorageKeys.themePreference, PreferenceSchema, "system")
      .then((stored) => {
        if (mounted) setPreferenceState(stored);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const scheme: ResolvedScheme =
    preference === "system" ? (systemScheme === "dark" ? "dark" : "light") : preference;

  useEffect(() => {
    syncWebDocument(scheme);
  }, [scheme]);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    void write(StorageKeys.themePreference, next);
    // Keeps native modals and system UI in step with an explicit override.
    if (Platform.OS !== "web") {
      Appearance.setColorScheme(next === "system" ? null : next);
    }
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      palette: scheme === "dark" ? dark : light,
      scheme,
      preference,
      setPreference,
      isLoading,
    }),
    [scheme, preference, setPreference, isLoading],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

/** Shorthand for the common case of only needing the colours. */
export function usePalette(): Palette {
  return useTheme().palette;
}
