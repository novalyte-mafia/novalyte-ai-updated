import { NextResponse } from "next/server";
import { z } from "zod";

import {
  requireFounderAdmin,
  investorAuthErrorResponse,
  logInvestorEvent,
} from "@/lib/investor/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const updateSchema = z.object({
  type: z.literal("update"),
  title: z.string().min(2).max(200),
  summary: z.string().min(2).max(1000),
  body: z.string().max(20000).optional().or(z.literal("")),
  visibility: z.enum(["public", "approved_investors", "internal", "draft"]),
});

const termsSchema = z.object({
  type: z.literal("terms"),
  version: z.string().min(1).max(40),
  title: z.string().min(2).max(200),
  body: z.string().min(10).max(50000),
});

const schema = z.discriminatedUnion("type", [updateSchema, termsSchema]);

export async function POST(request: Request) {
  try {
    const founder = await requireFounderAdmin();
    const input = schema.parse(await request.json());
    const admin = getSupabaseAdmin();

    if (input.type === "update") {
      const publish = input.visibility !== "draft";
      const { error } = await admin.from("investor_updates").insert({
        title: input.title,
        summary: input.summary,
        body_markdown: input.body || "",
        visibility: input.visibility,
        published_at: publish ? new Date().toISOString() : null,
        created_by: founder.id,
      });
      if (error) {
        console.error("update insert failed", error);
        return NextResponse.json({ error: "Unable to save update." }, { status: 500 });
      }
      await logInvestorEvent({
        userId: founder.id,
        eventType: "update_published",
        section: "updates",
      });
      return NextResponse.json({ ok: true });
    }

    // terms
    const { error } = await admin.from("investor_terms_versions").upsert(
      {
        version: input.version,
        title: input.title,
        body_markdown: input.body,
        published_at: new Date().toISOString(),
        created_by: founder.id,
      },
      { onConflict: "version" },
    );
    if (error) {
      console.error("terms upsert failed", error);
      return NextResponse.json({ error: "Unable to publish terms." }, { status: 500 });
    }
    await logInvestorEvent({
      userId: founder.id,
      eventType: "terms_published",
      metadata: { version: input.version },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const authResponse = investorAuthErrorResponse(error);
    if (authResponse) return authResponse;
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }
    console.error("admin publish error", error);
    return NextResponse.json({ error: "Unable to publish." }, { status: 500 });
  }
}
