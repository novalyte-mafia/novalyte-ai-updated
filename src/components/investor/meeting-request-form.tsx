"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function MeetingRequestForm({
  defaultName,
  defaultEmail,
}: {
  defaultName?: string;
  defaultEmail?: string;
}) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus("submitting");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/investor/meeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Unable to submit. Please try again.");
        setStatus("idle");
        return;
      }
      setStatus("success");
      form.reset();
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("idle");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
        <h3 className="mt-4 text-lg font-semibold text-emerald-900">Request sent</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-emerald-800">
          Thank you. The founder will follow up to coordinate a time.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input id="name" name="name" required defaultValue={defaultName} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input id="email" name="email" type="email" required defaultValue={defaultEmail} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="firm">Firm</Label>
          <Input id="firm" name="firm" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="preferredDate">Preferred date / window</Label>
          <Input id="preferredDate" name="preferredDate" className="mt-1.5" placeholder="e.g. week of Aug 4" />
        </div>
        <div>
          <Label htmlFor="timezone">Timezone</Label>
          <Input id="timezone" name="timezone" className="mt-1.5" placeholder="e.g. PT" />
        </div>
        <div>
          <Label htmlFor="inquiryType">Type</Label>
          <select
            id="inquiryType"
            name="inquiryType"
            defaultValue="meeting"
            className="mt-1.5 flex h-10 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            <option value="meeting">Meeting</option>
            <option value="general">General</option>
            <option value="strategic_partnership">Strategic partnership</option>
            <option value="advisor">Advisor</option>
            <option value="press">Press</option>
          </select>
        </div>
      </div>
      <div className="mt-5">
        <Label htmlFor="message">Message *</Label>
        <Textarea id="message" name="message" required minLength={10} maxLength={4000} rows={4} className="mt-1.5" />
      </div>
      {error ? (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <Button
        type="submit"
        size="lg"
        className="mt-6 w-full bg-teal-700 hover:bg-teal-800 sm:w-auto"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending
          </>
        ) : (
          "Request meeting"
        )}
      </Button>
    </form>
  );
}
