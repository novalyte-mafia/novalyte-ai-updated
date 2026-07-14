/**
 * Novalyte AI — Treatment-Specific ROI Calculator Configuration
 *
 * Each treatment vertical has its own economic model with relevant
 * funnel stages, default values, and revenue structure.
 * All defaults are ILLUSTRATIVE only — not customer results.
 */

export type RoiTreatment = {
  slug: string;
  label: string;
  shortLabel: string;
  /** funnel stages for visualization */
  funnelStages: string[];
  /** default input values (illustrative) */
  defaults: RoiInputs;
  /** treatment-specific explanation */
  explanation: string;
  /** revenue model description */
  revenueModel: string;
};

export type RoiInputs = {
  leadsPerMonth: number;
  costPerLead: number;
  validContactRate: number; // %
  intakeCompletionRate: number; // %
  contactRate: number; // % clinic contacts the patient
  consultBookingRate: number; // %
  showRate: number; // %
  treatmentStartRate: number; // %
  initialConsultRevenue: number;
  initialTreatmentRevenue: number;
  monthlyRecurringRevenue: number;
  avgRetentionMonths: number;
  upsellRevenue: number;
  staffCostPerLead: number;
  labCostPerPatient: number;
  otherAcquisitionCost: number;
};

export type RoiOutputs = {
  totalLeadCost: number;
  validContacts: number;
  completedIntakes: number;
  consultationsBooked: number;
  consultationsAttended: number;
  treatmentStarts: number;
  firstMonthRevenue: number;
  monthlyRecurring: number;
  totalRevenue: number;
  acquisitionCostPerStart: number;
  grossContribution: number;
  roas: number; // return on acquisition spend
  breakEvenMonths: number;
};

export const DEFAULT_INPUTS: RoiInputs = {
  leadsPerMonth: 50,
  costPerLead: 45,
  validContactRate: 75,
  intakeCompletionRate: 70,
  contactRate: 85,
  consultBookingRate: 45,
  showRate: 80,
  treatmentStartRate: 35,
  initialConsultRevenue: 199,
  initialTreatmentRevenue: 350,
  monthlyRecurringRevenue: 199,
  avgRetentionMonths: 8,
  upsellRevenue: 100,
  staffCostPerLead: 15,
  labCostPerPatient: 75,
  otherAcquisitionCost: 20,
};

export const ROI_TREATMENTS: RoiTreatment[] = [
  {
    slug: "testosterone-replacement-therapy",
    label: "Testosterone Replacement Therapy",
    shortLabel: "TRT",
    funnelStages: ["Leads", "Valid Contacts", "Completed Intakes", "Consultations", "Shows", "Treatment Starts", "Monthly Program"],
    explanation: "TRT typically involves an initial consultation, lab evaluation, treatment start, and ongoing monthly recurring program revenue.",
    revenueModel: "Lead → Consultation → Lab Evaluation → Treatment Start → Monthly Recurring Program",
    defaults: { ...DEFAULT_INPUTS, costPerLead: 50, initialConsultRevenue: 199, initialTreatmentRevenue: 350, monthlyRecurringRevenue: 199, avgRetentionMonths: 9, labCostPerPatient: 85 },
  },
  {
    slug: "hormone-optimization",
    label: "Hormone Optimization",
    shortLabel: "Hormones",
    funnelStages: ["Leads", "Valid Contacts", "Completed Intakes", "Consultations", "Shows", "Treatment Starts", "Monthly Program"],
    explanation: "Hormone optimization often involves comprehensive lab work, individualized protocols, and ongoing monitoring revenue.",
    revenueModel: "Lead → Consultation → Lab Evaluation → Protocol Start → Monthly Monitoring",
    defaults: { ...DEFAULT_INPUTS, costPerLead: 55, initialConsultRevenue: 250, initialTreatmentRevenue: 400, monthlyRecurringRevenue: 225, avgRetentionMonths: 8, labCostPerPatient: 120 },
  },
  {
    slug: "erectile-dysfunction",
    label: "Erectile Dysfunction Care",
    shortLabel: "ED Care",
    funnelStages: ["Leads", "Valid Contacts", "Completed Intakes", "Consultations", "Shows", "Treatment Starts", "Follow-Up"],
    explanation: "ED care may involve a private consultation, treatment plan, initial purchase, and follow-up revenue.",
    revenueModel: "Lead → Private Consultation → Treatment Plan → Initial Purchase → Follow-Up",
    defaults: { ...DEFAULT_INPUTS, costPerLead: 40, initialConsultRevenue: 175, initialTreatmentRevenue: 300, monthlyRecurringRevenue: 150, avgRetentionMonths: 5, labCostPerPatient: 0 },
  },
  {
    slug: "medical-weight-loss",
    label: "Medical Weight Loss",
    shortLabel: "Weight Loss",
    funnelStages: ["Leads", "Valid Contacts", "Completed Intakes", "Consultations", "Shows", "Program Enrollments", "Monthly Program"],
    explanation: "Medical weight loss typically involves consultation, eligibility review, program enrollment, and monthly program revenue.",
    revenueModel: "Lead → Consultation → Eligibility Review → Program Enrollment → Monthly Program",
    defaults: { ...DEFAULT_INPUTS, costPerLead: 45, initialConsultRevenue: 199, initialTreatmentRevenue: 250, monthlyRecurringRevenue: 175, avgRetentionMonths: 6, labCostPerPatient: 50 },
  },
  {
    slug: "glp-1",
    label: "GLP-1 Programs",
    shortLabel: "GLP-1",
    funnelStages: ["Leads", "Valid Contacts", "Completed Intakes", "Consultations", "Shows", "Program Enrollments", "Monthly Program"],
    explanation: "GLP-1 programs involve consultation, eligibility determination, ongoing monitoring, and monthly program revenue. Medication revenue depends on the clinic's model.",
    revenueModel: "Lead → Consultation → Eligibility → Program Enrollment → Monthly Monitoring",
    defaults: { ...DEFAULT_INPUTS, costPerLead: 50, initialConsultRevenue: 225, initialTreatmentRevenue: 300, monthlyRecurringRevenue: 249, avgRetentionMonths: 7, labCostPerPatient: 60 },
  },
  {
    slug: "peptide-therapy",
    label: "Peptide Therapy",
    shortLabel: "Peptides",
    funnelStages: ["Leads", "Valid Contacts", "Completed Intakes", "Consultations", "Shows", "Program Enrollments", "Ongoing Monitoring"],
    explanation: "Peptide therapy is an evolving area involving consultation, provider review, program enrollment, and recurring monitoring. Evidence and availability vary.",
    revenueModel: "Lead → Consultation → Provider Review → Program Enrollment → Recurring Monitoring",
    defaults: { ...DEFAULT_INPUTS, costPerLead: 55, initialConsultRevenue: 250, initialTreatmentRevenue: 400, monthlyRecurringRevenue: 200, avgRetentionMonths: 5, labCostPerPatient: 75 },
  },
  {
    slug: "hair-restoration",
    label: "Hair Restoration",
    shortLabel: "Hair",
    funnelStages: ["Leads", "Valid Contacts", "Completed Intakes", "Consultations", "Shows", "Treatment Starts", "Follow-Up"],
    explanation: "Hair restoration may involve medical programs, procedural treatments, or hybrid models with initial and follow-up revenue.",
    revenueModel: "Lead → Consultation → Treatment Selection → Procedure or Program → Follow-Up",
    defaults: { ...DEFAULT_INPUTS, costPerLead: 40, initialConsultRevenue: 150, initialTreatmentRevenue: 500, monthlyRecurringRevenue: 100, avgRetentionMonths: 4, labCostPerPatient: 0 },
  },
  {
    slug: "longevity-medicine",
    label: "Longevity Medicine",
    shortLabel: "Longevity",
    funnelStages: ["Leads", "Valid Contacts", "Completed Intakes", "Consultations", "Shows", "Membership Starts", "Ongoing Services"],
    explanation: "Longevity medicine often involves advanced consultation, diagnostic packages, membership programs, and ongoing services.",
    revenueModel: "Lead → Advanced Consultation → Diagnostic Package → Membership → Ongoing Services",
    defaults: { ...DEFAULT_INPUTS, costPerLead: 60, initialConsultRevenue: 350, initialTreatmentRevenue: 500, monthlyRecurringRevenue: 299, avgRetentionMonths: 10, labCostPerPatient: 200 },
  },
  {
    slug: "performance-recovery",
    label: "Performance & Recovery",
    shortLabel: "Performance",
    funnelStages: ["Leads", "Valid Contacts", "Completed Intakes", "Consultations", "Shows", "Program Starts", "Ongoing Services"],
    explanation: "Performance and recovery services may involve consultation, assessment, program enrollment, and ongoing service revenue.",
    revenueModel: "Lead → Consultation → Performance Assessment → Program Start → Ongoing Services",
    defaults: { ...DEFAULT_INPUTS, costPerLead: 45, initialConsultRevenue: 200, initialTreatmentRevenue: 300, monthlyRecurringRevenue: 175, avgRetentionMonths: 5, labCostPerPatient: 50 },
  },
  {
    slug: "preventive-mens-health",
    label: "Preventive Men's Health",
    shortLabel: "Preventive",
    funnelStages: ["Leads", "Valid Contacts", "Completed Intakes", "Consultations", "Shows", "Membership Starts", "Ongoing Services"],
    explanation: "Preventive men's health often involves routine consultations, screenings, and ongoing membership revenue.",
    revenueModel: "Lead → Consultation → Screening → Membership → Ongoing Care",
    defaults: { ...DEFAULT_INPUTS, costPerLead: 35, initialConsultRevenue: 175, initialTreatmentRevenue: 200, monthlyRecurringRevenue: 149, avgRetentionMonths: 12, labCostPerPatient: 100 },
  },
  {
    slug: "telehealth-services",
    label: "Telehealth Men's Health",
    shortLabel: "Telehealth",
    funnelStages: ["Leads", "Valid Contacts", "Completed Intakes", "Consultations", "Shows", "Treatment Starts", "Monthly Program"],
    explanation: "Telehealth men's health involves remote consultations, treatment plans, and ongoing program revenue across multiple states.",
    revenueModel: "Lead → Telehealth Consultation → Treatment Plan → Program Start → Monthly Program",
    defaults: { ...DEFAULT_INPUTS, costPerLead: 40, initialConsultRevenue: 199, initialTreatmentRevenue: 300, monthlyRecurringRevenue: 179, avgRetentionMonths: 7, labCostPerPatient: 60 },
  },
  {
    slug: "sexual-wellness",
    label: "Sexual Wellness",
    shortLabel: "Wellness",
    funnelStages: ["Leads", "Valid Contacts", "Completed Intakes", "Consultations", "Shows", "Treatment Starts", "Follow-Up"],
    explanation: "Sexual wellness care involves holistic consultation, treatment planning, and ongoing follow-up revenue.",
    revenueModel: "Lead → Consultation → Treatment Plan → Initial Program → Follow-Up",
    defaults: { ...DEFAULT_INPUTS, costPerLead: 40, initialConsultRevenue: 200, initialTreatmentRevenue: 300, monthlyRecurringRevenue: 150, avgRetentionMonths: 5, labCostPerPatient: 0 },
  },
];

export function calculateRoi(inputs: RoiInputs): RoiOutputs {
  const validContacts = Math.round(inputs.leadsPerMonth * (inputs.validContactRate / 100));
  const completedIntakes = Math.round(validContacts * (inputs.intakeCompletionRate / 100));
  const contactedByClinic = Math.round(completedIntakes * (inputs.contactRate / 100));
  const consultationsBooked = Math.round(contactedByClinic * (inputs.consultBookingRate / 100));
  const consultationsAttended = Math.round(consultationsBooked * (inputs.showRate / 100));
  const treatmentStarts = Math.round(consultationsAttended * (inputs.treatmentStartRate / 100));

  const totalLeadCost = inputs.leadsPerMonth * inputs.costPerLead;
  const totalStaffCost = inputs.leadsPerMonth * inputs.staffCostPerLead;
  const totalLabCost = treatmentStarts * inputs.labCostPerPatient;
  const totalOtherCost = inputs.leadsPerMonth * inputs.otherAcquisitionCost;
  const totalAcquisitionCost = totalLeadCost + totalStaffCost + totalLabCost + totalOtherCost;

  const firstMonthRevenue = treatmentStarts * (inputs.initialConsultRevenue + inputs.initialTreatmentRevenue + inputs.upsellRevenue);
  const monthlyRecurring = treatmentStarts * inputs.monthlyRecurringRevenue;
  const totalRecurringOverRetention = monthlyRecurring * inputs.avgRetentionMonths;
  const totalRevenue = firstMonthRevenue + totalRecurringOverRetention;

  const acquisitionCostPerStart = treatmentStarts > 0 ? totalAcquisitionCost / treatmentStarts : 0;
  const grossContribution = totalRevenue - totalAcquisitionCost;
  const roas = totalAcquisitionCost > 0 ? totalRevenue / totalAcquisitionCost : 0;
  const breakEvenMonths = monthlyRecurring > 0 ? Math.ceil(totalAcquisitionCost / monthlyRecurring) : 0;

  return {
    totalLeadCost,
    validContacts,
    completedIntakes,
    consultationsBooked,
    consultationsAttended,
    treatmentStarts,
    firstMonthRevenue,
    monthlyRecurring,
    totalRevenue,
    acquisitionCostPerStart,
    grossContribution,
    roas,
    breakEvenMonths,
  };
}
