"use client";

import { useCompare } from "@/lib/nav";
import { Button } from "@/components/ui/button";
import { X, GitCompare, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Bottom-docked comparison tray. Shows when items are added to compare.
 * Renders children (the comparison table) when expanded.
 */
export function CompareTray({
  kind,
  items,
  onRemove,
  onClear,
  onCompare,
  children,
}: {
  kind: "clinic" | "product";
  items: { id: string; title: string; subtitle?: string }[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onCompare: () => void;
  children?: React.ReactNode;
}) {
  const { isOpen, setOpen } = useCompare();
  if (items.length === 0) return null;

  return (
    <>
      {/* Expanded comparison overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-foreground/30 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => setOpen(false)}>
          <div
            className="novalyte-scroll max-h-[85vh] w-full max-w-5xl overflow-y-auto rounded-t-2xl bg-card p-5 shadow-premium-xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <GitCompare className="h-5 w-5 text-teal-600" />
                Compare {kind === "clinic" ? "clinics" : "products"}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}><X className="h-4 w-4" /></Button>
            </div>
            {children}
          </div>
        </div>
      )}

      {/* Docked tray */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 px-4 py-3 shadow-premium-lg backdrop-blur-md sm:px-6">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3">
          <span className="hidden text-sm font-medium text-foreground sm:inline">
            Comparing {items.length} {kind === "clinic" ? "clinic" : "product"}{items.length > 1 ? "s" : ""}
          </span>
          <div className="novalyte-scroll flex flex-1 items-center gap-2 overflow-x-auto">
            {items.map((it) => (
              <span
                key={it.id}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium"
              >
                <span className="max-w-[140px] truncate">{it.title}</span>
                <button onClick={() => onRemove(it.id)} className="text-muted-foreground hover:text-rose-600" aria-label={`Remove ${it.title}`}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClear} className="text-muted-foreground">
              <Trash2 className="mr-1 h-3.5 w-3.5" /> Clear
            </Button>
            <Button size="sm" className="bg-teal-600 text-white hover:bg-teal-700" onClick={onCompare} disabled={items.length < 2}>
              <GitCompare className="mr-1 h-3.5 w-3.5" /> Compare ({items.length})
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
