import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { z } from "zod";
import crypto from "crypto";
import { captureServerEvent } from "@/lib/posthog-server";
import { recordFormSubmissionAndNotify } from "@/lib/form-notifications";

// Validation Schema
const schema = z.object({
  senderType: z.enum([
    "patient", "clinic", "professional", "employer", "vendor",
    "seller", "technology", "press", "investor", "legal", "general", "other"
  ]),
  inquiryCategory: z.string().min(2).max(150),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().max(150),
  phone: z.string().max(30).optional(),
  organizationName: z.string().max(150).optional(),
  organizationWebsite: z.string().max(150).optional(),
  jobTitle: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  preferredContactMethod: z.enum(["email", "phone"]).optional(),
  hasExistingAccount: z.boolean().optional(),
  relevantUrl: z.string().max(500).optional(),
  subject: z.string().min(2).max(200),
  message: z.string().min(10).max(5000),
  sourcePage: z.string().max(500).optional(),
  utm_source: z.string().max(100).nullable().optional(),
  utm_medium: z.string().max(100).nullable().optional(),
  utm_campaign: z.string().max(100).nullable().optional(),
});

interface RoutingInfo {
  team: string;
  priority: string;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Centralized Routing Logic
function getRoutingInfo(senderType: string, category: string): RoutingInfo {
  let team = "general";
  let priority = "normal";

  switch (senderType) {
    case "patient":
      team = "patient_support";
      if (category.toLowerCase().includes("privacy") || category.toLowerCase().includes("data")) {
        team = "privacy_legal";
        priority = "high";
      }
      break;
    case "clinic":
      team = "clinic_partnerships";
      if (category.toLowerCase().includes("billing") || category.toLowerCase().includes("technical")) {
        priority = "high";
      }
      if (category.toLowerCase().includes("lock") || category.toLowerCase().includes("claim")) {
        priority = "urgent";
      }
      break;
    case "professional":
      team = "workforce_support";
      if (category.toLowerCase().includes("login") || category.toLowerCase().includes("password") || category.toLowerCase().includes("privacy")) {
        priority = "high";
      }
      break;
    case "employer":
      team = "employer_success";
      if (category.toLowerCase().includes("access") || category.toLowerCase().includes("technical")) {
        priority = "high";
      }
      break;
    case "vendor":
      team = "vendor_partnerships";
      break;
    case "seller":
      team = "marketplace";
      break;
    case "technology":
      team = "technology";
      if (category.toLowerCase().includes("security")) {
        priority = "urgent";
      }
      break;
    case "press":
      team = "press";
      break;
    case "investor":
      team = "investor_relations";
      break;
    case "legal":
      team = "privacy_legal";
      priority = "high";
      if (category.toLowerCase().includes("notice") || category.toLowerCase().includes("deletion")) {
        priority = "urgent";
      }
      break;
    default:
      team = "general";
      priority = "normal";
  }

  return { team, priority };
}

async function sendEmailViaResend({
  apiKey,
  from,
  to,
  replyTo,
  subject,
  html
}: {
  apiKey: string;
  from: string;
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
}) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to,
      reply_to: replyTo,
      subject,
      html
    })
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.message || "Failed to send email");
  }
  return body.id;
}

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid fields", details: parsed.error.flatten() }, { status: 400 });
    }

    const val = parsed.data;

    // Generate a human-readable reference without embedding a stale release date.
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
    const referenceNumber = `REF-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${randomChars}`;

    // Get routing info
    const routing = getRoutingInfo(val.senderType, val.inquiryCategory);

    // Salting & hashing IP address for abuse prevention
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    let ipHash = "";
    try {
      const salt = process.env.CONTACT_RATE_LIMIT_SECRET || "novalyte_secret_salt";
      ipHash = crypto.createHmac("sha256", salt).update(ip).digest("hex");
    } catch (e) {
      ipHash = "hash_unavailable";
    }

    // Capture user agent
    const userAgent = req.headers.get("user-agent") || "";

    // Pure Supabase insert (No Prisma!)
    const { data: submission, error: dbError } = await supabase
      .from("contact_submissions")
      .insert([
        {
          reference_number: referenceNumber,
          sender_type: val.senderType,
          inquiry_category: val.inquiryCategory,
          first_name: val.firstName,
          last_name: val.lastName,
          email: val.email,
          phone: val.phone || null,
          organization_name: val.organizationName || null,
          organization_website: val.organizationWebsite || null,
          job_title: val.jobTitle || null,
          city: val.city || null,
          state: val.state || null,
          preferred_contact_method: val.preferredContactMethod || null,
          has_existing_account: val.hasExistingAccount || false,
          relevant_url: val.relevantUrl || null,
          subject: val.subject,
          message: val.message,
          routing_team: routing.team,
          priority: routing.priority,
          status: "new",
          source_page: val.sourcePage || null,
          utm_source: val.utm_source || null,
          utm_medium: val.utm_medium || null,
          utm_campaign: val.utm_campaign || null,
          user_agent_summary: userAgent,
          ip_hash: ipHash,
          consent_version: "1.0",
          consented_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (dbError || !submission) {
      console.error("Database insert failed:", dbError);
      return NextResponse.json({ error: "Failed to save submission." }, { status: 500 });
    }

    await recordFormSubmissionAndNotify({
      request: req,
      formType: "contact_inquiry",
      sourceTable: "contact_submissions",
      sourceRecordId: submission.id,
      contactName: `${val.firstName} ${val.lastName}`.trim(),
      contactEmail: val.email,
      contactPhone: val.phone ?? null,
      organization: val.organizationName ?? null,
      safeMessage: val.senderType === "patient" ? null : val.message,
      containsSensitiveHealthData: val.senderType === "patient",
      safeMetadata: {
        reference_number: referenceNumber,
        sender_type: val.senderType,
        inquiry_category: val.inquiryCategory,
        routing_team: routing.team,
        priority: routing.priority,
        preferred_contact_method: val.preferredContactMethod,
        utm_source: val.utm_source,
        utm_medium: val.utm_medium,
        utm_campaign: val.utm_campaign,
      },
      sourcePage: val.sourcePage ?? null,
    }).catch((error) => console.error("Contact admin notification failed", error));

    // Preserve the sender confirmation without duplicating admin Slack/email delivery.
    const { data: confirmationEmailRecord } = await supabase
      .from("contact_notification_deliveries")
      .insert({
        contact_submission_id: submission.id,
        channel: "sender_confirmation_email",
        status: "pending",
        attempt_count: 0,
      })
      .select()
      .single();

    const updateDeliveryStatus = async (
      recordId: string,
      status: string,
      errorMsg?: string,
      messageId?: string,
    ) => {
      await supabase
        .from("contact_notification_deliveries")
        .update({
          status,
          attempt_count: 1,
          last_error: errorMsg || null,
          provider_message_id: messageId || null,
          sent_at: status === "sent" ? new Date().toISOString() : null,
        })
        .eq("id", recordId);
    };

    const resendApiKey = process.env.RESEND_API_KEY;
    const confirmationFrom = process.env.CONTACT_CONFIRMATION_FROM_EMAIL || "no-reply@novalyte.io";
    if (confirmationEmailRecord) {
      if (resendApiKey) {
        try {
          const emailSubject = `We received your Novalyte inquiry — ${submission.reference_number}`;
          const emailHtml = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 12px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #0f766e; margin-bottom: 4px;">Novalyte AI</h2>
                <p style="font-size: 12px; color: #6b7280; margin-top: 0;">Connecting the healthcare ecosystem</p>
              </div>
              <p style="font-size: 15px; color: #1f2937;">Dear ${escapeHtml(submission.first_name)},</p>
              <p style="font-size: 14px; color: #4b5563; line-height: 1.5;">
                Thank you for contacting Novalyte AI. We have received your inquiry and our team has routed it to the <strong>${escapeHtml(submission.routing_team.replace("_", " "))}</strong> department.
              </p>
              <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #f3f4f6; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #1f2937;">Copy of Inquiry: ${escapeHtml(submission.subject)}</h4>
                <p style="white-space: pre-wrap; font-size: 13px; line-height: 1.5; color: #4b5563; margin-bottom: 0;">${escapeHtml(submission.message)}</p>
              </div>
              <p style="font-size: 12px; color: #6b7280; line-height: 1.5;">
                <strong>Medical Emergency Disclaimer:</strong> Novalyte AI does not provide emergency or medical care. If you are experiencing a medical emergency, please contact local emergency services immediately.
              </p>
              <p style="font-size: 12px; color: #6b7280; line-height: 1.5; margin-top: 15px;">
                Submitted according to the <a href="https://novalyte.io/privacy" style="color: #0f766e; text-decoration: underline;">Novalyte Privacy Policy</a>.
              </p>
              <hr style="border: 0; border-top: 1px solid #e5e5e5; margin-top: 25px;" />
              <p style="font-size: 11px; text-align: center; color: #9ca3af; margin-top: 15px;">
                &copy; 2026 Novalyte AI. All rights reserved.
              </p>
            </div>
          `;

          const msgId = await sendEmailViaResend({
            apiKey: resendApiKey,
            from: `Novalyte AI <${confirmationFrom}>`,
            to: submission.email,
            subject: emailSubject,
            html: emailHtml
          });
          await updateDeliveryStatus(confirmationEmailRecord.id, "sent", undefined, msgId);
        } catch (err: any) {
          console.error("Confirmation email delivery failed:", err);
          await updateDeliveryStatus(confirmationEmailRecord.id, "failed", err.message);
        }
      } else {
        await updateDeliveryStatus(confirmationEmailRecord.id, "failed", "Resend API key missing");
      }
    }

    await captureServerEvent({
      distinctId: submission.id,
      event: "contact_submitted",
      properties: {
        sender_type: val.senderType,
        inquiry_category: val.inquiryCategory,
        routing_team: routing.team,
        priority: routing.priority,
        utm_source: val.utm_source ?? null,
        utm_medium: val.utm_medium ?? null,
        utm_campaign: val.utm_campaign ?? null,
      },
    });
    return NextResponse.json({ ok: true, referenceNumber, submissionId: submission.id });

  } catch (e: any) {
    console.error("General contact submission error", e);
    return NextResponse.json({ error: "Server error processing submission" }, { status: 500 });
  }
}
