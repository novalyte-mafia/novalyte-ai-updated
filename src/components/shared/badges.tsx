import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ShieldCheck, Clock, AlertCircle, FlaskConical, Building2 } from "lucide-react";
import { resolveListingStatus, type ListingStatus } from "@/lib/directory/listing-status";

export function ListingStatusBadge({
  clinic,
  className,
}: {
  clinic: {
    listingStatus?: string | null;
    claimStatus?: string | null;
    verified?: boolean | null;
    verificationStatus?: string | null;
  };
  className?: string;
}) {
  const status: ListingStatus = resolveListingStatus(clinic);

  if (status === "demo") {
    return (
      <Badge
        variant="outline"
        className={cn("gap-1 border-slate-300 bg-slate-100 text-[10px] font-semibold text-slate-700", className)}
        aria-label="Demo Profile — fictional demonstration listing, not a real clinic"
      >
        <FlaskConical className="h-2.5 w-2.5" aria-hidden />
        <span>Demo Profile</span>
      </Badge>
    );
  }

  if (status === "verified") {
    return (
      <Badge
        className={cn("gap-1 border-teal-200 bg-teal-50 text-[10px] font-semibold text-teal-700 hover:bg-teal-50", className)}
        aria-label="Verified by Novalyte AI"
      >
        <ShieldCheck className="h-2.5 w-2.5" aria-hidden />
        <span>Verified by Novalyte AI</span>
      </Badge>
    );
  }

  if (status === "claimed") {
    return (
      <Badge
        variant="outline"
        className={cn("gap-1 border-sky-300 bg-sky-50/60 text-[10px] font-semibold text-sky-900", className)}
        aria-label="Claimed listing — ownership confirmed, details may still be under review"
      >
        <CheckCircle2 className="h-2.5 w-2.5" aria-hidden />
        <span>Claimed</span>
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn("gap-1 border-amber-300/80 bg-amber-50/40 text-[10px] font-semibold text-amber-900", className)}
      aria-label="Unclaimed Listing — compiled from public sources, not yet verified by the clinic"
    >
      <Building2 className="h-2.5 w-2.5" aria-hidden />
      <span>Unclaimed Listing</span>
    </Badge>
  );
}

export function VerificationBadge({ verified, status, className }: { verified: boolean; status?: string; className?: string }) {
  if (status === "demo") {
    return (
      <Badge
        variant="outline"
        className={cn("gap-1 border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-100", className)}
        aria-label="Demo Profile — fictional demonstration listing"
      >
        <FlaskConical className="h-3 w-3" aria-hidden /> Demo Profile
      </Badge>
    );
  }
  if (verified || status === "verified" || status === "approved") {
    return (
      <Badge className={cn("gap-1 border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-50", className)} aria-label="Verified by Novalyte AI">
        <ShieldCheck className="h-3 w-3" aria-hidden /> Verified
      </Badge>
    );
  }
  if (status === "under_review") {
    return (
      <Badge variant="outline" className={cn("gap-1 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50", className)}>
        <Clock className="h-3 w-3" aria-hidden /> Under Review
      </Badge>
    );
  }
  if (status === "pending") {
    return (
      <Badge variant="outline" className={cn("gap-1 border-muted-foreground/20 text-muted-foreground", className)}>
        <AlertCircle className="h-3 w-3" aria-hidden /> Pending
      </Badge>
    );
  }
  if (status === "not_verified") {
    return (
      <Badge variant="outline" className={cn("gap-1 border-amber-300/80 bg-amber-50/40 text-amber-900", className)} aria-label="Unclaimed Listing">
        <AlertCircle className="h-3 w-3" aria-hidden /> Unclaimed Listing
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className={cn("gap-1 text-muted-foreground", className)}>
      <AlertCircle className="h-3 w-3" aria-hidden /> Unverified
    </Badge>
  );
}

export function StatusPill({ tone = "teal", children, className }: { tone?: "teal" | "emerald" | "amber" | "sky" | "violet" | "muted"; children: React.ReactNode; className?: string }) {
  const tones: Record<string, string> = {
    teal: "bg-teal-50 text-teal-700 border-teal-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    sky: "bg-sky-50 text-sky-700 border-sky-200",
    violet: "bg-violet-50 text-violet-700 border-violet-200",
    muted: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium", tones[tone], className)}>
      {children}
    </span>
  );
}

export function CheckItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <li className={cn("flex items-start gap-2 text-sm text-foreground/80", className)}>
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
      <span>{children}</span>
    </li>
  );
}
