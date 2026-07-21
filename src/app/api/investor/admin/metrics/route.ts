import { NextResponse } from "next/server";
import { z } from "zod";

import {
  requireFounderAdmin,
  investorAuthErrorResponse,
} from "@/lib/investor/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const schema = z.object({
  key: z.string().min(1).max(80),
  label: z.string().min(1).max(160),
  valueText: z.string().max(160).optional().or(z.literal("")),
  valueNumeric: z.string().max(40).optional().or(z.literal("")),
  unit: z.string().max(40).optional().or(z.literal("")),
  periodLabel: z.string().max(80).optional().or(z.literal("")),
  source: z.string().max(200).optional().or(z.literal("")),
  status: z.enum([
    "Actual",
    "Estimated",
    "Projected",
    "Target",
    "Under development",
    "Planned",
    "Founder-provided",
    "Pending validation",
  ]),
  visibility: z.enum(["public", "approved_investors", "internal", "draft"]),
});

export async function POST(request: Request) {
  try {
    const founder = await requireFounderAdmin();
    const input = schema.parse(await request.json());
    const numeric = input.valueNumeric ? Number(input.valueNumeric) : null;

    const { error } = await getSupabaseAdmin()
      .from("investor_metrics")
      .upsert(
        {
          key: input.key,
          label: input.label,
          value_text: input.valueText || null,
          value_numeric: Number.isFinite(numeric) ? numeric : null,
          unit: input.unit || null,
          period_label: input.periodLabel || null,
          source: input.source || null,
          status: input.status,
          visibility: input.visibility,
          last_updated_at: new Date().toISOString(),
          updated_by: founder.id,
        },
        { onConflict: "key" },
      );

    if (error) {
      console.error("metric upsert failed", error);
      return NextResponse.json({ error: "Unable to save metric." }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    const authResponse = investorAuthErrorResponse(error);
    if (authResponse) return authResponse;
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid metric." }, { status: 400 });
    }
    console.error("admin metric error", error);
    return NextResponse.json({ error: "Unable to save metric." }, { status: 500 });
  }
}
