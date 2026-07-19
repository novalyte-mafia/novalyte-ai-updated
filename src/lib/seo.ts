/**
 * Novalyte AI — SEO helpers
 *
 * Structured-data builders for the Novalyte Journal. Each function returns a
 * plain JSON-LD-compatible object that the article view renders inside a
 * <script type="application/ld+json"> tag.
 *
 * The Journal lives at real App Router routes (`/journal/{slug}`,
 * `/journal/category/{slug}`); legacy hash URLs redirect there.
 */

import type { ArticleContent } from "@/lib/article-content";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  absoluteSiteUrl,
} from "@/lib/site-config";

const PUBLISHER_LOGO = absoluteSiteUrl("/logo.svg");

/** Slug normalization matching the shared Journal contract. */
function journalSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Build a journal article URL (real App Router route). */
export function articleUrl(slug: string): string {
  return `${SITE_URL}/journal/${journalSlug(slug)}`;
}

/** Build a journal category URL (real App Router route). */
export function categoryUrl(category: string): string {
  return `${SITE_URL}/journal/category/${journalSlug(category)}`;
}

/** Hero images may be site-relative paths or absolute Supabase Storage URLs. */
export function absoluteImageUrl(src: string): string {
  return /^https?:\/\//i.test(src) ? src : `${SITE_URL}${src}`;
}

/** Article schema.org JSON-LD. */
export function articleJsonLd(article: ArticleContent) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: [absoluteImageUrl(article.heroImage)],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      "@type": "Organization",
      name: article.author.name,
    },
    reviewer: article.medicalReviewer
      ? {
          "@type": "Person",
          name: article.medicalReviewer.name,
          jobTitle: article.medicalReviewer.role,
        }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: PUBLISHER_LOGO,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl(article.slug),
    },
    articleSection: article.category,
    keywords: article.tags.join(", "),
  };
}

/** BreadcrumbList schema.org JSON-LD. */
export function breadcrumbJsonLd(items: { label: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.label,
      item: it.url,
    })),
  };
}

/** FAQPage schema.org JSON-LD. Only meaningful when FAQs exist. */
export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  if (faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}

/** Organization schema.org JSON-LD for Novalyte AI. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: PUBLISHER_LOGO,
    description: SITE_DESCRIPTION,
  };
}

/** WebSite schema.org JSON-LD. */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
    },
  };
}

/**
 * MedicalClinic / LocalBusiness schema.org JSON-LD.
 * Placeholder structure for future per-clinic pages — fields populated from
 * the clinic's verified profile when available.
 */
export function medicalClinicJsonLd(clinic: {
  name: string;
  description?: string;
  url?: string;
  phone?: string | null;
  city?: string;
  state?: string;
  zip?: string;
  website?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    name: clinic.name,
    description: clinic.description ?? "",
    url: clinic.url ?? SITE_URL,
    telephone: clinic.phone ?? undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: clinic.city,
      addressRegion: clinic.state,
      postalCode: clinic.zip,
      addressCountry: "US",
    },
    sameAs: clinic.website ? [clinic.website] : undefined,
  };
}
