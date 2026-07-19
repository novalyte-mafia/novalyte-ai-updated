-- JournalArticleV1 schema foundation.
-- This migration is intentionally additive: legacy "Article" columns, including
-- "content", remain available throughout the Journal cutover.

create or replace function public.normalize_journal_slug(value text)
returns text
language sql
immutable
strict
set search_path = ''
as $$
  select trim(both '-' from regexp_replace(
    lower(btrim(value)),
    '[^a-z0-9]+',
    '-',
    'g'
  ));
$$;

do $$
begin
  if exists (
    select 1
    from public."Article"
    group by public.normalize_journal_slug("slug")
    having count(*) > 1
  ) then
    raise exception
      'Cannot normalize Article slugs: multiple rows resolve to the same slug';
  end if;

  if exists (
    select 1
    from public."Article"
    where public.normalize_journal_slug("slug") = ''
  ) then
    raise exception 'Cannot normalize Article slugs: a slug resolves to empty';
  end if;
end
$$;

update public."Article"
set "slug" = public.normalize_journal_slug("slug")
where "slug" is distinct from public.normalize_journal_slug("slug");

alter table public."Article"
  add column if not exists "bodyJson" jsonb,
  add column if not exists "contentMarkdown" text,
  add column if not exists "tableOfContents" jsonb,
  add column if not exists "faqsJson" jsonb,
  add column if not exists "referencesJson" jsonb,
  add column if not exists "tags" text[] not null default '{}'::text[],
  add column if not exists "authorJson" jsonb,
  add column if not exists "medicalReviewerJson" jsonb,
  add column if not exists "seoTitle" text,
  add column if not exists "seoDescription" text,
  add column if not exists "canonicalUrl" text,
  add column if not exists "seoNoIndex" boolean not null default false,
  add column if not exists "primaryKeyword" text,
  add column if not exists "secondaryKeywords" text[] not null default '{}'::text[],
  add column if not exists "heroImageUrl" text,
  add column if not exists "heroImageAlt" text,
  add column if not exists "heroImageCaption" text,
  add column if not exists "heroImageAspect" text,
  add column if not exists "scheduledFor" timestamptz,
  add column if not exists "deletedAt" timestamptz,
  add column if not exists "rowVersion" bigint not null default 1,
  add column if not exists "schemaVersion" integer not null default 1;

alter table public."Article"
  drop constraint if exists "Article_bodyJson_array_check",
  add constraint "Article_bodyJson_array_check"
    check ("bodyJson" is null or jsonb_typeof("bodyJson") = 'array') not valid,
  drop constraint if exists "Article_heroImageAspect_check",
  add constraint "Article_heroImageAspect_check"
    check ("heroImageAspect" is null or "heroImageAspect" in ('wide', 'standard')) not valid,
  drop constraint if exists "Article_rowVersion_check",
  add constraint "Article_rowVersion_check"
    check ("rowVersion" >= 1) not valid,
  drop constraint if exists "Article_schemaVersion_check",
  add constraint "Article_schemaVersion_check"
    check ("schemaVersion" = 1) not valid,
  drop constraint if exists "Article_status_journal_check",
  add constraint "Article_status_journal_check"
    check ("status" in (
      'idea', 'brief', 'draft', 'review', 'approved', 'scheduled',
      'published', 'update_needed', 'archived'
    )) not valid,
  drop constraint if exists "Article_slug_normalized_check",
  add constraint "Article_slug_normalized_check"
    check ("slug" = public.normalize_journal_slug("slug") and "slug" <> '') not valid;

create unique index if not exists "Article_slug_normalized_unique"
  on public."Article" (lower("slug"));
create index if not exists "Article_public_visibility_idx"
  on public."Article" ("publishedAt" desc)
  where "status" = 'published' and "deletedAt" is null;
create index if not exists "Article_scheduledFor_idx"
  on public."Article" ("scheduledFor")
  where "status" = 'scheduled' and "deletedAt" is null;

create or replace function public.set_normalized_article_slug()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new."slug" := public.normalize_journal_slug(new."slug");
  if new."slug" = '' then
    raise exception 'Article slug cannot be empty after normalization';
  end if;
  return new;
end
$$;

drop trigger if exists "normalize_article_slug" on public."Article";
create trigger "normalize_article_slug"
before insert or update of "slug" on public."Article"
for each row execute function public.set_normalized_article_slug();

create table if not exists public.journal_media (
  id uuid primary key default gen_random_uuid(),
  bucket_id text not null,
  object_path text not null,
  visibility text not null default 'draft',
  mime_type text,
  byte_size bigint,
  width integer,
  height integer,
  alt_text text,
  caption text,
  checksum text,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint journal_media_visibility_check
    check (visibility in ('draft', 'published')),
  constraint journal_media_byte_size_check
    check (byte_size is null or byte_size >= 0),
  constraint journal_media_dimensions_check
    check (
      (width is null or width > 0)
      and (height is null or height > 0)
    ),
  constraint journal_media_object_unique unique (bucket_id, object_path)
);

alter table public."Article"
  add column if not exists "heroMediaId" uuid;

alter table public."Article"
  drop constraint if exists "Article_heroMediaId_fkey",
  add constraint "Article_heroMediaId_fkey"
    foreign key ("heroMediaId") references public.journal_media(id)
    on delete set null;

create table if not exists public.article_revisions (
  id uuid primary key default gen_random_uuid(),
  article_id text not null references public."Article"("id") on delete cascade,
  revision_number bigint not null,
  schema_version integer not null default 1,
  row_version bigint not null,
  snapshot jsonb not null,
  change_summary text,
  created_by uuid,
  created_at timestamptz not null default now(),
  constraint article_revisions_number_unique
    unique (article_id, revision_number),
  constraint article_revisions_schema_version_check
    check (schema_version = 1),
  constraint article_revisions_row_version_check
    check (row_version >= 1),
  constraint article_revisions_snapshot_object_check
    check (jsonb_typeof(snapshot) = 'object')
);

create index if not exists article_revisions_article_created_idx
  on public.article_revisions (article_id, created_at desc);

create table if not exists public.article_media (
  article_id text not null references public."Article"("id") on delete cascade,
  media_id uuid not null references public.journal_media(id) on delete cascade,
  role text not null default 'inline',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (article_id, media_id, role),
  constraint article_media_role_check
    check (role in ('hero', 'inline', 'social', 'attachment')),
  constraint article_media_sort_order_check
    check (sort_order >= 0)
);

create index if not exists article_media_article_order_idx
  on public.article_media (article_id, sort_order);

create table if not exists public.article_slug_redirects (
  id uuid primary key default gen_random_uuid(),
  from_slug text not null,
  article_id text not null references public."Article"("id") on delete cascade,
  http_status smallint not null default 308,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid,
  constraint article_slug_redirects_status_check
    check (http_status in (301, 302, 307, 308)),
  constraint article_slug_redirects_slug_check
    check (
      from_slug = public.normalize_journal_slug(from_slug)
      and from_slug <> ''
    )
);

create unique index if not exists article_slug_redirects_from_slug_unique
  on public.article_slug_redirects (lower(from_slug));

create or replace function public.set_normalized_redirect_slug()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.from_slug := public.normalize_journal_slug(new.from_slug);
  if new.from_slug = '' then
    raise exception 'Redirect slug cannot be empty after normalization';
  end if;
  return new;
end
$$;

drop trigger if exists normalize_article_redirect_slug
  on public.article_slug_redirects;
create trigger normalize_article_redirect_slug
before insert or update of from_slug on public.article_slug_redirects
for each row execute function public.set_normalized_redirect_slug();

-- Public assets and draft assets use separate buckets. A prefix in a public
-- bucket is not private, so drafts must stay in the private journal-drafts
-- bucket until the publishing workflow copies/promotes them.
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values
  (
    'journal-media',
    'journal-media',
    true,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
  ),
  (
    'journal-drafts',
    'journal-drafts',
    false,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
  )
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Tighten table visibility. Server-side service-role clients bypass RLS and
-- remain responsible for all authoring/revision/media writes.
alter table public."Article" enable row level security;
alter table public.article_revisions enable row level security;
alter table public.journal_media enable row level security;
alter table public.article_media enable row level security;
alter table public.article_slug_redirects enable row level security;

-- Remove every legacy SELECT/ALL policy so no broader predicate can be ORed
-- with the visibility policy below.
do $$
declare
  policy_record record;
begin
  for policy_record in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'Article'
      and cmd in ('SELECT', 'ALL')
  loop
    execute format(
      'drop policy if exists %I on public."Article"',
      policy_record.policyname
    );
  end loop;
end
$$;

create policy "Journal public can read visible articles"
on public."Article"
for select
to anon, authenticated
using (
  "status" = 'published'
  and "publishedAt" <= now()
  and "deletedAt" is null
);

drop policy if exists "Journal public can read published media"
  on public.journal_media;
create policy "Journal public can read published media"
on public.journal_media
for select
to anon, authenticated
using (
  visibility = 'published'
  and bucket_id = 'journal-media'
  and deleted_at is null
);

drop policy if exists "Journal public can read article media"
  on public.article_media;
create policy "Journal public can read article media"
on public.article_media
for select
to anon, authenticated
using (
  exists (
    select 1
    from public."Article" article
    where article."id" = article_media.article_id
      and article."status" = 'published'
      and article."publishedAt" <= now()
      and article."deletedAt" is null
  )
);

drop policy if exists "Journal public can read active redirects"
  on public.article_slug_redirects;
create policy "Journal public can read active redirects"
on public.article_slug_redirects
for select
to anon, authenticated
using (
  is_active
  and exists (
    select 1
    from public."Article" article
    where article."id" = article_slug_redirects.article_id
      and article."status" = 'published'
      and article."publishedAt" <= now()
      and article."deletedAt" is null
  )
);

revoke all on table public."Article" from anon, authenticated;
revoke all on table public.article_revisions from anon, authenticated;
revoke all on table public.journal_media from anon, authenticated;
revoke all on table public.article_media from anon, authenticated;
revoke all on table public.article_slug_redirects from anon, authenticated;

revoke all on table public."Article" from public;
revoke all on table public.article_revisions from public;
revoke all on table public.journal_media from public;
revoke all on table public.article_media from public;
revoke all on table public.article_slug_redirects from public;

grant select on table public."Article" to anon, authenticated;
grant select on table public.journal_media to anon, authenticated;
grant select on table public.article_media to anon, authenticated;
grant select on table public.article_slug_redirects to anon, authenticated;

drop policy if exists "Journal public can read published storage objects"
  on storage.objects;
create policy "Journal public can read published storage objects"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'journal-media');

comment on table public.article_revisions is
  'Immutable JournalArticleV1 snapshots. Writes use the server-side service role.';
comment on table public.journal_media is
  'Journal media metadata. Draft files use journal-drafts; published files use journal-media.';
comment on column public."Article"."content" is
  'Legacy article body retained during the structured Journal cutover.';
