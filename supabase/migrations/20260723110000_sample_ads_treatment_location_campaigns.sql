-- Sample hierarchical ads campaigns (paid, noindex by default).
-- Paths: /ads/{treatment}/{location} → public ads.novalyte.io/{treatment}/{location}
-- Safe to re-run: uses fixed UUIDs + on conflict do nothing / upserts on path.

-- Longevity + weight-loss vertical aliases (weight-loss maps to weight-management content)
insert into cs_treatment_verticals (slug, name, category) values
  ('longevity', 'Longevity', 'wellness'),
  ('weight-loss', 'Weight Loss', 'metabolic')
on conflict (slug) do nothing;

update cs_treatment_verticals
set default_assessment_slug = coalesce(default_assessment_slug, 'longevity-full')
where slug = 'longevity';

update cs_treatment_verticals
set default_assessment_slug = coalesce(default_assessment_slug, 'weight-full')
where slug = 'weight-loss';

-- States
insert into cs_geo_entities (id, kind, slug, name, parent_id, state_code) values
  ('a1000000-0000-4000-8000-000000000010', 'state', 'arizona', 'Arizona', 'a1000000-0000-4000-8000-000000000001', 'AZ'),
  ('a1000000-0000-4000-8000-000000000011', 'state', 'texas', 'Texas', 'a1000000-0000-4000-8000-000000000001', 'TX')
on conflict do nothing;

-- Location segments used in public URLs (city-state style)
insert into cs_geo_entities (id, kind, slug, name, parent_id, state_code) values
  ('a1000000-0000-4000-8000-000000000020', 'city', 'phoenix-az', 'Phoenix, AZ', 'a1000000-0000-4000-8000-000000000010', 'AZ'),
  ('a1000000-0000-4000-8000-000000000021', 'city', 'beverly-hills-ca', 'Beverly Hills, CA', 'a1000000-0000-4000-8000-000000000002', 'CA'),
  ('a1000000-0000-4000-8000-000000000022', 'city', 'palo-alto-ca', 'Palo Alto, CA', 'a1000000-0000-4000-8000-000000000002', 'CA'),
  ('a1000000-0000-4000-8000-000000000023', 'city', 'austin-tx', 'Austin, TX', 'a1000000-0000-4000-8000-000000000011', 'TX')
on conflict do nothing;

-- Sample paid campaigns
insert into cs_campaigns (
  id, name, internal_name, objective, traffic_type, vertical_id, status, settings
)
select
  'c1000000-0000-4000-8000-000000000001',
  'Sample · TRT Phoenix AZ',
  'sample-trt-phoenix-az',
  'patient_acquisition',
  'paid_search',
  v.id,
  'active',
  '{"sample": true, "protected": true}'::jsonb
from cs_treatment_verticals v
where v.slug = 'trt'
on conflict (id) do nothing;

insert into cs_campaigns (
  id, name, internal_name, objective, traffic_type, vertical_id, status, settings
)
select
  'c1000000-0000-4000-8000-000000000002',
  'Sample · Longevity Beverly Hills',
  'sample-longevity-beverly-hills-ca',
  'patient_acquisition',
  'paid_social',
  v.id,
  'active',
  '{"sample": true, "protected": true}'::jsonb
from cs_treatment_verticals v
where v.slug = 'longevity'
on conflict (id) do nothing;

insert into cs_campaigns (
  id, name, internal_name, objective, traffic_type, vertical_id, status, settings
)
select
  'c1000000-0000-4000-8000-000000000003',
  'Sample · Sexual Health Palo Alto',
  'sample-sexual-health-palo-alto-ca',
  'patient_acquisition',
  'paid_search',
  v.id,
  'active',
  '{"sample": true, "protected": true}'::jsonb
from cs_treatment_verticals v
where v.slug = 'sexual-health'
on conflict (id) do nothing;

-- Resolve paid template version id
with paid_tv as (
  select tv.id
  from cs_template_versions tv
  join cs_templates t on t.id = tv.template_id
  where t.slug = 'paid-conversion'
  order by tv.version desc
  limit 1
),
pages as (
  select * from (values
    (
      'd1000000-0000-4000-8000-000000000001'::uuid,
      'c1000000-0000-4000-8000-000000000001'::uuid,
      'trt/phoenix-az',
      '/ads/trt/phoenix-az',
      'trt',
      'arizona',
      'phoenix-az',
      'a1000000-0000-4000-8000-000000000020'::uuid,
      'TRT options in Phoenix, AZ',
      'Explore testosterone care navigation in Phoenix',
      'Informational TRT assessment for Phoenix-area patients. Licensed providers decide eligibility — Novalyte AI does not provide medical care.',
      '{"eyebrow":"Phoenix · TRT","headline":"Looking for testosterone care options in Phoenix?","subheadline":"Complete a short informational assessment. Licensed clinics decide next steps — Novalyte AI is a technology facilitator, not a medical provider."}'::jsonb,
      '{"assessment_slug":"testosterone-replacement-therapy","mode":"full"}'::jsonb,
      'Start the TRT assessment'
    ),
    (
      'd1000000-0000-4000-8000-000000000002'::uuid,
      'c1000000-0000-4000-8000-000000000002'::uuid,
      'longevity/beverly-hills-ca',
      '/ads/longevity/beverly-hills-ca',
      'longevity',
      'california',
      'beverly-hills-ca',
      'a1000000-0000-4000-8000-000000000021'::uuid,
      'Longevity care navigation in Beverly Hills',
      'Explore longevity and preventive health options in Beverly Hills',
      'Informational longevity assessment for Beverly Hills-area patients. Treatment decisions are made by licensed providers.',
      '{"eyebrow":"Beverly Hills · Longevity","headline":"Curious about longevity and preventive care in Beverly Hills?","subheadline":"Take an informational assessment. Eligible patients may be connected with clinics exploring longevity-focused care — Novalyte AI does not diagnose or treat."}'::jsonb,
      '{"assessment_slug":"longevity-medicine","mode":"full"}'::jsonb,
      'Start the longevity assessment'
    ),
    (
      'd1000000-0000-4000-8000-000000000003'::uuid,
      'c1000000-0000-4000-8000-000000000003'::uuid,
      'sexual-health/palo-alto-ca',
      '/ads/sexual-health/palo-alto-ca',
      'sexual-health',
      'california',
      'palo-alto-ca',
      'a1000000-0000-4000-8000-000000000022'::uuid,
      'Sexual health care navigation in Palo Alto',
      'Explore sexual health clinic options in Palo Alto',
      'Informational sexual-health assessment for Palo Alto-area patients. Licensed providers determine eligibility and care.',
      '{"eyebrow":"Palo Alto · Sexual health","headline":"Explore sexual health care options in Palo Alto","subheadline":"Complete a private informational assessment. Novalyte AI helps you navigate options — licensed clinics provide care."}'::jsonb,
      '{"assessment_slug":"erectile-dysfunction","mode":"full"}'::jsonb,
      'Start the assessment'
    )
  ) as t(
    id, campaign_id, slug, path, service_slug, state_slug, city_slug, geo_id,
    public_title, seo_title, seo_description, hero, form_config, cta_primary
  )
)
insert into cs_pages (
  id, campaign_id, template_version_id, page_type, host, slug, path,
  service_slug, state_slug, city_slug, geo_id, vertical_id,
  status, indexing_policy, public_title, internal_title, seo_title, seo_description,
  canonical_url, hero, cta_primary, cta_secondary, form_config, routing_config,
  current_version, published_at, assessment_placement, assessment_status
)
select
  p.id,
  p.campaign_id,
  (select id from paid_tv),
  'paid_conversion',
  'ads',
  p.slug,
  p.path,
  p.service_slug,
  p.state_slug,
  p.city_slug,
  p.geo_id,
  c.vertical_id,
  'published',
  'noindex_follow',
  p.public_title,
  p.public_title,
  p.seo_title,
  p.seo_description,
  'https://ads.novalyte.io/' || replace(p.path, '/ads/', ''),
  p.hero,
  p.cta_primary,
  'Learn more',
  p.form_config,
  '{"sample": true}'::jsonb,
  1,
  now(),
  array['below_hero'],
  'published'
from pages p
join cs_campaigns c on c.id = p.campaign_id
on conflict (path) do update set
  status = excluded.status,
  indexing_policy = excluded.indexing_policy,
  hero = excluded.hero,
  form_config = excluded.form_config,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  canonical_url = excluded.canonical_url,
  assessment_placement = excluded.assessment_placement,
  assessment_status = excluded.assessment_status,
  published_at = coalesce(cs_pages.published_at, excluded.published_at),
  updated_at = now();

-- Page version blocks (content modules)
insert into cs_page_versions (page_id, version, snapshot, blocks, change_summary)
values
(
  'd1000000-0000-4000-8000-000000000001',
  1,
  '{}'::jsonb,
  '[
    {"type":"value_props","title":"Why patients start here","items":[
      {"title":"Phoenix-focused navigation","description":"Location-aware guidance for men exploring TRT options in the Phoenix area."},
      {"title":"Informational assessment","description":"Share your goals and history so clinics can review fit — this is not a diagnosis."},
      {"title":"Licensed clinics decide care","description":"Novalyte AI does not provide medical treatment. Providers determine eligibility."}
    ]},
    {"type":"faq","title":"Common questions","items":[
      {"question":"Is this medical advice?","answer":"No. The assessment is informational only. Licensed providers make clinical decisions."},
      {"question":"Does submitting guarantee treatment?","answer":"No. Submission does not guarantee eligibility, an appointment, or treatment."},
      {"question":"Who is Novalyte AI?","answer":"Novalyte AI is a healthcare technology platform and facilitator that helps patients navigate clinic options."}
    ]}
  ]'::jsonb,
  'Sample TRT Phoenix seed'
),
(
  'd1000000-0000-4000-8000-000000000002',
  1,
  '{}'::jsonb,
  '[
    {"type":"value_props","title":"Longevity, thoughtfully introduced","items":[
      {"title":"Beverly Hills market context","description":"Messaging tailored for patients exploring longevity and preventive care locally."},
      {"title":"No outcome guarantees","description":"We do not claim guaranteed results or eligibility."},
      {"title":"Provider-led decisions","description":"Any care plan is determined by licensed clinicians — not by this website."}
    ]},
    {"type":"faq","title":"Common questions","items":[
      {"question":"Is Novalyte a clinic?","answer":"No. Novalyte AI facilitates education, assessments, and clinic discovery."},
      {"question":"Is this an emergency service?","answer":"No. If you have an emergency, call 911 or go to the nearest emergency department."}
    ]}
  ]'::jsonb,
  'Sample longevity Beverly Hills seed'
),
(
  'd1000000-0000-4000-8000-000000000003',
  1,
  '{}'::jsonb,
  '[
    {"type":"value_props","title":"Private, informational support","items":[
      {"title":"Palo Alto-focused","description":"Built for patients exploring sexual health options in the Palo Alto area."},
      {"title":"Assessment on the page","description":"Complete the assessment without leaving this landing page."},
      {"title":"Sensitive answers stay protected","description":"Health answers are stored for care routing — not exposed in analytics session replay."}
    ]},
    {"type":"faq","title":"Common questions","items":[
      {"question":"Will clinics see my answers?","answer":"Relevant information may be shared with assigned clinics so they can follow up appropriately."},
      {"question":"Can I get treatment from Novalyte?","answer":"Novalyte AI does not provide medical care. Licensed providers do."}
    ]}
  ]'::jsonb,
  'Sample sexual-health Palo Alto seed'
)
on conflict (page_id, version) do update set
  blocks = excluded.blocks,
  change_summary = excluded.change_summary;
