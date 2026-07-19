-- AI generation provenance on Article drafts.
-- Additive: an append-only jsonb log of GLM generation events (prompt inputs,
-- model, timestamps). Written only by the dashboard's service-role client;
-- the public RLS SELECT policy from the JournalArticleV1 migration already
-- restricts reads to published rows.

alter table public."Article"
  add column if not exists "generationProvenance" jsonb not null default '[]'::jsonb;

alter table public."Article"
  drop constraint if exists "Article_generationProvenance_array_check",
  add constraint "Article_generationProvenance_array_check"
    check (jsonb_typeof("generationProvenance") = 'array') not valid;

comment on column public."Article"."generationProvenance" is
  'Append-only log of AI generation events: {kind, provider, model, promptInputs, status, attempts, durationMs, createdBy, createdAt}. No keyword metrics are ever stored here as facts.';
