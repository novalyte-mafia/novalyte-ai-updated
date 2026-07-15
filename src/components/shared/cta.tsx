"use client";

import { cn } from "@/lib/utils";

export function CTASection({
  title,
  description,
  tone = "dark",
}: {
  title: string;
  description: string;
  tone?: "dark" | "light";
}) {
  return (
    <section
      className={cn(
        "py-8 sm:py-10",
        tone === "dark" ? "bg-foreground text-background" : "bg-gradient-to-b from-teal-50/60 to-background",
      )}
    >
      <div className="mx-auto w-full max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className={cn("mx-auto max-w-3xl text-balance text-2xl font-semibold tracking-tight sm:text-3xl", tone === "dark" ? "text-background" : "text-foreground")}>
          {title}
        </h2>
        <p className={cn("mx-auto mt-3 max-w-2xl text-pretty text-sm sm:text-base", tone === "dark" ? "text-background/70" : "text-muted-foreground")}>
          {description}
        </p>
      </div>
    </section>
  );
}
