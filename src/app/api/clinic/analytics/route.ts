import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { resolveClinicTenant } from "@/lib/clinic/tenant";
import { workforceAuthErrorResponse } from "@/lib/workforce/auth";

export async function GET(request: Request) {
  try {
    const tenant = await resolveClinicTenant(request);
    if (!tenant.clinicIds.length) {
      return NextResponse.json({
        summary: { totalLeads: 0, booked: 0, conversionRate: 0, contacted: 0 },
        bySource: [],
        byInterest: [],
        byStatus: [],
        byGeo: [],
        trend: [],
        exportReady: true,
      });
    }

    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("lead_assignments")
      .select(
        `
        id,
        status,
        delivered_at,
        patient_leads (
          source,
          campaign_source,
          treatment_interest,
          city,
          state
        )
      `,
      )
      .in("clinic_id", tenant.clinicIds)
      .order("delivered_at", { ascending: true })
      .limit(1000);
    if (error) throw error;

    const rows = data ?? [];
    const bySource: Record<string, number> = {};
    const byInterest: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const byGeo: Record<string, number> = {};
    const trendMap = new Map<string, number>();

    let booked = 0;
    let contacted = 0;

    for (const row of rows) {
      byStatus[row.status] = (byStatus[row.status] ?? 0) + 1;
      if (row.status === "booked") booked += 1;
      if (row.status === "contacted" || row.status === "booked" || row.status === "accepted") {
        contacted += 1;
      }
      const lead = Array.isArray(row.patient_leads) ? row.patient_leads[0] : row.patient_leads;
      const source =
        (lead as { campaign_source?: string; source?: string } | null)?.campaign_source ||
        (lead as { source?: string } | null)?.source ||
        "unknown";
      bySource[source] = (bySource[source] ?? 0) + 1;
      const interest =
        (lead as { treatment_interest?: string } | null)?.treatment_interest || "unspecified";
      byInterest[interest] = (byInterest[interest] ?? 0) + 1;
      const geo = (lead as { state?: string } | null)?.state || "unknown";
      byGeo[geo] = (byGeo[geo] ?? 0) + 1;
      const day = (row.delivered_at as string)?.slice(0, 10);
      if (day) trendMap.set(day, (trendMap.get(day) ?? 0) + 1);
    }

    const totalLeads = rows.length;
    const conversionRate = totalLeads ? Math.round((booked / totalLeads) * 1000) / 10 : 0;

    const format = new URL(request.url).searchParams.get("format");
    if (format === "csv") {
      const header = "assignment_id,status,delivered_at,source,interest,state\n";
      const lines = rows.map((row) => {
        const lead = Array.isArray(row.patient_leads) ? row.patient_leads[0] : row.patient_leads;
        const l = lead as {
          campaign_source?: string;
          source?: string;
          treatment_interest?: string;
          state?: string;
        } | null;
        return [
          row.id,
          row.status,
          row.delivered_at,
          l?.campaign_source || l?.source || "",
          l?.treatment_interest || "",
          l?.state || "",
        ]
          .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
          .join(",");
      });
      return new NextResponse(header + lines.join("\n"), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="clinic-leads-analytics.csv"',
        },
      });
    }

    return NextResponse.json({
      summary: { totalLeads, booked, conversionRate, contacted },
      bySource: Object.entries(bySource).map(([source, count]) => ({ source, count })),
      byInterest: Object.entries(byInterest).map(([interest, count]) => ({ interest, count })),
      byStatus: Object.entries(byStatus).map(([status, count]) => ({ status, count })),
      byGeo: Object.entries(byGeo).map(([state, count]) => ({ state, count })),
      trend: [...trendMap.entries()].map(([date, count]) => ({ date, count })),
      campaignNote:
        "Campaign ROI appears when ads attribution is linked to this clinic’s assignments.",
      exportReady: true,
    });
  } catch (error) {
    const authResponse = workforceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    console.error("clinic analytics failed", error);
    return NextResponse.json({ error: "Unable to load analytics." }, { status: 500 });
  }
}
