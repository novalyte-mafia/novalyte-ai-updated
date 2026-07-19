"use client";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

/* ── Card primitives ─────────────────────────────────────────── */
export function PremiumCard({
  children,
  className,
  hover = false,
  as: As = "div",
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  as?: React.ElementType;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <As
      className={cn(
        "rounded-2xl border border-border bg-card shadow-premium-sm",
        hover && "card-premium-hover cursor-pointer",
        className,
      )}
      {...props}
    >
      {children}
    </As>
  );
}

/* ── Metadata row (label/value pairs) ────────────────────────── */
export function MetaRow({
  items,
  className,
  columns = 3,
}: {
  items: { label: string; value: React.ReactNode; icon?: React.ElementType }[];
  className?: string;
  columns?: 2 | 3 | 4;
}) {
  const cols = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-4" }[columns];
  return (
    <dl className={cn("grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border", cols, className)}>
      {items.map((it, i) => {
        const Icon = it.icon;
        return (
          <div key={i} className="bg-card p-3.5">
            <dt className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {Icon && <Icon className="h-3.5 w-3.5" />}
              {it.label}
            </dt>
            <dd className="mt-1 text-sm font-semibold text-foreground">{it.value}</dd>
          </div>
        );
      })}
    </dl>
  );
}

/* ── Stat card ───────────────────────────────────────────────── */
export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  icon?: React.ElementType;
  tone?: "default" | "teal" | "emerald" | "amber";
}) {
  const tones: Record<string, string> = {
    default: "text-foreground",
    teal: "text-teal-700",
    emerald: "text-emerald-700",
    amber: "text-amber-700",
  };
  const iconTones: Record<string, string> = {
    default: "bg-muted text-muted-foreground",
    teal: "bg-teal-50 text-teal-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-premium-xs">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        {Icon && <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg", iconTones[tone])}><Icon className="h-3.5 w-3.5" /></span>}
      </div>
      <p className={cn("mt-2 text-2xl font-semibold tracking-tight", tones[tone])}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

/* ── Skeletons ───────────────────────────────────────────────── */
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border bg-card", className)}>
      <Skeleton className="h-28 w-full rounded-none" />
      <div className="space-y-3 p-5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <div className="flex gap-1.5 pt-1">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-border p-4 last:border-0">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

/* ── Empty state ─────────────────────────────────────────────── */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center", className)}>
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-card shadow-premium-sm">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </span>
      <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ── Filter chip (removable) ─────────────────────────────────── */
export function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 py-1 pl-2.5 pr-1 text-xs font-medium text-teal-700">
      {label}
      <button
        onClick={onRemove}
        className="flex h-4 w-4 items-center justify-center rounded-full text-teal-600 transition hover:bg-teal-200/60"
        aria-label={`Remove ${label}`}
      >
        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
        </svg>
      </button>
    </span>
  );
}

/* ── View toggle (list/grid/map) ─────────────────────────────── */
export function ViewToggle({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string; icon: React.ElementType }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-lg border border-border bg-card p-0.5 shadow-premium-xs">
      {options.map((o) => {
        const Icon = o.icon;
        const active = value === o.value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition",
              active ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
            title={o.label}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ── Save button (bookmark) ──────────────────────────────────── */
export function SaveButton({
  saved,
  onToggle,
  size = "default",
  label,
  className,
}: {
  saved: boolean;
  onToggle?: () => void;
  size?: "xs" | "sm" | "default";
  label?: string;
  className?: string;
}) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); e.preventDefault(); onToggle?.(); }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border transition",
        size === "xs" ? "px-1.5 py-0.5 text-[10px]" : size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm",
        saved
          ? "border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100"
          : "border-border bg-card text-muted-foreground hover:border-teal-200 hover:text-teal-700",
        className,
      )}
      aria-pressed={saved}
    >
      <svg viewBox="0 0 24 24" className={cn(size === "default" ? "h-4 w-4" : "h-3.5 w-3.5")} fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label && <span>{label}</span>}
    </button>
  );
}

/* ── Breadcrumbs ─────────────────────────────────────────────── */
export function Breadcrumbs({
  items,
}: {
  items: { label: string; onClick?: () => void }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
      {items.map((it, i) => {
        const last = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {it.onClick && !last ? (
              <button onClick={it.onClick} className="text-muted-foreground transition hover:text-foreground">
                {it.label}
              </button>
            ) : (
              <span className={cn(last ? "font-medium text-foreground" : "text-muted-foreground")}>{it.label}</span>
            )}
            {!last && <span className="text-muted-foreground/50">/</span>}
          </span>
        );
      })}
    </nav>
  );
}

/* ── Section divider with label ──────────────────────────────── */
export function SectionDivider({ label, className }: { label?: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="h-px flex-1 bg-border" />
      {label && <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>}
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
