import {
  describeLinkError,
  readEmailArrival,
  urlWithoutEmailToken,
} from "@/lib/emailLink";

const BASE = "https://o-hub-api-server.vercel.app/today";

describe("reading what an emailed link arrived with", () => {
  it("recognises our own token-hash links", () => {
    const arrival = readEmailArrival(`${BASE}?token_hash=abc123&type=signup`);
    expect(arrival).toEqual({
      kind: "token",
      tokenHash: "abc123",
      type: "signup",
      recovery: false,
    });
  });

  it("flags a recovery link so the gate can hold it at the password screen", () => {
    const arrival = readEmailArrival(`${BASE}?token_hash=abc&type=recovery`);
    expect(arrival).toEqual({
      kind: "token",
      tokenHash: "abc",
      type: "recovery",
      recovery: true,
    });
  });

  it("recognises the PKCE code the stock templates still send", () => {
    // This is the live path until custom SMTP allows our own templates.
    expect(readEmailArrival(`${BASE}?code=c632dd12-fbc7-4267`)).toEqual({
      kind: "code",
      code: "c632dd12-fbc7-4267",
      recovery: false,
    });
  });

  it("reads an expired-link error rather than treating it as a sign-in", () => {
    const arrival = readEmailArrival(
      `${BASE}?error=access_denied&error_code=otp_expired&type=recovery`,
    );
    expect(arrival).toEqual({ kind: "error", code: "otp_expired", recovery: true });
  });

  it("reads an error delivered in the fragment as well as the query", () => {
    const arrival = readEmailArrival(`${BASE}#error=access_denied&error_code=otp_expired`);
    expect(arrival.kind).toBe("error");
  });

  it("ignores an ordinary page load", () => {
    expect(readEmailArrival(BASE).kind).toBe("none");
    expect(readEmailArrival(`${BASE}?tab=programs`).kind).toBe("none");
  });

  it("refuses a type it does not recognise", () => {
    // `type` reaches `verifyOtp` from a query string anyone can write, so an
    // unknown value has to be dropped rather than forwarded.
    expect(readEmailArrival(`${BASE}?token_hash=abc&type=admin`).kind).toBe("none");
    expect(readEmailArrival(`${BASE}?token_hash=abc`).kind).toBe("none");
  });

  it("refuses an absurdly long token", () => {
    const huge = "a".repeat(600);
    expect(readEmailArrival(`${BASE}?token_hash=${huge}&type=signup`).kind).toBe("none");
    expect(readEmailArrival(`${BASE}?code=${huge}`).kind).toBe("none");
  });

  it("does not throw on a malformed URL", () => {
    expect(() => readEmailArrival("not a url at all")).not.toThrow();
  });
});

describe("cleaning the token out of the address bar", () => {
  it("removes every auth parameter", () => {
    expect(urlWithoutEmailToken(`${BASE}?token_hash=abc&type=signup`)).toBe(BASE);
    expect(urlWithoutEmailToken(`${BASE}?code=abc`)).toBe(BASE);
    expect(
      urlWithoutEmailToken(`${BASE}?error=access_denied&error_description=nope`),
    ).toBe(BASE);
  });

  it("keeps the rest of the deep link the student arrived on", () => {
    expect(urlWithoutEmailToken(`${BASE}?code=abc&tab=programs`)).toBe(
      `${BASE}?tab=programs`,
    );
  });

  it("drops the fragment, which is where tokens hide", () => {
    expect(urlWithoutEmailToken(`${BASE}#access_token=secret`)).toBe(BASE);
  });
});

describe("explaining a link that did not work", () => {
  it("says which kind of link failed", () => {
    expect(describeLinkError("otp_expired", true)).toMatch(/reset link/);
    expect(describeLinkError("otp_expired", false)).toMatch(/confirmation link/);
  });

  it("distinguishes expired from already-used", () => {
    expect(describeLinkError("otp_expired", false)).toMatch(/expired/i);
    expect(describeLinkError("access_denied", false)).toMatch(/already been used/i);
  });

  it("still says something useful for an unknown code", () => {
    expect(describeLinkError(undefined, false)).toMatch(/ask for a new one/i);
  });
});
