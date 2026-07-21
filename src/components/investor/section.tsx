import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  titleClassName,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  titleClassName?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-700">
          {eyebrow}
        </div>
      )}
      <h2
        className={cn(
          "font-[family-name:var(--font-investor-serif)] text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl",
          titleClassName,
        )}
      >
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}

export function Section({
  id,
  children,
  className,
  tone = "default",
  containerClassName,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  tone?: "default" | "muted" | "warm";
}) {
  const tones: Record<string, string> = {
    default: "bg-white",
    muted: "bg-stone-50/80",
    warm: "bg-gradient-to-b from-stone-50 to-white",
  };

  return (
    <section
      id={id}
      className={cn("scroll-mt-24 py-12 sm:py-16", tones[tone], className)}
    >
      <div
        className={cn(
          "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8",
          containerClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
}
