import { describe, expect, it } from "vitest";
import {
  PREVIEW_CONFIRMED_UNCLAIMED_CLINICS,
  PREVIEW_DEMO_CLINICS,
  PREVIEW_DIRECTORY_CLINICS,
  PREVIEW_EFFECTIVE_DEMO_CLINICS,
  PREVIEW_UNCLAIMED_CLINICS,
} from "@/lib/directory/preview-clinics";
import {
  directorySortRank,
  expandSearchTerms,
  isClaimable,
  isGenuinelyVerified,
  resolveListingStatus,
} from "@/lib/directory/listing-status";
import {
  confirmedAcceptingNewPatients,
  confirmedHsaFsaAccepted,
  isValidPublicSourceUrl,
  sanitizePreviewClinic,
  showDirectoryDemos,
  validateDirectoryClinic,
} from "@/lib/directory/validate-clinic";

const REQUIRED_MARKETS = [
  { city: "San Francisco", state: "CA" },
  { city: "Redwood City", state: "CA" },
  { city: "Palo Alto", state: "CA" },
  { city: "Los Angeles", state: "CA" },
  { city: "Phoenix", state: "AZ" },
  { city: "Scottsdale", state: "AZ" },
  { city: "Denver", state: "CO" },
  { city: "Austin", state: "TX" },
  { city: "Dallas", state: "TX" },
  { city: "Portland", state: "OR" },
  { city: "New York", state: "NY" },
  { city: "Miami", state: "FL" },
  { city: "Honolulu", state: "HI" },
  { city: "Chicago", state: "IL" },
];

describe("directory preview dataset integrity", () => {
  it("ships approximately 16 polished preview clinics", () => {
    expect(PREVIEW_DEMO_CLINICS).toHaveLength(16);
    expect(PREVIEW_DIRECTORY_CLINICS).toHaveLength(16);
    expect(PREVIEW_EFFECTIVE_DEMO_CLINICS).toHaveLength(16);
    expect(PREVIEW_UNCLAIMED_CLINICS).toHaveLength(0);
    expect(PREVIEW_CONFIRMED_UNCLAIMED_CLINICS).toHaveLength(0);
  });

  it("uses unique slugs and ids", () => {
    const slugs = PREVIEW_DIRECTORY_CLINICS.map((c) => c.slug);
    const ids = PREVIEW_DIRECTORY_CLINICS.map((c) => c.id);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("never marks preview clinics as verified or claimable", () => {
    for (const clinic of PREVIEW_DIRECTORY_CLINICS) {
      expect(clinic.verified).toBe(false);
      expect(isGenuinelyVerified(clinic)).toBe(false);
      expect(resolveListingStatus(clinic)).toBe("demo");
      expect(clinic.listingStatus).toBe("demo");
      expect(clinic.claimStatus).toBe("not_claimable");
      expect(isClaimable(clinic)).toBe(false);
      expect(clinic.verificationStatus).toBe("demo");
      expect(clinic.dataSource).toBe("demo");
      expect(clinic.sourceUrl).toBeNull();
      expect(clinic.bookingUrl).toBeNull();
      expect(clinic.website).toBeNull();
      expect(clinic.reviews).toEqual([]);
    }
  });

  it("covers the required preview markets", () => {
    for (const market of REQUIRED_MARKETS) {
      expect(
        PREVIEW_DIRECTORY_CLINICS.some(
          (c) => c.city === market.city && c.state === market.state,
        ),
      ).toBe(true);
    }
  });

  it("uses fictional 555 phone placeholders", () => {
    for (const clinic of PREVIEW_DIRECTORY_CLINICS) {
      expect(clinic.phone).toMatch(/555/);
    }
  });

  it("includes the required demonstration disclaimer", () => {
    for (const clinic of PREVIEW_DIRECTORY_CLINICS) {
      expect(clinic.overview).toContain(
        "This is a fictional preview profile created to demonstrate the Novalyte directory experience",
      );
    }
  });

  it("omits unconfirmed accepting and HSA claims on preview cards", () => {
    for (const clinic of PREVIEW_EFFECTIVE_DEMO_CLINICS) {
      expect(confirmedAcceptingNewPatients(clinic)).toBeNull();
      expect(confirmedHsaFsaAccepted(clinic)).toBeNull();
    }
  });

  it("keeps preview profiles visible by default", () => {
    expect(showDirectoryDemos()).toBe(true);
  });
});

describe("directory validation", () => {
  it("rejects example.com as a public source URL", () => {
    expect(isValidPublicSourceUrl("https://example.com/clinic")).toBe(false);
    expect(isValidPublicSourceUrl("https://realclinic.com")).toBe(true);
  });

  it("demotes unsourced unclaimed records to demo", () => {
    const sample = sanitizePreviewClinic({
      ...PREVIEW_DEMO_CLINICS[0],
      listingStatus: "unclaimed",
      claimStatus: "unclaimed",
      verificationStatus: "not_verified",
      dataSource: "public_web",
      sourceUrl: null,
      website: null,
    });
    expect(sample.listingStatus).toBe("demo");
    expect(sample.claimStatus).toBe("not_claimable");
    expect(isClaimable(sample)).toBe(false);
  });

  it("flags unclaimed records without source URLs", () => {
    const issues = validateDirectoryClinic({
      ...PREVIEW_DEMO_CLINICS[0],
      listingStatus: "unclaimed",
      claimStatus: "unclaimed",
      verificationStatus: "not_verified",
      dataSource: "public_web",
      sourceUrl: "https://example.com/x",
      website: "https://example.com/x",
    });
    expect(issues.some((i) => i.code === "unclaimed_missing_source")).toBe(true);
  });

  it("flags claimable demos", () => {
    const issues = validateDirectoryClinic({
      ...PREVIEW_DEMO_CLINICS[0],
      claimStatus: "unclaimed",
    });
    expect(issues.some((i) => i.code === "demo_claimable" || i.code === "demo_is_claimable")).toBe(true);
  });
});

describe("directory search aliases", () => {
  it("expands TRT and ED aliases", () => {
    expect(expandSearchTerms("TRT").some((t) => t.includes("testosterone"))).toBe(true);
    expect(expandSearchTerms("ED").some((t) => t.includes("erectile"))).toBe(true);
    expect(expandSearchTerms("GLP1").some((t) => t.includes("weight"))).toBe(true);
  });
});

describe("directory sort rank", () => {
  it("ranks verified above claimed above unclaimed above demo", () => {
    expect(
      directorySortRank({ listingStatus: "verified", verified: true, verificationStatus: "approved", profileCompleteness: 50 }),
    ).toBeGreaterThan(
      directorySortRank({ listingStatus: "claimed", claimStatus: "claimed", profileCompleteness: 90 }),
    );
    expect(
      directorySortRank({ listingStatus: "unclaimed", profileCompleteness: 80 }),
    ).toBeGreaterThan(
      directorySortRank({ listingStatus: "demo", profileCompleteness: 99 }),
    );
  });
});

describe("directory metadata copy", () => {
  it("does not describe the directory as verified in page metadata module", async () => {
    const mod = await import("@/app/directory/page");
    const meta = mod.metadata;
    const title = String(meta.title ?? "");
    const description = String(meta.description ?? "");
    const ogTitle = String(meta.openGraph?.title ?? "");
    expect(title.toLowerCase()).not.toContain("verified");
    expect(description.toLowerCase()).not.toContain("verified directory");
    expect(ogTitle.toLowerCase()).not.toContain("verified");
    expect(title).toContain("Men's Health Clinic Directory");
  });
});
