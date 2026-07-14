"use client";

import { useMemo } from "react";
import { SectionShell, SectionHeading } from "@/components/shared/section";
import { DisclaimerBanner } from "@/components/shared/disclaimer";
import { Breadcrumbs } from "@/components/shared/enterprise";
import { SmartImage } from "@/components/shared/smart-image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { navigate } from "@/lib/nav";
import { cn } from "@/lib/utils";
import type { ArticleContent } from "@/lib/article-content";
import { JOURNAL_CATEGORIES } from "@/lib/article-content";
import { toast } from "sonner";
import { useState } from "react";
import {
  BookOpen,
  Clock,
  Calendar,
  ArrowRight,
  User,
  Stethoscope,
  Mail,
  ShieldCheck,
  FileEdit,
  RefreshCw,
  Check,
  Library,
  Sparkles,
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

/* ────────────────────────────────────────────────────────────────
   Featured article card (hero of the landing page)
   ──────────────────────────────────────────────────────────────── */

function FeaturedArticleCard({ article }: { article: ArticleContent }) {
  return (
    <button
      onClick={() => navigate("journal-article", undefined, { slug: article.slug })}
      className="group grid w-full overflow-hidden rounded-3xl border border-border bg-card text-left shadow-premium-md transition card-premium-hover lg:grid-cols-2"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden lg:aspect-auto">
        <SmartImage
          src={article.heroImage}
          alt={article.heroImageAlt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="transition-transform duration-500 group-hover:scale-105"
          imgClassName="object-cover"
        />
        <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
          <Badge className="bg-teal-600 text-white hover:bg-teal-600">
            <Sparkles className="h-3 w-3" /> Featured
          </Badge>
          <Badge className="border-teal-200 bg-white/90 text-teal-700 hover:bg-white/90 backdrop-blur">
            {article.category}
          </Badge>
        </div>
      </div>
      <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" /> {formatDate(article.publishedAt)}
          </span>
          <span className="text-muted-foreground/40">•</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> {article.readingTime} min read
          </span>
        </div>
        <h2 className="mt-3 text-balance text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
          {article.title}
        </h2>
        <p className="mt-3 line-clamp-3 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          {article.excerpt}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
              {article.author.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
            </span>
            <div>
              <div className="text-xs font-medium text-foreground">{article.author.name}</div>
              <div className="text-[11px] text-muted-foreground">{article.author.role}</div>
            </div>
          </div>
          {article.medicalReviewer && (
            <span className="inline-flex items-center gap-1 text-xs text-teal-700">
              <Stethoscope className="h-3 w-3" /> Reviewed by {article.medicalReviewer.name}
            </span>
          )}
        </div>
        <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-teal-700 group-hover:gap-2 transition-all">
          Read article <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </button>
  );
}

/* ────────────────────────────────────────────────────────────────
   Compact article card (grid)
   ──────────────────────────────────────────────────────────────── */

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
        <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <User className="h-3 w-3" />
          <span className="font-medium text-foreground/80">{article.author.name}</span>
          <span className="text-muted-foreground/40">•</span>
          <Calendar className="h-3 w-3" />
          <span>{formatDate(article.publishedAt)}</span>
          <span className="text-muted-foreground/40">•</span>
          <Clock className="h-3 w-3" />
          <span>{article.readingTime} min</span>
        </div>
        <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-medium text-teal-700 group-hover:gap-2 transition-all">
          Read article <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </button>
  );
}

/* ────────────────────────────────────────────────────────────────
   Editorial policy card
   ──────────────────────────────────────────────────────────────── */

function EditorialPolicySection() {
  const items = [
    {
      icon: ShieldCheck,
      title: "Editorial policy",
      body:
        "Novalyte Journal articles are written to inform and educate, not to diagnose or prescribe. We separate medical education from clinical advice and do not promote specific products, protocols, or vendors.",
    },
    {
      icon: Stethoscope,
      title: "Medical review policy",
      body:
        "Articles that touch on diagnosis, treatment, or medication are reviewed by the Novalyte Medical Review Panel (educational). Articles on operations or industry topics may not require clinical review; the presence of a reviewer is shown on each article.",
    },
    {
      icon: FileEdit,
      title: "Content correction policy",
      body:
        "We update articles as evidence and guidelines change. Significant corrections are reflected in the article's 'Updated' date. If you spot an error or have a correction, contact the editorial team through the platform.",
    },
    {
      icon: RefreshCw,
      title: "Review cadence",
      body:
        "Clinically relevant articles are reviewed periodically to keep them aligned with current guidance from public-health authorities and professional societies. Outdated material is revised or removed.",
    },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <div key={it.title} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5 shadow-premium-xs">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-foreground">{it.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{it.body}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   Newsletter CTA
   ──────────────────────────────────────────────────────────────── */

function NewsletterCTA() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !consent) {
      toast.error("Please enter your email and confirm consent.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("failed");
      setDone(true);
      toast.success("You're subscribed to the Novalyte Journal.");
    } catch {
      toast.error("Subscription failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50/60 to-background p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white">
          <Mail className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">Get the Novalyte Journal in your inbox</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Educational articles on men's health treatments, clinic operations, and workforce trends. No spam, unsubscribe anytime.
          </p>
        </div>
      </div>
      {done ? (
        <div className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <Check className="h-4 w-4" /> Thanks — you're subscribed. Watch your inbox for the next issue.
        </div>
      ) : (
        <form onSubmit={submit} className="mt-5 space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="email"
              placeholder="you@clinic.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="sm:flex-1"
              aria-label="Email address"
            />
            <Button type="submit" disabled={submitting} className="bg-teal-600 text-white hover:bg-teal-700">
              {submitting ? "Subscribing…" : "Subscribe"} <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <label className="flex items-start gap-2 text-xs text-muted-foreground">
            <Checkbox checked={consent} onCheckedChange={(v) => setConsent(v === true)} />
            <span>
              I agree to receive educational content from Novalyte AI. I understand I can unsubscribe at any time and that my email will not be shared with third parties.
            </span>
          </label>
        </form>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   Main view
   ──────────────────────────────────────────────────────────────── */

export function JournalView({ articles }: { articles: ArticleContent[] }) {
  // Featured = first article (newest, by ordering from ARTICLES)
  const featured = articles[0];
  const editorsPicks = useMemo(() => articles.slice(1, 4), [articles]);
  const rest = useMemo(() => articles.slice(4), [articles]);

  return (
    <div className="min-h-screen">
      {/* Breadcrumbs */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Home", onClick: () => navigate("home") }, { label: "Journal" }]} />
        </div>
      </div>

      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-teal-50/50 to-background py-12 sm:py-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Novalyte Journal"
            title="Educational content for the men's health economy"
            description="The Journal publishes educational material on men's health treatments, clinic operations, workforce trends, and the broader healthcare ecosystem. We separate medical education from clinical advice: articles inform, they do not diagnose, prescribe, or replace the judgment of a licensed healthcare professional."
          />
          {featured && (
            <div className="mt-8">
              <FeaturedArticleCard article={featured} />
            </div>
          )}
        </div>
      </section>

      {/* Category navigation */}
      <SectionShell className="!pt-10 sm:!pt-12">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Library className="h-4 w-4 text-teal-600" />
          <span>Browse by category</span>
        </div>
        <div className="novalyte-scroll mt-3 flex flex-nowrap items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => navigate("journal")}
            className={cn(
              "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition",
              "border-teal-600 bg-teal-600 text-white shadow-sm",
            )}
          >
            All
          </button>
          {JOURNAL_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => navigate("journal-category", undefined, { slug: c })}
              className="shrink-0 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground transition hover:border-teal-200 hover:text-teal-700"
            >
              {c}
            </button>
          ))}
        </div>

        {/* Editor's picks */}
        {editorsPicks.length > 0 && (
          <div className="mt-10">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Editor's picks
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigate("journal")} className="text-teal-700">
                View all <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {editorsPicks.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          </div>
        )}

        {/* Latest grid */}
        {rest.length > 0 && (
          <div className="mt-12">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                More from the Journal
              </h2>
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          </div>
        )}

        {/* Newsletter */}
        <div className="mt-12">
          <NewsletterCTA />
        </div>

        {/* Editorial policy */}
        <div className="mt-16">
          <SectionHeading
            eyebrow="Editorial integrity"
            title="How the Novalyte Journal is written, reviewed, and corrected"
            description="Our editorial policy separates education from clinical advice, applies medical review where clinically relevant, and maintains a transparent content-correction process."
          />
          <div className="mt-8">
            <EditorialPolicySection />
          </div>
        </div>

        <DisclaimerBanner tone="teal" className="mt-10">
          The Novalyte Journal is educational content for the men's health economy. It is not a
          substitute for professional medical advice, diagnosis, or treatment. Always consult a
          licensed healthcare professional regarding any medical condition or treatment decision.
        </DisclaimerBanner>
      </SectionShell>
    </div>
  );
}
