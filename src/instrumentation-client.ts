import { ensurePostHogInitialized, hasAnalyticsConsent } from "@/lib/analytics-client";

if (hasAnalyticsConsent()) {
  ensurePostHogInitialized();
}
