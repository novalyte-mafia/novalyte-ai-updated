/**
 * Non-destructive smoke checks for Workforce repair (no schema apply).
 * Run with: node --env-file=.env scripts/verify-workforce-smoke.mjs
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
const service = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !anon || !service) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / ANON / SERVICE_ROLE env.");
  process.exit(1);
}

const anonClient = createClient(url, anon, { auth: { persistSession: false } });
const admin = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } });

const results = [];

function ok(name, pass, detail = "") {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? ` � ${detail}` : ""}`);
}

// Pre-migration awareness: new tables may not exist yet.
const expectedTables = [
  "professional_directory_profiles",
  "employer_organizations",
  "organization_memberships",
  "clinic_claims",
  "professional_registry_links",
];

for (const table of expectedTables) {
  try {
    const { error } = await admin.from(table).select("*").limit(1);
    if (!error) {
      ok(`table:${table}`, true, "reachable");
    } else if (/does not exist|schema cache|Could not find the table/i.test(error.message)) {
      ok(`table:${table}`, false, `migration not applied: ${error.message}`);
    } else {
      ok(`table:${table}`, false, error.message);
    }
  } catch (err) {
    ok(`table:${table}`, false, err instanceof Error ? err.message : String(err));
  }
}

const { data: piiProbe, error: piiError } = await anonClient
  .from("workforce_professional_profiles")
  .select("id, email, phone")
  .eq("review_status", "approved")
  .eq("visibility_status", "discoverable")
  .limit(5);

if (piiError) {
  ok("anon_base_profile_select", true, `blocked or unavailable: ${piiError.message}`);
} else {
  const exposed = (piiProbe ?? []).some((row) => row.email || row.phone);
  ok("anon_base_profile_no_pii", !exposed, exposed ? "email/phone still readable anonymously" : "no PII rows returned");
}

const { data: dir, error: dirError } = await anonClient
  .from("professional_directory_profiles")
  .select("profile_id, display_name, email, phone")
  .limit(5);

if (dirError) {
  // Missing email/phone columns is the desired outcome for the public projection.
  if (/column .*email.* does not exist|Could not find the .*column.*email/i.test(dirError.message)) {
    ok("directory_projection_no_pii_columns", true, "email/phone columns absent");
  } else {
    ok("directory_projection", false, `not applied yet or error: ${dirError.message}`);
  }
} else {
  const hasPiiCols = (dir ?? []).some((row) => "email" in row || "phone" in row);
  ok("directory_projection_no_pii_columns", !hasPiiCols, hasPiiCols ? "unexpected PII fields" : "safe columns only");
}

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
if (failed.length) {
  console.log("Failures indicate migrations are not applied yet, or a remaining policy gap.");
  process.exit(2);
}
