/**
 * oHub Editorial — the design system.
 *
 * ## Why it looks like this
 *
 * The reader is a Grade 12 student in Ontario, usually on a phone, usually at
 * night, deciding where to spend the next four years of their life. They are
 * anxious and time-pressured, and the app shows them admission averages and
 * deadlines — facts with real consequences.
 *
 * That rules out the default startup look. Saturated gradients, urgent reds and
 * gamified progress rings add pressure to someone who already has plenty, and
 * they make a reference tool look like a product trying to sell something.
 *
 * So: warm paper, a serif for headlines, generous line height, and a single
 * restrained accent. It reads like a well-made almanac rather than a dashboard.
 * Adhvaith chose this direction and it was the right call; this module keeps it
 * and fixes what was failing.
 *
 * ## What changed, and why
 *
 * The palette was measured against WCAG 2.1 rather than eyeballed. Four tokens
 * failed AA for body text and are corrected here — `muted` most importantly,
 * because it carries nearly all secondary text in the app (timestamps, course
 * codes, captions, help text):
 *
 *   token      before            after             on paper
 *   muted      #8b7e62  3.54:1   #6f6449  5.18:1   FAIL   -> AA
 *   success    #15803d  4.45:1   #12652f  6.36:1   FAIL   -> AA
 *   error      #dc2626  4.28:1   #b91c1c  5.74:1   FAIL   -> AA
 *   warn       #c2410c  4.59:1   #b03a09  5.39:1   AA     -> AA (more headroom)
 *
 * Every ratio quoted below is measured against the surface named beside it.
 */

/** Light theme — the default. Ratios are against `paper` unless noted. */
export const light = {
  /** Page background. Warm off-white; less glare than pure #fff at night. */
  paper: '#f5f1e8',
  /** Raised surface: cards, sheets, the tab bar. */
  card: '#fbf8f1',
  /**
   * Recessed surface, one step *down* from paper: tag chips, inset rows,
   * filter bars. Non-text; `softInk` on it measures 7.10:1.
   */
  paperAlt: '#ede8dc',
  /** Primary text. 15.96:1 — AAA. */
  ink: '#1a1612',
  /** Secondary text: body copy, descriptions. 7.53:1 — AAA. */
  softInk: '#5c4a2f',
  /** Tertiary text: timestamps, captions, hints. 5.18:1 — AA. */
  muted: '#6f6449',
  /** Hairline dividers and card borders. Non-text; no ratio required. */
  rule: '#e8e0cf',
  /** Border for pills and chips. Non-text. */
  pillBorder: '#d4c9b0',

  /** The single accent. Deadlines, primary actions. 5.39:1 — AA. */
  warn: '#b03a09',
  /** Tint behind accent content. */
  warnBg: '#fef3e2',
  /** Accent text on `warnBg`. 6.48:1 — AA. */
  warnText: '#9a3412',
  warnDark: '#7c4a03',

  /** Positive state: offers, co-op, eligibility. 6.36:1 — AA. */
  success: '#12652f',
  successBg: '#ecfdf5',
  /** Success text on `successBg`. 8.08:1 — AAA. */
  successText: '#14532d',

  /** Destructive/blocking state. 5.74:1 — AA. */
  error: '#b91c1c',
  errorBg: '#fef2f2',
  errorText: '#991b1b',

  amber: '#fef3c7',
  amberBorder: '#fbbf24',
  amberText: '#7c4a03',
} as const;

/**
 * Dark theme.
 *
 * Not an inversion — an inverted warm palette goes muddy. This is the same
 * editorial idea rendered on near-black warm brown, keeping the paper feeling
 * without the glare. Ratios are against `paper` (the dark background).
 */
export const dark = {
  /** 16.40:1 for `ink` — AAA. */
  paper: '#14110d',
  card: '#1e1a14',
  /** Recessed surface. `softInk` on it measures 11.02:1 — AAA. */
  paperAlt: '#1a1710',
  /** Primary text. 16.40:1 — AAA. */
  ink: '#f4efe3',
  /** Secondary text. 11.71:1 — AAA. */
  softInk: '#d6cbb4',
  /** Tertiary text. 6.82:1 — AA. */
  muted: '#a99a7d',
  rule: '#332c22',
  pillBorder: '#4a4034',

  /** Accent, lifted for dark surfaces. 8.32:1 — AAA. */
  warn: '#fb923c',
  warnBg: '#2a1a0e',
  warnText: '#fdba74',
  warnDark: '#fed7aa',

  /** 10.80:1 — AAA. */
  success: '#4ade80',
  successBg: '#0f2418',
  successText: '#86efac',

  /** 6.80:1 — AA. */
  error: '#f87171',
  errorBg: '#2a1414',
  errorText: '#fca5a5',

  amber: '#2a2410',
  amberBorder: '#a16207',
  amberText: '#fde68a',
} as const;

/**
 * Widened so `light` and `dark` are interchangeable. Without this, `as const`
 * gives each token a literal type and the two palettes are incompatible.
 */
export type Palette = { readonly [K in keyof typeof light]: string };

/**
 * The active palette.
 *
 * Exported as a plain object rather than through a hook so the ~1,400 existing
 * `StyleSheet.create` calls keep working unchanged. Runtime theme switching
 * needs those styles to become functions of the palette; the tokens above are
 * the prerequisite for that and the screens can be migrated incrementally.
 */
export const ED = light;

/**
 * Type scale. Fraunces for headlines, Inter for interface text, JetBrains Mono
 * for anything a student might compare digit by digit — marks, averages,
 * OUAC codes and reference numbers, where tabular figures prevent misreading.
 */
export const type = {
  display: { fontFamily: 'Fraunces_600SemiBold', fontSize: 30, lineHeight: 36, letterSpacing: -0.6 },
  title: { fontFamily: 'Fraunces_600SemiBold', fontSize: 22, lineHeight: 28, letterSpacing: -0.4 },
  heading: { fontFamily: 'Inter_600SemiBold', fontSize: 16, lineHeight: 22 },
  body: { fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 22 },
  bodySmall: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19 },
  label: { fontFamily: 'Inter_500Medium', fontSize: 13, lineHeight: 18 },
  /** Uppercase section markers. Needs the letter-spacing to stay readable. */
  eyebrow: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
  numeric: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 14, lineHeight: 20 },
} as const;

/** 4px base. Keeps vertical rhythm consistent across screens. */
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = { sm: 6, md: 10, lg: 14, pill: 999 } as const;

/**
 * Minimum interactive size. WCAG 2.2 Target Size (Minimum) asks for 24x24;
 * 44x44 is the platform guidance from both Apple and Google and is what this
 * app uses, because its users are tapping quickly on a phone.
 */
export const TOUCH_TARGET = 44;
