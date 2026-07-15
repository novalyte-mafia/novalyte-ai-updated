import { cn } from "@/lib/utils";

/**
 * Novalyte AI — Star Light Logo
 *
 * Concept: "Nova" = new star, "Lyte" = light → a new light emerging.
 * A refined abstract star with a luminous core and radiating light paths,
 * styled on a bordered black background with a visible, smooth CSS pulsation.
 */

export function Logo({
  className,
  showWord = true,
  size = "default",
  animated = false,
}: {
  className?: string;
  showWord?: boolean;
  size?: "sm" | "default" | "lg";
  animated?: boolean;
}) {
  const sizeMap = {
    sm: { box: "h-8 w-8", star: "h-5 w-5", text: "text-base" },
    md: { box: "h-10 w-10", star: "h-6 w-6", text: "text-lg" },
    default: { box: "h-10 w-10", star: "h-6 w-6", text: "text-lg" },
    lg: { box: "h-14 w-14", star: "h-9 w-9", text: "text-xl" },
  };
  const s = sizeMap[size] || sizeMap.default;

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {/* Bordered black background container */}
      <span className={cn(
        "relative inline-flex items-center justify-center rounded-xl bg-black border border-neutral-800 shadow-md shadow-black/40 overflow-hidden",
        s.box
      )}>
        <svg viewBox="0 0 32 32" className={cn(s.star, animated && "novalyte-pulsating-star")} fill="none" aria-hidden="true">
          <defs>
            <radialGradient id="logo-core" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#5eead4" />
              <stop offset="100%" stopColor="#14b8a6" />
            </radialGradient>
          </defs>
          
          {/* Radiating light paths (8 rays representing Lyte/Light) */}
          <g stroke="#5eead4" strokeWidth="1.5" strokeLinecap="round" opacity="0.85">
            <path d="M16 4 L16 9" />
            <path d="M16 23 L16 28" />
            <path d="M4 16 L9 16" />
            <path d="M23 16 L28 16" />
            <path d="M7.5 7.5 L11 11" opacity="0.6" />
            <path d="M21 21 L24.5 24.5" opacity="0.6" />
            <path d="M24.5 7.5 L21 11" opacity="0.6" />
            <path d="M11 21 L7.5 24.5" opacity="0.6" />
          </g>
          
          {/* Outer subtle ring */}
          <circle cx="16" cy="16" r="13" stroke="#14b8a6" strokeWidth="0.5" opacity="0.25" fill="none" />
          
          {/* Luminous core star (4-point representing Nova/New) */}
          <path
            d="M16 8 C16.5 12.5, 19.5 15.5, 24 16 C19.5 16.5, 16.5 19.5, 16 24 C15.5 19.5, 12.5 16.5, 8 16 C12.5 15.5, 15.5 12.5, 16 8 Z"
            fill="url(#logo-core)"
          />
        </svg>
      </span>

      {showWord && (
        <span className={cn("font-semibold tracking-tight whitespace-nowrap text-foreground", s.text)}>
          Novalyte<span className="text-teal-600"> AI</span>
        </span>
      )}
    </div>
  );
}

/** Symbol-only mark (for favicon, app icon, mobile mark) */
export function LogoMark({ className }: { className?: string }) {
  return <Logo showWord={false} className={className} />;
}
