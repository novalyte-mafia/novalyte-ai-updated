import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { processPendingFormNotifications } from "@/lib/form-notifications";

function authorized(request: Request): boolean {
  const expected =
    process.env.FORM_NOTIFICATION_CRON_SECRET?.trim() ||
    process.env.CRON_SECRET?.trim();
  if (!expected) return false;
  const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const results = await processPendingFormNotifications(50);
    const summary = results.reduce<Record<string, number>>((counts, result) => {
      counts[result.status] = (counts[result.status] ?? 0) + 1;
      return counts;
    }, {});
    return NextResponse.json({ ok: true, processed: results.length, summary });
  } catch (error) {
    console.error("form notification retry worker failed", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
    return NextResponse.json({ error: "Notification retry failed." }, { status: 500 });
  }
}
