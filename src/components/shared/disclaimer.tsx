import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

export function DisclaimerBanner({
  children,
  className,
  tone = "muted",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "muted" | "amber" | "teal";
}) {
  const tones: Record<string, string> = {
    muted: "border-border bg-muted/50 text-muted-foreground",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    teal: "border-teal-200 bg-teal-50 text-teal-800",
  };
  return (
    <div className={cn("flex items-start gap-2.5 rounded-xl border p-4 text-sm leading-relaxed", tones[tone], className)}>
      <Info className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

export function MedicalDisclaimer({ className }: { className?: string }) {
  return (
    <DisclaimerBanner tone="amber" className={className}>
      <strong className="font-semibold">Medical disclaimer.</strong> Novalyte AI is a technology
      platform and does not provide medical care, diagnosis, or treatment. Information presented
      here is for educational purposes. Always consult a licensed healthcare professional before
      making medical decisions.
    </DisclaimerBanner>
  );
}
