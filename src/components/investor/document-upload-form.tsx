"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function DocumentUploadForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const form = event.currentTarget;
    try {
      const res = await fetch("/api/investor/admin/documents", {
        method: "POST",
        body: new FormData(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Upload failed.");
        setBusy(false);
        return;
      }
      form.reset();
      router.refresh();
    } catch {
      setError("Upload failed.");
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
          <Label htmlFor="title">Title *</Label>
          <Input id="title" name="title" required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Input id="category" name="category" defaultValue="General" className="mt-1.5" />
        </div>
      </div>
      <div className="mt-4">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={2} className="mt-1.5" />
      </div>
      <div className="mt-4">
        <Label htmlFor="file">File * (PDF, Office, PNG, JPEG, CSV — max 25MB)</Label>
        <Input
          id="file"
          name="file"
          type="file"
          required
          accept=".pdf,.pptx,.xlsx,.docx,.png,.jpg,.jpeg,.csv"
          className="mt-1.5"
        />
      </div>
      {error ? (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <Button
        type="submit"
        className="mt-5 bg-teal-700 hover:bg-teal-800"
        disabled={busy}
      >
        {busy ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" /> Upload &amp; publish
          </>
        )}
      </Button>
    </form>
  );
}
