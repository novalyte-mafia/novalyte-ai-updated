# Investor Portal Database

**Migrations:**
- `supabase/migrations/20260721140000_investor_portal.sql` — tables, RLS core, storage bucket, seeds
- `supabase/migrations/20260721150000_investor_rls_policies.sql` — founder/approved SELECT policies for previously policy-less tables

**Applied:** Yes (both applied to the production Supabase project linked to the marketing app)

## Role helpers

| Function | Purpose |
|---|---|
| `grant_account_type(user_id, type)` | Appends type to `raw_app_meta_data.account_types` (extended for investor roles) |
| `revoke_account_type(user_id, type)` | Removes type from `account_types` |

## Tables

| Table | Purpose |
|---|---|
| `investor_access_requests` | Inbound access requests; unique pending email |
| `investor_profiles` | Approved/revoked investor profile + terms acceptance |
| `investor_invitations` | Invite tokens / email records |
| `investor_terms_versions` | Draft/published access terms |
| `investor_terms_acceptances` | Per-user acceptance records |
| `investor_content_sections` | Optional DB-backed content sections (visibility scopes) |
| `investor_metrics` | Traction metrics with status labels + visibility |
| `investor_fundraising_rounds` | Round metadata (published only when founder sets) |
| `investor_use_of_funds` | Use-of-funds lines tied to rounds |
| `investor_financial_scenarios` | Named scenarios (no seed invented numbers) |
| `investor_financial_series` | Time-series points for charts |
| `investor_roadmap_items` | Product/GTM roadmap entries |
| `investor_documents` | Data-room document metadata |
| `investor_document_versions` | Versioned storage paths |
| `investor_updates` | Founder updates to investors |
| `investor_meeting_requests` | Meeting / inquiry submissions |
| `investor_notes` | Founder notes on investors |
| `investor_access_events` | Append-only audit trail |
| `investor_notification_deliveries` | Email/Slack delivery results |

## Storage

- Bucket: `investor-data-room` (private)
- Uploads: founder-only API (`/api/investor/admin/documents`)
- Downloads: `/api/investor/documents/[id]` mints ~60s signed URLs after ACL + terms checks
- No durable public object URLs; no broad public storage policies

## RLS summary

- RLS enabled on all `investor_*` tables
- Anon: no confidential reads
- Authenticated approved investors: own profile, published terms, published metrics/content/roadmap/updates, approved documents metadata
- Own access events selectable
- Founder/service-role: full management via server routes using service role after `requireFounderAdmin`

## Seeded data

- Draft terms version (not published until founder publishes)
- Roadmap items reflecting verified product progress (directory, workforce, marketplace, Campaign Studio, Command Center)

## Indexes

Pending-email uniqueness, status indexes on requests/profiles, document category index, access-events user index.
