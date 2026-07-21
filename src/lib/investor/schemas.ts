import { z } from "zod";

export const investorTypeSchema = z.enum([
  "angel",
  "venture_capital",
  "family_office",
  "strategic",
  "healthcare_operator",
  "corporate_venture",
  "syndicate",
  "advisor",
  "other",
]);

export const accessRequestSchema = z.object({
  fullName: z.string().min(2).max(120),
  workEmail: z.string().email().max(150),
  firm: z.string().max(150).optional().or(z.literal("")),
  roleTitle: z.string().max(120).optional().or(z.literal("")),
  investorType: investorTypeSchema,
  checkSizeRange: z.string().max(80).optional().or(z.literal("")),
  investmentStagePreference: z.string().max(120).optional().or(z.literal("")),
  portfolioCompanies: z.string().max(1000).optional().or(z.literal("")),
  linkedinUrl: z.string().url().max(300).optional().or(z.literal("")),
  website: z.string().url().max(300).optional().or(z.literal("")),
  reasonForInterest: z.string().min(20).max(4000),
  discoverySource: z.string().max(200).optional().or(z.literal("")),
  message: z.string().max(4000).optional().or(z.literal("")),
});

export const meetingRequestSchema = z.object({
  name: z.string().min(2).max(120),
  firm: z.string().max(150).optional().or(z.literal("")),
  email: z.string().email().max(150),
  preferredDate: z.string().max(80).optional().or(z.literal("")),
  timezone: z.string().max(80).optional().or(z.literal("")),
  checkSizeRange: z.string().max(80).optional().or(z.literal("")),
  investmentThesis: z.string().max(2000).optional().or(z.literal("")),
  topics: z.string().max(1000).optional().or(z.literal("")),
  message: z.string().min(10).max(4000),
  inquiryType: z
    .enum(["meeting", "general", "strategic_partnership", "advisor", "press"])
    .default("meeting"),
});

export type AccessRequestInput = z.infer<typeof accessRequestSchema>;
export type MeetingRequestInput = z.infer<typeof meetingRequestSchema>;
