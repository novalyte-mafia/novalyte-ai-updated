"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type TabItem = {
  id: string;
  label: string;
  icon?: React.ElementType;
};

/**
 * Sticky in-page tab navigation that tracks scroll position.
 * Used on long profile pages (clinic profile, product detail).
 */
export function StickyTabNav({
  tabs,
  active,
  onChange,
  rightSlot,
}: {
  tabs: TabItem[];
  active: string;
  onChange: (id: string) => void;
  rightSlot?: React.ReactNode;
}) {
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const handler = () => {
      const el = document.getElementById("sticky-tab-sentinel");
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setStuck(rect.top <= 0);
    };
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <div id="sticky-tab-sentinel" className="h-px w-full" aria-hidden />
      <div
        className={cn(
          "sticky top-16 z-30 -mx-4 border-y border-border bg-background/90 px-4 backdrop-blur-md transition-shadow sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8",
          stuck && "sticky-nav-shadow",
        )}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center gap-2">
          <div className="novalyte-scroll -mb-px flex flex-1 items-center gap-1 overflow-x-auto">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = active === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onChange(t.id)}
                  className={cn(
                    "relative flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-3 text-sm font-medium transition",
                    isActive
                      ? "border-teal-600 text-teal-700"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {Icon && <Icon className="h-3.5 w-3.5" />}
                  {t.label}
                </button>
              );
            })}
          </div>
          {rightSlot && <div className="shrink-0 pl-2">{rightSlot}</div>}
        </div>
      </div>
    </>
  );
}
