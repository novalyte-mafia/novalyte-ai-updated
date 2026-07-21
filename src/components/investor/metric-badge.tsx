import { cn } from "@/lib/utils";
import {
  METRIC_STATUS_LABELS,
  type MetricStatus,
} from "@/lib/investor/config";

const statusStyles: Record<MetricStatus, string> = {
  Actual: "border-emerald-200 bg-emerald-50 text-emerald-800",
  Estimated: "border-amber-200 bg-amber-50 text-amber-900",
  Projected: "border-sky-200 bg-sky-50 text-sky-900",
  Target: "border-violet-200 bg-violet-50 text-violet-900",
  "Under development": "border-orange-200 bg-orange-50 text-orange-900",
  Planned: "border-neutral-200 bg-neutral-100 text-neutral-700",
  "Founder-provided": "border-teal-200 bg-teal-50 text-teal-800",
  "Pending validation": "border-rose-200 bg-rose-50 text-rose-900",
};

export function MetricBadge({
  status,
  className,
}: {
  status: MetricStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium leading-none tracking-wide",
        statusStyles[status],
        className,
      )}
    >
      {METRIC_STATUS_LABELS[status]}
    </span>
  );
}
