import {
  classifyTier,
  computeAverage,
  formatAverage,
  parseAverageCutoff,
} from "@/lib/admissions";

describe("parseAverageCutoff", () => {
  it.each([
    ["87%+", 87],
    ["90-95%", 90],
    ["low 80s", 80],
    ["Mid-90s", 90],
    ["95", 95],
  ])("reads %s as %i", (input, expected) => {
    expect(parseAverageCutoff(input)).toBe(expected);
  });

  it.each(["", "N/A", "varies", "see program page", undefined, null])(
    "returns null for %p instead of inventing a cutoff",
    (input) => {
      expect(parseAverageCutoff(input as string | null | undefined)).toBeNull();
    },
  );

  it("rejects out-of-range numbers", () => {
    expect(parseAverageCutoff("120%")).toBeNull();
    expect(parseAverageCutoff("in the 40s")).toBeNull();
  });
});

describe("classifyTier", () => {
  it("returns unknown when the student has not entered marks", () => {
    // The regression this guards: a null average used to arithmetic to 0 and
    // label every program a confident "Reach".
    expect(classifyTier("moderate", "80%", null)).toBe("unknown");
    expect(classifyTier("extreme", "95%", null)).toBe("unknown");
  });

  it("calls extreme programs a reach regardless of average", () => {
    expect(classifyTier("extreme", "80%", 99)).toBe("reach");
  });

  it("calls a program well below the student's average a safety", () => {
    expect(classifyTier("moderate", "75%", 95)).toBe("safety");
  });

  it("calls a program near the cutoff a target", () => {
    expect(classifyTier("moderate", "90%", 92)).toBe("target");
    expect(classifyTier("moderate", "90%", 89)).toBe("target");
  });

  it("calls a program clearly above the student's average a reach", () => {
    expect(classifyTier("moderate", "95%", 82)).toBe("reach");
  });

  it("treats very_high as a reach unless the student is comfortably clear", () => {
    expect(classifyTier("very_high", "90%", 91)).toBe("reach");
    expect(classifyTier("very_high", "90%", 93)).toBe("target");
  });

  it("falls back to competitiveness when no cutoff is published", () => {
    expect(classifyTier("extreme", "varies", 95)).toBe("reach");
    expect(classifyTier("high", "varies", 95)).toBe("target");
    expect(classifyTier("moderate", "varies", 95)).toBe("safety");
  });
});

describe("computeAverage", () => {
  it("averages the marks entered", () => {
    expect(computeAverage(["90", "80", "70"])).toBe(80);
  });

  it("rounds to one decimal place", () => {
    expect(computeAverage(["95", "94", "93", "91", "90", "92"])).toBe(92.5);
  });

  it("ignores blanks and partially filled rows", () => {
    expect(computeAverage(["90", "", "80", "  "])).toBe(85);
  });

  it.each([
    [[]],
    [["", "", ""]],
    [["abc"]],
    [["0"]],
    [["-5"]],
    [["101"]],
  ])("returns null for unusable input %p", (marks) => {
    expect(computeAverage(marks)).toBeNull();
  });
});

describe("formatAverage", () => {
  it("shows an em dash rather than 0% when nothing is entered", () => {
    expect(formatAverage(null)).toBe("—");
  });

  it("formats a real average", () => {
    expect(formatAverage(92.5)).toBe("92.5%");
  });
});
