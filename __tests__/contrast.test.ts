import { dark, light } from "@/constants/theme";
import { ONTARIO_UNIVERSITIES } from "@/data/universities";
import { contrastRatio, legibleBrand, meetsAA, readableOn } from "@/lib/contrast";

describe("contrast maths", () => {
  it("matches the WCAG reference values at the extremes", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#ffffff", "#ffffff")).toBeCloseTo(1, 5);
  });

  it("is symmetric", () => {
    expect(contrastRatio("#1a1612", "#f5f1e8")).toBeCloseTo(
      contrastRatio("#f5f1e8", "#1a1612"),
      10,
    );
  });

  it("accepts shorthand hex", () => {
    expect(contrastRatio("#fff", "#000")).toBeCloseTo(21, 5);
  });

  it("does not throw on a malformed colour", () => {
    expect(() => contrastRatio("not-a-colour", "#fff")).not.toThrow();
  });
});

describe("text on a university's brand colour", () => {
  it("gives every brand colour a foreground that clears AA", () => {
    const failures = ONTARIO_UNIVERSITIES.map((u) => {
      const fg = readableOn(u.color);
      return { id: u.id, color: u.color, ratio: contrastRatio(fg, u.color) };
    }).filter((r) => r.ratio < 4.5);

    expect(failures).toEqual([]);
  });

  it("picks dark text on Waterloo's gold, which was the bug", () => {
    // White on #FFC72C is 1.60:1 — the school name was effectively unreadable.
    expect(contrastRatio("#ffffff", "#FFC72C")).toBeLessThan(2);
    expect(readableOn("#FFC72C")).toBe("#1a1612");
    expect(meetsAA(readableOn("#FFC72C"), "#FFC72C")).toBe(true);
  });

  it("still picks white on the dark navies and maroons", () => {
    expect(readableOn("#002452")).toBe("#ffffff");
    expect(readableOn("#7A003C")).toBe("#ffffff");
    expect(readableOn("#000000")).toBe("#ffffff");
  });
});

describe("a brand colour used as text on the app's own surface", () => {
  it("falls back when the brand colour is unreadable on the dark card", () => {
    // A black brand colour on a near-black card is not a styling nicety.
    expect(legibleBrand("#000000", dark.card, dark.ink)).toBe(dark.ink);
    expect(legibleBrand("#002452", dark.card, dark.ink)).toBe(dark.ink);
  });

  it("keeps the brand colour when it is legible", () => {
    expect(legibleBrand("#FFC72C", dark.card, dark.ink)).toBe("#FFC72C");
    expect(legibleBrand("#7A003C", light.card, light.ink)).toBe("#7A003C");
  });

  it("leaves no university illegible in either theme", () => {
    for (const palette of [light, dark]) {
      const failures = ONTARIO_UNIVERSITIES.map((u) => ({
        id: u.id,
        ratio: contrastRatio(
          legibleBrand(u.color, palette.card, palette.ink),
          palette.card,
        ),
      })).filter((r) => r.ratio < 4.5);

      expect(failures).toEqual([]);
    }
  });
});

describe("the palette's own new token", () => {
  it("carries body text at AA on both themes", () => {
    expect(contrastRatio(light.softInk, light.paperAlt)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(dark.softInk, dark.paperAlt)).toBeGreaterThanOrEqual(4.5);
  });
});
