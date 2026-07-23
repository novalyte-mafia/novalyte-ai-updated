#!/usr/bin/env tsx
/**
 * Upsert directory preview clinics into Supabase.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/seed-directory-preview.ts
 *
 * Safety:
 * - Upserts by stable preview id / slug
 * - Skips rows that are already claimed or verified in the database
 * - Does not delete existing clinics
 *
 * Requires:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   and migration 20260723120000_clinic_directory_listing_status.sql applied
 */

import { createClient } from "@supabase/supabase-js";
import { PREVIEW_DIRECTORY_CLINICS } from "../src/lib/directory/preview-clinics";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const admin = createClient(url, key, { auth: { persistSession: false } });
  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  for (const clinic of PREVIEW_DIRECTORY_CLINICS) {
    const { data: existing } = await admin
      .from("Clinic")
      .select("id, slug, claimStatus, verified, listingStatus")
      .or(`id.eq.${clinic.id},slug.eq.${clinic.slug}`)
      .maybeSingle();

    if (
      existing &&
      (existing.claimStatus === "claimed" ||
        existing.verified === true ||
        existing.listingStatus === "verified" ||
        existing.listingStatus === "claimed")
    ) {
      console.log(`skip protected ${clinic.slug}`);
      skipped += 1;
      continue;
    }

    const row: Record<string, unknown> = {
      id: clinic.id,
      name: clinic.name,
      slug: clinic.slug,
      tagline: clinic.tagline,
      overview: clinic.overview,
      logoColor: clinic.logoColor,
      city: clinic.city,
      state: clinic.state,
      zip: clinic.zip,
      serviceArea: clinic.serviceArea,
      specialties: clinic.specialties,
      capabilities: clinic.capabilities,
      telehealth: clinic.telehealth,
      providerTypes: clinic.providerTypes,
      phone: clinic.phone,
      email: clinic.email,
      website: clinic.website,
      hours: clinic.hours,
      verified: false,
      verificationStatus: clinic.verificationStatus,
      acceptingNewPatients: clinic.acceptingNewPatients,
      claimStatus: clinic.claimStatus,
      profileCompleteness: clinic.profileCompleteness,
      initialConsultPrice: clinic.initialConsultPrice,
      membershipPrice: clinic.membershipPrice,
      insuranceAccepted: clinic.insuranceAccepted,
      hsaFsaAccepted: clinic.hsaFsaAccepted,
      earliestAvailability: clinic.earliestAvailability,
      statesServed: clinic.statesServed,
      languages: clinic.languages,
      accessibility: clinic.accessibility,
      pricingStatus: clinic.pricingStatus,
      whatToExpect: clinic.whatToExpect,
      deletedAt: null,
      updatedAt: new Date().toISOString(),
    };

    // Optional columns from migration 20260723120000 — only send if present.
    const optionalColumns: Record<string, unknown> = {
      bookingUrl: clinic.bookingUrl ?? null,
      listingStatus: clinic.listingStatus,
      latitude: clinic.latitude,
      longitude: clinic.longitude,
      dataSource: clinic.dataSource,
      sourceUrl: clinic.sourceUrl,
      lastReviewedAt: clinic.lastReviewedAt,
      financingAvailable: clinic.financingAvailable,
      inPersonAvailable: clinic.inPersonAvailable,
      sameDayConsultations: clinic.sameDayConsultations,
    };

    let { error } = await admin.from("Clinic").upsert({ ...row, ...optionalColumns }, { onConflict: "id" });
    if (error && /schema cache|column/i.test(error.message)) {
      console.warn(`retry ${clinic.slug} without optional listing columns`);
      ({ error } = await admin.from("Clinic").upsert(row, { onConflict: "id" }));
    }
    if (error) {
      console.error(`fail ${clinic.slug}`, error.message);
      failed += 1;
      continue;
    }

    // Replace child rows for preview ids only
    await admin.from("ClinicLocation").delete().eq("clinicId", clinic.id);
    await admin.from("ClinicProvider").delete().eq("clinicId", clinic.id);
    await admin.from("ClinicTreatment").delete().eq("clinicId", clinic.id);

    if (clinic.locations?.length) {
      await admin.from("ClinicLocation").insert(clinic.locations);
    }
    if (clinic.providers?.length) {
      await admin.from("ClinicProvider").insert(clinic.providers);
    }
    if (clinic.treatments?.length) {
      await admin.from("ClinicTreatment").insert(
        clinic.treatments.map(({ priceRange, ...rest }) => ({
          ...rest,
          // Keep schema-compatible fields; priceRange may be ignored if not present
          priceRange: priceRange ?? null,
        })),
      );
    }

    inserted += 1;
    console.log(`upserted ${clinic.slug}`);
  }

  console.log(JSON.stringify({ inserted, skipped, failed, total: PREVIEW_DIRECTORY_CLINICS.length }));
  if (failed > 0) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
