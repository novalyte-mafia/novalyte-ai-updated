import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { ProfessionalT } from "@/lib/types";

type RegistryRow = {
  id: string;
  source: string;
  public_slug: string | null;
  name: string;
  title: string;
  city: string | null;
  state: string | null;
  remote: boolean | null;
  specialty: string | null;
  experience_band: string | null;
  availability: string | null;
  bio: string | null;
  verified: boolean | null;
};

function yearsFromBand(band: string | null): number {
  if (band === "1-2") return 1;
  if (band === "3-5") return 3;
  if (band === "5-10") return 5;
  if (band === "10+") return 10;
  return 0;
}

export function mapRegistryRowToProfessional(row: RegistryRow): ProfessionalT {
  return {
    id: row.id,
    name: row.name,
    title: row.title,
    city: row.city ?? "",
    state: row.state ?? "",
    remote: Boolean(row.remote),
    licenses: null,
    licensedStates: null,
    certifications: null,
    specialties: row.specialty,
    yearsExperience: yearsFromBand(row.experience_band),
    availability: row.availability ?? "open",
    employmentPref: "full-time",
    bio: row.bio,
    verified: Boolean(row.verified),
  };
}

/** Dual-read public registry: workforce projection + unlinked legacy rows. */
export async function listPublicProfessionals(): Promise<ProfessionalT[]> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("professional_registry_entries")
      .select("*")
      .order("verified", { ascending: false })
      .limit(500);
    if (error) throw error;
    return (data as RegistryRow[] | null)?.map(mapRegistryRowToProfessional) ?? [];
  } catch (error) {
    console.warn("Registry dual-read unavailable; falling back to legacy Professional table.", error);
    return [];
  }
}

export async function getPublicTalentProfile(profileId: string) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("professional_directory_profiles")
    .select("profile_id, public_slug, display_name, title, city, state, category, specialty, experience_band, availability, relocate, telehealth, bio, verified, published_at")
    .or(`profile_id.eq.${profileId},public_slug.eq.${profileId}`)
    .maybeSingle();
  if (error) throw error;
  return data;
}
