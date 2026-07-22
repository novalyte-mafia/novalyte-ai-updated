import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { captureServerEvent } from "@/lib/posthog-server";
import { recordFormSubmissionAndNotify } from "@/lib/form-notifications";

function genAppId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "NCA-";
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

const schema = z.object({
  // Organization
  legalName: z.string().min(2).max(200),
  dbaName: z.string().max(200).optional().nullable(),
  parentOrg: z.string().max(200).optional().nullable(),
  orgType: z.string().max(100).optional().nullable(),
  ownershipType: z.string().max(100).optional().nullable(),
  yearEstablished: z.string().max(20).optional().nullable(),
  website: z.string().max(300).optional().nullable(),
  mainPhone: z.string().max(40).optional().nullable(),
  generalEmail: z.string().email().max(160).optional().nullable(),
  orgDescription: z.string().max(5000).optional().nullable(),
  locationCount: z.string().max(20).optional().nullable(),
  providerCount: z.string().max(20).optional().nullable(),
  employeeCount: z.string().max(20).optional().nullable(),
  // Decision maker
  dmFirstName: z.string().min(1).max(80),
  dmLastName: z.string().min(1).max(80),
  dmTitle: z.string().max(120).optional().nullable(),
  dmRole: z.string().max(120).optional().nullable(),
  dmEmail: z.string().email().max(160),
  dmPhone: z.string().max(40).optional().nullable(),
  dmMobile: z.string().max(40).optional().nullable(),
  dmPreferredContact: z.string().max(40).optional().nullable(),
  dmBestTime: z.string().max(80).optional().nullable(),
  dmLinkedin: z.string().max(300).optional().nullable(),
  dmAuthorized: z.boolean().optional().nullable(),
  dmFinalDecisionMaker: z.boolean().optional().nullable(),
  // Credentials
  orgNpi: z.string().max(40).optional().nullable(),
  taxonomyCode: z.string().max(40).optional().nullable(),
  medicalDirector: z.string().max(120).optional().nullable(),
  medicalDirectorNpi: z.string().max(40).optional().nullable(),
  licenseStates: z.string().max(500).optional().nullable(),
  accreditation: z.string().max(500).optional().nullable(),
  // Treatments
  treatments: z.string().max(2000).optional().nullable(),
  // Patient operations
  monthlyInquiries: z.string().max(40).optional().nullable(),
  monthlyConsults: z.string().max(40).optional().nullable(),
  monthlyNewPatients: z.string().max(40).optional().nullable(),
  acquisitionChannels: z.string().max(1000).optional().nullable(),
  responseTime: z.string().max(40).optional().nullable(),
  intakeMethod: z.string().max(200).optional().nullable(),
  crmSystem: z.string().max(200).optional().nullable(),
  // Growth interests
  acquisitionInterest: z.string().max(40).optional().nullable(),
  weeklyCapacity: z.string().max(40).optional().nullable(),
  monthlyCapacity: z.string().max(40).optional().nullable(),
  growthServices: z.string().max(2000).optional().nullable(),
  commercialModel: z.string().max(80).optional().nullable(),
  budgetRange: z.string().max(80).optional().nullable(),
  // Workforce & marketplace
  workforceNeeds: z.string().max(2000).optional().nullable(),
  marketplaceNeeds: z.string().max(2000).optional().nullable(),
  // Directory profile
  shortDescription: z.string().max(2000).optional().nullable(),
  fullBio: z.string().max(10000).optional().nullable(),
  mission: z.string().max(2000).optional().nullable(),
  differentiator: z.string().max(2000).optional().nullable(),
  idealPatient: z.string().max(2000).optional().nullable(),
  consultationProcess: z.string().max(5000).optional().nullable(),
  insuranceInfo: z.string().max(2000).optional().nullable(),
  selfPayInfo: z.string().max(2000).optional().nullable(),
  financingInfo: z.string().max(2000).optional().nullable(),
  languages: z.string().max(500).optional().nullable(),
  accessibility: z.string().max(2000).optional().nullable(),
  amenities: z.string().max(2000).optional().nullable(),
  bookingUrl: z.string().max(300).optional().nullable(),
  socialUrls: z.string().max(1000).optional().nullable(),
  // Verification & consent
  accuracyConfirm: z.boolean(),
  verifyConsent: z.boolean(),
  mediaConsent: z.boolean().optional().nullable(),
  termsConsent: z.boolean(),
  contactConsent: z.boolean(),
  marketingConsent: z.boolean().optional().nullable(),
  // Meta
  referralSource: z.string().max(200).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
    }
    const d = parsed.data;

    // Generate unique application ID
    let applicationId = genAppId();
    let attempts = 0;
    while (attempts < 5) {
      const existing = await db.clinicApplication.findUnique({ where: { applicationId } });
      if (!existing) break;
      applicationId = genAppId();
      attempts++;
    }

    const record = await db.clinicApplication.create({
      data: {
        applicationId,
        status: "submitted",
        legalName: d.legalName,
        dbaName: d.dbaName ?? null,
        parentOrg: d.parentOrg ?? null,
        orgType: d.orgType ?? null,
        ownershipType: d.ownershipType ?? null,
        yearEstablished: d.yearEstablished ?? null,
        website: d.website ?? null,
        mainPhone: d.mainPhone ?? null,
        generalEmail: d.generalEmail ?? null,
        orgDescription: d.orgDescription ?? null,
        locationCount: d.locationCount ?? null,
        providerCount: d.providerCount ?? null,
        employeeCount: d.employeeCount ?? null,
        dmFirstName: d.dmFirstName,
        dmLastName: d.dmLastName,
        dmTitle: d.dmTitle ?? null,
        dmRole: d.dmRole ?? null,
        dmEmail: d.dmEmail,
        dmPhone: d.dmPhone ?? null,
        dmMobile: d.dmMobile ?? null,
        dmPreferredContact: d.dmPreferredContact ?? null,
        dmBestTime: d.dmBestTime ?? null,
        dmLinkedin: d.dmLinkedin ?? null,
        dmAuthorized: d.dmAuthorized ?? false,
        dmFinalDecisionMaker: d.dmFinalDecisionMaker ?? false,
        orgNpi: d.orgNpi ?? null,
        taxonomyCode: d.taxonomyCode ?? null,
        medicalDirector: d.medicalDirector ?? null,
        medicalDirectorNpi: d.medicalDirectorNpi ?? null,
        licenseStates: d.licenseStates ?? null,
        accreditation: d.accreditation ?? null,
        treatments: d.treatments ?? null,
        monthlyInquiries: d.monthlyInquiries ?? null,
        monthlyConsults: d.monthlyConsults ?? null,
        monthlyNewPatients: d.monthlyNewPatients ?? null,
        acquisitionChannels: d.acquisitionChannels ?? null,
        responseTime: d.responseTime ?? null,
        intakeMethod: d.intakeMethod ?? null,
        crmSystem: d.crmSystem ?? null,
        acquisitionInterest: d.acquisitionInterest ?? null,
        weeklyCapacity: d.weeklyCapacity ?? null,
        monthlyCapacity: d.monthlyCapacity ?? null,
        growthServices: d.growthServices ?? null,
        commercialModel: d.commercialModel ?? null,
        budgetRange: d.budgetRange ?? null,
        workforceNeeds: d.workforceNeeds ?? null,
        marketplaceNeeds: d.marketplaceNeeds ?? null,
        shortDescription: d.shortDescription ?? null,
        fullBio: d.fullBio ?? null,
        mission: d.mission ?? null,
        differentiator: d.differentiator ?? null,
        idealPatient: d.idealPatient ?? null,
        consultationProcess: d.consultationProcess ?? null,
        insuranceInfo: d.insuranceInfo ?? null,
        selfPayInfo: d.selfPayInfo ?? null,
        financingInfo: d.financingInfo ?? null,
        languages: d.languages ?? null,
        accessibility: d.accessibility ?? null,
        amenities: d.amenities ?? null,
        bookingUrl: d.bookingUrl ?? null,
        socialUrls: d.socialUrls ?? null,
        accuracyConfirm: d.accuracyConfirm,
        verifyConsent: d.verifyConsent,
        mediaConsent: d.mediaConsent ?? false,
        termsConsent: d.termsConsent,
        contactConsent: d.contactConsent,
        marketingConsent: d.marketingConsent ?? false,
        referralSource: d.referralSource ?? null,
        notes: d.notes ?? null,
        submittedAt: new Date(),
      },
    });

    await recordFormSubmissionAndNotify({
      request: req,
      formType: "clinic_application",
      sourceTable: "ClinicApplication",
      sourceRecordId: record.id,
      contactName: `${d.dmFirstName} ${d.dmLastName}`.trim(),
      contactEmail: d.dmEmail,
      contactPhone: d.dmPhone ?? d.dmMobile ?? null,
      organization: d.legalName,
      safeMetadata: {
        application_id: record.applicationId,
        org_type: d.orgType,
        ownership_type: d.ownershipType,
        location_count: d.locationCount,
        referral_source: d.referralSource,
      },
    }).catch((error) => console.error("clinic application notification failed", error));

    await captureServerEvent({
      distinctId: record.applicationId,
      event: "clinic_application_submitted",
      properties: {
        org_type: d.orgType ?? null,
        ownership_type: d.ownershipType ?? null,
        location_count: d.locationCount ?? null,
        referral_source: d.referralSource ?? null,
        budget_range: d.budgetRange ?? null,
      },
    });
    return NextResponse.json({ ok: true, applicationId: record.applicationId, id: record.id });
  } catch (e) {
    console.error("clinic application error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
