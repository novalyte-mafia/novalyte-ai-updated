import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    // 1. Update primary clinic attributes
    const updatedClinic = await db.clinic.update({
      where: { id },
      data: {
        name: body.name,
        tagline: body.tagline ?? "",
        overview: body.overview,
        phone: body.phone ?? "",
        email: body.email ?? "",
        website: body.website ?? "",
        hours: body.hours ?? "",
        acceptingNewPatients: !!body.acceptingNewPatients,
        initialConsultPrice: body.initialConsultPrice !== undefined && body.initialConsultPrice !== null ? Number(body.initialConsultPrice) : null,
        membershipPrice: body.membershipPrice !== undefined && body.membershipPrice !== null ? Number(body.membershipPrice) : null,
        insuranceAccepted: !!body.insuranceAccepted,
        hsaFsaAccepted: !!body.hsaFsaAccepted,
        earliestAvailability: body.earliestAvailability ?? "",
        statesServed: body.statesServed ?? "",
        languages: body.languages ?? "English",
        accessibility: body.accessibility ?? "Wheelchair accessible",
        pricingStatus: body.pricingStatus ?? "Full Pricing Published",
        whatToExpect: body.whatToExpect ?? "",
        profileCompleteness: Number(body.profileCompleteness) || 80,
      },
    });

    // 2. Sync locations
    if (Array.isArray(body.locations)) {
      await db.clinicLocation.deleteMany({ where: { clinicId: id } });
      for (const loc of body.locations) {
        await db.clinicLocation.create({
          data: {
            clinicId: id,
            name: loc.name,
            address: loc.address,
            phone: loc.phone ?? "",
            hours: loc.hours ?? "",
            parking: loc.parking ?? "",
            transit: loc.transit ?? "",
            accessibility: loc.accessibility ?? "",
            onSiteLab: !!loc.onSiteLab,
            phlebotomy: !!loc.phlebotomy,
            earliestAppt: loc.earliestAppt ?? "",
          },
        });
      }
    }

    // 3. Sync providers
    if (Array.isArray(body.providers)) {
      await db.clinicProvider.deleteMany({ where: { clinicId: id } });
      for (const prov of body.providers) {
        await db.clinicProvider.create({
          data: {
            clinicId: id,
            name: prov.name,
            credentials: prov.credentials,
            role: prov.role,
            specialties: prov.specialties ?? "",
            yearsExperience: Number(prov.yearsExperience) || 0,
            bio: prov.bio ?? "",
            languages: prov.languages ?? "English",
            telehealth: !!prov.telehealth,
            avatarUrl: prov.avatarUrl ?? null,
          },
        });
      }
    }

    // 4. Sync treatments
    if (Array.isArray(body.treatments)) {
      await db.clinicTreatment.deleteMany({ where: { clinicId: id } });
      for (const treat of body.treatments) {
        await db.clinicTreatment.create({
          data: {
            clinicId: id,
            name: treat.name,
            category: treat.category,
            description: treat.description ?? "",
            concerns: treat.concerns ?? "",
            priceRange: treat.priceRange ?? "",
            labRequired: !!treat.labRequired,
            consultRequired: !!treat.consultRequired,
            careFormat: treat.careFormat ?? "hybrid",
          },
        });
      }
    }

    return NextResponse.json({ ok: true, clinic: updatedClinic });
  } catch (e) {
    console.error("Clinic update error", e);
    return NextResponse.json({ error: "Failed to update clinic profile" }, { status: 500 });
  }
}
