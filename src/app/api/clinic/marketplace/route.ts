import { NextResponse } from "next/server";
import { z } from "zod";
import { FEATURED_CATALOG } from "@/lib/marketplace/featured-catalog";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { resolveClinicTenant } from "@/lib/clinic/tenant";
import { workforceAuthErrorResponse } from "@/lib/workforce/auth";

const orderSchema = z.object({
  skuSlug: z.string().min(1),
  quantity: z.number().int().min(1).max(100).default(1),
  notes: z.string().max(2000).optional().nullable(),
  clinicId: z.string().min(1).optional(),
});

export async function GET(request: Request) {
  try {
    const tenant = await resolveClinicTenant(request);
    const admin = getSupabaseAdmin();
    let orders: unknown[] = [];
    if (tenant.activeOrganizationId) {
      const { data, error } = await admin
        .from("clinic_marketplace_orders")
        .select("*")
        .eq("organization_id", tenant.activeOrganizationId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (!error) orders = data ?? [];
    }

    return NextResponse.json({
      catalog: FEATURED_CATALOG.map((sku) => ({
        slug: sku.slug,
        headline: sku.headline,
        summary: sku.summary,
        guidePrice: sku.guidePrice,
        leadTime: sku.leadTime,
        audience: sku.audience,
        image: sku.image,
      })),
      orders,
    });
  } catch (error) {
    const authResponse = workforceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    console.error("clinic marketplace failed", error);
    return NextResponse.json({ error: "Unable to load marketplace." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const tenant = await resolveClinicTenant(request);
    if (!tenant.activeOrganizationId) {
      return NextResponse.json({ error: "Organization required." }, { status: 400 });
    }
    const parsed = orderSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid quote request." }, { status: 400 });
    }
    const sku = FEATURED_CATALOG.find((s) => s.slug === parsed.data.skuSlug);
    if (!sku) return NextResponse.json({ error: "Unknown SKU." }, { status: 404 });

    const clinicId = parsed.data.clinicId || tenant.clinicIds[0] || null;
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("clinic_marketplace_orders")
      .insert({
        organization_id: tenant.activeOrganizationId,
        clinic_id: clinicId,
        sku_slug: sku.slug,
        quantity: parsed.data.quantity,
        notes: parsed.data.notes ?? null,
        status: "quote_requested",
        created_by_user_id: tenant.userId,
      })
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json({ order: data }, { status: 201 });
  } catch (error) {
    const authResponse = workforceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    console.error("clinic marketplace order failed", error);
    return NextResponse.json({ error: "Unable to create quote request." }, { status: 500 });
  }
}
