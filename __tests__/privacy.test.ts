import { maskOuacRef, sanitizeText } from "@/lib/privacy";

describe("maskOuacRef", () => {
  it("keeps only the last four characters visible", () => {
    expect(maskOuacRef("2026-1093478")).toBe("••••-•••3478");
  });

  it("preserves the shape of the reference so it stays recognisable", () => {
    const masked = maskOuacRef("2026-1093478");
    expect(masked).toHaveLength("2026-1093478".length);
    expect(masked.endsWith("3478")).toBe(true);
    expect(masked).not.toContain("1093");
  });

  it.each(["", "   ", undefined, null])("says 'Not set' for %p", (value) => {
    expect(maskOuacRef(value as string | null | undefined)).toBe("Not set");
  });

  it("leaves very short values alone rather than masking to nothing", () => {
    expect(maskOuacRef("12")).toBe("12");
  });
});

describe("sanitizeText", () => {
  it("keeps ordinary names intact", () => {
    expect(sanitizeText("Adhvaith Anand", 80)).toBe("Adhvaith Anand");
  });

  it("trims surrounding whitespace", () => {
    expect(sanitizeText("  Bayview SS  ", 80)).toBe("Bayview SS");
  });

  it("enforces the length cap", () => {
    expect(sanitizeText("x".repeat(200), 10)).toHaveLength(10);
  });

  it("strips control characters", () => {
    expect(sanitizeText("Ana\u0000n\u0007d", 80)).toBe("Anand");
  });

  it("strips zero-width and bidi-override characters", () => {
    // A right-to-left override can make stored text render differently from
    // what was actually saved.
    expect(sanitizeText("safe\u202Ename\u200B", 80)).toBe("safename");
  });
});
