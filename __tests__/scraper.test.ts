import { fetchAllowed, parseRobots, pathAllowed, USER_AGENT } from "@/scraper/fetcher";
import { SOURCES, automatable, sourceById } from "@/scraper/sources";

describe("source registry", () => {
  it("records OUInfo as forbidden — its robots.txt is a blanket disallow", () => {
    const ouinfo = sourceById("ouinfo");
    expect(ouinfo?.permission).toBe("forbidden");
    expect(ouinfo?.note).toMatch(/Disallow: \//);
  });

  it("records OUAC as forbidden — it 403s automated clients", () => {
    expect(sourceById("ouac")?.permission).toBe("forbidden");
  });

  it("keeps forbidden sources out of anything automated", () => {
    const ids = automatable().map((s) => s.id);
    expect(ids).not.toContain("ouinfo");
    expect(ids).not.toContain("ouac");
    expect(ids).toContain("cou-cudo");
  });

  it("gives every source a reason, not just a verdict", () => {
    const unexplained = SOURCES.filter((s) => s.note.length < 40).map((s) => s.id);
    expect(unexplained).toEqual([]);
  });
});

describe("robots.txt parsing", () => {
  it("reads a blanket disallow", () => {
    const rules = parseRobots("User-agent: *\nDisallow: /", USER_AGENT);
    expect(pathAllowed(rules, "/programs")).toBe(false);
    expect(pathAllowed(rules, "/")).toBe(false);
  });

  it("permits paths outside the disallowed prefixes", () => {
    const rules = parseRobots(
      "User-agent: *\nCrawl-delay: 10\nDisallow: /includes/\nDisallow: /modules/",
      USER_AGENT,
    );
    expect(pathAllowed(rules, "/programs/computer-science")).toBe(true);
    expect(pathAllowed(rules, "/includes/secret")).toBe(false);
    expect(rules.crawlDelayMs).toBe(10_000);
  });

  it("lets the longest matching rule win, Allow breaking a tie", () => {
    const rules = parseRobots(
      "User-agent: *\nDisallow: /data/\nAllow: /data/public/",
      USER_AGENT,
    );
    expect(pathAllowed(rules, "/data/private")).toBe(false);
    expect(pathAllowed(rules, "/data/public/cudo.csv")).toBe(true);
  });

  it("obeys a group naming us over the wildcard", () => {
    const rules = parseRobots(
      "User-agent: *\nDisallow:\n\nUser-agent: oHubBot\nDisallow: /",
      USER_AGENT,
    );
    expect(pathAllowed(rules, "/anything")).toBe(false);
  });

  it("never lets a host's crawl-delay drop below our own floor", () => {
    const rules = parseRobots("User-agent: *\nCrawl-delay: 0", USER_AGENT);
    expect(rules.crawlDelayMs).toBeGreaterThanOrEqual(2000);
  });

  it("ignores comments and blank lines", () => {
    const rules = parseRobots(
      "# comment\n\nUser-agent: *   # trailing\nDisallow: /admin/\n",
      USER_AGENT,
    );
    expect(pathAllowed(rules, "/admin/x")).toBe(false);
    expect(pathAllowed(rules, "/ok")).toBe(true);
  });
});

describe("fetchAllowed", () => {
  it("refuses a forbidden source before touching the network", async () => {
    const fetchSpy = jest.spyOn(globalThis, "fetch");
    const verdict = await fetchAllowed("https://ouinfo.ca/programs", "ouinfo");

    expect(verdict.allowed).toBe(false);
    expect(verdict.reason).toMatch(/forbidden/);
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("refuses an unknown source", async () => {
    const verdict = await fetchAllowed("https://example.com/", "not-a-source");
    expect(verdict.allowed).toBe(false);
  });

  it("refuses plain http", async () => {
    const verdict = await fetchAllowed("http://cudo.ouac.on.ca/", "cou-cudo");
    expect(verdict.allowed).toBe(false);
    expect(verdict.reason).toMatch(/https/);
  });

  it("identifies itself with a contactable user agent", () => {
    expect(USER_AGENT).toMatch(/oHubBot/);
    expect(USER_AGENT).toMatch(/github\.com/);
  });
});
