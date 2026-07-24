import { createHash } from "node:crypto";

const TEST_EMAIL =
  /(^test[@.]|[+._-]test[@.]|do-?not-?contact|attribution-qa\+|noreply\+test|cursor.?agent)/i;
const TEST_NAME = /\b(test|do[- ]?not[- ]?contact|qa only|pipeline audit)\b/i;
const TEST_UTM = /^(pipeline_audit|attribution_fix|inbox_recipient_fix|live_activity|cursor_agent)$/i;

export function classifyTestSubmission(input: {
  contactName?: string | null;
  contactEmail?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  isTestFlag?: boolean | null;
  metadata?: Record<string, unknown> | null;
  environment?: string | null;
}): boolean {
  if (input.isTestFlag === true) return true;
  if (input.metadata?.is_test === true || input.metadata?.is_test === "true") return true;
  if (input.environment === "test" || input.environment === "development") return true;
  if (input.contactEmail && TEST_EMAIL.test(input.contactEmail)) return true;
  if (input.contactName && TEST_NAME.test(input.contactName)) return true;
  if (input.utmCampaign && TEST_UTM.test(input.utmCampaign)) return true;
  if (input.utmMedium && TEST_UTM.test(input.utmMedium)) return true;
  if (input.utmSource && /^cursor_agent$/i.test(input.utmSource)) return true;
  return false;
}

export function hashUa(ua: string | null | undefined): string | null {
  if (!ua) return null;
  return createHash("sha256").update(ua).digest("hex").slice(0, 32);
}
