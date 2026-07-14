# Task 10 — Journal rebuild into SEO-focused publishing system

**Agent:** Subagent (Z.ai Code)
**Task ID:** 10

## Summary

Rebuilt the Novalyte AI Journal from a modal-based article reader into a complete SEO-focused publishing system with dedicated article view pages, category landing pages, substantial long-form article content, structured-data JSON-LD, and a sitemap/robots setup.

## Files created / modified

### Modified
- `/home/z/my-project/src/lib/nav.ts` — added `"journal-article"` and `"journal-category"` to the `ViewKey` union type.
- `/home/z/my-project/src/components/site/app-shell.tsx` — imported `ARTICLES`/`getArticleBySlug` from `@/lib/article-content`; routed both new views; switched `journal` view to pass `ARTICLES` (long-form content) instead of `data.articles`.
- `/home/z/my-project/src/components/views/journal-view.tsx` — fully rewritten as the Journal landing page (featured article hero, category pills, editor's picks, more-from-journal grid, newsletter CTA, editorial policy section, disclaimer).
- `/home/z/my-project/public/robots.txt` — **removed** (replaced by `app/robots.ts` route handler which includes a sitemap reference).

### New
- `/home/z/my-project/src/lib/article-content.ts` — 6 long-form articles (1,200–1,800 words each) with structured `ArticleBlock[]` bodies, TOCs auto-derived from H2s, references to real public-health/professional-society sources (FDA, NIH, CDC, Endocrine Society, AUA, AGA, NIA, BLS, FSMB, AANP, DEA) labeled "for general reference", 3–5 FAQs per article, real author/reviewer metadata, and educational-not-clinical-advice disclaimers.
- `/home/z/my-project/src/lib/seo.ts` — 6 JSON-LD helpers (`articleJsonLd`, `breadcrumbJsonLd`, `faqJsonLd`, `organizationJsonLd`, `websiteJsonLd`, `medicalClinicJsonLd`) with hash-routed canonical URLs matching the Zustand view-router architecture.
- `/home/z/my-project/src/components/views/article-view.tsx` — dedicated article page (NOT a modal): breadcrumbs, H1, excerpt, author + reviewer cards, hero image (priority), sticky TOC sidebar with IntersectionObserver scroll-spy on desktop / collapsible on mobile, structured-block body renderer (headings with anchor IDs, paragraphs, lists, callouts info/warning/tip, shadcn Table), FAQ accordion, numbered references, MedicalDisclaimer, related-articles grid, newsletter CTA, platform CTA, share controls (copy link + X/LinkedIn/Facebook), and 3 JSON-LD `<script>` tags (Article + BreadcrumbList + FAQPage).
- `/home/z/my-project/src/components/views/journal-category-view.tsx` — category landing page with breadcrumbs, hero, category nav pills, article grid, disclaimer.
- `/home/z/my-project/src/app/sitemap.ts` — Next.js MetadataRoute.Sitemap with 25 URLs (8 main + 6 articles + 6 categories + 5 legal).
- `/home/z/my-project/src/app/robots.ts` — Next.js MetadataRoute.Robots allowing all crawlers, pointing to sitemap.

## Articles

| # | Slug | Category | Reading time |
|---|------|----------|--------------|
| 1 | `understanding-trt-overview` | Testosterone | 9 min |
| 2 | `glp-1-medical-weight-loss` | Weight Management | 9 min |
| 3 | `state-of-mens-health-clinic-operations` | Clinic Operations | 8 min |
| 4 | `recruiting-specialized-talent-mens-health` | Workforce | 8 min |
| 5 | `longevity-medicine-science-vs-hype` | Longevity | 10 min |
| 6 | `compliant-telehealth-mens-health` | Healthcare Technology | 8 min |

## Verification

- `bun run lint` → exit 0, zero errors, zero warnings.
- `GET /` → 200 OK.
- `GET /robots.txt` → 200 OK; serves `User-Agent: * / Allow: / / Host: https://novalyte.ai / Sitemap: https://novalyte.ai/sitemap.xml`.
- `GET /sitemap.xml` → 200 OK; serves 25-URL XML sitemap including all 6 journal article URLs (with `lastmod` from each article's `updatedAt`).
- Dev server compiles cleanly (`✓ Compiled in 147ms`).
