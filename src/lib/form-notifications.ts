import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type FormType =
  | "patient_assessment"
  | "campaign_lead"
  | "clinic_application"
  | "clinic_onboarding"
  | "clinic_claim"
  | "directory_listing"
  | "professional_onboarding"
  | "job_application"
  | "employer_onboarding"
  | "job_posting"
  | "vendor_onboarding"
  | "marketplace_quote"
  | "consultation_request"
  | "contact_inquiry"
  | "newsletter_signup"
  | "investor_access_request"
  | "investor_meeting_request";

type SafePrimitive = string | number | boolean | null;

export type FormSubmissionInput = {
  request: Request;
  formType: FormType;
  sourceTable: string;
  sourceRecordId: string;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  organization?: string | null;
  safeMessage?: string | null;
  safeMetadata?: Record<string, SafePrimitive | undefined>;
  containsSensitiveHealthData?: boolean;
  userId?: string | null;
  sourcePage?: string | null;
  idempotencyKey?: string | null;
};

type SubmissionRow = {
  id: string;
  submission_id: string;
  form_type: FormType;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  organization: string | null;
  safe_message: string | null;
  safe_metadata: Record<string, SafePrimitive>;
  source_page: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  submitted_at: string;
  contains_sensitive_health_data: boolean;
};

type DeliveryRow = {
  id: string;
  form_submission_id: string;
  channel: "slack" | "email";
  attempt_count: number;
};

const SENSITIVE_KEY =
  /(answer|assessment_response|symptom|diagnos|medical|medication|condition|history|password|token|secret|address)/i;

const FORM_LABELS: Record<FormType, { label: string; emoji: string; subject: string }> = {
  patient_assessment: { label: "Patient Assessment", emoji: "🩺", subject: "New Patient Assessment" },
  campaign_lead: { label: "Campaign Patient Lead", emoji: "🩺", subject: "New Campaign Patient Lead" },
  clinic_application: { label: "Clinic Application", emoji: "🏥", subject: "New Clinic Application" },
  clinic_onboarding: { label: "Clinic Onboarding", emoji: "🏥", subject: "New Clinic Onboarding" },
  clinic_claim: { label: "Clinic Claim", emoji: "🏥", subject: "New Clinic Claim" },
  directory_listing: { label: "Directory Listing Review", emoji: "📍", subject: "New Directory Listing Application" },
  professional_onboarding: { label: "Workforce Professional", emoji: "👤", subject: "New Workforce Application" },
  job_application: { label: "Job Application", emoji: "💼", subject: "New Workforce Application" },
  employer_onboarding: { label: "Workforce Employer", emoji: "🏢", subject: "New Employer Onboarding" },
  job_posting: { label: "Job Posting", emoji: "💼", subject: "New Job Posting" },
  vendor_onboarding: { label: "Marketplace Vendor", emoji: "🛍️", subject: "New Marketplace Inquiry" },
  marketplace_quote: { label: "Marketplace Quote", emoji: "🛍️", subject: "New Marketplace Quote Request" },
  consultation_request: { label: "Consultation Request", emoji: "🩺", subject: "New Consultation Request" },
  contact_inquiry: { label: "Contact Inquiry", emoji: "📬", subject: "New Contact Inquiry" },
  newsletter_signup: { label: "Newsletter Signup", emoji: "📰", subject: "New Newsletter Signup" },
  investor_access_request: { label: "Investor Access Request", emoji: "📈", subject: "New Investor Inquiry" },
  investor_meeting_request: { label: "Investor Meeting Request", emoji: "📈", subject: "New Investor Meeting Request" },
};

function clean(value: string | null | undefined, max = 500): string | null {
  if (!value) return null;
  const normalized = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim();
  return normalized ? normalized.slice(0, max) : null;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeSlack(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function safeMetadata(
  input: Record<string, SafePrimitive | undefined> = {},
): Record<string, SafePrimitive> {
  return Object.fromEntries(
    Object.entries(input)
      .filter(([key, value]) => value !== undefined && !SENSITIVE_KEY.test(key))
      .map(([key, value]) => [
        key.slice(0, 80),
        typeof value === "string" ? value.slice(0, 300) : value ?? null,
      ]),
  );
}

function healthSafeMetadata(
  input: Record<string, SafePrimitive>,
): Record<string, SafePrimitive> {
  const allowed = new Set([
    "source_page",
    "cs_page_id",
    "cs_campaign_id",
    "assessment_mode",
    "consent_contact",
    "clinic_id",
    "routing_status",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
  ]);
  return Object.fromEntries(Object.entries(input).filter(([key]) => allowed.has(key)));
}

function requestAttribution(request: Request) {
  const url = new URL(request.url);
  const headerPage = request.headers.get("x-source-page");
  const referrer = request.headers.get("referer");
  const cookieAttribution = (() => {
    const raw = request.headers
      .get("cookie")
      ?.split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith("novalyte-attribution="))
      ?.slice("novalyte-attribution=".length);
    if (!raw) return {} as Record<string, unknown>;
    try {
      const parsed = JSON.parse(decodeURIComponent(raw));
      return parsed && typeof parsed === "object"
        ? (parsed as Record<string, unknown>)
        : {};
    } catch {
      return {};
    }
  })();
  const get = (name: string) => clean(
    request.headers.get(`x-${name.replace("_", "-")}`) ||
      url.searchParams.get(name) ||
      (typeof cookieAttribution[name] === "string"
        ? (cookieAttribution[name] as string)
        : null),
    200,
  );
  return {
    sourcePage: clean(
      headerPage ||
        (typeof cookieAttribution.landing_path === "string"
          ? cookieAttribution.landing_path
          : null) ||
        url.pathname,
      500,
    ),
    referrer: clean(referrer, 500),
    utmSource: get("utm_source"),
    utmMedium: get("utm_medium"),
    utmCampaign: get("utm_campaign"),
    utmContent: get("utm_content"),
    utmTerm: get("utm_term"),
    anonymousId: clean(request.headers.get("x-anonymous-id"), 200),
  };
}

function idempotencyKey(input: FormSubmissionInput): string {
  const explicit = clean(
    input.idempotencyKey || input.request.headers.get("x-idempotency-key"),
    200,
  );
  if (explicit) return explicit;
  // Source records are already durable and unique. This deterministic fallback
  // prevents duplicate alerts if the post-persistence notification call retries.
  return createHash("sha256")
    .update(`${input.formType}:${input.sourceTable}:${input.sourceRecordId}`)
    .digest("hex");
}

function dashboardUrl(submissionId: string): string {
  const base =
    process.env.ADMIN_DASHBOARD_URL?.trim() ||
    process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_URL?.trim() ||
    "https://admin.novalyte.io";
  return `${base.replace(/\/$/, "")}/?view=form-submissions&submission=${encodeURIComponent(submissionId)}`;
}

function adminRecipients() {
  const to =
    process.env.ADMIN_NOTIFICATION_EMAIL?.trim() ||
    process.env.CONTACT_NOTIFICATION_TO_EMAIL?.trim() ||
    process.env.NOVALYTE_ADMIN_EMAIL?.trim() ||
    "admin@novalyte.io";
  const bcc =
    process.env.ADMIN_NOTIFICATION_BCC_EMAIL?.trim() ||
    process.env.NOTIFICATION_BCC_EMAIL?.trim() ||
    "";
  return { to, bcc };
}

function fromAddress(): string {
  return (
    process.env.NOTIFICATION_FROM_EMAIL?.trim() ||
    process.env.CONTACT_NOTIFICATION_FROM_EMAIL?.trim() ||
    "Novalyte AI <notifications@novalyte.io>"
  );
}

function slackWebhook(): string | null {
  return (
    process.env.SLACK_FORM_WEBHOOK_URL?.trim() ||
    process.env.SLACK_CONTACT_WEBHOOK_URL?.trim() ||
    process.env.SLACK_WEBHOOK_URL?.trim() ||
    null
  );
}

function safeFields(submission: SubmissionRow): Array<[string, string]> {
  const fields: Array<[string, string | null]> = [
    ["Name", submission.contact_name],
    ["Email", submission.contact_email],
    ["Phone", submission.contact_phone],
    ["Organization / clinic", submission.organization],
    ["Source page", submission.source_page],
    ["Referrer", submission.referrer],
    ["UTM source", submission.utm_source],
    ["UTM medium", submission.utm_medium],
    ["UTM campaign", submission.utm_campaign],
    ["UTM content", submission.utm_content],
    ["UTM term", submission.utm_term],
  ];
  return fields.filter((field): field is [string, string] => Boolean(field[1]));
}

async function sendSlack(submission: SubmissionRow) {
  const webhook = slackWebhook();
  if (!webhook) throw new Error("NOT_CONFIGURED: SLACK_FORM_WEBHOOK_URL");
  const config = FORM_LABELS[submission.form_type];
  const fields = safeFields(submission)
    .map(([label, value]) => `*${label}:* ${escapeSlack(value)}`)
    .join("\n");
  const message =
    submission.safe_message && !submission.contains_sensitive_health_data
      ? `\n*Message:* ${escapeSlack(submission.safe_message)}`
      : submission.contains_sensitive_health_data
        ? "\n_Sensitive health responses are available only in the secure dashboard._"
        : "";
  const response = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: `${config.emoji} New ${config.label}`,
      blocks: [
        {
          type: "header",
          text: { type: "plain_text", text: `${config.emoji} New ${config.label}`, emoji: true },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Submission ID:* \`${submission.submission_id}\`\n${fields}${message}`,
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `Received ${new Date(submission.submitted_at).toISOString()} · <${dashboardUrl(submission.submission_id)}|Open in Novalyte Admin>`,
            },
          ],
        },
      ],
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Slack returned HTTP ${response.status}`);
}

async function sendEmail(submission: SubmissionRow): Promise<string | null> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) throw new Error("NOT_CONFIGURED: RESEND_API_KEY");
  const { to, bcc } = adminRecipients();
  const config = FORM_LABELS[submission.form_type];
  const rows = safeFields(submission)
    .map(
      ([label, value]) =>
        `<tr><th align="left" style="padding:6px 12px 6px 0;color:#475569">${escapeHtml(label)}</th><td style="padding:6px 0">${escapeHtml(value)}</td></tr>`,
    )
    .join("");
  const message =
    submission.safe_message && !submission.contains_sensitive_health_data
      ? `<h3>Message</h3><p style="white-space:pre-wrap">${escapeHtml(submission.safe_message)}</p>`
      : submission.contains_sensitive_health_data
        ? "<p><strong>Privacy:</strong> Sensitive health responses are available only in the secure dashboard and are intentionally excluded from this email.</p>"
        : "";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: fromAddress(),
      to: [to],
      ...(bcc ? { bcc: [bcc] } : {}),
      ...(submission.contact_email ? { reply_to: submission.contact_email } : {}),
      subject: `[Novalyte] ${config.subject}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:680px">
        <h2 style="color:#0f766e">${escapeHtml(config.label)}</h2>
        <p><strong>Submission ID:</strong> ${escapeHtml(submission.submission_id)}</p>
        <table>${rows}</table>${message}
        <p><a href="${escapeHtml(dashboardUrl(submission.submission_id))}">Open the secure record in Novalyte Admin</a></p>
        <p style="font-size:12px;color:#64748b">Received ${escapeHtml(new Date(submission.submitted_at).toISOString())}</p>
      </div>`,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  const payload = (await response.json().catch(() => ({}))) as {
    id?: string;
    message?: string;
  };
  if (!response.ok) {
    throw new Error(`Resend HTTP ${response.status}: ${payload.message || "delivery failed"}`);
  }
  return payload.id ?? null;
}

function retryAt(attempt: number): string {
  const delayMinutes = Math.min(60, 2 ** Math.max(0, attempt - 1));
  return new Date(Date.now() + delayMinutes * 60_000).toISOString();
}

async function updateOverallStatus(submissionId: string) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("form_notification_deliveries")
    .select("channel,status,attempt_count,last_error")
    .eq("form_submission_id", submissionId);
  if (error) {
    console.error("form notification status refresh failed", { code: error.code });
    return;
  }
  const slack = data?.find((item) => item.channel === "slack");
  const email = data?.find((item) => item.channel === "email");
  const states = [slack?.status, email?.status];
  const notificationStatus =
    states.every((state) => state === "sent")
      ? "sent"
      : states.some((state) => state === "sent")
        ? "partially_sent"
        : states.some((state) => state === "retrying")
          ? "retrying"
          : states.some((state) => state === "pending")
            ? "pending"
            : "failed";
  await admin
    .from("form_submissions")
    .update({
      notification_status: notificationStatus,
      slack_status: slack?.status ?? "pending",
      email_status: email?.status ?? "pending",
      processing_attempts: (slack?.attempt_count ?? 0) + (email?.attempt_count ?? 0),
      last_error:
        [slack, email]
          .filter((item) => item?.last_error)
          .map((item) => `${item!.channel}: ${item!.last_error!.slice(0, 500)}`)
          .join("; ") || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", submissionId);
}

export async function processFormNotificationDelivery(deliveryId: string) {
  const admin = getSupabaseAdmin();
  const now = new Date().toISOString();
  const { data: claimedRows, error: claimError } = await admin
    .from("form_notification_deliveries")
    .update({
      status: "retrying",
      claimed_at: now,
      updated_at: now,
    })
    .eq("id", deliveryId)
    .in("status", ["pending", "failed", "not_configured"])
    .lt("attempt_count", 5)
    .lte("next_attempt_at", now)
    .select("*");
  if (claimError) {
    console.error("form notification claim failed", { code: claimError.code });
    return { status: "claim_failed" as const };
  }
  let delivery = (claimedRows?.[0] ?? null) as DeliveryRow | null;
  if (!delivery) {
    const staleBefore = new Date(Date.now() - 5 * 60_000).toISOString();
    const { data: staleRows } = await admin
      .from("form_notification_deliveries")
      .update({ claimed_at: now, updated_at: now })
      .eq("id", deliveryId)
      .eq("status", "retrying")
      .lt("attempt_count", 5)
      .lt("claimed_at", staleBefore)
      .select("*");
    delivery = (staleRows?.[0] ?? null) as DeliveryRow | null;
  }
  if (!delivery) return { status: "not_claimed" as const };

  const nextAttemptCount = delivery.attempt_count + 1;
  await admin
    .from("form_notification_deliveries")
    .update({ attempt_count: nextAttemptCount })
    .eq("id", delivery.id);
  delivery.attempt_count = nextAttemptCount;

  const { data, error: readError } = await admin
    .from("form_submissions")
    .select("*")
    .eq("id", delivery.form_submission_id)
    .single();
  if (readError || !data) {
    console.error("form notification submission lookup failed", { code: readError?.code });
    return { status: "lookup_failed" as const };
  }
  const submission = data as SubmissionRow;

  try {
    let providerMessageId: string | null = null;
    if (delivery.channel === "slack") await sendSlack(submission);
    else providerMessageId = await sendEmail(submission);
    await admin
      .from("form_notification_deliveries")
      .update({
        status: "sent",
        provider_message_id: providerMessageId,
        last_error: null,
        sent_at: new Date().toISOString(),
        claimed_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", delivery.id);
    await updateOverallStatus(delivery.form_submission_id);
    return { status: "sent" as const };
  } catch (cause) {
    const rawError = cause instanceof Error ? cause.message : "Delivery failed";
    const notConfigured = rawError.startsWith("NOT_CONFIGURED:");
    const finalFailure = delivery.attempt_count >= 5;
    const status = notConfigured ? "not_configured" : finalFailure ? "failed" : "failed";
    await admin
      .from("form_notification_deliveries")
      .update({
        status,
        last_error: clean(rawError, 500),
        next_attempt_at: retryAt(delivery.attempt_count),
        claimed_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", delivery.id);
    await updateOverallStatus(delivery.form_submission_id);
    console.error("form notification delivery failed", {
      channel: delivery.channel,
      submissionId: submission.submission_id,
      configured: !notConfigured,
    });
    return { status, error: rawError };
  }
}

export async function processPendingFormNotifications(limit = 25) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("form_notification_deliveries")
    .select("id")
    .in("status", ["pending", "failed", "retrying", "not_configured"])
    .lt("attempt_count", 5)
    .lte("next_attempt_at", new Date().toISOString())
    .order("next_attempt_at", { ascending: true })
    .limit(Math.min(100, Math.max(1, limit)));
  if (error) throw error;
  return Promise.all((data ?? []).map((row) => processFormNotificationDelivery(row.id)));
}

export async function recordFormSubmissionAndNotify(input: FormSubmissionInput) {
  const admin = getSupabaseAdmin();
  const attribution = requestAttribution(input.request);
  const sanitizedMetadata = safeMetadata(input.safeMetadata);
  const safe = input.containsSensitiveHealthData
    ? healthSafeMetadata(sanitizedMetadata)
    : sanitizedMetadata;
  const key = idempotencyKey(input);
  const now = new Date().toISOString();

  const { data: row, error } = await admin
    .from("form_submissions")
    .upsert(
      {
        idempotency_key: key,
        form_type: input.formType,
        source_table: input.sourceTable,
        source_record_id: input.sourceRecordId,
        source_page: clean(input.sourcePage, 500) || attribution.sourcePage,
        referrer: attribution.referrer,
        utm_source: clean(String(safe.utm_source ?? ""), 200) || attribution.utmSource,
        utm_medium: clean(String(safe.utm_medium ?? ""), 200) || attribution.utmMedium,
        utm_campaign: clean(String(safe.utm_campaign ?? ""), 200) || attribution.utmCampaign,
        utm_content: clean(String(safe.utm_content ?? ""), 200) || attribution.utmContent,
        utm_term: clean(String(safe.utm_term ?? ""), 200) || attribution.utmTerm,
        anonymous_id: attribution.anonymousId,
        user_id: input.userId ?? null,
        contact_name: clean(input.contactName, 200),
        contact_email: clean(input.contactEmail, 320),
        contact_phone: clean(input.contactPhone, 80),
        organization: clean(input.organization, 300),
        safe_message: input.containsSensitiveHealthData ? null : clean(input.safeMessage, 2_000),
        safe_metadata: safe,
        contains_sensitive_health_data: input.containsSensitiveHealthData ?? false,
        environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "development",
        submitted_at: now,
        updated_at: now,
      },
      { onConflict: "form_type,idempotency_key", ignoreDuplicates: true },
    )
    .select("id,submission_id")
    .maybeSingle();
  if (error) throw error;

  let submission = row;
  if (!submission) {
    const { data: existing, error: existingError } = await admin
      .from("form_submissions")
      .select("id,submission_id")
      .eq("form_type", input.formType)
      .eq("idempotency_key", key)
      .single();
    if (existingError || !existing) throw existingError ?? new Error("Unable to resolve submission.");
    submission = existing;
  }

  const { data: deliveries, error: deliveryError } = await admin
    .from("form_notification_deliveries")
    .upsert(
      [
        { form_submission_id: submission.id, channel: "slack", status: "pending" },
        {
          form_submission_id: submission.id,
          channel: "email",
          status: "pending",
          recipient: adminRecipients().to,
        },
      ],
      { onConflict: "form_submission_id,channel", ignoreDuplicates: true },
    )
    .select("id,status");
  if (deliveryError) throw deliveryError;

  const pending = (deliveries ?? []).filter((delivery) => delivery.status !== "sent");
  const results = await Promise.all(
    pending.map((delivery) => processFormNotificationDelivery(delivery.id)),
  );
  return {
    id: submission.id,
    submissionId: submission.submission_id,
    notificationResults: results,
  };
}

export function createClientSubmissionId(): string {
  return randomUUID();
}
