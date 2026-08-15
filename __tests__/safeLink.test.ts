import { displayHost, sanitizeExternalUrl } from "@/lib/safeLink";

describe("sanitizeExternalUrl", () => {
  it("accepts ordinary https links", () => {
    const result = sanitizeExternalUrl("https://www.ouac.on.ca/apply");
    expect(result.ok).toBe(true);
    expect(result.url).toBe("https://www.ouac.on.ca/apply");
  });

  it("trims surrounding whitespace", () => {
    expect(sanitizeExternalUrl("  https://uwaterloo.ca  ").ok).toBe(true);
  });

  it.each([
    // The bug this module exists to prevent: on web `Linking.openURL` executes
    // a javascript: URL in the page's own origin.
    ["javascript:alert(document.cookie)"],
    ["JavaScript:alert(1)"],
    ["data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=="],
    ["file:///etc/passwd"],
    ["intent://scan/#Intent;scheme=zxing;end"],
    ["vbscript:msgbox(1)"],
  ])("rejects %s", (url) => {
    const result = sanitizeExternalUrl(url);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("disallowed-protocol");
  });

  it("rejects plain http so links can't be downgraded in transit", () => {
    expect(sanitizeExternalUrl("http://www.ouac.on.ca").ok).toBe(false);
  });

  it("rejects credentials embedded in the authority", () => {
    // Reads as ouac.on.ca but resolves to evil.example.
    const result = sanitizeExternalUrl("https://www.ouac.on.ca@evil.example/");
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("credentials-in-url");
  });

  it("rejects loopback hosts", () => {
    expect(sanitizeExternalUrl("https://localhost:8081/admin").reason).toBe(
      "blocked-host",
    );
    expect(sanitizeExternalUrl("https://127.0.0.1/").reason).toBe("blocked-host");
  });

  it.each([undefined, null, "", "   ", "not a url", "//evil.example"])(
    "rejects unusable input %p",
    (value) => {
      expect(sanitizeExternalUrl(value as string | null | undefined).ok).toBe(false);
    },
  );
});

describe("displayHost", () => {
  it("strips the www prefix", () => {
    expect(displayHost("https://www.ouac.on.ca/apply")).toBe("ouac.on.ca");
  });

  it("returns an empty string for rejected URLs", () => {
    expect(displayHost("javascript:alert(1)")).toBe("");
  });
});
