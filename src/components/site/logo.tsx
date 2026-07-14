import { cn } from "@/lib/utils";

export function Logo({ className, showWord = true }: { className?: string; showWord?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-sm">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <path
            d="M12 3v18M5 7c2.5 1.5 4.5 1.5 7 0s4.5-1.5 7 0v10c-2.5-1.5-4.5-1.5-7 0s-4.5 1.5-7 0V7Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {showWord && (
        <span className="text-lg font-semibold tracking-tight text-foreground">
          Novalyte<span className="text-teal-600"> AI</span>
        </span>
      )}
    </div>
  );
}
