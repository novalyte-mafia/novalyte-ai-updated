import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  requireOrgRole,
  requireVerifiedUser,
  workforceAuthErrorResponse,
} from "@/lib/workforce/auth";

type LocationInput = {
  id?: string;
  name?: string;
  address?: string;
  phone?: string | null;
  hours?: string | null;
  parking?: string | null;
  transit?: string | null;
  accessibility?: string | null;
  onSiteLab?: boolean;
  phlebotomy?: boolean;
  earliestAppt?: string | null;
};

type ProviderInput = {
  id?: string;
  name?: string;
  credentials?: string;
  role?: string;
  specialties?: string | null;
  yearsExperience?: number;
  bio?: string | null;
  languages?: string | null;
  telehealth?: boolean;
  avatarUrl?: string | null;
};

type TreatmentInput = {
  id?: string;
  name?: string;
  category?: string;
  description?: string | null;
  concerns?: string | null;
  priceRange?: string | null;
  labRequired?: boolean;
  consultRequired?: boolean;
  careFormat?: string | null;
};

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireVerifiedUser(req);
    const { id } = await params;
    const body = await req.json();
    const admin = getSupabaseAdmin();
    const now = new Date().toISOString();

    const { data: clinic, error: clinicError } = await admin
      .from("Clinic")
      .select("id, organization_id")
      .eq("id", id)
      .maybeSingle();
    if (clinicError) throw clinicError;
    if (!clinic?.organization_id) {
      return NextResponse.json({ error: "Clinic is not linked to an approved organization." }, { status: 403 });
    }

    await requireOrgRole(user.id, clinic.organization_id, ["owner", "admin"]);

    const clinicUpdate: Record<string, unknown> = {
      name: body.name,
      tagline: body.tagline ?? "",
      overview: body.overview,
      phone: body.phone ?? "",
      email: body.email ?? "",
      website: body.website ?? "",
      hours: body.hours ?? "",
      acceptingNewPatients: !!body.acceptingNewPatients,
      initialConsultPrice:
        body.initialConsultPrice !== undefined && body.initialConsultPrice !== null
          ? Number(body.initialConsultPrice)
          : null,
      membershipPrice:
        body.membershipPrice !== undefined && body.membershipPrice !== null
          ? Number(body.membershipPrice)
          : null,
      insuranceAccepted: !!body.insuranceAccepted,
      hsaFsaAccepted: !!body.hsaFsaAccepted,
      earliestAvailability: body.earliestAvailability ?? "",
      statesServed: body.statesServed ?? "",
      languages: body.languages ?? "English",
      accessibility: body.accessibility ?? "Wheelchair accessible",
      pricingStatus: body.pricingStatus ?? "Full Pricing Published",
      whatToExpect: body.whatToExpect ?? "",
      profileCompleteness: Number(body.profileCompleteness) || 80,
      updatedAt: now,
    };
    if (typeof body.logoUrl === "string") {
      clinicUpdate.logoUrl = body.logoUrl;
    }

    const { data: updatedClinic, error: updateError } = await admin
      .from("Clinic")
      .update(clinicUpdate)
      .eq("id", id)
      .select("*")
      .single();
    if (updateError) throw updateError;

    if (Array.isArray(body.locations)) {
      const locations = body.locations as LocationInput[];
      await admin.from("ClinicLocation").delete().eq("clinicId", id);
      if (locations.length) {
        const rows = locations.map((loc) => ({
          id: loc.id && String(loc.id).length > 0 ? String(loc.id) : randomUUID(),
          clinicId: id,
          name: loc.name ?? "Location",
          address: loc.address ?? "",
          phone: loc.phone ?? null,
          hours: loc.hours ?? null,
          parking: loc.parking ?? null,
          transit: loc.transit ?? null,
          accessibility: loc.accessibility ?? null,
          onSiteLab: !!loc.onSiteLab,
          phlebotomy: !!loc.phlebotomy,
          earliestAppt: loc.earliestAppt ?? null,
          createdAt: now,
          updatedAt: now,
        }));
        const { error } = await admin.from("ClinicLocation").insert(rows);
        if (error) throw error;
      }
    }

    if (Array.isArray(body.providers)) {
      const providers = body.providers as ProviderInput[];
      await admin.from("ClinicProvider").delete().eq("clinicId", id);
      if (providers.length) {
        const rows = providers.map((prov) => ({
          id: prov.id && String(prov.id).length > 0 ? String(prov.id) : randomUUID(),
          clinicId: id,
          name: prov.name ?? "Provider",
          credentials: prov.credentials ?? "",
          role: prov.role ?? "Physician",
          specialties: prov.specialties ?? null,
          yearsExperience: Number(prov.yearsExperience) || 0,
          bio: prov.bio ?? null,
          languages: prov.languages ?? "English",
          telehealth: !!prov.telehealth,
          avatarUrl: prov.avatarUrl ?? null,
          createdAt: now,
          updatedAt: now,
        }));
        const { error } = await admin.from("ClinicProvider").insert(rows);
        if (error) throw error;
      }
    }

    if (Array.isArray(body.treatments)) {
      const treatments = body.treatments as TreatmentInput[];
      await admin.from("ClinicTreatment").delete().eq("clinicId", id);
      if (treatments.length) {
        const rows = treatments.map((t) => ({
          id: t.id && String(t.id).length > 0 ? String(t.id) : randomUUID(),
          clinicId: id,
          name: t.name ?? "Treatment",
          category: t.category ?? "General",
          description: t.description ?? null,
          concerns: t.concerns ?? null,
          priceRange: t.priceRange ?? null,
          labRequired: !!t.labRequired,
          consultRequired: t.consultRequired !== false,
          careFormat: t.careFormat ?? "hybrid",
          createdAt: now,
          updatedAt: now,
        }));
        const { error } = await admin.from("ClinicTreatment").insert(rows);
        if (error) throw error;
      }
    }

    const [{ data: locations }, { data: providers }, { data: treatments }] = await Promise.all([
      admin.from("ClinicLocation").select("*").eq("clinicId", id),
      admin.from("ClinicProvider").select("*").eq("clinicId", id),
      admin.from("ClinicTreatment").select("*").eq("clinicId", id),
    ]);

    return NextResponse.json({
      ok: true,
      clinic: {
        ...updatedClinic,
        locations: locations ?? [],
        providers: providers ?? [],
        treatments: treatments ?? [],
      },
    });
  } catch (e) {
    const authResponse = workforceAuthErrorResponse(e);
    if (authResponse) return authResponse;
    console.error("Clinic update error", e);
    return NextResponse.json({ error: "Failed to update clinic profile" }, { status: 500 });
  }
}
