"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function usePublish() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(payload: Record<string, unknown>, form: HTMLFormElement) {
    setBusy(true);
    setError(null);
    setDone(false);
    try {
      const res = await fetch("/api/investor/admin/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Failed.");
        return;
      }
      form.reset();
      setDone(true);
      router.refresh();
    } catch {
      setError("Failed.");
    } finally {
      setBusy(false);
    }
  }

  return { busy, error, done, submit };
}

export function UpdateForm() {
  const { busy, error, done, submit } = usePublish();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const data = Object.fromEntries(new FormData(form).entries());
        submit({ type: "update", ...data }, form);
      }}
      className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
    >
      <h3 className="text-sm font-semibold text-stone-900">Post a founder update</h3>
      <div className="mt-4 space-y-4">
        <div>
          <Label htmlFor="u-title">Title *</Label>
          <Input id="u-title" name="title" required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="u-summary">Summary *</Label>
          <Input id="u-summary" name="summary" required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="u-body">Body</Label>
          <Textarea id="u-body" name="body" rows={4} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="u-visibility">Visibility</Label>
          <select
            id="u-visibility"
            name="visibility"
            defaultValue="approved_investors"
            className="mt-1.5 flex h-10 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            <option value="approved_investors">Approved investors</option>
            <option value="public">Public (gated)</option>
            <option value="draft">Draft</option>
            <option value="internal">Internal</option>
          </select>
        </div>
      </div>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      {done ? <p className="mt-3 text-sm text-emerald-700">Saved.</p> : null}
      <Button type="submit" className="mt-4 bg-teal-700 hover:bg-teal-800" disabled={busy}>
        {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Publish update
      </Button>
    </form>
  );
}

export function TermsForm({
  defaultVersion,
  defaultTitle,
  defaultBody,
}: {
  defaultVersion?: string;
  defaultTitle?: string;
  defaultBody?: string;
}) {
  const { busy, error, done, submit } = usePublish();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const data = Object.fromEntries(new FormData(form).entries());
        submit({ type: "terms", ...data }, form);
      }}
      className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
    >
      <h3 className="text-sm font-semibold text-stone-900">Publish access terms</h3>
      <div className="mt-4 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="t-version">Version *</Label>
            <Input id="t-version" name="version" required defaultValue={defaultVersion} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="t-title">Title *</Label>
            <Input id="t-title" name="title" required defaultValue={defaultTitle} className="mt-1.5" />
          </div>
        </div>
        <div>
          <Label htmlFor="t-body">Terms body (markdown) *</Label>
          <Textarea id="t-body" name="body" rows={6} required defaultValue={defaultBody} className="mt-1.5" />
        </div>
      </div>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      {done ? <p className="mt-3 text-sm text-emerald-700">Published.</p> : null}
      <Button type="submit" className="mt-4 bg-teal-700 hover:bg-teal-800" disabled={busy}>
        {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Publish terms
      </Button>
    </form>
  );
}
