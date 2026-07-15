-- Drop old ContactSubmission table if exists
DROP TABLE IF EXISTS "ContactSubmission" CASCADE;

-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS "contact_submissions" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "reference_number" TEXT UNIQUE NOT NULL,
  "sender_type" TEXT NOT NULL,
  "inquiry_category" TEXT NOT NULL,
  "first_name" TEXT NOT NULL,
  "last_name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "organization_name" TEXT,
  "organization_website" TEXT,
  "job_title" TEXT,
  "city" TEXT,
  "state" TEXT,
  "preferred_contact_method" TEXT,
  "has_existing_account" BOOLEAN,
  "relevant_url" TEXT,
  "subject" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "routing_team" TEXT NOT NULL,
  "priority" TEXT NOT NULL DEFAULT 'normal',
  "status" TEXT NOT NULL DEFAULT 'new',
  "source_page" TEXT,
  "utm_source" TEXT,
  "utm_medium" TEXT,
  "utm_campaign" TEXT,
  "user_agent_summary" TEXT,
  "ip_hash" TEXT,
  "consent_version" TEXT NOT NULL,
  "consented_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contact_notification_deliveries table
CREATE TABLE IF NOT EXISTS "contact_notification_deliveries" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "contact_submission_id" TEXT NOT NULL REFERENCES "contact_submissions"("id") ON DELETE CASCADE,
  "channel" TEXT NOT NULL,
  "destination" TEXT,
  "provider" TEXT,
  "provider_message_id" TEXT,
  "status" TEXT NOT NULL,
  "attempt_count" INTEGER NOT NULL DEFAULT 0,
  "last_error" TEXT,
  "sent_at" TIMESTAMP WITH TIME ZONE,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE "contact_submissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contact_notification_deliveries" ENABLE ROW LEVEL SECURITY;

-- Add index on contact_notification_deliveries contact_submission_id
CREATE INDEX IF NOT EXISTS "contact_notification_deliveries_contact_submission_id_idx" ON "contact_notification_deliveries"("contact_submission_id");
