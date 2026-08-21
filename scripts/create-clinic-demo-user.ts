/**
 * One-shot: create a clinic portal demo owner with org + linked clinic + sample lead.
 * Usage: npx tsx --env-file=.env.local scripts/create-clinic-demo-user.ts
 */
import { createClient } from "@supabase/supabase-js";

const EMAIL = "clinic-demo@novalyte.io";
const PASSWORD = "NovalyteDemo2026!";
const CLINIC_ID = "demo-clinic-portal-os";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1) Auth user (idempotent)
  let userId: string | null = null;
  const listed = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (listed.error) throw listed.error;
  const existing = listed.data.users.find((u) => u.email?.toLowerCase() === EMAIL);
  if (existing) {
    userId = existing.id;
    const { error } = await admin.auth.admin.updateUserById(userId, {
      password: PASSWORD,
      email_confirm: true,
      app_metadata: {
        ...existing.app_metadata,
        account_types: Array.from(
          new Set([
            ...(Array.isArray(existing.app_metadata?.account_types)
              ? existing.app_metadata.account_types
              : []),
            "employer",
          ]),
        ),
      },
    });
    if (error) throw error;
    console.log("Updated existing auth user:", userId);
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { first_name: "Demo", last_name: "Clinic" },
      app_metadata: { account_types: ["employer"] },
    });
    if (error || !data.user) throw error ?? new Error("createUser failed");
    userId = data.user.id;
    console.log("Created auth user:", userId);
  }

  // 2) Profile
  const { error: profileError } = await admin.from("profiles").upsert(
    {
      id: userId,
      email: EMAIL,
      first_name: "Demo",
      last_name: "Clinic",
      role: "employer",
      updatedAt: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
  if (profileError) throw profileError;

  // 3) Organization
  const slug = `novalyte-demo-clinic-${userId.slice(0, 8)}`;
  let organizationId: string | null = null;

  const { data: existingMemberships } = await admin
    .from("organization_memberships")
    .select("organization_id")
    .eq("user_id", userId)
    .eq("status", "active")
    .limit(1);

  if (existingMemberships?.[0]?.organization_id) {
    organizationId = existingMemberships[0].organization_id;
    console.log("Reusing organization:", organizationId);
  } else {
    const { data: org, error: orgError } = await admin
      .from("employer_organizations")
      .insert({
        legal_name: "Novalyte Demo Men's Health",
        public_name: "Novalyte Demo Clinic",
        slug,
        org_type: "clinic",
        hq_state: "CA",
        primary_specialty: "Men's Health",
        description: "Demo organization for clinic portal walkthroughs.",
        verification_status: "verified",
        lifecycle_status: "active",
        created_by: userId,
      })
      .select("id")
      .single();
    if (orgError || !org) throw orgError ?? new Error("org insert failed");
    organizationId = org.id;

    const { error: memError } = await admin.from("organization_memberships").insert({
      organization_id: organizationId,
      user_id: userId,
      role: "owner",
      status: "active",
      accepted_at: new Date().toISOString(),
      portal_capabilities: {},
    });
    if (memError) throw memError;
    console.log("Created organization + membership:", organizationId);
  }

  // 4) Clinic linked to org
  const { data: clinicExisting } = await admin
    .from("Clinic")
    .select("id")
    .eq("id", CLINIC_ID)
    .maybeSingle();

  if (clinicExisting) {
    const { error } = await admin
      .from("Clinic")
      .update({
        organization_id: organizationId,
        claimStatus: "claimed",
        verificationStatus: "verified",
        listingStatus: "verified",
        name: "Novalyte Demo Clinic",
        updatedAt: new Date().toISOString(),
      })
      .eq("id", CLINIC_ID);
    if (error) throw error;
  } else {
    const { error } = await admin.from("Clinic").insert({
      id: CLINIC_ID,
      name: "Novalyte Demo Clinic",
      slug: "novalyte-demo-clinic",
      overview:
        "Internal demo clinic for portal product walkthroughs. Not a public partner listing.",
      city: "San Francisco",
      state: "CA",
      zip: "94105",
      specialties: "TRT, Men's Health, Longevity",
      telehealth: true,
      claimStatus: "claimed",
      verificationStatus: "verified",
      listingStatus: "unclaimed",
      dataSource: "demo",
      organization_id: organizationId,
      email: EMAIL,
    });
    if (error) throw error;
  }
  console.log("Clinic linked:", CLINIC_ID);

  // 5) Sample lead + assignment (if none)
  const { count } = await admin
    .from("lead_assignments")
    .select("id", { count: "exact", head: true })
    .eq("clinic_id", CLINIC_ID);

  if (!count) {
    const { data: lead, error: leadError } = await admin
      .from("patient_leads")
      .insert({
        source: "manual",
        first_name: "Alex",
        last_name: "Rivera",
        email: "alex.rivera.demo@example.com",
        phone: "+1-415-555-0142",
        city: "Oakland",
        state: "CA",
        zip: "94612",
        treatment_interest: "TRT",
        symptoms: "Low energy, poor sleep",
        concerns: "Wants clinician consultation",
        preferred_contact: "phone",
        best_time: "weekday mornings",
        telehealth_preference: "telehealth",
        consent_contact: true,
        status: "qualified",
        lead_source: "demo_seed",
        source_page: "manual",
      })
      .select("id")
      .single();
    if (leadError || !lead) throw leadError ?? new Error("lead insert failed");

    const { data: assignment, error: assignError } = await admin
      .from("lead_assignments")
      .insert({
        lead_id: lead.id,
        clinic_id: CLINIC_ID,
        organization_id: organizationId,
        status: "delivered",
        match_score: 88,
        explanation: "Demo match for TRT interest in CA telehealth catchment.",
        delivered_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (assignError || !assignment) throw assignError ?? new Error("assignment failed");

    await admin.from("lead_events").insert({
      lead_id: lead.id,
      assignment_id: assignment.id,
      actor: "system",
      action: "pushed_to_clinic",
      payload: { demo: true },
    });

    await admin.from("portal_notifications").insert({
      organization_id: organizationId,
      user_id: userId,
      type: "lead_delivered",
      title: "New patient lead for Novalyte Demo Clinic",
      body: "Alex Rivera was delivered to your clinic portal inbox.",
      payload: { assignmentId: assignment.id, href: `/clinic/leads/${assignment.id}` },
    });
    console.log("Seeded sample lead assignment:", assignment.id);
  } else {
    console.log("Lead assignments already present:", count);
  }

  // Ensure free subscription row
  await admin.from("clinic_subscriptions").upsert(
    {
      organization_id: organizationId,
      plan_key: "free",
      status: "active",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "organization_id" },
  );

  console.log("\n--- Clinic portal demo login ---");
  console.log("Email:   ", EMAIL);
  console.log("Password:", PASSWORD);
  console.log("URL:     ", "http://localhost:3000/clinic/sign-in");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
