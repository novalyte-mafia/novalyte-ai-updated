#!/usr/bin/env node
/**
 * Seed sample hierarchical ads campaigns into cs_* tables.
 * Usage: node scripts/seed-sample-ads-campaigns.mjs
 * Requires SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL in .env.local
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  const env = { ...process.env };
  for (const file of [".env.local", ".env"]) {
    const p = resolve(process.cwd(), file);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split("\n")) {
      if (!line || line.startsWith("#") || !line.includes("=")) continue;
      const i = line.indexOf("=");
      const k = line.slice(0, i).trim();
      let v = line.slice(i + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      if (!env[k]) env[k] = v;
    }
  }
  return env;
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false } });

async function upsertVertical(slug, name, category) {
  const { error } = await sb.from("cs_treatment_verticals").upsert({ slug, name, category }, { onConflict: "slug" });
  if (error) throw error;
  const { data } = await sb.from("cs_treatment_verticals").select("id").eq("slug", slug).single();
  return data.id;
}

async function ensureGeo(id, kind, slug, name, parentId, stateCode) {
  const { data: existing } = await sb.from("cs_geo_entities").select("id").eq("id", id).maybeSingle();
  if (existing) return existing.id;
  const { data, error } = await sb
    .from("cs_geo_entities")
    .insert({ id, kind, slug, name, parent_id: parentId, state_code: stateCode })
    .select("id")
    .single();
  if (error) {
    const { data: bySlug } = await sb
      .from("cs_geo_entities")
      .select("id")
      .eq("kind", kind)
      .eq("slug", slug)
      .maybeSingle();
    if (bySlug) return bySlug.id;
    throw error;
  }
  return data.id;
}

const samples = [
  {
    campaignId: "c1000000-0000-4000-8000-000000000001",
    pageId: "d1000000-0000-4000-8000-000000000001",
    vertical: "trt",
    treatment: "trt",
    location: "phoenix-az",
    geoId: "a1000000-0000-4000-8000-000000000020",
    stateSlug: "arizona",
    name: "Sample · TRT Phoenix AZ",
    assessment: "testosterone-replacement-therapy",
    hero: {
      eyebrow: "Phoenix · TRT",
      headline: "Looking for testosterone care options in Phoenix?",
      subheadline:
        "Complete a short informational assessment. Licensed clinics decide next steps — Novalyte AI is a technology facilitator, not a medical provider.",
    },
    seoTitle: "Explore testosterone care navigation in Phoenix",
    seoDescription:
      "Informational TRT assessment for Phoenix-area patients. Licensed providers decide eligibility — Novalyte AI does not provide medical care.",
    blocks: [
      {
        type: "value_props",
        title: "Why patients start here",
        items: [
          { title: "Phoenix-focused navigation", description: "Location-aware guidance for men exploring TRT options in the Phoenix area." },
          { title: "Informational assessment", description: "Share your goals and history so clinics can review fit — this is not a diagnosis." },
          { title: "Licensed clinics decide care", description: "Novalyte AI does not provide medical treatment. Providers determine eligibility." },
        ],
      },
      {
        type: "faq",
        title: "Common questions",
        items: [
          { question: "Is this medical advice?", answer: "No. The assessment is informational only. Licensed providers make clinical decisions." },
          { question: "Does submitting guarantee treatment?", answer: "No. Submission does not guarantee eligibility, an appointment, or treatment." },
        ],
      },
    ],
  },
  {
    campaignId: "c1000000-0000-4000-8000-000000000002",
    pageId: "d1000000-0000-4000-8000-000000000002",
    vertical: "longevity",
    treatment: "longevity",
    location: "beverly-hills-ca",
    geoId: "a1000000-0000-4000-8000-000000000021",
    stateSlug: "california",
    name: "Sample · Longevity Beverly Hills",
    assessment: "longevity-medicine",
    hero: {
      eyebrow: "Beverly Hills · Longevity",
      headline: "Curious about longevity and preventive care in Beverly Hills?",
      subheadline:
        "Take an informational assessment. Eligible patients may be connected with clinics exploring longevity-focused care — Novalyte AI does not diagnose or treat.",
    },
    seoTitle: "Explore longevity and preventive health options in Beverly Hills",
    seoDescription:
      "Informational longevity assessment for Beverly Hills-area patients. Treatment decisions are made by licensed providers.",
    blocks: [
      {
        type: "value_props",
        title: "Longevity, thoughtfully introduced",
        items: [
          { title: "Beverly Hills market context", description: "Messaging tailored for patients exploring longevity and preventive care locally." },
          { title: "No outcome guarantees", description: "We do not claim guaranteed results or eligibility." },
        ],
      },
      {
        type: "faq",
        title: "Common questions",
        items: [
          { question: "Is Novalyte a clinic?", answer: "No. Novalyte AI facilitates education, assessments, and clinic discovery." },
        ],
      },
    ],
  },
  {
    campaignId: "c1000000-0000-4000-8000-000000000003",
    pageId: "d1000000-0000-4000-8000-000000000003",
    vertical: "sexual-health",
    treatment: "sexual-health",
    location: "palo-alto-ca",
    geoId: "a1000000-0000-4000-8000-000000000022",
    stateSlug: "california",
    name: "Sample · Sexual Health Palo Alto",
    assessment: "erectile-dysfunction",
    hero: {
      eyebrow: "Palo Alto · Sexual health",
      headline: "Explore sexual health care options in Palo Alto",
      subheadline:
        "Complete a private informational assessment. Novalyte AI helps you navigate options — licensed clinics provide care.",
    },
    seoTitle: "Explore sexual health clinic options in Palo Alto",
    seoDescription:
      "Informational sexual-health assessment for Palo Alto-area patients. Licensed providers determine eligibility and care.",
    blocks: [
      {
        type: "value_props",
        title: "Private, informational support",
        items: [
          { title: "Palo Alto-focused", description: "Built for patients exploring sexual health options in the Palo Alto area." },
          { title: "Assessment on the page", description: "Complete the assessment without leaving this landing page." },
        ],
      },
      {
        type: "faq",
        title: "Common questions",
        items: [
          { question: "Can I get treatment from Novalyte?", answer: "Novalyte AI does not provide medical care. Licensed providers do." },
        ],
      },
    ],
  },
];

async function main() {
  const usId = "a1000000-0000-4000-8000-000000000001";
  await ensureGeo(usId, "country", "us", "United States", null, null);
  const caId = await ensureGeo("a1000000-0000-4000-8000-000000000002", "state", "california", "California", usId, "CA");
  const azId = await ensureGeo("a1000000-0000-4000-8000-000000000010", "state", "arizona", "Arizona", usId, "AZ");
  await ensureGeo("a1000000-0000-4000-8000-000000000020", "city", "phoenix-az", "Phoenix, AZ", azId, "AZ");
  await ensureGeo("a1000000-0000-4000-8000-000000000021", "city", "beverly-hills-ca", "Beverly Hills, CA", caId, "CA");
  await ensureGeo("a1000000-0000-4000-8000-000000000022", "city", "palo-alto-ca", "Palo Alto, CA", caId, "CA");

  const verticalIds = {
    trt: await upsertVertical("trt", "TRT", "hormone"),
    longevity: await upsertVertical("longevity", "Longevity", "wellness"),
    "sexual-health": await upsertVertical("sexual-health", "Sexual Health", "specialty"),
    "weight-loss": await upsertVertical("weight-loss", "Weight Loss", "metabolic"),
  };

  const { data: paidTv } = await sb
    .from("cs_template_versions")
    .select("id, template_id, cs_templates!inner(slug)")
    .eq("cs_templates.slug", "paid-conversion")
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const templateVersionId = paidTv?.id ?? null;

  for (const s of samples) {
    const { error: cErr } = await sb.from("cs_campaigns").upsert(
      {
        id: s.campaignId,
        name: s.name,
        internal_name: `sample-${s.treatment}-${s.location}`,
        objective: "patient_acquisition",
        traffic_type: "paid_search",
        vertical_id: verticalIds[s.vertical],
        status: "active",
        settings: { sample: true, protected: true },
      },
      { onConflict: "id" },
    );
    if (cErr) throw cErr;

    const path = `/ads/${s.treatment}/${s.location}`;
    const slug = `${s.treatment}/${s.location}`;
    const pageRow = {
      id: s.pageId,
      campaign_id: s.campaignId,
      template_version_id: templateVersionId,
      page_type: "paid_conversion",
      host: "ads",
      slug,
      path,
      service_slug: s.treatment,
      state_slug: s.stateSlug,
      city_slug: s.location,
      geo_id: s.geoId,
      vertical_id: verticalIds[s.vertical],
      status: "published",
      indexing_policy: "noindex_follow",
      public_title: s.name.replace(/^Sample · /, ""),
      internal_title: s.name,
      seo_title: s.seoTitle,
      seo_description: s.seoDescription,
      canonical_url: `https://ads.novalyte.io/${s.treatment}/${s.location}`,
      hero: s.hero,
      cta_primary: "Start the assessment",
      cta_secondary: "Learn more",
      form_config: { assessment_slug: s.assessment, mode: "full" },
      routing_config: { sample: true },
      current_version: 1,
      published_at: new Date().toISOString(),
      assessment_placement: ["below_hero"],
      assessment_status: "published",
    };

    const { error: pErr } = await sb.from("cs_pages").upsert(pageRow, { onConflict: "path" });
    if (pErr) throw pErr;

    const { data: existingVersion } = await sb
      .from("cs_page_versions")
      .select("id")
      .eq("page_id", s.pageId)
      .eq("version", 1)
      .maybeSingle();

    if (existingVersion) {
      const { error: vErr } = await sb
        .from("cs_page_versions")
        .update({ blocks: s.blocks, change_summary: "Sample ads campaign seed" })
        .eq("id", existingVersion.id);
      if (vErr) throw vErr;
    } else {
      const { error: vErr } = await sb.from("cs_page_versions").insert({
        page_id: s.pageId,
        version: 1,
        snapshot: {},
        blocks: s.blocks,
        change_summary: "Sample ads campaign seed",
      });
      if (vErr) throw vErr;
    }

    console.log("OK", path, "→", `https://ads.novalyte.io/${s.treatment}/${s.location}`);
  }

  console.log("Seeded 3 sample ads campaigns (published, noindex_follow).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
