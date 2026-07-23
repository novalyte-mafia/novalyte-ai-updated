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
      eyebrow: "Phoenix, Arizona · Testosterone Care",
      headline: "Explore Testosterone Care Options in Phoenix",
      subheadline:
        "Answer a few short questions about your goals, preferences, timeline, and consultation readiness. Novalyte AI will organize relevant educational guidance and potential Phoenix-area clinic options for your review.",
    },
    ctaPrimary: "Start My Assessment",
    ctaSecondary: "Find Phoenix Clinics",
    seoTitle: "Explore testosterone care options in Phoenix | Novalyte AI",
    seoDescription:
      "Informational TRT assessment for Phoenix-area patients. Licensed providers decide eligibility — Novalyte AI does not provide medical care.",
    blocks: [
      {
        type: "value_props",
        title: "Why patients start here",
        items: [
          {
            title: "Phoenix-focused navigation",
            description:
              "Location-aware guidance for men exploring testosterone care options in the Phoenix area.",
          },
          {
            title: "Informational assessment",
            description:
              "Share your goals and preferences so clinics can review fit — this is not a diagnosis or prescription.",
          },
          {
            title: "Licensed clinics decide care",
            description:
              "Novalyte AI does not provide medical treatment. Providers determine eligibility and next steps.",
          },
        ],
      },
      {
        type: "answer_cards",
        title: "Quick answers about TRT in Phoenix",
        items: [
          {
            id: "phoenix-trt-cost",
            question: "How much does TRT cost in Phoenix?",
            answer:
              "TRT pricing in Phoenix may vary based on laboratory testing, provider consultations, medication, supplies, follow-up monitoring, and whether the clinic offers a bundled monthly program. Before selecting a provider, ask whether the advertised price includes laboratory work, medication, supplies, and follow-up appointments. Complete the Novalyte assessment to organize your preferences and explore relevant options.",
            intent: "cost",
            relatedKeyword: "how much does TRT cost in Phoenix",
            ctaLabel: "Start My Assessment",
            ctaType: "assessment",
            status: "approved",
            lastReviewed: "2026-07-23",
          },
          {
            id: "phoenix-trt-clinics",
            question: "How do I find TRT clinics in Phoenix?",
            answer:
              "You can browse verified clinics in the Novalyte directory and filter by location and specialty. Clinic listings may include telehealth and in-person options. Completing the assessment helps organize your preferences so you can compare options that fit your goals — Novalyte AI does not guarantee a specific clinic match.",
            intent: "provider-search",
            relatedKeyword: "TRT clinics in Phoenix",
            ctaLabel: "Find Phoenix Clinics",
            ctaType: "directory",
            status: "approved",
            lastReviewed: "2026-07-23",
          },
          {
            id: "phoenix-trt-insurance",
            question: "Does insurance cover TRT in Arizona?",
            answer:
              "Coverage depends on your plan, medical documentation, and the clinic’s billing practices. Some patients use insurance for labs or consultations, while medication or membership programs may be self-pay. Ask each clinic what they bill and what is typically self-pay before you commit.",
            intent: "insurance",
            relatedKeyword: "does insurance cover TRT in Arizona",
            ctaLabel: "Organize My Preferences",
            ctaType: "assessment",
            status: "approved",
            lastReviewed: "2026-07-23",
          },
          {
            id: "phoenix-trt-telehealth",
            question: "Is TRT telehealth available in Arizona?",
            answer:
              "Some Arizona clinics offer telehealth consultations, hybrid care, or in-person visits. Availability varies by provider and state requirements. Use the assessment to share your preferred care format, then explore clinics that list telehealth or in-person options.",
            intent: "telehealth",
            relatedKeyword: "TRT telehealth in Arizona",
            ctaLabel: "Start My Assessment",
            ctaType: "assessment",
            status: "approved",
            lastReviewed: "2026-07-23",
          },
          {
            id: "phoenix-trt-labs",
            question: "What blood tests are often discussed before TRT?",
            answer:
              "Clinics commonly review laboratory markers as part of an evaluation, but the exact panel is determined by a licensed provider based on your history and presentation. Novalyte AI does not order labs or interpret results. Complete the assessment to share your readiness for consultation and lab discussion with a clinic.",
            intent: "testing",
            relatedKeyword: "what blood tests are needed before TRT",
            ctaLabel: "Compare My Options",
            ctaType: "assessment",
            status: "approved",
            lastReviewed: "2026-07-23",
          },
        ],
      },
      {
        type: "cost_factors",
        title: "What can affect TRT pricing?",
        items: [
          { title: "Initial consultation" },
          { title: "Laboratory testing" },
          { title: "Medication" },
          { title: "Injection supplies" },
          { title: "Follow-up monitoring" },
          { title: "Program or membership fees" },
          { title: "In-person versus telehealth care" },
          { title: "Additional clinic services" },
        ],
      },
      {
        type: "faq",
        title: "Frequently asked questions",
        items: [
          {
            question: "Is this medical advice?",
            answer:
              "No. The assessment is informational only. Licensed providers make clinical decisions.",
          },
          {
            question: "Does submitting guarantee treatment?",
            answer:
              "No. Submission does not guarantee eligibility, an appointment, treatment, or a clinic match.",
          },
          {
            question: "Is Novalyte a clinic?",
            answer:
              "No. Novalyte AI is a healthcare technology platform and facilitator that helps patients explore educational information and clinic options.",
          },
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
      eyebrow: "Beverly Hills, California · Longevity",
      headline: "Explore Longevity and Preventive Care Options in Beverly Hills",
      subheadline:
        "Answer a few short questions about your goals and timeline. Novalyte AI organizes educational guidance and potential clinic options — licensed providers decide care.",
    },
    ctaPrimary: "Start My Assessment",
    ctaSecondary: "Find Beverly Hills Clinics",
    seoTitle: "Explore longevity and preventive health options in Beverly Hills",
    seoDescription:
      "Informational longevity assessment for Beverly Hills-area patients. Treatment decisions are made by licensed providers.",
    blocks: [
      {
        type: "value_props",
        title: "Longevity, thoughtfully introduced",
        items: [
          {
            title: "Beverly Hills market context",
            description:
              "Messaging tailored for patients exploring longevity and preventive care locally.",
          },
          {
            title: "No outcome guarantees",
            description: "We do not claim guaranteed results or eligibility.",
          },
        ],
      },
      {
        type: "answer_cards",
        title: "Quick answers about longevity care in Beverly Hills",
        items: [
          {
            question: "What does a longevity clinic typically evaluate?",
            answer:
              "Longevity-focused clinics may discuss labs, lifestyle factors, preventive screening, and ongoing monitoring. Exact evaluations are determined by licensed providers. Novalyte AI helps you organize preferences and explore options — it does not diagnose or treat.",
            intent: "treatment-process",
            ctaLabel: "Start My Assessment",
            ctaType: "assessment",
            status: "approved",
            lastReviewed: "2026-07-23",
          },
          {
            question: "How do I compare longevity clinics near Beverly Hills?",
            answer:
              "Use the Novalyte directory to browse verified clinics and review listed specialties, formats, and locations. Completing the assessment first can clarify your goals so you know what to ask each clinic.",
            intent: "provider-search",
            ctaLabel: "Find Beverly Hills Clinics",
            ctaType: "directory",
            status: "approved",
            lastReviewed: "2026-07-23",
          },
        ],
      },
      {
        type: "faq",
        title: "Common questions",
        items: [
          {
            question: "Is Novalyte a clinic?",
            answer: "No. Novalyte AI facilitates education, assessments, and clinic discovery.",
          },
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
      eyebrow: "Palo Alto, California · Sexual Health",
      headline: "Explore Sexual Health Care Options in Palo Alto",
      subheadline:
        "Complete a private informational assessment. Novalyte AI helps you navigate options — licensed clinics provide care.",
    },
    ctaPrimary: "Start My Assessment",
    ctaSecondary: "Find Palo Alto Clinics",
    seoTitle: "Explore sexual health clinic options in Palo Alto",
    seoDescription:
      "Informational sexual-health assessment for Palo Alto-area patients. Licensed providers determine eligibility and care.",
    blocks: [
      {
        type: "value_props",
        title: "Private, informational support",
        items: [
          {
            title: "Palo Alto-focused",
            description:
              "Built for patients exploring sexual health options in the Palo Alto area.",
          },
          {
            title: "Assessment on the page",
            description: "Complete the assessment without leaving this landing page.",
          },
        ],
      },
      {
        type: "answer_cards",
        title: "Quick answers about sexual health care in Palo Alto",
        items: [
          {
            question: "Is this assessment private?",
            answer:
              "The assessment is designed to capture preferences and contact details through Novalyte’s secure application flow. Sensitive answers are not sent to ordinary marketing analytics tools. Licensed providers make clinical decisions after review.",
            intent: "consultation",
            ctaLabel: "Start My Assessment",
            ctaType: "assessment",
            status: "approved",
            lastReviewed: "2026-07-23",
          },
          {
            question: "Can I browse clinics without finishing the assessment?",
            answer:
              "Yes. Find Clinics opens the Novalyte directory in a new tab so you can explore independently while keeping this campaign page open.",
            intent: "provider-search",
            ctaLabel: "Find Palo Alto Clinics",
            ctaType: "directory",
            status: "approved",
            lastReviewed: "2026-07-23",
          },
        ],
      },
      {
        type: "faq",
        title: "Common questions",
        items: [
          {
            question: "Can I get treatment from Novalyte?",
            answer: "Novalyte AI does not provide medical care. Licensed providers do.",
          },
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
      cta_primary: s.ctaPrimary ?? "Start My Assessment",
      cta_secondary: s.ctaSecondary ?? "Find Clinics",
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
        .update({ blocks: s.blocks, change_summary: "Sample ads campaign seed (engine v2)" })
        .eq("id", existingVersion.id);
      if (vErr) throw vErr;
    } else {
      const { error: vErr } = await sb.from("cs_page_versions").insert({
        page_id: s.pageId,
        version: 1,
        snapshot: {},
        blocks: s.blocks,
        change_summary: "Sample ads campaign seed (engine v2)",
      });
      if (vErr) throw vErr;
    }

    console.log("OK", path, "→", `https://ads.novalyte.io/${s.treatment}/${s.location}`);
  }

  // Named non-geo campaign example: ads.novalyte.io/campaign/phoenix-trt-july
  const named = {
    campaignId: "c1000000-0000-4000-8000-000000000004",
    pageId: "d1000000-0000-4000-8000-000000000004",
  };
  await sb.from("cs_campaigns").upsert(
    {
      id: named.campaignId,
      name: "Sample · Phoenix TRT July (named)",
      internal_name: "sample-campaign-phoenix-trt-july",
      objective: "patient_acquisition",
      traffic_type: "paid_search",
      vertical_id: verticalIds.trt,
      status: "active",
      settings: { sample: true, protected: true },
    },
    { onConflict: "id" },
  );
  const namedPath = "/ads/campaign/phoenix-trt-july";
  await sb.from("cs_pages").upsert(
    {
      id: named.pageId,
      campaign_id: named.campaignId,
      template_version_id: templateVersionId,
      page_type: "paid_conversion",
      host: "ads",
      slug: "campaign/phoenix-trt-july",
      path: namedPath,
      service_slug: "trt",
      state_slug: "arizona",
      city_slug: "phoenix-az",
      geo_id: "a1000000-0000-4000-8000-000000000020",
      vertical_id: verticalIds.trt,
      status: "published",
      indexing_policy: "noindex_follow",
      public_title: "Phoenix TRT July Campaign",
      internal_title: "Sample · Phoenix TRT July (named)",
      seo_title: "Phoenix TRT campaign | Novalyte AI",
      seo_description:
        "Sample named campaign route demonstrating ads.novalyte.io/campaign/{slug}.",
      canonical_url: "https://ads.novalyte.io/campaign/phoenix-trt-july",
      hero: {
        eyebrow: "Phoenix, Arizona · Testosterone Care",
        headline: "Explore Testosterone Care Options in Phoenix",
        subheadline:
          "This named campaign URL uses the same shared landing template as treatment × location pages.",
      },
      cta_primary: "Start My Assessment",
      cta_secondary: "Find Phoenix Clinics",
      form_config: { assessment_slug: "testosterone-replacement-therapy", mode: "full" },
      routing_config: { sample: true, named: true },
      current_version: 1,
      published_at: new Date().toISOString(),
      assessment_placement: ["below_hero"],
      assessment_status: "published",
    },
    { onConflict: "path" },
  );
  const phoenixBlocks = samples[0].blocks;
  const { data: namedVersion } = await sb
    .from("cs_page_versions")
    .select("id")
    .eq("page_id", named.pageId)
    .eq("version", 1)
    .maybeSingle();
  if (namedVersion) {
    await sb
      .from("cs_page_versions")
      .update({ blocks: phoenixBlocks, change_summary: "Named campaign seed" })
      .eq("id", namedVersion.id);
  } else {
    await sb.from("cs_page_versions").insert({
      page_id: named.pageId,
      version: 1,
      snapshot: {},
      blocks: phoenixBlocks,
      change_summary: "Named campaign seed",
    });
  }
  console.log("OK", namedPath, "→", "https://ads.novalyte.io/campaign/phoenix-trt-july");

  console.log("Seeded sample ads campaigns (published, noindex_follow).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
