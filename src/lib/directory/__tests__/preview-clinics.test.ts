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
  validateDirectoryClinic,
} from "@/lib/directory/validate-clinic";

describe("directory preview dataset integrity", () => {
  it("keeps original rich demos and demotes unsourced placeholders", () => {
    expect(PREVIEW_DEMO_CLINICS).toHaveLength(6);
    expect(PREVIEW_UNCLAIMED_CLINICS.length).toBeGreaterThanOrEqual(24);
    expect(PREVIEW_EFFECTIVE_DEMO_CLINICS.length).toBe(
      PREVIEW_DEMO_CLINICS.length + PREVIEW_UNCLAIMED_CLINICS.length,
    );
    expect(PREVIEW_CONFIRMED_UNCLAIMED_CLINICS).toHaveLength(0);
  });

  it("uses unique slugs", () => {
    const slugs = PREVIEW_DIRECTORY_CLINICS.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("never marks preview clinics as verified", () => {
    for (const clinic of PREVIEW_DIRECTORY_CLINICS) {
      expect(clinic.verified).toBe(false);
      expect(isGenuinelyVerified(clinic)).toBe(false);
      expect(resolveListingStatus(clinic)).not.toBe("verified");
    }
  });

  it("marks all current preview clinics as demo and not claimable", () => {
    for (const clinic of PREVIEW_DIRECTORY_CLINICS) {
      expect(resolveListingStatus(clinic)).toBe("demo");
      expect(clinic.listingStatus).toBe("demo");
      expect(clinic.claimStatus).toBe("not_claimable");
      expect(isClaimable(clinic)).toBe(false);
      expect(clinic.verificationStatus).toBe("demo");
      expect(clinic.dataSource).toBe("demo");
      expect(clinic.sourceUrl).toBeNull();
    }
  });

  it("excludes demos from verified-only semantics", () => {
    for (const clinic of PREVIEW_DIRECTORY_CLINICS) {
      expect(isGenuinelyVerified(clinic)).toBe(false);
    }
  });

  it("covers priority markets", () => {
    const states = new Set(PREVIEW_DIRECTORY_CLINICS.map((c) => c.state));
    for (const state of ["CA", "TX", "FL", "NY", "AZ", "NV", "IL", "GA"]) {
      expect(states.has(state)).toBe(true);
    }
  });

  it("omits unconfirmed accepting and HSA claims on demoted cards", () => {
    for (const clinic of PREVIEW_EFFECTIVE_DEMO_CLINICS) {
      expect(confirmedAcceptingNewPatients(clinic)).toBeNull();
      expect(confirmedHsaFsaAccepted(clinic)).toBeNull();
    }
  });
});

describe("directory validation", () => {
  it("rejects example.com as a public source URL", () => {
    expect(isValidPublicSourceUrl("https://example.com/clinic")).toBe(false);
    expect(isValidPublicSourceUrl("https://realclinic.com")).toBe(true);
  });

  it("demotes unsourced unclaimed records to demo", () => {
    const sample = sanitizePreviewClinic(PREVIEW_UNCLAIMED_CLINICS[0]);
    expect(sample.listingStatus).toBe("demo");
    expect(sample.claimStatus).toBe("not_claimable");
    expect(isClaimable(sample)).toBe(false);
  });

  it("flags unclaimed records without source URLs", () => {
    const issues = validateDirectoryClinic({
      ...PREVIEW_UNCLAIMED_CLINICS[0],
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
