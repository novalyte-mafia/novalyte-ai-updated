"use client";

import { useMemo } from "react";
import { SectionShell, SectionHeading } from "@/components/shared/section";
import { Breadcrumbs, EmptyState } from "@/components/shared/enterprise";
import { DisclaimerBanner } from "@/components/shared/disclaimer";
import { SmartImage } from "@/components/shared/smart-image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { navigate } from "@/lib/nav";
import { cn } from "@/lib/utils";
import type { ArticleContent } from "@/lib/article-content";
import { JOURNAL_CATEGORIES } from "@/lib/article-content";
import {
  BookOpen,
  Clock,
  Calendar,
  ArrowRight,
  ArrowLeft,
  Library,
} from "lucide-react";

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return value;
  }
}

function ArticleCard({ article }: { article: ArticleContent }) {
  return (
    <button
      onClick={() => navigate("journal-article", undefined, { slug: article.slug })}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card text-left shadow-premium-sm transition card-premium-hover"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        <SmartImage
          src={article.heroImage}
          alt={article.heroImageAlt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="transition-transform duration-300 group-hover:scale-105"
          imgClassName="object-cover"
        />
        <div className="absolute left-3 top-3">
          <Badge className="border-teal-200 bg-white/90 text-teal-700 hover:bg-white/90 backdrop-blur">
            {article.category}
          </Badge>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-pretty text-lg font-semibold leading-snug text-foreground">{article.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{article.excerpt}</p>
        <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(article.publishedAt)}</span>
            <span className="text-muted-foreground/40">•</span>
            <Clock className="h-3 w-3" />
            <span>{article.readingTime} min read</span>
          </div>
        </div>
        <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-medium text-teal-700 group-hover:gap-2 transition-all">
          Read article <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </button>
  );
}

export function JournalCategoryView({
  category,
  articles,
}: {
  category: string;
  articles: ArticleContent[];
}) {
  const filtered = useMemo(
    () => articles.filter((a) => a.category === category),
    [articles, category],
  );

  const otherCategories = useMemo(
    () => JOURNAL_CATEGORIES.filter((c) => c !== category),
    [category],
  );

  return (
    <div className="min-h-screen">
      {/* Breadcrumbs */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Home", onClick: () => navigate("home") },
              { label: "Journal", onClick: () => navigate("journal") },
              { label: category },
            ]}
          />
        </div>
      </div>

      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-teal-50/50 to-background py-12 sm:py-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Library className="h-4 w-4 text-teal-600" />
            <span>Journal category</span>
          </div>
          <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {category}
          </h1>
          <p className="mt-3 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            All Novalyte Journal articles in the <span className="font-medium text-foreground">{category}</span> category. Each article is educational, references public-health and professional-society sources, and is clearly labeled as not medical advice.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>{filtered.length} article{filtered.length === 1 ? "" : "s"}</span>
            <span className="text-muted-foreground/40">•</span>
            <span>Educational content</span>
            <span className="text-muted-foreground/40">•</span>
            <span>Reviewed where clinically relevant</span>
          </div>
        </div>
      </section>

      <SectionShell className="!pt-10 sm:!pt-12">
        {/* Category nav */}
        <div className="novalyte-scroll flex flex-nowrap items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => navigate("journal")}
            className={cn(
              "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition",
              "border-border bg-card text-muted-foreground hover:border-teal-200 hover:text-teal-700",
            )}
          >
            All categories
          </button>
          {otherCategories.map((c) => (
            <button
              key={c}
              onClick={() => navigate("journal-category", undefined, { slug: c })}
              className="shrink-0 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground transition hover:border-teal-200 hover:text-teal-700"
            >
              {c}
            </button>
          ))}
        </div>

        {/* Article grid */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No articles in this category yet"
            description="Try another category or browse the full journal."
            action={
              <Button variant="outline" size="sm" onClick={() => navigate("journal")}>
                View all articles
              </Button>
            }
            className="mt-8"
          />
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        )}

        <DisclaimerBanner tone="teal" className="mt-10">
          The Novalyte Journal is educational content for the men's health economy. It is not a
          substitute for professional medical advice, diagnosis, or treatment. Always consult a
          licensed healthcare professional regarding any medical condition or treatment decision.
        </DisclaimerBanner>

        <div className="mt-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("journal")} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Back to Journal
          </Button>
        </div>
      </SectionShell>
    </div>
  );
}
