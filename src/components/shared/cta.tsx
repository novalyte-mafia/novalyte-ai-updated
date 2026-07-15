"use client";

import { Button } from "@/components/ui/button";
import { navigate } from "@/lib/nav";
import { ArrowRight, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export function CTASection({
  title,
  description,
  primaryLabel,
  primaryView,
  secondaryLabel,
  secondaryView,
  onPrimary,
  tone = "dark",
}: {
  title: string;
  description: string;
  primaryLabel: string;
  primaryView?: Parameters<typeof navigate>[0];
  secondaryLabel?: string;
  secondaryView?: Parameters<typeof navigate>[0];
  onPrimary?: () => void;
  tone?: "dark" | "light";
}) {
  return (
    <section
      className={cn(
        "py-12 sm:py-16",
        tone === "dark" ? "bg-foreground text-background" : "bg-gradient-to-b from-teal-50/60 to-background",
      )}
    >
      <div className="mx-auto w-full max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className={cn("mx-auto max-w-3xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl", tone === "dark" ? "text-background" : "text-foreground")}>
          {title}
        </h2>
        <p className={cn("mx-auto mt-4 max-w-2xl text-pretty text-base sm:text-lg", tone === "dark" ? "text-background/70" : "text-muted-foreground")}>
          {description}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {onPrimary ? (
            <Button size="lg" className="bg-teal-600 text-white hover:bg-teal-700" onClick={onPrimary}>
              {primaryLabel} <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          ) : primaryView ? (
            <Button size="lg" className="bg-teal-600 text-white hover:bg-teal-700" onClick={() => navigate(primaryView)}>
              {primaryLabel} <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          ) : null}
          {secondaryLabel && secondaryView && (
            <Button
              size="lg"
              variant={tone === "dark" ? "outline" : "outline"}
              className={cn(tone === "dark" && "border-background/30 text-background hover:bg-background/10")}
              onClick={() => navigate(secondaryView)}
            >
              <MessageSquare className="mr-1 h-4 w-4" /> {secondaryLabel}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
