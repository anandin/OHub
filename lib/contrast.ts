/**
 * Contrast maths, so text on a colour the app does not control is still legible.
 *
 * University header colours come from `data/universities.ts` — twenty brand
 * colours, chosen by twenty marketing departments, ranging from `#000000` to
 * Waterloo's `#FFC72C`. The header used to set white text on all of them. On
 * that gold it measured **1.60:1**, which is not "low contrast", it is a school
 * name that a student cannot read.
 *
 * Picking per school by eye does not survive the next school being added, so
 * the choice is measured at render time instead.
 */

/** WCAG 2.1 relative luminance. */
export function relativeLuminance(hex: string): number {
  const rgb = parseHex(hex);
  if (rgb === null) return 0;

  const [r, g, b] = rgb.map((channel) => {
    const s = channel / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.1 contrast ratio, 1 to 21. Order of the arguments does not matter. */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * The better of two foregrounds on `background`.
 *
 * Defaults are the app's own near-black and near-white rather than pure
 * `#000`/`#fff`, which keeps a branded header looking like the rest of the app
 * instead of a system alert.
 */
export function readableOn(
  background: string,
  dark = "#1a1612",
  light = "#ffffff",
): string {
  return contrastRatio(background, dark) >= contrastRatio(background, light)
    ? dark
    : light;
}

/** True when the pairing clears WCAG AA for body text. */
export function meetsAA(foreground: string, background: string): boolean {
  return contrastRatio(foreground, background) >= 4.5;
}

/**
 * A brand colour used as *text* on one of the app's own surfaces, or a
 * fallback when it is not legible there.
 *
 * The follow control turns the university's colour into a label once the
 * student is following. Nine of the twenty brand colours are dark navies,
 * maroons and one flat `#000000` — on the dark theme's card they range from
 * hard to read to genuinely invisible. Brand fidelity is worth having when it
 * costs nothing and worth dropping when it costs the word.
 */
export function legibleBrand(
  brand: string,
  surface: string,
  fallback: string,
): string {
  return meetsAA(brand, surface) ? brand : fallback;
}

/** Accepts `#rgb` and `#rrggbb`. Returns null for anything else. */
function parseHex(hex: string): [number, number, number] | null {
  if (typeof hex !== "string") return null;
  const value = hex.trim().replace(/^#/, "");

  if (value.length === 3) {
    const [r, g, b] = value.split("");
    if (!r || !g || !b) return null;
    return parseHex(`${r}${r}${g}${g}${b}${b}`);
  }

  if (value.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(value)) return null;

  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}
