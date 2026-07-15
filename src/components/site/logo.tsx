import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Novalyte AI logo using the canonical favicon artwork.
 */

export function Logo({
  className,
  showWord = true,
  size = "default",
  animated = false,
}: {
  className?: string;
  showWord?: boolean;
  size?: "sm" | "md" | "default" | "lg";
  animated?: boolean;
}) {
  const sizeMap = {
    sm: { box: "h-8 w-8", text: "text-base" },
    md: { box: "h-10 w-10", text: "text-lg" },
    default: { box: "h-10 w-10", text: "text-lg" },
    lg: { box: "h-14 w-14", text: "text-xl" },
  };
  const s = sizeMap[size] || sizeMap.default;

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className={cn("relative inline-flex shrink-0 overflow-hidden rounded-xl shadow-md shadow-black/30", s.box)}>
        <Image
          src="/favicon.svg"
          alt=""
          width={56}
          height={56}
          unoptimized
          aria-hidden="true"
          className={cn("h-full w-full", animated && "novalyte-pulsating-star")}
        />
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
