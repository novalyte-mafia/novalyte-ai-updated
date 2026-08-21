import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { resolveClinicTenant } from "@/lib/clinic/tenant";
import { canAccessBilling } from "@/lib/clinic/capabilities";
import { WorkforceAuthError, workforceAuthErrorResponse } from "@/lib/workforce/auth";

const PLANS = [
  {
    key: "free",
    name: "Free directory",
    priceLabel: "$0",
    features: ["Directory listing", "Lead inbox", "Team invites (limited)"],
  },
  {
    key: "growth",
    name: "Growth",
    priceLabel: "Coming soon",
    features: ["Priority lead routing", "Analytics export", "Marketplace quotes"],
  },
  {
    key: "scale",
    name: "Scale",
    priceLabel: "Coming soon",
    features: ["Multi-location", "AI assist digests", "SSO (later)"],
  },
];

export async function GET(request: Request) {
  try {
    const tenant = await resolveClinicTenant(request);
    if (!tenant.activeMembership || !canAccessBilling(tenant.activeMembership)) {
      throw new WorkforceAuthError("Billing is limited to owners and admins.", 403);
    }

    const admin = getSupabaseAdmin();
    let subscription = {
      plan_key: "free",
      status: "active",
      stripe_customer_id: null as string | null,
      stripe_subscription_id: null as string | null,
      current_period_end: null as string | null,
    };

    if (tenant.activeOrganizationId) {
      const { data } = await admin
        .from("clinic_subscriptions")
        .select("*")
        .eq("organization_id", tenant.activeOrganizationId)
        .maybeSingle();
      if (data) {
        subscription = {
          plan_key: data.plan_key,
          status: data.status,
          stripe_customer_id: data.stripe_customer_id,
          stripe_subscription_id: data.stripe_subscription_id,
          current_period_end: data.current_period_end,
        };
      } else {
        await admin.from("clinic_subscriptions").upsert({
          organization_id: tenant.activeOrganizationId,
          plan_key: "free",
          status: "active",
          updated_at: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({
      subscription,
      plans: PLANS,
      stripeEnabled: Boolean(process.env.STRIPE_SECRET_KEY),
      invoices: [] as unknown[],
      security: {
        twoFactor: "planned",
        auditLog: "available_via_clinic_audit_events",
        sso: "after_billing_stable",
      },
    });
  } catch (error) {
    const authResponse = workforceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    console.error("clinic billing failed", error);
    return NextResponse.json({ error: "Unable to load billing." }, { status: 500 });
  }
}
