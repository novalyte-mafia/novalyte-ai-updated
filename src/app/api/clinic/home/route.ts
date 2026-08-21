import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { resolveClinicTenant } from "@/lib/clinic/tenant";
import { workforceAuthErrorResponse } from "@/lib/workforce/auth";

function startOfDayIso(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString();
}

function startOfMonthIso(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
}

function daysAgoIso(days: number) {
  const x = new Date();
  x.setDate(x.getDate() - days);
  return x.toISOString();
}

export async function GET(request: Request) {
  try {
    const tenant = await resolveClinicTenant(request);
    if (!tenant.clinicIds.length) {
      return NextResponse.json({
        kpis: {
          leadsToday: 0,
          leadsMonth: 0,
          unreadLeads: 0,
          openJobs: 0,
          teamCount: 0,
          directoryStatus: "none",
          pendingTasks: 0,
        },
        charts: { trend: [], byStatus: [], bySource: [] },
        activity: [],
        deferred: {
          revenueInfluenced: "Unavailable until billing attribution exists",
          campaignRoi: "Unavailable until campaign attribution is linked",
        },
      });
    }

    const admin = getSupabaseAdmin();
    const clinicIds = tenant.clinicIds;
    const orgId = tenant.activeOrganizationId;

    const todayIso = startOfDayIso();
    const monthIso = startOfMonthIso();
    const trendStart = daysAgoIso(29);

    const [
      leadsTodayRes,
      leadsMonthRes,
      unreadRes,
      jobsRes,
      teamRes,
      assignmentsRes,
      eventsRes,
      notifRes,
      tasksRes,
    ] = await Promise.all([
      admin
        .from("lead_assignments")
        .select("id", { count: "exact", head: true })
        .in("clinic_id", clinicIds)
        .gte("delivered_at", todayIso),
      admin
        .from("lead_assignments")
        .select("id", { count: "exact", head: true })
        .in("clinic_id", clinicIds)
        .gte("delivered_at", monthIso),
      admin
        .from("lead_assignments")
        .select("id", { count: "exact", head: true })
        .in("clinic_id", clinicIds)
        .in("status", ["delivered", "pending"]),
      orgId
        ? admin
            .from("JobPosting")
            .select("id", { count: "exact", head: true })
            .eq("organization_id", orgId)
            .eq("status", "open")
        : Promise.resolve({ count: 0, error: null }),
      orgId
        ? admin
            .from("organization_memberships")
            .select("id", { count: "exact", head: true })
            .eq("organization_id", orgId)
            .eq("status", "active")
        : Promise.resolve({ count: 0, error: null }),
      admin
        .from("lead_assignments")
        .select("id, status, delivered_at, clinic_id, lead_id, patient_leads(source, campaign_source, treatment_interest)")
        .in("clinic_id", clinicIds)
        .gte("delivered_at", trendStart)
        .order("delivered_at", { ascending: true })
        .limit(500),
      (async () => {
        const idsRes = await admin
          .from("lead_assignments")
          .select("id")
          .in("clinic_id", clinicIds)
          .limit(200);
        const ids = (idsRes.data ?? []).map((r) => r.id);
        if (!ids.length) return { data: [] as Array<Record<string, unknown>>, error: null };
        return admin
          .from("lead_events")
          .select("id, action, created_at, lead_id, assignment_id, payload")
          .in("assignment_id", ids)
          .order("created_at", { ascending: false })
          .limit(20);
      })(),
      admin
        .from("portal_notifications")
        .select("id, title, body, type, created_at, payload, read_at")
        .or(
          orgId
            ? `user_id.eq.${tenant.userId},organization_id.eq.${orgId}`
            : `user_id.eq.${tenant.userId}`,
        )
        .order("created_at", { ascending: false })
        .limit(15),
      admin
        .from("clinic_tasks")
        .select("id", { count: "exact", head: true })
        .in("clinic_id", clinicIds)
        .eq("status", "open"),
    ]);

    const directoryStatus =
      tenant.clinics.length === 0
        ? "none"
        : (
            await admin
              .from("prospect_directory_profiles")
              .select("publicationStatus, listingStatus")
              .in(
                "publicClinicId",
                clinicIds,
              )
              .limit(5)
          ).data?.[0]?.publicationStatus ||
          (
            await admin
              .from("Clinic")
              .select("claimStatus, verificationStatus")
              .in("id", clinicIds)
              .limit(1)
          ).data?.[0]?.claimStatus ||
          "claimed";

    const assignments = assignmentsRes.data ?? [];
    const trendMap = new Map<string, number>();
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      trendMap.set(d.toISOString().slice(0, 10), 0);
    }
    const byStatus: Record<string, number> = {};
    const bySource: Record<string, number> = {};

    for (const row of assignments) {
      const day = (row.delivered_at as string)?.slice(0, 10);
      if (day && trendMap.has(day)) trendMap.set(day, (trendMap.get(day) ?? 0) + 1);
      byStatus[row.status] = (byStatus[row.status] ?? 0) + 1;
      const lead = Array.isArray(row.patient_leads) ? row.patient_leads[0] : row.patient_leads;
      const source =
        (lead as { campaign_source?: string; source?: string } | null)?.campaign_source ||
        (lead as { source?: string } | null)?.source ||
        "unknown";
      bySource[source] = (bySource[source] ?? 0) + 1;
    }

    const activity = [
      ...(eventsRes.data ?? []).map((e) => ({
        id: `event-${e.id}`,
        kind: "lead_event" as const,
        title: e.action.replace(/_/g, " "),
        at: e.created_at,
        href: e.assignment_id ? `/clinic/leads/${e.assignment_id}` : "/clinic/leads",
      })),
      ...(notifRes.data ?? []).map((n) => ({
        id: `notif-${n.id}`,
        kind: "notification" as const,
        title: n.title,
        at: n.created_at,
        href:
          typeof (n.payload as { href?: string } | null)?.href === "string"
            ? (n.payload as { href: string }).href
            : "/clinic/messages",
      })),
    ]
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, 20);

    return NextResponse.json({
      kpis: {
        leadsToday: leadsTodayRes.count ?? 0,
        leadsMonth: leadsMonthRes.count ?? 0,
        unreadLeads: unreadRes.count ?? 0,
        openJobs: jobsRes.count ?? 0,
        teamCount: teamRes.count ?? 0,
        directoryStatus,
        pendingTasks: tasksRes.error ? 0 : tasksRes.count ?? 0,
      },
      charts: {
        trend: [...trendMap.entries()].map(([date, count]) => ({ date, count })),
        byStatus: Object.entries(byStatus).map(([status, count]) => ({ status, count })),
        bySource: Object.entries(bySource).map(([source, count]) => ({ source, count })),
      },
      activity,
      deferred: {
        revenueInfluenced: "Unavailable until billing attribution exists",
        campaignRoi: "Unavailable until campaign attribution is linked",
      },
    });
  } catch (error) {
    const authResponse = workforceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    console.error("Clinic home failed", error);
    return NextResponse.json({ error: "Unable to load clinic home." }, { status: 500 });
  }
}
