import { describe, expect, it } from "vitest";

import {
  accessRequestSchema,
  meetingRequestSchema,
} from "@/lib/investor/schemas";

describe("accessRequestSchema", () => {
  const valid = {
    fullName: "Alex Investor",
    workEmail: "alex@example.com",
    investorType: "angel" as const,
    reasonForInterest: "Building clinic infrastructure for men's health clinics and adjacent SaaS.",
  };

  it("accepts a minimal valid request", () => {
    const result = accessRequestSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects short reason and invalid email", () => {
    expect(
      accessRequestSchema.safeParse({ ...valid, reasonForInterest: "too short" }).success,
    ).toBe(false);
    expect(
      accessRequestSchema.safeParse({ ...valid, workEmail: "not-an-email" }).success,
    ).toBe(false);
  });

  it("rejects unknown investor types", () => {
    expect(
      accessRequestSchema.safeParse({ ...valid, investorType: "celebrity" }).success,
    ).toBe(false);
  });

  it("allows empty optional URL fields as empty strings", () => {
    const result = accessRequestSchema.safeParse({
      ...valid,
      linkedinUrl: "",
      website: "",
      firm: "",
    });
    expect(result.success).toBe(true);
  });
});

describe("meetingRequestSchema", () => {
  it("accepts a valid meeting request and defaults inquiryType", () => {
    const result = meetingRequestSchema.safeParse({
      name: "Alex Investor",
      email: "alex@example.com",
      message: "Would like to discuss the pre-seed.",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.inquiryType).toBe("meeting");
    }
  });

  it("rejects messages that are too short", () => {
    expect(
      meetingRequestSchema.safeParse({
        name: "Alex",
        email: "alex@example.com",
        message: "Hi",
      }).success,
    ).toBe(false);
  });
});
