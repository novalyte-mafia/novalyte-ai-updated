# Journal Pillar: Low Testosterone, ED, Fatigue & Weight Gain

## Status

- **Editorial status:** Published (indexable)
- **Medical review status:** Medical Review Required (no invented clinician; do not show a “Medically Reviewed” badge)
- **Public hub/sitemap:** included
- **Live URL:** `https://novalyte.io/journal/low-testosterone-ed-fatigue-weight-gain-mens-health-clinic`
- Clinician medical review remains outstanding for accuracy claims.

## Architecture notes

Journal articles are JSON blocks (`ArticleBlock`) rendered by `article-view.tsx`.
Content Studio (dashboard) authors markdown, converts to blocks, and publishes to Supabase.
Hardcoded registry remains for merge mode; this pillar lives in:

`src/lib/journal/articles/low-testosterone-ed-fatigue-pillar.ts`

Extended block types: `pullquote`, `cta`.

## GLM 5.2 integration

Configured in the dashboard Content Studio:

| Variable | Purpose |
| --- | --- |
| `GLM_API_KEY` | Server-only Zhipu/Z.ai API key (**never** client-exposed) |
| `GLM_API_URL` | Optional; defaults to `https://open.bigmodel.cn/api/paas/v4/chat/completions` |
| `GLM_MODEL` | General GLM model fallback |
| `GLM_LONGFORM_MODEL` | Long-form default — set to `glm-5.2` |

Content Studio shows a **GLM 5.2** model selector. Generation remains accept-to-apply (does not overwrite without confirmation). Sectioned generation preserves long-form length.

**Do not commit API keys.** Place the key only in local/dashboard secrets.

Alternate API host used by some Z.ai docs: `https://api.z.ai/api/paas/v4/` — set `GLM_API_URL` if your account requires it.

## Images

Stored under `public/images/articles/mens-health-pillar/` (generated editorial assets; treat as requiring art-direction approval before brand campaigns).

## Supporting cluster (planned — not linked yet)

See `PILLAR_CONTENT_CLUSTER_ROADMAP` in the pillar module.

## Sources used

1. Endocrine Society testosterone therapy CPG  
2. AUA testosterone deficiency guideline  
3. AUA erectile dysfunction guideline  
4. MedlinePlus Testosterone  
5. NIDDK sexual/urologic problems of diabetes  
6. FDA testosterone information  
7. CDC heart-disease risk factors  

Verify URLs at publication time; guidelines pages can move.

## Claims still requiring medical review

- Any characterization of guideline “usual” laboratory practice
- Framing of ED as a cardiometabolic signal
- Fertility effects of exogenous testosterone
- Monitoring domains (hematocrit, prostate-related screening)
- Comparative framing of care settings
- Cost language (intentionally non-numeric; still review for fairness)

## Publication checklist

1. Medical reviewer assigned (real credentials — do not invent)
2. Citations verified live
3. Images approved / licenses recorded
4. Assessment + directory CTAs QA’d
5. Structured data validated (Article + FAQ)
6. Set `editorialStatus` / `medicalReviewStatus` to approved/published
7. Set `seo.noIndex` to `false`
8. Upsert to Supabase as `status: published` if using DB as source of truth
9. Revalidate journal cache
10. Confirm sitemap includes the slug

## Rollback

1. Keep `editorialStatus: medical_review_required` and `seo.noIndex: true`, **or**
2. Remove the article from `ARTICLES` array, **or**
3. Soft-delete Supabase row / set status away from published
4. Call journal revalidate endpoint

## Env vars (homepage)

- `JOURNAL_SOURCE`, `JOURNAL_PREVIEW_SECRET`, `JOURNAL_REVALIDATE_SECRET`
- Unchanged for this article (hardcoded draft path)

## Env vars (dashboard)

- `GLM_API_KEY`, `GLM_API_URL`, `GLM_LONGFORM_MODEL=glm-5.2`
- Journal bridge secrets as already documented
