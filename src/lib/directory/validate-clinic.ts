/**
 * Directory record validation and sanitization.
 *
 * Unclaimed listings require a real public source URL.
 * Demo listings must never be claimable or verified.
 */

import type { ClinicT } from "@/lib/types";
import {
  resolveListingStatus,
  type ListingStatus,
} from "@/lib/directory/listing-status";

export type DirectoryValidationIssue = {
  clinicId: string;
  slug: string;
  severity: "error" | "warn";
  code: string;
  message: string;
};

const PLACEHOLDER_HOSTS = new Set([
  "example.com",
  "example.org",
  "example.net",
  "localhost",
]);

export function isValidPublicSourceUrl(url: string | null | undefined): boolean {
  if (!url || !url.trim()) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    if (PLACEHOLDER_HOSTS.has(host)) return false;
    if (host.endsWith(".example") || host.endsWith(".test") || host.endsWith(".invalid")) {
      return false;
    }
    return Boolean(host.includes("."));
  } catch {
    return false;
  }
}

export function showDirectoryDemos(): boolean {
  const flag = process.env.NEXT_PUBLIC_SHOW_DIRECTORY_DEMOS;
  if (flag === undefined || flag === "") {
    // Preview profiles stay visible by default so the directory remains usable
    // while founding clinics complete verification. Set the env flag to false
    // to hide them.
    return true;
  }
  return flag === "1" || flag.toLowerCase() === "true";
}

/** Demote an unsourced "unclaimed" placeholder into a clearly fictional demo. */
export function demoteUnsourcedToDemo<T extends ClinicT & {
  listingStatus?: string | null;
  dataSource?: string | null;
  sourceUrl?: string | null;
  lastReviewedAt?: string | null;
}>(clinic: T): T {
  return {
    ...clinic,
    listingStatus: "demo",
    claimStatus: "not_claimable",
    verificationStatus: "demo",
    verified: false,
    dataSource: "demo",
    sourceUrl: null,
    website: null,
    bookingUrl: null,
    phone: null,
    email: null,
    // Unsupported operational claims — omit from cards via display helpers.
    acceptingNewPatients: false,
    insuranceAccepted: false,
    hsaFsaAccepted: false,
    initialConsultPrice: null,
    membershipPrice: null,
    earliestAvailability: null,
    pricingStatus: "consult",
    tagline: clinic.tagline?.includes("Demonstration")
      ? clinic.tagline
      : "Demonstration listing for directory preview only.",
    overview: clinic.overview?.includes("Demonstration")
      ? clinic.overview
      : `Fictional demonstration profile used to preview the Novalyte AI clinic directory. ${clinic.name} is not presented as a confirmed operating clinic.`,
  };
}

export function sanitizePreviewClinic<T extends ClinicT & {
  listingStatus?: string | null;
  dataSource?: string | null;
  sourceUrl?: string | null;
}>(clinic: T): T {
  const status = resolveListingStatus(clinic);
  if (status === "unclaimed" && !isValidPublicSourceUrl(clinic.sourceUrl)) {
    return demoteUnsourcedToDemo(clinic);
  }
  if (status === "demo") {
    return {
      ...clinic,
      listingStatus: "demo",
      claimStatus: "not_claimable",
      verificationStatus: "demo",
      verified: false,
      dataSource: "demo",
      sourceUrl: null,
    };
  }
  return clinic;
}

export function validateDirectoryClinic(clinic: ClinicT & {
  listingStatus?: string | null;
  dataSource?: string | null;
  sourceUrl?: string | null;
  lastReviewedAt?: string | null;
  financingAvailable?: boolean | null;
}): DirectoryValidationIssue[] {
  const issues: DirectoryValidationIssue[] = [];
  const status = resolveListingStatus(clinic);
  const base = { clinicId: clinic.id, slug: clinic.slug };

  const push = (severity: "error" | "warn", code: string, message: string) => {
    issues.push({ ...base, severity, code, message });
  };

  if (status === "unclaimed") {
    if (!isValidPublicSourceUrl(clinic.sourceUrl)) {
      push("error", "unclaimed_missing_source", "Unclaimed clinic requires a valid public source URL.");
    }
    if (!clinic.website || !isValidPublicSourceUrl(clinic.website)) {
      push("error", "unclaimed_missing_website", "Unclaimed clinic requires a real public website.");
    }
    if (!clinic.lastReviewedAt) {
      push("warn", "unclaimed_missing_reviewed_at", "Unclaimed clinic should include lastReviewedAt.");
    }
    if (clinic.verified || clinic.verificationStatus === "approved" || clinic.verificationStatus === "verified") {
      push("error", "unclaimed_marked_verified", "Unclaimed clinic must not be marked verified.");
    }
    if (clinic.dataSource === "demo") {
      push("error", "unclaimed_demo_source", "Unclaimed clinic cannot use dataSource=demo.");
    }
  }

  if (status === "demo") {
    if (clinic.claimStatus !== "not_claimable") {
      push("error", "demo_claimable", "Demo clinic must have claimStatus=not_claimable.");
    }
    if (isClaimableSafe(clinic)) {
      push("error", "demo_is_claimable", "Demo clinic must not be claimable.");
    }
    if (clinic.verified || status === ("verified" as ListingStatus)) {
      push("error", "demo_verified", "Demo clinic must not be verified.");
    }
    if (clinic.dataSource === "public_web") {
      push("error", "demo_public_source", "Fictional clinic must not use dataSource=public_web.");
    }
    if (clinic.sourceUrl) {
      push("warn", "demo_has_source_url", "Demo clinic should not expose a public-source URL.");
    }
  }

  if (status === "verified") {
    if (!clinic.verified || (clinic.verificationStatus !== "approved" && clinic.verificationStatus !== "verified")) {
      push("error", "verified_incomplete", "Verified listing requires verified=true and approved verificationStatus.");
    }
  }

  if (clinic.hsaFsaAccepted === true && status === "unclaimed" && !isValidPublicSourceUrl(clinic.sourceUrl)) {
    push("error", "hsa_without_source", "HSA/FSA must not display without a supporting public source.");
  }

  if (clinic.acceptingNewPatients === true && status === "unclaimed" && !isValidPublicSourceUrl(clinic.sourceUrl)) {
    push("error", "accepting_without_source", "Accepting-new-patients must not display without confirmation.");
  }

  return issues;
}

function isClaimableSafe(clinic: {
  listingStatus?: string | null;
  claimStatus?: string | null;
}): boolean {
  const status = resolveListingStatus(clinic);
  return status === "unclaimed" && clinic.claimStatus !== "not_claimable";
}

export function auditDirectoryClinics(clinics: Array<ClinicT & {
  listingStatus?: string | null;
  dataSource?: string | null;
  sourceUrl?: string | null;
  lastReviewedAt?: string | null;
}>): DirectoryValidationIssue[] {
  const all = clinics.flatMap(validateDirectoryClinic);
  for (const issue of all) {
    const line = `[directory-validation] ${issue.severity.toUpperCase()} ${issue.slug} ${issue.code}: ${issue.message}`;
    if (issue.severity === "error") console.error(line);
    else console.warn(line);
  }
  return all;
}

/** Card/profile display helpers — omit unconfirmed operational claims. */
export function confirmedAcceptingNewPatients(clinic: ClinicT): boolean | null {
  const status = resolveListingStatus(clinic);
  if (status === "demo") return null;
  if (clinic.acceptingNewPatients === true) return true;
  if (clinic.acceptingNewPatients === false && (status === "claimed" || status === "verified")) {
    return false;
  }
  return null;
}

export function confirmedInsuranceAccepted(clinic: ClinicT): boolean | null {
  const status = resolveListingStatus(clinic);
  if (status === "demo") return null;
  if (clinic.insuranceAccepted === true) return true;
  return null;
}

export function confirmedHsaFsaAccepted(clinic: ClinicT): boolean | null {
  const status = resolveListingStatus(clinic);
  if (status === "demo") return null;
  if (clinic.hsaFsaAccepted === true) return true;
  return null;
}

export function confirmedTelehealth(clinic: ClinicT & { inPersonAvailable?: boolean | null }): "telehealth" | "in-person" | "hybrid" | null {
  const status = resolveListingStatus(clinic);
  // Demo profiles may show care format as fictional preview metadata only when explicitly set on rich demos.
  if (status === "demo") {
    if (clinic.telehealth && clinic.inPersonAvailable) return "hybrid";
    if (clinic.telehealth) return "telehealth";
    if (clinic.inPersonAvailable) return "in-person";
    return null;
  }
  if (clinic.telehealth && clinic.inPersonAvailable) return "hybrid";
  if (clinic.telehealth) return "telehealth";
  if (clinic.inPersonAvailable) return "in-person";
  if (clinic.telehealth === false && clinic.inPersonAvailable === false) return null;
  return clinic.telehealth ? "telehealth" : null;
}
