-- Drafts must be creatable without a publish timestamp. Public visibility
-- remains gated by status = 'published' AND publishedAt <= now() AND deletedAt IS NULL.

alter table public."Article"
  alter column "publishedAt" drop not null;

comment on column public."Article"."publishedAt" is
  'Null for unpublished drafts; public visibility also requires status=published and publishedAt <= now().';
