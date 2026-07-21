import { cn } from "@/lib/utils";
import type { ProductModuleStatus } from "@/lib/investor/content";

const statusStyles: Record<ProductModuleStatus, string> = {
  Completed: "border-emerald-200 bg-emerald-50 text-emerald-800",
  "In progress": "border-teal-200 bg-teal-50 text-teal-800",
  Planned: "border-neutral-200 bg-neutral-100 text-neutral-700",
};

export function StatusPill({
  status,
  className,
}: {
  status: ProductModuleStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        statusStyles[status],
        className,
      )}
    >
      {status}
    </span>
  );
}
