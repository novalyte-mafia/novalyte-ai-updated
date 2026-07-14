import { cn } from "@/lib/utils";

/**
 * Novalyte AI — Star Light Logo
 *
 * Concept: "Nova" = new star, "Lyte" = light → a new light emerging.
 * A refined abstract star with a luminous core and radiating light paths.
 *
 * Variants:
 *  - default (light bg): deep navy symbol with teal luminous accent
 *  - dark: bright teal/white star on dark field with soft glow
 *  - mono: single-color monochrome
 *  - mark-only: symbol without wordmark
 */

export function Logo({
  className,
  showWord = true,
  variant = "default",
  size = "default",
}: {
  className?: string;
  showWord?: boolean;
  variant?: "default" | "dark" | "mono";
  size?: "sm" | "default" | "lg";
}) {
  const sizeMap = {
    sm: { box: "h-7 w-7", star: "h-4 w-4", text: "text-base" },
    default: { box: "h-9 w-9", star: "h-5 w-5", text: "text-lg" },
    lg: { box: "h-12 w-12", star: "h-7 w-7", text: "text-xl" },
  };
  const s = sizeMap[size];

  const symbol = variant === "dark" ? (
    // Dark background variant: glowing teal star
    <span className="relative inline-flex items-center justify-center">
      <span className="novalyte-logo-glow absolute inset-0 rounded-xl bg-teal-400/30 blur-md" aria-hidden />
      <span className={cn("relative inline-flex items-center justify-center rounded-xl bg-foreground", s.box)}>
        <svg viewBox="0 0 32 32" className={s.star} fill="none" aria-hidden="true">
          <defs>
            <radialGradient id="logo-core-dark" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#5eead4" />
              <stop offset="100%" stopColor="#14b8a6" />
            </radialGradient>
          </defs>
          {/* Radiating light paths (8 rays) */}
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
          {/* Luminous core star (4-point) */}
          <path
            d="M16 8 C16.5 12.5, 19.5 15.5, 24 16 C19.5 16.5, 16.5 19.5, 16 24 C15.5 19.5, 12.5 16.5, 8 16 C12.5 15.5, 15.5 12.5, 16 8 Z"
            fill="url(#logo-core-dark)"
          />
        </svg>
      </span>
    </span>
  ) : variant === "mono" ? (
    <span className={cn("relative inline-flex items-center justify-center rounded-xl bg-foreground", s.box)}>
      <svg viewBox="0 0 32 32" className={s.star} fill="none" aria-hidden="true">
        <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-background">
          <path d="M16 4 L16 9" />
          <path d="M16 23 L16 28" />
          <path d="M4 16 L9 16" />
          <path d="M23 16 L28 16" />
          <path d="M7.5 7.5 L11 11" opacity="0.6" />
          <path d="M21 21 L24.5 24.5" opacity="0.6" />
          <path d="M24.5 7.5 L21 11" opacity="0.6" />
          <path d="M11 21 L7.5 24.5" opacity="0.6" />
        </g>
        <path
          d="M16 8 C16.5 12.5, 19.5 15.5, 24 16 C19.5 16.5, 16.5 19.5, 16 24 C15.5 19.5, 12.5 16.5, 8 16 C12.5 15.5, 15.5 12.5, 16 8 Z"
          fill="currentColor"
          className="text-background"
        />
      </svg>
    </span>
  ) : (
    // Default light-background variant: deep navy + teal accent
    <span className={cn("relative inline-flex items-center justify-center rounded-xl bg-foreground", s.box)}>
      <svg viewBox="0 0 32 32" className={s.star} fill="none" aria-hidden="true">
        <defs>
          <radialGradient id="logo-core-light" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#5eead4" />
            <stop offset="100%" stopColor="#14b8a6" />
          </radialGradient>
        </defs>
        {/* Radiating light paths */}
        <g stroke="#0f2a3a" strokeWidth="1.5" strokeLinecap="round">
          <path d="M16 4 L16 9" />
          <path d="M16 23 L16 28" />
          <path d="M4 16 L9 16" />
          <path d="M23 16 L28 16" />
          <path d="M7.5 7.5 L11 11" opacity="0.5" />
          <path d="M21 21 L24.5 24.5" opacity="0.5" />
          <path d="M24.5 7.5 L21 11" opacity="0.5" />
          <path d="M11 21 L7.5 24.5" opacity="0.5" />
        </g>
        {/* Luminous core star */}
        <path
          d="M16 8 C16.5 12.5, 19.5 15.5, 24 16 C19.5 16.5, 16.5 19.5, 16 24 C15.5 19.5, 12.5 16.5, 8 16 C12.5 15.5, 15.5 12.5, 16 8 Z"
          fill="url(#logo-core-light)"
        />
      </svg>
    </span>
  );

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {symbol}
      {showWord && (
        <span className={cn("font-semibold tracking-tight whitespace-nowrap text-foreground", s.text)}>
          Novalyte<span className="text-teal-600"> AI</span>
        </span>
      )}
    </div>
  );
}

/** Symbol-only mark (for favicon, app icon, mobile mark) */
export function LogoMark({ className, variant = "default" }: { className?: string; variant?: "default" | "dark" | "mono" }) {
  return <Logo showWord={false} variant={variant} className={className} />;
}
