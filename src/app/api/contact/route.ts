import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { z } from "zod";
import crypto from "crypto";

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

// Helpers
async function sendSlackNotification(webhookUrl: string, sub: any) {
  const payload = {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `📬 New Contact Submission (${sub.priority.toUpperCase()})`,
          emoji: true
        }
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Ref Number:*\n${sub.reference_number}` },
          { type: "mrkdwn", text: `*Routing Team:*\n${sub.routing_team}` },
          { type: "mrkdwn", text: `*Sender Type:*\n${sub.sender_type}` },
          { type: "mrkdwn", text: `*Category:*\n${sub.inquiry_category}` }
        ]
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Name:*\n${sub.first_name} ${sub.last_name}` },
          { type: "mrkdwn", text: `*Email:*\n${sub.email}` },
          { type: "mrkdwn", text: `*Phone:*\n${sub.phone || "N/A"}` },
          { type: "mrkdwn", text: `*Organization:*\n${sub.organization_name || "N/A"}` }
        ]
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Subject:* ${sub.subject}\n\n*Message:*\n${sub.message}`
        }
      },
      {
        type: "context",
        elements: [
          { type: "mrkdwn", text: `*Submitted At:* ${new Date(sub.created_at).toLocaleString()} | *Source:* ${sub.source_page || "Direct"}` }
        ]
      }
    ]
  };

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    throw new Error(`Slack status ${res.status}`);
  }
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
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid fields", details: parsed.error.flatten() }, { status: 400 });
    }

    const val = parsed.data;

    // Generate unique reference number (REF-20260715-XXXX)
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
    const referenceNumber = `REF-20260715-${randomChars}`;

    // Get routing info
    const routing = getRoutingInfo(val.senderType, val.inquiryCategory);

    // Salting & hashing IP address for abuse prevention
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    let ipHash = "";
    try {
      const salt = process.env.CONTACT_RATE_LIMIT_SECRET || "novalyte_secret_salt";
      ipHash = crypto.createHmac("sha256", salt).update(ip).digest("hex");
    } catch (e) {
      ipHash = ip; // Fallback
    }

    // Capture user agent
    const userAgent = req.headers.get("user-agent") || "";

    // Pure Supabase insert (No Prisma!)
    const { data: submission, error: dbError } = await supabaseAdmin
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

    // Create delivery queue items in database (for retry mechanism and delivery tracking)
    const channels = ["slack", "internal_email", "sender_confirmation_email"];
    const deliveryRecords: any[] = [];

    for (const channel of channels) {
      const { data: delRec, error: delError } = await supabaseAdmin
        .from("contact_notification_deliveries")
        .insert([
          {
            contact_submission_id: submission.id,
            channel,
            status: "pending",
            attempt_count: 0
          }
        ])
        .select()
        .single();
      
      if (!delError && delRec) {
        deliveryRecords.push(delRec);
      }
    }

    // Define helper to update delivery status
    const updateDeliveryStatus = async (recordId: string, status: string, errorMsg?: string, messageId?: string) => {
      await supabaseAdmin
        .from("contact_notification_deliveries")
        .update({
          status,
          attempt_count: 1,
          last_error: errorMsg || null,
          provider_message_id: messageId || null,
          sent_at: status === "sent" ? new Date().toISOString() : null
        })
        .eq("id", recordId);
    };

    // Get secrets
    const slackWebhook = process.env.SLACK_CONTACT_WEBHOOK_URL;
    const resendApiKey = process.env.RESEND_API_KEY;
    const notificationTo = process.env.CONTACT_NOTIFICATION_TO_EMAIL || "admin@novalyte.io";
    const notificationFrom = process.env.CONTACT_NOTIFICATION_FROM_EMAIL || "accounts@novalyte.io";
    const confirmationFrom = process.env.CONTACT_CONFIRMATION_FROM_EMAIL || "no-reply@novalyte.io";

    // 1. Deliver to Slack
    const slackRecord = deliveryRecords.find(r => r.channel === "slack");
    if (slackRecord) {
      if (slackWebhook) {
        try {
          await sendSlackNotification(slackWebhook, submission);
          await updateDeliveryStatus(slackRecord.id, "sent");
        } catch (err: any) {
          console.error("Slack delivery failed:", err);
          await updateDeliveryStatus(slackRecord.id, "failed", err.message);
        }
      } else {
        await updateDeliveryStatus(slackRecord.id, "failed", "Slack webhook URL missing");
      }
    }

    // 2. Deliver Internal Email
    const internalEmailRecord = deliveryRecords.find(r => r.channel === "internal_email");
    if (internalEmailRecord) {
      if (resendApiKey) {
        try {
          const emailSubject = `[Novalyte Contact] [${submission.sender_type.toUpperCase()}] ${submission.subject} — ${submission.reference_number}`;
          const emailHtml = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 12px;">
              <h2 style="color: #0f766e; border-bottom: 2px solid #0f766e; padding-bottom: 10px;">New Inquiry Received</h2>
              <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; width: 150px;">Ref Number:</td>
                  <td>${submission.reference_number}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold;">Sender Type:</td>
                  <td>${submission.sender_type}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold;">Category:</td>
                  <td>${submission.inquiry_category}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold;">Routing Team:</td>
                  <td>${submission.routing_team}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold;">Priority:</td>
                  <td style="color: ${submission.priority === "urgent" ? "#b91c1c" : "#000"}; font-weight: bold;">${submission.priority.toUpperCase()}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold;">Full Name:</td>
                  <td>${submission.first_name} ${submission.last_name}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold;">Email:</td>
                  <td><a href="mailto:${submission.email}">${submission.email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold;">Phone:</td>
                  <td>${submission.phone || "N/A"}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold;">Organization:</td>
                  <td>${submission.organization_name || "N/A"} (${submission.organization_website || "N/A"})</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold;">City/State:</td>
                  <td>${submission.city || "N/A"}, ${submission.state || "N/A"}</td>
                </tr>
              </table>
              <div style="margin-top: 20px; padding: 15px; background-color: #f9fafb; border-radius: 8px; border: 1px solid #f3f4f6;">
                <h4 style="margin-top: 0; color: #1f2937;">Subject: ${submission.subject}</h4>
                <p style="white-space: pre-wrap; font-size: 14px; line-height: 1.5; color: #374151; margin-bottom: 0;">${submission.message}</p>
              </div>
              <p style="font-size: 11px; color: #6b7280; margin-top: 20px;">
                Submitted from: ${submission.source_page || "Direct"} | IP: Hidden for privacy
              </p>
            </div>
          `;

          const msgId = await sendEmailViaResend({
            apiKey: resendApiKey,
            from: `Novalyte AI <${notificationFrom}>`,
            to: notificationTo,
            replyTo: submission.email,
            subject: emailSubject,
            html: emailHtml
          });
          await updateDeliveryStatus(internalEmailRecord.id, "sent", undefined, msgId);
        } catch (err: any) {
          console.error("Internal email delivery failed:", err);
          await updateDeliveryStatus(internalEmailRecord.id, "failed", err.message);
        }
      } else {
        await updateDeliveryStatus(internalEmailRecord.id, "failed", "Resend API key missing");
      }
    }

    // 3. Deliver Confirmation Email
    const confirmationEmailRecord = deliveryRecords.find(r => r.channel === "sender_confirmation_email");
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
              <p style="font-size: 15px; color: #1f2937;">Dear ${submission.first_name},</p>
              <p style="font-size: 14px; color: #4b5563; line-height: 1.5;">
                Thank you for contacting Novalyte AI. We have received your inquiry and our team has routed it to the <strong>${submission.routing_team.replace("_", " ")}</strong> department.
              </p>
              <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #f3f4f6; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #1f2937;">Copy of Inquiry: ${submission.subject}</h4>
                <p style="white-space: pre-wrap; font-size: 13px; line-height: 1.5; color: #4b5563; margin-bottom: 0;">${submission.message}</p>
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

    return NextResponse.json({ ok: true, referenceNumber, submissionId: submission.id });

  } catch (e: any) {
    console.error("General contact submission error", e);
    return NextResponse.json({ error: "Server error processing submission" }, { status: 500 });
  }
}
