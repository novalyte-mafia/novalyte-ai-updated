-- Attribution fields for form submissions (Live Website Activity / outreach decisions)
alter table form_submissions
  add column if not exists device_type text,
  add column if not exists browser text,
  add column if not exists os text,
  add column if not exists landing_path text,
  add column if not exists landing_at timestamptz,
  add column if not exists geo_city text,
  add column if not exists geo_region text,
  add column if not exists geo_country text,
  add column if not exists referrer_domain text;

create index if not exists form_submissions_utm_source_idx on form_submissions (utm_source);
create index if not exists form_submissions_referrer_domain_idx on form_submissions (referrer_domain);
