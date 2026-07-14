import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ShieldCheck, Clock, AlertCircle } from "lucide-react";

export function VerificationBadge({ verified, status, className }: { verified: boolean; status?: string; className?: string }) {
  if (verified || status === "verified") {
    return (
      <Badge className={cn("gap-1 border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-50", className)}>
        <ShieldCheck className="h-3 w-3" /> Verified
      </Badge>
    );
  }
  if (status === "under_review") {
    return (
      <Badge variant="outline" className={cn("gap-1 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50", className)}>
        <Clock className="h-3 w-3" /> Under Review
      </Badge>
    );
  }
  if (status === "pending") {
    return (
      <Badge variant="outline" className={cn("gap-1 border-muted-foreground/20 text-muted-foreground", className)}>
        <AlertCircle className="h-3 w-3" /> Pending
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className={cn("gap-1 text-muted-foreground", className)}>
      <AlertCircle className="h-3 w-3" /> Unverified
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
