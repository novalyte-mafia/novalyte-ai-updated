import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const schema = z.object({
  firstName: z.string().max(80).optional().nullable(),
  lastName: z.string().max(80).optional().nullable(),
  email: z.string().email().max(160).optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  message: z.string().max(2000).optional().nullable(),
  state: z.string().max(60).optional().nullable(),
  city: z.string().max(80).optional().nullable(),
  zip: z.string().max(20).optional().nullable(),
  treatmentInterest: z.string().max(160).optional().nullable(),
  csPageId: z.string().uuid().optional().nullable(),
  csCampaignId: z.string().uuid().optional().nullable(),
  consentContact: z.boolean().optional().nullable(),
});

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
    if (!d.email && !d.phone) {
      return NextResponse.json({ error: "Email or phone required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("patient_leads")
      .insert({
        source: "campaign",
        first_name: d.firstName?.trim() || "Patient",
        last_name: d.lastName?.trim() || "",
        email: d.email ?? null,
        phone: d.phone ?? null,
        state: d.state ?? null,
        city: d.city ?? null,
        zip: d.zip ?? null,
        treatment_interest: d.treatmentInterest ?? null,
        notes: d.message ?? null,
        consent_contact: d.consentContact ?? false,
        cs_page_id: d.csPageId ?? null,
        cs_campaign_id: d.csCampaignId ?? null,
        lead_source: "campaign",
        source_page: d.csPageId ? `campaign:${d.csPageId}` : "campaign",
        status: "new",
      })
      .select("id")
      .single();

    if (error) {
      console.error("campaign-leads insert failed", error);
      return NextResponse.json({ error: "Unable to save lead" }, { status: 500 });
    }

    if (d.csPageId) {
      const today = new Date().toISOString().slice(0, 10);
      const { data: existing } = await supabase
        .from("cs_page_analytics_daily")
        .select("leads")
        .eq("page_id", d.csPageId)
        .eq("day", today)
        .maybeSingle();

      const nextLeads = (existing?.leads ?? 0) + 1;
      await supabase.from("cs_page_analytics_daily").upsert(
        { page_id: d.csPageId, day: today, leads: nextLeads },
        { onConflict: "page_id,day" },
      );
    }

    return NextResponse.json({ ok: true, id: data.id });
  } catch (e) {
    console.error("campaign-leads error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
