import { useMemo } from "react";

import type { Palette } from "@/constants/theme";
import { usePalette } from "@/context/ThemeContext";

/**
 * Build a `StyleSheet` from the active palette.
 *
 * Screens declare `const makeStyles = (c: Palette) => StyleSheet.create({...})`
 * at module scope and call this inside the component. The result is memoised
 * per palette, so switching theme rebuilds each sheet exactly once rather than
 * on every render — which matters on the programs list, where a thousand rows
 * share one sheet.
 */
export function useThemedStyles<T>(factory: (palette: Palette) => T): T {
  const palette = usePalette();
  return useMemo(() => factory(palette), [factory, palette]);
}
