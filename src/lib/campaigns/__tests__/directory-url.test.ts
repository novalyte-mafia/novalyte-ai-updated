import { describe, expect, it } from "vitest";
import {
  buildDirectoryUrl,
  mainSitePath,
  parseLocationSlug,
  treatmentDirectoryHints,
} from "@/lib/campaigns/directory-url";

describe("directory-url", () => {
  it("parses city-state location slugs", () => {
    expect(parseLocationSlug("phoenix-az")).toEqual({ city: "Phoenix", state: "AZ" });
    expect(parseLocationSlug("beverly-hills-ca")).toEqual({
      city: "Beverly Hills",
      state: "CA",
    });
  });

  it("maps treatment slugs to directory search hints", () => {
    expect(treatmentDirectoryHints("trt").q).toBe("testosterone");
  });

  it("builds absolute directory URLs with view=directory", () => {
    const url = buildDirectoryUrl({
      treatmentSlug: "trt",
      citySlug: "phoenix-az",
      stateSlug: "arizona",
    });
    expect(url.startsWith("https://novalyte.io/directory?")).toBe(true);
    expect(url).toContain("view=directory");
    expect(url).toContain("state=AZ");
    expect(url).toContain("city=Phoenix");
    expect(url).toContain("q=testosterone");
  });

  it("builds main-site legal paths", () => {
    expect(mainSitePath("/privacy")).toBe("https://novalyte.io/privacy");
  });
});
