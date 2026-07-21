import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  INVESTOR_GATE_COOKIE,
  GATE_COOKIE_OPTIONS,
  createGateToken,
  isValidAccessCode,
} from "@/lib/investor/gate";

const schema = z.object({ code: z.string().min(1).max(40) });
const attempts = new Map<string, { count: number; resetAt: number }>();

function rateKey(request: Request): string {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const salt = process.env.INVESTOR_GATE_SECRET || "novalyte-investor-gate";
  return crypto.createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export async function POST(request: Request) {
  try {
    const key = rateKey(request);
    const now = Date.now();
    const entry = attempts.get(key);
    if (entry && now < entry.resetAt) {
      if (entry.count >= 8) {
        return NextResponse.json(
          { error: "Too many attempts. Try again shortly." },
          { status: 429 },
        );
      }
      entry.count += 1;
    } else {
      attempts.set(key, { count: 1, resetAt: now + 10 * 60 * 1000 });
    }

    const { code } = schema.parse(await request.json());

    if (!isValidAccessCode(code)) {
      return NextResponse.json({ error: "Invalid access code." }, { status: 401 });
    }

    try {
      await getSupabaseAdmin().from("investor_access_events").insert({
        event_type: "gate_unlocked",
        metadata: { via: "access_code" },
      });
    } catch {
      // non-blocking
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(INVESTOR_GATE_COOKIE, createGateToken(), GATE_COOKIE_OPTIONS);
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Enter the access code." }, { status: 400 });
    }
    console.error("investor gate error", error);
    return NextResponse.json({ error: "Unable to verify access code." }, { status: 500 });
  }
}
