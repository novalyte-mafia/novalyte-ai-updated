import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { PREVIEW_DIRECTORY_CLINICS } from "@/lib/directory/preview-clinics";
import {
  directorySortRank,
  resolveListingStatus,
} from "@/lib/directory/listing-status";
import {
  sanitizePreviewClinic,
  showDirectoryDemos,
} from "@/lib/directory/validate-clinic";
import type { ClinicT } from "@/lib/types";

type PublishedProfile = {
  publicClinicId: string | null;
};

function normalizeClinic(clinic: ClinicT): ClinicT {
  const sanitized = sanitizePreviewClinic(clinic);
  const listingStatus = resolveListingStatus(sanitized);
  return {
    ...sanitized,
    listingStatus,
    capabilities: sanitized.capabilities ?? "",
    providerTypes: sanitized.providerTypes ?? "",
    locations: sanitized.locations ?? [],
    providers: sanitized.providers ?? [],
    treatments: sanitized.treatments ?? [],
    reviews: sanitized.reviews ?? [],
  };
}

function filterByDemoFlag(clinics: ClinicT[]): ClinicT[] {
  if (showDirectoryDemos()) return clinics;
  return clinics.filter((clinic) => resolveListingStatus(clinic) !== "demo");
}

function mergeDirectoryClinics(published: ClinicT[], preview: ClinicT[]): ClinicT[] {
  const bySlug = new Map<string, ClinicT>();

  for (const clinic of preview.map(normalizeClinic)) {
    bySlug.set(clinic.slug, clinic);
  }

  // Published / claimed / verified DB rows win over preview seeds with the same slug.
  for (const clinic of published.map(normalizeClinic)) {
    const status = resolveListingStatus(clinic);
    if (status === "verified" || status === "claimed") {
      bySlug.set(clinic.slug, clinic);
      continue;
    }
    // Unclaimed DB rows also win (fresher public source), otherwise keep preview.
    if (!bySlug.has(clinic.slug) || clinic.claimStatus === "unclaimed") {
      bySlug.set(clinic.slug, clinic);
    }
  }

  return [...bySlug.values()].sort((a, b) => directorySortRank(b) - directorySortRank(a));
}

/**
 * Returns public directory clinics.
 *
 * 1. Verified published projections from the prospect publication gate.
 * 2. Preview demo + unclaimed listings so the directory is never empty during
 *    early rollout (see src/lib/directory/preview-clinics.ts).
 *
 * Preview rows are never marked verified. Demo rows are never claimable.
 */
export async function listPublishedClinics(): Promise<ClinicT[]> {
  let published: ClinicT[] = [];

  try {
    const supabase = getSupabaseAdmin();
    const { data: profiles, error: profileError } = await supabase
      .from("prospect_directory_profiles")
      .select("publicClinicId")
      .eq("listingStatus", "published")
      .eq("verificationStatus", "verified")
      .eq("publicationStatus", "published")
      .not("permissionSourceCallId", "is", null)
      .not("permissionGrantedAt", "is", null)
      .not("approvedAt", "is", null)
      .not("publishedAt", "is", null)
      .returns<PublishedProfile[]>();

    if (profileError) {
      if (profileError.code !== "PGRST204") {
        console.error("Unable to load the public clinic publication gate", {
          code: profileError.code,
        });
      }
    } else {
      const clinicIds = [
        ...new Set(
          (profiles ?? [])
            .map((profile) => profile.publicClinicId)
            .filter((id): id is string => Boolean(id)),
        ),
      ];

      if (clinicIds.length > 0) {
        const { data, error } = await supabase
          .from("Clinic")
          .select(
            "*, locations:ClinicLocation(*), providers:ClinicProvider(*), treatments:ClinicTreatment(*), reviews:ClinicReview(*)",
          )
          .in("id", clinicIds)
          .is("deletedAt", null)
          .order("updatedAt", { ascending: false });

        if (error) {
          console.error("Unable to load published clinic projections", {
            code: error.code,
          });
        } else {
          published = (data ?? []) as ClinicT[];
        }
      }

      // Optional: also load explicitly visible preview rows seeded into Clinic.
      // Fails soft when listingStatus column is not migrated yet.
      const { data: seededPreview, error: seededError } = await supabase
        .from("Clinic")
        .select(
          "*, locations:ClinicLocation(*), providers:ClinicProvider(*), treatments:ClinicTreatment(*), reviews:ClinicReview(*)",
        )
        .in("listingStatus", ["demo", "unclaimed"])
        .is("deletedAt", null);

      if (seededError) {
        if (seededError.code !== "PGRST204" && !String(seededError.message ?? "").includes("listingStatus")) {
          console.error("Unable to load seeded preview clinics", { code: seededError.code });
        }
      } else if (seededPreview?.length) {
        published = [...published, ...(seededPreview as ClinicT[])];
      }
    }
  } catch (error) {
    console.error("Directory clinic load failed; using preview dataset", error);
  }

  return filterByDemoFlag(
    mergeDirectoryClinics(published, PREVIEW_DIRECTORY_CLINICS as ClinicT[]),
  );
}
