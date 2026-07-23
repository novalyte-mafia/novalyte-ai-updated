import { describe, expect, it } from "vitest";
import { ARTICLES, getArticleBySlug, isPubliclyListedArticle } from "@/lib/article-content";
import { lowTestosteroneEdFatiguePillarArticle } from "@/lib/journal/articles/low-testosterone-ed-fatigue-pillar";
import { articleBlockSchema } from "@/lib/journal-article-v1";

describe("low testosterone pillar article", () => {
  it("is registered, publicly listed, and indexable for SERP", () => {
    expect(getArticleBySlug(lowTestosteroneEdFatiguePillarArticle.slug)).toBeTruthy();
    expect(isPubliclyListedArticle(lowTestosteroneEdFatiguePillarArticle)).toBe(true);
    expect(lowTestosteroneEdFatiguePillarArticle.seo.noIndex).toBe(false);
    expect(lowTestosteroneEdFatiguePillarArticle.editorialStatus).toBe("published");
    expect(lowTestosteroneEdFatiguePillarArticle.medicalReviewer).toBeNull();
    expect(lowTestosteroneEdFatiguePillarArticle.medicalReviewStatus).toBe("medical_review_required");
  });

  it("uses the required slug and SEO title", () => {
    expect(lowTestosteroneEdFatiguePillarArticle.slug).toBe(
      "low-testosterone-ed-fatigue-weight-gain-mens-health-clinic",
    );
    expect(lowTestosteroneEdFatiguePillarArticle.seo.title).toContain("Low Testosterone and ED");
  });

  it("validates every body block against the journal schema", () => {
    for (const block of lowTestosteroneEdFatiguePillarArticle.body) {
      const parsed = articleBlockSchema.safeParse(block);
      expect(parsed.success, JSON.stringify(block)).toBe(true);
    }
  });

  it("includes FAQ coverage and authoritative references", () => {
    expect(lowTestosteroneEdFatiguePillarArticle.faqs.length).toBeGreaterThanOrEqual(12);
    expect(lowTestosteroneEdFatiguePillarArticle.references.length).toBeGreaterThanOrEqual(5);
    expect(
      lowTestosteroneEdFatiguePillarArticle.references.every((r) => Boolean(r.url)),
    ).toBe(true);
  });

  it("does not invent a medical reviewer badge", () => {
    expect(lowTestosteroneEdFatiguePillarArticle.medicalReviewer).toBeNull();
  });

  it("appears among publicly listed articles", () => {
    const published = ARTICLES.filter(isPubliclyListedArticle);
    expect(published.some((a) => a.slug === lowTestosteroneEdFatiguePillarArticle.slug)).toBe(true);
    expect(published.length).toBeGreaterThanOrEqual(7);
  });
});
