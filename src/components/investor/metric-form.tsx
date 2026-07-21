"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const statuses = [
  "Actual",
  "Estimated",
  "Projected",
  "Target",
  "Under development",
  "Planned",
  "Founder-provided",
  "Pending validation",
];

export function MetricForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const res = await fetch("/api/investor/admin/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Failed.");
        setBusy(false);
        return;
      }
      form.reset();
      router.refresh();
    } catch {
      setError("Failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="key">Key * (unique)</Label>
          <Input id="key" name="key" required className="mt-1.5" placeholder="e.g. clinics_published" />
        </div>
        <div>
          <Label htmlFor="label">Label *</Label>
          <Input id="label" name="label" required className="mt-1.5" placeholder="Clinics published" />
        </div>
        <div>
          <Label htmlFor="valueText">Value (text)</Label>
          <Input id="valueText" name="valueText" className="mt-1.5" placeholder="e.g. 12 or $0" />
        </div>
        <div>
          <Label htmlFor="valueNumeric">Value (numeric, optional)</Label>
          <Input id="valueNumeric" name="valueNumeric" className="mt-1.5" inputMode="decimal" />
        </div>
        <div>
          <Label htmlFor="unit">Unit</Label>
          <Input id="unit" name="unit" className="mt-1.5" placeholder="clinics" />
        </div>
        <div>
          <Label htmlFor="periodLabel">Period</Label>
          <Input id="periodLabel" name="periodLabel" className="mt-1.5" placeholder="As of Jul 2026" />
        </div>
        <div>
          <Label htmlFor="source">Source</Label>
          <Input id="source" name="source" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="status">Status *</Label>
          <select
            id="status"
            name="status"
            defaultValue="Actual"
            className="mt-1.5 flex h-10 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="visibility">Visibility *</Label>
          <select
            id="visibility"
            name="visibility"
            defaultValue="approved_investors"
            className="mt-1.5 flex h-10 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            <option value="approved_investors">Approved investors</option>
            <option value="public">Public (gated)</option>
            <option value="internal">Internal</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>
      {error ? (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="mt-5 bg-teal-700 hover:bg-teal-800" disabled={busy}>
        {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Save metric
      </Button>
    </form>
  );
}
