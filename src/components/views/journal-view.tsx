"use client";

import { useMemo, useState } from "react";
import { SectionShell, SectionHeading } from "@/components/shared/section";
import { DisclaimerBanner, MedicalDisclaimer } from "@/components/shared/disclaimer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { splitCsv } from "@/lib/constants";
import { navigate } from "@/lib/nav";
import type { ArticleT } from "@/lib/types";
import {
  BookOpen,
  Clock,
  Calendar,
  Stethoscope,
  User,
  ArrowRight,
  FileText,
  ExternalLink,
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

export function JournalView({ articles }: { articles: ArticleT[] }) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selected, setSelected] = useState<ArticleT | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => set.add(a.category));
    return ["All", ...Array.from(set).sort()];
  }, [articles]);

  const filtered = useMemo(() => {
    if (activeCategory === "All") return articles;
    return articles.filter((a) => a.category === activeCategory);
  }, [articles, activeCategory]);

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-teal-50/50 to-background py-14 sm:py-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Novalyte Journal"
            title="Novalyte Journal — Educational content for the men's health economy"
            description="The Journal publishes educational material on men's health treatments, clinic operations, workforce trends, and the broader healthcare ecosystem. We separate medical education from clinical advice: articles inform, they do not diagnose, prescribe, or replace the judgment of a licensed healthcare professional."
          />
        </div>
      </section>

      <SectionShell className="!pt-10">
        {/* Category filter */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => {
            const active = cat === activeCategory;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition",
                  active
                    ? "border-teal-600 bg-teal-600 text-white shadow-sm"
                    : "border-border bg-card text-muted-foreground hover:border-teal-200 hover:text-teal-700",
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <EmptyState onReset={() => setActiveCategory("All")} />
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((a) => (
              <ArticleCard key={a.id} article={a} onRead={() => setSelected(a)} />
            ))}
          </div>
        )}

        <DisclaimerBanner className="mt-10" tone="teal">
          The Novalyte Journal is educational content for the men's health economy. It is not a
          substitute for professional medical advice, diagnosis, or treatment. Always consult a
          licensed healthcare professional regarding any medical condition or treatment decision.
        </DisclaimerBanner>
      </SectionShell>

      <ArticleReaderDialog article={selected} onClose={() => setSelected(null)} />
    </>
  );
}

function ArticleCard({ article, onRead }: { article: ArticleT; onRead: () => void }) {
  return (
    <article className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between gap-2">
        <Badge className="border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-50">
          <BookOpen className="h-3 w-3" /> {article.category}
        </Badge>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" /> {article.readingTime} min read
        </span>
      </div>

      <h3 className="mt-3 text-balance text-lg font-semibold leading-tight text-foreground">
        {article.title}
      </h3>
      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
        {article.excerpt}
      </p>

      <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <User className="h-3 w-3" />
          <span className="font-medium text-foreground/80">{article.author}</span>
        </div>
        {article.medicalReviewer && (
          <div className="flex items-center gap-1.5">
            <Stethoscope className="h-3 w-3 text-teal-600" />
            <span>
              Medical review by{" "}
              <span className="font-medium text-foreground/80">{article.medicalReviewer}</span>
            </span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(article.publishedAt)}</span>
        </div>
      </div>

      <div className="mt-5 border-t pt-4">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={onRead}
        >
          Read article <ArrowRight className="ml-1 h-3.5 w-3.5" />
        </Button>
      </div>
    </article>
  );
}

function ArticleReaderDialog({ article, onClose }: { article: ArticleT | null; onClose: () => void }) {
  const refs = article ? splitCsv(article.references) : [];
  const paragraphs = article ? article.content.split("\n\n").map((p) => p.trim()).filter(Boolean) : [];

  return (
    <Dialog open={!!article} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        {article && (
          <>
            <DialogHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-50">
                  <BookOpen className="h-3 w-3" /> {article.category}
                </Badge>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" /> {article.readingTime} min read
                </span>
              </div>
              <DialogTitle className="mt-2 text-balance text-2xl leading-tight">
                {article.title}
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed">
                {article.excerpt}
              </DialogDescription>
            </DialogHeader>

            {/* Author / review / dates */}
            <div className="grid gap-3 rounded-xl border border-border bg-muted/30 p-4 text-sm sm:grid-cols-2">
              <div className="flex items-start gap-2">
                <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Author</div>
                  <div className="font-medium text-foreground">{article.author}</div>
                </div>
              </div>
              {article.medicalReviewer && (
                <div className="flex items-start gap-2">
                  <Stethoscope className="mt-0.5 h-4 w-4 text-teal-600" />
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">
                      Medical review
                    </div>
                    <div className="font-medium text-foreground">{article.medicalReviewer}</div>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2">
                <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Published</div>
                  <div className="font-medium text-foreground">{formatDate(article.publishedAt)}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Updated</div>
                  <div className="font-medium text-foreground">{formatDate(article.updatedAt)}</div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="space-y-4 text-sm leading-relaxed text-foreground/90">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {/* Related treatment */}
            {article.relatedTreatment && (
              <div className="flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50/40 p-4 text-sm">
                <Stethoscope className="h-4 w-4 text-teal-600" />
                <span className="text-muted-foreground">Related treatment:</span>
                <button
                  onClick={() => navigate("patients", "treatments")}
                  className="font-semibold text-teal-700 underline-offset-2 hover:underline"
                >
                  {article.relatedTreatment}
                </button>
              </div>
            )}

            {/* References */}
            {refs.length > 0 && (
              <div className="rounded-xl border border-border p-4">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" /> References
                </div>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {refs.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-0.5 text-teal-600">[{i + 1}]</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Education vs clinical advice note */}
            <DisclaimerBanner tone="teal">
              <strong className="font-semibold">Education, not clinical advice.</strong> This
              article is intended to inform and educate. It does not constitute a medical diagnosis,
              treatment plan, or professional clinical opinion. Decisions about diagnosis,
              prescribing, and treatment must be made by a licensed healthcare professional in the
              context of an individual clinical relationship.
            </DisclaimerBanner>

            <MedicalDisclaimer />

            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("directory")}
              >
                Find a verified clinic <ExternalLink className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 py-16 text-center">
      <BookOpen className="h-8 w-8 text-muted-foreground/60" />
      <h3 className="mt-3 text-base font-semibold">No articles in this category yet</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Try another category or browse the full journal.
      </p>
      <Button variant="outline" size="sm" className="mt-4" onClick={onReset}>
        View all articles
      </Button>
    </div>
  );
}
