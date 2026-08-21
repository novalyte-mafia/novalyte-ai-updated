/**
 * Clinic messaging architecture (Phase 3 — design only, no full inbox).
 *
 * Channels (future):
 * - in_app: portal_notifications (shipped)
 * - email: Resend (used for lead_delivered)
 * - sms: provider TBD (Twilio/Quo) — requires consent_sms + BAA review
 * - patient_chat: deferred; not in early phases
 *
 * Never route admin prospect call recordings into clinic messaging.
 */

export type ClinicMessageChannel = "in_app" | "email" | "sms";

export type ClinicMessageTemplateKey =
  | "lead_delivered"
  | "follow_up_due"
  | "appointment_reminder"
  | "weekly_growth_digest";

export type ClinicOutboundMessage = {
  channel: ClinicMessageChannel;
  template: ClinicMessageTemplateKey;
  organizationId: string;
  clinicId?: string;
  userId?: string;
  toEmail?: string;
  toPhone?: string;
  payload: Record<string, unknown>;
};

export const MESSAGING_ARCHITECTURE = {
  version: 1,
  status: "architecture_only" as const,
  channels: {
    in_app: { status: "live", table: "portal_notifications" },
    email: { status: "partial", provider: "resend", events: ["lead_delivered"] },
    sms: { status: "planned", provider: null, blockers: ["consent", "BAA"] },
  },
  nonGoals: [
    "Full two-way patient SMS inbox",
    "HIPAA marketing claims before BAA program",
    "Exposing admin prospect CRM threads to clinic JWT",
  ],
} as const;

export function describeMessagingArchitecture() {
  return MESSAGING_ARCHITECTURE;
}
