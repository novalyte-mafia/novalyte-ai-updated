import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { z } from "zod";
import { captureServerEvent } from "@/lib/posthog-server";

const schema = z.object({
  treatmentType: z.string().max(160).optional().nullable(),
  ageRange: z.string().max(40).optional().nullable(),
  locationState: z.string().max(60).optional().nullable(),
  zip: z.string().max(20).optional().nullable(),
  concerns: z.array(z.string()).optional().nullable(),
  symptoms: z.array(z.string()).optional().nullable(),
  treatmentInterest: z.string().max(160).optional().nullable(),
  careFormat: z.string().max(40).optional().nullable(),
  telehealthPref: z.boolean().optional().nullable(),
  timeline: z.string().max(60).optional().nullable(),
  selfPayOpenness: z.string().max(60).optional().nullable(),
  budgetRange: z.string().max(60).optional().nullable(),
  firstName: z.string().max(80).optional().nullable(),
  lastName: z.string().max(80).optional().nullable(),
  email: z.string().email().max(160).optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  preferredContact: z.string().max(40).optional().nullable(),
  bestTime: z.string().max(80).optional().nullable(),
  consentContact: z.boolean().optional().nullable(),
  consentSms: z.boolean().optional().nullable(),
  contactName: z.string().max(120).optional().nullable(),
  contactEmail: z.string().email().max(160).optional().nullable(),
  consent: z.boolean().optional().nullable(),
  internalStatus: z.string().max(60).optional().nullable(),
  matchedClinicIds: z.array(z.string()).optional().nullable(),
  sourcePage: z.string().max(160).optional().nullable(),
  csPageId: z.string().uuid().optional().nullable(),
  csCampaignId: z.string().uuid().optional().nullable(),
  assessmentTemplateId: z.string().uuid().optional().nullable(),
  assessmentVersion: z.number().int().optional().nullable(),
  pageVersion: z.number().int().optional().nullable(),
  utmSource: z.string().max(120).optional().nullable(),
  utmMedium: z.string().max(120).optional().nullable(),
  utmCampaign: z.string().max(120).optional().nullable(),
  utmContent: z.string().max(120).optional().nullable(),
  utmTerm: z.string().max(120).optional().nullable(),
  trafficSource: z.string().max(80).optional().nullable(),
  deviceType: z.string().max(40).optional().nullable(),
  consentVersion: z.string().max(40).optional().nullable(),
  startTime: z.string().max(40).optional().nullable(),
  completionTime: z.string().max(40).optional().nullable(),
  assessmentMode: z.enum(["full", "short"]).optional().nullable(),
  host: z.string().max(20).optional().nullable(),
  pagePath: z.string().max(200).optional().nullable(),
});

function buildSourcePage(d: z.infer<typeof schema>): string | null {
  if (d.sourcePage) return d.sourcePage;
  if (d.csPageId) {
    const campaign = d.csCampaignId ? `:${d.csCampaignId}` : "";
    return `campaign:${d.csPageId}${campaign}`.slice(0, 160);
  }
  return null;
}

function buildAttributionJson(d: z.infer<typeof schema>): Record<string, unknown> | null {
  const hasCampaignContext = Boolean(
    d.csPageId ||
      d.csCampaignId ||
      d.utmSource ||
      d.utmMedium ||
      d.utmCampaign ||
      d.trafficSource,
  );
  if (!hasCampaignContext) return null;

  return {
    csPageId: d.csPageId ?? null,
    csCampaignId: d.csCampaignId ?? null,
    assessmentTemplateId: d.assessmentTemplateId ?? null,
    assessmentVersion: d.assessmentVersion ?? null,
    pageVersion: d.pageVersion ?? null,
    utmSource: d.utmSource ?? null,
    utmMedium: d.utmMedium ?? null,
    utmCampaign: d.utmCampaign ?? null,
    utmContent: d.utmContent ?? null,
    utmTerm: d.utmTerm ?? null,
    trafficSource: d.trafficSource ?? null,
    deviceType: d.deviceType ?? null,
    consentVersion: d.consentVersion ?? null,
    startTime: d.startTime ?? null,
    completionTime: d.completionTime ?? null,
    assessmentMode: d.assessmentMode ?? null,
    host: d.host ?? null,
    pagePath: d.pagePath ?? null,
  };
}

async function incrementCampaignAnalytics(
  pageId: string,
  field: "assessment_completions" | "leads",
) {
  try {
    const supabase = getSupabaseAdmin();
    const today = new Date().toISOString().slice(0, 10);
    const { data: existing } = await supabase
      .from("cs_page_analytics_daily")
      .select(field)
      .eq("page_id", pageId)
      .eq("day", today)
      .maybeSingle();

    const current = (existing?.[field] as number | undefined) ?? 0;
    await supabase.from("cs_page_analytics_daily").upsert(
      { page_id: pageId, day: today, [field]: current + 1 },
      { onConflict: "page_id,day" },
    );
  } catch (e) {
    console.error("campaign analytics increment failed", e);
  }
}

async function promoteCampaignLead(
  assessmentId: string,
  d: z.infer<typeof schema>,
) {
  const supabase = getSupabaseAdmin();

  const { data: leadId, error: rpcError } = await supabase.rpc(
    "promote_assessment_to_patient_lead",
    { p_assessment_id: assessmentId },
  );

  if (rpcError) {
    console.error("promote_assessment_to_patient_lead failed", rpcError);
    return;
  }

  if (!leadId || !d.csPageId) return;

  await supabase
    .from("patient_leads")
    .update({
      source: "campaign",
      cs_page_id: d.csPageId,
      cs_campaign_id: d.csCampaignId ?? null,
      lead_source: "campaign",
      source_page: buildSourcePage(d),
    })
    .eq("id", leadId);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const d = parsed.data;
    const sourcePage = buildSourcePage(d);
    const attributionJson = buildAttributionJson(d);

    const record = await db.assessmentSubmission.create({
      data: {
        treatmentType: d.treatmentType ?? null,
        ageRange: d.ageRange ?? null,
        locationState: d.locationState ?? null,
        zip: d.zip ?? null,
        concerns: (d.concerns ?? []).join(","),
        symptoms: (d.symptoms ?? []).join(","),
        treatmentInterest: d.treatmentInterest ?? null,
        careFormat: d.careFormat ?? null,
        telehealthPref: d.telehealthPref ?? false,
        timeline: d.timeline ?? null,
        selfPayOpenness: d.selfPayOpenness ?? null,
        budgetRange: d.budgetRange ?? null,
        firstName: d.firstName ?? null,
        lastName: d.lastName ?? null,
        email: d.email ?? null,
        phone: d.phone ?? null,
        preferredContact: d.preferredContact ?? null,
        bestTime: d.bestTime ?? null,
        consentContact: d.consentContact ?? false,
        consentSms: d.consentSms ?? false,
        contactName:
          d.contactName ??
          (d.firstName && d.lastName ? `${d.firstName} ${d.lastName}` : null),
        contactEmail: d.contactEmail ?? d.email ?? null,
        consent: d.consent ?? d.consentContact ?? false,
        internalStatus: d.internalStatus ?? null,
        matchedClinicIds: (d.matchedClinicIds ?? []).join(","),
        sourcePage,
        csPageId: d.csPageId ?? null,
        csCampaignId: d.csCampaignId ?? null,
        attributionJson,
      },
    });

    const isCampaign = Boolean(d.csPageId);
    const hasConsent = d.consentContact ?? d.consent ?? false;

    if (isCampaign && hasConsent) {
      await promoteCampaignLead(record.id, d);
      await incrementCampaignAnalytics(d.csPageId!, "leads");
    }

    if (isCampaign) {
      await incrementCampaignAnalytics(d.csPageId!, "assessment_completions");
    }

    await captureServerEvent({
      distinctId: record.id,
      event: isCampaign ? "campaign_assessment_completed" : "assessment_submitted",
      properties: {
        treatment_type: d.treatmentType ?? null,
        care_format: d.careFormat ?? null,
        telehealth_pref: d.telehealthPref ?? false,
        location_state: d.locationState ?? null,
        timeline: d.timeline ?? null,
        source_page: sourcePage,
        page_id: d.csPageId ?? null,
        campaign_id: d.csCampaignId ?? null,
        assessment_type: d.treatmentType ?? null,
        host: d.host ?? null,
      },
    });

    return NextResponse.json({ ok: true, id: record.id });
  } catch (e) {
    console.error("assessment error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
