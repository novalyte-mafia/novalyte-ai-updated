"use client";

import { useEffect, useMemo, useState } from "react";
import { SectionShell, SectionHeading } from "@/components/shared/section";
import {
  PremiumCard,
  Breadcrumbs,
  SectionDivider,
} from "@/components/shared/enterprise";
import { DisclaimerBanner, MedicalDisclaimer } from "@/components/shared/disclaimer";
import { SmartImage } from "@/components/shared/smart-image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { navigate } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/constants";
import { toast } from "sonner";
import {
  articleJsonLd,
  articleUrl,
  breadcrumbJsonLd,
  categoryUrl,
  faqJsonLd,
} from "@/lib/seo";
import { getRelatedArticles } from "@/lib/article-content";
import type { ArticleContent, ArticleBlock } from "@/lib/article-content";
import { captureSafeEvent } from "@/lib/analytics-client";
import { canonicalPath } from "@/lib/site-config";
import {
  ARTICLE_PEER_LINKS,
  assessmentHref,
  resolveAssessmentSlug,
  softAssessmentCopy,
} from "@/lib/journal/engagement";
import {
  BookOpen,
  Clock,
  Calendar,
  Stethoscope,
  ArrowRight,
  ArrowLeft,
  FileText,
  Link2,
  Linkedin,
  Facebook,
  Twitter,
  Check,
  Info,
  AlertTriangle,
  Lightbulb,
  Mail,
  ChevronRight,
  Building2,
  ListOrdered,
  ClipboardList,
} from "lucide-react";

/* ────────────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────────────── */

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

/** Render markdown-style [label](url) links; keep other text plain. */
function RichText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const parts: React.ReactNode[] = [];
  const pattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const label = match[1];
    const href = match[2];
    const isInternal =
      href.startsWith("/") || href.startsWith("https://novalyte.io/");
    parts.push(
      <a
        key={`link-${key++}`}
        href={href}
        className="font-medium text-teal-700 underline decoration-teal-300 underline-offset-2 hover:text-teal-800"
        {...(isInternal
          ? {}
          : { target: "_blank", rel: "noopener noreferrer" })}
        data-analytics-event="journal_inline_link_clicked"
        data-analytics-label={label.slice(0, 80)}
      >
        {label}
      </a>,
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return <span className={className}>{parts}</span>;
}

/* ────────────────────────────────────────────────────────────────
   JSON-LD scripts
   ──────────────────────────────────────────────────────────────── */

function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/* ────────────────────────────────────────────────────────────────
   Block renderers
   ──────────────────────────────────────────────────────────────── */

function CalloutBlock({ tone, text }: { tone: "info" | "warning" | "tip"; text: string }) {
  const tones: Record<string, { wrap: string; icon: string; Icon: React.ElementType }> = {
    info: { wrap: "border-teal-200 bg-teal-50 text-teal-900", icon: "text-teal-600", Icon: Info },
    warning: { wrap: "border-amber-200 bg-amber-50 text-amber-900", icon: "text-amber-600", Icon: AlertTriangle },
    tip: { wrap: "border-emerald-200 bg-emerald-50 text-emerald-900", icon: "text-emerald-600", Icon: Lightbulb },
  };
  const t = tones[tone];
  const Icon = t.Icon;
  return (
    <div className={cn("my-6 flex items-start gap-3 rounded-xl border p-4 text-sm leading-relaxed", t.wrap)}>
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", t.icon)} />
      <div>
        <RichText text={text} />
      </div>
    </div>
  );
}

function TableBlock({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="my-6 overflow-hidden rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            {headers.map((h, i) => (
              <TableHead key={i} className="text-foreground">{h}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i}>
              {row.map((cell, j) => (
                <TableCell key={j} className="align-top text-foreground/90">{cell}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ListBlock({ items, ordered }: { items: string[]; ordered?: boolean }) {
  if (ordered) {
    return (
      <ol className="my-4 list-none space-y-2 pl-0">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 text-sm leading-relaxed text-foreground/90">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-semibold text-teal-700">
              {i + 1}
            </span>
            <span>
              <RichText text={item} />
            </span>
          </li>
        ))}
      </ol>
    );
  }
  return (
    <ul className="my-4 space-y-2 pl-5">
      {items.map((item, i) => (
        <li key={i} className="list-disc text-sm leading-relaxed text-foreground/90 marker:text-teal-500">
          <RichText text={item} />
        </li>
      ))}
    </ul>
  );
}

function VideoBlock({
  url,
  title,
  caption,
}: {
  url: string;
  title: string;
  caption?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const embedUrl = useMemo(() => {
    try {
      const parsed = new URL(url);
      if (parsed.hostname === "youtu.be") {
        const id = parsed.pathname.replace(/^\/+/, "").split("/")[0];
        return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
      }
      if (
        parsed.hostname === "youtube.com" ||
        parsed.hostname === "www.youtube.com"
      ) {
        const id =
          parsed.searchParams.get("v") ||
          parsed.pathname.match(/^\/embed\/([^/]+)/)?.[1];
        return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
      }
      if (parsed.hostname === "vimeo.com" || parsed.hostname === "www.vimeo.com") {
        const id = parsed.pathname.match(/\/(\d+)/)?.[1];
        return id ? `https://player.vimeo.com/video/${id}` : null;
      }
      return null;
    } catch {
      return null;
    }
  }, [url]);

  if (!embedUrl) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        data-analytics-event="video_played"
        data-analytics-label={title}
        className="my-6 block rounded-xl border border-border bg-muted/30 p-4 font-medium text-teal-700 hover:underline"
      >
        Watch video: {title}
      </a>
    );
  }

  return (
    <figure className="my-8 overflow-hidden rounded-2xl border border-border bg-card">
      <div className="relative aspect-video bg-slate-950">
        {loaded ? (
          <iframe
            src={`${embedUrl}?autoplay=1`}
            title={title}
            className="absolute inset-0 h-full w-full"
            loading="lazy"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            className="absolute inset-0 flex h-full w-full items-center justify-center bg-slate-950 px-6 text-center text-base font-semibold text-white hover:bg-slate-900"
            onClick={() => {
              captureSafeEvent("video_played", {
                article_path: window.location.pathname,
                video_host: new URL(url).hostname,
              });
              setLoaded(true);
            }}
          >
            Play video: {title}
          </button>
        )}
      </div>
      {caption && (
        <figcaption className="border-t border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

function BlockRenderer({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case "heading": {
      if (block.level === 2) {
        return (
          <h2
            id={block.id}
            className="mt-10 scroll-mt-28 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            {block.text}
          </h2>
        );
      }
      return (
        <h3
          id={block.id}
          className="mt-6 scroll-mt-28 text-lg font-semibold tracking-tight text-foreground sm:text-xl"
        >
          {block.text}
        </h3>
      );
    }
    case "paragraph":
      return (
        <p className="my-4 text-[15px] leading-7 text-foreground/90">
          <RichText text={block.text} />
        </p>
      );
    case "list":
      return <ListBlock items={block.items} ordered={block.ordered} />;
    case "image":
      return (
        <figure className="my-8 overflow-hidden rounded-2xl border border-border bg-card shadow-premium-sm">
          <div className={cn("relative w-full", block.aspect === "standard" ? "aspect-[4/3]" : "aspect-[16/9]")}>
            <SmartImage
              src={block.src}
              alt={block.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 768px"
              imgClassName="object-cover"
            />
          </div>
          {block.caption && (
            <figcaption className="border-t border-border bg-muted/30 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    case "video":
      return (
        <VideoBlock
          url={block.url}
          title={block.title}
          caption={block.caption}
        />
      );
    case "callout":
      return <CalloutBlock tone={block.tone} text={block.text} />;
    case "table":
      return <TableBlock headers={block.headers} rows={block.rows} />;
    default:
      return null;
  }
}

/* ────────────────────────────────────────────────────────────────
   Table of contents (with scroll-spy active highlight)
   ──────────────────────────────────────────────────────────────── */

function TableOfContents({ items }: { items: { id: string; title: string }[] }) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (items.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost heading currently intersecting near the top
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-120px 0px -65% 0px", threshold: [0, 1] },
    );
    items.forEach((it) => {
      const el = document.getElementById(it.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  const handleNav = (id: string) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="lg:sticky lg:top-24">
      {/* Desktop */}
      <nav aria-label="Table of contents" className="hidden lg:block">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-premium-xs">
          <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <ListOrdered className="h-3.5 w-3.5" /> Table of contents
          </div>
          <ul className="space-y-1">
            {items.map((it) => {
              const active = activeId === it.id;
              return (
                <li key={it.id}>
                  <button
                    onClick={() => handleNav(it.id)}
                    className={cn(
                      "block w-full border-l-2 py-1.5 pl-3 text-left text-sm transition",
                      active
                        ? "border-teal-600 font-medium text-teal-700"
                        : "border-border text-muted-foreground hover:border-teal-300 hover:text-foreground",
                    )}
                  >
                    {it.title}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Mobile collapsible */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium shadow-premium-xs"
          aria-expanded={mobileOpen}
        >
          <span className="flex items-center gap-1.5">
            <ListOrdered className="h-4 w-4 text-teal-600" /> Table of contents
          </span>
          <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform", mobileOpen && "rotate-90")} />
        </button>
        {mobileOpen && (
          <ul className="mt-2 space-y-1 rounded-xl border border-border bg-card p-3 shadow-premium-xs">
            {items.map((it) => {
              const active = activeId === it.id;
              return (
                <li key={it.id}>
                  <button
                    onClick={() => handleNav(it.id)}
                    className={cn(
                      "block w-full rounded-md py-2 pl-3 text-left text-sm transition",
                      active ? "bg-teal-50 font-medium text-teal-700" : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {it.title}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   Author / reviewer cards
   ──────────────────────────────────────────────────────────────── */

function AuthorCard({
  name,
  role,
  bio,
}: {
  name: string;
  role: string;
  bio: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-premium-xs">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white">
        {initials(name)}
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{name}</span>
          <Badge variant="outline" className="border-border text-muted-foreground">{role}</Badge>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{bio}</p>
      </div>
    </div>
  );
}

function ReviewerCard({ name, role }: { name: string; role: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-teal-200 bg-teal-50/50 p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white">
        <Stethoscope className="h-5 w-5" />
      </span>
      <div>
        <div className="text-xs uppercase tracking-wider text-teal-700">Medical review</div>
        <div className="text-sm font-semibold text-foreground">{name}</div>
        <div className="text-xs text-muted-foreground">{role}</div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   Share controls
   ──────────────────────────────────────────────────────────────── */

function ShareControls({ title, slug }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/journal/${slug}` : `/journal/${slug}`;
  const shareText = `${title} — Novalyte Journal`;

  const copyLink = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: shareText, url: shareUrl });
        return;
      }
    } catch {
      // user dismissed native share — fall through to clipboard copy
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  };

  const openShare = (network: "twitter" | "linkedin" | "facebook") => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    };
    window.open(urls[network], "_blank", "noopener,noreferrer,width=600,height=600");
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Share</span>
      <Button variant="outline" size="sm" onClick={copyLink} className="gap-1.5">
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Link2 className="h-3.5 w-3.5" />}
        {copied ? "Copied" : "Copy link"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => openShare("twitter")}
        aria-label="Share on Twitter / X"
        className="gap-1.5"
      >
        <Twitter className="h-3.5 w-3.5" /> X
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => openShare("linkedin")}
        aria-label="Share on LinkedIn"
        className="gap-1.5"
      >
        <Linkedin className="h-3.5 w-3.5" /> LinkedIn
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => openShare("facebook")}
        aria-label="Share on Facebook"
        className="gap-1.5"
      >
        <Facebook className="h-3.5 w-3.5" /> Facebook
      </Button>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   Newsletter CTA (compact)
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
   Soft assessment + interlink nudges (skim-friendly)
   ──────────────────────────────────────────────────────────────── */

function SoftAssessmentNudge({
  assessmentSlug,
  compact = false,
}: {
  assessmentSlug: string;
  compact?: boolean;
}) {
  const copy = softAssessmentCopy(assessmentSlug);
  const href = assessmentHref(assessmentSlug);

  if (compact) {
    return (
      <div className="my-8 rounded-xl border border-teal-200 bg-teal-50/80 px-4 py-3 text-sm text-teal-950">
        <p className="leading-relaxed">
          <span className="font-semibold">Skimming?</span>{" "}
          {copy.body}{" "}
          <a
            href={href}
            className="font-semibold text-teal-800 underline decoration-teal-400 underline-offset-2"
            data-analytics-event="journal_assessment_nudge_clicked"
            data-analytics-label={`${assessmentSlug}:inline`}
          >
            {copy.cta} →
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="my-8 flex flex-col gap-3 rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-white p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white">
          <ClipboardList className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-base font-semibold text-foreground">{copy.title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{copy.body}</p>
        </div>
      </div>
      <Button
        className="shrink-0 bg-teal-600 text-white hover:bg-teal-700"
        data-analytics-event="journal_assessment_nudge_clicked"
        data-analytics-label={`${assessmentSlug}:card`}
        onClick={() =>
          navigate("assessment", undefined, { slug: assessmentSlug })
        }
      >
        {copy.cta} <ArrowRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  );
}

function PeerLinksNudge({
  peers,
}: {
  peers: { slug: string; label: string }[];
}) {
  if (peers.length === 0) return null;
  return (
    <div className="my-8 rounded-xl border border-border bg-muted/40 px-4 py-4 text-sm">
      <p className="font-semibold text-foreground">Related reading</p>
      <ul className="mt-2 space-y-1.5">
        {peers.map((peer) => (
          <li key={peer.slug}>
            <a
              href={`/journal/${peer.slug}`}
              className="text-teal-700 underline decoration-teal-300 underline-offset-2 hover:text-teal-800"
              data-analytics-event="journal_peer_link_clicked"
              data-analytics-label={peer.slug}
            >
              {peer.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReadNextCard({ article }: { article: ArticleContent }) {
  return (
    <a
      href={`/journal/${article.slug}`}
      data-analytics-event="journal_read_next_clicked"
      data-analytics-label={article.slug}
      className="mt-10 flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-premium-sm transition card-premium-hover sm:flex-row sm:items-center"
    >
      <div className="relative hidden h-24 w-36 shrink-0 overflow-hidden rounded-xl sm:block">
        <SmartImage
          src={article.heroImage}
          alt={article.heroImageAlt}
          fill
          sizes="144px"
          imgClassName="object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
          Read next
        </p>
        <h3 className="mt-1 text-pretty text-lg font-semibold leading-snug text-foreground">
          {article.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {article.excerpt}
        </p>
      </div>
      <span className="inline-flex items-center gap-1 text-sm font-medium text-teal-700">
        Continue <ArrowRight className="h-4 w-4" />
      </span>
    </a>
  );
}

/* ────────────────────────────────────────────────────────────────
   Related article card
   ──────────────────────────────────────────────────────────────── */

function RelatedArticleCard({ article }: { article: ArticleContent }) {
  return (
    <a
      href={`/journal/${article.slug}`}
      data-analytics-event="related_article_clicked"
      data-analytics-label={article.title}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card text-left shadow-premium-sm transition card-premium-hover"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        <SmartImage
          src={article.heroImage}
          alt={article.heroImageAlt}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="transition-transform duration-300 group-hover:scale-105"
          imgClassName="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <Badge className="border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-50">{article.category}</Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" /> {article.readingTime} min
          </span>
        </div>
        <h4 className="mt-2 text-pretty text-base font-semibold leading-snug text-foreground">{article.title}</h4>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{article.excerpt}</p>
        <span className="mt-auto pt-3 text-xs font-medium text-teal-700 group-hover:underline">Read article →</span>
      </div>
    </a>
  );
}

/* ────────────────────────────────────────────────────────────────
   Main view
   ──────────────────────────────────────────────────────────────── */

export function ArticleView({
  article,
  allArticles,
}: {
  article: ArticleContent;
  allArticles: ArticleContent[];
}) {
  const related = useMemo(
    () => getRelatedArticles(article, allArticles, 3),
    [article, allArticles],
  );
  const readNext = related[0] ?? null;
  const assessmentSlug = useMemo(
    () =>
      resolveAssessmentSlug({
        relatedTreatment: article.relatedTreatment,
        category: article.category,
        tags: article.tags,
        slug: article.slug,
      }),
    [article.category, article.relatedTreatment, article.slug, article.tags],
  );
  const peerLinks = ARTICLE_PEER_LINKS[article.slug] ?? [];
  const earlyNudgeAt = Math.min(3, Math.max(1, article.body.length - 1));
  const midNudgeAt = Math.min(
    Math.max(earlyNudgeAt + 2, Math.floor(article.body.length / 2)),
    Math.max(article.body.length - 1, 0),
  );

  const faqLd = useMemo(() => faqJsonLd(article.faqs), [article.faqs]);
  const articleLd = useMemo(() => articleJsonLd(article), [article]);
  const breadcrumbLd = useMemo(
    () =>
      breadcrumbJsonLd([
        { label: "Home", url: canonicalPath("/") },
        { label: "Journal", url: canonicalPath("/journal") },
        { label: article.category, url: categoryUrl(article.category) },
        { label: article.title, url: articleUrl(article.slug) },
      ]),
    [article.category, article.slug, article.title],
  );

  useEffect(() => {
    captureSafeEvent("article_viewed", {
      article_slug: article.slug,
      category: article.category,
      reading_time_minutes: article.readingTime,
    });

    const reached = new Set<number>();
    const onScroll = () => {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const percent = Math.round((window.scrollY / scrollable) * 100);
      for (const threshold of [50, 90]) {
        if (percent >= threshold && !reached.has(threshold)) {
          reached.add(threshold);
          captureSafeEvent(
            threshold === 50 ? "article_50_percent_read" : "article_90_percent_read",
            {
              article_slug: article.slug,
              category: article.category,
            },
          );
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [article.category, article.readingTime, article.slug]);

  return (
    <div className="min-h-screen">
      <JsonLd data={articleLd} />
      <JsonLd data={breadcrumbLd} />
      {faqLd && <JsonLd data={faqLd} />}

      {/* Breadcrumbs */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Home", onClick: () => navigate("home") },
              { label: "Journal", onClick: () => navigate("journal") },
              { label: article.category, onClick: () => navigate("journal-category", undefined, { slug: article.category }) },
              { label: article.title },
            ]}
          />
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-border bg-gradient-to-b from-teal-50/40 to-background">
        <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-50">
              <BookOpen className="h-3 w-3" /> {article.category}
            </Badge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" /> {article.readingTime} min read
            </span>
          </div>
          <h1 className="mt-4 text-balance text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {article.title}
          </h1>
          <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            {article.excerpt}
          </p>

          {/* Author / reviewer / dates row */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
                {initials(article.author.name)}
              </span>
              <div className="text-sm">
                <div className="font-medium text-foreground">{article.author.name}</div>
                <div className="text-xs text-muted-foreground">{article.author.role}</div>
              </div>
            </div>
            {article.medicalReviewer && (
              <Badge className="border-teal-200 bg-white/70 text-teal-700 hover:bg-white/70">
                <Stethoscope className="h-3 w-3" /> Reviewed by {article.medicalReviewer.name}
              </Badge>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Published {formatDate(article.publishedAt)}
            </span>
            {article.updatedAt !== article.publishedAt && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Updated {formatDate(article.updatedAt)}
              </span>
            )}
            {article.medicalReviewer && (
              <span className="inline-flex items-center gap-1">
                <Stethoscope className="h-3 w-3 text-teal-600" /> Last medically reviewed {formatDate(article.updatedAt)}
              </span>
            )}
          </div>

          {/* Share */}
          <div className="mt-6">
            <ShareControls title={article.title} slug={article.slug} />
          </div>
        </div>
      </header>

      {/* Hero image */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <figure className="overflow-hidden rounded-2xl border border-border bg-card shadow-premium-sm">
            <div className="relative aspect-[1200/630] w-full">
              <SmartImage
                src={article.heroImage}
                alt={article.heroImageAlt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 960px"
                imgClassName="object-cover"
              />
            </div>
            <figcaption className="border-t border-border bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground">
              <span className="font-medium text-foreground/80">Editorial image.</span>{" "}
              {article.heroImageCaption ?? `${article.heroImageAlt} Development imagery — replace with licensed photography in production.`}
            </figcaption>
          </figure>
        </div>
      </div>

      {/* Body + TOC */}
      <SectionShell className="!py-10 sm:!py-14">
        <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[260px_minmax(0,1fr)]">
          {/* TOC sidebar */}
          <aside className="order-1 lg:order-none">
            <TableOfContents items={article.tableOfContents} />
          </aside>

          {/* Article body */}
          <article className="order-2 min-w-0 lg:order-none">
            <div className="mx-auto max-w-3xl">
              {article.body.map((block, i) => (
                <div key={i}>
                  <BlockRenderer block={block} />
                  {i === earlyNudgeAt && (
                    <SoftAssessmentNudge assessmentSlug={assessmentSlug} compact />
                  )}
                  {i === midNudgeAt && midNudgeAt !== earlyNudgeAt && (
                    <>
                      <PeerLinksNudge peers={peerLinks.slice(0, 3)} />
                      <SoftAssessmentNudge assessmentSlug={assessmentSlug} />
                    </>
                  )}
                </div>
              ))}

              {peerLinks.length > 0 && midNudgeAt === earlyNudgeAt && (
                <PeerLinksNudge peers={peerLinks.slice(0, 3)} />
              )}

              {readNext && <ReadNextCard article={readNext} />}

              {/* Educational disclaimer immediately after body */}
              <DisclaimerBanner tone="teal" className="mt-8">
                <strong className="font-semibold">Education, not clinical advice.</strong> This
                article is intended to inform and educate. It does not constitute a medical diagnosis,
                treatment plan, or professional clinical opinion. Decisions about diagnosis,
                prescribing, and treatment must be made by a licensed healthcare professional in the
                context of an individual clinical relationship.
              </DisclaimerBanner>

              {/* FAQ */}
              {article.faqs.length > 0 && (
                <section className="mt-12" aria-label="Frequently asked questions">
                  <SectionDivider label="FAQ" />
                  <h2 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">Frequently asked questions</h2>
                  <Accordion type="single" collapsible className="mt-4">
                    {article.faqs.map((faq, i) => (
                      <AccordionItem key={i} value={`item-${i}`}>
                        <AccordionTrigger className="text-left text-base font-medium">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </section>
              )}

              {/* References */}
              {article.references.length > 0 && (
                <section className="mt-12" aria-label="Sources and references">
                  <SectionDivider label="References" />
                  <h2 className="mt-6 flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground">
                    <FileText className="h-5 w-5 text-teal-600" /> Sources and references
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Listed for general reference. Always consult the original sources for current
                    clinical guidance; guidelines and safety communications are updated periodically.
                  </p>
                  <ol className="mt-4 space-y-3">
                    {article.references.map((r, i) => (
                      <li key={i} className="flex gap-3 rounded-xl border border-border bg-card p-3 text-sm">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-semibold text-teal-700">
                          {i + 1}
                        </span>
                        <div>
                          {r.url ? (
                            <a
                              href={r.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              data-analytics-event="external_medical_source_clicked"
                              data-analytics-label={r.label}
                              className="font-medium text-teal-700 underline-offset-4 hover:underline"
                            >
                              {r.label}
                            </a>
                          ) : (
                            <div className="font-medium text-foreground">{r.label}</div>
                          )}
                          <div className="text-xs text-muted-foreground">{r.source}</div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {/* Medical disclaimer */}
              <div className="mt-10">
                <MedicalDisclaimer />
              </div>

              {/* Author / reviewer block */}
              <section className="mt-12" aria-label="About the author and reviewer">
                <SectionDivider label="Author & review" />
                <div className="mt-6 space-y-4">
                  <AuthorCard name={article.author.name} role={article.author.role} bio={article.author.bio} />
                  {article.medicalReviewer && (
                    <ReviewerCard name={article.medicalReviewer.name} role={article.medicalReviewer.role} />
                  )}
                </div>
              </section>

              {/* Newsletter CTA */}
              <div className="mt-12">
                <NewsletterCTA />
              </div>

              {/* Platform CTA */}
              <div className="mt-8 space-y-4">
                <SoftAssessmentNudge assessmentSlug={assessmentSlug} />
                <div className="flex flex-col items-start gap-4 rounded-2xl border border-border bg-muted/30 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
                      <Building2 className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">
                        {article.relatedTreatment
                          ? `Explore ${article.relatedTreatment} clinics`
                          : "Find a verified men's health clinic"}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Browse the Novalyte directory of verified men's health clinics by location, specialty, and telehealth availability.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      className="bg-teal-600 text-white hover:bg-teal-700"
                      data-analytics-event="journal_directory_cta_clicked"
                      onClick={() => navigate("directory")}
                    >
                      Open directory <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      data-analytics-event="journal_assessment_cta_clicked"
                      onClick={() =>
                        navigate("assessment", undefined, {
                          slug: assessmentSlug,
                        })
                      }
                    >
                      Start assessment
                    </Button>
                  </div>
                </div>
              </div>

              {/* Back to journal */}
              <div className="mt-8">
                <Button variant="ghost" size="sm" onClick={() => navigate("journal")} className="gap-1.5">
                  <ArrowLeft className="h-4 w-4" /> Back to Journal
                </Button>
              </div>
            </div>
          </article>
        </div>
      </SectionShell>

      {/* Related articles */}
      {related.length > 0 && (
        <SectionShell tone="muted" className="!py-12 sm:!py-16">
          <SectionHeading
            eyebrow="Continue reading"
            title="Related articles"
            description="More from the Novalyte Journal on adjacent topics in men's health."
          />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((a) => (
              <RelatedArticleCard key={a.slug} article={a} />
            ))}
          </div>
        </SectionShell>
      )}
    </div>
  );
}
