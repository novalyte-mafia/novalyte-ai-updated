import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { ClinicT } from "@/lib/types";

type PublishedProfile = {
  publicClinicId: string | null;
};

/**
 * Returns only the reviewed public projection referenced by an actively
 * published directory workflow row. A missing migration fails closed.
 */
export async function listPublishedClinics(): Promise<ClinicT[]> {
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
    return [];
  }

  const clinicIds = [
    ...new Set(
      (profiles ?? [])
        .map((profile) => profile.publicClinicId)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  if (clinicIds.length === 0) return [];

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
    return [];
  }

  return (data ?? []) as ClinicT[];
}
